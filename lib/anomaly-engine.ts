// ThermalTwin (MineFlow AI) — Anomaly Detection & Physics-Aware Security Engine
// TypeScript port of anomaly.py
// Capabilities: rolling Z-score, physics mismatch detection, DRIFT/JUMP signature
// classification, worker-risk ranking, cross-sensor spatial validation.

import {
  ROLLING_WINDOW_SIZE,
  Z_SCORE_ALERT_THRESHOLD,
  PHYSICS_MISMATCH_THRESHOLD_C,
  SIGNATURE_JUMP_THRESHOLD_C,
  SIGNATURE_NORMAL,
  SIGNATURE_DRIFT,
  SIGNATURE_JUMP,
  STATUTORY_WET_BULB_LIMIT,
  WET_BULB_CAUTION_LIMIT,
  type Signature,
} from '@/lib/thermal-config';

// =====================================================================
// 1. STATISTICAL LAYER: ROLLING Z-SCORE
// =====================================================================
export function calculateRollingZscore(
  values: number[],
  window: number = ROLLING_WINDOW_SIZE,
  minPeriods: number = 3,
  epsilon: number = 1e-4
): number[] {
  const n = values.length;
  const zScores: number[] = new Array(n).fill(0.0);

  for (let i = 0; i < n; i++) {
    const startIdx = Math.max(0, i - window + 1);
    const sub = values.slice(startIdx, i + 1);
    const k = sub.length;
    if (k < minPeriods) {
      zScores[i] = 0.0;
      continue;
    }
    const mean = sub.reduce((a, b) => a + b, 0) / k;
    const variance =
      k > 1 ? sub.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / (k - 1) : 0.0;
    let std = Math.sqrt(variance);
    if (std < epsilon) std = epsilon;
    zScores[i] = (values[i] - mean) / std;
  }
  return zScores;
}

// =====================================================================
// 2. PHYSICS-AWARE SECURITY LAYER: MISMATCH DETECTION
// =====================================================================
export interface MismatchResult {
  residuals: number[];
  absResiduals: number[];
  isMismatch: boolean[];
  directions: ('OVER_REPORTING' | 'UNDER_REPORTING' | 'MATCH')[];
}

export function detectPhysicsMismatch(
  reported: number[],
  predicted: number[],
  thresholdC: number = PHYSICS_MISMATCH_THRESHOLD_C
): MismatchResult {
  if (reported.length !== predicted.length) {
    throw new Error(`Length mismatch: reported has ${reported.length} items, predicted has ${predicted.length}.`);
  }

  const residuals: number[] = [];
  const absResiduals: number[] = [];
  const isMismatch: boolean[] = [];
  const directions: ('OVER_REPORTING' | 'UNDER_REPORTING' | 'MATCH')[] = [];

  for (let i = 0; i < reported.length; i++) {
    const diff = Math.round((reported[i] - predicted[i]) * 1000) / 1000;
    const absDiff = Math.round(Math.abs(diff) * 1000) / 1000;
    const mismatch = absDiff >= thresholdC;
    const direction = mismatch ? (diff > 0 ? 'OVER_REPORTING' : 'UNDER_REPORTING') : 'MATCH';

    residuals.push(diff);
    absResiduals.push(absDiff);
    isMismatch.push(mismatch);
    directions.push(direction);
  }

  return { residuals, absResiduals, isMismatch, directions };
}

// =====================================================================
// 3. SIGNATURE CLASSIFICATION: DRIFT VS JUMP
// =====================================================================
export function classifySignatureSeries(
  residuals: number[],
  jumpRateThreshold: number = SIGNATURE_JUMP_THRESHOLD_C,
  mismatchThreshold: number = PHYSICS_MISMATCH_THRESHOLD_C,
  zScores?: number[],
  zThreshold: number = Z_SCORE_ALERT_THRESHOLD
): Signature[] {
  const n = residuals.length;
  const signatures: Signature[] = new Array(n).fill(SIGNATURE_NORMAL);

  for (let i = 0; i < n; i++) {
    const curRes = residuals[i];
    const absRes = Math.abs(curRes);
    const curZ = zScores && i < zScores.length ? Math.abs(zScores[i]) : 0.0;
    const isAnomalous = absRes >= mismatchThreshold || curZ >= zThreshold;

    if (!isAnomalous) {
      signatures[i] = SIGNATURE_NORMAL;
      continue;
    }

    let rateOfChange: number;
    if (i === 0) {
      rateOfChange = absRes;
    } else {
      const prevRes = residuals[i - 1];
      rateOfChange = Math.abs(curRes - prevRes);
    }

    if (rateOfChange >= jumpRateThreshold) {
      signatures[i] = SIGNATURE_JUMP;
    } else {
      signatures[i] = SIGNATURE_DRIFT;
    }
  }

  return signatures;
}

