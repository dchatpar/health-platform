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
    medicines: (params?: Record<string, unknown>) =>
      getQueryKey('medicines', params),
    orders: (params?: Record<string, unknown>) =>
      getQueryKey('orders', params),
    order: (id: string) => ['order', id],
    claims: (params?: Record<string, unknown>) =>
      getQueryKey('claims', params),
    claim: (id: string) => ['claim', id],
    dashboard: () => ['dashboard'],
    reports: (type: string) => ['reports', type],
    staff: (params?: Record<string, unknown>) =>
      getQueryKey('staff', params),
    settings: () => ['settings'],
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
