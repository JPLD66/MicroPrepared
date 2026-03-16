import type { ScaledItem, FoodCategory } from '../data/types';
import { CATEGORY_COLORS } from '../data/types';

export interface ProgressStats {
  totalKcal: number;
  purchasedKcal: number;
  totalCost: number;
  spentCost: number;
  daysOfFood: number;
  totalDays: number;
  tripsCompleted: number;
  totalTrips: number;
  milestoneProgress: { milestone: number; purchased: number; target: number }[];
  categoryBreakdown: { category: FoodCategory; kcal: number; color: string }[];
}

export function calcProgress(
  items: ScaledItem[],
  purchased: Record<number, boolean>,
  dailyKcal: number,
  totalTrips: number
): ProgressStats {
  let totalKcal = 0;
  let purchasedKcal = 0;
  let totalCost = 0;
  let spentCost = 0;

  const milestoneMap: Record<number, { purchased: number; target: number }> = {
    1: { purchased: 0, target: 0 },
    2: { purchased: 0, target: 0 },
    3: { purchased: 0, target: 0 },
    4: { purchased: 0, target: 0 },
  };

  const categoryMap: Map<FoodCategory, number> = new Map();

  for (const item of items) {
    totalKcal += item.kcal;
    totalCost += item.cost;
    milestoneMap[item.milestone].target += item.kcal;

    if (purchased[item.index]) {
      purchasedKcal += item.kcal;
      spentCost += item.cost;
      milestoneMap[item.milestone].purchased += item.kcal;
      categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + item.kcal);
    }
  }

  const daysOfFood = dailyKcal > 0 ? Math.floor(purchasedKcal / dailyKcal) : 0;

  // Count completed trips
  let tripsCompleted = 0;
  // We'll calculate this externally if needed; for now approximate from spend ratio
  tripsCompleted = Math.round((spentCost / totalCost) * totalTrips);

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, kcal]) => ({
      category,
      kcal,
      color: CATEGORY_COLORS[category] ?? '#999',
    }))
    .sort((a, b) => b.kcal - a.kcal);

  return {
    totalKcal,
    purchasedKcal,
    totalCost: Math.round(totalCost * 100) / 100,
    spentCost: Math.round(spentCost * 100) / 100,
    daysOfFood,
    totalDays: 91,
    tripsCompleted,
    totalTrips,
    milestoneProgress: [1, 2, 3, 4].map((m) => ({
      milestone: m,
      purchased: milestoneMap[m].purchased,
      target: milestoneMap[m].target,
    })),
    categoryBreakdown,
  };
}
