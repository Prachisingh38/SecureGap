import type {
  DashboardSummary,
  Finding,
  FindingInput,
  Gap,
  GapStatusUpdate,
  ComplianceControl,
  ComplianceStandard,
} from './types';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit & { expectBlob?: boolean },
): Promise<T> {
  const expectBlob = options?.expectBlob ?? false;
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
      ...options,
    });
  } catch (err) {
    throw new ApiError(
      'Unable to reach the API server. Check that the backend is running.',
      0,
      err,
    );
  }

  if (!res.ok) {
    let detail: unknown;
    try {
      detail = await res.json();
    } catch {
      try {
        detail = await res.text();
      } catch {
        detail = undefined;
      }
    }
    const message =
      (detail as { detail?: string })?.detail ??
      `Request failed (${res.status} ${res.statusText})`;
    throw new ApiError(message, res.status, detail);
  }

  if (expectBlob) return res.blob() as unknown as T;
  if (res.status === 204) return undefined as unknown as T;
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

export const api = {
  BASE_URL,
  dashboard: () => request<DashboardSummary>('/dashboard'),
  listFindings: () => request<Finding[]>('/findings'),
  getFinding: (id: number) => request<Finding>(`/findings/${id}`),
  createFinding: (data: FindingInput) =>
    request<Finding>('/findings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFinding: (id: number, data: Partial<FindingInput>) =>
    request<Finding>(`/findings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteFinding: (id: number) =>
    request<void>(`/findings/${id}`, { method: 'DELETE' }),
  listGaps: () => request<Gap[]>('/gaps'),
  updateGap: (gapId: number, data: GapStatusUpdate) =>
    request<Gap>(`/gaps/${gapId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  listControls: () => request<ComplianceControl[]>('/compliance/controls'),
  listStandards: () => request<ComplianceStandard[]>('/compliance/standards'),
  exportReport: () =>
    request<Blob>('/reports/export', { method: 'GET', expectBlob: true }),
};
