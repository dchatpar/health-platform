'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as OrdersIcon,
  Receipt as ClaimsIcon,
  Warning as WarningIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as DeliveryIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Header } from '@/components/common/Header';
import { useQuery } from '@hooks';
import { api, mockDashboardStats } from '@/services';
import { formatCurrency, formatRelativeTime } from '@/lib';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
}

function KPICard({ title, value, subtitle, icon, trend, color, loading }: KPICardProps) {
  const theme = useTheme();
  const colorValue = theme.palette[color].main;

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          <Skeleton variant="text" width={120} height={40} />
          <Skeleton variant="text" width={80} height={16} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: alpha(colorValue, 0.1),
              color: colorValue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
          {value}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend.value >= 0 ? (
                <ArrowUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <ArrowDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: trend.value >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 600,
                }}
              >
                {Math.abs(trend.value)}%
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function RecentOrdersWidget({ orders, loading }: { orders: any[]; loading?: boolean }) {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      pending: 'warning',
      received: 'info',
      preparing: 'info',
      ready: 'primary',
      assigned: 'primary',
      shipped: 'secondary',
      delivered: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Recent Orders
          </Typography>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Recent Orders
          </Typography>
          <Chip label="View all" size="small" onClick={() => {}} variant="outlined" />
        </Box>

        {orders.slice(0, 5).map((order) => (
          <Box
            key={order.id}
            sx={{
              py: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              cursor: 'pointer',
              '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.04) },
              borderRadius: 1,
              px: 1,
              mx: -1,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {order.orderNumber}
              </Typography>
              <Chip
                label={order.status}
                size="small"
                color={getStatusColor(order.status)}
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {order.patientName}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatCurrency(order.total)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(order.receivedAt)}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

function LowStockWidget({ alerts, loading }: { alerts: any[]; loading?: boolean }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Low Stock Alerts
          </Typography>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon sx={{ color: 'warning.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Low Stock
            </Typography>
          </Box>
          <Chip label={`${alerts.length} items`} size="small" color="warning" />
        </Box>

        {alerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">All stock levels are healthy</Typography>
          </Box>
        ) : (
          alerts.map((alert) => (
            <Box
              key={alert.id}
              sx={{
                py: 1.5,
                borderBottom: 1,
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.04) },
                borderRadius: 1,
                px: 1,
                mx: -1,
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                {alert.name}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="error.main">
                  Only {alert.stock} left
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Min: {alert.minStock}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function SalesChart({ data, loading }: { data: number[]; loading?: boolean }) {
  const theme = useTheme();
  const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => ({
    day,
    sales: data[index] || 0,
  }));

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={250} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          Weekly Sales Trend
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
              formatter={(value: number) => [formatCurrency(value), 'Sales']}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function PendingClaimsWidget({ claims, loading }: { claims: any[]; loading?: boolean }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Pending Claims
          </Typography>
          {[1, 2].map((i) => (
            <Box key={i} sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon sx={{ color: 'info.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Claims
            </Typography>
          </Box>
          <Chip label={`${claims.length} pending`} size="small" color="info" />
        </Box>

        {claims.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No pending claims</Typography>
          </Box>
        ) : (
          claims.map((claim) => (
            <Box
              key={claim.id}
              sx={{
                py: 1.5,
                borderBottom: 1,
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.04) },
                borderRadius: 1,
                px: 1,
                mx: -1,
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                {claim.claimNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {claim.patientName}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="body2" fontWeight={500}>
                  {formatCurrency(claim.totalAmount)}
                </Typography>
                <Chip
                  label={claim.status}
                  size="small"
                  color="info"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </Box>
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboardStats(),
    staleTime: 30000,
  });

  const dashboardData = stats || mockDashboardStats;

  const lowStockMedicines = [
    { id: '1', name: 'Ibuprofen 400mg', stock: 15, minStock: 30 },
    { id: '2', name: 'Insulin Glargine', stock: 25, minStock: 20 },
    { id: '3', name: 'Salbutamol Inhaler', stock: 45, minStock: 20 },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Dashboard" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <KPICard
              title="Today's Sales"
              value={formatCurrency(dashboardData.todaySales)}
              subtitle="vs yesterday"
              icon={<MoneyIcon />}
              trend={{ value: 12.5, label: 'vs yesterday' }}
              color="success"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <KPICard
              title="Orders"
              value={dashboardData.todayOrders}
              subtitle={`${dashboardData.pendingOrders} pending`}
              icon={<OrdersIcon />}
              color="primary"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <KPICard
              title="Co-Pay Collected"
              value={formatCurrency(dashboardData.todayCoPay)}
              subtitle="Today's total"
              icon={<TrendingUpIcon />}
              trend={{ value: 8.2, label: 'vs yesterday' }}
              color="secondary"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <KPICard
              title="Pending Claims"
              value={dashboardData.pendingClaims}
              subtitle="Requires attention"
              icon={<ClaimsIcon />}
              color="info"
              loading={isLoading}
            />
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} lg={8}>
            <SalesChart data={dashboardData.weeklySales} loading={isLoading} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <LowStockWidget alerts={lowStockMedicines} loading={isLoading} />
          </Grid>
        </Grid>

        {/* Bottom Row */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <RecentOrdersWidget orders={dashboardData.recentOrders} loading={isLoading} />
          </Grid>
          <Grid item xs={12} md={4}>
            <PendingClaimsWidget
              claims={[
                { id: '1', claimNumber: 'CLM-2024-002', patientName: 'Layla Al-Rashid', totalAmount: 2900, status: 'submitted' },
                { id: '2', claimNumber: 'CLM-2024-003', patientName: 'Ahmed Hassan', totalAmount: 850, status: 'pending' },
              ]}
              loading={isLoading}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
