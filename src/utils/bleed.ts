import { BleedStatus, BleedImage, Dimensions } from '../types/book';

export function validateBleed(
  ctx: CanvasRenderingContext2D,
  dimensions: Dimensions,
  bleedImages?: BleedImage[]
): BleedStatus {
  const bleedSize = 3; // 3mm bleed
  const status: BleedStatus = {
    top: false,
    bottom: false,
    left: false,
    right: false
  };

  // Check if bleed images are provided
  if (bleedImages?.length) {
    bleedImages.forEach(image => {
      status[image.position] = true;
    });
    return status;
  }

  // Check pixel data in bleed areas
  const scale = ctx.canvas.width / dimensions.coverWidth; // Convert mm to pixels
  const bleedPixels = Math.ceil(bleedSize * scale);

  // Sample points in each bleed area
  const samplePoints = 10;
  const sampleSize = 5;

  // Helper function to check if area has content
  const hasContent = (x: number, y: number, width: number, height: number) => {
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;
    
    // Check if pixels are not white (RGB: 255,255,255)
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
        return true;
      }
    }
    return false;
  };

  // Check top bleed
  status.top = hasContent(0, 0, ctx.canvas.width, bleedPixels);

  // Check bottom bleed
  status.bottom = hasContent(0, ctx.canvas.height - bleedPixels, ctx.canvas.width, bleedPixels);

  // Check left bleed
  status.left = hasContent(0, 0, bleedPixels, ctx.canvas.height);

  // Check right bleed
  status.right = hasContent(ctx.canvas.width - bleedPixels, 0, bleedPixels, ctx.canvas.height);

  return status;
}