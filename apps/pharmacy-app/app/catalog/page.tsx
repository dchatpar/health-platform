'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Alert,
  Snackbar,
  InputAdornment,
  Autocomplete,
  Switch,
  FormControlLabel,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Warning as WarningIcon,
  LocalShipping as ShippingIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header } from '@/components/common/Header';
import { DataTable, Column } from '@/components/common/DataTable';
import { useQuery, useMutation, useQueryClient, usePermissions } from '@/hooks';
import { api } from '@/services';
import { Medicine, medicineSchema } from '@/lib/validators';
import { formatCurrency, getStockStatus, getDaysUntilExpiry } from '@/lib';

const categoryOptions = [
  'Antibiotics',
  'Pain Relief',
  'Gastrointestinal',
  'Diabetes',
  'Antihistamines',
  'Respiratory',
  'Cardiovascular',
  'Dermatological',
  'Eye Care',
  'Vitamins & Supplements',
  'Other',
];

const formSchema = medicineSchema;

type FormData = z.infer<typeof formSchema>;

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const { data: medicinesData, isLoading } = useQuery({
    queryKey: ['medicines', { search: searchQuery, category: categoryFilter, lowStock: lowStockFilter }],
    queryFn: () => api.getMedicines({ search: searchQuery, category: categoryFilter, lowStock: lowStockFilter }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Medicine>) => api.createMedicine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      handleCloseDialog();
      setSnackbar({ open: true, message: 'Medicine added successfully', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to add medicine', severity: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Medicine> }) => api.updateMedicine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      handleCloseDialog();
      setSnackbar({ open: true, message: 'Medicine updated successfully', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to update medicine', severity: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteMedicine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      setDeleteDialogOpen(false);
      setMedicineToDelete(null);
      setSnackbar({ open: true, message: 'Medicine deleted successfully', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to delete medicine', severity: 'error' });
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, quantity, reason }: { id: string; quantity: number; reason: string }) =>
      api.updateStock(id, quantity, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      setStockDialogOpen(false);
      setSelectedMedicine(null);
      setSnackbar({ open: true, message: 'Stock updated successfully', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to update stock', severity: 'error' });
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      genericName: '',
      manufacturer: '',
      category: '',
      dosage: '',
      form: 'tablet',
      strength: '',
      price: 0,
      stock: 0,
      minStock: 0,
      maxStock: 100,
      expiryDate: '',
      prescriptionRequired: false,
      insuranceCoverage: 100,
      requiresColdStorage: false,
    },
  });

  const medicines = medicinesData?.items || [];

  const columns: Column<Medicine>[] = [
    {
      id: 'name',
      label: 'Medicine Name',
      minWidth: 180,
      format: (value, row) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.genericName}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      minWidth: 120,
    },
    {
      id: 'form',
      label: 'Form',
      minWidth: 100,
    },
    {
      id: 'strength',
      label: 'Strength',
      minWidth: 80,
    },
    {
      id: 'price',
      label: 'Price',
      minWidth: 100,
      align: 'right',
      format: (value) => formatCurrency(Number(value)),
    },
    {
      id: 'stock',
      label: 'Stock',
      minWidth: 120,
      format: (value, row) => {
        const status = getStockStatus(row.stock, row.minStock, row.maxStock);
        const color =
          status === 'out_of_stock'
            ? 'error'
            : status === 'low_stock'
            ? 'warning'
            : status === 'overstocked'
            ? 'info'
            : 'success';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">{row.stock}</Typography>
            {status !== 'normal' && (
              <Tooltip title={status.replace('_', ' ')}>
                <WarningIcon sx={{ fontSize: 16, color: `${color}.main` }} />
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      id: 'expiryDate',
      label: 'Expiry',
      minWidth: 100,
      format: (value) => {
        const days = getDaysUntilExpiry(String(value));
        if (days < 0) return <Chip label="Expired" size="small" color="error" />;
        if (days <= 30) return <Chip label={`${days}d`} size="small" color="warning" />;
        return String(value);
      },
    },
    {
      id: 'prescriptionRequired',
      label: 'Rx',
      minWidth: 60,
      align: 'center',
      format: (value) => (value ? 'Yes' : 'No'),
    },
  ];

  const actions = useMemo(() => {
    const actionList = [];
    if (hasPermission('edit_medicine') || hasPermission('manage_stock')) {
      actionList.push({
        icon: <InventoryIcon />,
        label: 'Update Stock',
        onClick: (row: Medicine) => {
          setSelectedMedicine(row);
          setStockDialogOpen(true);
        },
        color: 'info' as const,
      });
    }
    if (hasPermission('edit_medicine')) {
      actionList.push({
        icon: <EditIcon />,
        label: 'Edit',
        onClick: (row: Medicine) => {
          setEditingMedicine(row);
          reset(row);
          setDialogOpen(true);
        },
        color: 'primary' as const,
      });
    }
    if (hasPermission('delete_medicine')) {
      actionList.push({
        icon: <DeleteIcon />,
        label: 'Delete',
        onClick: (row: Medicine) => {
          setMedicineToDelete(row);
          setDeleteDialogOpen(true);
        },
        color: 'error' as const,
      });
    }
    return actionList;
  }, [hasPermission, reset]);

  const handleOpenDialog = () => {
    setEditingMedicine(null);
    reset({
      name: '',
      genericName: '',
      manufacturer: '',
      category: '',
      dosage: '',
      form: 'tablet',
      strength: '',
      price: 0,
      stock: 0,
      minStock: 0,
      maxStock: 100,
      expiryDate: '',
      prescriptionRequired: false,
      insuranceCoverage: 100,
      requiresColdStorage: false,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMedicine(null);
    reset();
  };

  const onSubmit = (data: FormData) => {
    if (editingMedicine) {
      updateMutation.mutate({ id: editingMedicine.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleStockUpdate = (data: { quantity: number; reason: string }) => {
    if (selectedMedicine) {
      stockMutation.mutate({
        id: selectedMedicine.id,
        quantity: data.quantity,
        reason: data.reason,
      });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Medicine Catalog" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categoryOptions.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={lowStockFilter}
                      onChange={(e) => setLowStockFilter(e.target.checked)}
                    />
                  }
                  label="Low stock only"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                {hasPermission('add_medicine') && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                  >
                    Add Medicine
                  </Button>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={medicines}
          loading={isLoading}
          actions={actions}
          searchPlaceholder="Search medicines..."
          emptyMessage="No medicines found"
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Brand Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="genericName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Generic Name"
                      error={!!errors.genericName}
                      helperText={errors.genericName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="manufacturer"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Manufacturer"
                      error={!!errors.manufacturer}
                      helperText={errors.manufacturer?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel>Category</InputLabel>
                      <Select {...field} label="Category">
                        {categoryOptions.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {cat}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="dosage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Dosage"
                      error={!!errors.dosage}
                      helperText={errors.dosage?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="strength"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Strength"
                      error={!!errors.strength}
                      helperText={errors.strength?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="form"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.form}>
                      <InputLabel>Form</InputLabel>
                      <Select {...field} label="Form">
                        {[
                          'tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment',
                          'drops', 'inhaler', 'patch', 'suppository', 'powder', 'solution',
                          'suspension', 'gel', 'spray', 'other',
                        ].map((form) => (
                          <MenuItem key={form} value={form}>
                            {form}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Price (SAR)"
                      error={!!errors.price}
                      helperText={errors.price?.message}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="stock"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Current Stock"
                      error={!!errors.stock}
                      helperText={errors.stock?.message}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="minStock"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Minimum Stock"
                      error={!!errors.minStock}
                      helperText={errors.minStock?.message}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="maxStock"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Maximum Stock"
                      error={!!errors.maxStock}
                      helperText={errors.maxStock?.message}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="expiryDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label="Expiry Date"
                      error={!!errors.expiryDate}
                      helperText={errors.expiryDate?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="insuranceCoverage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Insurance Coverage (%)"
                      error={!!errors.insuranceCoverage}
                      helperText={errors.insuranceCoverage?.message}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="prescriptionRequired"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label="Prescription Required"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="requiresColdStorage"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label="Requires Cold Storage"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="barcode"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Barcode (optional)" />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingMedicine ? 'Update' : 'Add'} Medicine
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Medicine</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{medicineToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => medicineToDelete && deleteMutation.mutate(medicineToDelete.id)}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Update Dialog */}
      <Dialog open={stockDialogOpen} onClose={() => setStockDialogOpen(false)}>
        <DialogTitle>Update Stock - {selectedMedicine?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Current Stock: <strong>{selectedMedicine?.stock}</strong>
            </Typography>
            <StockUpdateForm onSubmit={handleStockUpdate} isPending={stockMutation.isPending} />
          </Box>
        </DialogContent>
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

function StockUpdateForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: { quantity: number; reason: string }) => void;
  isPending: boolean;
}) {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ quantity: Number(quantity), reason });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label="Quantity (+/-)"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            helperText="Use positive number to add stock, negative to remove"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="success"
              onClick={() => setQuantity(String(Math.abs(Number(quantity) || 0)))}
            >
              + Add
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setQuantity(String(-Math.abs(Number(quantity) || 0)))}
            >
              - Remove
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" fullWidth disabled={isPending}>
            Update Stock
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
