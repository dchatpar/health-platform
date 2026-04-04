'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Container,
} from '@mui/material';
import {
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ maxWidth: 480, mx: 'auto', boxShadow: 3 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            {/* Icon */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'error.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <LockIcon sx={{ fontSize: 40, color: 'error.main' }} />
            </Box>

            {/* Title */}
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Access Denied
            </Typography>

            {/* Description */}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 360, mx: 'auto' }}
            >
              You do not have permission to access this page. Please contact your
              administrator if you believe this is an error.
            </Typography>

            {/* Error Code */}
            <Box
              sx={{
                bgcolor: 'background.default',
                borderRadius: 1,
                p: 2,
                mb: 4,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Error Code
              </Typography>
              <Typography variant="h6" fontWeight={600} color="error">
                403 - Unauthorized
              </Typography>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleGoBack}
                sx={{ textTransform: 'none' }}
              >
                Go Back
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push('/')}
                sx={{ textTransform: 'none' }}
              >
                Return to Dashboard
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}