import { useReducer, useEffect, useState, useCallback } from 'react';
import { reducer, createInitialState } from './store/reducer';
import { loadState, saveState } from './store/persistence';
import type { PresetKey, ScaledItem, TripGroup, MilestoneGroup } from './data/types';
import { BASE_ITEMS } from './data/items';
import { getPreset } from './data/presets';
import { scaleItems } from './utils/scaling';
import { groupIntoTrips, groupByMilestone } from './utils/tripGrouping';
import Setup from './views/Setup';
import Plan from './views/Plan';
import Dashboard from './views/Dashboard';

type View = 'setup' | 'plan' | 'dashboard';

export default function App() {
  const [state, dispatch] = useReducer(reducer, createInitialState());
  const [view, setView] = useState<View>('setup');
  const [loaded, setLoaded] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    loadState().then((saved) => {
      if (saved) {
        dispatch({ type: 'LOAD_STATE', state: saved });
        setView('plan');
      }
      setLoaded(true);
    });
  }, []);

  // Persist on every state change
  useEffect(() => {
    if (loaded) {
      saveState(state);
    }
  }, [state, loaded]);

  const preset = getPreset(state.preset);
  const scaledItems: ScaledItem[] = scaleItems(BASE_ITEMS, preset.multiplier);
  const trips: TripGroup[] = groupIntoTrips(scaledItems);
  const milestones: MilestoneGroup[] = groupByMilestone(trips);

  const handleSelectPreset = useCallback((key: PresetKey) => {
    dispatch({ type: 'SET_PRESET', preset: key });
    setView('plan');
  }, []);

  const handleToggleItem = useCallback((index: number) => {
    dispatch({ type: 'TOGGLE_ITEM', index });
  }, []);

  const handleChangeHousehold = useCallback(() => {
    if (Object.values(state.purchased).some(Boolean)) {
      if (!window.confirm('Changing your household will reset all progress. Continue?')) {
        return;
      }
    }
    setView('setup');
  }, [state.purchased]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {view === 'setup' && <Setup onSelect={handleSelectPreset} />}
      {view === 'plan' && (
        <Plan
          preset={preset}
          milestones={milestones}
          items={scaledItems}
          trips={trips}
          purchased={state.purchased}
          onToggle={handleToggleItem}
          onViewDashboard={() => setView('dashboard')}
          onChangeHousehold={handleChangeHousehold}
        />
      )}
      {view === 'dashboard' && (
        <Dashboard
          preset={preset}
          items={scaledItems}
          trips={trips}
          purchased={state.purchased}
          onBack={() => setView('plan')}
        />
      )}
    </div>
  );
}
