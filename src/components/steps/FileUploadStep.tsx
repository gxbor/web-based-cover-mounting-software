import React, { useState } from 'react';
import { BookConfig } from '../../types/book';
import { Upload, Trash2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

interface Props {
  config: BookConfig;
  updateConfig: (updates: Partial<BookConfig>) => void;
  error?: string;
}

export default function FileUploadStep({ config, updateConfig, error }: Props) {
  const [pdfError, setPdfError] = useState<string>('');

  const handleFileUpload = (file: File, type: 'frontCover' | 'spine' | 'backCover' | 'professionalCover') => {
    updateConfig({
      files: {
        ...config.files,
        [type]: file
      }
    });
  };

  const handleFileDelete = (type: 'frontCover' | 'spine' | 'backCover' | 'professionalCover') => {
    const newFiles = { ...config.files };
    delete newFiles[type];
    updateConfig({ files: newFiles });
  };

  const handlePDFUpload = async (file: File) => {
    try {
      setPdfError('');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      if (pdf.numPages !== 3) {
        setPdfError('PDF must contain exactly 3 pages (front cover, back cover, and spine)');
        return;
      }

      // Convert each page to an image blob
      const pages = await Promise.all([1, 2, 3].map(async (pageNum) => {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) throw new Error('Could not get canvas context');
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        return new Promise<File>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `page-${pageNum}.png`, { type: 'image/png' });
              resolve(file);
            }
          }, 'image/png', 1.0);
        });
      }));

      // Update files in config
      updateConfig({
        files: {
          backCover: pages[0], // First page
          spine: pages[1],  // Second page
          frontCover: pages[2]       // Third page
        }
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      setPdfError('Error processing PDF. Please ensure it\'s a valid PDF file.');
    }
  };

  const renderUploadBox = (
    type: 'frontCover' | 'spine' | 'backCover' | 'professionalCover',
    label: string
  ) => {
    const file = config.files[type];
    const isUploaded = !!file;

    return (
      <div className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
        isUploaded 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-300 hover:border-indigo-300'
      }`}>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, type);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          {isUploaded ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleFileDelete(type);
                  }}
                  className="p-1 hover:bg-red-100 rounded-full"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
              <p className="text-sm text-green-600">{file.name}</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">{label}</p>
              <p className="text-xs text-gray-500">
                Dateien hineinziehen oder hier klicken
              </p>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Hochladen</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Cover Type Selection */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => updateConfig({ 
              isProfessionalCover: false,
              isPreTested: false,
              designService: { enabled: false },
              files: {
                ...config.files,
                professionalCover: undefined
              }
            })}
            className={`flex-1 p-6 rounded-xl border-2 transition-all ${
              !config.isProfessionalCover
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-200'
            }`}
          >
            <h3 className="text-lg font-semibold">Cover Dateien</h3>
          </button>
        </div>

        {/* Upload Section */}
        {config.isProfessionalCover ? (
          <div className="space-y-4">
            {renderUploadBox('professionalCover', 'Upload complete cover file')}
            
            {config.files.professionalCover && (
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.isPreTested}
                    onChange={(e) => updateConfig({ isPreTested: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    Ich versichere dass die Cover Datei von einem Fachmann bereits geprüft oder gedruckt wurde
                  </span>
                </label>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Single PDF Upload Option */}
            <div className="relative border-2 border-dashed rounded-lg p-6 transition-all border-gray-300 hover:border-indigo-300">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePDFUpload(file);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Kombi PDF hochladen (3 Seiten: Rückseite, Rücken, Vorderseite)
                </p>
                <p className="text-xs text-gray-500">
                  Dateien hineinziehen oder anklicken
                </p>
              </div>
            </div>

            {pdfError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-600">{pdfError}</p>
                </div>
              </div>
            )}

            <div className="relative pt-6 border-t border-gray-200">
              <p className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500">
                oder einzelne Seiten überschreiben
              </p>
            </div>

            {/* Individual File Upload */}
            <div className="grid grid-cols-3 gap-4">
              {renderUploadBox('backCover', 'Rückseite')}
              {renderUploadBox('spine', 'Rückseite')}
              {renderUploadBox('frontCover', 'Vorderseite')}
            </div>
          </div>
        )}
      </div>

      {/* Requirements Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800">Daten Anforderungen</h3>
        <ul className="mt-2 text-sm text-blue-700 space-y-1">
          <li>• Die Kombi PDF muss exakt 3 Seiten enthalten: Vorderseite, Rückseite, Rücken in dieser Reihenfolge</li>
          <li>• Individuelle Dateien: PDF, JPG, oder PNG</li>
          <li>• Auflösung: 300 DPI minimum</li>
          <li>• Farbraum: RGB oder CMYK</li>
          <li>• Die Dateien werden automatisch auf die Format Größe skaliert/gezerrt</li>
          <li>• Optimalerweise das richtige Seitenverhältnis und hohe Qualität</li>
          <li>• Nur Dateien mit sauberen Kanten verwenden</li>
        </ul>
      </div>
    </div>
  );
}