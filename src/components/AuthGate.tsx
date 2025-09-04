import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
  Alert,
  Link
} from '@mui/material';
import {
  Security as SecurityIcon,
  Key as KeyIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authKey, setAuthKey } = useAuth();
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setAuthKey(value.trim());
      setIsSubmitting(false);
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      handleSubmit();
    }
  };

  if (authKey) return <>{children}</>;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SecurityIcon
                sx={{
                  fontSize: 48,
                  color: 'primary.main',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
              <Typography variant="h4" fontWeight="700" color="primary.main">
                URLhaus
              </Typography>
            </Box>

            <Typography variant="h5" fontWeight="600" color="text.primary">
              Security Analysis Portal
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
              Enter your authentication key to access the URLhaus threat intelligence platform
            </Typography>

            <Box sx={{ width: '100%', maxWidth: 400 }}>
              <TextField
                label="Authentication Key"
                variant="outlined"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyPress={handleKeyPress}
                fullWidth
                size="medium"
                InputProps={{
                  startAdornment: <KeyIcon sx={{ mr: 1, color: 'action.active' }} />,
                  sx: { borderRadius: 2 }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={!value.trim() || isSubmitting}
              startIcon={isSubmitting ? <CheckCircleIcon /> : <SecurityIcon />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                }
              }}
            >
              {isSubmitting ? 'Authenticating...' : 'Access Platform'}
            </Button>

            <Alert
              severity="info"
              sx={{
                width: '100%',
                borderRadius: 2,
                '& .MuiAlert-message': { textAlign: 'left' }
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>Getting Started:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Obtain a free authentication key from the abuse.ch portal
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Your key enables access to real-time threat intelligence
              </Typography>
              <Typography variant="body2">
                • All queries are logged for security and abuse prevention
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have a key?
              </Typography>
              <Link
                href="https://abuse.ch/contact/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                Get one here
                <OpenInNewIcon fontSize="small" />
              </Link>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthGate;


