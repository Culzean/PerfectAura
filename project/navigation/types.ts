import type { Consultation } from '../types';

export type RootStackParamList = {
  Home: undefined;
  Input: undefined;
  Loading: undefined;
  Results: { consultation: Consultation; origin: 'fresh' | 'history' };
  History: undefined;
};
