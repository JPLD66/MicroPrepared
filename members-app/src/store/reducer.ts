import type { PresetKey } from '../data/types';
import type { AppState } from './persistence';

export type Action =
  | { type: 'SET_PRESET'; preset: PresetKey }
  | { type: 'TOGGLE_ITEM'; index: number }
  | { type: 'RESET_PROGRESS' }
  | { type: 'LOAD_STATE'; state: AppState };

export function createInitialState(preset?: PresetKey): AppState {
  return {
    preset: preset ?? 'Couple',
    purchased: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PRESET':
      return {
        ...createInitialState(action.preset),
      };
    case 'TOGGLE_ITEM':
      return {
        ...state,
        purchased: {
          ...state.purchased,
          [action.index]: !state.purchased[action.index],
        },
      };
    case 'RESET_PROGRESS':
      return {
        ...state,
        purchased: {},
      };
    case 'LOAD_STATE':
      return action.state;
    default:
      return state;
  }
}
