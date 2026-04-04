'use client';

import { useSession } from 'next-auth/react';

type Permission =
  | 'view_dashboard'
  | 'manage_users'
  | 'approve_doctors'
  | 'approve_pharmacies'
  | 'manage_catalog'
  | 'manage_insurance'
  | 'manage_specialties'
  | 'manage_commissions'
  | 'view_financials'
  | 'process_payouts'
  | 'view_commissions'
  | 'manage_support'
  | 'process_refunds'
  | 'view_security'
  | 'manage_settings';

const rolePermissions: Record<string, Permission[]> = {
  super_admin: [
    'view_dashboard',
    'manage_users',
    'approve_doctors',
    'approve_pharmacies',
    'manage_catalog',
    'manage_insurance',
    'manage_specialties',
    'manage_commissions',
    'view_financials',
    'process_payouts',
    'view_commissions',
    'manage_support',
    'process_refunds',
    'view_security',
    'manage_settings',
  ],
  support: [
    'view_dashboard',
    'manage_users',
    'manage_support',
    'process_refunds',
  ],
  finance: [
    'view_dashboard',
    'view_financials',
    'process_payouts',
    'view_commissions',
  ],
  security: [
    'view_dashboard',
    'view_security',
    'manage_users',
  ],
};

export function usePermissions() {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || 'support';

  const hasPermission = (permission: Permission): boolean => {
    return rolePermissions[userRole]?.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((p) => hasPermission(p));
  };

  const isRole = (role: string): boolean => {
    return userRole === role;
  };

  const isSuperAdmin = userRole === 'super_admin';

  return {
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
    isSuperAdmin,
    permissions: rolePermissions[userRole] || [],
  };
}
