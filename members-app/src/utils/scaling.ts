import type { Item, ScaledItem } from '../data/types';

export function scaleItems(items: Item[], multiplier: number): ScaledItem[] {
  return items.map((item) => ({
    ...item,
    qty: Math.round(item.baseQty * multiplier * 10) / 10,
    cost: Math.round(item.baseCost * multiplier * 100) / 100,
    kcal: Math.round(item.baseKcal * multiplier),
  }));
}
