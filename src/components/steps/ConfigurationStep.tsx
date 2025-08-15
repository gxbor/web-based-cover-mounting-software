import React from 'react';
import { BookConfig } from '../../types/book';
import { useAuthStore } from '../../store/authStore';
import { 
  BookOpen, Printer, Palette, Ruler, Layers, 
  BookType, Package, ArrowRight, Save
} from 'lucide-react';

interface Props {
  config: BookConfig;
  updateConfig: (updates: Partial<BookConfig>) => void;
}

export default function ConfigurationStep({ config, updateConfig }: Props) {
  const { isAuthenticated, setShowAuthModal, saveConfig } = useAuthStore();

  const handleSaveForLater = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    saveConfig(config);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Buch Konfiguration</h2>

      {/* Configuration form content */}
      <div className="grid grid-cols-2 gap-8">
        {/* Basic Options */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basis Optionen</h3>
            
            {/* Binding Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bindung
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['hardcover', 'softcover'].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateConfig({ bindingType: type as 'hardcover' | 'softcover' })}
                    className={`p-4 rounded-lg border text-left ${
                      config.bindingType === type
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="font-medium">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['A4', 'A5', 'custom'].map((format) => (
                  <button
                    key={format}
                    onClick={() => updateConfig({ format: format as 'A4' | 'A5' | 'custom' })}
                    className={`p-4 rounded-lg border text-left ${
                      config.format === format
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="font-medium">{format}</div>
                    <div className="text-sm text-gray-500">
                      {format === 'A4' ? '210×297mm' : format === 'A5' ? '148×210mm' : 'Custom'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Page Count */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anzahl an Seiten
              </label>
              <input
                type="number"
                min="20"
                max="800"
                value={config.pageCount}
                onChange={(e) => updateConfig({ pageCount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Color Pages */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.isColorPages}
                  onChange={(e) => updateConfig({ isColorPages: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm text-gray-700">Farbige Seiten</span>
              </label>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Erweiterte Optionen</h3>

            {/* Paper Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Papier Art
              </label>
              <select
                value={config.paperType}
                onChange={(e) => updateConfig({ paperType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="135g_art_matt">135g Art Matt</option>
                <option value="135g_art_gloss">135g Art Gloss</option>
                <option value="80g_offset">80g Offset</option>
              </select>
            </div>

            {/* Spine Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spine Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['straight', 'curved'].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateConfig({ spineType: type as 'straight' | 'curved' })}
                    className={`p-4 rounded-lg border text-left ${
                      config.spineType === type
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="font-medium">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Finish */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Verarbeitung
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['matte', 'glossy'].map((finish) => (
                  <button
                    key={finish}
                    onClick={() => updateConfig({ coverFinish: finish as 'matte' | 'glossy' })}
                    className={`p-4 rounded-lg border text-left ${
                      config.coverFinish === finish
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="font-medium">
                      {finish.charAt(0).toUpperCase() + finish.slice(1)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anzahl
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={config.quantity}
                onChange={(e) => updateConfig({ quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSaveForLater}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Für später speichern
        </button>
      </div>
    </div>
  );
}