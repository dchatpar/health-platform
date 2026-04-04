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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocalHospital as SpecialtyIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { useQuery } from '@/hooks';
import { api } from '@/services';
import { Specialty } from '@/types';

export default function SpecialtiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: specialtiesData, isLoading } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => api.getSpecialties(),
  });

  const specialties = specialtiesData?.items || [];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Specialty Management" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpecialtyIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Medical Specialties</Typography>
              </Box>
              <Button variant="contained" startIcon={<AddIcon />}>Add Specialty</Button>
            </Box>

            <TextField
              size="small"
              placeholder="Search specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
              }}
              sx={{ minWidth: 300, mb: 3 }}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {specialties.map((specialty) => (
                <Card key={specialty.id} variant="outlined" sx={{ minWidth: 250 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>{specialty.name}</Typography>
                        {specialty.description && (
                          <Typography variant="body2" color="text.secondary">{specialty.description}</Typography>
                        )}
                      </Box>
                      <Box>
                        <Chip label={specialty.isActive ? 'Active' : 'Inactive'} size="small" color={specialty.isActive ? 'success' : 'default'} />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Specialty</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Specialty Name" sx={{ mt: 2 }} />
          <TextField fullWidth label="Description" multiline rows={3} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
