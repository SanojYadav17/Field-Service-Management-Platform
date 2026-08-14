import { AuthResponse, Customer, DashboardMetrics, Part, Site, User, WorkOrder, WorkOrderStatus, Priority, AnalyticsReport } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('keystone_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const data = await res.json();
      errorMsg = data.message || data.error || errorMsg;
    } catch {
      errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMsg);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  register: async (data: { fullName: string; email: string; password: string; role: string; phone?: string }): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    return handleResponse(res);
  },

  getMe: async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    return handleResponse<User>(res);
  },

  // Work Orders
  getWorkOrders: async (): Promise<WorkOrder[]> => {
    const res = await fetch(`${API_BASE}/work-orders`, { headers: getHeaders() });
    return handleResponse<WorkOrder[]>(res);
  },

  getMyWorkOrders: async (): Promise<WorkOrder[]> => {
    const res = await fetch(`${API_BASE}/work-orders/my`, { headers: getHeaders() });
    return handleResponse<WorkOrder[]>(res);
  },

  getCustomerWorkOrders: async (): Promise<WorkOrder[]> => {
    const res = await fetch(`${API_BASE}/work-orders/customer`, { headers: getHeaders() });
    return handleResponse<WorkOrder[]>(res);
  },

  getWorkOrderById: async (id: number): Promise<WorkOrder> => {
    const res = await fetch(`${API_BASE}/work-orders/${id}`, { headers: getHeaders() });
    return handleResponse<WorkOrder>(res);
  },

  createWorkOrder: async (data: { title: string; description?: string; priority: Priority; customerId: number; siteId: number; assignedToId?: number }): Promise<WorkOrder> => {
    const res = await fetch(`${API_BASE}/work-orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<WorkOrder>(res);
  },

  updateStatus: async (id: number, newStatus: WorkOrderStatus, note?: string): Promise<WorkOrder> => {
    const res = await fetch(`${API_BASE}/work-orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ newStatus, note }),
    });
    return handleResponse<WorkOrder>(res);
  },

  assignWorkOrder: async (id: number, techId: number): Promise<WorkOrder> => {
    const res = await fetch(`${API_BASE}/work-orders/${id}/assign/${techId}`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse<WorkOrder>(res);
  },

  logPartUsage: async (id: number, partId: number, qty: number): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/work-orders/${id}/parts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ partId, qty }),
    });
    return handleResponse(res);
  },

  logTime: async (id: number, minutes: number, note?: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/work-orders/${id}/time`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ minutes, note }),
    });
    return handleResponse(res);
  },

  getAuditHistory: async (id: number): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/work-orders/${id}/history`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getPartUsages: async (id: number): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/work-orders/${id}/parts`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getTimeLogs: async (id: number): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/work-orders/${id}/timelogs`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Customers & Sites
  getCustomers: async (): Promise<Customer[]> => {
    const res = await fetch(`${API_BASE}/customers`, { headers: getHeaders() });
    return handleResponse<Customer[]>(res);
  },

  createCustomer: async (data: { name: string; code: string; contactEmail: string; contactPhone?: string; address?: string }): Promise<Customer> => {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Customer>(res);
  },

  getSites: async (): Promise<Site[]> => {
    const res = await fetch(`${API_BASE}/sites`, { headers: getHeaders() });
    return handleResponse<Site[]>(res);
  },

  getSitesByCustomer: async (customerId: number): Promise<Site[]> => {
    const res = await fetch(`${API_BASE}/customers/${customerId}/sites`, { headers: getHeaders() });
    return handleResponse<Site[]>(res);
  },

  createSite: async (data: { name: string; address: string; customerId: number; contactPerson?: string }): Promise<Site> => {
    const res = await fetch(`${API_BASE}/sites`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Site>(res);
  },

  // Parts & Inventory
  getParts: async (): Promise<Part[]> => {
    const res = await fetch(`${API_BASE}/parts`, { headers: getHeaders() });
    return handleResponse<Part[]>(res);
  },

  createPart: async (data: { name: string; sku: string; unitCost: number; stockQty: number; minStockLevel?: number }): Promise<Part> => {
    const res = await fetch(`${API_BASE}/parts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Part>(res);
  },

  restockPart: async (id: number, qty: number): Promise<Part> => {
    const res = await fetch(`${API_BASE}/parts/${id}/restock?qty=${qty}`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse<Part>(res);
  },

  checkInWorkOrder: async (id: number, data: { latitude: number; longitude: number; address?: string }): Promise<WorkOrder> => {
    const res = await fetch(`${API_BASE}/work-orders/${id}/check-in`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<WorkOrder>(res);
  },

  signOffWorkOrder: async (id: number, data: { customerSignature: string; signedByPerson: string }): Promise<WorkOrder> => {
    const res = await fetch(`${API_BASE}/work-orders/${id}/sign-off`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<WorkOrder>(res);
  },

  // Reports & Users
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const res = await fetch(`${API_BASE}/reports/dashboard`, { headers: getHeaders() });
    return handleResponse<DashboardMetrics>(res);
  },

  getAnalyticsReport: async (): Promise<AnalyticsReport> => {
    const res = await fetch(`${API_BASE}/reports/analytics`, { headers: getHeaders() });
    return handleResponse<AnalyticsReport>(res);
  },

  downloadWorkOrdersCsv: async (): Promise<void> => {
    const res = await fetch(`${API_BASE}/reports/export/csv`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to export CSV report');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keystone_work_orders_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  getTechnicians: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/reports/technicians`, { headers: getHeaders() });
    return handleResponse<User[]>(res);
  },

  getAllUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/reports/users`, { headers: getHeaders() });
    return handleResponse<User[]>(res);
  },
};
