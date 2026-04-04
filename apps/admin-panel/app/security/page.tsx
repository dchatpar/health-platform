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
  Grid,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Warning as WarningIcon,
  CheckCircle as ResolveIcon,
  Cancel as DismissIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { DataGrid, Column } from '@/components/common/DataGrid';
import { useQuery } from '@/hooks';
import { api } from '@/services';
import { FraudAlert, AuditLog } from '@/types';
import { formatDateTime, getSeverityColor } from '@/lib';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: fraudData } = useQuery({
    queryKey: ['fraudAlerts', { status: 'new' }],
    fn: () => api.getFraudAlerts({ status: 'new' }),
  });

  const { data: auditData } = useQuery({
    queryKey: ['auditLog'],
    fn: () => api.getAuditLogs(),
  });

  const fraudAlerts = fraudData?.items || [];
  const auditLogs = auditData?.items || [];

  const fraudColumns: Column<FraudAlert>[] = [
    {
      id: 'createdAt',
      label: 'Time',
      minWidth: 150,
      format: (value) => formatDateTime(String(value)),
    },
    {
      id: 'alertType',
      label: 'Alert Type',
      minWidth: 180,
      format: (value) => <Chip label={String(value).replace('_', ' ')} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />,
    },
    {
      id: 'severity',
      label: 'Severity',
      minWidth: 100,
      format: (value) => <Chip label={String(value)} size="small" color={getSeverityColor(String(value))} sx={{ textTransform: 'capitalize' }} />,
    },
    {
      id: 'userName',
      label: 'User',
      minWidth: 150,
      format: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{row.userName}</Typography>
          <Typography variant="caption" color="text.secondary">{row.userType}</Typography>
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 250,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value) => <Chip label={String(value)} size="small" color={value === 'new' ? 'warning' : value === 'resolved' ? 'success' : 'default'} sx={{ textTransform: 'capitalize' }} />,
    },
  ];

  const auditColumns: Column<AuditLog>[] = [
    {
      id: 'createdAt',
      label: 'Time',
      minWidth: 150,
      format: (value) => formatDateTime(String(value)),
    },
    {
      id: 'userName',
      label: 'User',
      minWidth: 150,
      format: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{row.userName}</Typography>
          <Typography variant="caption" color="text.secondary">{row.userType}</Typography>
        </Box>
      ),
    },
    {
      id: 'action',
      label: 'Action',
      minWidth: 150,
      format: (value) => <Chip label={String(value).replace('_', ' ')} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />,
    },
    {
      id: 'entityType',
      label: 'Entity',
      minWidth: 120,
    },
    {
      id: 'ipAddress',
      label: 'IP Address',
      minWidth: 130,
    },
  ];

  const getFraudActions = () => [
    {
      icon: <ViewIcon />,
      label: 'View Details',
      onClick: () => {},
      color: 'default' as const,
    },
    {
      icon: <ResolveIcon />,
      label: 'Resolve',
      onClick: () => {},
      color: 'success' as const,
    },
    {
      icon: <DismissIcon />,
      label: 'Dismiss',
      onClick: () => {},
      color: 'error' as const,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Security & Compliance" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WarningIcon color="error" />
                  <Typography variant="body2" color="text.secondary">Active Alerts</Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>{fraudAlerts.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ShieldIcon color="warning" />
                  <Typography variant="body2" color="text.secondary">Under Review</Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>{fraudAlerts.filter((a) => a.status === 'reviewing').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ResolveIcon color="success" />
                  <Typography variant="body2" color="text.secondary">Resolved Today</Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>0</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Fraud Alerts" />
            <Tab label="Audit Log" />
          </Tabs>
          <CardContent>
            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <TextField size="small" placeholder="Search alerts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ minWidth: 300 }} />
                  <Button variant="outlined" startIcon={<DownloadIcon />}>Export</Button>
                </Box>
                <DataGrid columns={fraudColumns} data={fraudAlerts} actions={getFraudActions()} emptyMessage="No fraud alerts" />
              </Box>
            )}
            {activeTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <TextField size="small" placeholder="Search logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ minWidth: 300 }} />
                  <Button variant="outlined" startIcon={<DownloadIcon />}>Export</Button>
                </Box>
                <DataGrid columns={auditColumns} data={auditLogs} emptyMessage="No audit logs" />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
