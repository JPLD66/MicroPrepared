import type { Preset, ScaledItem, TripGroup, MilestoneGroup } from '../data/types';
import { MILESTONE_UNLOCK_LABELS, MILESTONE_COLORS } from '../data/types';
import { calcProgress } from '../utils/progress';

interface Props {
  preset: Preset;
  milestones: MilestoneGroup[];
  items: ScaledItem[];
  trips: TripGroup[];
  purchased: Record<number, boolean>;
  onToggle: (index: number) => void;
  onViewDashboard: () => void;
  onChangeHousehold: () => void;
}

function formatQty(qty: number): string {
  return qty % 1 === 0 ? String(qty) : qty.toFixed(1);
}

export default function Plan({
  preset,
  milestones,
  items,
  trips,
  purchased,
  onToggle,
  onViewDashboard,
  onChangeHousehold,
}: Props) {
  const progress = calcProgress(items, purchased, preset.dailyKcal, trips.length);

  // Count completed trips
  let completedTrips = 0;
  for (const trip of trips) {
    if (trip.items.every((it) => purchased[it.index])) {
      completedTrips++;
    }
  }

  const isMilestoneComplete = (milestone: MilestoneGroup) =>
    milestone.trips.length > 0 &&
    milestone.trips.every((t) => t.items.every((it) => purchased[it.index]));

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 no-print">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-navy truncate">
              {preset.label} Plan
            </h1>
            <p className="text-xs text-gray-400 truncate">
              {trips.length} trips · ~$15/week · ~{preset.days} days · ~${preset.totalCost} total
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onViewDashboard}
              className="px-3 py-1.5 text-sm font-medium bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-sm font-medium border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Print
            </button>
            <button
              onClick={onChangeHousehold}
              className="px-3 py-1.5 text-sm font-medium border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-gray-50 border-b border-gray-200 no-print">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-500">
              {completedTrips} / {trips.length} trips completed
            </span>
            <span className="text-xs font-bold text-green-600">
              {progress.daysOfFood} days of food
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (progress.purchasedKcal / progress.totalKcal) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Plan Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {milestones.map((ms) => (
          <section key={ms.milestone} className="mb-8">
            {/* Milestone Section Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gray-200" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                {ms.label}
              </h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Trip Groups */}
            {ms.trips.map((trip, tripIdx) => {
              const allChecked = trip.items.every((it) => purchased[it.index]);
              return (
                <div
                  key={trip.tripNumber}
                  className={`mb-3 rounded-lg border ${
                    allChecked ? 'border-green-200 bg-green-50/50' : 'border-gray-200'
                  } ${!allChecked && tripIdx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                >
                  {/* Trip Header */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Trip {trip.tripNumber}
                    </span>
                    <span className="text-xs text-gray-400">
                      ~${trip.totalCost.toFixed(0)} est.
                    </span>
                  </div>

                  {/* Items */}
                  {trip.items.map((item) => {
                    const checked = !!purchased[item.index];
                    return (
                      <label
                        key={item.index}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                          checked ? 'opacity-60' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggle(item.index)}
                          className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-sm font-medium ${
                              checked ? 'line-through text-gray-400' : 'text-gray-800'
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            {formatQty(item.qty)} {item.unit}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs text-gray-400">
                            {item.shelfLife}
                          </span>
                          {item.notes && (
                            <span className="block text-[10px] text-gray-300">
                              {item.notes}
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              );
            })}

            {/* Milestone Unlocked Banner */}
            {isMilestoneComplete(ms) && (
              <div
                className="text-center py-3 px-4 text-white rounded-lg font-semibold text-sm tracking-wide mb-2"
                style={{ backgroundColor: MILESTONE_COLORS[ms.milestone] }}
              >
                {MILESTONE_UNLOCK_LABELS[ms.milestone]}
              </div>
            )}
          </section>
        ))}

        {/* Bottom Stats */}
        <div className="mt-8 mb-12 bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-navy">
                {completedTrips} / {trips.length}
              </div>
              <div className="text-xs text-gray-400 mt-1">Weeks Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">
                {progress.daysOfFood}
              </div>
              <div className="text-xs text-gray-400 mt-1">DAYS OF FOOD</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-300 no-print">
        <a href="/" className="hover:text-navy transition-colors">MicroPrepared.com</a>
      </footer>
    </div>
  );
}
