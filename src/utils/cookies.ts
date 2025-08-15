import Cookies from 'js-cookie';
import { BookConfig } from '../types/book';
import { CookieSettings, CookiePreferences } from '../types/cookies';

const COOKIE_CONFIG = 'book_config';
const COOKIE_SETTINGS = 'cookie_settings';
const COOKIE_PREFERENCES = 'user_preferences';
const COOKIE_CONSENT = 'cookie_consent';
const COOKIE_EXPIRY = 365; // days

const defaultSettings: CookieSettings = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

const defaultPreferences: CookiePreferences = {
  currency: 'EUR',
  theme: 'system',
  notifications: true,
};

export function saveCookieSettings(settings: CookieSettings) {
  try {
    Cookies.set(COOKIE_SETTINGS, JSON.stringify({ ...settings, necessary: true }), {
      expires: COOKIE_EXPIRY,
      sameSite: 'strict',
      secure: true
    });
  } catch (error) {
    console.error('Error saving cookie settings:', error);
  }
}

export function loadCookieSettings(): CookieSettings {
  try {
    const saved = Cookies.get(COOKIE_SETTINGS);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Error loading cookie settings:', error);
  }
  return defaultSettings;
}

export function savePreferences(preferences: CookiePreferences) {
  try {
    Cookies.set(COOKIE_PREFERENCES, JSON.stringify(preferences), {
      expires: COOKIE_EXPIRY,
      sameSite: 'strict',
      secure: true
    });
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
}

export function loadPreferences(): CookiePreferences {
  try {
    const saved = Cookies.get(COOKIE_PREFERENCES);
    if (saved) {
      return { ...defaultPreferences, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
  return defaultPreferences;
}

export function saveConfigToCookies(config: Partial<BookConfig>) {
  if (!loadCookieSettings().preferences) return;

  const configToSave = { ...config };
  delete configToSave.files;

  try {
    Cookies.set(COOKIE_CONFIG, JSON.stringify(configToSave), {
      expires: COOKIE_EXPIRY,
      sameSite: 'strict',
      secure: true
    });
  } catch (error) {
    console.error('Error saving config to cookies:', error);
  }
}

export function loadConfigFromCookies(): Partial<BookConfig> | null {
  if (!loadCookieSettings().preferences) return null;

  try {
    const savedConfig = Cookies.get(COOKIE_CONFIG);
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (error) {
    console.error('Error loading config from cookies:', error);
  }
  return null;
}

export function setConsentStatus(status: boolean) {
  Cookies.set(COOKIE_CONSENT, status.toString(), {
    expires: COOKIE_EXPIRY,
    sameSite: 'strict',
    secure: true
  });
}

export function getConsentStatus(): boolean {
  return Cookies.get(COOKIE_CONSENT) === 'true';
}

export function clearAllCookies() {
  const cookies = Cookies.get();
  for (const cookie in cookies) {
    Cookies.remove(cookie);
  }
}