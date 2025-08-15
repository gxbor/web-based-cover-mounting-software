export type Format = 
  | 'A4' 
  | 'A5' 
  | 'A6'
  | 'A4_landscape'
  | 'A5_landscape'
  | '17x24'
  | '15.5x22'
  | '21x21'
  | '21x28'
  | '13x19'
  | 'custom';

export interface CustomFormat {
  width: number;
  height: number;
}

export interface BookConfig {
  bindingType: 'hardcover' | 'softcover';
  paperType: PaperType;
  pageCount: number;
  format: Format;
  customFormat?: CustomFormat;
  isColorPages: boolean;
  spineType: SpineType;
  quantity: number;
  coverFinish: CoverFinish;
  files: {
    frontCover?: File;
    backCover?: File;
    spine?: File;
    professionalCover?: File;
    contentPDF?: File;
  };
  isProfessionalCover: boolean;
  isPreTested: boolean;
  contentPDFValidated: boolean;
  backgroundColor?: string;
  designService: {
    enabled: boolean;
    email: string;
    phone: string;
    brief: string;
  };
  hardcoverOptions: {
    frontPaperColor: string;
    headbandColor: string;
    ribbonColor?: string;
  };
  comments?: string;
}

export type PaperType =
  | '80g_recycling'
  | '80g_offset'
  | '100g_offset'
  | '120g_offset'
  | '160g_offset'
  | '80g_volume_1_5'
  | '90g_volume_1_8'
  | '100g_art_matt'
  | '100g_art_gloss'
  | '135g_art_matt'
  | '135g_art_gloss'
  | '170g_art_matt'
  | '170g_art_gloss';

export type SpineType = 'straight' | 'curved';
export type CoverFinish = 'matte' | 'glossy';

export interface Dimensions {
  spineWidth: number;
  coverWidth: number;
  coverHeight: number;
}

export interface BleedStatus {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}