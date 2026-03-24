import type { Preset } from './types';

export const PRESETS: Preset[] = [
  {
    key: 'Solo',
    label: 'Solo',
    people: '1 Adult',
    dailyKcal: 2200,
    multiplier: 0.5,
    trips: 12,
    totalCost: 141,
    days: 91,
  },
  {
    key: 'Couple',
    label: 'Couple',
    people: '2 Adults',
    dailyKcal: 4400,
    multiplier: 1.0,
    trips: 24,
    totalCost: 282,
    days: 91,
  },
  {
    key: 'Family',
    label: 'Family',
    people: '2 Adults + 1 Child',
    dailyKcal: 6000,
    multiplier: 1.36,
    trips: 35,
    totalCost: 383,
    days: 91,
  },
  {
    key: 'Large Family',
    label: 'Large Family',
    people: '2 Adults + 2 Children',
    dailyKcal: 6600,
    multiplier: 1.5,
    trips: 35,
    totalCost: 422,
    days: 91,
  },
];

export function getPreset(key: string): Preset {
  return PRESETS.find((p) => p.key === key) ?? PRESETS[1];
}
