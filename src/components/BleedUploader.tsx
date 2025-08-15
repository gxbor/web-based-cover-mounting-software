import React from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BleedImage } from '../types/book';

interface Props {
  position: 'top' | 'bottom' | 'left' | 'right';
  onUpload: (position: 'top' | 'bottom' | 'left' | 'right', file: File) => void;
  currentImage?: BleedImage;
}

export default function BleedUploader({ position, onUpload, currentImage }: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(position, file);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div
        className={`p-4 border-2 border-dashed rounded-lg ${
          currentImage
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-indigo-300'
        }`}
      >
        <div className="text-center">
          {currentImage ? (
            <div className="space-y-2">
              <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
              <p className="text-sm text-green-600">
                {position.charAt(0).toUpperCase() + position.slice(1)} bleed image uploaded
              </p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Upload {position} bleed image
              </p>
              <p className="text-xs text-gray-500">
                Click or drag and drop
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}