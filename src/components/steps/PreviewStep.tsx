import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BookConfig, CoverElement, Format, PaperType } from '../../types/book';
import { calculateDimensions, getBleedMeasurements } from '../../utils/calculations';
import { drawElement } from '../../utils/canvas';
import { generatePDF } from '../../utils/pdfExport';
import { Download, Droplet, Ruler, Settings } from 'lucide-react';
import { isMobileDevice, isSafariMobile } from '../../utils/device';
import * as pdfjsLib from 'pdfjs-dist';

interface Props {
  config: BookConfig;
  updateConfig: (updates: Partial<BookConfig>) => void;
}

// Paper types array
const paperTypes = [
  { value: '80g_recycling', label: '80g/m² Recycling Papier' },
  { value: '80g_offset', label: '80g/m² Offset Papier' },
  { value: '100g_offset', label: '100g/m² Offset Papier' },
  { value: '120g_offset', label: '120g/m² Offset Papier' },
  { value: '160g_offset', label: '160g/m² Offset Papier' },
  { value: '80g_volume_1_5', label: '80g/m² Volume Papier 1.5' },
  { value: '90g_volume_1_8', label: '90g/m² Volume Papier 1.8' },
  { value: '100g_art_matt', label: '100g/m² Art Papier Matt' },
  { value: '100g_art_gloss', label: '100g/m² Art Papier Gloss' },
  { value: '135g_art_matt', label: '135g/m² Art Papier Matt' },
  { value: '135g_art_gloss', label: '135g/m² Art Papier Gloss' },
  { value: '170g_art_matt', label: '170g/m² Art Papier Matt' },
  { value: '170g_art_gloss', label: '170g/m² Art Papier Gloss' }
];

// Formats array
const formats = [
  { value: 'A4', label: 'DIN A4', dimensions: '210×297mm' },
  { value: 'A5', label: 'DIN A5', dimensions: '148×210mm' },
  { value: 'A6', label: 'DIN A6', dimensions: '105×148mm' },
  { value: 'A4_landscape', label: 'DIN A4 Quer', dimensions: '297×210mm' },
  { value: 'A5_landscape', label: 'DIN A5 Quer', dimensions: '210×148mm' },
  { value: '17x24', label: '17×24', dimensions: '170×240mm' },
  { value: '15.5x22', label: '15.5×22', dimensions: '155×220mm' },
  { value: '21x21', label: '21×21', dimensions: '210×210mm' },
  { value: '21x28', label: '21×28', dimensions: '210×280mm' },
  { value: '13x19', label: '13×19', dimensions: '130×190mm' },
  { value: 'custom', label: 'Variabel', dimensions: 'X x X' }
];

export default function PreviewStep({ config, updateConfig }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<CoverElement[]>([]);
  const [backgroundColor, setBackgroundColor] = useState<string>(config.backgroundColor || '#ffffff');
  const [isAutoColor, setIsAutoColor] = useState(!config.backgroundColor);
  const [coverScales, setCoverScales] = useState({ front: 1, back: 1 });
  const dimensions = calculateDimensions(config);
  const objectUrlsRef = useRef<string[]>([]);
  const imageDataRef = useRef<{[key: string]: string}>({});

  const loadImage = useCallback(async (file: File, type: 'front' | 'spine' | 'back'): Promise<CoverElement> => {
    return new Promise(async (resolve, reject) => {
      try {
        let imageData: string;

        if (file.type === 'application/pdf') {
          // Handle PDF file
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          
          // Get total number of pages
          const numPages = pdf.numPages;
          console.log(`PDF has ${numPages} pages`);
          
          // Determine which page to use based on type (matching FileUploadStep order)
          let pageNum = type === 'front' ? 3 : type === 'spine' ? 2 : 1;
          
          // Validate page number
          if (pageNum > numPages) {
            throw new Error(`PDF only has ${numPages} pages, but page ${pageNum} was requested for ${type} cover`);
          }
          
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
          
          imageData = canvas.toDataURL('image/png');
        } else {
          // Handle regular image file
          const reader = new FileReader();
          imageData = await new Promise<string>((resolveReader) => {
            reader.onload = (e) => resolveReader(e.target?.result as string);
            reader.onerror = () => reject(new Error(`Failed to read file for ${type}`));
            reader.readAsDataURL(file);
          });
        }

        const img = new Image();
        img.src = imageData;
        imageDataRef.current[type] = imageData;

        img.onload = () => {
          const safeWidth = dimensions.coverWidth - (2 * getBleedMeasurements(config.bindingType === 'hardcover').horizontal);
          const safeHeight = dimensions.coverHeight - (2 * getBleedMeasurements(config.bindingType === 'hardcover').vertical);
          const spineWidth = dimensions.spineWidth;
          const sideWidth = (safeWidth - spineWidth) / 2;
          
          let x = getBleedMeasurements(config.bindingType === 'hardcover').horizontal;
          let width = sideWidth;
          let height = safeHeight;
          const scale = type === 'front' ? coverScales.front : type === 'back' ? coverScales.back : 1;

          // Calculate scaled dimensions while maintaining aspect ratio
          const scaledWidth = width * scale;
          const scaledHeight = height * scale;

          // Calculate vertical offset to keep centered
          const verticalOffset = (scaledHeight - height) / 2;

          switch (type) {
            case 'back':
              x = getBleedMeasurements(config.bindingType === 'hardcover').horizontal + sideWidth - scaledWidth;
              width = scaledWidth;
              height = scaledHeight;
              break;
            case 'spine':
              x = getBleedMeasurements(config.bindingType === 'hardcover').horizontal + sideWidth;
              width = spineWidth;
              break;
            case 'front':
              x = getBleedMeasurements(config.bindingType === 'hardcover').horizontal + sideWidth + spineWidth;
              width = scaledWidth;
              height = scaledHeight;
              break;
          }
          
          resolve({
            id: type,
            type,
            x,
            y: getBleedMeasurements(config.bindingType === 'hardcover').vertical - verticalOffset,
            width,
            height,
            image: img,
            scale,
            url: imageDataRef.current[type]
          });
        };
        
        img.onerror = () => {
          console.error(`Error loading ${type} cover:`, {
            imageSource: file.type === 'application/pdf' ? 'pdf-converted' : 'base64',
            fileType: file.type,
            fileSize: file.size,
            fileName: file.name
          });
          reject(new Error(`Cover konnte nicht geladen werden ${type}`));
        };
      } catch (error) {
        console.error(`Error processing ${type} cover:`, error);
        reject(error);
      }
    });
  }, [dimensions, config.bindingType, coverScales]);

  // Initialize elements
  useEffect(() => {
    const initElements = async () => {
      try {
        const types: Array<'back' | 'spine' | 'front'> = ['back', 'spine', 'front'];
        const newElements: CoverElement[] = [];

        for (const type of types) {
          const fileKey = type === 'spine' ? 'spine' : `${type}Cover`;
          const file = config.files[fileKey as keyof typeof config.files];

          if (file) {
            try {
              const element = await loadImage(file, type);
              newElements.push(element);
            } catch (error) {
              console.error(`Error loading ${type} cover:`, error);
            }
          }
        }

        setElements(newElements);
      } catch (error) {
        console.error('Error initializing elements:', error);
      }
    };

    initElements();
  }, [config.files, loadImage, coverScales]);

  // Update element scales when coverScales changes
  useEffect(() => {
    setElements(prevElements => 
      prevElements.map(element => {
        if (element.type === 'front' || element.type === 'back') {
          const scale = element.type === 'front' ? coverScales.front : coverScales.back;
          return {
            ...element,
            scale
          };
        }
        return element;
      })
    );
  }, [coverScales]);

  // Cleanup
  useEffect(() => {
    return () => {
      imageDataRef.current = {};
    };
  }, []);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const draw = () => {
      // Use a lower DPI for mobile devices to improve performance
      const scale = isMobileDevice() ? 72 / 25.4 : 96 / 25.4; // 72 DPI for mobile, 96 DPI for desktop
      canvas.width = Math.round(dimensions.coverWidth * scale);
      canvas.height = Math.round(dimensions.coverHeight * scale);

      ctx.scale(scale, scale);

      // Draw background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, dimensions.coverWidth, dimensions.coverHeight);

      // Draw elements
      elements.forEach(element => {
        // On mobile, don't draw helper lines to improve performance
        drawElement(ctx, element, false, dimensions, config.bindingType === 'hardcover', !isMobileDevice());
      });
    };

    draw();
  }, [elements, dimensions, config.bindingType, backgroundColor]);

  const handleExportPDF = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Use higher resolution for PDF export
    const scale = isMobileDevice() ? 2 : 32; // Lower scale on mobile to prevent memory issues
    tempCanvas.width = Math.round(dimensions.coverWidth * scale);
    tempCanvas.height = Math.round(dimensions.coverHeight * scale);

    tempCtx.scale(scale, scale);

    // Draw background
    tempCtx.fillStyle = backgroundColor;
    tempCtx.fillRect(0, 0, dimensions.coverWidth, dimensions.coverHeight);

    // Draw elements without helper lines
    elements.forEach(element => {
      drawElement(tempCtx, element, false, dimensions, config.bindingType === 'hardcover', false);
    });

    const pdf = await generatePDF(tempCanvas, dimensions);
    pdf.save('book-cover.pdf');
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Vorschau & Editieren</h2>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="flex-1 space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={handleExportPDF}
                className="w-full sm:w-auto h-12 sm:h-10 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 text-base"
              >
                <Download className="w-5 h-5" />
                PDF exportieren
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Droplet className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <label className="text-sm text-gray-700 whitespace-nowrap">Hintergrund:</label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => {
                    setIsAutoColor(false);
                    setBackgroundColor(e.target.value);
                    updateConfig({ backgroundColor: e.target.value });
                  }}
                  className="w-12 h-12 sm:w-10 sm:h-10 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Canvas Preview */}
          <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{ maxHeight: '70vh' }}
            />
          </div>

          {/* Cover Part Scale Controls */}
          <div className="space-y-4 bg-white rounded-lg border border-gray-200 p-4">
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Vorderseite skalieren</span>
                <span className="text-gray-500">{(coverScales.front * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="1"
                max="1.2"
                step="0.01"
                value={coverScales.front}
                onChange={(e) => setCoverScales(prev => ({
                  ...prev,
                  front: parseFloat(e.target.value)
                }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Rückseite skalieren</span>
                <span className="text-gray-500">{(coverScales.back * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="1"
                max="1.2"
                step="0.01"
                value={coverScales.back}
                onChange={(e) => setCoverScales(prev => ({
                  ...prev,
                  back: parseFloat(e.target.value)
                }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="w-full lg:w-80">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Konfiguration Live Anpassen</h3>
            </div>
            
            <div className="space-y-6">
              {/* Binding Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover-Art
                </label>
                <select
                  value={config.bindingType}
                  onChange={(e) => updateConfig({ bindingType: e.target.value as 'hardcover' | 'softcover' })}
                  className="w-full h-12 sm:h-10 px-3 py-2 border border-gray-300 rounded-lg text-base"
                >
                  <option value="hardcover">Hardcover</option>
                  <option value="softcover">Softcover</option>
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  value={config.format}
                  onChange={(e) => updateConfig({ format: e.target.value as Format })}
                  className="w-full h-12 sm:h-10 px-3 py-2 border border-gray-300 rounded-lg text-base"
                >
                  {formats.map(format => (
                    <option key={format.value} value={format.value}>
                      {format.label} ({format.dimensions})
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Format */}
              {config.format === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Breite (mm)</label>
                    <input
                      type="number"
                      min="100"
                      max="400"
                      value={config.customFormat?.width || 210}
                      onChange={(e) => updateConfig({
                        customFormat: {
                          ...config.customFormat,
                          width: Number(e.target.value)
                        }
                      })}
                      className="w-full h-12 sm:h-10 px-3 py-2 border border-gray-300 rounded-lg text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Höhe (mm)</label>
                    <input
                      type="number"
                      min="100"
                      max="400"
                      value={config.customFormat?.height || 297}
                      onChange={(e) => updateConfig({
                        customFormat: {
                          ...config.customFormat,
                          height: Number(e.target.value)
                        }
                      })}
                      className="w-full h-12 sm:h-10 px-3 py-2 border border-gray-300 rounded-lg text-base"
                    />
                  </div>
                </div>
              )}

              {/* Page Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anzahl an Seiten
                </label>
                <input
                  type="number"
                  min="20"
                  max="800"
                  value={config.pageCount}
                  onChange={(e) => updateConfig({ pageCount: Number(e.target.value) })}
                  className="w-full h-12 sm:h-10 px-3 py-2 border border-gray-300 rounded-lg text-base"
                />
              </div>

              {/* Paper Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Papier Art
                </label>
                <select
                  value={config.paperType}
                  onChange={(e) => updateConfig({ paperType: e.target.value as PaperType })}
                  className="w-full h-12 sm:h-10 px-3 py-2 border border-gray-300 rounded-lg text-base"
                >
                  {paperTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <Ruler className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-2">Cover Informationen</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-baseline gap-2">
                <span className="text-blue-400">•</span>
                <span>Gesamte Abmessungen: {Math.round(dimensions.coverWidth)}mm × {Math.round(dimensions.coverHeight)}mm</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="text-blue-400">•</span>
                <span>Rückenbreite: {Math.round(dimensions.spineWidth)}mm</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="text-blue-400">•</span>
                <span>Geforderte Überfüllung: {config.bindingType === 'hardcover' ? '14.5mm horizontal, 13mm vertical' : '3mm on all sides'}</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="text-blue-400">•</span>
                <span>Bitte den Hintergrund auffüllen und die korrekte Farbe auswählen</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}