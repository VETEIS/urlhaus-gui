import React, { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Divider,
  Stack,
  Typography,
  Paper,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Help as HelpIcon,
  FileDownload as FileDownloadIcon,
  BugReport as BugReportIcon,
  Phishing as PhishingIcon,
  Computer as ComputerIcon,
  Android as AndroidIcon,
  Apple as AppleIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import { createApiClient } from '../api/client';
import type { UrlDetail } from '../api/client';
import { useAuth } from '../context/AuthContext';

type Props = {
  url: string | null;
  open: boolean;
  onClose: () => void;
};

const UrlDetailDialog: React.FC<Props> = ({ url, open, onClose }) => {
  const { authKey } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingContext, setLoadingContext] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<UrlDetail | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (!open || !url) return;
    const fetchDetail = async () => {
      setLoading(true);
      setLoadingContext('Fetching URL metadata from URLhaus...');
      setError(null);
      setDetail(null);
      try {
        const api = createApiClient(authKey);
        const body = new URLSearchParams();
        body.set('url', url);
        setLoadingContext('Analyzing security data and threat intelligence...');
        const { data } = await api.post<UrlDetail>('/api/v1/url/', body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        setLoadingContext('Processing payload information...');
        setDetail(data);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load');
      } finally {
        setLoading(false);
        setLoadingContext('');
      }
    };
    fetchDetail();
  }, [open, url, authKey]);

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'online':
        return <CloudDoneIcon color="error" fontSize="medium" />;
      case 'offline':
        return <CheckCircleIcon color="success" fontSize="medium" />;
      default:
        return <HelpIcon color="action" fontSize="medium" />;
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

  const getThreatIcon = (threat: string | undefined) => {
    if (!threat) return null;
    const lowerThreat = threat.toLowerCase();
    if (lowerThreat.includes('malware') || lowerThreat.includes('virus')) return <BugReportIcon color="error" fontSize="small" />;
    if (lowerThreat.includes('phishing')) return <PhishingIcon color="warning" fontSize="small" />;
    if (lowerThreat.includes('spam')) return <WarningIcon color="info" fontSize="small" />;
    return <SecurityIcon color="primary" fontSize="small" />;
  };

  const getThreatColor = (threat: string | undefined) => {
    if (!threat) return 'default';
    const lowerThreat = threat.toLowerCase();
    if (lowerThreat.includes('malware') || lowerThreat.includes('virus')) return 'error';
    if (lowerThreat.includes('phishing')) return 'warning';
    if (lowerThreat.includes('spam')) return 'info';
    return 'primary';
  };

  const getPayloadIcon = (fileType: string | undefined) => {
    if (!fileType) return <FileDownloadIcon fontSize="small" />;
    const lowerType = fileType.toLowerCase();
    if (lowerType.includes('exe') || lowerType.includes('dll')) return <ComputerIcon fontSize="small" />;
    if (lowerType.includes('apk')) return <AndroidIcon fontSize="small" />;
    if (lowerType.includes('dmg') || lowerType.includes('app')) return <AppleIcon fontSize="small" />;
    return <FileDownloadIcon fontSize="small" />;
  };

  const getBlacklistIcon = (status: string | unknown) => {
    if (typeof status === 'string') {
      if (status === 'not listed') return <CheckCircleOutlineIcon color="success" fontSize="small" />;
      if (status.includes('listed') || status.includes('blocked')) return <ErrorIcon color="error" fontSize="small" />;
    }
    return <InfoIcon color="action" fontSize="small" />;
  };

  const getBlacklistColor = (status: string | unknown) => {
    if (typeof status === 'string') {
      if (status === 'not listed') return 'success';
      if (status.includes('listed') || status.includes('blocked')) return 'error';
    }
    return 'default';
  };

  const getTagColor = (tag: string) => {
    const lowerTag = tag.toLowerCase();
    
    if (lowerTag.includes('malware') || lowerTag.includes('virus') || lowerTag.includes('trojan')) {
      return { bg: '#ffebee', color: '#c62828', border: '#e57373' }; // Red
    }
    if (lowerTag.includes('phishing') || lowerTag.includes('scam')) {
      return { bg: '#fff3e0', color: '#ef6c00', border: '#ffb74d' }; // Orange
    }
    if (lowerTag.includes('spam') || lowerTag.includes('botnet')) {
      return { bg: '#e3f2fd', color: '#1565c0', border: '#64b5f6' }; // Blue
    }
    
    // Platform/Architecture
    if (lowerTag.includes('windows') || lowerTag.includes('win32') || lowerTag.includes('exe')) {
      return { bg: '#e8f5e8', color: '#2e7d32', border: '#81c784' }; // Green
    }
    if (lowerTag.includes('android') || lowerTag.includes('apk')) {
      return { bg: '#e0f2f1', color: '#00695c', border: '#4db6ac' }; // Teal
    }
    if (lowerTag.includes('linux') || lowerTag.includes('elf') || lowerTag.includes('mips')) {
      return { bg: '#f3e5f5', color: '#7b1fa2', border: '#ba68c8' }; // Purple
    }
    if (lowerTag.includes('mac') || lowerTag.includes('apple') || lowerTag.includes('dmg')) {
      return { bg: '#fce4ec', color: '#ad1457', border: '#f48fb1' }; // Pink
    }
    
    if (lowerTag.includes('32-bit') || lowerTag.includes('64-bit')) {
      return { bg: '#fff8e1', color: '#f57f17', border: '#ffd54f' }; // Amber
    }
    if (lowerTag.includes('javascript') || lowerTag.includes('js')) {
      return { bg: '#e0f7fa', color: '#00838f', border: '#4dd0e1' }; // Cyan
    }
    
    return { bg: '#f5f5f5', color: '#424242', border: '#bdbdbd' }; // Gray
  };

  // loading
  const skeletonContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
            <LinkIcon color="primary" fontSize="small" />
            <Typography 
              variant="subtitle1" 
              sx={{ 
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
            >
              {url}
            </Typography>
          </Stack>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        <Box sx={{ p: 2 }}>
          <TableContainer>
            <Table size="small">
              <TableBody>
                {Array.from({ length: 8 }, (_, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ width: '25%', fontWeight: 600, bgcolor: 'grey.50' }}>
                      <Skeleton variant="text" width="80%" height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width="90%" height={20} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ p: 1.5, bgcolor: 'primary.50', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileDownloadIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight="600">Payloads</Typography>
            </Box>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Filename', 'Type', 'Size', 'First Seen', 'SHA256', 'VirusTotal'].map((header) => (
                    <TableCell key={header} sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: 3 }, (_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 6 }, (_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton variant="text" width="90%" height={20} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        py: 1, 
        px: 2,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        '& .MuiTypography-root': { color: 'white' }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon />
          <Typography variant="h6" fontWeight="600">URL Security Analysis</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, height: '600px', position: 'relative' }}>
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
        
        {error && (
          <Box sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="error" variant="body2">{error}</Typography>
          </Box>
        )}

        {(loading || !detail) && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                  <LinkIcon color="primary" fontSize="small" />
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
                    }}
                  >
                    {url}
          </Typography>
                </Stack>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Skeleton variant="circular" width={16} height={16} />
                  <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                </Box>
              </Box>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              <Box sx={{ p: 2 }}>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {Array.from({ length: 8 }, (_, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ width: '25%', fontWeight: 600, bgcolor: 'grey.50' }}>
                            <Skeleton variant="text" width="80%" height={20} />
                          </TableCell>
                          <TableCell>
                            <Skeleton variant="text" width="90%" height={20} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: 'primary.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileDownloadIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight="600">Payloads</Typography>
                  </Box>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {['Filename', 'Type', 'Size', 'First Seen', 'SHA256', 'VirusTotal'].map((header) => (
                          <TableCell key={header} sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.from({ length: 3 }, (_, index) => (
                        <TableRow key={index}>
                          {Array.from({ length: 6 }, (_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton variant="text" width="90%" height={20} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Box>
        )}

        {detail && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                  <LinkIcon color="primary" fontSize="small" />
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
                    }}
                  >
                    {detail.url}
                  </Typography>
            </Stack>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  {getStatusIcon(detail.url_status)}
                  <Chip 
                    size="small" 
                    label={detail.url_status ?? 'unknown'} 
                    color={getStatusColor(detail.url_status)}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
                <Paper sx={{ flex: 1, p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                    URL Information
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: '40%', fontWeight: 600, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WarningIcon color="error" fontSize="small" />
                              Threat Level
                            </Box>
                          </TableCell>
                          <TableCell>
                            {detail.threat ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getThreatIcon(detail.threat)}
                                <Chip 
                                  label={detail.threat} 
                                  color={getThreatColor(detail.threat)}
                                  variant="outlined"
                                  size="small"
                                />
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">n/a</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinkIcon color="primary" fontSize="small" />
                              Host
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            {detail.host ?? 'n/a'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ScheduleIcon color="primary" fontSize="small" />
                              Date Added
                            </Box>
                          </TableCell>
                          <TableCell>{detail.date_added ?? 'n/a'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CloudDoneIcon color="error" fontSize="small" />
                              Last Online
                            </Box>
                          </TableCell>
                          <TableCell>{detail.last_online ?? 'n/a'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WarningIcon color="warning" fontSize="small" />
                              Abuse Complaint Sent
                            </Box>
                          </TableCell>
                          <TableCell>
                            {detail.larted ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon color="success" fontSize="small" />
                                <Typography variant="body2">Yes</Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">n/a</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon color="primary" fontSize="small" />
                              Reporter
                            </Box>
                          </TableCell>
                          <TableCell>{detail.reporter ?? 'n/a'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SecurityIcon color="primary" fontSize="small" />
                              Blacklist Status
                            </Box>
                          </TableCell>
                          <TableCell>
                            {detail.blacklists && Object.keys(detail.blacklists).length > 0 ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(detail.blacklists).map(([key, value]) => (
                                  <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" fontWeight="500">{key}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      {getBlacklistIcon(value)}
                                      <Chip 
                                        label={typeof value === 'string' ? value : JSON.stringify(value)}
                                        size="small"
                                        variant="outlined"
                                        color={getBlacklistColor(value)}
                                      />
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">n/a</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SecurityIcon color="primary" fontSize="small" />
                              Tags
                            </Box>
                          </TableCell>
                          <TableCell>
                            {detail.tags && detail.tags.length > 0 ? (
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {detail.tags.map((t) => {
                                  const tagColors = getTagColor(t);
                                  return (
                                    <Chip 
                                      key={t} 
                                      label={t} 
                                      size="small" 
                                      sx={{
                                        backgroundColor: tagColors.bg,
                                        color: tagColors.color,
                                        borderColor: tagColors.border,
                                        '&:hover': {
                                          backgroundColor: tagColors.bg,
                                          opacity: 0.8
                                        }
                                      }}
                                    />
                                  );
                                })}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">n/a</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                <Paper sx={{ flex: 1, p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                    Payload Information
                  </Typography>
            {detail.payloads && detail.payloads.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Property</TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {detail.payloads.map((payload, index) => (
                            <React.Fragment key={index}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FileDownloadIcon color="primary" fontSize="small" />
                                    Filename {index + 1}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                  {payload.filename ?? 'n/a'}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ComputerIcon color="primary" fontSize="small" />
                                    Type {index + 1}
                                  </Box>
                                </TableCell>
                                <TableCell>{payload.file_type ?? 'n/a'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <InfoIcon color="primary" fontSize="small" />
                                    Size {index + 1}
                                  </Box>
                                </TableCell>
                                <TableCell>{payload.response_size ?? 'n/a'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ScheduleIcon color="primary" fontSize="small" />
                                    First Seen {index + 1}
                                  </Box>
                                </TableCell>
                                <TableCell>{payload.firstseen ?? 'n/a'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SecurityIcon color="primary" fontSize="small" />
                                    SHA256 {index + 1}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                  {payload.response_sha256 ? (
                                    <Tooltip title={payload.response_sha256} placement="top">
                                      <Typography 
                                        sx={{ 
                                          fontFamily: 'monospace', 
                                          fontSize: '0.75rem',
                                          cursor: 'help',
                                          maxWidth: '200px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        {payload.response_sha256}
                                      </Typography>
                                    </Tooltip>
                                  ) : 'n/a'}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SecurityIcon color="primary" fontSize="small" />
                                    VirusTotal {index + 1}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  {payload.virustotal?.result ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      {payload.virustotal.percent && Number(payload.virustotal.percent) > 0 ? (
                                        <ErrorIcon color="error" fontSize="small" />
                                      ) : (
                                        <CheckCircleIcon color="success" fontSize="small" />
                                      )}
                                      <Chip 
                                        label={`${payload.virustotal.result} (${payload.virustotal.percent}%)`}
                                        color={payload.virustotal.percent && Number(payload.virustotal.percent) > 0 ? 'error' : 'success'}
                                        variant="outlined"
                                        size="small"
                                      />
                  </Box>
                                  ) : 'n/a'}
                                </TableCell>
                              </TableRow>
                              {detail.payloads && index < detail.payloads.length - 1 && (
                                <TableRow>
                                  <TableCell colSpan={2} sx={{ py: 1 }}>
                                    <Divider />
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No payload data available
                    </Typography>
                  )}
                </Paper>
              </Box>


            {/* JSON */}
            {showRaw && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: 'primary.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CodeIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight="600">Raw JSON Data</Typography>
                  </Box>
                </Box>
                <Box 
                  component="pre" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    m: 0,
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    overflow: 'auto'
                  }}
                >
                  {JSON.stringify(detail, null, 2)}
                </Box>
              </Box>
            )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 1.5 }}>
        {detail && (
          <Button
            variant="outlined"
            startIcon={<CodeIcon />}
            onClick={() => setShowRaw((s) => !s)}
            size="small"
          >
            {showRaw ? 'Hide JSON' : 'View JSON'}
          </Button>
        )}
        <Button 
          variant="contained" 
          onClick={onClose}
          size="small"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UrlDetailDialog;


