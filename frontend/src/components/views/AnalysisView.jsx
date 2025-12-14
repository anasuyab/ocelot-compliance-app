import React from 'react';
import { Loader, CheckCircle } from 'lucide-react';

// You can keep small, specific sub-components in the same file if they aren't used elsewhere
const AnalysisStep = ({ label, completed }) => (
  <div className="flex items-center gap-3">
    {completed ? <CheckCircle className="w-5 h-5 text-green-600" /> : <div className="w-5 h-5 border-2 border-slate-300 rounded-full"></div>}
    <span className={`text-sm ${completed ? 'text-slate-900' : 'text-slate-500'}`}>{label}</span>
  </div>
);

const AnalysisView = ({ theme, progress }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className={`${theme.cardBackground} rounded-xl shadow-lg p-12 border ${theme.cardBorder}`}>
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Loader className={`w-24 h-24 ${theme.loaderIcon} animate-spin`} />
          </div>
          <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>Analyzing Blueprint</h2>
          
          <div className={`w-full ${theme.progressBar} rounded-full h-3 mb-4`}>
            <div 
              className={`${theme.progressFill} h-3 rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="mt-8 space-y-3 text-left">
            <AnalysisStep label="Extracting blueprint features" completed={progress > 20} />
            <AnalysisStep label="Retrieving relevant policies" completed={progress > 40} />
            <AnalysisStep label="Checking space requirements" completed={progress > 60} />
            {/* ... other steps ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;