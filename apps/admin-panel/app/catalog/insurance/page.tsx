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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography as MuiTypography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  HealthAndSafety as InsuranceIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { useQuery } from '@/hooks';
import { api } from '@/services';
import { InsurancePlan } from '@/types';
import { formatCurrency } from '@/lib';

export default function InsuranceCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: insuranceData, isLoading } = useQuery({
    queryKey: ['insurance'],
    queryFn: () => api.getInsurancePlans(),
  });

  const insurancePlans = insuranceData?.items || [];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="Insurance Catalog" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InsuranceIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Insurance Providers & Plans</Typography>
              </Box>
              <Button variant="contained" startIcon={<AddIcon />}>Add Plan</Button>
            </Box>

            <TextField
              size="small"
              placeholder="Search insurance plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
              }}
              sx={{ minWidth: 300, mb: 3 }}
            />

            {insurancePlans.map((plan) => (
              <Accordion key={plan.id} defaultExpanded={false}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <InsuranceIcon color="secondary" />
                    <Box sx={{ flexGrow: 1 }}>
                      <MuiTypography variant="subtitle1" fontWeight={600}>{plan.name}</MuiTypography>
                      <MuiTypography variant="body2" color="text.secondary">{plan.providerName}</MuiTypography>
                    </Box>
                    <Chip label={plan.code} size="small" variant="outlined" sx={{ mr: 2 }} />
                    <Chip label={plan.isActive ? 'Active' : 'Inactive'} size="small" color={plan.isActive ? 'success' : 'default'} />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Coverage Types
                  </Typography>
                  <Grid container spacing={2}>
                    {plan.coverageTypes.map((coverage) => (
                      <Grid item xs={12} md={6} key={coverage.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600}>{coverage.name}</Typography>
                              <Chip label={`${coverage.coveragePercentage}%`} size="small" color="primary" />
                            </Box>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Max/Prescription</Typography>
                                <Typography variant="body2">{formatCurrency(coverage.maxPerPrescription)}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Max/Month</Typography>
                                <Typography variant="body2">{formatCurrency(coverage.maxPerMonth)}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Deductible</Typography>
                                <Typography variant="body2">{formatCurrency(coverage.deductible)}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Pre-Authorization</Typography>
                                <Typography variant="body2">{coverage.requiresPreAuthorization ? 'Required' : 'Not Required'}</Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Insurance Plan</DialogTitle>
        <DialogContent>
          <Typography>Insurance plan form would go here.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
