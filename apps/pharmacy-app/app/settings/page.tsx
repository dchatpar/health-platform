'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header } from '@/components/common/Header';
import { useQuery, useMutation, useQueryClient, usePermissions } from '@/hooks';
import { api, mockPharmacy, mockStaffUsers } from '@/services';
import { StaffUser, StaffRole, Pharmacy } from '@/types';
import { formatDateTime } from '@/lib';

const pharmacySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  phone: z.string().min(10, 'Valid phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  is24Hours: z.boolean(),
});

const staffSchema = z.object({
  email: z.string().email('Valid email is required'),
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['admin', 'pharmacist', 'cashier', 'delivery', 'viewer']),
  phone: z.string().optional(),
});

type PharmacyFormData = z.infer<typeof pharmacySchema>;
type StaffFormData = z.infer<typeof staffSchema>;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [editPharmacyOpen, setEditPharmacyOpen] = useState(false);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [editStaffOpen, setEditStaffOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const { data: pharmacyData } = useQuery({
    queryKey: ['settings', 'pharmacy'],
    queryFn: () => api.getPharmacy(),
  });

  const { data: staffData } = useQuery({
    queryKey: ['settings', 'staff'],
    queryFn: () => api.getStaff(),
  });

  const pharmacy = pharmacyData || mockPharmacy;
  const staffUsers = staffData?.items || mockStaffUsers;

  const updatePharmacyMutation = useMutation({
    mutationFn: (data: Partial<Pharmacy>) => api.updatePharmacy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'pharmacy'] });
      setEditPharmacyOpen(false);
      setSnackbar({ open: true, message: 'Pharmacy settings updated', severity: 'success' });
    },
  });

  const {
    control: pharmacyControl,
    handleSubmit: handlePharmacySubmit,
    reset: resetPharmacy,
    formState: { errors: pharmacyErrors },
  } = useForm<PharmacyFormData>({
    resolver: zodResolver(pharmacySchema),
    defaultValues: pharmacy,
  });

  const {
    control: staffControl,
    handleSubmit: handleStaffSubmit,
    reset: resetStaff,
    formState: { errors: staffErrors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      email: '',
      name: '',
      role: 'viewer',
      phone: '',
    },
  });

  const onPharmacySubmit = (data: PharmacyFormData) => {
    updatePharmacyMutation.mutate(data as Partial<Pharmacy>);
  };

  const onStaffSubmit = (data: StaffFormData) => {
    console.log('Staff submit', data);
    setAddStaffOpen(false);
    setSnackbar({ open: true, message: 'Staff member added', severity: 'success' });
    resetStaff();
  };

  const onStaffEditSubmit = (data: StaffFormData) => {
    console.log('Staff edit', data, selectedStaff);
    setEditStaffOpen(false);
    setSelectedStaff(null);
    setSnackbar({ open: true, message: 'Staff member updated', severity: 'success' });
    resetStaff();
  };

  const handleEditStaff = (staff: StaffUser) => {
    setSelectedStaff(staff);
    resetStaff({
      email: staff.email,
      name: staff.name,
      role: staff.role,
      phone: staff.phone || '',
    });
    setEditStaffOpen(true);
  };

  const getRoleColor = (role: StaffRole) => {
    const colors: Record<StaffRole, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      admin: 'error',
      pharmacist: 'primary',
      cashier: 'info',
      delivery: 'success',
      viewer: 'default',
    };
    return colors[role] || 'default';
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Settings" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tab label="Pharmacy Profile" />
          <Tab label="Staff Management" disabled={!hasPermission('manage_staff')} />
        </Tabs>

        {/* Pharmacy Profile Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <BusinessIcon fontSize="large" color="primary" />
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {pharmacy.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          License: {pharmacy.licenseNumber}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={pharmacy.isActive ? 'Active' : 'Inactive'}
                      color={pharmacy.isActive ? 'success' : 'default'}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                      </Box>
                      <Typography variant="body1">{pharmacy.phone}</Typography>
                    </Grid>
                    {pharmacy.email && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Email
                          </Typography>
                        </Box>
                        <Typography variant="body1">{pharmacy.email}</Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <TimeIcon fontSize="small" sx={{ color: 'text.secondary', mt: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          Address
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {pharmacy.address.street}
                        <br />
                        {pharmacy.address.city}, {pharmacy.address.postalCode}
                        <br />
                        {pharmacy.address.state}, {pharmacy.address.country}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Operating Hours
                      </Typography>
                      {pharmacy.is24Hours ? (
                        <Chip label="24 Hours" color="primary" sx={{ mt: 1 }} />
                      ) : (
                        <Box sx={{ mt: 1 }}>
                          {Object.entries(pharmacy.operatingHours).map(([day, hours]) => (
                            <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {day}
                              </Typography>
                              <Typography variant="body2">
                                {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                    {hasPermission('manage_settings') && (
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          resetPharmacy(pharmacy);
                          setEditPharmacyOpen(true);
                        }}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Quick Stats
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Staff
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {staffUsers.length}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Active Staff
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {staffUsers.filter((s) => s.isActive).length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Staff Management Tab */}
        {activeTab === 1 && hasPermission('manage_staff') && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Staff Members
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddStaffOpen(true)}>
                  Add Staff
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Login</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffUsers.map((staff) => (
                      <TableRow key={staff.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                              {staff.name.charAt(0)}
                            </Avatar>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {staff.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{staff.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={staff.role}
                            size="small"
                            color={getRoleColor(staff.role)}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>{staff.phone || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={staff.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={staff.isActive ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{staff.lastLogin ? formatDateTime(staff.lastLogin) : 'Never'}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleEditStaff(staff)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Edit Pharmacy Dialog */}
      <Dialog open={editPharmacyOpen} onClose={() => setEditPharmacyOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handlePharmacySubmit(onPharmacySubmit)}>
          <DialogTitle>Edit Pharmacy Profile</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={pharmacyControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Pharmacy Name" error={!!pharmacyErrors.name} helperText={pharmacyErrors.name?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="licenseNumber"
                  control={pharmacyControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="License Number" error={!!pharmacyErrors.licenseNumber} helperText={pharmacyErrors.licenseNumber?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={pharmacyControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Phone" error={!!pharmacyErrors.phone} helperText={pharmacyErrors.phone?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={pharmacyControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Email (optional)" error={!!pharmacyErrors.email} helperText={pharmacyErrors.email?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="street"
                  control={pharmacyControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Street Address" error={!!pharmacyErrors.street} helperText={pharmacyErrors.street?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="city"
                  control={pharmacyControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="City" error={!!pharmacyErrors.city} helperText={pharmacyErrors.city?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="state"
                  control={pharmacyControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="State" error={!!pharmacyErrors.state} helperText={pharmacyErrors.state?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="postalCode"
                  control={pharmacyControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Postal Code" error={!!pharmacyErrors.postalCode} helperText={pharmacyErrors.postalCode?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="country"
                  control={pharmacyControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Country" error={!!pharmacyErrors.country} helperText={pharmacyErrors.country?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="is24Hours"
                  control={pharmacyControl}
                  render={({ field }) => (
                    <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />} label="24 Hours Operation" />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditPharmacyOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={updatePharmacyMutation.isPending}>
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={addStaffOpen} onClose={() => setAddStaffOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleStaffSubmit(onStaffSubmit)}>
          <DialogTitle>Add Staff Member</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={staffControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Full Name" error={!!staffErrors.name} helperText={staffErrors.name?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={staffControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Email" type="email" error={!!staffErrors.email} helperText={staffErrors.email?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={staffControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Phone (optional)" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="role"
                  control={staffControl}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!staffErrors.role}>
                      <InputLabel>Role</InputLabel>
                      <Select {...field} label="Role">
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="pharmacist">Pharmacist</MenuItem>
                        <MenuItem value="cashier">Cashier</MenuItem>
                        <MenuItem value="delivery">Delivery</MenuItem>
                        <MenuItem value="viewer">Viewer</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setAddStaffOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add Staff
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={editStaffOpen} onClose={() => setEditStaffOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleStaffSubmit(onStaffEditSubmit)}>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={staffControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Full Name" error={!!staffErrors.name} helperText={staffErrors.name?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={staffControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Email" type="email" error={!!staffErrors.email} helperText={staffErrors.email?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={staffControl}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Phone (optional)" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="role"
                  control={staffControl}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!staffErrors.role}>
                      <InputLabel>Role</InputLabel>
                      <Select {...field} label="Role">
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="pharmacist">Pharmacist</MenuItem>
                        <MenuItem value="cashier">Cashier</MenuItem>
                        <MenuItem value="delivery">Delivery</MenuItem>
                        <MenuItem value="viewer">Viewer</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditStaffOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
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
