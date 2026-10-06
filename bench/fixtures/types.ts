import { type Grid, type SearchOptions } from '../../src';

export interface CaseDefinition {
  id: string;
  name: string;
  quick?: boolean;
  grid: () => Grid;
  options: Omit<SearchOptions, 'grid'>;
}

export interface Workload {
  id: string;
  name: string;
  queries: SearchOptions[];
}

export type Suite = 'quick' | 'full';
