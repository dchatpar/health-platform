'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { useQuery } from '@/hooks';
import { api, mockDoctorPayouts, mockPharmacyPayouts } from '@/services';
import { formatCurrency, formatDate } from '@/lib';

export default function FinancialsPage() {
  const [activeTab, setActiveTab] = useState(0);

  const { data: doctorPayouts } = useQuery({
    queryKey: ['payouts', 'doctor'],
    queryFn: () => api.getDoctorPayouts(),
  });

  const { data: pharmacyPayouts } = useQuery({
    queryKey: ['payouts', 'pharmacy'],
    fn: () => api.getPharmacyPayouts(),
  });

  const doctorData = doctorPayouts?.items || mockDoctorPayouts;
  const pharmacyData = pharmacyPayouts?.items || mockPharmacyPayouts;

  const totalDoctorPayouts = doctorData.reduce((acc, p) => acc + p.netAmount, 0);
  const totalPharmacyPayouts = pharmacyData.reduce((acc, p) => acc + p.netAmount, 0);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Financial Management" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MoneyIcon color="success" />
                  <Typography variant="body2" color="text.secondary">Total Doctor Payouts</Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>{formatCurrency(totalDoctorPayouts)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MoneyIcon color="secondary" />
                  <Typography variant="body2" color="text.secondary">Total Pharmacy Payouts</Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>{formatCurrency(totalPharmacyPayouts)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendIcon color="primary" />
                  <Typography variant="body2" color="text.secondary">Platform Commission</Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>{formatCurrency(totalDoctorPayouts * 0.1 + totalPharmacyPayouts * 0.05)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MoneyIcon color="info" />
                  <Typography variant="body2" color="text.secondary">Net Revenue</Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>{formatCurrency(totalDoctorPayouts * 0.1 + totalPharmacyPayouts * 0.05)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Doctor Payouts" />
            <Tab label="Pharmacy Payouts" />
            <Tab label="Settlements" />
          </Tabs>

          <CardContent>
            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <TextField size="small" placeholder="Search..." InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ minWidth: 300 }} />
                  <Button variant="outlined" startIcon={<DownloadIcon />}>Export</Button>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Doctor</TableCell>
                        <TableCell>Specialty</TableCell>
                        <TableCell>Period</TableCell>
                        <TableCell align="right">Prescriptions</TableCell>
                        <TableCell align="right">Total Amount</TableCell>
                        <TableCell align="right">Commission</TableCell>
                        <TableCell align="right">Platform Fee</TableCell>
                        <TableCell align="right">Net Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {doctorData.map((payout) => (
                        <TableRow key={payout.id} hover>
                          <TableCell><Typography variant="subtitle2" fontWeight={600}>{payout.doctorName}</Typography></TableCell>
                          <TableCell>{payout.specialty}</TableCell>
                          <TableCell>{payout.period}</TableCell>
                          <TableCell align="right">{payout.prescriptionsCount}</TableCell>
                          <TableCell align="right">{formatCurrency(payout.totalAmount)}</TableCell>
                          <TableCell align="right">{formatCurrency(payout.commissionAmount)}</TableCell>
                          <TableCell align="right">{formatCurrency(payout.platformFee)}</TableCell>
                          <TableCell align="right"><Typography fontWeight={600}>{formatCurrency(payout.netAmount)}</Typography></TableCell>
                          <TableCell><Chip label={payout.status} size="small" color={payout.status === 'completed' ? 'success' : 'warning'} sx={{ textTransform: 'capitalize' }} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <TextField size="small" placeholder="Search..." InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ minWidth: 300 }} />
                  <Button variant="outlined" startIcon={<DownloadIcon />}>Export</Button>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Pharmacy</TableCell>
                        <TableCell>Period</TableCell>
                        <TableCell align="right">Orders</TableCell>
                        <TableCell align="right">Total Sales</TableCell>
                        <TableCell align="right">Platform Commission</TableCell>
                        <TableCell align="right">Net Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pharmacyData.map((payout) => (
                        <TableRow key={payout.id} hover>
                          <TableCell><Typography variant="subtitle2" fontWeight={600}>{payout.pharmacyName}</Typography></TableCell>
                          <TableCell>{payout.period}</TableCell>
                          <TableCell align="right">{payout.ordersCount}</TableCell>
                          <TableCell align="right">{formatCurrency(payout.totalSales)}</TableCell>
                          <TableCell align="right">{formatCurrency(payout.platformCommission)}</TableCell>
                          <TableCell align="right"><Typography fontWeight={600}>{formatCurrency(payout.netAmount)}</Typography></TableCell>
                          <TableCell><Chip label={payout.status} size="small" color={payout.status === 'completed' ? 'success' : 'warning'} sx={{ textTransform: 'capitalize' }} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {activeTab === 2 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">Settlement reports would be displayed here.</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
