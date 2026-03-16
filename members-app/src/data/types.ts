export type PresetKey = 'Solo' | 'Couple' | 'Family' | 'Large Family';

export interface Preset {
  key: PresetKey;
  label: string;
  people: string;
  dailyKcal: number;
  multiplier: number;
  trips: number;
  totalCost: number;
  days: number;
}

export type FoodCategory =
  | 'Rice'
  | 'Pasta'
  | 'Oats'
  | 'Beans'
  | 'Peanut Butter'
  | 'Coconut Oil'
  | 'Powdered Milk'
  | 'Sweeteners'
  | 'Canned Fish'
  | 'Canned Meat'
  | 'Canned Produce'
  | 'Essentials';

export interface Item {
  index: number;
  name: string;
  baseQty: number;
  unit: string;
  baseCost: number;
  baseKcal: number;
  shelfLife: string;
  category: FoodCategory;
  milestone: 1 | 2 | 3 | 4;
}

export interface ScaledItem extends Item {
  qty: number;
  cost: number;
  kcal: number;
}

export interface TripGroup {
  tripNumber: number;
  items: ScaledItem[];
  totalCost: number;
}

export interface MilestoneGroup {
  milestone: 1 | 2 | 3 | 4;
  label: string;
  daysLabel: string;
  trips: TripGroup[];
}

export const CATEGORY_COLORS: Record<FoodCategory, string> = {
  Rice: '#4472C4',
  Pasta: '#ED7D31',
  Oats: '#A5A5A5',
  Beans: '#FFC000',
  'Peanut Butter': '#5B9BD5',
  'Coconut Oil': '#70AD47',
  'Powdered Milk': '#264478',
  Sweeteners: '#9B59B6',
  'Canned Fish': '#FF6384',
  'Canned Meat': '#36A2EB',
  'Canned Produce': '#FFCE56',
  Essentials: '#8B8B8B',
};

export const MILESTONE_LABELS: Record<1 | 2 | 3 | 4, { label: string; days: string }> = {
  1: { label: 'BUILDING YOUR 14-DAY SUPPLY', days: '14-Day Supply' },
  2: { label: 'BUILDING YOUR 30-DAY SUPPLY', days: '30-Day Supply' },
  3: { label: 'BUILDING YOUR 60-DAY SUPPLY', days: '60-Day Supply' },
  4: { label: 'BUILDING YOUR 90-DAY SUPPLY', days: '90-Day Supply (Complete)' },
};

export const MILESTONE_UNLOCK_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: '✦ MILESTONE UNLOCKED — 14-DAY SUPPLY ✦',
  2: '✦ MILESTONE UNLOCKED — 30-DAY SUPPLY ✦',
  3: '✦ MILESTONE UNLOCKED — 60-DAY SUPPLY ✦',
  4: '✦ MILESTONE UNLOCKED — 90-DAY SUPPLY — COMPLETE ✦',
};
