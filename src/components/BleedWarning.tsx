import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { BleedStatus } from '../types/book';

interface Props {
  bleedStatus: BleedStatus;
  onConfirm: () => void;
}

export default function BleedWarning({ bleedStatus, onConfirm }: Props) {
  const missingAreas = Object.entries(bleedStatus)
    .filter(([_, filled]) => !filled)
    .map(([area]) => area);

  if (missingAreas.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Incomplete Bleed Areas
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              The following bleed areas are not filled:
            </p>
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
              {missingAreas.map((area) => (
                <li key={area}>
                  {area.charAt(0).toUpperCase() + area.slice(1)} bleed area
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-600">
              Are you sure you want to proceed? Missing bleed areas might affect the final print quality.
            </p>
            <div className="mt-6 flex gap-4">
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Proceed Anyway
              </button>
              <button
                onClick={() => {}}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}