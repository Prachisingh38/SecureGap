import { useEffect, useMemo, useState } from 'react';
import {
  Download,
  FileBarChart,
  ShieldAlert,
  AlertTriangle,
  ScrollText,
  FileSearch,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { api, ApiError } from '@/api/client';
import type { Finding, Gap } from '@/api/types';
import { PageHeader } from '@/components/shared/StatCard';
import { StatCard } from '@/components/shared/StatCard';
import { LoadingState, ErrorState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { severityList } from '@/components/shared/badges';
import { cn } from '@/lib/utils';

export function ReportsPage() {
  const { toast } = useToast();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [f, g] = await Promise.all([api.listFindings(), api.listGaps()]);
      setFindings(Array.isArray(f) ? f : []);
      setGaps(Array.isArray(g) ? g : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const total = findings.length;
    const highSeverity = findings.filter(
      (f) => f.severity === 'Critical' || f.severity === 'High',
    ).length;
    const affectedControls = new Set(
      findings
        .map((f) => f.control_reference)
        .filter((c): c is string => Boolean(c)),
    ).size;
    const openGaps = gaps.filter((g) => g.status === 'Open').length;
    const verifiedGaps = gaps.filter((g) => g.status === 'Verified').length;

    const severityBreakdown = severityList.map((s) => ({
      name: s,
      count: findings.filter((f) => f.severity === s).length,
    }));

    const byStandard = new Map<string, number>();
    gaps.forEach((g) => byStandard.set(g.standard, (byStandard.get(g.standard) ?? 0) + 1));

    const statusBreakdown = ['Open', 'In Progress', 'Remediated', 'Verified'].map(
      (s) => ({ name: s, count: gaps.filter((g) => g.status === s).length }),
    );

    return {
      total,
      highSeverity,
      affectedControls,
      openGaps,
      verifiedGaps,
      severityBreakdown,
      statusBreakdown,
      byStandard: Array.from(byStandard.entries()).map(([name, count]) => ({
        name,
        count,
      })),
    };
  }, [findings, gaps]);

  const downloadCsv = async () => {
    setDownloading(true);
    try {
      const blob = await api.exportReport();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const now = new Date();
      a.download = `securegap-report-${now.toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: 'Report downloaded',
        description: `securegap-report-${now.toISOString().slice(0, 10)}.csv`,
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to download report.';
      toast({ title: 'Download failed', description: msg, variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoadingState label="Compiling report data…" />;
  if (error)
    return (
      <ErrorState title="Couldn't load report data" message={error} onRetry={load} />
    );

  const maxSeverity = Math.max(1, ...stats.severityBreakdown.map((s) => s.count));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Reports"
        description="Summary statistics across findings and compliance gaps. Export as CSV."
        actions={
          <Button onClick={downloadCsv} disabled={downloading}>
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {downloading ? 'Preparing…' : 'Download CSV report'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Findings" value={stats.total} icon={ShieldAlert} tone="default" />
        <StatCard label="High Severity" value={stats.highSeverity} icon={AlertTriangle} tone="danger" />
        <StatCard label="Affected Controls" value={stats.affectedControls} icon={ScrollText} tone="info" />
        <StatCard label="Open Gaps" value={stats.openGaps} icon={FileSearch} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Findings by Severity</CardTitle>
            <CardDescription>
              Count of findings across each severity tier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.severityBreakdown.map((s) => (
              <div key={s.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{s.name}</span>
                  <span className="text-muted-foreground">{s.count}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full', severityBarClass(s.name))}
                    style={{ width: `${(s.count / maxSeverity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gap Status Breakdown</CardTitle>
            <CardDescription>
              Lifecycle distribution of mapped compliance gaps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.statusBreakdown.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn('h-2.5 w-2.5 rounded-full', statusDotClass(s.name))} />
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                </div>
                <span className="text-sm font-semibold">{s.count}</span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3 text-green-800">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Verified gaps</span>
              </div>
              <span className="text-sm font-semibold">{stats.verifiedGaps}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-4 w-4 text-primary" />
              Gaps by Standard
            </CardTitle>
            <CardDescription>Compliance coverage across frameworks</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {stats.byStandard.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No standards mapped to gaps yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {stats.byStandard.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
                >
                  <div className="text-2xl font-semibold text-primary">
                    {s.count}
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-1">{s.name}</Badge>
                    <p className="text-xs text-muted-foreground">mapped gaps</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function severityBarClass(name: string): string {
  switch (name) {
    case 'Critical':
      return 'bg-red-500';
    case 'High':
      return 'bg-orange-500';
    case 'Medium':
      return 'bg-amber-500';
    case 'Low':
      return 'bg-yellow-500';
    default:
      return 'bg-slate-400';
  }
}

function statusDotClass(name: string): string {
  switch (name) {
    case 'Open':
      return 'bg-red-500';
    case 'In Progress':
      return 'bg-blue-500';
    case 'Remediated':
      return 'bg-amber-500';
    case 'Verified':
      return 'bg-green-500';
    default:
      return 'bg-slate-400';
  }
}
