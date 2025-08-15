import React from 'react';
import { BookConfig, Format, PaperType } from '../../types/book';

interface Props {
  config: BookConfig;
  updateConfig: (updates: Partial<BookConfig>) => void;
}

// Paper types array
const paperTypes = [
  { value: '80g_recycling', label: '80g/m² Recycling Papier' },
  { value: '80g_offset', label: '80g/m² Offset Papier' },
  { value: '100g_offset', label: '100g/m² Offset Papier' },
  { value: '120g_offset', label: '120g/m² Offset Papier' },
  { value: '160g_offset', label: '160g/m² Offset Papier' },
  { value: '80g_volume_1_5', label: '80g/m² Volume Papier 1.5' },
  { value: '90g_volume_1_8', label: '90g/m² Volume Papier 1.8' },
  { value: '100g_art_matt', label: '100g/m² Art Papier Matt' },
  { value: '100g_art_gloss', label: '100g/m² Art Papier Gloss' },
  { value: '135g_art_matt', label: '135g/m² Art Papier Matt' },
  { value: '135g_art_gloss', label: '135g/m² Art Papier Gloss' },
  { value: '170g_art_matt', label: '170g/m² Art Papier Matt' },
  { value: '170g_art_gloss', label: '170g/m² Art Papier Gloss' }
];

// Formats array
const formats = [
  { value: 'A4', label: 'DIN A4', dimensions: '210×297mm' },
  { value: 'A5', label: 'DIN A5', dimensions: '148×210mm' },
  { value: 'A6', label: 'DIN A6', dimensions: '105×148mm' },
  { value: 'A4_landscape', label: 'DIN A4 Quer', dimensions: '297×210mm' },
  { value: 'A5_landscape', label: 'DIN A5 Quer', dimensions: '210×148mm' },
  { value: '17x24', label: '17×24', dimensions: '170×240mm' },
  { value: '15.5x22', label: '15.5×22', dimensions: '155×220mm' },
  { value: '21x21', label: '21×21', dimensions: '210×210mm' },
  { value: '21x28', label: '21×28', dimensions: '210×280mm' },
  { value: '13x19', label: '13×19', dimensions: '130×190mm' },
  { value: 'custom', label: 'Variabel', dimensions: 'X x X' }
];

export default function BookConfigurationStep({ config, updateConfig }: Props) {
  return (
    <div className="space-y-6 px-4 sm:px-0">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Buch Konfiguration</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Basic Options */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Format Auswahl</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {formats.map((format) => (
                <button
                  key={format.value}
                  onClick={() => updateConfig({ format: format.value as Format })}
                  className={`p-3 sm:p-4 rounded-lg border text-left transition-colors ${
                    config.format === format.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="font-medium text-sm sm:text-base">{format.label}</div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {format.dimensions}
                  </div>
                </button>
              ))}
            </div>

            {config.format === 'custom' && (
              <div className="mt-4 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Breite (mm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="400"
                    value={config.customFormat?.width || 210}
                    onChange={(e) => updateConfig({
                      customFormat: {
                        ...config.customFormat,
                        width: Number(e.target.value)
                      }
                    })}
                    className="w-full h-12 sm:h-10 px-3 py-2 border border-gray-300 rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Höhe (mm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="400"
                    value={config.customFormat?.height || 297}
                    onChange={(e) => updateConfig({
                      customFormat: {
                        ...config.customFormat,
                        height: Number(e.target.value)
                      }
                    })}
                    className="w-full h-12 sm:h-10 px-3 py-2 border border-gray-300 rounded-lg text-base"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Paper Options */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Papier Auswahl</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Papier Art
                </label>
                <select
                  value={config.paperType}
                  onChange={(e) => updateConfig({ paperType: e.target.value as PaperType })}
                  className="w-full h-12 sm:h-10 px-3 py-2 border border-gray-300 rounded-lg text-base appearance-none bg-white"
                >
                  {paperTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anzahl an Seiten
                </label>
                <input
                  type="number"
                  min="20"
                  max="800"
                  value={config.pageCount}
                  onChange={(e) => updateConfig({ pageCount: Number(e.target.value) })}
                  className="w-full h-12 sm:h-10 px-3 py-2 border border-gray-300 rounded-lg text-base"
                />
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Mindestens: 20 Seiten, Maximal: 800 Seiten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}