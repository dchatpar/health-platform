'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  useMediaQuery,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LocalShipping as ShippingIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { useQuery, useMutation, useQueryClient } from '@/hooks';
import { api } from '@/services';
import { Order, Claim, ClaimStatus } from '@/types';
import { formatCurrency, formatDateTime, formatDate, getOrderStatusColor } from '@/lib';

const orderSteps = ['Received', 'Preparing', 'Ready', 'Assigned', 'Shipped', 'Delivered'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.getOrder(id),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) => api.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSnackbar({ open: true, message: 'Order status updated', severity: 'success' });
    },
  });

  const updateClaimStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ClaimStatus }) => api.updateClaimStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      setClaimDialogOpen(false);
      setSnackbar({ open: true, message: 'Claim status updated', severity: 'success' });
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <Header title="Order Details" showMenuButton={false} />
        <Box sx={{ p: 3 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <Header title="Order Details" showMenuButton={false} />
        <Box sx={{ p: 3 }}>
          <Typography>Order not found</Typography>
          <Button startIcon={<BackIcon />} onClick={() => router.push('/orders')} sx={{ mt: 2 }}>
            Back to Orders
          </Button>
        </Box>
      </Box>
    );
  }

  const getActiveStep = () => {
    const statusMap: Record<string, number> = {
      pending: 0,
      received: 1,
      preparing: 2,
      ready: 3,
      assigned: 4,
      shipped: 5,
      delivered: 6,
    };
    return statusMap[order.status] || 0;
  };

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
    };
    return colors[status] || 'default';
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title={`Order ${order.orderNumber}`} showMenuButton={false} />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Back Button */}
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.push('/orders')}
          sx={{ mb: 2 }}
        >
          Back to Orders
        </Button>

        <Grid container spacing={3}>
          {/* Left Column - Order Info */}
          <Grid item xs={12} lg={8}>
            {/* Order Status Stepper */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Order Status
                  </Typography>
                  <Chip
                    label={order.status}
                    color={getStatusChipColor(order.status)}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>

                <Stepper activeStep={getActiveStep()} alternativeLabel={!isMobile}>
                  {orderSteps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {order.status === 'pending' && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckIcon />}
                      onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'received' })}
                    >
                      Receive Order
                    </Button>
                  )}
                  {order.status === 'received' && (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                      >
                        Update Prices
                      </Button>
                      <Button
                        variant="contained"
                        color="info"
                        startIcon={<CheckIcon />}
                        onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'preparing' })}
                      >
                        Start Preparing
                      </Button>
                    </>
                  )}
                  {order.status === 'preparing' && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckIcon />}
                      onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'ready' })}
                    >
                      Mark Ready
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ShippingIcon />}
                    >
                      Assign Delivery
                    </Button>
                  )}
                  {order.status === 'assigned' && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ShippingIcon />}
                      onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'shipped' })}
                    >
                      Mark Shipped
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckIcon />}
                      onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'delivered' })}
                    >
                      Mark Delivered
                    </Button>
                  )}
                  {!['delivered', 'cancelled'].includes(order.status) && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this order?')) {
                          updateStatusMutation.mutate({ id: order.id, status: 'cancelled' });
                        }
                      }}
                    >
                      Cancel Order
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Order Items
                </Typography>
                <Paper variant="outlined">
                  {order.items.map((item, index) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 2,
                        borderBottom: index < order.items.length - 1 ? 1 : 0,
                        borderColor: 'divider',
                      }}
                    >
                      <Grid container alignItems="center" justifyContent="space-between">
                        <Grid item xs={8}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {item.medicineName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.quantity} x {formatCurrency(item.unitPrice)}
                            {item.discount > 0 && (
                              <Chip
                                label={`-${formatCurrency(item.discount)}`}
                                size="small"
                                color="success"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                          {item.instructions && (
                            <Typography variant="caption" color="text.secondary">
                              Instructions: {item.instructions}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'right' }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {formatCurrency(item.total)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Paper>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Box sx={{ textAlign: 'right', minWidth: 200 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Subtotal
                      </Typography>
                      <Typography variant="body2">{formatCurrency(order.subtotal)}</Typography>
                    </Box>
                    {order.discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Discount
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          -{formatCurrency(order.discount)}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Insurance Coverage
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        -{formatCurrency(order.insuranceCoverage)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Delivery Fee
                      </Typography>
                      <Typography variant="body2">{formatCurrency(order.deliveryFee)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(order.total)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="success.main">
                        Patient Co-Pay
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        {formatCurrency(order.coPay)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Insurance Claim Section */}
            {order.insuranceClaimId && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ReceiptIcon />
                      <Typography variant="h6" fontWeight={600}>
                        Insurance Claim
                      </Typography>
                    </Box>
                    <Chip
                      label={order.claimStatus}
                      color={order.claimStatus === 'approved' ? 'success' : order.claimStatus === 'rejected' ? 'error' : 'warning'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Claim Number
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {order.insuranceClaimId}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Claim Amount
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatCurrency(order.insuranceCoverage)}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ReceiptIcon />}
                      onClick={() => setClaimDialogOpen(true)}
                    >
                      Process Claim
                    </Button>
                    <Button variant="outlined" startIcon={<DownloadIcon />}>
                      Download Documents
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Notes
                  </Typography>
                  <Typography variant="body2">{order.notes}</Typography>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right Column - Customer & Delivery Info */}
          <Grid item xs={12} lg={4}>
            {/* Patient Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Patient Info
                  </Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {order.patientName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2">{order.patientPhone}</Typography>
                </Box>
                {order.doctorName && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Prescribing Doctor
                    </Typography>
                    <Typography variant="body1">{order.doctorName}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Delivery Info */}
            {order.deliveryAddress && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <ShippingIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Delivery
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {order.deliveryAddress.street}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.deliveryAddress.country}
                  </Typography>

                  {order.deliveryPartner && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Partner
                          </Typography>
                          <Typography variant="body1">{order.deliveryPartner}</Typography>
                        </Grid>
                        {order.deliveryPartnerPhone && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Contact
                            </Typography>
                            <Typography variant="body1">{order.deliveryPartnerPhone}</Typography>
                          </Grid>
                        )}
                      </Grid>
                    </>
                  )}

                  {order.deliveryEstimatedTime && (
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={`Est. ${order.deliveryEstimatedTime}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Timeline
                </Typography>
                <List dense disablePadding>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemText
                      primary={formatDateTime(order.createdAt)}
                      secondary="Order created"
                      primaryTypographyProps={{ variant: 'caption' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemText
                      primary={formatDateTime(order.receivedAt)}
                      secondary="Order received"
                      primaryTypographyProps={{ variant: 'caption' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  {order.preparedAt && (
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemText
                        primary={formatDateTime(order.preparedAt)}
                        secondary="Order prepared"
                        primaryTypographyProps={{ variant: 'caption' }}
                        secondaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  )}
                  {order.assignedAt && (
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemText
                        primary={formatDateTime(order.assignedAt)}
                        secondary="Delivery assigned"
                        primaryTypographyProps={{ variant: 'caption' }}
                        secondaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  )}
                  {order.shippedAt && (
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemText
                        primary={formatDateTime(order.shippedAt)}
                        secondary="Order shipped"
                        primaryTypographyProps={{ variant: 'caption' }}
                        secondaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  )}
                  {order.deliveredAt && (
                    <ListItem disablePadding>
                      <ListItemText
                        primary={formatDateTime(order.deliveredAt)}
                        secondary="Order delivered"
                        primaryTypographyProps={{ variant: 'caption' }}
                        secondaryTypographyProps={{ variant: 'body2', color: 'success.main' }}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Claim Processing Dialog */}
      <Dialog open={claimDialogOpen} onClose={() => setClaimDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Insurance Claim</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Claim {order.insuranceClaimId} is currently pending processing.
            </Alert>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Choose an action for this claim:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => updateClaimStatusMutation.mutate({ id: order.insuranceClaimId!, status: 'approved' })}
              >
                Approve Claim
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => updateClaimStatusMutation.mutate({ id: order.insuranceClaimId!, status: 'rejected' })}
              >
                Reject Claim
              </Button>
              <Button
                variant="outlined"
                onClick={() => updateClaimStatusMutation.mutate({ id: order.insuranceClaimId!, status: 'submitted' })}
              >
                Submit to Insurance
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClaimDialogOpen(false)}>Cancel</Button>
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
