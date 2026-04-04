'use client';

import { useState, useCallback } from 'react';
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Verified as VerifiedIcon,
  LocalPharmacy as PharmacyIcon,
  FileCsv as CsvIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { DataGrid, Column } from '@/components/common/DataGrid';
import { useQuery, useMutation, useQueryClient } from '@/hooks';
import { api } from '@/services';
import { Pharmacy } from '@/types';
import { formatDateTime, getApprovalStatusColor } from '@/lib';

export default function PharmaciesPage() {
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  const queryClient = useQueryClient();

  const { data: pharmaciesData, isLoading, isError, error } = useQuery({
    queryKey: ['pharmacies', { approvalStatus: approvalFilter }],
    queryFn: () => api.getPharmacies({ approvalStatus: approvalFilter === 'all' ? undefined : approvalFilter }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.approvePharmacy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      setDetailDialogOpen(false);
      setSelectedPharmacy(null);
      showSnackbar('Pharmacy approved successfully');
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Failed to approve pharmacy', 'error');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.rejectPharmacy(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      setRejectDialogOpen(false);
      setSelectedPharmacy(null);
      setRejectReason('');
      showSnackbar('Pharmacy rejected');
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Failed to reject pharmacy', 'error');
    },
  });

  const pharmacies = pharmaciesData?.items || [];

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const exportToCSV = useCallback(() => {
    const headers = ['Name', 'Email', 'Phone', 'License Number', 'City', 'State', 'Status', 'Rating', 'Applied Date'];
    const csvContent = [
      headers.join(','),
      ...pharmacies.map((p) =>
        [
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.email || ''}"`,
          `"${p.phone}"`,
          `"${p.licenseNumber}"`,
          `"${p.address.city}"`,
          `"${p.address.state}"`,
          `"${p.approvalStatus}"`,
          `${p.rating || 0}`,
          `"${formatDateTime(p.createdAt)}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pharmacies_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSnackbar('Pharmacies exported successfully');
    handleExportMenuClose();
  }, [pharmacies]);

  const exportToPDF = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showSnackbar('Unable to open print window. Please check your popup blocker settings.', 'error');
      return;
    }

    const pendingCount = pharmacies.filter((p) => p.approvalStatus === 'pending').length;
    const approvedCount = pharmacies.filter((p) => p.approvalStatus === 'approved').length;
    const rejectedCount = pharmacies.filter((p) => p.approvalStatus === 'rejected').length;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pharmacy Approvals Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #1976d2; margin-bottom: 10px; }
            .summary { display: flex; gap: 20px; margin-bottom: 20px; }
            .summary-item { padding: 10px 20px; background: #f5f5f5; border-radius: 4px; }
            .summary-item h3 { margin: 0; font-size: 24px; }
            .summary-item p { margin: 5px 0 0 0; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
            .status-pending { color: #ed6c02; }
            .status-approved { color: #2e7d32; }
            .status-rejected { color: #d32f2f; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>Pharmacy Approvals Report</h1>
          <p>Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div class="summary">
            <div class="summary-item">
              <h3>${pendingCount}</h3>
              <p>Pending</p>
            </div>
            <div class="summary-item">
              <h3>${approvedCount}</h3>
              <p>Approved</p>
            </div>
            <div class="summary-item">
              <h3>${rejectedCount}</h3>
              <p>Rejected</p>
            </div>
            <div class="summary-item">
              <h3>${pharmacies.length}</h3>
              <p>Total</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Pharmacy</th>
                <th>License Number</th>
                <th>Location</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Applied Date</th>
              </tr>
            </thead>
            <tbody>
              ${pharmacies.map((p) => `
                <tr>
                  <td>
                    <strong>${p.name}</strong><br/>
                    <small>${p.email || 'N/A'}</small>
                  </td>
                  <td>${p.licenseNumber}</td>
                  <td>${p.address.city}, ${p.address.state}</td>
                  <td>${p.phone}</td>
                  <td class="status-${p.approvalStatus}">${p.approvalStatus.charAt(0).toUpperCase() + p.approvalStatus.slice(1)}</td>
                  <td>${formatDateTime(p.createdAt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    showSnackbar('PDF generation started');
    handleExportMenuClose();
  }, [pharmacies]);

  const handleExport = (format: string) => {
    if (format === 'csv') {
      exportToCSV();
    } else if (format === 'pdf') {
      exportToPDF();
    }
  };

  const columns: Column<Pharmacy>[] = [
    {
      id: 'name',
      label: 'Pharmacy',
      minWidth: 220,
      format: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
            <PharmacyIcon />
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
      id: 'licenseNumber',
      label: 'License',
      minWidth: 150,
    },
    {
      id: 'address',
      label: 'Location',
      minWidth: 180,
      format: (_, row) => `${row.address.city}, ${row.address.state}`,
    },
    {
      id: 'phone',
      label: 'Phone',
      minWidth: 130,
    },
    {
      id: 'services',
      label: 'Services',
      minWidth: 150,
      format: (value) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(value as string[]).slice(0, 2).map((service) => (
            <Chip key={service} label={service} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
          ))}
          {(value as string[]).length > 2 && (
            <Chip label={`+${(value as string[]).length - 2}`} size="small" />
          )}
        </Box>
      ),
    },
    {
      id: 'rating',
      label: 'Rating',
      minWidth: 100,
      format: (value) => (value ? `${Number(value).toFixed(1)}` : 'New'),
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
      onClick: (row: Pharmacy) => {
        setSelectedPharmacy(row);
        setDetailDialogOpen(true);
      },
      color: 'default' as const,
    },
    {
      icon: <ApproveIcon />,
      label: 'Approve',
      onClick: (row: Pharmacy) => {
        if (confirm(`Are you sure you want to approve ${row.name}?`)) {
          approveMutation.mutate(row.id);
        }
      },
      color: 'success' as const,
      disabled: (row: Pharmacy) => row.approvalStatus !== 'pending' || approveMutation.isPending,
    },
    {
      icon: <RejectIcon />,
      label: 'Reject',
      onClick: (row: Pharmacy) => {
        setSelectedPharmacy(row);
        setRejectDialogOpen(true);
      },
      color: 'error' as const,
      disabled: (row: Pharmacy) => row.approvalStatus !== 'pending' || rejectMutation.isPending,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Pharmacy Approvals" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Error Alert */}
        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error instanceof Error ? error.message : 'Failed to load pharmacies'}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
            <Box sx={{ display: 'flex' }}>
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <Button
                  key={status}
                  variant={approvalFilter === status ? 'contained' : 'text'}
                  onClick={() => setApprovalFilter(status)}
                  sx={{ borderRadius: 0, textTransform: 'capitalize' }}
                >
                  {status}
                  {status === 'pending' && pharmacies.filter((p) => p.approvalStatus === 'pending').length > 0 && (
                    <Chip
                      label={pharmacies.filter((p) => p.approvalStatus === 'pending').length}
                      size="small"
                      sx={{ ml: 1 }}
                      color="warning"
                    />
                  )}
                </Button>
              ))}
            </Box>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportMenuOpen}
              sx={{ mr: 1 }}
            >
              Export
            </Button>
            <Menu
              anchorEl={exportMenuAnchor}
              open={Boolean(exportMenuAnchor)}
              onClose={handleExportMenuClose}
            >
              <MenuItem onClick={() => handleExport('csv')}>
                <ListItemIcon>
                  <CsvIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export as CSV</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleExport('pdf')}>
                <ListItemIcon>
                  <PdfIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export as PDF</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
          <CardContent>
            <DataGrid
              columns={columns}
              data={pharmacies}
              loading={isLoading}
              actions={getActions()}
              emptyMessage="No pharmacies found"
            />
          </CardContent>
        </Card>
      </Box>

      {/* Pharmacy Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Pharmacy Details</DialogTitle>
        <DialogContent dividers>
          {selectedPharmacy && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'secondary.main', mx: 'auto', mb: 2 }}>
                    <PharmacyIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedPharmacy.name}
                  </Typography>
                  <Chip
                    label={selectedPharmacy.approvalStatus}
                    color={getApprovalStatusColor(selectedPharmacy.approvalStatus)}
                    sx={{ textTransform: 'capitalize', mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{selectedPharmacy.email || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{selectedPharmacy.phone}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">License Number</Typography>
                    <Typography variant="body1">{selectedPharmacy.licenseNumber}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Address</Typography>
                    <Typography variant="body1">
                      {selectedPharmacy.address.street}
                      <br />
                      {selectedPharmacy.address.city}, {selectedPharmacy.address.state} {selectedPharmacy.address.postalCode}
                      <br />
                      {selectedPharmacy.address.country}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Services</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      {selectedPharmacy.services.map((service) => (
                        <Chip key={service} label={service} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">Operating Hours</Typography>
                    {selectedPharmacy.is24Hours ? (
                      <Chip label="24 Hours" color="primary" sx={{ mt: 0.5 }} />
                    ) : (
                      <Box sx={{ mt: 0.5 }}>
                        {Object.entries(selectedPharmacy.operatingHours).map(([day, hours]) => (
                          <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{day}</Typography>
                            <Typography variant="body2">
                              {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          {selectedPharmacy?.approvalStatus === 'pending' && (
            <>
              <Button color="error" onClick={() => { setDetailDialogOpen(false); setRejectDialogOpen(true); }}>
                Reject
              </Button>
              <Button
                color="success"
                variant="contained"
                onClick={() => { approveMutation.mutate(selectedPharmacy.id); }}
                disabled={approveMutation.isPending}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Pharmacy Application</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            You are about to reject {selectedPharmacy?.name}. This action cannot be undone.
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
            error={rejectReason.trim().length === 0 && rejectDialogOpen}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!rejectReason.trim() || rejectMutation.isPending}
            onClick={() => selectedPharmacy && rejectMutation.mutate({ id: selectedPharmacy.id, reason: rejectReason })}
          >
            Reject Pharmacy
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