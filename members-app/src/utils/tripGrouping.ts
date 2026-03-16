import type { ScaledItem, TripGroup, MilestoneGroup } from '../data/types';
import { MILESTONE_LABELS } from '../data/types';

const BUDGET = 15;

export function groupIntoTrips(items: ScaledItem[]): TripGroup[] {
  const trips: TripGroup[] = [];
  let currentItems: ScaledItem[] = [];
  let currentCost = 0;
  let tripNumber = 1;

  for (const item of items) {
    // Single item exceeds budget → give it its own trip
    if (item.cost > BUDGET) {
      if (currentItems.length > 0) {
        trips.push({ tripNumber, items: currentItems, totalCost: currentCost });
        tripNumber++;
      }
      trips.push({ tripNumber, items: [item], totalCost: item.cost });
      tripNumber++;
      currentItems = [];
      currentCost = 0;
      continue;
    }

    if (currentCost + item.cost > BUDGET && currentItems.length > 0) {
      trips.push({ tripNumber, items: currentItems, totalCost: currentCost });
      tripNumber++;
      currentItems = [];
      currentCost = 0;
    }

    currentItems.push(item);
    currentCost += item.cost;
  }

  if (currentItems.length > 0) {
    trips.push({
      tripNumber,
      items: currentItems,
      totalCost: Math.round(currentCost * 100) / 100,
    });
  }

  return trips;
}

export function groupByMilestone(trips: TripGroup[]): MilestoneGroup[] {
  const milestones: Map<1 | 2 | 3 | 4, TripGroup[]> = new Map();

  for (const trip of trips) {
    // A trip's milestone is determined by its first item
    const milestone = trip.items[0]?.milestone ?? 1;
    if (!milestones.has(milestone)) {
      milestones.set(milestone, []);
    }
    milestones.get(milestone)!.push(trip);
  }

  return ([1, 2, 3, 4] as const).map((m) => ({
    milestone: m,
    label: MILESTONE_LABELS[m].label,
    daysLabel: MILESTONE_LABELS[m].days,
    trips: milestones.get(m) ?? [],
  }));
}
