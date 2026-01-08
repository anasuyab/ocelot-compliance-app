import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, Loader2, FileText } from 'lucide-react';

const AttestationView = ({ 
  theme, 
  fileName,
  blueprintImage, // <--- New Prop
  onBack, 
  onStartAnalysis, 
  isValidating 
}) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`${theme.cardBackground} rounded-xl shadow-lg p-8 border ${theme.cardBorder}`}>
        
        {/* Icon Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 ring-8 ring-blue-50/50`}>
            <ShieldCheck className={`w-8 h-8 text-blue-600`} />
          </div>
          <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>Project Attestation</h2>
          <p className={theme.textSecondary}>Please confirm document completeness before analysis.</p>
        </div>

        {/* Document Card & Checkbox */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
           
           {/* FILE INFO + THUMBNAIL */}
           <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
             {/* Thumbnail Container */}
             <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm relative">
                {blueprintImage ? (
                  <img 
                    src={blueprintImage} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                    <FileText size={24}/>
                  </div>
                )}
             </div>

             <div className="flex-1 min-w-0">
               <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Selected Document</p>
               <h3 className="font-bold text-gray-900 text-lg truncate" title={fileName}>
                 {fileName}
               </h3>
             </div>
           </div>
           
           {/* Checkbox */}
           <label className="flex items-start gap-4 cursor-pointer group p-3 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-all">
             <div className="relative flex items-center mt-1">
               <input 
                 type="checkbox" 
                 className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 shadow-sm checked:border-blue-600 checked:bg-blue-600 transition-all"
                 checked={isChecked}
                 onChange={(e) => setIsChecked(e.target.checked)}
               />
               <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" width="12" height="12" viewBox="0 0 12 12" fill="none">
                 <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
             </div>
             <div className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors leading-relaxed">
                I attest that I am authorized to submit a lease proposal to the U.S. Department of the Interior for the following facility(ies) pursuant to Public Law 93-638.
             </div>
           </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button 
            onClick={onBack}
            className={`flex-1 py-3 px-4 rounded-lg border border-gray-300 font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2`}
            disabled={isValidating}
          >
            <ArrowLeft size={18} />
            Back
          </button>
          
          <button 
            onClick={onStartAnalysis}
            disabled={!isChecked || isValidating}
            className={`flex-[2] py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              !isChecked || isValidating 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            {isValidating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Validating Blueprint...
              </>
            ) : (
              "Confirm & Analyze"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttestationView;