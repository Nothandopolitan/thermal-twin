'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Snowflake, Users, ShieldCheck, ArrowRight, Factory } from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'mine' | 'community';

export default function RoleSelectionPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<Role | null>(null);

  const handleSelect = (role: Role) => {
    if (role === 'mine') {
      router.push('/login');
    } else {
      window.location.href = '/community';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-4 shadow-lg shadow-blue-500/30">
            <Snowflake className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-blue-950 tracking-tight">Thermal Twin</h1>
          <p className="text-blue-600 text-lg mt-2 font-medium">MineFlow AI</p>
          <p className="text-slate-500 mt-4 max-w-xl mx-auto">
            Choose how you want to enter the platform. Mine operators access the full
            control dashboard. Community members and businesses can explore heat off-take
            opportunities — no sign-in required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => handleSelect('mine')}
            onMouseEnter={() => setHovered('mine')}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              'group relative text-left rounded-2xl p-8 border transition-all duration-300 overflow-hidden',
              'bg-white border-blue-200 shadow-sm',
              'hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-2xl hover:shadow-blue-500/20',
              'hover:-translate-y-1',
              hovered === 'mine' && 'border-blue-500 shadow-2xl shadow-blue-500/20'
            )}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/60 rounded-full blur-3xl group-hover:bg-blue-200/60 transition-colors" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-100 mb-6 group-hover:bg-blue-500 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all">
                <Factory className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-blue-950 mb-2">Mine Operations</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Access the full control dashboard — predictive cooling,
                physics security, and heat monetization management.
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                <span>Go to dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSelect('community')}
            onMouseEnter={() => setHovered('community')}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              'group relative text-left rounded-2xl p-8 border transition-all duration-300 overflow-hidden',
              'bg-white border-blue-200 shadow-sm',
              'hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-2xl hover:shadow-blue-500/20',
              'hover:-translate-y-1',
              hovered === 'community' && 'border-blue-500 shadow-2xl shadow-blue-500/20'
            )}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-100/60 rounded-full blur-3xl group-hover:bg-cyan-200/60 transition-colors" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-cyan-100 mb-6 group-hover:bg-blue-500 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all">
                <Users className="w-7 h-7 text-cyan-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-blue-950 mb-2">Community &amp; Business</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Explore waste heat off-take opportunities, apply for partnerships, and
                view local employment programs. No sign-in needed.
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                <span>Enter community portal</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center justify-center gap-8 mt-10 text-slate-400 text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>Physics-secured telemetry</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-blue-500" />
            <span>Real-time thermal monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}
