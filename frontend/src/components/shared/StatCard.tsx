import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  hint,
  loading,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: 'default' | 'danger' | 'warning' | 'info' | 'success';
  hint?: string;
  loading?: boolean;
}) {
  const toneClasses: Record<string, string> = {
    default: 'bg-primary/10 text-primary',
    danger: 'bg-red-500/10 text-red-600',
    warning: 'bg-amber-500/10 text-amber-600',
    info: 'bg-blue-500/10 text-blue-600',
    success: 'bg-green-500/10 text-green-600',
  };
  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {label}
            </p>
            {loading ? (
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                {value}
              </p>
            )}
            {hint ? (
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </div>
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              toneClasses[tone],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
