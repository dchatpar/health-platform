'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as ThemeIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  DeviceUnknown as DeviceIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { useThemeMode } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  weeklyReport: boolean;
  securityAlerts: boolean;
}

interface Session {
  id: string;
  deviceName: string;
  deviceType: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const queryClient = useQueryClient();

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [activeTab, setActiveTab] = useState(0);

  // Fetch user profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: async () => {
      try {
        return await api.getProfile();
      } catch {
        return null;
      }
    },
  });

  // Fetch active sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['settings', 'sessions'],
    queryFn: async () => {
      try {
        return await api.getActiveSessions();
      } catch {
        return { items: [] as Session[] };
      }
    },
  });

  const profile = profileData || {
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@health.com',
    phone: '+966501234567',
  };

  const sessions = sessionsData?.items || [];

  // Profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await api.updateProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] });
      showSnackbar('Profile updated successfully');
    },
    onError: (error: Error) => {
      showSnackbar(error.message || 'Failed to update profile', 'error');
    },
  });

  // Password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await api.changePassword(data);
    },
    onSuccess: () => {
      showSnackbar('Password changed successfully');
      resetPasswordForm();
    },
    onError: (error: Error) => {
      showSnackbar(error.message || 'Failed to change password', 'error');
    },
  });

  // Notification preferences mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: NotificationPreferences) => {
      return await api.updateNotificationPreferences(data);
    },
    onSuccess: () => {
      showSnackbar('Notification preferences saved');
    },
    onError: (error: Error) => {
      showSnackbar(error.message || 'Failed to save preferences', 'error');
    },
  });

  // Revoke session mutation
  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await api.revokeSession(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'sessions'] });
      showSnackbar('Session revoked successfully');
    },
    onError: (error: Error) => {
      showSnackbar(error.message || 'Failed to revoke session', 'error');
    },
  });

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: true,
    push: true,
    sms: false,
    weeklyReport: true,
    securityAlerts: true,
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    updatePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const onNotificationChange = (key: keyof NotificationPreferences, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    updateNotificationsMutation.mutate(newNotifications);
  };

  const handleRevokeSession = (sessionId: string) => {
    if (confirm('Are you sure you want to revoke this session?')) {
      revokeSessionMutation.mutate(sessionId);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (confirm('Are you sure you want to revoke all other sessions?')) {
      try {
        await api.revokeAllSessions();
        queryClient.invalidateQueries({ queryKey: ['settings', 'sessions'] });
        showSnackbar('All other sessions revoked');
      } catch (error) {
        showSnackbar('Failed to revoke sessions', 'error');
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Settings" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          {/* Profile Settings */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>Profile Settings</Typography>
                </Box>

                {profileLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...registerProfile('name')}
                          fullWidth
                          label="Full Name"
                          error={!!profileErrors.name}
                          helperText={profileErrors.name?.message}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...registerProfile('email')}
                          fullWidth
                          label="Email"
                          type="email"
                          error={!!profileErrors.email}
                          helperText={profileErrors.email?.message}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...registerProfile('phone')}
                          fullWidth
                          label="Phone"
                          error={!!profileErrors.phone}
                          helperText={profileErrors.phone?.message}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Role"
                          value={(user as { role?: string })?.role || 'Super Admin'}
                          disabled
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        startIcon={updateProfileMutation.isPending && <CircularProgress size={18} />}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <SecurityIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>Security</Typography>
                </Box>

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        {...registerPassword('currentPassword')}
                        fullWidth
                        type="password"
                        label="Current Password"
                        error={!!passwordErrors.currentPassword}
                        helperText={passwordErrors.currentPassword?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerPassword('newPassword')}
                        fullWidth
                        type="password"
                        label="New Password"
                        error={!!passwordErrors.newPassword}
                        helperText={passwordErrors.newPassword?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerPassword('confirmPassword')}
                        fullWidth
                        type="password"
                        label="Confirm New Password"
                        error={!!passwordErrors.confirmPassword}
                        helperText={passwordErrors.confirmPassword?.message}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Two-factor authentication (2FA)"
                      />
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 6 }}>
                        Recommended for admin accounts
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={updatePasswordMutation.isPending}
                      startIcon={updatePasswordMutation.isPending && <CircularProgress size={18} />}
                    >
                      Update Password
                    </Button>
                  </Box>
                </form>

                <Divider sx={{ my: 3 }} />

                {/* Active Sessions */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Active Sessions
                    </Typography>
                    {sessions.length > 1 && (
                      <Button size="small" color="error" onClick={handleRevokeAllSessions}>
                        Revoke All Others
                      </Button>
                    )}
                  </Box>

                  {sessionsLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <List dense>
                      {sessions.map((session) => (
                        <ListItem key={session.id}>
                          <DeviceIcon sx={{ mr: 2, color: 'text.secondary' }} />
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {session.deviceName}
                                {session.isCurrent && <Chip label="Current" size="small" color="primary" />}
                              </Box>
                            }
                            secondary={`${session.location} - Last active: ${session.lastActive}`}
                          />
                          <ListItemSecondaryAction>
                            {!session.isCurrent && (
                              <IconButton
                                edge="end"
                                size="small"
                                color="error"
                                onClick={() => handleRevokeSession(session.id)}
                                disabled={revokeSessionMutation.isPending}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <NotificationsIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>Notifications</Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.email}
                        onChange={(e) => onNotificationChange('email', e.target.checked)}
                      />
                    }
                    label="Email notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.push}
                        onChange={(e) => onNotificationChange('push', e.target.checked)}
                      />
                    }
                    label="Push notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.sms}
                        onChange={(e) => onNotificationChange('sms', e.target.checked)}
                      />
                    }
                    label="SMS notifications"
                  />
                  <Divider sx={{ my: 1 }} />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.weeklyReport}
                        onChange={(e) => onNotificationChange('weeklyReport', e.target.checked)}
                      />
                    }
                    label="Weekly summary report"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.securityAlerts}
                        onChange={(e) => onNotificationChange('securityAlerts', e.target.checked)}
                      />
                    }
                    label="Security alerts"
                  />
                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={() => showSnackbar('Notification preferences saved')}
                  >
                    Save Preferences
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Appearance Settings */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <ThemeIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>Appearance</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography>Dark Mode</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Current: {mode === 'dark' ? 'Dark' : 'Light'}
                    </Typography>
                  </Box>
                  <Switch checked={mode === 'dark'} onChange={toggleTheme} />
                </Box>

                <Alert severity="info" sx={{ mt: 2 }}>
                  Theme preference is saved locally and will persist across sessions.
                </Alert>
              </CardContent>
            </Card>

            {/* Account Info Card */}
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'secondary.main',
                      fontSize: '2rem',
                    }}
                  >
                    {user?.name?.charAt(0) || 'A'}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {user?.name || 'Admin User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || 'admin@health.com'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                    <Chip
                      label={(user as { role?: string })?.role || 'Super Admin'}
                      size="small"
                      color="secondary"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Account ID
                    </Typography>
                    <Typography variant="body2">
                      {(user as { id?: string })?.id || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}