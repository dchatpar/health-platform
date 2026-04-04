'use client';

import { useQuery as useReactQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useQuery<TData, TError = Error>(
  options: UseQueryOptions<TData, TError>
) {
  return useReactQuery<TData, TError>(options);
}

export function useMutationHook<TData, TError, TVariables, TContext>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
) {
  return useMutation<TData, TError, TVariables, TContext>(options);
}

export function useQueryKeys() {
  const getQueryKey = useCallback(
    (key: string, params?: Record<string, unknown>) => {
      return params ? [key, params] : [key];
    },
    []
  );

  return {
    dashboard: () => ['dashboard'],
    users: (type?: string) => type ? ['users', type] : ['users'],
    doctors: (params?: { approvalStatus?: string }) => params ? ['doctors', params] : ['doctors'],
    pharmacies: (params?: { approvalStatus?: string }) => params ? ['pharmacies', params] : ['pharmacies'],
    catalog: () => ['catalog'],
    insurance: () => ['insurance'],
    specialties: () => ['specialties'],
    commissions: () => ['commissions'],
    financials: () => ['financials'],
    payouts: (type: string) => ['payouts', type],
    settlements: () => ['settlements'],
    support: (params?: { status?: string }) => params ? ['support', params] : ['support'],
    refunds: (params?: { status?: string }) => params ? ['refunds', params] : ['refunds'],
    security: () => ['security'],
    fraudAlerts: (params?: { status?: string }) => params ? ['fraudAlerts', params] : ['fraudAlerts'],
    auditLog: () => ['auditLog'],
  };
}

export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return useCallback(
    (keys: string[]) => {
      keys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
    [queryClient]
  );
}
