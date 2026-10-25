import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Eye, ShieldCheck } from 'lucide-react';
import { api, ApiError } from '@/api/client';
import type { Finding, FindingInput } from '@/api/types';
import { PageHeader } from '@/components/shared/StatCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/states';
import { SeverityBadge, StatusBadge, severityList } from '@/components/shared/badges';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  FindingFormDialog,
  DeleteFindingDialog,
} from './FindingFormDialog';
import { useToast } from '@/hooks/use-toast';

export function FindingsPage() {
  const { toast } = useToast();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Finding | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Finding | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewTarget, setViewTarget] = useState<Finding | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listFindings();
      setFindings(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load findings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return findings.filter((f) => {
      const matchesSearch =
        !q ||
        f.title.toLowerCase().includes(q) ||
        (f.description ?? '').toLowerCase().includes(q) ||
        (f.control_reference ?? '').toLowerCase().includes(q) ||
        (f.asset ?? '').toLowerCase().includes(q);
      const matchesSeverity =
        severityFilter === 'all' || f.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [findings, search, severityFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (f: Finding) => {
    setEditing(f);
    setFormOpen(true);
  };

  const handleSubmit = async (data: FindingInput) => {
    setSubmitting(true);
    try {
      if (editing) {
        const updated = await api.updateFinding(editing.id, data);
        setFindings((prev) =>
          prev.map((f) => (f.id === editing.id ? { ...f, ...updated } : f)),
        );
        toast({ title: 'Finding updated', description: updated.title });
      } else {
        const created = await api.createFinding(data);
        setFindings((prev) => [created, ...prev]);
        toast({ title: 'Finding created', description: created.title });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save finding.';
      toast({ title: 'Save failed', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteFinding(deleteTarget.id);
      setFindings((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      toast({ title: 'Finding deleted', description: deleteTarget.title });
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to delete finding.';
      toast({ title: 'Delete failed', description: msg, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Findings"
        description="Search, create, edit, and delete detected security findings."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Finding
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, asset, or control…"
            className="pl-9"
          />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-full sm:w-44">
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
        <LoadingState label="Loading findings…" />
      ) : error ? (
        <ErrorState title="Couldn't load findings" message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="h-6 w-6" />}
          title={findings.length === 0 ? 'No findings yet' : 'No matches'}
          message={
            findings.length === 0
              ? 'Create your first security finding to get started.'
              : 'Try adjusting your search or severity filter.'
          }
          action={
            findings.length === 0 ? (
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New Finding
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((f) => (
            <Card
              key={f.id}
              className="group flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <SeverityBadge severity={f.severity} />
                  <StatusBadge status={f.status} />
                </div>
                <h3 className="mt-3 line-clamp-2 text-base font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {f.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {f.standard ? (
                    <Badge variant="secondary" className="font-normal">
                      {f.standard}
                    </Badge>
                  ) : null}
                  {f.control_reference ? (
                    <Badge variant="outline" className="font-normal">
                      {f.control_reference}
                    </Badge>
                  ) : null}
                  {f.asset ? (
                    <Badge variant="outline" className="font-normal">
                      {f.asset}
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewTarget(f)}
                  >
                    <Eye className="mr-1.5 h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(f)}
                  >
                    <Pencil className="mr-1.5 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      setDeleteTarget(f);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FindingFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(null);
        }}
        finding={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <DeleteFindingDialog
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          if (!o) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        loading={deleting}
        finding={deleteTarget}
      />

      {/* View dialog */}
      <Dialog
        open={!!viewTarget}
        onOpenChange={(o) => !o && setViewTarget(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewTarget?.title}</DialogTitle>
            <DialogDescription>
              Finding #{viewTarget?.id} ·{' '}
              {viewTarget?.detected_at
                ? new Date(viewTarget.detected_at).toLocaleDateString()
                : 'Detection date unknown'}
            </DialogDescription>
          </DialogHeader>
          {viewTarget ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <SeverityBadge severity={viewTarget.severity} />
                <StatusBadge status={viewTarget.status} />
                {viewTarget.standard ? (
                  <Badge variant="secondary">{viewTarget.standard}</Badge>
                ) : null}
                {viewTarget.control_reference ? (
                  <Badge variant="outline">{viewTarget.control_reference}</Badge>
                ) : null}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Description
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {viewTarget.description}
                </p>
              </div>

              {viewTarget.remediation ? (
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Remediation
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {viewTarget.remediation}
                  </p>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Affected asset</p>
                  <p className="font-medium">
                    {viewTarget.asset || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Control ID</p>
                  <p className="font-medium">
                    {viewTarget.control_id || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Standard</p>
                  <p className="font-medium">
                    {viewTarget.standard || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="font-medium">
                    {viewTarget.updated_at
                      ? new Date(viewTarget.updated_at).toLocaleString()
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
