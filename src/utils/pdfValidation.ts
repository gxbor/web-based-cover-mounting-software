import { Format, CustomFormat } from '../types/book';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateContentPDF(
  file: File,
  expectedPages: number,
  format: Format,
  customFormat?: CustomFormat
): Promise<ValidationResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Check page count
    if (pdf.numPages !== expectedPages) {
      return {
        isValid: false,
        error: `PDF must have exactly ${expectedPages} pages. Current: ${pdf.numPages} pages.`
      };
    }

    // Get first page to check dimensions
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.0 });

    // Convert PDF points to mm (1 pt = 0.3528 mm)
    const pdfWidth = viewport.width * 0.3528;
    const pdfHeight = viewport.height * 0.3528;

    // Get expected dimensions
    let expectedWidth: number;
    let expectedHeight: number;

    if (format === 'custom' && customFormat) {
      expectedWidth = customFormat.width;
      expectedHeight = customFormat.height;
    } else {
      expectedWidth = format === 'A4' ? 210 : 148;
      expectedHeight = format === 'A4' ? 297 : 210;
    }

    // Allow for small rounding differences (0.5mm tolerance)
    const tolerance = 0.5;
    if (
      Math.abs(pdfWidth - expectedWidth) > tolerance ||
      Math.abs(pdfHeight - expectedHeight) > tolerance
    ) {
      return {
        isValid: false,
        error: `PDF dimensions must be ${expectedWidth}mm x ${expectedHeight}mm. Current: ${pdfWidth.toFixed(1)}mm x ${pdfHeight.toFixed(1)}mm.`
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error('PDF validation error:', error);
    return {
      isValid: false,
      error: 'Failed to validate PDF. Please ensure it\'s a valid PDF file.'
    };
  }
}