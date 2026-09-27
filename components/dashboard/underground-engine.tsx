'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Thermometer,
  Snowflake,
  TrendingUp,
  AlertTriangle,
  Activity,
  Zap,
  Clock,
  ArrowRight,
  Settings2,
  CheckCircle2,
  Wind,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getMineConfig,
  DEFAULT_MINE,
  PREDICTION_LEAD_TIME_MINUTES,
  STATUTORY_WET_BULB_LIMIT,
  WET_BULB_CAUTION_LIMIT,
} from '@/lib/thermal-config';

const mine = getMineConfig(DEFAULT_MINE);

const zoneStatus = mine.defaultZones.map((name, i) => {
  const baseTemp = 28 + i * 1.5;
  return {
    name,
    temp: `${baseTemp.toFixed(1)}°C`,
    rawTemp: baseTemp,
    status: i === 3 ? 'warning' : i === 2 ? 'watch' : 'normal',
  };
});

const allocatedCooling = (mine.availableHeatCapacityMw * 0.71).toFixed(1);
const headroom = (mine.availableHeatCapacityMw - parseFloat(allocatedCooling)).toFixed(1);

const kpiCards = [
  {
    id: 'capacity',
    label: 'Total Shaft Thermal Capacity',
    value: mine.availableHeatCapacityMw.toFixed(1),
    unit: 'MWth',
    icon: Zap,
    accent: 'blue' as const,
    sublabel: 'Rated cooling infrastructure',
  },
  {
    id: 'allocated',
    label: 'Allocated Cooling Capacity',
    value: allocatedCooling,
    unit: 'MWth',
    icon: Snowflake,
    accent: 'cyan' as const,
    sublabel: `Active draw across ${mine.defaultZones.length} zones`,
  },
  {
    id: 'headroom',
    label: 'Unallocated Headroom',
    value: headroom,
    unit: 'MWth',
    icon: Activity,
    accent: 'emerald' as const,
    sublabel: 'Available reserve buffer',
  },
  {
    id: 'forecast',
    label: `${PREDICTION_LEAD_TIME_MINUTES}-Min Heat Forecast`,
    value: '+2.4°C',
    unit: mine.defaultZones[3].split(' ')[0],
    icon: TrendingUp,
    accent: 'amber' as const,
    sublabel: `Projected spike in ${PREDICTION_LEAD_TIME_MINUTES} min`,
  },
];

const accentMap = {
  blue: { border: 'border-blue-200', text: 'text-blue-600', iconBg: 'bg-blue-100' },
  cyan: { border: 'border-cyan-200', text: 'text-cyan-600', iconBg: 'bg-cyan-100' },
  amber: { border: 'border-amber-200', text: 'text-amber-600', iconBg: 'bg-amber-100' },
  emerald: { border: 'border-emerald-200', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
};

function generateTelemetryData() {
  const points = [];
  const now = new Date();
  let actual = 30.8;
  let predicted = 30.8;

  for (let i = 29; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60000);
    const timeLabel = t.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
    const noise = (Math.random() - 0.5) * 0.6;
    actual = Math.max(28, Math.min(36, actual + noise + (i < 15 ? 0.08 : -0.02)));
    predicted = actual - 0.3 + (Math.random() - 0.5) * 0.4;
    points.push({
      time: timeLabel,
      actual: parseFloat(actual.toFixed(1)),
      predicted: parseFloat(predicted.toFixed(1)),
    });
  }
  return points;
}

