import React from 'react';
import { BookConfig } from '../types/book';
import { useAuthStore } from '../store/authStore';
import { 
  BookOpen, Save, Edit, Clock,
  Printer, Palette, BookType, Package 
} from 'lucide-react';

interface Props {
  currentConfig: BookConfig;
  onLoadConfig: (config: BookConfig) => void;
  onContinue: () => void;
}

export default function ConfigurationOverview({ currentConfig, onLoadConfig, onContinue }: Props) {
  const { user, savedConfigs, setShowAuthModal } = useAuthStore();

  const handleSaveForLater = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    // Save configuration logic here
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Configuration Overview</h2>

      {/* Current Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Configuration</h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Binding Type:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {currentConfig.bindingType === 'hardcover' ? 'Hardcover' : 'Softcover'}
            </span>
          </div>
          
          <div>
            <span className="text-gray-500">Format:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {currentConfig.format}
            </span>
          </div>
          
          <div>
            <span className="text-gray-500">Paper Type:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {currentConfig.paperType.replace('_', ' ')}
            </span>
          </div>
          
          <div>
            <span className="text-gray-500">Pages:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {currentConfig.pageCount}
            </span>
          </div>
          
          <div>
            <span className="text-gray-500">Quantity:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {currentConfig.quantity}
            </span>
          </div>
          
          <div>
            <span className="text-gray-500">Page Color:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {currentConfig.isColorPages ? 'Color' : 'Black & White'}
            </span>
          </div>
        </div>
      </div>

      {/* Saved Configurations */}
      {user && user.savedConfigs && user.savedConfigs.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Configurations</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {user.savedConfigs.map((config) => (
              <div
                key={config.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium text-gray-900">{config.name}</span>
                  </div>
                  <button
                    onClick={() => onLoadConfig(config.config)}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Load
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Last modified: {new Date(config.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div>Format: {config.config.format}</div>
                    <div>Pages: {config.config.pageCount}</div>
                    <div>Type: {config.config.bindingType}</div>
                    <div>Paper: {config.config.paperType}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onContinue}
          className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
        >
          <Edit className="w-5 h-5" />
          Edit Configuration
        </button>
        
        <button
          onClick={handleSaveForLater}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save for Later
        </button>
      </div>
    </div>
  );
}