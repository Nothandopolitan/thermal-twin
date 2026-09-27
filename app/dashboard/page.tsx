'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Snowflake, Factory, ShieldCheck, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewKey } from '@/lib/types';
import { DashboardHeader } from '@/components/dashboard/header';
import { UndergroundEngine } from '@/components/dashboard/underground-engine';
import { PhysicsSecurity } from '@/components/dashboard/physics-security';
const navItems: { key: ViewKey; label: string; icon: typeof Factory; description: string }[] = [
  { key: 'underground', label: 'Underground Engine', icon: Factory, description: 'Predictive Cooling' },
  { key: 'security', label: 'Physics Security', icon: ShieldCheck, description: 'Integrity & Anomaly Layer' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewKey>('underground');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex">
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0',
          'bg-white border-r border-blue-100',
          'flex flex-col transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="px-5 py-5 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
              <Snowflake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-blue-950 font-bold text-sm leading-tight">Thermal Twin</h1>
              <p className="text-blue-500 text-xs font-medium">MineFlow AI</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
            Control Views
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveView(item.key);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all group',
                  active
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-500 hover:bg-blue-50/50 hover:text-slate-700 border border-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 mt-0.5',
                    active ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                <div>
                  <p className="text-sm font-medium leading-tight">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-blue-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
              OP
            </div>
            <div className="min-w-0">
              <p className="text-slate-700 text-xs font-medium truncate">operator@mineflow.ai</p>
              <p className="text-slate-400 text-xs">Mine Operator</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-blue-100">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-blue-950 font-semibold text-sm">Thermal Twin</span>
          <div className="w-5" />
        </div>

        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeView === 'underground' && <UndergroundEngine />}
          {activeView === 'security' && <PhysicsSecurity />}
        </main>
      </div>
    </div>
  );
}
