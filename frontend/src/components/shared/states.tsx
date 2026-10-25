import { cn } from '@/lib/utils';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoadingState({
  label = 'Loading…',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground',
        className,
      )}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {message ? (
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
        ) : null}
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon,
  action,
  className,
}: {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {message ? (
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {message}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
