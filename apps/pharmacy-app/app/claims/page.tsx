'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid,
  Alert,
  Snackbar,
  InputAdornment,
  Tabs,
  Tab,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Send as SubmitIcon,
  Calculate as CalculateIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { DataTable, Column } from '@/components/common/DataTable';
import { useQuery, useMutation, useQueryClient, usePermissions } from '@/hooks';
import { api } from '@/services';
import { Claim, ClaimStatus } from '@/types';
import { formatCurrency, formatDateTime, formatRelativeTime } from '@/lib';

const statusTabs = [
  { value: 'all', label: 'All Claims' },
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ClaimsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [coverageDialogOpen, setCoverageDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const { data: claimsData, isLoading } = useQuery({
    queryKey: ['claims', { status: statusFilter, search: searchQuery }],
    queryFn: () => api.getClaims({ status: statusFilter === 'all' ? undefined : statusFilter, search: searchQuery }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ClaimStatus }) => api.updateClaimStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      setProcessDialogOpen(false);
      setSelectedClaim(null);
      setRejectionReason('');
      setSnackbar({ open: true, message: 'Claim status updated', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to update claim', severity: 'error' });
    },
  });

  const claims = claimsData?.items || [];

  const getStatusChipColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      pending: 'warning',
      submitted: 'info',
      approved: 'success',
      rejected: 'error',
      appealed: 'secondary',
    };
    return colors[status] || 'default';
  };

  const columns: Column<Claim>[] = [
    {
      id: 'claimNumber',
      label: 'Claim #',
      minWidth: 140,
      format: (value, row) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {row.claimNumber}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.orderNumber}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'patientName',
      label: 'Patient',
      minWidth: 140,
    },
    {
      id: 'insuranceProviderName',
      label: 'Insurance',
      minWidth: 150,
    },
    {
      id: 'totalAmount',
      label: 'Claim Amount',
      minWidth: 120,
      align: 'right',
      format: (value) => formatCurrency(Number(value)),
    },
    {
      id: 'coveredAmount',
      label: 'Covered',
      minWidth: 100,
      align: 'right',
      format: (value) => formatCurrency(Number(value)),
    },
    {
      id: 'coPay',
      label: 'Co-Pay',
      minWidth: 80,
      align: 'right',
      format: (value) => formatCurrency(Number(value)),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      format: (value) => (
        <Chip
          label={String(value)}
          size="small"
          color={getStatusChipColor(String(value))}
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Created',
      minWidth: 120,
      format: (value) => formatRelativeTime(String(value)),
    },
  ];

  const getActions = (claim: Claim) => {
    const actions = [];

    if (hasPermission('view_claims')) {
      actions.push({
        icon: <ViewIcon />,
        label: 'View Details',
        onClick: () => {
          setSelectedClaim(claim);
          setDetailDialogOpen(true);
        },
        color: 'default' as const,
      });
    }

    if (hasPermission('process_claims')) {
      if (claim.status === 'pending') {
        actions.push({
          icon: <SubmitIcon />,
          label: 'Submit Claim',
          onClick: () => {
            setSelectedClaim(claim);
            updateStatusMutation.mutate({ id: claim.id, status: 'submitted' });
          },
          color: 'info' as const,
        });
      }

      if (['pending', 'submitted'].includes(claim.status)) {
        actions.push({
          icon: <CalculateIcon />,
          label: 'Calculate Coverage',
          onClick: () => {
            setSelectedClaim(claim);
            setCoverageDialogOpen(true);
          },
          color: 'primary' as const,
        });
      }

      if (claim.status === 'submitted') {
        actions.push({
          icon: <ApproveIcon />,
          label: 'Approve',
          onClick: () => {
            setSelectedClaim(claim);
            updateStatusMutation.mutate({ id: claim.id, status: 'approved' });
          },
          color: 'success' as const,
        });
        actions.push({
          icon: <RejectIcon />,
          label: 'Reject',
          onClick: () => {
            setSelectedClaim(claim);
            setProcessDialogOpen(true);
          },
          color: 'error' as const,
        });
      }
    }

    return actions;
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Insurance Claims" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Status Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={statusFilter}
            onChange={(_, v) => setStatusFilter(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {statusTabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={
                  tab.value !== 'all' ? (
                    <Chip
                      badgeContent={claims.filter((c) => c.status === tab.value).length}
                      color="primary"
                      max={99}
                    />
                  ) : undefined
                }
                iconPosition="start"
              />
            ))}
          </Tabs>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by claim # or patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Claims Table */}
        <DataTable
          columns={columns}
          data={claims}
          loading={isLoading}
          actions={getActions(claims[0] || null)}
          searchPlaceholder="Search claims..."
          emptyMessage="No claims found"
        />
      </Box>

      {/* Claim Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Claim {selectedClaim?.claimNumber}</span>
            <Chip
              label={selectedClaim?.status}
              color={getStatusChipColor(selectedClaim?.status || '')}
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedClaim && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Patient Information
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedClaim.patientName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Patient ID: {selectedClaim.patientId}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Insurance Information
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedClaim.insuranceProviderName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Policy: {selectedClaim.policyNumber}
                </Typography>
                {selectedClaim.groupNumber && (
                  <Typography variant="body2" color="text.secondary">
                    Group: {selectedClaim.groupNumber}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Claim Items
                </Typography>
                <Paper variant="outlined">
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Medicine
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="caption" color="text.secondary">
                          Qty
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">
                          Price
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">
                          Coverage
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">
                          Co-Pay
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  <Divider />
                  {selectedClaim.items.map((item, index) => (
                    <Box key={index} sx={{ p: 2, borderBottom: index < selectedClaim.items.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={4}>
                          <Typography variant="body2">{item.medicineName}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="body2">{item.quantity}</Typography>
                        </Grid>
                        <Grid item xs={2} sx={{ textAlign: 'right' }}>
                          <Typography variant="body2">{formatCurrency(item.total)}</Typography>
                        </Grid>
                        <Grid item xs={2} sx={{ textAlign: 'right' }}>
                          <Chip
                            label={`${item.coveragePercentage}%`}
                            size="small"
                            color={item.covered ? 'success' : 'error'}
                          />
                        </Grid>
                        <Grid item xs={2} sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" fontWeight={500}>
                            {formatCurrency(item.coPayAmount)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Box sx={{ textAlign: 'right', minWidth: 200 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography variant="body2">{formatCurrency(selectedClaim.totalAmount)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Deductible
                      </Typography>
                      <Typography variant="body2">{formatCurrency(selectedClaim.deductible)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="success.main">
                        Covered Amount
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        {formatCurrency(selectedClaim.coveredAmount)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">Patient Co-Pay</Typography>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {formatCurrency(selectedClaim.coPay)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {selectedClaim.rejectionReason && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Rejection Reason</Typography>
                    <Typography variant="body2">{selectedClaim.rejectionReason}</Typography>
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" startIcon={<DownloadIcon />}>
                    Download Documents
                  </Button>
                  {selectedClaim.status === 'rejected' && (
                    <Button variant="outlined" color="warning" startIcon={<SubmitIcon />}>
                      Submit Appeal
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          {selectedClaim?.status === 'submitted' && hasPermission('process_claims') && (
            <>
              <Button
                color="error"
                variant="outlined"
                onClick={() => {
                  setDetailDialogOpen(false);
                  setProcessDialogOpen(true);
                }}
              >
                Reject
              </Button>
              <Button
                color="success"
                variant="contained"
                onClick={() => {
                  updateStatusMutation.mutate({ id: selectedClaim!.id, status: 'approved' });
                  setDetailDialogOpen(false);
                }}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={processDialogOpen} onClose={() => setProcessDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Claim</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              You are about to reject claim {selectedClaim?.claimNumber}. This action will notify the patient.
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              helperText="Please provide a detailed reason for rejection"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!rejectionReason.trim() || updateStatusMutation.isPending}
            onClick={() =>
              selectedClaim &&
              updateStatusMutation.mutate({
                id: selectedClaim.id,
                status: 'rejected',
              })
            }
          >
            Reject Claim
          </Button>
        </DialogActions>
      </Dialog>

      {/* Coverage Calculator Dialog */}
      <Dialog open={coverageDialogOpen} onClose={() => setCoverageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Coverage Calculator</DialogTitle>
        <DialogContent>
          {selectedClaim && (
            <Box sx={{ py: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Use this tool to calculate patient co-pay based on coverage rules.
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Insurance Provider</InputLabel>
                    <Select label="Insurance Provider" value={selectedClaim.insuranceProviderId}>
                      <MenuItem value={selectedClaim.insuranceProviderId}>
                        {selectedClaim.insuranceProviderName}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Amount"
                    value={selectedClaim.totalAmount}
                    type="number"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Deductible"
                    value={selectedClaim.deductible}
                    type="number"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Coverage Breakdown
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {selectedClaim.items.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1,
                          pb: 1,
                          borderBottom:
                            index < selectedClaim.items.length - 1 ? 1 : 0,
                          borderColor: 'divider',
                        }}
                      >
                        <Box>
                          <Typography variant="body2">{item.medicineName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.coveragePercentage}% coverage
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="success.main">
                            Covered: {formatCurrency(item.coveredAmount)}
                          </Typography>
                          <Typography variant="body2" color="error.main">
                            Co-Pay: {formatCurrency(item.coPayAmount)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="subtitle1">Total Covered</Typography>
                    <Typography variant="subtitle1" color="success.main" fontWeight={700}>
                      {formatCurrency(selectedClaim.coveredAmount)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1">Total Co-Pay</Typography>
                    <Typography variant="subtitle1" color="error.main" fontWeight={700}>
                      {formatCurrency(selectedClaim.coPay)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCoverageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
