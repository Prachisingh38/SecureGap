// Domain types for SecureGap. The FastAPI backend defines these shapes; we
// mirror them here so the frontend stays type-safe without mock data.

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type GapStatus = 'Open' | 'In Progress' | 'Remediated' | 'Verified';
export type FindingStatus = 'Open' | 'In Progress' | 'Remediated' | 'Verified';

export interface DashboardSummary {
  total_findings: number;
  high_severity_findings: number;
  affected_controls: number;
  open_gaps: number;
  severity_breakdown?: Record<string, number>;
  gap_status_breakdown?: Record<string, number>;
  recent_findings?: Finding[];
  trend?: { date: string; count: number }[];
}

export interface Finding {
  id: number;
  title: string;
  description: string;
  severity: Severity;
  status: FindingStatus;
  control_id?: string | null;
  control_reference?: string | null;
  standard?: string | null;
  asset?: string | null;
  detected_at?: string | null;
  remediation?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface FindingInput {
  title: string;
  description: string;
  severity: Severity;
  status: FindingStatus;
  control_id?: string | null;
  control_reference?: string | null;
  standard?: string | null;
  asset?: string | null;
  remediation?: string | null;
}

export interface Gap {
  gap_id: number;
  finding_id?: number;
  finding_title?: string;
  severity: Severity;
  control_reference: string;
  control_name?: string;
  standard: string;
  description?: string;
  recommendation?: string;
  status: GapStatus;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GapStatusUpdate {
  status: GapStatus;
}

export interface ComplianceControl {
  id: number;
  control_id: string;
  control_reference: string;
  name: string;
  description: string;
  standard: string;
  category?: string;
}

export interface ComplianceStandard {
  id: number;
  name: string;
  code: string;
  description?: string;
  version?: string;
  control_count?: number;
}
