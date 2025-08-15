import { Format, PaperType, BookConfig, Dimensions } from '../types/book';

// Format dimensions with all formats
const FORMAT_DIMENSIONS: Record<Format, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  A6: { width: 105, height: 148 },
  A4_landscape: { width: 297, height: 210 },
  A5_landscape: { width: 210, height: 148 },
  '17x24': { width: 170, height: 240 },
  '15.5x22': { width: 155, height: 220 },
  '21x21': { width: 210, height: 210 },
  '21x28': { width: 210, height: 280 },
  '13x19': { width: 130, height: 190 },
  custom: { width: 0, height: 0 } // Placeholder for custom format
};

// Paper thickness values for all paper types
const PAPER_THICKNESS: Record<PaperType, number> = {
  '80g_recycling': 0.05,
  '80g_offset': 0.055,
  '100g_offset': 0.065,
  '120g_offset': 0.08,
  '160g_offset': 0.098,
  '80g_volume_1_5': 0.061,
  '90g_volume_1_8': 0.0783,
  '100g_art_matt': 0.042,
  '100g_art_gloss': 0.036,
  '135g_art_matt': 0.058,
  '135g_art_gloss': 0.052,
  '170g_art_matt': 0.07,
  '170g_art_gloss': 0.064
};

// Format multipliers for pricing
const FORMAT_MULTIPLIERS: Record<Format, number> = {
  A4: 1.2,
  A5: 1.0,
  A6: 0.8,
  A4_landscape: 1.2,
  A5_landscape: 1.0,
  '17x24': 1.1,
  '15.5x22': 1.0,
  '21x21': 1.1,
  '21x28': 1.15,
  '13x19': 0.9,
  custom: 1.3
};

export interface PriceBreakdown {
  basePrice: number;
  optionsPrice: number;
  quantityPrice: number;
  discount: number;
  total: number;
}

export function calculateDimensions(config: BookConfig): Dimensions {
  const { format, paperType, pageCount, bindingType, customFormat } = config;
  
  // Get format dimensions
  let formatDims;
  if (format === 'custom' && customFormat) {
    formatDims = {
      width: customFormat.width || 210,
      height: customFormat.height || 297
    };
  } else {
    formatDims = FORMAT_DIMENSIONS[format];
  }
  
  // Calculate spine width based on page count and paper thickness
  const spineWidth = bindingType === 'hardcover'
    ? pageCount * PAPER_THICKNESS[paperType] + 6
    : pageCount * PAPER_THICKNESS[paperType];
  
  // Calculate cover dimensions based on binding type
  const coverWidth = bindingType === 'hardcover'
    ? 2 * formatDims.width + spineWidth + 29
    : 2 * formatDims.width + spineWidth + 6;
    
  const coverHeight = bindingType === 'hardcover'
    ? formatDims.height + 26
    : formatDims.height + 6;
    
  return {
    spineWidth,
    coverWidth,
    coverHeight,
  };
}

export function calculatePrice(config: BookConfig): PriceBreakdown {
  // Calculate base price
  const basePagePrice = PAPER_PRICES[config.paperType];
  const formatMultiplier = FORMAT_MULTIPLIERS[config.format];
  let basePrice = config.pageCount * basePagePrice * formatMultiplier;

  // Add binding cost
  basePrice += config.bindingType === 'hardcover' ? 15 : 5;

  // Calculate options price
  let optionsPrice = 0;

  // Add professional cover design service cost
  if (config.isProfessionalCover && config.designService?.enabled) {
    optionsPrice += 50;
  }

  // Color pages
  if (config.isColorPages) {
    optionsPrice += config.pageCount * 0.15;
  }

  // Cover finish
  if (config.coverFinish === 'glossy') {
    optionsPrice += 2;
  }

  // Hardcover options
  if (config.bindingType === 'hardcover') {
    if (config.hardcoverOptions?.ribbonColor) {
      optionsPrice += 3;
    }
  }

  // Calculate quantity price (base + options multiplied by quantity)
  const quantityPrice = (basePrice + optionsPrice) * (config.quantity - 1);

  // Calculate bulk discount
  let discount = 0;
  if (config.quantity >= 100) {
    discount = (basePrice + optionsPrice + quantityPrice) * 0.2;
  } else if (config.quantity >= 50) {
    discount = (basePrice + optionsPrice + quantityPrice) * 0.15;
  } else if (config.quantity >= 20) {
    discount = (basePrice + optionsPrice + quantityPrice) * 0.1;
  } else if (config.quantity >= 10) {
    discount = (basePrice + optionsPrice + quantityPrice) * 0.05;
  }

  // Calculate total
  const total = basePrice + optionsPrice + quantityPrice - discount;

  return {
    basePrice,
    optionsPrice,
    quantityPrice,
    discount,
    total
  };
}

export function getBleedMeasurements(isHardcover: boolean) {
  return {
    horizontal: isHardcover ? 14.5 : 3,
    vertical: isHardcover ? 13 : 3
  };
}