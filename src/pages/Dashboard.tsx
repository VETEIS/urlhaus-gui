import React, { useMemo, useState } from 'react';
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Container,
    AppBar,
    Toolbar,
	MenuItem,
	Paper,
	TextField,
	InputAdornment,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	TableSortLabel,
	Tooltip,
	TablePagination,
    Stack,
    Skeleton,
} from '@mui/material';
import { 
	SaveAlt as SaveAltIcon, 
	CloudDone as CloudDoneIcon, 
	CloudOff as CloudOffIcon, 
	OpenInNew as OpenInNewIcon, 
	Search as SearchIcon,
	Warning as WarningIcon,
	Security as SecurityIcon,
	BugReport as BugReportIcon,
	Phishing as PhishingIcon,
	Refresh as RefreshIcon,
	Schedule as ScheduleIcon,
	Facebook as FacebookIcon,
	Logout as LogoutIcon,
	Close as CloseIcon,
} from '@mui/icons-material';
import { exportCsv, exportJson } from '../utils/export';
import { createApiClient } from '../api/client';
import type { RecentUrlItem } from '../api/client';
import { useAuth } from '../context/AuthContext';
import UrlDetailDialog from '../components/UrlDetailDialog';

type SortKey = 'date_added' | 'url_status';

const Dashboard: React.FC = () => {
	const { authKey, logout } = useAuth();
	const [loading, setLoading] = useState(false);
	const [loadingContext, setLoadingContext] = useState<string>('');
	const [error, setError] = useState<string | null>(null);
	const [errors, setErrors] = useState<Array<{ id: string; message: string }>>([]);
	const [rows, setRows] = useState<RecentUrlItem[]>([]);

	// Error notification management
	const addError = (message: string) => {
		const id = Date.now().toString();
		setErrors(prev => [...prev, { id, message }]);
		// Auto-remove after 8 seconds
		setTimeout(() => {
			removeError(id);
		}, 8000);
	};

	const removeError = (id: string) => {
		setErrors(prev => prev.filter(error => error.id !== id));
	};
	const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
	const [sortKey, setSortKey] = useState<SortKey>('date_added');
	const [sortAsc, setSortAsc] = useState<boolean>(false);
	const [query, setQuery] = useState('');
	const [mode, setMode] = useState<'url' | 'hostip'>('url');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
	const [refreshCountdown, setRefreshCountdown] = useState<number>(0);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [newEntries, setNewEntries] = useState<Set<string>>(new Set());
	const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

	const sortedRows = useMemo(() => {
		const copy = [...rows];
		copy.sort((a, b) => {
			const aVal = (sortKey === 'date_added') ? (a.date_added ?? '') : (a.url_status ?? '');
			const bVal = (sortKey === 'date_added') ? (b.date_added ?? '') : (b.url_status ?? '');
			if (aVal < bVal) return sortAsc ? -1 : 1;
			if (aVal > bVal) return sortAsc ? 1 : -1;
			return 0;
		});
		return copy;
	}, [rows, sortKey, sortAsc]);

	const pagedRows = useMemo(() => {
		const start = page * rowsPerPage;
		return sortedRows.slice(start, start + rowsPerPage);
	}, [sortedRows, page, rowsPerPage]);

	const handleSort = (key: SortKey) => {
		if (key === sortKey) setSortAsc((s) => !s);
		else {
			setSortKey(key);
			setSortAsc(false);
		}
	};

	const detectSearchMode = (raw: string): 'url' | 'hostip' => {
		const q = raw.trim();
		if (!q) return 'url';
		const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(q);
		const hasSlash = q.includes('/') || q.includes('?') || q.includes('#');
		if (hasScheme || hasSlash) return 'url';
		const isIPv4 = /^\d{1,3}(?:\.[\d]{1,3}){3}$/.test(q) && q.split('.').every((p) => Number(p) >= 0 && Number(p) <= 255);
		if (isIPv4) return 'hostip';
		const isHostname = /^(?=.{1,253}$)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/.test(q);
		if (isHostname) return 'hostip';
		return 'url';
	};

	const getThreatIcon = (threat: string | undefined) => {
		if (!threat) return null;
		const lowerThreat = threat.toLowerCase();
		if (lowerThreat.includes('malware') || lowerThreat.includes('virus')) return <BugReportIcon fontSize="small" />;
		if (lowerThreat.includes('phishing')) return <PhishingIcon fontSize="small" />;
		if (lowerThreat.includes('spam')) return <WarningIcon fontSize="small" />;
		return <SecurityIcon fontSize="small" />;
	};

	const getThreatColor = (threat: string | undefined) => {
		if (!threat) return 'default';
		const lowerThreat = threat.toLowerCase();
		if (lowerThreat.includes('malware') || lowerThreat.includes('virus')) return 'error';
		if (lowerThreat.includes('phishing')) return 'warning';
		if (lowerThreat.includes('spam')) return 'info';
		return 'primary';
	};

	const getStatusIcon = (status: string | undefined) => {
		switch (status) {
			case 'online':
				return <CloudDoneIcon color="error" fontSize="small" />;
			case 'offline':
				return <CloudOffIcon color="success" fontSize="small" />;
			default:
				return <CloudOffIcon color="action" fontSize="small" />;
		}
	};

	const getStatusColor = (status: string | undefined) => {
		switch (status) {
			case 'online':
				return 'error';
			case 'offline':
				return 'success';
			default:
				return 'default';
		}
	};

	const ConditionalTooltip = ({ content, children, placement = "top" }: { content: string; children: React.ReactElement; placement?: "top" | "bottom" | "left" | "right" }) => {
		const [isOverflowing, setIsOverflowing] = React.useState(false);
		const textRef = React.useRef<HTMLElement>(null);

		React.useEffect(() => {
			const element = textRef.current;
			if (element) {
				setIsOverflowing(element.scrollWidth > element.clientWidth);
			}
		}, [content]);

		const childWithRef = React.cloneElement(children as any, { 
			ref: textRef,
			sx: { ...(children.props as any)?.sx, cursor: isOverflowing ? 'help' : 'default' }
		});

		if (isOverflowing) {
			return (
				<Tooltip title={content} placement={placement}>
					{childWithRef}
				</Tooltip>
			);
		}

		return childWithRef;
	};

	const initializeAudioContext = () => {
		if (!audioContext) {
			try {
				const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
				setAudioContext(ctx);
				return ctx;
			} catch (error) {
				return null;
			}
		}
		return audioContext;
	};

	const playNotificationSound = () => {
		if (!audioContext) {
			return;
		}

		try {
			if (audioContext.state === 'suspended') {
				audioContext.resume().then(() => {
					playSound(audioContext);
				}).catch(() => {
				});
			} else {
				playSound(audioContext);
			}
		} catch (error) {
		}
	};

	const playSound = (ctx: AudioContext) => {
		const oscillator = ctx.createOscillator();
		const gainNode = ctx.createGain();
		
		oscillator.connect(gainNode);
		gainNode.connect(ctx.destination);
		
		oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
		oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
		oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
		
		gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
		
		oscillator.start(ctx.currentTime);
		oscillator.stop(ctx.currentTime + 0.3);
	};

	const loadRecent = async () => {
		setIsRefreshing(true);
		setLoading(true);
		setLoadingContext('Loading recent URLs from URLhaus database...');
		setError(null);
		
		try {
			const api = createApiClient(authKey);
			const { data } = await api.get('/api/v1/urls/recent/limit/20/');
			const list: RecentUrlItem[] = data?.urls ?? data ?? [];
			
			setNewEntries(new Set());
			localStorage.removeItem('urlhaus_new_entries');
			
			if (rows.length > 0) {
				const currentUrls = new Set(rows.map(r => r.url));
				const newUrls = list.filter(item => !currentUrls.has(item.url));
				
				if (newUrls.length > 0) {
					const newUrlSet = new Set(newUrls.map(item => item.url));
					setNewEntries(newUrlSet);
					
					localStorage.setItem('urlhaus_new_entries', JSON.stringify([...newUrlSet]));

					playNotificationSound();
				}
			}
			
			setRows(list);
			setPage(0);
			const updateTime = new Date();
			setLastUpdate(updateTime);
			localStorage.setItem('urlhaus_data', JSON.stringify(list));
			localStorage.setItem('urlhaus_last_update', updateTime.toISOString());
			localStorage.setItem('urlhaus_timer_start', Date.now().toString());
			
			setRefreshCountdown(300); // 5mins
		} catch (e: any) {
			let msg = 'Failed to load';
			if (e?.code === 'ECONNABORTED') {
				msg = 'Request timed out. The URLhaus API might be slow or unavailable. Please try again.';
			} else if (e?.response?.data?.message) {
				msg = e.response.data.message;
			} else if (e?.message) {
				msg = e.message;
			}
			setError(msg);
			addError(msg);
			
			// ERROR: retry
			setIsRefreshing(false);
		} finally {
			setIsRefreshing(false);
			setLoading(false);
			setLoadingContext('');
		}
	};

	React.useEffect(() => {
		if (refreshCountdown <= 0) return;

		const interval = setInterval(() => {
			setRefreshCountdown(prev => {
				if (prev <= 1) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [refreshCountdown]);

	React.useEffect(() => {
		// Restore data
		const savedData = localStorage.getItem('urlhaus_data');
		if (savedData) {
			try {
				const parsedData = JSON.parse(savedData);
				setRows(parsedData);
			} catch (e) {
				console.warn('Failed to parse saved data:', e);
			}
		}

		const savedLastUpdate = localStorage.getItem('urlhaus_last_update');
		if (savedLastUpdate) {
			try {
				setLastUpdate(new Date(savedLastUpdate));
			} catch (e) {
				console.warn('Failed to parse saved last update time:', e);
			}
		}

		const savedTimerStart = localStorage.getItem('urlhaus_timer_start');
		if (savedTimerStart) {
			try {
				const timerStartTime = parseInt(savedTimerStart);
				const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
				const remaining = Math.max(0, 300 - elapsed); // 5mins
				setRefreshCountdown(remaining);
			} catch (e) {
				console.warn('Failed to parse saved timer start time:', e);
			}
		}

		const savedNewEntries = localStorage.getItem('urlhaus_new_entries');
		if (savedNewEntries) {
			try {
				const parsedNewEntries = JSON.parse(savedNewEntries);
				setNewEntries(new Set(parsedNewEntries));
			} catch (e) {
				console.warn('Failed to parse saved new entries:', e);
			}
		}
	}, []);

	const handleManualRefresh = async () => {
		if (refreshCountdown > 0) {
			const minutes = Math.floor(refreshCountdown / 60);
			const seconds = refreshCountdown % 60;
			alert(`Please wait ${minutes}:${seconds.toString().padStart(2, '0')} before refreshing again to avoid being blocked.`);
			return;
		}

		await loadRecent();
	};

	const handleExportCsv = () => {
		exportCsv('urlhaus.csv', rows);
	};

	const handleExportJson = () => {
		exportJson('urlhaus.json', rows);
	};

	const handleSearch = async () => {
		if (!query.trim()) return;
		const nextMode = detectSearchMode(query);
		if (nextMode !== mode) setMode(nextMode);
		
		setLoading(true);
		setLoadingContext(nextMode === 'url' ? `Analyzing URL: ${query.trim()}` : `Searching for URLs from host: ${query.trim()}`);
		setError(null);
		try {
			const api = createApiClient(authKey);
			if (nextMode === 'url') {
				const body = new URLSearchParams();
				body.set('url', query.trim());
				const { data } = await api.post('/api/v1/url/', body, {
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				});
				const item: RecentUrlItem = {
					url: data?.url ?? query.trim(),
					host: data?.host,
					url_status: data?.url_status,
					date_added: data?.date_added,
					threat: data?.threat,
					tags: data?.tags,
					urlhaus_reference: data?.urlhaus_reference,
				};
				setRows([item]);
			} else {
				const body = new URLSearchParams();
				body.set('host', query.trim());
				const { data } = await api.post('/api/v1/host/', body, {
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				});
				const list: RecentUrlItem[] = (data?.urls ?? []).map((u: RecentUrlItem) => ({
					...u,
					host: u.host ?? query.trim(),
				}));
				setRows(list);
			}
			setPage(0);
			setLastUpdate(new Date());
		} catch (e: any) {
			let msg = 'Search failed';
			if (e?.code === 'ECONNABORTED') {
				msg = 'Search timed out. The URLhaus API might be slow or unavailable. Please try again.';
			} else if (e?.response?.data?.message) {
				msg = e.response.data.message;
			} else if (e?.message) {
				msg = e.message;
			}
			setError(msg);
			addError(msg);
		} finally {
			setLoading(false);
			setLoadingContext('');
		}
	};

	const skeletonRows = Array.from({ length: rowsPerPage }, (_, index) => (
		<TableRow key={`skeleton-${index}`}>
			<TableCell>
				<Skeleton variant="text" width="80%" height={20} />
			</TableCell>
			<TableCell>
				<Skeleton variant="text" width="60%" height={20} />
			</TableCell>
			<TableCell>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Skeleton variant="circular" width={16} height={16} />
					<Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
				</Box>
			</TableCell>
			<TableCell>
				<Skeleton variant="text" width="70%" height={20} />
			</TableCell>
			<TableCell>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
						<Skeleton variant="circular" width={16} height={16} />
						<Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} />
					</Box>
					<Box sx={{ display: 'flex', gap: 0.5 }}>
						<Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
						<Skeleton variant="rectangular" width={50} height={20} sx={{ borderRadius: 1 }} />
					</Box>
				</Box>
			</TableCell>
			<TableCell align="right">
				<Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: 1 }} />
			</TableCell>
		</TableRow>
	));

	return (
		<>
		<AppBar position="sticky" color="default" elevation={1} sx={{
			background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			color: 'white',
			'& .MuiTypography-root': { color: 'white' },
			'& .MuiIconButton-root': { color: 'text.primary' },
			'& .MuiTextField-root .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.8)' },
			'& .MuiTextField-root .MuiOutlinedInput-root': { 
				color: 'white',
				backgroundColor: 'rgba(255, 255, 255, 0.1)',
				backdropFilter: 'blur(10px)',
				'& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
				'&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
				'&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.6)' }
			},
			'& .MuiButton-root': {
				color: 'white',
				backgroundColor: 'rgba(255, 255, 255, 0.1)',
				backdropFilter: 'blur(10px)',
				borderColor: 'rgba(255, 255, 255, 0.2)',
				'&:hover': {
					backgroundColor: 'rgba(255, 255, 255, 0.2)',
					borderColor: 'rgba(255, 255, 255, 0.4)'
				}
			}
		}}>
			<Toolbar sx={{ 
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: '64px',
				width: '100vw',
				position: 'relative'
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', '&:hover': { opacity: 0.8 }, position: 'absolute', left: '20px' }} onClick={() => { 
					initializeAudioContext();
					setRows([]); 
					setPage(0); 
					setQuery(''); 
				}}>
					<SecurityIcon sx={{ color: 'white' }} />
					<Typography variant="h6">URLhaus</Typography>
				</Box>
				
				<Box sx={{ 
					display: 'flex', 
					alignItems: 'center', 
					gap: 3
				}}>
				<TextField
					label={mode === 'url' ? 'Search by URL' : 'Search by Host or IP'}
					value={query}
					onChange={(e) => setQuery(e.target.value)}
						onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
						size="small"
						sx={{ 
							width: '320px',
							minWidth: '320px',
							maxWidth: '320px',
							'& .MuiOutlinedInput-root': {
								height: '32px',
								padding: '0px 4px',
								borderRadius: '16px'
							},
							'& .MuiInputLabel-root': {
								top: '-4px',
								'&.MuiInputLabel-shrink': {
									top: '0px'
								}
							}
						}}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										aria-label="search"
					size="small"
										onClick={() => {
											initializeAudioContext();
											handleSearch();
										}}
										disabled={loading || !query.trim()}
									>
										<SearchIcon />
									</IconButton>
								</InputAdornment>
							),
						}}
				/>
				<TextField
					select
					label="Mode"
					size="small"
					value={mode}
					onChange={(e) => setMode(e.target.value as any)}
						sx={{ 
							width: '120px',
							minWidth: '120px',
							maxWidth: '120px',
							'& .MuiOutlinedInput-root': {
								height: '32px',
								padding: '0px 4px',
								borderRadius: '16px'
							},
							'& .MuiInputLabel-root': {
								top: '-8px',
								'&.MuiInputLabel-shrink': {
									top: '0px'
								}
							}
						}}
				>
					<MenuItem value="url">URL</MenuItem>
					<MenuItem value="hostip">Host / IP</MenuItem>
				</TextField>
									<TextField
						select
						label="Export"
					size="small"
						value=""
						onChange={(e) => {
							if (e.target.value === 'csv') {
								handleExportCsv();
							} else if (e.target.value === 'json') {
								handleExportJson();
							}
						}}
					disabled={rows.length === 0}
						sx={{ 
							width: '120px',
							minWidth: '120px',
							maxWidth: '120px',
							'& .MuiOutlinedInput-root': {
								height: '32px',
								padding: '0px 4px',
								borderRadius: '16px'
							},
							'& .MuiInputLabel-root': {
								top: '-4px',
								'&.MuiInputLabel-shrink': {
									top: '0px'
								}
							}
						}}
					>
						<MenuItem value="csv">Export CSV</MenuItem>
						<MenuItem value="json">Export JSON</MenuItem>
					</TextField>
				</Box>
				
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'absolute', right: '20px' }}>
					{/* Manual Refresh Button */}
					<Tooltip 
						title={
							isRefreshing 
								? 'Fetching data...' 
								: refreshCountdown > 0 
									? `Next refresh in ${Math.floor(refreshCountdown / 60)}:${(refreshCountdown % 60).toString().padStart(2, '0')}` 
									: 'Refresh data'
						}
						arrow
					>
						<span>
							<IconButton 
								size="small" 
								onClick={() => {
									initializeAudioContext();
									handleManualRefresh();
								}}
								color="primary"
								disabled={isRefreshing || refreshCountdown > 0}
								sx={{
									position: 'relative',
									overflow: 'hidden',
									'&:hover:not(:disabled)': {
										backgroundColor: 'primary.main',
										color: 'white'
									},
									'&:disabled': {
										color: 'rgba(255, 255, 255, 0.3)',
										backgroundColor: 'rgba(255, 255, 255, 0.05)'
									}
								}}
							>
								<RefreshIcon 
									sx={{ 
										color: isRefreshing || refreshCountdown > 0 ? 'rgba(255, 255, 255, 0.3)' : 'white',
										animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
										'@keyframes spin': {
											'0%': { transform: 'rotate(0deg)' },
											'100%': { transform: 'rotate(360deg)' }
										}
									}} 
								/>
							</IconButton>
						</span>
					</Tooltip>
					
					<Tooltip 
						title={
							<Box>
								<Typography variant="body2">
									{lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'No data loaded yet'}
								</Typography>
								{refreshCountdown > 0 && (
									<Typography variant="body2">
										Next refresh in: {Math.floor(refreshCountdown / 60)}:{(refreshCountdown % 60).toString().padStart(2, '0')}
									</Typography>
								)}
							</Box>
						}
						arrow
					>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								position: 'relative',
								pl: 1.5,
								pr: 2,
								py: 0.5,
								height: '32px',
								width: '130px',
								minWidth: '130px',
								maxWidth: '130px',
								borderRadius: '16px',
								backgroundColor: refreshCountdown > 0 ? 'rgba(255, 152, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',
								border: refreshCountdown > 0 ? '1px solid rgba(255, 152, 0, 0.2)' : '1px solid rgba(0, 0, 0, 0.08)',
								cursor: 'pointer',
								transition: 'all 0.2s ease-in-out',
								'&:hover': {
									backgroundColor: refreshCountdown > 0 ? 'rgba(255, 152, 0, 0.12)' : 'rgba(0, 0, 0, 0.06)',
									transform: 'translateY(-1px)',
									boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
								}
							}}
						>
							<ScheduleIcon 
								fontSize="small" 
								sx={{ 
									color: isRefreshing ? 'white' : refreshCountdown > 0 ? 'warning.main' : 'white'
								}} 
							/>
							<Typography 
								variant="caption" 
								sx={{ 
									fontSize: '0.75rem',
									fontWeight: refreshCountdown > 0 ? 600 : 400,
									whiteSpace: 'nowrap',
									color: isRefreshing ? 'white' : refreshCountdown > 0 ? 'warning.main' : 'text.primary',
									marginLeft: 'auto'
								}}
							>
								{refreshCountdown > 0 
									? `${Math.floor(refreshCountdown / 60)}:${(refreshCountdown % 60).toString().padStart(2, '0')}`
									: (lastUpdate ? lastUpdate.toLocaleTimeString() : 'Ready')
								}
							</Typography>
						</Box>
					</Tooltip>
					
				<Button
					variant="outlined"
					size="small"
						startIcon={<LogoutIcon />}
						onClick={() => {

							if (window.confirm('This button will clear all data and return to the authgate screen. Are you sure you want to deauthenticate?')) {
								logout();
							}
						}}
						sx={{
							color: 'white',
							backgroundColor: 'rgba(255, 255, 255, 0.1)',
							backdropFilter: 'blur(10px)',
							borderColor: 'rgba(255, 255, 255, 0.2)',
							height: '32px',
							borderRadius: '16px',
							minWidth: 'auto',
							pl: 2,
							pr: 0.5,
							'&:hover': {
								backgroundColor: 'rgba(255, 255, 255, 0.2)',
								color: 'white',
								borderColor: 'rgba(255, 255, 255, 0.4)',
								transform: 'translateY(-1px)',
								boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
							},
							transition: 'all 0.2s ease-in-out'
						}}
						title="DeAuth and clear all data"
					>
				</Button>
				</Box>
			</Toolbar>
		</AppBar>

		<Container maxWidth={false} sx={{ py: 3, px: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, position: 'relative' }}>

			{/* Error Notifications - Stacked */}
			<Box sx={{
				position: 'fixed',
				top: '80px',
				right: '20px',
				zIndex: 1000,
				display: 'flex',
				flexDirection: 'column',
				gap: 1,
				maxWidth: '350px'
			}}>
				{errors.map((error, index) => (
					<Box
						key={error.id}
						sx={{
							backgroundColor: 'error.main',
							color: 'white',
							padding: '8px 12px',
							borderRadius: '20px',
							boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: 1,
							animation: 'fadeInSlide 0.3s ease-out',
							transform: `translateY(${index * 4}px)`,
							'@keyframes fadeInSlide': {
								'0%': { 
									transform: 'translateX(100%) translateY(0)',
									opacity: 0 
								},
								'100%': { 
									transform: 'translateX(0) translateY(0)',
									opacity: 1 
								}
							}
						}}
					>
						<Typography 
							variant="caption" 
							sx={{ 
								color: 'white', 
								fontWeight: 500,
								fontSize: '0.75rem',
								flex: 1,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap'
							}}
						>
							{error.message}
						</Typography>
						<IconButton
							size="small"
							onClick={() => removeError(error.id)}
							sx={{ 
								color: 'white', 
								padding: '2px',
								'&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
							}}
						>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Box>
				))}
			</Box>

			<Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
				<TableContainer component={Paper} sx={{ 
					flex: 1, 
					overflow: 'auto', 
					borderRadius: 2, 
					position: 'relative',
					'&::-webkit-scrollbar': {
						width: '12px',
						height: '12px'
					},
					'&::-webkit-scrollbar-track': {
						background: '#f1f1f1',
						borderRadius: '6px'
					},
					'&::-webkit-scrollbar-thumb': {
						background: '#c1c1c1',
						borderRadius: '6px',
						'&:hover': {
							background: '#a8a8a8'
						}
					},
					'&::-webkit-scrollbar-corner': {
						background: '#f1f1f1'
					}
				}}>
					<Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
						<TableHead>
							<TableRow sx={{ 
								backgroundColor: '#f5f5f5 !important',
								borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
								'& .MuiTableCell-root': {
									backgroundColor: '#f5f5f5 !important',
									borderBottom: '1px solid rgba(0, 0, 0, 0.12) !important'
								},
								'&:hover': {
									backgroundColor: '#f5f5f5 !important'
								}
							}}>
								<TableCell sx={{ 
									width: '45%', 
									minWidth: '45%', 
									maxWidth: '45%',
									fontWeight: 600,
									color: 'text.primary'
								}}>URL</TableCell>
								<TableCell sx={{ 
									width: '20%', 
									minWidth: '20%', 
									maxWidth: '20%',
									fontWeight: 600,
									color: 'text.primary'
								}}>Host</TableCell>
								<TableCell sortDirection={sortKey === 'url_status' ? (sortAsc ? 'asc' : 'desc') : false} sx={{ 
									width: '20%', 
									minWidth: '20%', 
									maxWidth: '20%',
									fontWeight: 600,
									color: 'text.primary'
								}}>
									<TableSortLabel
										active={sortKey === 'url_status'}
										direction={sortAsc ? 'asc' : 'desc'}
										onClick={() => handleSort('url_status')}
										sx={{ color: 'text.primary', fontWeight: 600 }}
									>
										Status
									</TableSortLabel>
								</TableCell>
								<TableCell sortDirection={sortKey === 'date_added' ? (sortAsc ? 'asc' : 'desc') : false} sx={{ 
									width: '20%', 
									minWidth: '20%', 
									maxWidth: '20%',
									fontWeight: 600,
									color: 'text.primary'
								}}>
									<TableSortLabel
										active={sortKey === 'date_added'}
										direction={sortAsc ? 'asc' : 'desc'}
										onClick={() => handleSort('date_added')}
										sx={{ color: 'text.primary', fontWeight: 600 }}
									>
										Date Added
									</TableSortLabel>
								</TableCell>
								<TableCell sx={{ 
									width: '15%', 
									minWidth: '15%', 
									maxWidth: '15%',
									fontWeight: 600,
									color: 'text.primary'
								}}>Threat/Tags</TableCell>
								<TableCell align="right" sx={{ 
									width: '10%', 
									minWidth: '10%', 
									maxWidth: '10%',
									fontWeight: 600,
									color: 'text.primary'
								}}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody sx={{ position: 'relative' }}>
							{loading && (
								<Box sx={{ 
									position: 'absolute', 
									top: 0, 
									left: 0, 
									right: 0, 
									bottom: 0, 
									bgcolor: 'rgba(255, 255, 255, 0.9)', 
									backdropFilter: 'blur(2px)',
									zIndex: 10,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									gap: 2
								}}>
									<CircularProgress size={40} />
									<Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
										{loadingContext}
									</Typography>
								</Box>
							)}
							{loading ? skeletonRows : pagedRows.map((r) => (
								<TableRow 
									key={r.url} 
									hover
									sx={{
										transition: 'all 0.3s ease-out',
										position: 'relative',
										...(newEntries.has(r.url) && {
											animation: 'slideInAndHighlight 2s ease-out',
											'@keyframes slideInAndHighlight': {
												'0%': { 
													transform: 'translateY(-30px) scale(0.95)',
													opacity: 0.7
												},
												'20%': { 
													transform: 'translateY(-10px) scale(1.02)',
													opacity: 0.9
												},
												'40%': { 
													transform: 'translateY(0) scale(1)',
													opacity: 1
												},
												'100%': { 
													transform: 'translateY(0) scale(1)',
													opacity: 1
												}
											}
										})
									}}
								>
									<TableCell sx={{ 
										overflow: 'hidden', 
										textOverflow: 'ellipsis', 
										whiteSpace: 'nowrap',
										pr: 1,
										position: 'relative',
										...(newEntries.has(r.url) && {
											'&::before': {
												content: '""',
												position: 'absolute',
												left: 0,
												top: 0,
												bottom: 0,
												width: '4px',
												backgroundColor: 'primary.main',
												zIndex: 1
											}
										})
									}}>
										<ConditionalTooltip content={r.url} placement="top">
											<Typography sx={{ 
												fontFamily: 'monospace', 
												fontSize: '0.875rem'
											}}>
												{r.url}
											</Typography>
										</ConditionalTooltip>
									</TableCell>
									<TableCell sx={{ 
										overflow: 'hidden', 
										textOverflow: 'ellipsis', 
										whiteSpace: 'nowrap',
										pr: 1
									}}>
										<ConditionalTooltip content={r.host ?? '-'} placement="top">
											<Typography sx={{ 
												fontFamily: 'monospace', 
												fontSize: '0.875rem'
											}}>
												{r.host ?? '-'}
											</Typography>
										</ConditionalTooltip>
									</TableCell>
									<TableCell sx={{ pr: 1 }}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											{getStatusIcon(r.url_status)}
										<Tooltip title={r.url_status ?? 'unknown'}>
											<Chip
												size="small"
												label={r.url_status ?? 'unknown'}
													color={getStatusColor(r.url_status)}
													sx={{ maxWidth: '100%' }}
											/>
										</Tooltip>
										</Box>
									</TableCell>
									<TableCell sx={{ 
										overflow: 'hidden', 
										textOverflow: 'ellipsis', 
										whiteSpace: 'nowrap',
										pr: 1
									}}>
										<ConditionalTooltip content={r.date_added ?? '-'} placement="top">
											<Typography sx={{ fontSize: '0.875rem' }}>
												{r.date_added ?? '-'}
											</Typography>
										</ConditionalTooltip>
									</TableCell>
									<TableCell sx={{ pr: 1 }}>
										<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxWidth: '100%' }}>
											{r.threat && (
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
													{getThreatIcon(r.threat)}
													<ConditionalTooltip content={r.threat} placement="top">
														<Chip 
															label={r.threat} 
															size="small" 
															variant="outlined" 
															color={getThreatColor(r.threat)}
															sx={{ fontSize: '0.75rem', height: '20px' }}
														/>
													</ConditionalTooltip>
												</Box>
											)}
											{r.tags && r.tags.length > 0 && (
												<Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
													{r.tags.slice(0, 2).map((t) => (
														<ConditionalTooltip key={t} content={t} placement="top">
															<Chip 
																label={t} 
																size="small" 
																variant="outlined" 
																sx={{ fontSize: '0.75rem', height: '20px' }}
															/>
														</ConditionalTooltip>
													))}
													{r.tags.length > 2 && (
														<Chip 
															label={`+${r.tags.length - 2}`} 
															size="small" 
															variant="outlined" 
															sx={{ fontSize: '0.75rem', height: '20px' }}
														/>
													)}
												</Box>
											)}
										</Box>
									</TableCell>
									<TableCell align="right" onClick={(e) => e.stopPropagation()} sx={{ pr: 1 }}>
										<Button 
											size="small" 
											onClick={() => setSelectedUrl(r.url)}
											startIcon={<OpenInNewIcon />}
											sx={{ fontSize: '0.75rem', px: 1 }}
										>
											Open
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{pagedRows.length === 0 && !loading && (
						<Box sx={{ position: 'absolute', inset: 0, top: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
							<Stack spacing={2} alignItems="center" sx={{ color: 'text.secondary', maxWidth: 520 }}>
								<svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
									<path d="M11 17H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M7 7h6M7 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
									<circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="1.5"/>
									<path d="M20 20l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
								</svg>
								<Typography variant="h6" color="primary.main">Click refresh to get started</Typography>
								<Typography variant="body2" align="center">
									Click the refresh button above to load recent malicious URLs from the URLhaus database, or use the search field to analyze specific URLs or hosts.
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
									<SearchIcon sx={{ color: 'text.primary', fontSize: 20 }} />
									<Typography variant="caption" color="text.primary" sx={{ fontWeight: 500 }}>
										Ready to fetch data?
									</Typography>
								</Box>
							</Stack>
						</Box>
					)}
					<Box sx={{ 
						position: 'sticky', 
						bottom: 0, 
						left: 0, 
						right: 0, 
						height: '10px', 
						background: 'rgba(255,255,255,1)',
						pointerEvents: 'none',
						zIndex: 1
					}} />
				</TableContainer>
				
				<Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						<Button
							component="a"
							href="https://www.facebook.com/vince.escoton.nt"
							target="_blank"
							rel="noopener noreferrer"
							startIcon={<FacebookIcon />}
							variant="outlined"
							size="small"
							sx={{
								borderRadius: '20px',
								textTransform: 'none',
								color: '#1877f2',
								borderColor: '#1877f2',
								'&:hover': {
									backgroundColor: '#1877f2',
									color: 'white',
									borderColor: '#1877f2'
								}
							}}
						>
							Vincent Edriel Escoton
						</Button>
						<Button
							component="a"
							href="https://www.facebook.com/ArjayCallano"
							target="_blank"
							rel="noopener noreferrer"
							startIcon={<FacebookIcon />}
							variant="outlined"
							size="small"
							sx={{
								borderRadius: '20px',
								textTransform: 'none',
								color: '#1877f2',
								borderColor: '#1877f2',
								'&:hover': {
									backgroundColor: '#1877f2',
									color: 'white',
									borderColor: '#1877f2'
								}
							}}
						>
							Arjay Miles Callano
						</Button>
						<Button
							component="a"
							href="https://www.facebook.com/zay.semilla"
							target="_blank"
							rel="noopener noreferrer"
							startIcon={<FacebookIcon />}
							variant="outlined"
							size="small"
							sx={{
								borderRadius: '20px',
								textTransform: 'none',
								color: '#1877f2',
								borderColor: '#1877f2',
								'&:hover': {
									backgroundColor: '#1877f2',
									color: 'white',
									borderColor: '#1877f2'
								}
							}}
						>
							Zayne Patrick Semilla
						</Button>
					</Box>
				<TablePagination
					component="div"
					count={sortedRows.length}
					page={page}
					onPageChange={(_, p) => setPage(p)}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 20)); setPage(0); }}
					rowsPerPageOptions={[5, 10, 20, 50]}
				/>
				</Box>
			</Box>
			<UrlDetailDialog url={selectedUrl} open={!!selectedUrl} onClose={() => setSelectedUrl(null)} />
		</Container>
		</>
	);
};

export default Dashboard;