export function classifySingleReading(
  reported: number,
  predicted: number,
  prevReported?: number,
  prevPredicted?: number,
  zScore?: number,
  jumpThreshold: number = SIGNATURE_JUMP_THRESHOLD_C,
  mismatchThreshold: number = PHYSICS_MISMATCH_THRESHOLD_C,
  zThreshold: number = Z_SCORE_ALERT_THRESHOLD
): { signature: Signature; residual: number; rateOfChange: number } {
  const residual = Math.round((reported - predicted) * 1000) / 1000;
  const absRes = Math.abs(residual);
  let rateOfChange = 0.0;

  if (prevReported !== undefined && prevPredicted !== undefined) {
    const prevRes = prevReported - prevPredicted;
    rateOfChange = Math.round(Math.abs(residual - prevRes) * 1000) / 1000;
  }

  const isAnomalous =
    absRes >= mismatchThreshold || (zScore !== undefined && Math.abs(zScore) >= zThreshold);

  if (!isAnomalous) return { signature: SIGNATURE_NORMAL, residual, rateOfChange };
  if (rateOfChange >= jumpThreshold) return { signature: SIGNATURE_JUMP, residual, rateOfChange };
  return { signature: SIGNATURE_DRIFT, residual, rateOfChange };
}

// =====================================================================
// 4. WORKER-RISK RANKING ENGINE
// =====================================================================
export interface ZoneRiskResult {
  zone: string;
  priority: string;
  compositeRiskScore: number;
  wetBulbC: number;
  reportedTempC: number;
  predictedTempC: number;
  residualC: number;
  workerCount: number;
  signature: Signature;
  zScore: number;
  recommendedAction: string;
  rank: number;
}

export interface ZoneTelemetry {
  zone: string;
  reportedTemp: number;
  predictedTemp: number;
  wetBulbTemp: number;
  workerCount?: number;
  zScore?: number;
  signature?: Signature;
}

export function calculateZoneRiskScore(
  wetBulbTemp: number,
  signature: Signature,
  workerCount: number,
  zScore: number = 0.0,
  statutoryLimit: number = STATUTORY_WET_BULB_LIMIT,
  cautionLimit: number = WET_BULB_CAUTION_LIMIT
): { score: number; priority: string; action: string } {
  // 1. Thermal severity (0-65 pts)
  let thermalPts: number;
  if (wetBulbTemp >= statutoryLimit) {
    thermalPts = 50.0 + 15.0 * (wetBulbTemp - statutoryLimit);
  } else if (wetBulbTemp >= cautionLimit) {
    thermalPts = 25.0 + 25.0 * (wetBulbTemp - cautionLimit);
  } else {
    thermalPts = Math.max(0.0, (wetBulbTemp - 22.0) * 4.0);
  }

  // 2. Security signature severity (0-35 pts)
  let securityPts: number;
  if (signature === SIGNATURE_JUMP) securityPts = 35.0;
  else if (signature === SIGNATURE_DRIFT) securityPts = 15.0;
  else securityPts = 0.0;

  // 3. Worker exposure density (0-30 pts)
  const workerPts = Math.min(30.0, workerCount * 2.5);

  // 4. Statistical deviation (0-15 pts)
  const statPts = Math.min(15.0, Math.abs(zScore) * 3.0);

  const totalScore = Math.round((thermalPts + securityPts + workerPts + statPts) * 100) / 100;

  let priority: string;
  let action: string;

  if (totalScore >= 75.0 || (wetBulbTemp >= statutoryLimit && workerCount > 0)) {
    priority = 'Priority 1 — CRITICAL';
    action = `EMERGENCY MITIGATION: Statutory wet-bulb limit breached or active spoofing signature with ${workerCount} workers exposed. Immediately divert backup chilled air/water and deploy safety team.`;
  } else if (totalScore >= 45.0) {
    priority = 'Priority 2 — HIGH';
    action = `PROACTIVE VENTILATION: Temperature approaching caution limit or confirmed sensor tamper. Redirect auxiliary ventilation booster and inspect local RTD telemetry circuit.`;
  } else if (totalScore >= 25.0) {
    priority = 'Priority 3 — MEDIUM';
    action = `MONITOR & CALIBRATE: Mild thermal escalation or sensor calibration drift detected. Log for shift supervisor review and schedule routine maintenance.`;
  } else {
    priority = 'Priority 4 — LOW';
    action = 'NOMINAL: Operating within normal thermodynamic parameters and statutory MHSA standards.';
  }

  return { score: totalScore, priority, action };
}

export function rankWorkerRisk(
  zonesTelemetry: ZoneTelemetry[],
  occupancyCounts?: Record<string, number>
): ZoneRiskResult[] {
  const rankedList: ZoneRiskResult[] = zonesTelemetry.map((r) => {
    const zone = r.zone;
    const rep = r.reportedTemp;
    const pred = r.predictedTemp;
    const wb = r.wetBulbTemp;
    const workers = occupancyCounts && zone in occupancyCounts ? occupancyCounts[zone] : (r.workerCount ?? 0);
    const z = r.zScore ?? 0.0;
    const sig = r.signature ?? SIGNATURE_NORMAL;

    const { score, priority, action } = calculateZoneRiskScore(wb, sig, workers, z);

    return {
      zone,
      priority,
      compositeRiskScore: score,
      wetBulbC: Math.round(wb * 100) / 100,
      reportedTempC: Math.round(rep * 100) / 100,
      predictedTempC: Math.round(pred * 100) / 100,
      residualC: Math.round((rep - pred) * 100) / 100,
      workerCount: workers,
      signature: sig,
      zScore: Math.round(z * 100) / 100,
      recommendedAction: action,
      rank: 0,
    };
  });

  rankedList.sort((a, b) => b.compositeRiskScore - a.compositeRiskScore);
  rankedList.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return rankedList;
}

// =====================================================================
// 5. CROSS-SENSOR SPATIAL VALIDATION
// =====================================================================
export interface SpatialValidationResult {
  valid: boolean;
  status: 'NO_NEIGHBORS_CONFIGURED' | 'LOCALIZED_PROBE_ANOMALY' | 'SPATIALLY_CONSISTENT';
  avgNeighborTempC: number | null;
  deltaFromNeighborsC: number;
  isIsolatedAnomaly: boolean;
  evaluatedNeighbors?: string[];
}

export function validateCrossSensors(
  zoneReadings: Record<string, number>,
  adjacencies?: Record<string, string[]>,
  maxNeighborDeltaC: number = 3.5
): Record<string, SpatialValidationResult> {
  const results: Record<string, SpatialValidationResult> = {};

  for (const [zone, temp] of Object.entries(zoneReadings)) {
    const neighbors = adjacencies?.[zone] ?? [];
    const validNeighbors = neighbors.filter((n) => n in zoneReadings);

    if (validNeighbors.length === 0) {
      results[zone] = {
        valid: true,
        status: 'NO_NEIGHBORS_CONFIGURED',
        avgNeighborTempC: null,
        deltaFromNeighborsC: 0.0,
        isIsolatedAnomaly: false,
      };
      continue;
    }

    const neighborTemps = validNeighbors.map((n) => zoneReadings[n]);
    const avgNeighbor = neighborTemps.reduce((a, b) => a + b, 0) / neighborTemps.length;
    const delta = Math.round(Math.abs(temp - avgNeighbor) * 100) / 100;
    const isIsolated = delta >= maxNeighborDeltaC;

    results[zone] = {
      valid: !isIsolated,
      status: isIsolated ? 'LOCALIZED_PROBE_ANOMALY' : 'SPATIALLY_CONSISTENT',
      avgNeighborTempC: Math.round(avgNeighbor * 100) / 100,
      deltaFromNeighborsC: delta,
      isIsolatedAnomaly: isIsolated,
      evaluatedNeighbors: validNeighbors,
    };
  }

  return results;
}

// =====================================================================
// 6. INTEGRATED TELEMETRY PIPELINE
// =====================================================================
export interface TelemetrySummary {
  zone: string;
  latestReportedC: number;
  latestPredictedC: number;
  latestResidualC: number;
  latestZScore: number;
  latestSignature: Signature;
  latestWetBulbC: number;
  workerCount: number;
  compositeRiskScore: number;
  priority: string;
  recommendedAction: string;
  series: {
    reported: number[];
    predicted: number[];
    residuals: number[];
    zScores: number[];
    signatures: Signature[];
  };
}

export function processTelemetryStream(
  reportedTemps: number[],
  predictedTemps: number[],
  wetBulbTemps?: number[],
  workerCounts?: number[],
  zoneName: string = 'Zone 2 Stope Face'
): TelemetrySummary {
  const n = reportedTemps.length;
  if (predictedTemps.length !== n) {
    throw new Error('Reported and predicted arrays must have the same length.');
  }

  const mismatchData = detectPhysicsMismatch(reportedTemps, predictedTemps);
  const residuals = mismatchData.residuals;
  const zScores = calculateRollingZscore(residuals);
  const signatures = classifySignatureSeries(residuals, undefined, undefined, zScores);

  const latestReported = reportedTemps[n - 1];
  const latestPredicted = predictedTemps[n - 1];
  const latestResidual = residuals[n - 1];
  const latestZ = zScores[n - 1];
  const latestSig = signatures[n - 1];
  const latestWb = wetBulbTemps && wetBulbTemps.length === n ? wetBulbTemps[n - 1] : latestReported * 0.85;
  const latestWorkers = workerCounts && workerCounts.length === n ? workerCounts[n - 1] : 15;

  const { score, priority, action } = calculateZoneRiskScore(latestWb, latestSig, latestWorkers, latestZ);

  return {
    zone: zoneName,
    latestReportedC: Math.round(latestReported * 100) / 100,
    latestPredictedC: Math.round(latestPredicted * 100) / 100,
    latestResidualC: Math.round(latestResidual * 100) / 100,
    latestZScore: Math.round(latestZ * 100) / 100,
    latestSignature: latestSig,
    latestWetBulbC: Math.round(latestWb * 100) / 100,
    workerCount: latestWorkers,
    compositeRiskScore: score,
    priority,
    recommendedAction: action,
    series: {
      reported: reportedTemps,
      predicted: predictedTemps,
      residuals,
      zScores,
      signatures,
    },
  };
}
