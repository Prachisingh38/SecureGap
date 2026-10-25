import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  FileSearch,
  ScrollText,
  FileBarChart,
  ShieldHalf,
  Github,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/findings', label: 'Security Findings', icon: ShieldCheck },
  { to: '/gaps', label: 'Compliance Gaps', icon: FileSearch },
  { to: '/controls', label: 'Compliance Controls', icon: ScrollText },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <ShieldHalf className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              SecureGap
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              Compliance Dashboard
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Monitoring
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-sidebar-foreground/70 hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    active ? 'text-white' : 'text-sidebar-foreground/50 group-hover:text-white',
                  )}
                />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/50">
            <Github className="h-3.5 w-3.5" />
            <span>ISO 27001 · GDPR</span>
          </div>
          <p className="mt-1 text-[11px] text-sidebar-foreground/40">
            Cybersecurity Compliance v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
