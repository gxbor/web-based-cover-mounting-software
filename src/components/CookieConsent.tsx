import React, { useState, useEffect } from 'react';
import { X, Settings, Shield, BarChart, Mail, Check } from 'lucide-react';
import { CookieSettings, CookiePreferences } from '../types/cookies';
import { saveCookieSettings as saveToFirebase } from '../services/auth';
import { useAuthStore } from '../store/authStore';
import {
  saveCookieSettings as saveToLocal,
  savePreferences,
  setConsentStatus
} from '../utils/cookies';

interface Props {
  onAccept: (settings: CookieSettings, preferences: CookiePreferences) => void;
  onDecline: () => void;
}

export default function CookieConsent({ onAccept, onDecline }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true,
    preferences: true,
    analytics: false,
    marketing: false,
  });

  const [preferences, setPreferences] = useState<CookiePreferences>({
    currency: 'EUR',
    theme: 'system',
    notifications: true,
  });

  const { user } = useAuthStore();

  const handleAccept = async () => {
    saveToLocal(settings);
    savePreferences(preferences);
    setConsentStatus(true);

    // If user is logged in, save to Firebase
    if (user) {
      try {
        await saveToFirebase(user.id, settings, preferences);
      } catch (error) {
        console.error('Error saving cookie settings to Firebase:', error);
      }
    }

    onAccept(settings, preferences);
  };

  const handleAcceptAll = async () => {
    const allEnabled = {
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
    };
    
    saveToLocal(allEnabled);
    savePreferences(preferences);
    setConsentStatus(true);

    // If user is logged in, save to Firebase
    if (user) {
      try {
        await saveToFirebase(user.id, allEnabled, preferences);
      } catch (error) {
        console.error('Error saving cookie settings to Firebase:', error);
      }
    }

    onAccept(allEnabled, preferences);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-t-xl sm:rounded-xl shadow-xl">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Cookie Einstellungen</h3>
              <p className="mt-1 text-sm text-gray-600">
                Cookies verwalten
              </p>
            </div>
            <button
              onClick={onDecline}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Cookie Categories */}
            <div className="space-y-3">
              {/* Necessary */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Zwingend</p>
                    <p className="text-sm text-gray-600">Notwendig für die Basis Funktionen</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.necessary}
                  disabled
                  className="rounded border-gray-300 text-indigo-600"
                />
              </div>

              {/* Preferences */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Präferenzen</p>
                    <p className="text-sm text-gray-600">Einstellungen werden gespeichert</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.preferences}
                  onChange={(e) => setSettings({ ...settings, preferences: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600"
                />
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Analytik</p>
                    <p className="text-sm text-gray-600">Helf uns besser zu werden</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.analytics}
                  onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600"
                />
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Marketing</p>
                    <p className="text-sm text-gray-600">Personalisierte Empfehlungen</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.marketing}
                  onChange={(e) => setSettings({ ...settings, marketing: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAcceptAll}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Annehmen
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Speichern
            </button>
            <button
              onClick={onDecline}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Alle ablehnen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}