'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Search as SearchIcon,
  TrendingUp as TrendIcon,
} from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Header } from '@/components/common/Header';
import { useTheme } from '@mui/material';
import { formatCurrency } from '@/lib';

export default function CommissionsPage() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const chartData = [
    { month: 'Jan', commission: 45000 },
    { month: 'Feb', commission: 52000 },
    { month: 'Mar', commission: 48000 },
    { month: 'Apr', commission: 61000 },
    { month: 'May', commission: 55000 },
    { month: 'Jun', commission: 67000 },
  ];

  const commissionData = [
    { id: '1', specialty: 'General Practice', prescriptions: 1250, totalSales: 375000, commissionRate: 10, commissionAmount: 37500 },
    { id: '2', specialty: 'Internal Medicine', prescriptions: 890, totalSales: 445000, commissionRate: 12, commissionAmount: 53400 },
    { id: '3', specialty: 'Cardiology', prescriptions: 340, totalSales: 510000, commissionRate: 15, commissionAmount: 76500 },
    { id: '4', specialty: 'Dermatology', prescriptions: 560, totalSales: 224000, commissionRate: 12, commissionAmount: 26880 },
    { id: '5', specialty: 'Pediatrics', prescriptions: 720, totalSales: 216000, commissionRate: 10, commissionAmount: 21600 },
  ];

  const totalCommission = commissionData.reduce((acc, item) => acc + item.commissionAmount, 0);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Platform Commission Tracking" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Summary */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Total Commission (YTD)</Typography>
                <Typography variant="h4" fontWeight={700}>{formatCurrency(totalCommission * 6)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>This Month</Typography>
                <Typography variant="h4" fontWeight={700}>{formatCurrency(totalCommission)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Pending Payouts</Typography>
                <Typography variant="h4" fontWeight={700}>{formatCurrency(totalCommission * 0.15)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Avg Commission Rate</Typography>
                <Typography variant="h4" fontWeight={700}>11.8%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Chart */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Commission Trend</Typography>
              </Box>
              <Button variant="outlined" startIcon={<DownloadIcon />}>Export</Button>
            </Box>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                <RechartsTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }} formatter={(value: number) => [formatCurrency(value), 'Commission']} />
                <Area type="monotone" dataKey="commission" stroke={theme.palette.primary.main} strokeWidth={2} fillOpacity={1} fill="url(#colorCommission)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Commission by Specialty */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Commission by Specialty</Typography>
              <TextField size="small" placeholder="Search..." InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ minWidth: 300 }} />
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Specialty</TableCell>
                    <TableCell align="right">Prescriptions</TableCell>
                    <TableCell align="right">Total Sales</TableCell>
                    <TableCell align="right">Commission Rate</TableCell>
                    <TableCell align="right">Commission Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commissionData.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell><Typography variant="subtitle2" fontWeight={600}>{item.specialty}</Typography></TableCell>
                      <TableCell align="right">{item.prescriptions.toLocaleString()}</TableCell>
                      <TableCell align="right">{formatCurrency(item.totalSales)}</TableCell>
                      <TableCell align="right"><Chip label={`${item.commissionRate}%`} size="small" color="primary" /></TableCell>
                      <TableCell align="right"><Typography fontWeight={600} color="primary">{formatCurrency(item.commissionAmount)}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
