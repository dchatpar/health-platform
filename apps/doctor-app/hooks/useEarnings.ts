import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { startOfWeek, endOfWeek, isSameWeek, parseISO, subWeeks } from 'date-fns';

interface Transaction {
  id: string;
  type: 'consultation' | 'withdrawal' | 'refund' | 'bonus';
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  appointmentId?: string;
}

interface EarningsSummary {
  totalEarnings: number;
  pendingAmount: number;
  availableAmount: number;
  lastWithdrawalDate?: string;
  weeklyLimit: number;
}

export function useEarnings() {
  const queryClient = useQueryClient();

  // Fetch all transactions
  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['earnings'],
    queryFn: async () => {
      const response = await api.get('/earnings/transactions');
      return response.data as Transaction[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch earnings summary
  const { data: summary } = useQuery({
    queryKey: ['earnings-summary'],
    queryFn: async () => {
      const response = await api.get('/earnings/summary');
      return response.data as EarningsSummary;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Calculate weekly earnings
  const weeklyEarnings = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    return transactions
      .filter((t) => {
        if (t.type !== 'consultation' || t.status !== 'completed') return false;
        const date = parseISO(t.date);
        return date >= weekStart && date <= weekEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Check if can withdraw (once per week)
  const canWithdraw = useMemo(() => {
    if (!summary) return false;

    // Check if last withdrawal was this week
    if (summary.lastWithdrawalDate) {
      const lastWithdrawal = parseISO(summary.lastWithdrawalDate);
      if (isSameWeek(lastWithdrawal, new Date(), { weekStartsOn: 1 })) {
        return false;
      }
    }

    // Check if there are funds available
    if ((summary.availableAmount || 0) < 50) {
      return false;
    }

    return true;
  }, [summary]);

  // Get last withdrawal info
  const lastWithdrawal = useMemo(() => {
    return transactions.find((t) => t.type === 'withdrawal' && t.status === 'completed');
  }, [transactions]);

  // Request withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await api.post('/earnings/withdraw', { amount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
      queryClient.invalidateQueries({ queryKey: ['earnings-summary'] });
    },
  });

  const requestWithdrawal = useCallback(
    async (amount: number) => {
      if (!canWithdraw) {
        throw new Error('Withdrawal not available. Please check weekly limit.');
      }
      if (amount < 50) {
        throw new Error('Minimum withdrawal amount is $50');
      }
      await withdrawMutation.mutateAsync(amount);
    },
    [canWithdraw, withdrawMutation]
  );

  // Get earnings for a specific week
  const getWeekEarnings = useCallback(
    (weekDate: Date) => {
      const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });

      return transactions
        .filter((t) => {
          if (t.type !== 'consultation' || t.status !== 'completed') return false;
          const date = parseISO(t.date);
          return date >= weekStart && date <= weekEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    },
    [transactions]
  );

  // Export transactions as CSV
  const exportTransactions = useCallback(
    async (startDate: Date, endDate: Date, format: 'csv' | 'pdf') => {
      const response = await api.get('/earnings/export', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          format,
        },
        responseType: format === 'csv' ? 'text' : 'blob',
      });
      return response.data;
    },
    []
  );

  return {
    earnings: transactions,
    summary,
    weeklyEarnings,
    canWithdraw,
    lastWithdrawal,
    isLoading,
    refetch,
    requestWithdrawal,
    getWeekEarnings,
    exportTransactions,
    isWithdrawing: withdrawMutation.isPending,
  };
}
