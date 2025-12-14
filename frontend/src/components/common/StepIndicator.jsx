import React from 'react';
import { CheckCircle } from 'lucide-react';

const StepIndicator = ({ number, label, active, completed, theme }) => (
  <div className="flex flex-col items-center">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
      completed ? theme.stepCompleted + ' text-white' :
      active ? theme.stepActive + ' text-white' : 
      theme.stepInactive + ' text-slate-600'
    }`}>
      {completed ? <CheckCircle className="w-5 h-5" /> : number}
    </div>
    <span className={`text-xs mt-1 font-medium ${active ? theme.textPrimary : theme.textSecondary}`}>{label}</span>
  </div>
);

export default StepIndicator;