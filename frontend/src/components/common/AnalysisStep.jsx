import React from 'react';
import { CheckCircle } from 'lucide-react';

const AnalysisStep = ({ label, completed }) => (
    <div className="flex items-center gap-3">
      {completed ? (
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
      ) : (
        <div className="w-5 h-5 border-2 border-slate-300 rounded-full flex-shrink-0"></div>
      )}
      <span className={`text-sm ${completed ? 'text-slate-900' : 'text-slate-500'}`}>{label}</span>
    </div>
  );

  export default AnalysisStep;