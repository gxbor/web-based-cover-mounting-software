import { BookConfig } from './book';

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  savedConfigs: SavedConfig[];
}

export interface SavedConfig {
  id: string;
  name: string;
  config: BookConfig;
  timestamp: number;
}