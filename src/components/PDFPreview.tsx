import React, { useState, useEffect } from 'react';
import { FileText, Loader, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

interface Props {
  file: File;
  onProcessed: (processedFile: File) => void;
}

interface ValidationResult {
  pageNumber: number;
  dimensions: {
    width: number;
    height: number;
  };
  issues: string[];
}

function PDFPreview({ file, onProcessed }: Props) {
  const [status, setStatus] = useState<'loading' | 'complete' | 'error'>('loading');
  const [pageCount, setPageCount] = useState(0);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => {
    let mounted = true;
    let pdf: pdfjsLib.PDFDocumentProxy | null = null;

    const validatePage = async (pageNumber: number): Promise<ValidationResult> => {
      if (!pdf) throw new Error('PDF not initialized');

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Convert PDF points to mm (1 pt = 0.3528 mm)
      const width = viewport.width * 0.3528;
      const height = viewport.height * 0.3528;

      const issues: string[] = [];

      // Check dimensions
      if (Math.abs(width - 216) > 1 || Math.abs(height - 303) > 1) {
        issues.push(`Incorrect dimensions: ${width.toFixed(1)}mm × ${height.toFixed(1)}mm (should be 216mm × 303mm)`);
      }

      return {
        pageNumber,
        dimensions: { width, height },
        issues
      };
    };

    const generatePreview = async (page: pdfjsLib.PDFPageProxy) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const previewScale = 0.3;
      const scaledViewport = page.getViewport({ scale: previewScale });
      
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      
      if (context) {
        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;
        return canvas.toDataURL();
      }
      return undefined;
    };

    const processFile = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        if (!mounted) return;
        
        const totalPages = pdf.numPages;
        setPageCount(totalPages);

        // Only validate first and last page
        const pagesToCheck = [1, totalPages];
        const results = [];

        for (const pageNum of pagesToCheck) {
          const result = await validatePage(pageNum);
          results.push(result);
        }

        // Generate preview from first page
        const firstPage = await pdf.getPage(1);
        const preview = await generatePreview(firstPage);
        if (preview && mounted) {
          setPreviewUrl(preview);
        }

        if (mounted) {
          setValidationResults(results);
          setStatus('complete');
          onProcessed(file);
        }
      } catch (err) {
        if (mounted) {
          setStatus('error');
        }
      } finally {
        if (pdf) {
          pdf.destroy();
        }
      }
    };

    processFile();
    return () => { 
      mounted = false;
      if (pdf) {
        pdf.destroy();
      }
    };
  }, [file, onProcessed]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-6">
        {/* Status Header */}
        <div className="flex items-center gap-3">
          {status === 'loading' && (
            <>
              <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
              <span className="text-gray-600">Checking PDF requirements...</span>
            </>
          )}
          {status === 'complete' && (
            <>
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="text-green-600">PDF validation complete</span>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="w-6 h-6 text-red-600" />
              <span className="text-red-600">Error validating PDF</span>
            </>
          )}
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="flex gap-8">
            <div className="w-1/3">
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <img 
                  src={previewUrl} 
                  alt="First page preview"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                First page preview
              </p>
            </div>

            {/* Requirements Check */}
            <div className="w-2/3 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">PDF Requirements Check</h4>
                <ul className="space-y-2 text-sm">
                  {validationResults.map((result) => (
                    <li key={result.pageNumber} className="flex items-start gap-2">
                      {result.issues.length === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      )}
                      <div>
                        <span className="font-medium">Page {result.pageNumber}:</span>
                        {result.issues.length === 0 ? (
                          <span className="text-green-600"> Meets requirements</span>
                        ) : (
                          <ul className="mt-1 space-y-1 text-yellow-700">
                            {result.issues.map((issue, index) => (
                              <li key={index}>• {issue}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800">PDF Summary</h4>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Total pages: {pageCount}</li>
                  <li>• File size: {(file.size / (1024 * 1024)).toFixed(1)} MB</li>
                  <li>• File name: {file.name}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFPreview;