'use client';

import {
  ShieldCheck,
  ShieldAlert,
  Flag,
  Info,
  CheckCircle2,
  AlertTriangle,
  Activity,
  TrendingUp,
  Radar,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { SensorRow } from '@/lib/types';
import {
  getMineConfig,
  DEFAULT_MINE,
  PHYSICS_MISMATCH_THRESHOLD_C,
  Z_SCORE_ALERT_THRESHOLD,
} from '@/lib/thermal-config';
import {
  validateCrossSensors,
  type SpatialValidationResult,
} from '@/lib/anomaly-engine';

const mine = getMineConfig(DEFAULT_MINE);

// Sensor data derived from real zone names + anomaly engine signatures
const sensorData: SensorRow[] = [
  {
    id: '#104',
    location: mine.defaultZones[1],
    depth: `${(mine.depthMeters / 1000).toFixed(1)} km`,
    reported: 22.0,
    expected: 52.0,
    confidence: 94,
    zScore: 3.8,
    residual: -30.0,
    signature: 'JUMP',
    status: 'tamper',
  },
  {
    id: '#108',
    location: mine.defaultZones[0],
    depth: '0.0 km',
    reported: 18.0,
    expected: 18.2,
    confidence: 99,
    zScore: 0.3,
    residual: -0.2,
    signature: 'NORMAL',
    status: 'healthy',
  },
  {
    id: '#112',
    location: mine.defaultZones[2],
    depth: `${(mine.depthMeters / 1000 - 0.4).toFixed(1)} km`,
    reported: 35.4,
    expected: 35.1,
    confidence: 97,
    zScore: 0.7,
    residual: 0.3,
    signature: 'NORMAL',
    status: 'healthy',
  },
  {
    id: '#107',
    location: mine.defaultZones[3],
    depth: `${(mine.depthMeters / 1000).toFixed(1)} km`,
    reported: 48.0,
    expected: 33.8,
    confidence: 88,
    zScore: 2.1,
    residual: 14.2,
    signature: 'DRIFT',
    status: 'fault',
  },
  {
    id: '#099',
    location: mine.defaultZones[2],
    depth: `${(mine.depthMeters / 1000 - 1.2).toFixed(1)} km`,
    reported: 27.2,
    expected: 27.5,
    confidence: 98,
    zScore: 0.5,
    residual: -0.3,
    signature: 'NORMAL',
    status: 'healthy',
  },
];

// Cross-sensor spatial validation using real adjacencies
const zoneReadings: Record<string, number> = {};
mine.defaultZones.forEach((zone, i) => {
  zoneReadings[zone] = 25.0 + i * 1.8;
});
// Inject an anomaly: Zone 2 Stope Face diverges from neighbours
zoneReadings[mine.defaultZones[1]] = 31.5;

const spatialResults = validateCrossSensors(zoneReadings, mine.zoneAdjacencies);
const isolatedAnomalies = Object.entries(spatialResults).filter(([, r]) => r.isIsolatedAnomaly);
const consistentZones = Object.entries(spatialResults).filter(
  ([, r]) => r.status === 'SPATIALLY_CONSISTENT'
);

const healthyCount = sensorData.filter((s) => s.status === 'healthy').length;
const tamperCount = sensorData.filter((s) => s.status === 'tamper').length;
const faultCount = sensorData.filter((s) => s.status === 'fault').length;

function statusBadge(status: SensorRow['status']) {
  switch (status) {
    case 'healthy':
      return { label: 'HEALTHY', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
    case 'tamper':
      return { label: 'TAMPER — JUMP', className: 'bg-red-50 text-red-700 border-red-200', icon: ShieldAlert };
    case 'fault':
      return { label: 'CALIBRATION DRIFT', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle };
  }
}

function signatureBadge(sig: SensorRow['signature']) {
  switch (sig) {
    case 'NORMAL':
      return { label: 'NORMAL', className: 'bg-emerald-50 text-emerald-700' };
    case 'DRIFT':
      return { label: 'DRIFT', className: 'bg-amber-50 text-amber-700' };
    case 'JUMP':
      return { label: 'JUMP', className: 'bg-red-50 text-red-700' };
  }
}

export function PhysicsSecurity() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-blue-950">Physics Security &amp; Integrity</h2>
        <p className="text-slate-500 text-sm mt-1">
          Anomaly detection layer — incoming telemetry validated against thermodynamic physics calculations.
          Mismatch threshold: {PHYSICS_MISMATCH_THRESHOLD_C}°C · Z-score alert: |Z| ≥ {Z_SCORE_ALERT_THRESHOLD}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-blue-200 bg-white p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-950">{healthyCount}</p>
              <p className="text-xs text-slate-500 font-medium">Healthy Sensors</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-white p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-950">{tamperCount}</p>
              <p className="text-xs text-slate-500 font-medium">Tamper Flags (JUMP)</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-white p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-950">{faultCount}</p>
              <p className="text-xs text-slate-500 font-medium">Calibration Drifts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Integrity Table */}
      <div className="rounded-xl border border-blue-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-blue-950">Sensor Integrity Monitor</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Each reading is cross-checked against expected physics values derived from depth, rock type, and ventilation flow.
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Sensor ID</TableHead>
                <TableHead className="font-semibold">Location (Depth)</TableHead>
                <TableHead className="font-semibold">Reported</TableHead>
                <TableHead className="font-semibold">Expected</TableHead>
                <TableHead className="font-semibold">Residual</TableHead>
                <TableHead className="font-semibold">Z-Score</TableHead>
                <TableHead className="font-semibold">Signature</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sensorData.map((sensor) => {
                const badge = statusBadge(sensor.status);
                const sigBadge = signatureBadge(sensor.signature);
                const mismatch = Math.abs(sensor.residual) > PHYSICS_MISMATCH_THRESHOLD_C;
                return (
                  <TableRow key={sensor.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono font-medium text-blue-950">Sensor {sensor.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{sensor.location}</span>
                        <span className="text-xs text-slate-400">{sensor.depth}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn('font-mono tabular-nums font-medium', mismatch ? 'text-red-600' : 'text-slate-700')}>
                        {sensor.reported}°C
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono tabular-nums text-slate-600">{sensor.expected}°C</span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'font-mono tabular-nums text-xs',
                        Math.abs(sensor.residual) > PHYSICS_MISMATCH_THRESHOLD_C ? 'text-red-600 font-semibold' : 'text-slate-500'
                      )}>
                        {sensor.residual > 0 ? '+' : ''}{sensor.residual}°C
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'font-mono tabular-nums text-xs',
                        Math.abs(sensor.zScore) >= Z_SCORE_ALERT_THRESHOLD ? 'text-red-600 font-semibold' : 'text-slate-500'
                      )}>
                        {sensor.zScore > 0 ? '+' : ''}{sensor.zScore}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold', sigBadge.className)}>
                        {sigBadge.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', badge.className)}>
                        <badge.icon className="w-3.5 h-3.5" />
                        {badge.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {sensor.status === 'healthy' ? (
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
                          <Info className="w-3.5 h-3.5" /> Details
                        </button>
                      ) : (
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                          <Flag className="w-3.5 h-3.5" /> Flag for Inspection
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500">
            Physics model recalibrated 3 min ago · {sensorData.length} sensors monitored across {mine.defaultZones.length} zones
          </span>
        </div>
      </div>

      {/* Cross-Sensor Spatial Validation */}
      <div className="rounded-xl border border-blue-200 bg-white p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-semibold text-blue-950 flex items-center gap-2">
              <Radar className="w-5 h-5 text-blue-500" />
              Cross-Sensor Spatial Validation
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Adjacent RTD probes compared along ventilation flow paths. Isolated divergence flags localized tampering; sector-wide elevation indicates genuine thermal load.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">{consistentZones.length} Consistent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-slate-600">{isolatedAnomalies.length} Isolated Anomaly</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(spatialResults).map(([zone, result]: [string, SpatialValidationResult]) => (
            <div
              key={zone}
              className={cn(
                'rounded-lg border p-4 transition-all',
                result.isIsolatedAnomaly
                  ? 'border-red-200 bg-red-50'
                  : result.status === 'NO_NEIGHBORS_CONFIGURED'
                    ? 'border-slate-200 bg-slate-50'
                    : 'border-emerald-200 bg-emerald-50'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800 truncate pr-2">{zone}</span>
                <span
                  className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap',
                    result.isIsolatedAnomaly
                      ? 'bg-red-100 text-red-700'
                      : result.status === 'NO_NEIGHBORS_CONFIGURED'
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-emerald-100 text-emerald-700'
                  )}
                >
                  {result.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {result.avgNeighborTempC !== null && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Avg neighbour: {result.avgNeighborTempC}°C</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span>Delta: {result.deltaFromNeighborsC}°C</span>
                </div>
              </div>
              {result.evaluatedNeighbors && result.evaluatedNeighbors.length > 0 && (
                <p className="text-xs text-slate-400 mt-2">
                  Compared with: {result.evaluatedNeighbors.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
