'use client';

import { useState, useEffect } from 'react';
import { Bell, Clock, Thermometer, CheckCircle2, AlertTriangle, Factory, Droplets, Mountain } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { getMineConfig, DEFAULT_MINE } from '@/lib/thermal-config';

const mine = getMineConfig(DEFAULT_MINE);

const alerts = [
  { id: 1, level: 'warning', title: 'Zone 2 Stope Face thermal spike forecast', time: '2 min ago', icon: AlertTriangle },
  { id: 2, level: 'info', title: 'Sensor #108 health check passed', time: '8 min ago', icon: CheckCircle2 },
  { id: 3, level: 'warning', title: 'Sensor #104 mismatch detected — DRIFT signature', time: '15 min ago', icon: AlertTriangle },
];

export function DashboardHeader() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const depthKm = (mine.depthMeters / 1000).toFixed(1);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-blue-100 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="text-sm font-bold text-slate-800">{mine.name} Gold Mine</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Mountain className="w-3 h-3" /> {depthKm} km depth
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Thermometer className="w-3 h-3" /> {mine.vrtCelsius}°C VRT
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Droplets className="w-3 h-3" /> {mine.coolingSupplyTempC}°C chilled water
                </span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-soft ml-1" />
          </div>
          <div className="hidden md:flex flex-col leading-tight px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-xs font-medium text-slate-500">Operator</span>
            <span className="text-sm font-semibold text-slate-700">{mine.operator}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <Thermometer className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">NORMAL</span>
            <span className="text-xs text-emerald-600/80">31.2°C ambient rock</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-mono text-slate-600 tabular-nums">{time}</span>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button className="relative p-2 rounded-lg bg-blue-50 border border-blue-200 hover:border-blue-400 transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {alerts.length}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-semibold text-sm">Active Alerts</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {alerts.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <Icon
                        className={
                          alert.level === 'warning'
                            ? 'w-4 h-4 text-amber-500 mt-0.5 shrink-0'
                            : 'w-4 h-4 text-emerald-500 mt-0.5 shrink-0'
                        }
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug">{alert.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{alert.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
