import React, { useCallback, useState } from 'react';
import { BookConfig } from '../types/book';
import { FileText, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { validateContentPDF } from '../utils/pdfValidation';
import PDFPreview from './PDFPreview';

interface Props {
  config: BookConfig;
  updateConfig: (updates: Partial<BookConfig>) => void;
}

export default function ContentPDFUpload({ config, updateConfig }: Props) {
  const [error, setError] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [bleedConfirmed, setBleedConfirmed] = useState(false);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!bleedConfirmed) {
      setError('Please confirm that your PDF includes the required bleed area');
      return;
    }

    // Reset states
    setError('');
    setIsValidating(true);
    setShowPreview(false);
    updateConfig({ contentPDFValidated: false });

    try {
      // Check file size (2GB)
      const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB in bytes
      if (file.size > MAX_SIZE) {
        throw new Error('File size must not exceed 2GB');
      }

      // Check file type
      if (file.type !== 'application/pdf') {
        throw new Error('Please upload a PDF file');
      }

      // Validate PDF
      const validation = await validateContentPDF(
        file,
        config.pageCount,
        config.format,
        config.customFormat
      );
      
      if (validation.isValid) {
        updateConfig({
          files: { ...config.files, contentPDF: file }
        });
        setShowPreview(true);
      } else {
        throw new Error(validation.error || 'Invalid PDF file');
      }
    } catch (err) {
      console.error('PDF upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to validate PDF');
      updateConfig({
        files: { ...config.files, contentPDF: undefined },
        contentPDFValidated: false
      });
    } finally {
      setIsValidating(false);
    }
  }, [config.pageCount, config.format, config.customFormat, updateConfig, bleedConfirmed]);

  const handleProcessedPDF = (processedFile: File) => {
    updateConfig({
      files: { ...config.files, contentPDF: processedFile },
      contentPDFValidated: true
    });
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = e.dataTransfer.files;
      handleFileChange({ target: input } as any);
    }
  }, [handleFileChange]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Content PDF Upload</h3>

      {/* Bleed Requirements Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Important: PDF Bleed Requirements
        </h4>
        <div className="mt-2 text-sm text-yellow-700 space-y-2">
          <p>Your PDF must include bleed areas:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>3mm bleed on all sides beyond the final format size</li>
            <li>For {config.format === 'A4' ? 'A4 (210×297mm)' : 'A5 (148×210mm)'}: 
              Final PDF size must be {config.format === 'A4' ? '216×303mm' : '154×216mm'}</li>
            <li>All important elements should be at least 5mm from the trim edge</li>
            <li>Bleed area may be visible during production and will be trimmed</li>
          </ul>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={bleedConfirmed}
              onChange={(e) => setBleedConfirmed(e.target.checked)}
              className="rounded border-yellow-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-yellow-800">
              I confirm my PDF includes the required 3mm bleed on all sides
            </span>
          </label>
        </div>
      </div>
      
      {!showPreview ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
            error ? 'border-red-300 bg-red-50' :
            config.contentPDFValidated ? 'border-green-500 bg-green-50' :
            'border-gray-300 hover:border-indigo-300 bg-gray-50 hover:bg-indigo-50'
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            disabled={isValidating || !bleedConfirmed}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <div className="text-center">
            {isValidating ? (
              <div className="space-y-2">
                <div className="animate-spin mx-auto w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
                <p className="text-sm text-gray-600">Validating PDF...</p>
              </div>
            ) : error ? (
              <div className="space-y-2">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
                <p className="text-xs text-red-500">Click or drag to try again</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Upload your content PDF
                </p>
                <p className="text-xs text-gray-500">
                  Click or drag and drop your file here
                </p>
              </div>
            )}
          </div>
        </div>
      ) : config.files.contentPDF && (
        <PDFPreview 
          file={config.files.contentPDF} 
          onProcessed={handleProcessedPDF}
        />
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800">PDF Requirements</h4>
        <ul className="mt-2 text-sm text-blue-700 space-y-1">
          <li>• PDF must be exactly {config.pageCount} pages</li>
          <li>• Format with bleed: {config.format === 'custom' 
            ? `${(config.customFormat?.width || 0) + 6}mm x ${(config.customFormat?.height || 0) + 6}mm`
            : config.format === 'A4' ? '216mm x 303mm' : '154mm x 216mm'}</li>
          <li>• All fonts must be embedded</li>
          <li>• Maximum file size: 2GB</li>
          <li>• Color space: RGB or CMYK</li>
          <li>• Resolution: 300 DPI recommended</li>
        </ul>
      </div>
    </div>
  );
}