export function UndergroundEngine() {
  const [data, setData] = useState(generateTelemetryData);
  const [executing, setExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [showOverride, setShowOverride] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        const now = new Date();
        const timeLabel = now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
        const noise = (Math.random() - 0.5) * 0.6;
        const actual = Math.max(28, Math.min(36, last.actual + noise + 0.05));
        const predicted = actual - 0.3 + (Math.random() - 0.5) * 0.4;
        next.shift();
        next.push({
          time: timeLabel,
          actual: parseFloat(actual.toFixed(1)),
          predicted: parseFloat(predicted.toFixed(1)),
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExecute = useCallback(() => {
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
      setExecuted(true);
    }, 1800);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-blue-950">Underground Engine</h2>
        <p className="text-slate-500 text-sm mt-1">
          Predictive cooling &amp; real-time thermal telemetry — {mine.name}, {mine.operator}. Depth {(mine.depthMeters / 1000).toFixed(1)} km · VRT {mine.vrtCelsius}°C.
        </p>
      </div>

      {/* Statutory limit reference bar */}
      <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
        <Thermometer className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="flex items-center gap-6 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Normal &lt; {WET_BULB_CAUTION_LIMIT}°C wet-bulb</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-slate-600">Caution {WET_BULB_CAUTION_LIMIT}°C – {STATUTORY_WET_BULB_LIMIT}°C</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-600">Statutory limit {STATUTORY_WET_BULB_LIMIT}°C (MHSA)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          const a = accentMap[card.accent];
          return (
            <div
              key={card.id}
              className={cn('rounded-xl border p-5 bg-white transition-all hover:shadow-lg animate-fade-in-up', a.border)}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn('inline-flex items-center justify-center w-10 h-10 rounded-lg', a.iconBg)}>
                  <Icon className={cn('w-5 h-5', a.text)} />
                </div>
                <span className={cn('text-xs font-medium px-2 py-1 rounded-full bg-blue-50', a.text)}>Live</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">{card.label}</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-bold text-blue-950 tabular-nums">{card.value}</span>
                <span className="text-sm font-medium text-slate-400">{card.unit}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">{card.sublabel}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-blue-200 bg-white p-5">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-semibold text-blue-950">Real-Time Thermal Telemetry</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Actual ambient temp vs AI physics model predicted temp ({PREDICTION_LEAD_TIME_MINUTES}-min advance)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-600 font-medium">Actual Temp</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-slate-600 font-medium">AI Predicted</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} interval={4} tickLine={false} axisLine={false} />
                <YAxis domain={[28, 36]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} unit="°C" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px', color: 'hsl(var(--popover-foreground))' }}
                  labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                />
                <ReferenceLine y={34} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: 'Warning threshold', position: 'insideTopRight', fill: '#f59e0b', fontSize: 10 }} />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2.5} dot={false} animationDuration={300} />
                <Line type="monotone" dataKey="predicted" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 4" dot={false} animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500">
              Updating every 5 seconds · 30-minute rolling window · Baseline airflow {mine.baselineAirflowM3s} m³/s
            </span>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5 animate-scale-in">
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 text-sm">Heat Budget Alert</h3>
                <span className="text-xs text-amber-600 font-medium">Action required</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Target</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">
                  {mine.defaultZones[3]} <span className="text-slate-400">(Depth {(mine.depthMeters / 1000).toFixed(1)} km)</span>
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recommendation</p>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  Thermal budget drawing down.{' '}
                  <span className="font-semibold">Option A:</span> Pause Drill Rig #2 for 15 mins (0 cost).{' '}
                  <span className="font-semibold">Option B:</span> Reduce worker density in {mine.defaultZones[3]}.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {!executed ? (
                <>
                  <button
                    onClick={handleExecute}
                    disabled={executing}
                    className={cn(
                      'w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2',
                      'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20',
                      'hover:from-blue-400 hover:to-blue-500 hover:shadow-lg hover:shadow-blue-500/30',
                      'disabled:opacity-60 disabled:cursor-not-allowed'
                    )}
                  >
                    {executing ? (
                      <><Activity className="w-4 h-4 animate-spin" /><span>Executing mitigation...</span></>
                    ) : (
                      <><Zap className="w-4 h-4" /><span>Execute Recommended Mitigation</span></>
                    )}
                  </button>
                  <button
                    onClick={() => setShowOverride((v) => !v)}
                    className="w-full py-2.5 rounded-lg font-semibold text-sm border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Settings2 className="w-4 h-4" /><span>Override</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Mitigation executed</p>
                    <p className="text-xs text-emerald-600/80">Drill Rig #2 paused for 15 min</p>
                  </div>
                </div>
              )}

              {showOverride && !executed && (
                <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 animate-fade-in space-y-2">
                  <p className="text-xs font-semibold text-slate-500">Override Options</p>
                  <button className="w-full text-left px-3 py-2 rounded-md bg-white border border-slate-200 hover:border-blue-400 text-sm text-slate-700 transition-colors flex items-center justify-between group">
                    <span>Option A: Pause Drill Rig #2</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-md bg-white border border-slate-200 hover:border-blue-400 text-sm text-slate-700 transition-colors flex items-center justify-between group">
                    <span>Option B: Reduce {mine.defaultZones[3]} density</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-md bg-white border border-slate-200 hover:border-blue-400 text-sm text-slate-700 transition-colors flex items-center justify-between group">
                    <span className="flex items-center gap-2"><Wind className="w-3.5 h-3.5" /> Manual: Increase ventilation flow</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-white p-5">
            <h3 className="font-semibold text-blue-950 text-sm mb-3">Zone Status Summary</h3>
            <div className="space-y-2.5">
              {zoneStatus.map((z) => (
                <div key={z.name} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium truncate pr-2">{z.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-mono tabular-nums text-slate-500">{z.temp}</span>
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        z.status === 'normal' && 'bg-emerald-500',
                        z.status === 'watch' && 'bg-amber-400',
                        z.status === 'warning' && 'bg-amber-500 animate-pulse-soft'
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
