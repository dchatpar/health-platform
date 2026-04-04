'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  LocalPharmacy as PharmacyIcon,
  MedicalServices as DoctorIcon,
} from '@mui/icons-material';
import { Header } from '@/components/common/Header';
import { DataGrid, Column } from '@/components/common/DataGrid';
import { useQuery } from '@/hooks';
import { api, mockPatients, mockDoctors, mockPharmacies } from '@/services';
import { User, Doctor, Pharmacy, Patient } from '@/types';
import { formatDateTime, getInitials, getApprovalStatusColor } from '@/lib';

export default function UsersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'patient' | 'doctor' | 'pharmacy'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', activeTab],
    queryFn: () => api.getUsers(activeTab === 'all' ? undefined : activeTab),
  });

  const users = usersData?.items || [];

  const getUserIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <PersonIcon />;
      case 'doctor':
        return <DoctorIcon />;
      case 'pharmacy':
        return <PharmacyIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const columns: Column<User>[] = [
    {
      id: 'name',
      label: 'User',
      minWidth: 200,
      format: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            {getInitials(row.name)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      minWidth: 100,
      format: (value) => (
        <Chip
          icon={getUserIcon(String(value))}
          label={String(value)}
          size="small"
          variant="outlined"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      id: 'phone',
      label: 'Phone',
      minWidth: 130,
      format: (value) => value || '-',
    },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value ? 'Active' : 'Inactive'}
          size="small"
          color={value ? 'success' : 'default'}
        />
      ),
    },
    {
      id: 'isVerified',
      label: 'Verified',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value ? 'Verified' : 'Pending'}
          size="small"
          color={value ? 'success' : 'warning'}
        />
      ),
    },
    {
      id: 'lastLogin',
      label: 'Last Login',
      minWidth: 150,
      format: (value) => (value ? formatDateTime(String(value)) : 'Never'),
    },
  ];

  const getActions = () => [
    {
      icon: <ViewIcon />,
      label: 'View Details',
      onClick: (row: User) => {
        if (row.type === 'doctor') router.push(`/users/doctors`);
        else if (row.type === 'pharmacy') router.push(`/users/pharmacies`);
      },
      color: 'default' as const,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header title="User Management" />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab value="all" label="All Users" />
            <Tab value="patient" label="Patients" />
            <Tab value="doctor" label="Doctors" />
            <Tab value="pharmacy" label="Pharmacies" />
          </Tabs>
          <CardContent>
            <Box sx={{ mb: 2 }}>
              <TextField
                size="small"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
            </Box>

            <DataGrid
              columns={columns}
              data={users}
              loading={isLoading}
              actions={getActions()}
              searchPlaceholder="Search users..."
              emptyMessage="No users found"
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
