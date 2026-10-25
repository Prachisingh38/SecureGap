import { useEffect, useMemo, useState } from 'react';
import { Search, ScrollText, Info } from 'lucide-react';
import { api, ApiError } from '@/api/client';
import type { ComplianceControl, ComplianceStandard } from '@/api/types';
import { PageHeader } from '@/components/shared/StatCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/states';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ControlsPage() {
  const [controls, setControls] = useState<ComplianceControl[]>([]);
  const [standards, setStandards] = useState<ComplianceStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [standardFilter, setStandardFilter] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, s] = await Promise.all([
        api.listControls(),
        api.listStandards(),
      ]);
      setControls(Array.isArray(c) ? c : []);
      setStandards(Array.isArray(s) ? s : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load controls.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const standardNames = useMemo(() => {
    const set = new Set<string>();
    standards.forEach((s) => set.add(s.name));
    controls.forEach((c) => c.standard && set.add(c.standard));
    return Array.from(set).sort();
  }, [standards, controls]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return controls.filter((c) => {
      const matchesSearch =
        !q ||
        c.control_reference.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        (c.control_id ?? '').toLowerCase().includes(q);
      const matchesStandard =
        standardFilter === 'all' || c.standard === standardFilter;
      return matchesSearch && matchesStandard;
    });
  }, [controls, search, standardFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Controls"
        description="Browse standards, control references, names, and descriptions."
        actions={
          <div className="flex flex-wrap gap-2">
            {standards.slice(0, 2).map((s) => (
              <Badge key={s.id} variant="secondary" className="gap-1.5 py-1.5">
                {s.code}
                <span className="text-muted-foreground">
                  {s.control_count != null ? `${s.control_count} controls` : ''}
                </span>
              </Badge>
            ))}
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search control reference, name, or description…"
            className="pl-9"
          />
        </div>
        <Select value={standardFilter} onValueChange={setStandardFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Standard" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All standards</SelectItem>
            {standardNames.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingState label="Loading controls…" />
      ) : error ? (
        <ErrorState title="Couldn't load controls" message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-6 w-6" />}
          title={
            controls.length === 0 ? 'No controls found' : 'No matches'
          }
          message={
            controls.length === 0
              ? 'Compliance controls will appear here once loaded from the backend.'
              : 'Try adjusting your search or standard filter.'
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-40">Reference</TableHead>
                    <TableHead className="min-w-[200px]">Control name</TableHead>
                    <TableHead className="w-36">Standard</TableHead>
                    <TableHead className="min-w-[260px]">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-primary">
                            {c.control_reference}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Control ID: {c.control_id}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground">
                          {c.name}
                        </span>
                        {c.category ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            · {c.category}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {c.standard}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {c.description}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
              Showing {filtered.length} of {controls.length} controls
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
