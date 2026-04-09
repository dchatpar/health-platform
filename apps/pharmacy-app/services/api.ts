const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('authToken')
    : null;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        data?.message || `HTTP error ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),

  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),

  patch: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),

  // Medicine endpoints
  getMedicines: (params?: { search?: string; category?: string; lowStock?: boolean }) =>
    request<{ items: unknown[]; total: number }>('/medicines', { method: 'GET', params: params as Record<string, string | number | boolean | undefined> }),
  getMedicine: <T>(id: string) => request<T>(`/medicines/${id}`),
  createMedicine: <T>(data: unknown) => request<T>('/medicines', { method: 'POST', body: JSON.stringify(data) }),
  updateMedicine: <T>(id: string, data: unknown) => request<T>(`/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMedicine: <T>(id: string) => request<T>(`/medicines/${id}`, { method: 'DELETE' }),
  updateStock: <T>(id: string, quantity: number, reason: string) =>
    request<T>(`/medicines/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ quantity, reason }) }),

  // Order endpoints
  getOrders: (params?: { status?: string; search?: string }) =>
    request<{ items: unknown[]; total: number }>('/orders', { method: 'GET', params: params as Record<string, string | number | boolean | undefined> }),
  getOrder: <T>(id: string) => request<T>(`/orders/${id}`),
  updateOrderStatus: <T>(id: string, data: unknown) => request<T>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Claim endpoints
  getClaims: (params?: { status?: string; search?: string }) =>
    request<{ items: unknown[]; total: number }>('/claims', { method: 'GET', params: params as Record<string, string | number | boolean | undefined> }),
  getClaim: <T>(id: string) => request<T>(`/claims/${id}`),
  updateClaimStatus: <T>(id: string, data: unknown) => request<T>(`/claims/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Staff endpoints
  getStaff: () => request<{ items: unknown[]; total: number }>('/staff'),
  getStaffMember: <T>(id: string) => request<T>(`/staff/${id}`),
  createStaff: <T>(data: unknown) => request<T>('/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: <T>(id: string, data: unknown) => request<T>(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStaff: <T>(id: string) => request<T>(`/staff/${id}`, { method: 'DELETE' }),

  // Pharmacy settings
  getPharmacy: <T>() => request<T>('/pharmacy'),
  updatePharmacy: <T>(data: unknown) => request<T>('/pharmacy', { method: 'PUT', body: JSON.stringify(data) }),
};

export { ApiError };
export const api = apiClient;
export default apiClient;
