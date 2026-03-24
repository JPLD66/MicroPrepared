import type { ScaledItem, TripGroup, MilestoneGroup } from '../data/types';
import { MILESTONE_LABELS } from '../data/types';

const BUDGET = 15;

function groupItemsIntoTrips(items: ScaledItem[], startTripNumber: number): TripGroup[] {
  const trips: TripGroup[] = [];
  let currentItems: ScaledItem[] = [];
  let currentCost = 0;
  let tripNumber = startTripNumber;

  for (const item of items) {
    if (currentCost + item.cost > BUDGET && currentItems.length > 0) {
      trips.push({ tripNumber, items: currentItems, totalCost: Math.round(currentCost * 100) / 100 });
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

export function groupIntoTrips(items: ScaledItem[]): TripGroup[] {
  // Trip grouping resets at milestone boundaries
  const byMilestone: Map<number, ScaledItem[]> = new Map();
  for (const item of items) {
    if (!byMilestone.has(item.milestone)) {
      byMilestone.set(item.milestone, []);
    }
    byMilestone.get(item.milestone)!.push(item);
  }

  const allTrips: TripGroup[] = [];
  let nextTripNumber = 1;

  for (const m of [1, 2, 3, 4]) {
    const milestoneItems = byMilestone.get(m) ?? [];
    if (milestoneItems.length === 0) continue;
    const trips = groupItemsIntoTrips(milestoneItems, nextTripNumber);
    allTrips.push(...trips);
    if (trips.length > 0) {
      nextTripNumber = trips[trips.length - 1].tripNumber + 1;
    }
  }

  return allTrips;
}

export function groupByMilestone(trips: TripGroup[]): MilestoneGroup[] {
  const milestones: Map<1 | 2 | 3 | 4, TripGroup[]> = new Map();

  for (const trip of trips) {
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
