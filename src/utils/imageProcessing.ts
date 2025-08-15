import { Format } from '../types/book';

export async function processImage(
  file: File,
  targetWidth: number,
  targetHeight: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Invalid file type. Please upload an image file.'));
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not initialize canvas context'));
      return;
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.onload = () => {
      try {
        // Set canvas to target dimensions (convert mm to pixels, assuming 300 DPI)
        const DPI = 300;
        const MM_TO_INCH = 0.0393701;
        const pxWidth = Math.round(targetWidth * MM_TO_INCH * DPI);
        const pxHeight = Math.round(targetHeight * MM_TO_INCH * DPI);

        canvas.width = pxWidth;
        canvas.height = pxHeight;

        // Calculate scaling to maintain aspect ratio while covering the area
        const scale = Math.max(
          pxWidth / img.width,
          pxHeight / img.height
        );

        // Calculate dimensions to maintain aspect ratio
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Center the image
        const x = (pxWidth - scaledWidth) / 2;
        const y = (pxHeight - scaledHeight) / 2;

        // Draw with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, pxWidth, pxHeight);

        // Enable image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw scaled image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Convert to blob with high quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create image blob'));
            }
          },
          'image/png',
          1.0 // Maximum quality
        );
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to process image'));
      }
    };

    // Clean up object URL after image loads or errors
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      img.onload();
    };
  });
}

export function getFormatDimensions(format: Format) {
  return {
    A4: { width: 210, height: 297 },
    A5: { width: 148, height: 210 }
  }[format];
}