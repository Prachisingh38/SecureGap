import { cn } from '@/lib/utils';
import type { Severity, GapStatus, FindingStatus } from '@/api/types';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  CircleAlert,
  Clock,
  Loader,
  CheckCircle2,
} from 'lucide-react';

const severityConfig: Record<
  Severity,
  { label: string; className: string; dot: string; icon: typeof ShieldAlert }
> = {
  Critical: {
    label: 'Critical',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
    dot: 'bg-red-500',
    icon: ShieldAlert,
  },
  High: {
    label: 'High',
    className:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900',
    dot: 'bg-orange-500',
    icon: AlertTriangle,
  },
  Medium: {
    label: 'Medium',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    dot: 'bg-amber-500',
    icon: CircleAlert,
  },
  Low: {
    label: 'Low',
    className:
      'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900',
    dot: 'bg-yellow-500',
    icon: ShieldQuestion,
  },
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const cfg = severityConfig[severity] ?? severityConfig.Low;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        cfg.className,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

export const severityList: Severity[] = ['Critical', 'High', 'Medium', 'Low'];

const statusConfig: Record<
  GapStatus,
  { label: string; className: string; dot: string; icon: typeof Clock }
> = {
  Open: {
    label: 'Open',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
    dot: 'bg-red-500',
    icon: CircleAlert,
  },
  'In Progress': {
    label: 'In Progress',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
    dot: 'bg-blue-500',
    icon: Loader,
  },
  Remediated: {
    label: 'Remediated',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  Verified: {
    label: 'Verified',
    className:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900',
    dot: 'bg-green-500',
    icon: CheckCircle2,
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: GapStatus | FindingStatus;
  className?: string;
}) {
  const cfg = statusConfig[status as GapStatus] ?? statusConfig.Open;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        cfg.className,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

export const gapStatusList: GapStatus[] = [
  'Open',
  'In Progress',
  'Remediated',
  'Verified',
];

export function severityColorHex(severity: Severity): string {
  switch (severity) {
    case 'Critical':
      return '#dc2626';
    case 'High':
      return '#ea580c';
    case 'Medium':
      return '#d97706';
    case 'Low':
      return '#ca8a04';
    default:
      return '#94a3b8';
  }
}

export function statusColorHex(status: GapStatus): string {
  switch (status) {
    case 'Open':
      return '#dc2626';
    case 'In Progress':
      return '#2563eb';
    case 'Remediated':
      return '#d97706';
    case 'Verified':
      return '#16a34a';
    default:
      return '#94a3b8';
  }
}
