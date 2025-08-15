import React, { useState } from 'react';
import { 
  BookConfig, Format, PaperType, BindingType, BindingMethod, 
  SpineType, CoverFinish, PackagingType, ShippingMethod 
} from '../../types/book';
import { calculatePrice } from '../../utils/calculations';
import { 
  Calculator, Book, Bookmark, Clock, Copy, Trash2, BookOpen, 
  Printer, Palette, ChevronDown, BookType, Layers, Package,
  ArrowRight, Truck, Settings
} from 'lucide-react';

interface SavedConfig {
  id: string;
  name: string;
  config: BookConfig;
  timestamp: number;
}

interface Props {
  config: BookConfig;
  updateConfig: (updates: Partial<BookConfig>) => void;
  onProceed: (toConfiguration: boolean) => void;
}

const paperTypes = [
  { value: '80g_offset', label: '80g/m² Offset' },
  { value: '100g_offset', label: '100g/m² Offset' },
  { value: '120g_offset', label: '120g/m² Offset' },
  { value: '135g_art_matt', label: '135g/m² Art Matt' },
  { value: '135g_art_gloss', label: '135g/m² Art Gloss' }
];

export default function PriceCalculatorStep({ config, updateConfig, onProceed }: Props) {
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const [showSavedConfigs, setShowSavedConfigs] = useState(false);
  const price = calculatePrice(config);

  const handleSaveConfig = () => {
    const newConfig: SavedConfig = {
      id: Date.now().toString(),
      name: `Book ${savedConfigs.length + 1}`,
      config: { ...config },
      timestamp: Date.now()
    };
    setSavedConfigs([...savedConfigs, newConfig]);
    setShowSavedConfigs(true);
  };

  const handleLoadConfig = (savedConfig: SavedConfig) => {
    updateConfig(savedConfig.config);
  };

  const handleDeleteConfig = (id: string) => {
    setSavedConfigs(savedConfigs.filter(config => config.id !== id));
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Price Calculator</h2>

      <div className="grid grid-cols-3 gap-8">
        {/* Configuration Options */}
        <div className="col-span-2 space-y-6">
          {/* Basic Options */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Configuration</h3>
            
            {/* Binding Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['hardcover', 'softcover'].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateConfig({ bindingType: type as BindingType })}
                    className={`p-2 rounded-lg border text-left ${
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['A4', 'A5', 'custom'].map((format) => (
                  <button
                    key={format}
                    onClick={() => updateConfig({ format: format as Format })}
                    className={`p-2 rounded-lg border text-left ${
                      config.format === format
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="font-medium">{format}</div>
                    <div className="text-xs text-gray-500">
                      {format === 'A4' ? '210×297mm' : format === 'A5' ? '148×210mm' : 'Custom'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Format */}
            {config.format === 'custom' && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (mm)
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (mm)
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Page Count & Quantity */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Pages
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
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

            {/* Color Pages */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.isColorPages}
                  onChange={(e) => updateConfig({ isColorPages: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm text-gray-700">Color Pages</span>
              </label>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Options</h3>

            {/* Paper Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paper Type
              </label>
              <select
                value={config.paperType}
                onChange={(e) => updateConfig({ paperType: e.target.value as PaperType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {paperTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Binding Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binding Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'perfect', label: 'Perfect Binding' },
                  { value: 'sewn', label: 'Sewn Binding' }
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => updateConfig({ bindingMethod: method.value as BindingMethod })}
                    className={`p-2 rounded-lg border text-left ${
                      config.bindingMethod === method.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="font-medium">{method.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Spine Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spine Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'straight', label: 'Straight' },
                  { value: 'curved', label: 'Curved' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => updateConfig({ spineType: type.value as SpineType })}
                    className={`p-2 rounded-lg border text-left ${
                      config.spineType === type.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Finish */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Finish
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'matte', label: 'Matte' },
                  { value: 'glossy', label: 'Glossy' }
                ].map((finish) => (
                  <button
                    key={finish.value}
                    onClick={() => updateConfig({ coverFinish: finish.value as CoverFinish })}
                    className={`p-2 rounded-lg border text-left ${
                      config.coverFinish === finish.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="font-medium">{finish.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hardcover Options */}
            {config.bindingType === 'hardcover' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Hardcover Options</h4>
                
                {/* Front Paper Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Front Paper Color
                  </label>
                  <select
                    value={config.hardcoverOptions.frontPaperColor}
                    onChange={(e) => updateConfig({
                      hardcoverOptions: {
                        ...config.hardcoverOptions,
                        frontPaperColor: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="white">White</option>
                    <option value="cream">Cream</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>

                {/* Headband Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Headband Color
                  </label>
                  <select
                    value={config.hardcoverOptions.headbandColor}
                    onChange={(e) => updateConfig({
                      hardcoverOptions: {
                        ...config.hardcoverOptions,
                        headbandColor: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="white">White</option>
                    <option value="black">Black</option>
                    <option value="blue">Blue</option>
                    <option value="red">Red</option>
                  </select>
                </div>

                {/* Ribbon */}
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={!!config.hardcoverOptions.ribbonColor}
                      onChange={(e) => updateConfig({
                        hardcoverOptions: {
                          ...config.hardcoverOptions,
                          ribbonColor: e.target.checked ? 'white' : undefined
                        }
                      })}
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Add Ribbon Bookmark</span>
                  </label>
                  {config.hardcoverOptions.ribbonColor && (
                    <select
                      value={config.hardcoverOptions.ribbonColor}
                      onChange={(e) => updateConfig({
                        hardcoverOptions: {
                          ...config.hardcoverOptions,
                          ribbonColor: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="white">White</option>
                      <option value="black">Black</option>
                      <option value="blue">Blue</option>
                      <option value="red">Red</option>
                    </select>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price Summary and Actions */}
        <div className="space-y-6">
          {/* Price Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Base Price</span>
                <span className="text-gray-900">€{price.basePrice.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Options</span>
                <span className="text-gray-900">€{price.optionsPrice.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Quantity ({config.quantity})</span>
                <span className="text-gray-900">€{price.quantityPrice.toFixed(2)}</span>
              </div>
              
              {price.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-€{price.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">€{price.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => onProceed(true)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              <Book className="w-5 h-5" />
              Continue to Configuration
            </button>
            
            <button
              onClick={() => {
                handleSaveConfig();
                onProceed(false);
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Calculate Another Book
            </button>
          </div>

          {/* Saved Configurations */}
          {savedConfigs.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  Saved Configurations
                </h4>
                <button
                  onClick={() => setShowSavedConfigs(!showSavedConfigs)}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  {showSavedConfigs ? 'Hide' : 'Show'}
                </button>
              </div>

              {showSavedConfigs && (
                <div className="space-y-2">
                  {savedConfigs.map((saved) => (
                    <div
                      key={saved.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{saved.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoadConfig(saved)}
                            className="p-1 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
                            title="Load Configuration"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(saved.id)}
                            className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"
                            title="Delete Configuration"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {saved.config.bindingType === 'hardcover' ? 'Hardcover' : 'Softcover'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Printer className="w-3 h-3" />
                          {saved.config.pageCount} pages
                        </div>
                        <div className="flex items-center gap-1">
                          <Palette className="w-3 h-3" />
                          {saved.config.isColorPages ? 'Color' : 'B&W'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(saved.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Production Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Production Information</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Production Time: 7-10 business days
              </p>
              <p className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Shipping Time: 2-5 business days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}