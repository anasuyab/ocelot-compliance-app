import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { getThemeFromURL } from './themes/themes';
import { mockReport } from './data/mockReport';

// View Imports
import UploadView from './components/views/UploadView';
import AnalysisView from './components/views/AnalysisView';
import ComplianceReport from './components/views/ComplianceReport';
import StepIndicator from './components/common/StepIndicator';

const App = () => {
  const [currentStep, setCurrentStep] = useState('upload'); 
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  const theme = getThemeFromURL();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedFile(file);
  };

  const startAnalysis = () => {
    setCurrentStep('analyzing');
    // API logic here (or extracted to a custom hook)
    fetch('https://ocelot-compliance-app-api.vercel.app/api/analyze')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // or response.text() if your backend returns plain text
    })
    .then(data => {
      console.log('Analysis results:', data); 
    })
    .catch(error => {
      console.error('Error during analysis API call:', error);
    });
    
    // Simulation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setAnalysisProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setCurrentStep('report'), 500);
      }
    }, 400);
  };

  const resetApp = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setAnalysisProgress(0);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.pageBackground}`}>
      {/* Global Header */}
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
        {/* Navigation / Progress Bar */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <StepIndicator number={1} label="Upload" active={currentStep === 'upload'} completed={currentStep !== 'upload'} theme={theme} />
          <div className={`w-16 h-0.5 ${theme.stepDivider}`}></div>
          <StepIndicator number={2} label="Analysis" active={currentStep === 'analyzing'} completed={currentStep === 'report'} theme={theme} />
          <div className={`w-16 h-0.5 ${theme.stepDivider}`}></div>
          <StepIndicator number={3} label="Report" active={currentStep === 'report'} theme={theme} />
        </div>

        {/* View Switcher Logic */}
        {currentStep === 'upload' && (
          <UploadView 
            theme={theme} 
            uploadedFile={uploadedFile} 
            onUpload={handleFileUpload} 
            onStartAnalysis={startAnalysis} 
          />
        )}

        {currentStep === 'analyzing' && (
          <AnalysisView 
            theme={theme} 
            progress={analysisProgress} 
          />
        )}

        {currentStep === 'report' && (
          <ComplianceReport 
            theme={theme} 
            report={mockReport} 
            onReset={resetApp} 
          />
        )}
      </div>
    </div>
  );
};

export default App;