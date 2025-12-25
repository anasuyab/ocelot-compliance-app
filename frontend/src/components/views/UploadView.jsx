import React from 'react';
import { Upload, FileText, Loader2, Image } from 'lucide-react'; // Added Loader2

const SAMPLE_BLUEPRINTS = [
  {
    id: 1,
    name: "Community Center",
    thumbnail: "/community-center-thumbnail.png", 
    file: "/community-center.png"
  }
];

const UploadView = ({ 
  theme, 
  uploadedFile, 
  blueprintImage, 
  onUpload, 
  onStartAnalysis, 
  isValidating // <--- Recieve this prop
}) => {

  // Handle sample blueprint selection
  const handleSampleSelect = async (sample) => {
    try {
      // Fetch the file from the server
      const response = await fetch(sample.file);
      const blob = await response.blob();
      console.log(response)
      
      // Create a File object from the blob
      const file = new File([blob], sample.name + '.png', { type: 'image/png' });
      
      // Create a synthetic event object to pass to onUpload
      const syntheticEvent = {
        target: {
          files: [file]
        }
      };
      
      // Trigger the upload handler
      onUpload(syntheticEvent);
      
      // Auto-start analysis after a brief delay to let state update
      setTimeout(() => {
        onStartAnalysis();
      }, 100);
      
    } catch (error) {
      console.error('Error loading sample blueprint:', error);
    }
  };

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

      {/* Sample Blueprints Gallery */}
      <div className={`${theme.cardBackground} ${theme.cardBorder} border rounded-lg p-6 shadow-md`}>
        <div className="flex items-center gap-2 mb-4">
          <Image className={`w-5 h-5 ${theme.iconPrimary}`} />
          <h3 className={`text-lg font-bold ${theme.textPrimary}`}>
            Try a Sample Blueprint
          </h3>
        </div>
        <p className={`${theme.textSecondary} mb-4 text-sm`}>
          Click any sample below to automatically analyze it
        </p>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SAMPLE_BLUEPRINTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleSelect(sample)}
              disabled={isValidating}
              className={`group relative overflow-hidden rounded-lg border-2 ${theme.cardBorder} hover:border-blue-500 transition-all ${
                isValidating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <img 
                  src={sample.thumbnail} 
                  alt={sample.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-80 transition-all flex items-center justify-center">
                <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-center px-2">
                  Analyze
                </span>
              </div>

              {/* Label */}
              <div className={`p-2 ${theme.cardBackground} border-t ${theme.cardBorder}`}>
                <p className={`text-xs font-medium ${theme.textPrimary} truncate`}>
                  {sample.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
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
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Maximum file size: 10MB</span>
          </li>
        </ul>
      </div>
    </div>
    

  );
};

export default UploadView;