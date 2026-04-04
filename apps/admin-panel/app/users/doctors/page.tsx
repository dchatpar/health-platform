'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Avatar,
  Grid,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { DataGrid, Column } from '@/components/common/DataGrid';
import { useQuery, useMutation, useQueryClient } from '@/hooks';
import { api } from '@/services';
import { Doctor } from '@/types';
import { formatDateTime, getInitials, getApprovalStatusColor } from '@/lib';

export default function DoctorsPage() {
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const queryClient = useQueryClient();

  const { data: doctorsData, isLoading } = useQuery({
    queryKey: ['doctors', { approvalStatus: approvalFilter }],
    queryFn: () => api.getDoctors({ approvalStatus: approvalFilter === 'all' ? undefined : approvalFilter }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.approveDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setSnackbar({ open: true, message: 'Doctor approved successfully', severity: 'success' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.rejectDoctor(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setRejectDialogOpen(false);
      setSelectedDoctor(null);
      setRejectReason('');
      setSnackbar({ open: true, message: 'Doctor rejected', severity: 'success' });
    },
  });

  const doctors = doctorsData?.items || [];

  const columns: Column<Doctor>[] = [
    {
      id: 'name',
      label: 'Doctor',
      minWidth: 220,
      format: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            {getInitials(row.name)}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {row.name}
              </Typography>
              {row.isVerified && <VerifiedIcon sx={{ fontSize: 16, color: 'success.main' }} />}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'specialty',
      label: 'Specialty',
      minWidth: 150,
    },
    {
      id: 'licenseNumber',
      label: 'License',
      minWidth: 130,
    },
    {
      id: 'yearsOfExperience',
      label: 'Experience',
      minWidth: 100,
      format: (value) => `${value} years`,
    },
    {
      id: 'consultationFee',
      label: 'Fee',
      minWidth: 100,
      format: (value) => `SAR ${value}`,
    },
    {
      id: 'rating',
      label: 'Rating',
      minWidth: 120,
      format: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
          <Typography variant="body2">
            {Number(value).toFixed(1)} ({row.totalRatings})
          </Typography>
        </Box>
      ),
    },
    {
      id: 'approvalStatus',
      label: 'Status',
      minWidth: 110,
      format: (value) => (
        <Chip
          label={String(value)}
          size="small"
          color={getApprovalStatusColor(String(value))}
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Applied',
      minWidth: 120,
      format: (value) => formatDateTime(String(value)),
    },
  ];

  const getActions = () => [
    {
      icon: <ViewIcon />,
      label: 'View Details',
      onClick: (row: Doctor) => {
        setSelectedDoctor(row);
        setDetailDialogOpen(true);
      },
      color: 'default' as const,
    },
    {
      icon: <ApproveIcon />,
      label: 'Approve',
      onClick: (row: Doctor) => {
        if (confirm(`Approve Dr. ${row.name}?`)) {
          approveMutation.mutate(row.id);
        }
      },
      color: 'success' as const,
      disabled: (row: Doctor) => row.approvalStatus !== 'pending',
    },
    {
      icon: <RejectIcon />,
      label: 'Reject',
      onClick: (row: Doctor) => {
        setSelectedDoctor(row);
        setRejectDialogOpen(true);
      },
      color: 'error' as const,
      disabled: (row: Doctor) => row.approvalStatus !== 'pending',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Doctor Approvals" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <Button
                key={status}
                variant={approvalFilter === status ? 'contained' : 'text'}
                onClick={() => setApprovalFilter(status as typeof approvalFilter)}
                sx={{ borderRadius: 0, textTransform: 'capitalize' }}
              >
                {status}
                {status === 'pending' && doctors.filter((d) => d.approvalStatus === 'pending').length > 0 && (
                  <Chip label={doctors.filter((d) => d.approvalStatus === 'pending').length} size="small" sx={{ ml: 1 }} color="warning" />
                )}
              </Button>
            ))}
          </Box>
          <CardContent>
            <DataGrid
              columns={columns}
              data={doctors}
              loading={isLoading}
              actions={getActions()}
              emptyMessage="No doctors found"
            />
          </CardContent>
        </Card>
      </Box>

      {/* Doctor Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Doctor Details</DialogTitle>
        <DialogContent dividers>
          {selectedDoctor && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                    {getInitials(selectedDoctor.name)}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedDoctor.name}
                  </Typography>
                  <Chip
                    label={selectedDoctor.approvalStatus}
                    color={getApprovalStatusColor(selectedDoctor.approvalStatus)}
                    sx={{ textTransform: 'capitalize', mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{selectedDoctor.email}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{selectedDoctor.phone || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Specialty</Typography>
                    <Typography variant="body1">{selectedDoctor.specialty}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">License</Typography>
                    <Typography variant="body1">{selectedDoctor.licenseNumber}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Experience</Typography>
                    <Typography variant="body1">{selectedDoctor.yearsOfExperience} years</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Consultation Fee</Typography>
                    <Typography variant="body1">SAR {selectedDoctor.consultationFee}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Education</Typography>
                    <Typography variant="body1">{selectedDoctor.education}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Hospital</Typography>
                    <Typography variant="body1">{selectedDoctor.hospital || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon sx={{ color: 'warning.main' }} />
                      <Typography variant="body1">
                        {selectedDoctor.rating.toFixed(1)} ({selectedDoctor.totalRatings} ratings)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          {selectedDoctor?.approvalStatus === 'pending' && (
            <>
              <Button color="error" onClick={() => { setDetailDialogOpen(false); setRejectDialogOpen(true); }}>
                Reject
              </Button>
              <Button color="success" variant="contained" onClick={() => { approveMutation.mutate(selectedDoctor.id); setDetailDialogOpen(false); }}>
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Doctor Application</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            You are about to reject Dr. {selectedDoctor?.name}. This action cannot be undone.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
            sx={{ mt: 2 }}
            helperText="Please provide a detailed reason for rejection"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!rejectReason.trim() || rejectMutation.isPending}
            onClick={() => selectedDoctor && rejectMutation.mutate({ id: selectedDoctor.id, reason: rejectReason })}
          >
            Reject Doctor
          </Button>
        </DialogActions>
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
