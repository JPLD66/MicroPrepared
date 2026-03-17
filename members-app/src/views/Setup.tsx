import { PRESETS } from '../data/presets';
import type { PresetKey } from '../data/types';
import Footer from '../components/Footer';

interface Props {
  onSelect: (key: PresetKey) => void;
}

const ICONS: Record<PresetKey, string> = {
  Solo: '🧑',
  Couple: '👫',
  Family: '👨‍👩‍👧',
  'Large Family': '👨‍👩‍👧‍👦',
};

export default function Setup({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="text-center pt-12 pb-4 px-6 no-print">
        <a href="/" className="inline-block mb-6">
          <img src="/dashboard/MicroPreparedLogo.svg" alt="MicroPrepared.com" className="h-[72px] mx-auto" />
        </a>
        <div className="inline-block bg-green-50 text-green-700 text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
          Micro Survival Sheets
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-3">
          90-Day Food Supply Builder
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto text-base md:text-lg leading-relaxed">
          Pick your household. Get a week-by-week shopping plan.
          <br className="hidden md:block" />
          $15 per trip. One trip per week. 90 days of food.
        </p>
      </header>

      {/* Cards */}
      <main className="flex-1 flex items-start justify-center px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-3xl w-full">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => onSelect(p.key)}
              className="group bg-white border border-gray-200 rounded-xl p-6 md:p-8 text-left hover:border-navy hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div className="text-3xl mb-3">{ICONS[p.key]}</div>
              <h2 className="text-xl font-semibold text-navy mb-1">{p.label}</h2>
              <p className="text-gray-500 text-sm mb-4">{p.people}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Weekly trips</span>
                  <span className="font-medium text-gray-700">{p.trips}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total cost</span>
                  <span className="font-medium text-gray-700">${p.totalCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Coverage</span>
                  <span className="font-medium text-green-600">~{p.days} days of food</span>
                </div>
              </div>
              <div className="mt-5 text-center py-2.5 rounded-lg bg-gray-50 group-hover:bg-navy group-hover:text-white text-sm font-medium text-gray-600 transition-colors">
                Start This Plan →
              </div>
            </button>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
