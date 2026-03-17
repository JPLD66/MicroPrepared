import type { Item, ScaledItem } from '../data/types';

export function scaleItems(items: Item[], multiplier: number): ScaledItem[] {
  return items.map((item) => {
    const isDiscrete = item.unit === 'btl' || item.unit === 'jar';
    const qty = isDiscrete
      ? Math.ceil(item.baseQty * multiplier)
      : Math.max(1, Math.round(item.baseQty * multiplier));

    return {
      ...item,
      qty,
      cost: Math.round(item.baseCost * multiplier * 100) / 100,
      kcal: Math.round(item.baseKcal * multiplier),
    };
  });
}
