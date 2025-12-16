import React from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react'; // Added Loader2

const UploadView = ({ 
  theme, 
  uploadedFile, 
  blueprintImage, 
  onUpload, 
  onStartAnalysis, 
  isValidating // <--- Recieve this prop
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className={`${theme.cardBackground} rounded-xl shadow-lg p-8 border ${theme.cardBorder}`}>
        {/* ... (Header section remains the same) ... */}
        
        <div className="text-center mb-6">
           <Upload className={`w-16 h-16 ${theme.headerIcon} mx-auto mb-4`} />
           <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>Upload Blueprint</h2>
           <p className={theme.textSecondary}>Upload a blueprint or floor plan to check compliance</p>
        </div>

        <label className="block">
          <div className={`border-2 border-dashed ${theme.uploadBorder} rounded-lg p-12 text-center transition-colors cursor-pointer`}>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={onUpload}
              disabled={isValidating} // Disable input while validating
            />
            
            {/* ... (File Preview Logic remains the same) ... */}
             {uploadedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">{uploadedFile.name}</p>
                    </div>
                  </div>
                  {blueprintImage && (
                    <img src={blueprintImage} alt="Blueprint preview" className="max-h-48 mx-auto rounded border border-slate-200" />
                  )}
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-700 font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-slate-500 mt-1">PDF, PNG, JPG up to 10MB</p>
                </>
              )}
          </div>
        </label>

        {uploadedFile && (
          <button 
            onClick={onStartAnalysis}
            disabled={isValidating}
            className={`w-full mt-6 flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg transition-colors ${
              isValidating 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isValidating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Validating Blueprint...
              </>
            ) : (
              "Analyze Blueprint"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadView;