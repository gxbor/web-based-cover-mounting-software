import React, { useMemo } from 'react';
import { BookConfig } from '../../types/book';
import { calculatePrice } from '../../utils/calculations';
import { CreditCard, ShoppingCart, Shield } from 'lucide-react';

interface Props {
  config: BookConfig;
  updateConfig: (updates: Partial<BookConfig>) => void;
}

export default function CheckoutStep({ config }: Props) {
  const price = useMemo(() => calculatePrice(config), [config]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Order Summary</h2>

      <div className="grid grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Book Configuration
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
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

              {config.bindingType === 'hardcover' && config.hardcoverOptions && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Hardcover Options
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Front Paper:</span>
                      <span className="ml-2 text-gray-900">
                        {config.hardcoverOptions.frontPaperColor || 'Not selected'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Headband:</span>
                      <span className="ml-2 text-gray-900">
                        {config.hardcoverOptions.headbandColor || 'Not selected'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Ribbon:</span>
                      <span className="ml-2 text-gray-900">
                        {config.hardcoverOptions.ribbonColor || 'Not selected'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {config.comments && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Special Instructions
                  </h4>
                  <p className="text-sm text-gray-600">{config.comments}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Price Summary
            </h3>
            
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

            <button className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Proceed to Payment
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <Shield className="w-5 h-5" />
            <span>Secure payment processing</span>
          </div>
        </div>
      </div>
    </div>
  );
}