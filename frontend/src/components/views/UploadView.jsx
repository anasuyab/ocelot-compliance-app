import React from 'react';
import { Upload, FileText, Image, FolderOpen, ArrowRight } from 'lucide-react'; 

const SAMPLE_BLUEPRINTS = [
  {
    id: 1,
    name: "Community Center",
    file: "/community-center.png",
    thumbnail: "/community-center.png"
  },
  {
    id: 2,
    name: "Detention Center",
    file: "/detention-center.png",
    thumbnail: "/detention-center.png"
  }
];

const UploadView = ({ 
  theme, 
  uploadedFile, 
  blueprintImage, 
  onUpload, 
  onContinue,
  onSelectSample 
}) => {

  const handleSampleSelect = async (sample) => {
    try {
      // 1. Fetch file data
      const response = await fetch(sample.file);
      const blob = await response.blob();
      
      // 2. Create File object
      const file = new File([blob], sample.name + '.png', { type: 'image/png' });
      
      // 3. Directly call the unified handler in App.js
      // We pass the file AND the image URL (sample.file acts as the URL here)
      if (onSelectSample) {
        onSelectSample(file, sample.file);
      }
      
    } catch (error) {
      console.error('Error loading sample blueprint:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* --- SECTION 1: SAMPLES --- */}
      <div className={`${theme.cardBackground} ${theme.cardBorder} border rounded-xl p-6 shadow-md`}>
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className={`w-6 h-6 ${theme.iconPrimary}`} />
          <h3 className={`text-xl font-bold ${theme.textPrimary}`}>
            Open an existing project
          </h3>
        </div>
        <p className={`${theme.textSecondary} mb-4 text-sm`}>
          Select a pre-loaded project to review compliance
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SAMPLE_BLUEPRINTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleSelect(sample)}
              className={`group relative overflow-hidden rounded-lg border-2 ${theme.cardBorder} hover:border-blue-500 transition-all cursor-pointer`}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <img 
                  src={sample.thumbnail} 
                  alt={sample.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-80 transition-all flex items-center justify-center">
                <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-center px-2">
                  Open
                </span>
              </div>
              <div className={`p-2 ${theme.cardBackground} border-t ${theme.cardBorder}`}>
                <p className={`text-xs font-medium ${theme.textPrimary} truncate`}>
                  {sample.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* --- SECTION 2: UPLOAD --- */}
      <div className={`${theme.cardBackground} rounded-xl shadow-lg p-8 border ${theme.cardBorder}`}>
        <div className="text-center mb-6">
           <div className="flex items-center justify-center gap-2 mb-2">
             <Upload className={`w-6 h-6 ${theme.headerIcon}`} />
             <h2 className={`text-xl font-bold ${theme.textPrimary}`}>Start a new project</h2>
           </div>
           <p className={theme.textSecondary}>Upload a blueprint or floor plan</p>
        </div>

        <label className="block">
          <div className={`border-2 border-dashed ${theme.uploadBorder} rounded-lg p-12 text-center transition-colors cursor-pointer hover:bg-gray-50/50`}>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={onUpload}
            />
            
             {uploadedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">{uploadedFile.name}</p>
                      <p className="text-xs text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {blueprintImage && (
                    <img src={blueprintImage} alt="Preview" className="max-h-48 mx-auto rounded border border-slate-200 shadow-sm" />
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

        {/* Continue Button */}
        {uploadedFile && (
          <button 
            onClick={onContinue}
            className={`w-full mt-6 flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 shadow-md`}
          >
            Continue to Attestation
            <ArrowRight size={18} />
          </button>
        )}
      </div>

      {/* --- SECTION 3: INSTRUCTIONS --- */}
      <div className={`${theme.cardBackground} ${theme.cardBorder} border rounded-lg p-6`}>
        <h3 className={`font-semibold mb-3 ${theme.textPrimary}`}>
          Supported File Types
        </h3>
        <ul className={`space-y-2 ${theme.textSecondary} text-sm`}>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>PDF documents (.pdf)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Image files (.jpg, .jpeg, .png)</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UploadView;