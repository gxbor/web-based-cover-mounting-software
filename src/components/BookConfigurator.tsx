import React, { useState } from 'react';
import { BookConfig } from '../types/book';
import WelcomeScreen from './WelcomeScreen';
import BookConfigurationStep from './steps/BookConfigurationStep';
import FileUploadStep from './steps/FileUploadStep';
import PreviewStep from './steps/PreviewStep';
import ContentPDFUpload from './ContentPDFUpload';
import SpecificationsStep from './steps/SpecificationsStep';
import CheckoutStep from './steps/CheckoutStep';
import { calculateDimensions } from '../utils/calculations';
import { generatePDF } from '../utils/pdfExport';
import { drawElement } from '../utils/canvas';

const initialConfig: BookConfig = {
  bindingType: 'hardcover',
  paperType: '135g_art_matt',
  pageCount: 100,
  format: 'A4',
  isColorPages: true,
  spineType: 'straight',
  quantity: 1,
  coverFinish: 'matte',
  files: {},
  isProfessionalCover: false,
  isPreTested: false,
  contentPDFValidated: false,
  backgroundColor: '#ffffff',
  designService: {
    enabled: false,
    email: '',
    phone: '',
    brief: ''
  },
  hardcoverOptions: {
    frontPaperColor: 'white',
    headbandColor: 'white',
    ribbonColor: undefined
  },
  customFormat: undefined,
  comments: ''
};

const steps = [
  { id: 'welcome', title: 'Willkommen' },
  { id: 'configuration', title: 'Konfiguration' },
  { id: 'upload', title: 'Cover Dateien' },
  { id: 'preview', title: 'Editieren' }
];

export default function BookConfigurator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<BookConfig>(initialConfig);
  const [showWelcome, setShowWelcome] = useState(true);

  const updateConfig = (updates: Partial<BookConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleStart = () => {
    setShowWelcome(false);
    setCurrentStep(1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return true;
      case 2:
        if (config.isProfessionalCover) {
          return config.files.professionalCover && config.isPreTested;
        }
        return config.files.frontCover && config.files.spine && config.files.backCover;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleFinish = async () => {
    // Find and click the export button in PreviewStep
    const exportButton = document.querySelector('button:has(.lucide-download)') as HTMLButtonElement;
    if (exportButton) {
      exportButton.click();
    }
    
    // Reset the configurator
    setConfig(initialConfig);
    setShowWelcome(true);
    setCurrentStep(0);
  };

  if (showWelcome) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BookConfigurationStep config={config} updateConfig={updateConfig} />;
      case 2:
        return <FileUploadStep config={config} updateConfig={updateConfig} />;
      case 3:
        return config.isProfessionalCover ? (
          <ContentPDFUpload config={config} updateConfig={updateConfig} />
        ) : (
          <PreviewStep config={config} updateConfig={updateConfig} />
        );
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="mb-6 sm:mb-8 overflow-x-auto">
        <div className="flex justify-between items-center min-w-[640px] px-4">
          {steps.slice(1).map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 ${
                    index + 1 < currentStep
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : index + 1 === currentStep
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-gray-300 text-gray-300'
                  }`}
                >
                  <span className="text-xs sm:text-sm">
                    {index + 1 < currentStep ? '✓' : index + 1}
                  </span>
                </div>
                <span className={`mt-1 sm:mt-2 text-xs sm:text-sm whitespace-nowrap ${
                  index + 1 <= currentStep ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 2 && (
                <div className="flex-1 mx-2 sm:mx-4">
                  <div className={`h-0.5 ${
                    index + 1 < currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                  }`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      {currentStep > 0 && (
        <div className="flex gap-3 sm:gap-4 px-4">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            className={`flex-1 px-3 sm:px-6 py-2 text-sm sm:text-base rounded-lg border border-gray-300 ${
              currentStep === 1
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-50'
            }`}
            disabled={currentStep === 1}
          >
            zurück
          </button>
          
          <button
            onClick={() => currentStep === steps.length - 1 ? handleFinish() : setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
            disabled={!canProceed()}
            className={`flex-1 px-3 sm:px-6 py-2 text-sm sm:text-base rounded-lg bg-indigo-600 text-white ${
              canProceed()
                ? 'hover:bg-indigo-700'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {currentStep === steps.length - 1 ? 'Ende' : 'Nächstes'}
          </button>
        </div>
      )}
    </div>
  );
}