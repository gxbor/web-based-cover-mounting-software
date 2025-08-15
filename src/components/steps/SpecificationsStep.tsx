import React from 'react';
import { BookConfig } from '../../types/book';
import { Package, Truck, MessageSquare, Lock } from 'lucide-react';

interface Props {
  config: BookConfig;
  updateConfig: (updates: Partial<BookConfig>) => void;
}

export default function SpecificationsStep({ config, updateConfig }: Props) {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Final Details</h2>

      {/* Configuration Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Configuration Overview</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Binding Type:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {config.bindingType === 'hardcover' ? 'Hardcover' : 'Softcover'}
            </span>
          </div>
          
          <div>
            <span className="text-gray-500">Format:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {config.format}
            </span>
          </div>
          
          <div>
            <span className="text-gray-500">Paper Type:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {config.paperType.replace('_', ' ')}
            </span>
          </div>
          
          <div>
            <span className="text-gray-500">Pages:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {config.pageCount}
            </span>
          </div>
          
          <div>
            <span className="text-gray-500">Quantity:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {config.quantity}
            </span>
          </div>
          
          <div>
            <span className="text-gray-500">Page Color:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {config.isColorPages ? 'Color' : 'Black & White'}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Note: Configuration cannot be modified from this point forward. Please review carefully.
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Packaging</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Packaging Type
              </label>
              <select
                value={config.packagingType || 'standard'}
                onChange={(e) => updateConfig({ packagingType: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm"
              >
                <option value="standard">Standard</option>
                <option value="gift">Gift Packaging</option>
                <option value="bulk">Bulk Packaging</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Delivery</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Method
              </label>
              <select
                value={config.shippingMethod || 'standard'}
                onChange={(e) => updateConfig({ shippingMethod: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm"
              >
                <option value="standard">Standard Shipping (5-7 days)</option>
                <option value="express">Express Shipping (2-3 days)</option>
                <option value="priority">Priority Shipping (1-2 days)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
          </div>
          <div>
            <textarea
              value={config.comments}
              onChange={(e) => updateConfig({ comments: e.target.value })}
              placeholder="Add any special instructions or comments..."
              rows={4}
              className="w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}