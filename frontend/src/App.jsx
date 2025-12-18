import React, { useState } from 'react';
import { FileText } from 'lucide-react';

// 1. Logic & Data Imports
import { getThemeFromURL } from './themes/themes';
import { useBlueprintAnalysis } from './hooks/useBlueprintAnalysis';
import { useBlueprintValidation } from './hooks/useBlueprintValidation';

// 2. View Component Imports
import UploadView from './components/views/UploadView';
import AnalysisView from './components/views/AnalysisView';
import ReviewView from './components/views/ReviewView'; // <--- NEW IMPORT
import ComplianceReport from './components/views/ComplianceReport';
import StepIndicator from './components/common/StepIndicator';

const App = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [blueprintImage, setBlueprintImage] = useState(null);
  
  // New state to track if we have finished the interactive review
  const [hasReviewed, setHasReviewed] = useState(false);
  const [finalReportData, setFinalReportData] = useState(null);

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
  const displayError = validationError || analysisError;

  // Updated Logic: We insert 'review' between analyzing and report
  const getCurrentStep = () => {
    if (status === 'error') return 'upload';
    if (status === 'analyzing') return 'analyzing';
    
    // When analysis is complete...
    if (status === 'complete') {
      // If we haven't finished reviewing, show review step
      if (!hasReviewed) return 'review';
      // If review is done, show report
      return 'report';
    }
    
    return 'upload';
  };

  const currentStep = getCurrentStep();

  // Handlers
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      resetValidation(); 
      const reader = new FileReader();
      reader.onload = (event) => {
        setBlueprintImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async () => {
    if (uploadedFile) {
      const isValid = await validateBlueprint(uploadedFile);
      if (isValid) {
        startAnalysis(uploadedFile);
      }
    }
  };

  // Called when user clicks "Generate Report" in the ReviewView
  const handleReviewComplete = (editedRooms) => {
    // In a real app, you might re-run compliance checks here against the edited rooms
    // For now, we update the result with the user's edits
    setFinalReportData({ ...result, rooms: editedRooms });
    setHasReviewed(true);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setBlueprintImage(null);
    setHasReviewed(false); // Reset review state
    setFinalReportData(null);
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

        {/* --- Progress Steps (Added Review Step) --- */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <StepIndicator 
            number={1} label="Upload" 
            active={currentStep === 'upload'} 
            completed={currentStep !== 'upload'} 
            theme={theme} 
          />
          <div className={`w-10 h-0.5 ${theme.stepDivider}`}></div>
          <StepIndicator 
            number={2} label="Analysis" 
            active={currentStep === 'analyzing'} 
            completed={currentStep === 'review' || currentStep === 'report'} 
            theme={theme} 
          />
          <div className={`w-10 h-0.5 ${theme.stepDivider}`}></div>
          <StepIndicator 
            number={3} label="Review" 
            active={currentStep === 'review'} 
            completed={currentStep === 'report'} 
            theme={theme} 
          />
          <div className={`w-10 h-0.5 ${theme.stepDivider}`}></div>
          <StepIndicator 
            number={4} label="Report" 
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
            isValidating={validationStatus === 'validating'}
          />
        )}

        {currentStep === 'analyzing' && (
          <AnalysisView 
            theme={theme}
            progress={progress}
          />
        )}

        {/* New Review Step */}
        {currentStep === 'review' && result && (
          <ReviewView 
            theme={theme}
            blueprintImage={blueprintImage}
            // Assuming 'result' currently contains the raw detected rooms or similar structure
            // If result is { rooms: [...] }, pass result.rooms
            initialRooms={result.rooms || result} 
            onComplete={handleReviewComplete}
            onReset={handleReset}
          />
        )}

        {currentStep === 'report' && (
          <ComplianceReport 
            theme={theme}
            // Use the data modified by the review step
            report={finalReportData || result} 
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export default App;