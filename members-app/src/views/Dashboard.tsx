import type { Preset, ScaledItem, TripGroup } from '../data/types';
import { MILESTONE_LABELS, CATEGORY_COLORS } from '../data/types';
import { calcProgress } from '../utils/progress';
import Footer from '../components/Footer';

interface Props {
  preset: Preset;
  items: ScaledItem[];
  trips: TripGroup[];
  purchased: Record<number, boolean>;
  onBack: () => void;
}

function MilestoneBar({
  label,
  purchased,
  target,
}: {
  label: string;
  purchased: number;
  target: number;
}) {
  const pct = target > 0 ? Math.min(100, (purchased / target) * 100) : 0;
  const complete = pct >= 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-xs font-semibold ${complete ? 'text-green-600' : 'text-gray-400'}`}>
          {Math.round(pct)}%
        </span>
      </div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            complete ? 'bg-green-500' : 'bg-navy'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DoughnutChart({
  data,
}: {
  data: { category: string; kcal: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.kcal, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
        Check off items to see your breakdown
      </div>
    );
  }

  const cx = 100;
  const cy = 100;
  const r = 80;
  const innerR = 50;
  let startAngle = -Math.PI / 2;

  const paths = data.map((d) => {
    const angle = (d.kcal / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const largeArc = angle > Math.PI ? 1 : 0;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);

    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

    startAngle = endAngle;
    return { ...d, path };
  });

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" className="w-48 h-48">
        {paths.map((p, i) => (
          <path key={i} d={p.path} fill={p.color} stroke="#fff" strokeWidth="1.5" />
        ))}
      </svg>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
        {data.map((d) => (
          <div key={d.category} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: d.color }}
            />
            {d.category}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ preset, items, trips, purchased, onBack }: Props) {
  const progress = calcProgress(items, purchased, preset.dailyKcal, trips.length);

  let completedTrips = 0;
  for (const trip of trips) {
    if (trip.items.every((it) => purchased[it.index])) completedTrips++;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 no-print">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/">
              <img src="/dashboard/Micropreparedlogo.svg" alt="MicroPrepared.com" className="h-6" />
            </a>
            <button
              onClick={onBack}
              className="text-sm text-gray-500 hover:text-navy transition-colors font-medium"
            >
              &larr; Back to Plan
            </button>
          </div>
          <h1 className="text-lg font-semibold text-navy">Dashboard</h1>
          <span className="text-sm text-gray-400">{preset.label}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Headline Numbers */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <div className="text-4xl font-bold text-green-600">{progress.daysOfFood}</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">
              Days of Food
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-navy">
              {completedTrips}<span className="text-lg text-gray-300">/{trips.length}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">
              Weeks Done
            </div>
          </div>
        </div>

        {/* Milestone Progress */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-navy uppercase tracking-wider mb-5">
            Milestone Progress
          </h2>
          {progress.milestoneProgress.map((mp) => (
            <MilestoneBar
              key={mp.milestone}
              label={MILESTONE_LABELS[mp.milestone as 1 | 2 | 3 | 4].days}
              purchased={mp.purchased}
              target={mp.target}
            />
          ))}
        </section>

        {/* Category Breakdown */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-navy uppercase tracking-wider mb-5">
            Food Category Breakdown
          </h2>
          <DoughnutChart
            data={progress.categoryBreakdown.map((c) => ({
              category: c.category,
              kcal: c.kcal,
              color: CATEGORY_COLORS[c.category] ?? '#999',
            }))}
          />
        </section>

        {/* Detailed Category Table */}
        {progress.categoryBreakdown.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <h2 className="text-sm font-semibold text-navy uppercase tracking-wider mb-4">
              Purchased by Category
            </h2>
            <div className="space-y-2">
              {progress.categoryBreakdown.map((c) => (
                <div key={c.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ background: c.color }}
                    />
                    <span className="text-gray-700">{c.category}</span>
                  </div>
                  <span className="text-gray-500 font-medium">
                    {(c.kcal / 1000).toFixed(1)}k kcal
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
