'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
  Divider,
  alpha,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { usePermissions } from '@/hooks';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <DashboardIcon />, permission: 'view_dashboard' },
  { label: 'Catalog', href: '/catalog', icon: <InventoryIcon />, permission: 'view_catalog' },
  { label: 'Orders', href: '/orders', icon: <ShoppingCartIcon />, permission: 'view_orders' },
  { label: 'Claims', href: '/claims', icon: <ReceiptIcon />, permission: 'view_claims' },
  { label: 'Reports', href: '/reports', icon: <AssessmentIcon />, permission: 'view_reports' },
  { label: 'Settings', href: '/settings', icon: <SettingsIcon />, permission: 'manage_settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const { hasPermission } = usePermissions();

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission as never)
  );

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          p: 2,
          minHeight: 64,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {!collapsed && (
          <Box
            component="span"
            sx={{
              fontWeight: 700,
              fontSize: '1.25rem',
              color: 'primary.main',
              whiteSpace: 'nowrap',
            }}
          >
            Health Plus
          </Box>
        )}
        {!isMobile && (
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            {collapsed ? <MenuIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>

      <List sx={{ flex: 1, py: 2, px: 1 }}>
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={isActive}
                  onClick={() => isMobile && setCollapsed(false)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: collapsed ? 1 : 2,
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                    color: isActive ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      bgcolor: isActive
                        ? alpha(theme.palette.primary.main, 0.18)
                        : alpha(theme.palette.action.hover, 0.08),
                    },
                    '& .MuiListItemIcon-root': {
                      color: isActive ? 'primary.main' : 'text.secondary',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 40,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.9rem',
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {!collapsed && (
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.08),
              color: 'info.main',
              fontSize: '0.75rem',
              textAlign: 'center',
            }}
          >
            Pharmacy App v1.0.0
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={!collapsed}
          onClose={() => setCollapsed(true)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}
