import { useEffect, useMemo, useState } from 'react';
import { Search, FileSearch, Lightbulb, ChevronDown, ChevronRight } from 'lucide-react';
import { api, ApiError } from '@/api/client';
import type { Gap, GapStatus } from '@/api/types';
import { PageHeader } from '@/components/shared/StatCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/states';
import {
  SeverityBadge,
  StatusBadge,
  gapStatusList,
  severityList,
} from '@/components/shared/badges';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function GapsPage() {
  const { toast } = useToast();
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listGaps();
      setGaps(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load gaps.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return gaps.filter((g) => {
      const matchesSearch =
        !q ||
        (g.finding_title ?? '').toLowerCase().includes(q) ||
        g.control_reference.toLowerCase().includes(q) ||
        (g.control_name ?? '').toLowerCase().includes(q) ||
        (g.description ?? '').toLowerCase().includes(q) ||
        g.standard.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' || g.status === statusFilter;
      const matchesSeverity =
        severityFilter === 'all' || g.severity === severityFilter;
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [gaps, search, statusFilter, severityFilter]);

  const updateStatus = async (gap: Gap, status: GapStatus) => {
    setUpdatingId(gap.gap_id);
    try {
      const updated = await api.updateGap(gap.gap_id, { status });
      setGaps((prev) =>
        prev.map((g) => (g.gap_id === gap.gap_id ? { ...g, ...updated, status } : g)),
      );
      toast({
        title: 'Gap status updated',
        description: `${gap.control_reference} → ${status}`,
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update gap.';
      toast({ title: 'Update failed', description: msg, variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Gaps"
        description="Findings mapped to ISO 27001 and GDPR controls with remediation guidance."
      />

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gaps by control, finding, or standard…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {gapStatusList.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            {severityList.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingState label="Loading compliance gaps…" />
      ) : error ? (
        <ErrorState title="Couldn't load gaps" message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileSearch className="h-6 w-6" />}
          title={gaps.length === 0 ? 'No compliance gaps mapped' : 'No matches'}
          message={
            gaps.length === 0
              ? 'Gaps are generated when findings are mapped to controls.'
              : 'Try adjusting your filters.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((gap) => {
            const isOpen = openId === gap.gap_id;
            return (
              <Card
                key={gap.gap_id}
                className={cn(
                  'transition-shadow hover:shadow-md',
                  gap.status === 'Verified' && 'border-green-200 bg-green-50/30',
                  gap.status === 'Open' && 'border-red-200/70',
                )}
              >
                <Collapsible
                  open={isOpen}
                  onOpenChange={(o) => setOpenId(o ? gap.gap_id : null)}
                >
                  <CardContent className="p-0">
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-start gap-3 p-4 text-left">
                        <div className="mt-1 text-muted-foreground">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-foreground">
                              {gap.control_reference}
                            </span>
                            <SeverityBadge severity={gap.severity} />
                            <StatusBadge status={gap.status} />
                            <Badge variant="secondary" className="font-normal">
                              {gap.standard}
                            </Badge>
                          </div>
                          <p className="mt-1.5 truncate text-sm font-medium text-foreground">
                            {gap.control_name ?? gap.finding_title ?? 'Compliance gap'}
                          </p>
                        </div>
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="space-y-4 border-t border-border px-4 py-4 text-sm">
                        {gap.finding_title ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Linked finding
                            </p>
                            <p className="mt-0.5 text-foreground">
                              {gap.finding_title}
                            </p>
                          </div>
                        ) : null}

                        {gap.description ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Gap description
                            </p>
                            <p className="mt-0.5 text-foreground">
                              {gap.description}
                            </p>
                          </div>
                        ) : null}

                        {gap.recommendation ? (
                          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
                              <Lightbulb className="h-3.5 w-3.5" />
                              Remediation recommendation
                            </p>
                            <p className="mt-1 text-sm text-amber-900">
                              {gap.recommendation}
                            </p>
                          </div>
                        ) : null}

                        <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-xs text-muted-foreground">
                            Update gap status
                          </span>
                          <Select
                            value={gap.status}
                            onValueChange={(v) => updateStatus(gap, v as GapStatus)}
                            disabled={updatingId === gap.gap_id}
                          >
                            <SelectTrigger className="w-full sm:w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {gapStatusList.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </CardContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
