export interface CookieSettings {
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookiePreferences {
  currency: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
}