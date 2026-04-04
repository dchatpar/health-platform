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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Send as SendIcon,
  ClosedCaption as ClosedIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { DataGrid, Column } from '@/components/common/DataGrid';
import { useQuery } from '@/hooks';
import { api } from '@/services';
import { SupportTicket } from '@/types';
import { formatDateTime, getPriorityColor, getStatusColor } from '@/lib';

export default function SupportPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['support', { status: statusFilter }],
    fn: () => api.getSupportTickets({ status: statusFilter === 'all' ? undefined : statusFilter }),
  });

  const tickets = ticketsData?.items || [];

  const columns: Column<SupportTicket>[] = [
    {
      id: 'ticketNumber',
      label: 'Ticket #',
      minWidth: 130,
      format: (_, row) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>{row.ticketNumber}</Typography>
          <Typography variant="caption" color="text.secondary">{formatDateTime(row.createdAt)}</Typography>
        </Box>
      ),
    },
    {
      id: 'userName',
      label: 'User',
      minWidth: 150,
      format: (_, row) => (
        <Box>
          <Typography variant="body2">{row.userName}</Typography>
          <Chip label={row.userType} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
        </Box>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      minWidth: 120,
      format: (value) => (
        <Chip label={String(value).replace('_', ' ')} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
      ),
    },
    {
      id: 'subject',
      label: 'Subject',
      minWidth: 200,
    },
    {
      id: 'priority',
      label: 'Priority',
      minWidth: 100,
      format: (value) => (
        <Chip label={String(value)} size="small" color={getPriorityColor(String(value))} sx={{ textTransform: 'capitalize' }} />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      format: (value) => (
        <Chip label={String(value).replace('_', ' ')} size="small" color={getStatusColor(String(value))} sx={{ textTransform: 'capitalize' }} />
      ),
    },
    {
      id: 'assignedToName',
      label: 'Assigned To',
      minWidth: 130,
      format: (value) => value || 'Unassigned',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Support Tickets" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Card>
          <Tabs value={statusFilter} onChange={(_, v) => setStatusFilter(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
              <Tab key={status} value={status} label={status.replace('_', ' ')} sx={{ textTransform: 'capitalize' }} />
            ))}
          </Tabs>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <TextField size="small" placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ minWidth: 300 }} />
              <Button variant="contained" startIcon={<SendIcon />}>Export</Button>
            </Box>
            <DataGrid columns={columns} data={tickets} loading={isLoading} emptyMessage="No tickets found" />
          </CardContent>
        </Card>
      </Box>

      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ticket Details</DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Ticket</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedTicket.ticketNumber}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Chip label={selectedTicket.status.replace('_', ' ')} color={getStatusColor(selectedTicket.status)} size="small" sx={{ textTransform: 'capitalize' }} />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography variant="body1">{selectedTicket.description}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          <Button variant="contained">Respond</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
