import React, { useState } from 'react';
import { FileText } from 'lucide-react';

// 1. Logic & Data Imports
import { getThemeFromURL } from './themes/themes';
import { useBlueprintCategorization } from './hooks/useBlueprintCategorization';
import { useBlueprintValidation } from './hooks/useBlueprintValidation';

// 2. View Component Imports
import UploadView from './components/views/UploadView';
import AttestationView from './components/views/AttestationView';
import AnalysisView from './components/views/AnalysisView';
import CategoryAnnotatedView from './components/views/CategoryAnnotatedView';
import ComplianceReport from './components/views/ComplianceReport';
import StepIndicator from './components/common/StepIndicator';
import { useReportGeneration } from './hooks/useReportGeneration';

const App = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [blueprintImage, setBlueprintImage] = useState(null);
  
  // --- STATE FOR FLOW CONTROL ---
  const [isAttesting, setIsAttesting] = useState(false);
  const [hasViewedAnnotations, setHasViewedAnnotations] = useState(false);

  const { 
    status,          
    progress,        
    result,         
    error: analysisError, 
    startAnalysis, 
    resetAnalysis  
  } = useBlueprintCategorization();

  const {
    validationStatus,
    validationError,
    validateBlueprint,
    resetValidation
  } = useBlueprintValidation();

  const {
    generationStatus,
    generationError,
    generateReport,
    report
  } = useReportGeneration();

  const theme = getThemeFromURL();
  const displayError = validationError || analysisError || generationError;

  // --- LOGIC: DETERMINE CURRENT STEP ---
  const getCurrentStep = () => {
    if (!uploadedFile) return 'upload';
    
    // If file exists and we are attesting (or haven't started analysis yet), go to attestation
    if (uploadedFile && isAttesting && status === 'idle') return 'attestation';
    
    // If file exists but we aren't attesting yet, stay on upload (this happens for manual uploads before clicking continue)
    if (uploadedFile && !isAttesting && status === 'idle') return 'upload';

    if (status === 'analyzing') return 'analyzing';
    if (status === 'complete' && !hasViewedAnnotations) return 'annotated';
    if (status === 'complete' && hasViewedAnnotations) return 'report';
    
    return 'upload';
  };

  const currentStep = getCurrentStep();

  // --- HANDLERS ---

  // 1. Manual File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setIsAttesting(false); // Do not auto-advance for manual uploads
      resetValidation(); 
      const reader = new FileReader();
      reader.onload = (event) => {
        setBlueprintImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Sample Selection (Auto-advance)
  const handleSampleSelection = (file, imageUrl) => {
    setUploadedFile(file);
    setBlueprintImage(imageUrl);
    setIsAttesting(true); // <--- Key change: Auto-advance immediately
    resetValidation();
  };

  const handleContinueToAttestation = () => {
    if (uploadedFile) {
      setIsAttesting(true);
    }
  };

  const handleBackToUpload = () => {
    setIsAttesting(false);
  };

  const handleStartAnalysis = async () => {
    if (uploadedFile) {
      const isValid = await validateBlueprint(uploadedFile);
      if (isValid) {
        startAnalysis(uploadedFile);
      }
    }
  };

  const handleReviewComplete = (editedRooms) => {
    setHasViewedAnnotations(true);
    generateReport(uploadedFile, editedRooms);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setBlueprintImage(null);
    setIsAttesting(false);
    setHasViewedAnnotations(false);
    resetValidation();
    resetAnalysis();
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.pageBackground}`}>
      
      {/* --- Header --- */}
      <div className={`${theme.headerBackground} border-b ${theme.headerBorder} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            {theme.logoSrc ? (
              <img src={theme.logoSrc} alt="Logo" className="w-auto h-12 object-contain" />
            ) : (
              <FileText className={`w-8 h-8 ${theme.headerIcon}`} />
            )}
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
        <div className="mb-8 flex items-center justify-center gap-2 md:gap-4 overflow-x-auto">
          <StepIndicator 
            number={1} label="Upload" 
            active={currentStep === 'upload'} 
            completed={currentStep !== 'upload'} 
            theme={theme} 
          />
          <div className={`w-6 md:w-10 h-0.5 ${theme.stepDivider}`}></div>
          
          <StepIndicator 
            number={2} label="Attestation" 
            active={currentStep === 'attestation'} 
            completed={currentStep !== 'upload' && currentStep !== 'attestation'} 
            theme={theme} 
          />
          <div className={`w-6 md:w-10 h-0.5 ${theme.stepDivider}`}></div>
          
          <StepIndicator 
            number={3} label="Analysis" 
            active={currentStep === 'analyzing'} 
            completed={currentStep === 'annotated' || currentStep === 'report'} 
            theme={theme} 
          />
          <div className={`w-6 md:w-10 h-0.5 ${theme.stepDivider}`}></div>
          
          <StepIndicator 
            number={4} label="Review" 
            active={currentStep === 'annotated'} 
            completed={currentStep === 'report'} 
            theme={theme} 
          />
          <div className={`w-6 md:w-10 h-0.5 ${theme.stepDivider}`}></div>
          
          <StepIndicator 
            number={5} label="Report" 
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
            onContinue={handleContinueToAttestation}
            onSelectSample={handleSampleSelection} // <--- Pass new handler
          />
        )}

        {currentStep === 'attestation' && (
          <AttestationView
            theme={theme}
            fileName={uploadedFile ? uploadedFile.name : "Unknown File"}
            blueprintImage={blueprintImage}
            onBack={handleBackToUpload}
            onStartAnalysis={handleStartAnalysis}
            isValidating={validationStatus === 'validating'}
          />
        )}

        {currentStep === 'analyzing' && (
          <AnalysisView theme={theme} progress={progress} />
        )}

        {currentStep === 'annotated' && result && (
          <CategoryAnnotatedView
            theme={theme}
            blueprintImage={blueprintImage}
            fileName={uploadedFile ? uploadedFile.name.replace(/\.[^/.]+$/, "") : "Untitled Blueprint"}
            roomsData={result.rooms || []}
            imageMetadata={result.imageMetadata || null}
            categorySummary={result.category_summary || null}
            onNext={handleReviewComplete}
            onReset={handleReset}
          />
        )}

        {currentStep === 'report' && generationStatus === 'generating' && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
            <h3 className={`text-xl font-semibold ${theme.textPrimary}`}>Generating Report...</h3>
            <p className={`text-sm ${theme.textSecondary} mt-2`}>Analyzing compliance against 105(l) requirements</p>
          </div>
        )}

        {currentStep === 'report' && generationStatus === 'error' && (
          <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
            <h3 className="text-lg font-bold text-red-700 mb-2">Report Generation Failed</h3>
            <p className="text-red-600 mb-4">We encountered an error compiling the final report.</p>
            <button onClick={handleReset} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
              Start Over
            </button>
          </div>
        )}

        {currentStep === 'report' && generationStatus === 'complete' && report && (
          <ComplianceReport 
            theme={theme}
            blueprintImage={blueprintImage} 
            report={report} 
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export default App;