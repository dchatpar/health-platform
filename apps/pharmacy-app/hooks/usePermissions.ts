'use client';

import { useSession } from 'next-auth/react';
import { StaffRole } from '@/types';

type Permission =
  | 'view_dashboard'
  | 'view_catalog'
  | 'add_medicine'
  | 'edit_medicine'
  | 'delete_medicine'
  | 'manage_stock'
  | 'view_orders'
  | 'create_order'
  | 'update_order'
  | 'cancel_order'
  | 'view_claims'
  | 'process_claims'
  | 'view_reports'
  | 'manage_staff'
  | 'manage_settings'
  | 'process_refunds';

const rolePermissions: Record<StaffRole, Permission[]> = {
  admin: [
    'view_dashboard',
    'view_catalog',
    'add_medicine',
    'edit_medicine',
    'delete_medicine',
    'manage_stock',
    'view_orders',
    'create_order',
    'update_order',
    'cancel_order',
    'view_claims',
    'process_claims',
    'view_reports',
    'manage_staff',
    'manage_settings',
    'process_refunds',
  ],
  pharmacist: [
    'view_dashboard',
    'view_catalog',
    'add_medicine',
    'edit_medicine',
    'manage_stock',
    'view_orders',
    'create_order',
    'update_order',
    'view_claims',
    'process_claims',
    'view_reports',
  ],
  cashier: [
    'view_dashboard',
    'view_catalog',
    'view_orders',
    'create_order',
    'update_order',
    'view_claims',
    'view_reports',
  ],
  delivery: [
    'view_dashboard',
    'view_orders',
    'update_order',
  ],
  viewer: [
    'view_dashboard',
    'view_catalog',
    'view_orders',
    'view_reports',
  ],
};

export function usePermissions() {
  const sessionResult = useSession();
  const { data: session } = sessionResult || { data: undefined };
  const userRole = (session?.user as { role?: StaffRole })?.role || 'viewer';

  const hasPermission = (permission: Permission): boolean => {
    return rolePermissions[userRole]?.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((p) => hasPermission(p));
  };

  const isRole = (role: StaffRole): boolean => {
    return userRole === role;
  };

  const isAdmin = userRole === 'admin';
  const isPharmacist = userRole === 'pharmacist' || userRole === 'admin';
  const canManageStock = hasPermission('manage_stock');
  const canManageStaff = hasPermission('manage_staff');

  return {
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
    isAdmin,
    isPharmacist,
    canManageStock,
    canManageStaff,
    permissions: rolePermissions[userRole] || [],
  };
}
