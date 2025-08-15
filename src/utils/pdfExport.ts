import { jsPDF } from 'jspdf';
import { Dimensions } from '../types/book';

export async function generatePDF(canvas: HTMLCanvasElement, dimensions: Dimensions) {
  // Convert mm to points (1 pt = 0.3528 mm)
  const MM_TO_PT = 2.83465;
  const width = dimensions.coverWidth * MM_TO_PT;
  const height = dimensions.coverHeight * MM_TO_PT;

  // Create PDF with correct dimensions
  const pdf = new jsPDF({
    orientation: width > height ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [width, height]
  });

  // Get canvas data
  const imageData = canvas.toDataURL('image/jpeg', 1.0);

  // Add image to PDF
  pdf.addImage(imageData, 'JPEG', 0, 0, width, height);

  return pdf;
}