import React, { useState } from 'react';
import { FileText } from 'lucide-react';

// 1. Logic & Data Imports
import { getThemeFromURL } from './themes/themes';
import { useBlueprintAnalysis } from './hooks/useBlueprintAnalysis';
import { useBlueprintValidation } from './hooks/useBlueprintValidation'; // <--- Import new hook

// 2. View Component Imports
import UploadView from './components/views/UploadView';
import AnalysisView from './components/views/AnalysisView';
import ComplianceReport from './components/views/ComplianceReport';
import StepIndicator from './components/common/StepIndicator';

const App = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [blueprintImage, setBlueprintImage] = useState(null);
  
  // 3. Use the Custom Hooks
  const { 
    status,        
    progress,      
    result,        
    error: analysisError, 
    startAnalysis, 
    resetAnalysis  
  } = useBlueprintAnalysis();

  const {
    validationStatus,
    validationError,
    validateBlueprint,
    resetValidation
  } = useBlueprintValidation();

  const theme = getThemeFromURL();

  // Combine errors for the main banner
  const displayError = validationError || analysisError;

  const getCurrentStep = () => {
    switch (status) {
      case 'analyzing': return 'analyzing';
      case 'complete': return 'report';
      case 'error': return 'upload';
      default: return 'upload';
    }
  };

  const currentStep = getCurrentStep();

  // Handlers
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      // Reset validation state when a new file is chosen
      resetValidation(); 
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setBlueprintImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- CHAINED LOGIC HERE ---
  const handleStartAnalysis = async () => {
    if (uploadedFile) {
      // Step 1: Validate
      const isValid = await validateBlueprint(uploadedFile);
      
      // Step 2: If valid, Analyze
      if (isValid) {
        startAnalysis(uploadedFile);
      }
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setBlueprintImage(null);
    resetValidation();
    resetAnalysis();
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.pageBackground}`}>
      
      {/* --- Header --- */}
      <div className={`${theme.headerBackground} border-b ${theme.headerBorder} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText className={`w-8 h-8 ${theme.headerIcon}`} />
            <div>
              <h1 className={`text-2xl font-bold ${theme.headerTitle}`}>Blueprint Compliance Checker</h1>
              <p className={`text-sm ${theme.headerSubtitle}`}>105(l) Lease Facility Requirements Analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* --- Error Banner --- */}
        {displayError && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{displayError}</span>
          </div>
        )}

        {/* --- Progress Steps --- */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <StepIndicator 
            number={1} 
            label="Upload" 
            active={currentStep === 'upload'} 
            completed={currentStep !== 'upload'} 
            theme={theme} 
          />
          <div className={`w-16 h-0.5 ${theme.stepDivider}`}></div>
          <StepIndicator 
            number={2} 
            label="Analysis" 
            active={currentStep === 'analyzing'} 
            completed={currentStep === 'report'} 
            theme={theme} 
          />
          <div className={`w-16 h-0.5 ${theme.stepDivider}`}></div>
          <StepIndicator 
            number={3} 
            label="Report" 
            active={currentStep === 'report'} 
            theme={theme} 
          />
        </div>

        {/* --- View Switcher --- */}
        {currentStep === 'upload' && (
          <UploadView 
            theme={theme}
            uploadedFile={uploadedFile}
            blueprintImage={blueprintImage}
            onUpload={handleFileUpload}
            onStartAnalysis={handleStartAnalysis}
            isValidating={validationStatus === 'validating'} // Pass loading state
          />
        )}

        {currentStep === 'analyzing' && (
          <AnalysisView 
            theme={theme}
            progress={progress}
          />
        )}

        {currentStep === 'report' && result && (
          <ComplianceReport 
            theme={theme}
            report={result} 
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export default App;