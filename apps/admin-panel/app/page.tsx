'use client';

import { useState } from 'react';
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
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  LocalPharmacy as PharmacyIcon,
  MedicalServices as DoctorIcon,
  ShoppingCart as OrdersIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  SupportAgent as SupportIcon,
  Security as SecurityIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Header } from '@/components/common/Header';
import { useQuery } from '@/hooks';
import { api, mockPlatformStats } from '@/services';
import { formatCurrency, formatNumber } from '@/lib';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
  to?: string;
  onClick?: () => void;
}

function StatCard({ title, value, subtitle, icon, trend, color, loading, to, onClick }: StatCardProps) {
  const theme = useTheme();
  const colorValue = theme.palette[color].main;

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
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
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        } : {},
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

function AlertsWidget({ alerts, loading }: { alerts: any[]; loading?: boolean }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Active Alerts
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
              Active Alerts
            </Typography>
          </Box>
          <Chip label={`${alerts.length} alerts`} size="small" color="warning" />
        </Box>

        {alerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No active alerts</Typography>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {alert.type}
                </Typography>
                <Chip
                  label={alert.severity}
                  size="small"
                  color={alert.severity === 'critical' || alert.severity === 'high' ? 'error' : 'warning'}
                  sx={{ fontSize: '0.7rem', height: 20, textTransform: 'capitalize' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {alert.userName}
              </Typography>
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function SupportTicketsWidget({ tickets, loading }: { tickets: any[]; loading?: boolean }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Open Tickets
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SupportIcon sx={{ color: 'info.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Open Tickets
            </Typography>
          </Box>
          <Chip label={`${tickets.length} tickets`} size="small" color="info" />
        </Box>

        {tickets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No open tickets</Typography>
          </Box>
        ) : (
          tickets.map((ticket) => (
            <Box
              key={ticket.id}
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
                {ticket.ticketNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {ticket.subject}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {ticket.userName}
                </Typography>
                <Chip
                  label={ticket.priority}
                  size="small"
                  color={ticket.priority === 'urgent' ? 'error' : 'default'}
                  sx={{ fontSize: '0.65rem', height: 18, textTransform: 'capitalize' }}
                />
              </Box>
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ApprovalQueueWidget({ doctors, pharmacies, loading }: { doctors: any[]; pharmacies: any[]; loading?: boolean }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Pending Approvals
          </Typography>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="60%" />
        </CardContent>
      </Card>
    );
  }

  const totalPending = doctors.length + pharmacies.length;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Pending Approvals
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Doctors</Typography>
            <Typography variant="body2" fontWeight={600}>{doctors.length}</Typography>
          </Box>
          <LinearProgress variant="determinate" value={(doctors.length / Math.max(totalPending, 1)) * 100} sx={{ height: 6, borderRadius: 3 }} />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Pharmacies</Typography>
            <Typography variant="body2" fontWeight={600}>{pharmacies.length}</Typography>
          </Box>
          <LinearProgress variant="determinate" value={(pharmacies.length / Math.max(totalPending, 1)) * 100} sx={{ height: 6, borderRadius: 3, bgcolor: 'secondary.main', '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main' } }} />
        </Box>

        <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>
          {totalPending}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Total pending items
        </Typography>
      </CardContent>
    </Card>
  );
}

function RevenueChart({ data, loading }: { data: number[]; loading?: boolean }) {
  const theme = useTheme();
  const chartData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => ({
    month,
    revenue: data[index] || 0,
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
          Platform Revenue
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const theme = useTheme();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getPlatformStats(),
    staleTime: 30000,
  });

  const dashboardData = stats || mockPlatformStats;

  const pendingDoctors = [
    { id: 'D003', name: 'Dr. Mohammed Ali', specialty: 'Cardiology' },
    { id: 'D004', name: 'Dr. Sarah Johnson', specialty: 'Dermatology' },
    { id: 'D005', name: 'Dr. Ahmed Kuwait', specialty: 'Pediatrics' },
  ];

  const pendingPharmacies = [
    { id: 'PH002', name: 'New Care Pharmacy', city: 'Jeddah' },
    { id: 'PH003', name: 'Quick Med Pharmacy', city: 'Dammam' },
  ];

  const revenueData = [1500000, 1650000, 1420000, 1780000, 1850000, 1950000];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Dashboard" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Users"
              value={formatNumber(dashboardData.totalUsers)}
              subtitle={`${dashboardData.totalPatients} patients`}
              icon={<PeopleIcon />}
              trend={{ value: 8.2, label: 'vs last month' }}
              color="primary"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Doctors"
              value={formatNumber(dashboardData.totalDoctors)}
              subtitle="Active physicians"
              icon={<DoctorIcon />}
              trend={{ value: 5.1, label: 'vs last month' }}
              color="secondary"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Pharmacies"
              value={formatNumber(dashboardData.totalPharmacies)}
              subtitle="Partner pharmacies"
              icon={<PharmacyIcon />}
              trend={{ value: 3.2, label: 'vs last month' }}
              color="success"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Orders"
              value={formatNumber(dashboardData.totalOrders)}
              subtitle="All time orders"
              icon={<OrdersIcon />}
              trend={{ value: 15.3, label: 'vs last month' }}
              color="info"
              loading={isLoading}
            />
          </Grid>
        </Grid>

        {/* Financial Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Revenue"
              value={formatCurrency(dashboardData.totalRevenue)}
              subtitle="Platform revenue"
              icon={<MoneyIcon />}
              trend={{ value: 12.5, label: 'vs last month' }}
              color="success"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Monthly Growth"
              value={`${dashboardData.monthlyGrowth}%`}
              subtitle="Growth rate"
              icon={<TrendingUpIcon />}
              trend={{ value: 2.1, label: 'vs last month' }}
              color="primary"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Active Alerts"
              value={dashboardData.activeAlerts}
              subtitle="Requires attention"
              icon={<SecurityIcon />}
              color="warning"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Open Tickets"
              value={dashboardData.openTickets}
              subtitle="Support tickets"
              icon={<SupportIcon />}
              color="info"
              loading={isLoading}
            />
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} lg={8}>
            <RevenueChart data={revenueData} loading={isLoading} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <ApprovalQueueWidget
              doctors={pendingDoctors}
              pharmacies={pendingPharmacies}
              loading={isLoading}
            />
          </Grid>
        </Grid>

        {/* Bottom Row */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <AlertsWidget
              alerts={[
                { id: '1', type: 'Suspicious Order Pattern', severity: 'high', userName: 'User #P1234' },
                { id: '2', type: 'Multiple Failed Payments', severity: 'medium', userName: 'User #P5678' },
                { id: '3', type: 'Unusual Prescription Activity', severity: 'critical', userName: 'User #P9012' },
              ]}
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SupportTicketsWidget
              tickets={[
                { id: '1', ticketNumber: 'TKT-2024-001', subject: 'Billing issue with order', userName: 'Ahmed H.', priority: 'high' },
                { id: '2', ticketNumber: 'TKT-2024-002', subject: 'Refund request for medicine', userName: 'Sara M.', priority: 'medium' },
                { id: '3', ticketNumber: 'TKT-2024-003', subject: 'Cannot login to account', userName: 'Khalid R.', priority: 'urgent' },
              ]}
              loading={isLoading}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
