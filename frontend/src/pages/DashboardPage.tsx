import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  ShieldAlert,
  AlertTriangle,
  ScrollText,
  FileSearch,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '@/api/client';
import type { DashboardSummary, Finding } from '@/api/types';
import { StatCard, PageHeader } from '@/components/shared/StatCard';
import { LoadingState, ErrorState } from '@/components/shared/states';
import {
  SeverityBadge,
  StatusBadge,
  severityColorHex,
} from '@/components/shared/badges';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { severityList } from '@/components/shared/badges';

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await api.dashboard();
      setData(summary);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : 'Failed to load dashboard data.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error)
    return (
      <ErrorState
        title="Couldn't load the dashboard"
        message={error}
        onRetry={load}
      />
    );

  const severityBreakdown = data?.severity_breakdown ?? {};
  const gapStatusBreakdown = data?.gap_status_breakdown ?? {};

  const severityData = severityList
    .map((s) => ({ name: s, value: severityBreakdown[s] ?? 0 }))
    .filter((d) => d.value > 0);

  const statusData = Object.entries(gapStatusBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  const recent = data?.recent_findings ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Posture"
        description="Real-time overview of findings, gaps, and affected controls."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Findings"
          value={data?.total_findings ?? 0}
          icon={ShieldAlert}
          tone="default"
          hint="All detected issues"
          loading={!data}
        />
        <StatCard
          label="High Severity"
          value={data?.high_severity_findings ?? 0}
          icon={AlertTriangle}
          tone="danger"
          hint="Critical + High findings"
          loading={!data}
        />
        <StatCard
          label="Affected Controls"
          value={data?.affected_controls ?? 0}
          icon={ScrollText}
          tone="info"
          hint="Controls with findings"
          loading={!data}
        />
        <StatCard
          label="Open Gaps"
          value={data?.open_gaps ?? 0}
          icon={FileSearch}
          tone="warning"
          hint="Unresolved compliance gaps"
          loading={!data}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Findings by Severity
            </CardTitle>
            <CardDescription>
              Distribution of detected issues across severity levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {severityData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No findings recorded yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={severityData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--popover))',
                      color: 'hsl(var(--popover-foreground))',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={64}>
                    {severityData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={severityColorHex(entry.name as never)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-primary" />
              Gap Status
            </CardTitle>
            <CardDescription>
              Lifecycle stage of mapped compliance gaps
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No compliance gaps mapped yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={statusColor(entry.name)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--popover))',
                      color: 'hsl(var(--popover-foreground))',
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent findings */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent Findings</CardTitle>
            <CardDescription>Latest detected security issues</CardDescription>
          </div>
          <Link
            to="/findings"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No findings to display.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.slice(0, 6).map((f: Finding) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {f.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {f.control_reference ?? f.standard ?? 'Unmapped'} ·{' '}
                      {f.asset ?? 'No asset'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <SeverityBadge severity={f.severity} />
                    <StatusBadge status={f.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function statusColor(name: string): string {
  switch (name) {
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
