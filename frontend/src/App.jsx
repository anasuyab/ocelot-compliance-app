import React, { useState } from 'react';
import { FileText } from 'lucide-react';

// 1. Logic & Data Imports
import { getThemeFromURL } from './themes/themes';
import { useBlueprintAnalysis } from './hooks/useBlueprintAnalysis';

// 2. View Component Imports
import UploadView from './components/views/UploadView';
import AnalysisView from './components/views/AnalysisView';
import ComplianceReport from './components/views/ComplianceReport';
import StepIndicator from './components/common/StepIndicator';

const App = () => {
  // Local state for the file (before analysis starts)
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // 3. Use the Custom Hook
  // This handles all the API POST logic, loading states, and progress bars
  const { 
    status,        // 'idle', 'analyzing', 'complete', 'error'
    progress,      // 0-100 number
    result,        // The JSON data from your backend
    error,         // Error message if something fails
    startAnalysis, // Function to trigger the API call
    resetAnalysis  // Function to reset everything
  } = useBlueprintAnalysis();

  const theme = getThemeFromURL();

  // 4. Determine which view to show based on Hook status
  const getCurrentStep = () => {
    switch (status) {
      case 'analyzing': return 'analyzing';
      case 'complete': return 'report';
      case 'error': return 'upload'; // Show upload screen on error so they can try again
      default: return 'upload';
    }
  };

  const currentStep = getCurrentStep();

  // Handlers
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleStartAnalysis = () => {
    if (uploadedFile) {
      // This calls the function in your Hook (which calls the Service)
      startAnalysis(uploadedFile);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
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
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* --- Progress Steps Visual --- */}
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
            onUpload={handleFileUpload}
            onStartAnalysis={handleStartAnalysis}
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