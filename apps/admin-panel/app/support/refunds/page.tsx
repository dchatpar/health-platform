'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { DataGrid, Column } from '@/components/common/DataGrid';
import { useQuery } from '@/hooks';
import { api } from '@/services';
import { RefundRequest } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib';

export default function RefundsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data: refundsData, isLoading } = useQuery({
    queryKey: ['refunds', { status: statusFilter }],
    fn: () => api.getRefundRequests({ status: statusFilter === 'all' ? undefined : statusFilter }),
  });

  const refunds = refundsData?.items || [];

  const columns: Column<RefundRequest>[] = [
    {
      id: 'requestNumber',
      label: 'Request #',
      minWidth: 130,
      format: (_, row) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>{row.requestNumber}</Typography>
          <Typography variant="caption" color="text.secondary">{formatDateTime(row.createdAt)}</Typography>
        </Box>
      ),
    },
    {
      id: 'orderNumber',
      label: 'Order',
      minWidth: 130,
    },
    {
      id: 'patientName',
      label: 'Patient',
      minWidth: 130,
    },
    {
      id: 'pharmacyName',
      label: 'Pharmacy',
      minWidth: 150,
    },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 100,
      align: 'right',
      format: (value) => <Typography fontWeight={600} color="error">{formatCurrency(Number(value))}</Typography>,
    },
    {
      id: 'reason',
      label: 'Reason',
      minWidth: 200,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <Chip label={String(value)} size="small" color={value === 'approved' ? 'success' : value === 'rejected' ? 'error' : 'warning'} sx={{ textTransform: 'capitalize' }} />
      ),
    },
  ];

  const getActions = () => [
    {
      icon: <ApproveIcon />,
      label: 'Approve',
      onClick: (row: RefundRequest) => {
        if (confirm(`Approve refund of ${formatCurrency(row.amount)}?`)) {
          console.log('Approve', row.id);
        }
      },
      color: 'success' as const,
      disabled: (row: RefundRequest) => row.status !== 'pending',
    },
    {
      icon: <RejectIcon />,
      label: 'Reject',
      onClick: (row: RefundRequest) => {
        setSelectedRefund(row);
        setDetailDialogOpen(true);
      },
      color: 'error' as const,
      disabled: (row: RefundRequest) => row.status !== 'pending',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Refund Approvals" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <Button key={status} variant={statusFilter === status ? 'contained' : 'text'} onClick={() => setStatusFilter(status)} sx={{ borderRadius: 0, textTransform: 'capitalize' }}>
                {status}
              </Button>
            ))}
          </Box>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <TextField size="small" placeholder="Search refunds..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ minWidth: 300 }} />
            </Box>
            <DataGrid columns={columns} data={refunds} loading={isLoading} actions={getActions()} emptyMessage="No refunds found" />
          </CardContent>
        </Card>
      </Box>

      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Refund Request</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            You are about to reject refund request {selectedRefund?.requestNumber}.
          </Alert>
          <TextField fullWidth multiline rows={3} label="Rejection Reason" sx={{ mt: 2 }} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained">Reject Refund</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
