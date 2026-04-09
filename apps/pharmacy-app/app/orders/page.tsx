'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Alert,
  Snackbar,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { DataTable, Column } from '@/components/common/DataTable';
import { useQuery, usePermissions } from '@/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatDateTime, formatRelativeTime, getOrderStatusColor } from '@/lib';

const statusTabs = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'received', label: 'Received' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
];

export default function OrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', { status: statusFilter, search: searchQuery }],
    queryFn: () => api.getOrders({ status: statusFilter === 'all' ? undefined : statusFilter, search: searchQuery }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => api.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setStatusDialogOpen(false);
      setSelectedOrder(null);
      setSnackbar({ open: true, message: 'Order status updated', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to update order', severity: 'error' });
    },
  });

  const orders = (ordersData?.items || []) as Order[];

  const getStatusChipColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      pending: 'warning',
      received: 'info',
      preparing: 'info',
      ready: 'primary',
      assigned: 'secondary',
      shipped: 'secondary',
      delivered: 'success',
      cancelled: 'error',
      returned: 'error',
    };
    return colors[status] || 'default';
  };

  const columns: Column<Order>[] = [
    {
      id: 'orderNumber',
      label: 'Order #',
      minWidth: 130,
      format: (value, row) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {row.orderNumber}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatRelativeTime(row.receivedAt)}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'patientName',
      label: 'Patient',
      minWidth: 150,
      format: (value, row) => (
        <Box>
          <Typography variant="body2">{row.patientName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.patientPhone}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'items',
      label: 'Items',
      minWidth: 80,
      format: (_, row) => (
        <Chip label={`${row.items.length} items`} size="small" variant="outlined" />
      ),
    },
    {
      id: 'total',
      label: 'Total',
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
      id: 'priority',
      label: 'Priority',
      minWidth: 80,
      format: (value) =>
        value === 'urgent' ? (
          <Chip label="Urgent" size="small" color="error" />
        ) : (
          <Chip label="Normal" size="small" variant="outlined" />
        ),
    },
    {
      id: 'source',
      label: 'Source',
      minWidth: 80,
      format: (value) => (
        <Chip
          label={String(value)}
          size="small"
          variant="outlined"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
  ];

  const getActions = (order: Order) => {
    const actions = [];

    if (hasPermission('view_orders')) {
      actions.push({
        icon: <ViewIcon />,
        label: 'View Details',
        onClick: () => {
          setSelectedOrder(order);
          setDetailDialogOpen(true);
        },
        color: 'default' as const,
      });
    }

    if (hasPermission('update_order')) {
      if (order.status === 'pending') {
        actions.push({
          icon: <CheckIcon />,
          label: 'Receive Order',
          onClick: () => {
            setSelectedOrder(order);
            updateStatusMutation.mutate({ id: order.id, status: 'received' });
          },
          color: 'success' as const,
        });
      }

      if (order.status === 'received') {
        actions.push({
          icon: <EditIcon />,
          label: 'Update Price',
          onClick: () => {
            setSelectedOrder(order);
            setPriceDialogOpen(true);
          },
          color: 'primary' as const,
        });
        actions.push({
          icon: <CheckIcon />,
          label: 'Start Preparing',
          onClick: () => {
            updateStatusMutation.mutate({ id: order.id, status: 'preparing' });
          },
          color: 'info' as const,
        });
      }

      if (order.status === 'preparing') {
        actions.push({
          icon: <CheckIcon />,
          label: 'Mark Ready',
          onClick: () => {
            updateStatusMutation.mutate({ id: order.id, status: 'ready' });
          },
          color: 'success' as const,
        });
      }

      if (order.status === 'ready') {
        actions.push({
          icon: <ShippingIcon />,
          label: 'Assign Delivery',
          onClick: () => {
            setSelectedOrder(order);
            setAssignDialogOpen(true);
          },
          color: 'primary' as const,
        });
      }

      if (order.status === 'assigned' || order.status === 'shipped') {
        actions.push({
          icon: <ShippingIcon />,
          label: order.status === 'assigned' ? 'Mark Shipped' : 'Mark Delivered',
          onClick: () => {
            const newStatus = order.status === 'assigned' ? 'shipped' : 'delivered';
            updateStatusMutation.mutate({ id: order.id, status: newStatus });
          },
          color: 'success' as const,
        });
      }
    }

    if (hasPermission('cancel_order') && !['delivered', 'cancelled'].includes(order.status)) {
      actions.push({
        icon: <CancelIcon />,
        label: 'Cancel Order',
        onClick: () => {
          if (confirm('Are you sure you want to cancel this order?')) {
            updateStatusMutation.mutate({ id: order.id, status: 'cancelled' });
          }
        },
        color: 'error' as const,
      });
    }

    return actions;
  };

  const handleViewDetails = (order: Order) => {
    router.push(`/orders/${order.id}`);
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Orders" />

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
                    <Badge
                      badgeContent={
                        orders.filter((o) => o.status === tab.value).length
                      }
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
                  placeholder="Search by order # or patient..."
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

        {/* Orders Table */}
        <DataTable
          columns={columns}
          data={orders}
          loading={isLoading}
          actions={[]}
          onRowClick={handleViewDetails}
          searchPlaceholder="Search orders..."
          emptyMessage="No orders found"
        />
      </Box>

      {/* Order Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Order {selectedOrder?.orderNumber}</span>
            <Chip
              label={selectedOrder?.status}
              color={getStatusChipColor(selectedOrder?.status || '')}
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Patient Information
                </Typography>
                <Typography variant="body1">{selectedOrder.patientName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOrder.patientPhone}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Order Details
                </Typography>
                <Typography variant="body2">
                  Received: {formatDateTime(selectedOrder.receivedAt)}
                </Typography>
                {selectedOrder.doctorName && (
                  <Typography variant="body2">Doctor: {selectedOrder.doctorName}</Typography>
                )}
                <Typography variant="body2">Source: {selectedOrder.source}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Items
                </Typography>
                <Paper variant="outlined">
                  {selectedOrder.items.map((item, index) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 2,
                        borderBottom: index < selectedOrder.items.length - 1 ? 1 : 0,
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant="body2">{item.medicineName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Qty: {item.quantity} x {formatCurrency(item.unitPrice)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(item.total)}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal: {formatCurrency(selectedOrder.subtotal)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Discount: -{formatCurrency(selectedOrder.discount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Insurance: -{formatCurrency(selectedOrder.insuranceCoverage)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Delivery: {formatCurrency(selectedOrder.deliveryFee)}
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      Total: {formatCurrency(selectedOrder.total)}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      Co-Pay: {formatCurrency(selectedOrder.coPay)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setDetailDialogOpen(false);
              router.push(`/orders/${selectedOrder?.id}`);
            }}
          >
            View Full Details
          </Button>
        </DialogActions>
      </Dialog>

      {/* Price Update Dialog */}
      <Dialog open={priceDialogOpen} onClose={() => setPriceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Prices</DialogTitle>
        <DialogContent>
          <Typography sx={{ py: 2 }}>
            Price updates for order {selectedOrder?.orderNumber} would be handled here.
            This typically involves adjusting individual item prices or applying discounts.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setPriceDialogOpen(false)}>
            Update Prices
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Delivery Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Delivery Partner</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Delivery Partner</InputLabel>
              <Select label="Delivery Partner">
                <MenuItem value="smsa">SMSA Express</MenuItem>
                <MenuItem value="aramex">Aramex</MenuItem>
                <MenuItem value="dhl">DHL</MenuItem>
                <MenuItem value="naqel">Naqel</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Partner Contact"
              defaultValue="+966555123456"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Estimated Delivery Time"
              defaultValue="45 mins"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              updateStatusMutation.mutate({ id: selectedOrder!.id, status: 'assigned' });
              setAssignDialogOpen(false);
            }}
          >
            Assign & Ready for Pickup
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
