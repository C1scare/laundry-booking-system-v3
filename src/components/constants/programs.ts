export interface Program {
  id: string;
  name: string;
  duration: number;
  waterUsage: number;  // Liters
  energyUsage: number; // kWh
  co2Impact: number;   // kg CO2
}

export const PROGRAMS: Program[] = [
  { 
    id: 'quick', 
    name: 'Quick Wash', 
    duration: 30,
    waterUsage: 30,
    energyUsage: 0.6,
    co2Impact: 0.3
  },
  { 
    id: 'normal', 
    name: 'Normal Wash', 
    duration: 45,
    waterUsage: 45,
    energyUsage: 0.9,
    co2Impact: 0.4
  },
  { 
    id: 'heavy', 
    name: 'Heavy Duty', 
    duration: 60,
    waterUsage: 60,
    energyUsage: 1.2,
    co2Impact: 0.6
  }
];