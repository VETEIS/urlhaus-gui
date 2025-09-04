import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

const theme = createTheme({
	palette: {
		mode: 'light',
		primary: { main: '#1e88e5' },
		secondary: { main: '#6d4c41' },
		error: { main: '#d32f2f' },
		success: { main: '#2e7d32' },
	},
	shape: { borderRadius: 10 },
	components: {
		MuiTableRow: {
			styleOverrides: {
				root: {
					transition: 'background 120ms ease',
					'&:hover': { backgroundColor: 'rgba(30,136,229,0.06)' },
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: { fontWeight: 600 },
			},
		},
	},
})

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<App />
		</ThemeProvider>
	</StrictMode>,
)
