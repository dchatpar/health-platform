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
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { useQuery } from '@/hooks';
import { api } from '@/services';
import { formatDate } from '@/lib';

export default function CommissionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: commissionsData, isLoading } = useQuery({
    queryKey: ['commissions'],
    queryFn: () => api.getCommissionRules(),
  });

  const commissions = commissionsData?.items || [];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Commission Rules" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Doctor Commission Rules</Typography>
              </Box>
              <Button variant="contained" startIcon={<AddIcon />}>Add Rule</Button>
            </Box>

            <TextField
              size="small"
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
              }}
              sx={{ minWidth: 300, mb: 3 }}
            />

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Specialty</TableCell>
                    <TableCell align="right">Commission Rate</TableCell>
                    <TableCell>Effective From</TableCell>
                    <TableCell>Effective To</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commissions.map((rule) => (
                    <TableRow key={rule.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>{rule.specialtyName}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={`${rule.commissionPercentage}%`} color="primary" size="small" />
                      </TableCell>
                      <TableCell>{formatDate(rule.effectiveFrom)}</TableCell>
                      <TableCell>{rule.effectiveTo ? formatDate(rule.effectiveTo) : 'Indefinite'}</TableCell>
                      <TableCell>
                        <Chip label={rule.isActive ? 'Active' : 'Inactive'} color={rule.isActive ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Commission Rule</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Specialty" sx={{ mt: 2 }} />
          <TextField fullWidth label="Commission Rate (%)" type="number" sx={{ mt: 2 }} />
          <TextField fullWidth label="Effective From" type="date" sx={{ mt: 2 }} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Effective To" type="date" sx={{ mt: 2 }} InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
