'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { DataGrid, Column } from '@/components/common/DataGrid';
import { useQuery } from '@/hooks';
import { api } from '@/services';
import { MasterMedicine } from '@/types';
import { formatDateTime } from '@/lib';

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MasterMedicine | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: medicinesData, isLoading } = useQuery({
    queryKey: ['catalog'],
    queryFn: () => api.getMasterMedicines(),
  });

  const medicines = medicinesData?.items || [];

  const columns: Column<MasterMedicine>[] = [
    {
      id: 'name',
      label: 'Medicine',
      minWidth: 200,
      format: (value, row) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>{row.name}</Typography>
          <Typography variant="caption" color="text.secondary">{row.genericName}</Typography>
        </Box>
      ),
    },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'manufacturer', label: 'Manufacturer', minWidth: 150 },
    { id: 'dosage', label: 'Dosage', minWidth: 80 },
    { id: 'form', label: 'Form', minWidth: 100 },
    { id: 'strength', label: 'Strength', minWidth: 80 },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <Chip label={value ? 'Active' : 'Inactive'} size="small" color={value ? 'success' : 'default'} />
      ),
    },
    {
      id: 'updatedAt',
      label: 'Last Updated',
      minWidth: 150,
      format: (value) => formatDateTime(String(value)),
    },
  ];

  const getActions = () => [
    {
      icon: <ViewIcon />,
      label: 'View',
      onClick: (row: MasterMedicine) => { setSelectedMedicine(row); setDialogOpen(true); },
      color: 'default' as const,
    },
    {
      icon: <EditIcon />,
      label: 'Edit',
      onClick: (row: MasterMedicine) => { setSelectedMedicine(row); setDialogOpen(true); },
      color: 'primary' as const,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Master Medicine Catalog" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <TextField
                size="small"
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                }}
                sx={{ minWidth: 300 }}
              />
              <Button variant="contained" startIcon={<AddIcon />}>Add Medicine</Button>
            </Box>

            <DataGrid
              columns={columns}
              data={medicines}
              loading={isLoading}
              actions={getActions()}
              emptyMessage="No medicines found"
            />
          </CardContent>
        </Card>
      </Box>

      {/* Medicine Detail/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedMedicine ? 'Medicine Details' : 'Add New Medicine'}</DialogTitle>
        <DialogContent dividers>
          {selectedMedicine && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Name</Typography>
                <Typography variant="body1">{selectedMedicine.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Generic Name</Typography>
                <Typography variant="body1">{selectedMedicine.genericName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Manufacturer</Typography>
                <Typography variant="body1">{selectedMedicine.manufacturer}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Category</Typography>
                <Typography variant="body1">{selectedMedicine.category}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Dosage</Typography>
                <Typography variant="body1">{selectedMedicine.dosage}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Form</Typography>
                <Typography variant="body1">{selectedMedicine.form}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Strength</Typography>
                <Typography variant="body1">{selectedMedicine.strength}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
