import { Format } from '../types/book';
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';

// Initialize PDF.js worker
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

export interface ProcessedFile {
  blob: Blob;
  width: number;
  height: number;
  originalSize: {
    width: number;
    height: number;
  };
}

async function processPDF(file: File, targetWidth: number, targetHeight: number): Promise<ProcessedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not initialize canvas context');
  }

  // Calculate scale to fit the target dimensions while maintaining aspect ratio
  const scale = Math.min(
    targetWidth / viewport.width,
    targetHeight / viewport.height
  );

  const scaledViewport = page.getViewport({ scale });

  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;

  await page.render({
    canvasContext: context,
    viewport: scaledViewport,
  }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({
            blob,
            width: scaledViewport.width,
            height: scaledViewport.height,
            originalSize: {
              width: viewport.width,
              height: viewport.height,
            },
          });
        } else {
          reject(new Error('Failed to create PDF blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

async function processImage(file: File, targetWidth: number, targetHeight: number): Promise<ProcessedFile> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not initialize canvas context'));
      return;
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      try {
        // Convert mm to pixels (300 DPI)
        const DPI = 300;
        const MM_TO_INCH = 0.0393701;
        const pxWidth = Math.round(targetWidth * MM_TO_INCH * DPI);
        const pxHeight = Math.round(targetHeight * MM_TO_INCH * DPI);

        canvas.width = pxWidth;
        canvas.height = pxHeight;

        // Calculate scaling to maintain aspect ratio
        const scale = Math.max(
          pxWidth / img.width,
          pxHeight / img.height
        );

        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Center the image
        const x = (pxWidth - scaledWidth) / 2;
        const y = (pxHeight - scaledHeight) / 2;

        // Draw white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, pxWidth, pxHeight);

        // Enable high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw scaled image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                width: pxWidth,
                height: pxHeight,
                originalSize: {
                  width: img.width,
                  height: img.height,
                },
              });
            } else {
              reject(new Error('Failed to create image blob'));
            }
          },
          'image/png',
          1.0
        );
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to process image'));
      }
    };

    // Load the image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
  });
}

export async function processFile(
  file: File,
  targetWidth: number,
  targetHeight: number
): Promise<ProcessedFile> {
  if (file.type === 'application/pdf') {
    return processPDF(file, targetWidth, targetHeight);
  } else if (file.type.startsWith('image/')) {
    return processImage(file, targetWidth, targetHeight);
  } else {
    throw new Error('Unsupported file type. Please upload an image or PDF file.');
  }
}

export function getFormatDimensions(format: Format) {
  return {
    A4: { width: 210, height: 297 },
    A5: { width: 148, height: 210 }
  }[format];
}