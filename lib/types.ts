export type Role = 'mine' | 'community';

export type ViewKey = 'underground' | 'security';

export interface TelemetryPoint {
  time: string;
  actual: number;
  predicted: number;
}

export interface SensorRow {
  id: string;
  location: string;
  depth: string;
  reported: number;
  expected: number;
  confidence: number;
  zScore: number;
  residual: number;
  signature: 'NORMAL' | 'DRIFT' | 'JUMP';
  status: 'healthy' | 'tamper' | 'fault';
}

export interface OffTakeOpportunity {
  id: string;
  name: string;
  requiredHeat: string;
  waterTemp: string;
  targetImpact: string;
  status: 'active' | 'open';
  statusLabel: string;
  cta: string;
  description: string;
}
