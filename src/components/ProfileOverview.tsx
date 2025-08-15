import React from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  User, BookOpen, Clock, Settings, LogOut,
  Edit, Trash2, Copy
} from 'lucide-react';

interface Props {
  onClose: () => void;
  onLoadConfig?: (config: any) => void;
}

export default function ProfileOverview({ onClose, onLoadConfig }: Props) {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {}}
                className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Configurations</h3>
            
            {user.savedConfigs.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {user.savedConfigs.map((config, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium text-gray-900">
                          {config.name || `Book ${index + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onLoadConfig?.(config)}
                          className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
                          title="Load Configuration"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {}}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                          title="Edit Configuration"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {}}
                          className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                          title="Delete Configuration"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4" />
                        <span>Last modified: {new Date(config.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>Format: {config.format}</div>
                        <div>Pages: {config.pageCount}</div>
                        <div>Type: {config.bindingType}</div>
                        <div>Paper: {config.paperType}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No saved configurations yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your saved book configurations will appear here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}