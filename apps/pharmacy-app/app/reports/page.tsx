'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Download as DownloadIcon,
  InsertDriveFile as CsvIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Header } from '@/components/common/Header';
import { useQuery } from '@/hooks';
import { api, mockSalesReport, mockInventoryAgingReport, mockCommissionReport } from '@/services';
import { formatCurrency, formatDate } from '@/lib';
import { useTheme } from '@mui/material';
import { SalesReport, InventoryAgingReport, CommissionReport } from '@/types';

const reportTabs = [
  { value: 'sales', label: 'Daily Sales' },
  { value: 'inventory', label: 'Inventory Aging' },
  { value: 'commission', label: 'Commission' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const theme = useTheme();

  // Using mock data since API methods don't exist
  const salesLoading = false;
  const inventoryLoading = false;
  const commissionLoading = false;

  const salesReport = mockSalesReport as SalesReport[];
  const inventoryReport = mockInventoryAgingReport as InventoryAgingReport[];
  const commissionReport = mockCommissionReport as CommissionReport[];

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const exportToCSV = useCallback((data: unknown[], filename: string, headers: string[]) => {
    if (!data || data.length === 0) {
      showSnackbar('No data to export', 'error');
      return;
    }

    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => {
          const key = header.toLowerCase().replace(/\s+/g, '_');
          const value = (row as Record<string, unknown>)[key];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSnackbar(`${filename} exported successfully`);
    handleExportMenuClose();
  }, []);

  const exportSalesToCSV = useCallback(() => {
    const data = salesReport.map((row) => ({
      date: row.date,
      total_orders: row.totalOrders,
      total_sales: row.totalSales,
      total_copay: row.totalCoPay,
      total_insurance: row.totalInsurance,
      total_refunds: row.totalRefunds,
    }));
    exportToCSV(data, 'sales_report', ['Date', 'Total Orders', 'Total Sales', 'Total Co-Pay', 'Total Insurance', 'Total Refunds']);
  }, [salesReport, exportToCSV]);

  const exportInventoryToCSV = useCallback(() => {
    const data = inventoryReport.map((row) => ({
      medicine_name: row.medicineName,
      category: row.category,
      current_stock: row.currentStock,
      expiry_date: row.expiryDate,
      days_to_expiry: row.daysToExpiry,
      status: row.status,
    }));
    exportToCSV(data, 'inventory_report', ['Medicine Name', 'Category', 'Current Stock', 'Expiry Date', 'Days to Expiry', 'Status']);
  }, [inventoryReport, exportToCSV]);

  const exportCommissionToCSV = useCallback(() => {
    const data = commissionReport.map((row) => ({
      doctor_name: row.doctorName,
      specialty: row.specialty,
      prescriptions_count: row.prescriptionsCount,
      total_sales: row.totalSales,
      commission_rate: row.commissionRate,
      commission_amount: row.commissionAmount,
      paid_amount: row.paidAmount,
      pending_amount: row.pendingAmount,
    }));
    exportToCSV(data, 'commission_report', ['Doctor Name', 'Specialty', 'Prescriptions', 'Total Sales', 'Commission Rate', 'Commission Amount', 'Paid Amount', 'Pending Amount']);
  }, [commissionReport, exportToCSV]);

  const exportToPDF = useCallback((type: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showSnackbar('Unable to open print window. Please check your popup blocker settings.', 'error');
      return;
    }

    let content = '';
    const title = `${type.charAt(0).toUpperCase() + type.slice(1)} Report`;
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (type === 'sales') {
      const totalSales = salesReport.reduce((acc, r) => acc + r.totalSales, 0);
      const totalOrders = salesReport.reduce((acc, r) => acc + r.totalOrders, 0);
      const totalCoPay = salesReport.reduce((acc, r) => acc + r.totalCoPay, 0);
      const totalRefunds = salesReport.reduce((acc, r) => acc + r.totalRefunds, 0);

      content = `
        <h1>${title}</h1>
        <p>Date Range: ${dateRange.start} to ${dateRange.end}</p>
        <p>Generated: ${date}</p>
        <hr/>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Date</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Orders</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Sales</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Co-Pay</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Insurance</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Refunds</th>
            </tr>
          </thead>
          <tbody>
            ${salesReport.map((row) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(row.date)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${row.totalOrders}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(row.totalSales)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(row.totalCoPay)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(row.totalInsurance)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(row.totalRefunds)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background-color: #f5f5f5;">
              <td style="border: 1px solid #ddd; padding: 8px;">TOTAL</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${totalOrders}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(totalSales)}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(totalCoPay)}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">-</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(totalRefunds)}</td>
            </tr>
          </tfoot>
        </table>
      `;
    } else if (type === 'inventory') {
      content = `
        <h1>${title}</h1>
        <p>Generated: ${date}</p>
        <hr/>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Medicine</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Category</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Stock</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Expiry Date</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Days to Expiry</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${inventoryReport.map((item) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.medicineName}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.category}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.currentStock}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(item.expiryDate)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.daysToExpiry < 0 ? 'Expired' : item.daysToExpiry}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.status.replace('_', ' ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (type === 'commission') {
      const totalCommission = commissionReport.reduce((acc, r) => acc + r.commissionAmount, 0);
      const totalPaid = commissionReport.reduce((acc, r) => acc + r.paidAmount, 0);
      const totalPending = commissionReport.reduce((acc, r) => acc + r.pendingAmount, 0);

      content = `
        <h1>${title}</h1>
        <p>Generated: ${date}</p>
        <hr/>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Doctor</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Specialty</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Prescriptions</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total Sales</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Commission</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Paid</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Pending</th>
            </tr>
          </thead>
          <tbody>
            ${commissionReport.map((item) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.doctorName}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.specialty}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.prescriptionsCount}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.totalSales)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.commissionAmount)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.paidAmount)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.pendingAmount)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background-color: #f5f5f5;">
              <td colspan="4" style="border: 1px solid #ddd; padding: 8px;">TOTAL</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(totalCommission)}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(totalPaid)}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(totalPending)}</td>
            </tr>
          </tfoot>
        </table>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #1976d2; margin-bottom: 10px; }
            p { color: #666; margin: 5px 0; }
            hr { border: 1px solid #ddd; margin: 20px 0; }
            table { margin-top: 20px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    showSnackbar('PDF generation started. Check your print dialog.');
    handleExportMenuClose();
  }, [salesReport, inventoryReport, commissionReport, dateRange]);

  const handleExport = (type: string, format: string) => {
    if (format === 'csv') {
      switch (type) {
        case 'sales':
          exportSalesToCSV();
          break;
        case 'inventory':
          exportInventoryToCSV();
          break;
        case 'commission':
          exportCommissionToCSV();
          break;
      }
    } else if (format === 'pdf') {
      exportToPDF(type);
    }
  };

  const getExpiryStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'error'> = {
      fresh: 'success',
      expiring_soon: 'warning',
      expired: 'error',
    };
    return colors[status] || 'default';
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Reports" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Tabs and Filters */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {reportTabs.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Start Date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="End Date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportMenuOpen}
                  >
                    Export
                  </Button>
                  <Menu
                    anchorEl={exportMenuAnchor}
                    open={Boolean(exportMenuAnchor)}
                    onClose={handleExportMenuClose}
                  >
                    <MenuItem onClick={() => handleExport(activeTab, 'csv')}>
                      <ListItemIcon>
                        <CsvIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Export as CSV</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleExport(activeTab, 'pdf')}>
                      <ListItemIcon>
                        <PdfIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Export as PDF</ListItemText>
                    </MenuItem>
                  </Menu>
                  <Button variant="outlined" startIcon={<PrintIcon />}>
                    Print
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Sales Report */}
        {activeTab === 'sales' && (
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TrendingUpIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Total Sales
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(salesReport.reduce((acc, r) => acc + r.totalSales, 0))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MoneyIcon color="success" />
                    <Typography variant="body2" color="text.secondary">
                      Total Co-Pay
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(salesReport.reduce((acc, r) => acc + r.totalCoPay, 0))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <InventoryIcon color="info" />
                    <Typography variant="body2" color="text.secondary">
                      Total Orders
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    {salesReport.reduce((acc, r) => acc + r.totalOrders, 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MoneyIcon color="error" />
                    <Typography variant="body2" color="text.secondary">
                      Total Refunds
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(salesReport.reduce((acc, r) => acc + r.totalRefunds, 0))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Sales Chart */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Sales Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesReport}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        stroke={theme.palette.text.secondary}
                        tickFormatter={(value) => formatDate(value, 'MMM DD')}
                      />
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
                        dataKey="totalSales"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSales)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Daily Breakdown Table */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Daily Breakdown
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Orders</TableCell>
                          <TableCell align="right">Sales</TableCell>
                          <TableCell align="right">Co-Pay</TableCell>
                          <TableCell align="right">Insurance</TableCell>
                          <TableCell align="right">Refunds</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {salesReport.map((row) => (
                          <TableRow key={row.date} hover>
                            <TableCell>{formatDate(row.date)}</TableCell>
                            <TableCell align="right">{row.totalOrders}</TableCell>
                            <TableCell align="right">{formatCurrency(row.totalSales)}</TableCell>
                            <TableCell align="right">{formatCurrency(row.totalCoPay)}</TableCell>
                            <TableCell align="right">{formatCurrency(row.totalInsurance)}</TableCell>
                            <TableCell align="right">
                              {row.totalRefunds > 0 ? (
                                <Chip label={formatCurrency(row.totalRefunds)} size="small" color="error" />
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Inventory Aging Report */}
        {activeTab === 'inventory' && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Inventory Aging Report
                    </Typography>
                    <Alert severity="info" sx={{ py: 0.5 }}>
                      Items expiring within 30 days are highlighted
                    </Alert>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Medicine</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Current Stock</TableCell>
                          <TableCell align="right">Expiry Date</TableCell>
                          <TableCell align="center">Days to Expiry</TableCell>
                          <TableCell align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {inventoryReport.map((item) => (
                          <TableRow key={item.medicineId} hover>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {item.medicineName}
                              </Typography>
                            </TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell align="right">{item.currentStock}</TableCell>
                            <TableCell align="right">{formatDate(item.expiryDate)}</TableCell>
                            <TableCell align="center">
                              {item.daysToExpiry < 0 ? (
                                <Chip label="Expired" size="small" color="error" />
                              ) : item.daysToExpiry <= 30 ? (
                                <Chip label={`${item.daysToExpiry} days`} size="small" color="warning" />
                              ) : (
                                <Typography variant="body2">{item.daysToExpiry} days</Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={item.status.replace('_', ' ')}
                                size="small"
                                color={getExpiryStatusColor(item.status)}
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Commission Report */}
        {activeTab === 'commission' && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Doctor Commission Report
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Doctor</TableCell>
                          <TableCell>Specialty</TableCell>
                          <TableCell align="right">Prescriptions</TableCell>
                          <TableCell align="right">Total Sales</TableCell>
                          <TableCell align="right">Commission Rate</TableCell>
                          <TableCell align="right">Commission</TableCell>
                          <TableCell align="right">Paid</TableCell>
                          <TableCell align="right">Pending</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {commissionReport.map((item) => (
                          <TableRow key={item.doctorId} hover>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {item.doctorName}
                              </Typography>
                            </TableCell>
                            <TableCell>{item.specialty}</TableCell>
                            <TableCell align="right">{item.prescriptionsCount}</TableCell>
                            <TableCell align="right">{formatCurrency(item.totalSales)}</TableCell>
                            <TableCell align="right">{item.commissionRate}%</TableCell>
                            <TableCell align="right">{formatCurrency(item.commissionAmount)}</TableCell>
                            <TableCell align="right">
                              {item.paidAmount > 0 && (
                                <Chip label={formatCurrency(item.paidAmount)} size="small" color="success" />
                              )}
                            </TableCell>
                            <TableCell align="right">
                              {item.pendingAmount > 0 && (
                                <Chip label={formatCurrency(item.pendingAmount)} size="small" color="warning" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Summary */}
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Box sx={{ textAlign: 'right', minWidth: 300 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1">Total Commission</Typography>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {formatCurrency(commissionReport.reduce((acc, r) => acc + r.commissionAmount, 0))}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1">Total Paid</Typography>
                        <Typography variant="subtitle1" color="success.main">
                          {formatCurrency(commissionReport.reduce((acc, r) => acc + r.paidAmount, 0))}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1">Total Pending</Typography>
                        <Typography variant="subtitle1" color="warning.main">
                          {formatCurrency(commissionReport.reduce((acc, r) => acc + r.pendingAmount, 0))}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

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