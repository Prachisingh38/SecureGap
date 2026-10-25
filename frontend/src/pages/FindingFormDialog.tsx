import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Finding, FindingInput, Severity, FindingStatus } from '@/api/types';
import { severityList, gapStatusList } from '@/components/shared/badges';

const empty: FindingInput = {
  title: '',
  description: '',
  severity: 'Medium',
  status: 'Open',
  control_id: '',
  control_reference: '',
  standard: 'ISO 27001',
  asset: '',
  remediation: '',
};

export function FindingFormDialog({
  open,
  onOpenChange,
  finding,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finding?: Finding | null;
  onSubmit: (data: FindingInput) => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState<FindingInput>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (finding) {
      setForm({
        title: finding.title ?? '',
        description: finding.description ?? '',
        severity: finding.severity ?? 'Medium',
        status: finding.status ?? 'Open',
        control_id: finding.control_id ?? '',
        control_reference: finding.control_reference ?? '',
        standard: finding.standard ?? 'ISO 27001',
        asset: finding.asset ?? '',
        remediation: finding.remediation ?? '',
      });
    } else {
      setForm(empty);
    }
    setErrors({});
  }, [finding, open]);

  const update = (field: keyof FindingInput, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.description.trim()) next.description = 'Description is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      control_id: form.control_id?.trim() || null,
      control_reference: form.control_reference?.trim() || null,
      standard: form.standard?.trim() || null,
      asset: form.asset?.trim() || null,
      remediation: form.remediation?.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {finding ? 'Edit Finding' : 'New Security Finding'}
          </DialogTitle>
          <DialogDescription>
            {finding
              ? 'Update the details of this security finding.'
              : 'Record a newly detected security finding.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Unencrypted data at rest on file server"
            />
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe the finding, how it was detected, and the risk it poses."
              rows={4}
            />
            {errors.description ? (
              <p className="text-xs text-destructive">{errors.description}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select
                value={form.severity}
                onValueChange={(v) => update('severity', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severityList.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => update('status', v)}
              >
                <SelectTrigger>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="control_reference">Control Reference</Label>
              <Input
                id="control_reference"
                value={form.control_reference ?? ''}
                onChange={(e) => update('control_reference', e.target.value)}
                placeholder="e.g. A.8.24 / Art.32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standard">Standard</Label>
              <Input
                id="standard"
                value={form.standard ?? ''}
                onChange={(e) => update('standard', e.target.value)}
                placeholder="ISO 27001 / GDPR"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="asset">Affected Asset</Label>
              <Input
                id="asset"
                value={form.asset ?? ''}
                onChange={(e) => update('asset', e.target.value)}
                placeholder="e.g. db-prod-01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="control_id">Control ID</Label>
              <Input
                id="control_id"
                value={form.control_id ?? ''}
                onChange={(e) => update('control_id', e.target.value)}
                placeholder="e.g. A.8.24"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remediation">Remediation</Label>
            <Textarea
              id="remediation"
              value={form.remediation ?? ''}
              onChange={(e) => update('remediation', e.target.value)}
              placeholder="Recommended steps to remediate this finding."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : finding ? (
                'Save changes'
              ) : (
                'Create finding'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteFindingDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
  finding,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
  finding?: Finding | null;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this finding?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{' '}
            <span className="font-medium text-foreground">
              {finding?.title ?? 'this finding'}
            </span>
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting…' : 'Delete finding'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
