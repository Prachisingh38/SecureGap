import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const titles: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Security posture overview across your compliance program',
  },
  '/findings': {
    title: 'Security Findings',
    subtitle: 'Track, triage, and remediate detected security issues',
  },
  '/gaps': {
    title: 'Compliance Gaps',
    subtitle: 'Findings mapped to ISO 27001 and GDPR controls',
  },
  '/controls': {
    title: 'Compliance Controls',
    subtitle: 'Browse standards, control references, and requirements',
  },
  '/reports': {
    title: 'Reports',
    subtitle: 'Summary statistics and exportable compliance reports',
  },
};

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const location = useLocation();
  const meta = titles[location.pathname] ?? {
    title: 'SecureGap',
    subtitle: '',
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex items-center gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-6',
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 min-w-0">
        <h2 className="truncate text-lg font-semibold text-foreground md:text-xl">
          {meta.title}
        </h2>
        <p className="truncate text-xs text-muted-foreground md:text-sm">
          {meta.subtitle}
        </p>
      </div>

      <div className="hidden lg:block w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Quick search…"
            className="h-9 pl-9"
          />
        </div>
      </div>

      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </Button>
    </header>
  );
}

export function useSidebarState() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
