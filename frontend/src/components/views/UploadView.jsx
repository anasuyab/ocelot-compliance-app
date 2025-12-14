import React from 'react';
import { Upload, Image } from 'lucide-react';

const UploadView = ({ theme, uploadedFile, onUpload, onStartAnalysis }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className={`${theme.cardBackground} rounded-xl shadow-lg p-8 border ${theme.cardBorder}`}>
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
            />
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-3">
                <Image className="w-8 h-8 text-green-600" />
                <div className="text-left">
                  <p className={`font-semibold ${theme.textPrimary}`}>{uploadedFile.name}</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className={`w-12 h-12 ${theme.uploadIcon} mx-auto mb-3`} />
                <p className={`${theme.textPrimary} font-medium`}>Click to upload</p>
              </>
            )}
          </div>
        </label>

        {uploadedFile && (
          <button 
            onClick={onStartAnalysis}
            className={`w-full mt-6 ${theme.primaryButton} ${theme.primaryButtonText} font-semibold py-3 rounded-lg transition-colors`}
          >
            Analyze Blueprint
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadView;