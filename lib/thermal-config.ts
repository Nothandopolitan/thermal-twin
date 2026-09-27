// ThermalTwin (MineFlow AI) — System Configuration (TypeScript port of config.py)
// Single source of truth for mine specs, thermodynamic limits, anomaly thresholds,
// and Surface Engine portal configuration.

// =====================================================================
// 1. STATUTORY & THERMODYNAMIC CONSTANTS
// =====================================================================
export const STATUTORY_WET_BULB_LIMIT = 28.0; // °C — SA MHSA wet-bulb limit
export const WET_BULB_CAUTION_LIMIT = 27.0; // °C — proactive caution threshold
export const STATUTORY_HEAT_STROKE_CRITICAL = 32.5; // °C — emergency evacuation
export const CHILLED_WATER_SUPPLY_TEMP_C = 5.0; // °C
export const ICE_BRINE_SUPPLY_TEMP_C = 0.5; // °C
export const PREDICTION_LEAD_TIME_MINUTES = 25; // minutes
export const TELEMETRY_INTERVAL_SECONDS = 60; // seconds

// =====================================================================
// 2. ANOMALY & SECURITY DETECTION THRESHOLDS
// =====================================================================
export const ROLLING_WINDOW_SIZE = 20;
export const Z_SCORE_ALERT_THRESHOLD = 2.5;
export const Z_SCORE_CRITICAL_THRESHOLD = 3.5;
export const PHYSICS_MISMATCH_THRESHOLD_C = 1.5; // °C
export const SIGNATURE_JUMP_THRESHOLD_C = 0.8; // °C per sample
export const SIGNATURE_DRIFT_MIN_TIMESTEPS = 3;
export const MAX_PLAUSIBLE_NEIGHBOR_DELTA_C = 3.5; // °C

export const SIGNATURE_NORMAL = 'NORMAL' as const;
export const SIGNATURE_DRIFT = 'DRIFT' as const;
export const SIGNATURE_JUMP = 'JUMP' as const;
export type Signature = typeof SIGNATURE_NORMAL | typeof SIGNATURE_DRIFT | typeof SIGNATURE_JUMP;

// =====================================================================
// 3. ICP STAGING & TARGET MINES
// =====================================================================
export interface MineConfig {
  name: string;
  phase: 1 | 2;
  depthMeters: number;
  vrtCelsius: number;
  operator: string;
  location: string;
  coolingMechanism: string;
  coolingSupplyTempC: number;
  baselineAirflowM3s: number;
  availableHeatCapacityMw: number;
  defaultZones: string[];
  zoneAdjacencies: Record<string, string[]>;
}

export const MINES_DATA: Record<string, MineConfig> = {
  Driefontein: {
    name: 'Driefontein',
    phase: 1,
    depthMeters: 3000,
    vrtCelsius: 62.0,
    operator: 'Sibanye-Stillwater',
    location: 'Carletonville, Far West Rand, Gauteng',
    coolingMechanism: 'Closed-loop chilled service water heat exchanger',
    coolingSupplyTempC: CHILLED_WATER_SUPPLY_TEMP_C,
    baselineAirflowM3s: 420.0,
    availableHeatCapacityMw: 14.5,
    defaultZones: ['Level 28 Haulage', 'Zone 2 Stope Face', 'Shaft 4 Return Airway', 'Zone 3 Sub-Station'],
    zoneAdjacencies: {
      'Level 28 Haulage': ['Zone 2 Stope Face', 'Zone 3 Sub-Station'],
      'Zone 2 Stope Face': ['Level 28 Haulage', 'Shaft 4 Return Airway'],
      'Shaft 4 Return Airway': ['Zone 2 Stope Face'],
      'Zone 3 Sub-Station': ['Level 28 Haulage'],
    },
  },
  'South Deep': {
    name: 'South Deep',
    phase: 1,
    depthMeters: 2990,
    vrtCelsius: 60.5,
    operator: 'Gold Fields',
    location: 'Westonaria, Gauteng',
    coolingMechanism: 'Closed-loop chilled service water heat exchanger',
    coolingSupplyTempC: CHILLED_WATER_SUPPLY_TEMP_C,
    baselineAirflowM3s: 480.0,
    availableHeatCapacityMw: 16.0,
    defaultZones: ['Trackless Ramp West', 'Zone 2 Ventilation Bypass', 'Main Orebody 95-3', 'South Stope 1'],
    zoneAdjacencies: {
      'Trackless Ramp West': ['Zone 2 Ventilation Bypass', 'Main Orebody 95-3'],
      'Zone 2 Ventilation Bypass': ['Trackless Ramp West', 'South Stope 1'],
      'Main Orebody 95-3': ['Trackless Ramp West'],
      'South Stope 1': ['Zone 2 Ventilation Bypass'],
    },
  },
  Kusasalethu: {
    name: 'Kusasalethu',
    phase: 1,
    depthMeters: 3200,
    vrtCelsius: 64.0,
    operator: 'Harmony Gold',
    location: 'Carletonville, Gauteng',
    coolingMechanism: 'Closed-loop chilled service water heat exchanger',
    coolingSupplyTempC: CHILLED_WATER_SUPPLY_TEMP_C,
    baselineAirflowM3s: 390.0,
    availableHeatCapacityMw: 13.8,
    defaultZones: ['Working Stope 88', 'Zone 2 Active Stope', 'Raise Bore Intake', 'De-cline 3 Haulage'],
    zoneAdjacencies: {
      'Working Stope 88': ['Zone 2 Active Stope', 'Raise Bore Intake'],
      'Zone 2 Active Stope': ['Working Stope 88', 'De-cline 3 Haulage'],
      'Raise Bore Intake': ['Working Stope 88'],
      'De-cline 3 Haulage': ['Zone 2 Active Stope'],
    },
  },
  Kloof: {
    name: 'Kloof',
    phase: 1,
    depthMeters: 3100,
    vrtCelsius: 63.0,
    operator: 'Sibanye-Stillwater',
    location: 'Westonaria, Gauteng',
    coolingMechanism: 'Closed-loop chilled service water heat exchanger',
    coolingSupplyTempC: CHILLED_WATER_SUPPLY_TEMP_C,
    baselineAirflowM3s: 410.0,
    availableHeatCapacityMw: 14.2,
    defaultZones: ['Sub-vertical Hoist Chamber', 'Zone 2 Stope Face', 'Reeves Shaft Level 40', 'East Return Airway'],
    zoneAdjacencies: {
      'Sub-vertical Hoist Chamber': ['Zone 2 Stope Face', 'Reeves Shaft Level 40'],
      'Zone 2 Stope Face': ['Sub-vertical Hoist Chamber', 'East Return Airway'],
      'Reeves Shaft Level 40': ['Sub-vertical Hoist Chamber'],
      'East Return Airway': ['Zone 2 Stope Face'],
    },
  },
  Mponeng: {
    name: 'Mponeng',
    phase: 2,
    depthMeters: 3840,
    vrtCelsius: 68.0,
    operator: 'Harmony Gold',
    location: 'Carletonville / Merafong, Gauteng',
    coolingMechanism: 'Melted ice-brine return flow interface',
    coolingSupplyTempC: ICE_BRINE_SUPPLY_TEMP_C,
    baselineAirflowM3s: 520.0,
    availableHeatCapacityMw: 22.0,
    defaultZones: ['Level 115 Stope', 'Zone 2 Deep Haulage', 'Sub-Shaft 3', 'Ventilation Incline 4'],
    zoneAdjacencies: {
      'Level 115 Stope': ['Zone 2 Deep Haulage', 'Sub-Shaft 3'],
      'Zone 2 Deep Haulage': ['Level 115 Stope', 'Ventilation Incline 4'],
      'Sub-Shaft 3': ['Level 115 Stope'],
      'Ventilation Incline 4': ['Zone 2 Deep Haulage'],
    },
  },
  TauTona: {
    name: 'TauTona',
    phase: 2,
    depthMeters: 3900,
    vrtCelsius: 66.5,
    operator: 'Care & Maintenance / Redevelopment',
    location: 'Carletonville, Gauteng',
    coolingMechanism: 'Melted ice-brine return flow interface',
    coolingSupplyTempC: ICE_BRINE_SUPPLY_TEMP_C,
    baselineAirflowM3s: 350.0,
    availableHeatCapacityMw: 18.5,
    defaultZones: ['Level 112 Workings', 'Zone 2 Return Way', 'Shaft 1 North', 'Old Stope West'],
    zoneAdjacencies: {
      'Level 112 Workings': ['Zone 2 Return Way', 'Shaft 1 North'],
      'Zone 2 Return Way': ['Level 112 Workings', 'Old Stope West'],
      'Shaft 1 North': ['Level 112 Workings'],
      'Old Stope West': ['Zone 2 Return Way'],
    },
  },
};

export const DEFAULT_MINE = 'Driefontein';

export function getMineConfig(mineName: string): MineConfig {
  const mine = MINES_DATA[mineName];
  if (!mine) throw new Error(`Mine '${mineName}' not found. Available: ${Object.keys(MINES_DATA).join(', ')}`);
  return mine;
}

export function getMinesByPhase(phase: 1 | 2): string[] {
  return Object.values(MINES_DATA).filter((m) => m.phase === phase).map((m) => m.name);
}

// =====================================================================
// 4. SURFACE ENGINE PORTAL (COMMERCIAL & COMMUNITY DOORS)
// =====================================================================
export interface CommercialDoorConfig {
  defaultHeatCapacityMw: number;
  defaultDiscountPercent: number;
  mandatoryLocalHiringQuota: number;
  eskomBaselineTariffZarKwh: number;
  tppaDefaultTermYears: number;
  tppaSummary: string;
}

export const COMMERCIAL_DOOR_CONFIG: CommercialDoorConfig = {
  defaultHeatCapacityMw: 14.5,
  defaultDiscountPercent: 25.0,
  mandatoryLocalHiringQuota: 60.0,
  eskomBaselineTariffZarKwh: 2.15,
  tppaDefaultTermYears: 5,
  tppaSummary:
    'Standard 5-year thermal Power Purchase Agreement (tPPA) with guaranteed 25% tariff discount against Eskom grid rates, fence-line thermal SLA, and verified 60% local hiring quota.',
};

export interface CommunityCard {
  id: string;
  title: string;
  focusGroup: string;
  allocatedMw: number;
  waterTempC: string;
  jobsCreated: string;
  description: string;
  slpMetric: string;
}

export const COMMUNITY_OPPORTUNITY_CARDS: CommunityCard[] = [
  {
    id: 'merafong_hydroponics',
    title: 'Merafong Youth Hydroponics Agripark',
    focusGroup: 'Local Youth & Women (Carletonville & Khutsong)',
    allocatedMw: 3.5,
    waterTempC: '24°C – 30°C',
    jobsCreated: '45 direct full-time, 90 seasonal',
    description:
      'Climate-controlled greenhouse agriculture cultivating high-value tomatoes, peppers, and leafy greens utilizing the fence-line heat exchanger loop to eliminate winter heating bills.',
    slpMetric: 'Food Security & Youth Employment',
  },
  {
    id: 'tilapia_aquaculture',
    title: 'Community Tilapia Aquaculture Facility',
    focusGroup: 'Youth Cooperatives & Persons with Disabilities',
    allocatedMw: 2.8,
    waterTempC: '26°C – 28°C',
    jobsCreated: '30 permanent jobs',
    description:
      'Recirculating aquaculture system (RAS) maintaining optimal 27°C fingerling growth temperatures year-round using secondary warm-water return circuits without fuel combustion.',
    slpMetric: 'High-Protein Production & Inclusive Enterprise',
  },
  {
    id: 'post_harvest_drying',
    title: 'Post-Harvest Agro-Processing & Drying Hub',
    focusGroup: 'Female Smallholder Farmers & Informal Traders',
    allocatedMw: 2.2,
    waterTempC: '40°C – 50°C',
    jobsCreated: '25 direct jobs',
    description:
      'Clean thermal warm-air drying beds for grains, dried fruit, moringa, and herbs, eliminating post-harvest spoilage and unlocking direct retail supply agreements.',
    slpMetric: 'Crop Spoilage Elimination & Women in Agriculture',
  },
  {
    id: 'sanitation_laundry',
    title: 'Eco-District Sanitation & Community Laundry Centre',
    focusGroup: 'Community Micro-Enterprises & Local Clinics',
    allocatedMw: 1.8,
    waterTempC: '55°C – 60°C',
    jobsCreated: '18 direct jobs',
    description:
      'Low-cost industrial hot water utility serving community laundries, clinic sanitation, and micro-processing, directly displacing coal and paraffin burning in surrounding townships.',
    slpMetric: 'Public Health & Energy Poverty Relief',
  },
];

export function getTotalAllocatedCommunityHeatMw(): number {
  return Math.round(COMMUNITY_OPPORTUNITY_CARDS.reduce((sum, c) => sum + c.allocatedMw, 0) * 100) / 100;
}

export interface CommercialSavings {
  annualThermalKwh: number;
  baselineCostZar: number;
  tppaTariffZar: number;
  annualOfftakerSavingsZar: number;
  annualMineRevenueZar: number;
}

export function calculateCommercialSavings(
  heatMw: number,
  discountPercent: number = COMMERCIAL_DOOR_CONFIG.defaultDiscountPercent,
  tariffZarKwh: number = COMMERCIAL_DOOR_CONFIG.eskomBaselineTariffZarKwh,
  annualOperatingHours: number = 8760
): CommercialSavings {
  const annualKwh = heatMw * 1000.0 * annualOperatingHours;
  const baselineCostZar = annualKwh * tariffZarKwh;
  const discountFactor = discountPercent / 100.0;
  const tppaTariffZar = tariffZarKwh * (1.0 - discountFactor);
  const annualSavingsZar = baselineCostZar * discountFactor;
  const mineRevenueZar = annualKwh * tppaTariffZar;
  return {
    annualThermalKwh: annualKwh,
    baselineCostZar,
    tppaTariffZar: Math.round(tppaTariffZar * 1000) / 1000,
    annualOfftakerSavingsZar: Math.round(annualSavingsZar * 100) / 100,
    annualMineRevenueZar: Math.round(mineRevenueZar * 100) / 100,
  };
}
