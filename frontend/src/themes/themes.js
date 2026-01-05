// src/themes.js
export const themes = {
    default: {
      // Background gradients
      pageBackground: 'from-slate-50 to-slate-100',
      
      // Header
      headerBackground: 'bg-white',
      headerBorder: 'border-slate-200',
      headerIcon: 'text-blue-600',
      headerTitle: 'text-slate-900',
      headerSubtitle: 'text-slate-600',
      
      // Primary buttons
      primaryButton: 'bg-blue-600 hover:bg-blue-700',
      primaryButtonText: 'text-white',
      
      // Cards
      cardBackground: 'bg-white',
      cardBorder: 'border-slate-200',
      
      // Steps
      stepActive: 'bg-blue-600',
      stepCompleted: 'bg-green-600',
      stepInactive: 'bg-slate-300',
      stepDivider: 'bg-slate-300',
      
      // Upload area
      uploadBorder: 'border-slate-300 hover:border-blue-400 hover:bg-blue-50',
      uploadIcon: 'text-slate-400',
      
      // Info box
      infoBackground: 'bg-blue-50 border-blue-200',
      infoTitle: 'text-blue-900',
      infoText: 'text-blue-800',
      
      // Analyzing
      loaderIcon: 'text-blue-600',
      progressBar: 'bg-slate-200',
      progressFill: 'bg-blue-600',
      
      // Report header
      reportHeaderGradient: 'from-blue-600 to-blue-700',
      reportHeaderButton: 'bg-white text-blue-600 hover:bg-blue-50',
      
      // Summary cards
      summaryGreen: 'bg-green-50 text-green-700 border-green-200',
      summaryRed: 'bg-red-50 text-red-700 border-red-200',
      summaryAmber: 'bg-amber-50 text-amber-700 border-amber-200',
      summaryBlue: 'bg-blue-50 text-blue-700 border-blue-200',
      
      // Category status
      categoryCompliant: 'bg-green-100 text-green-800',
      categoryViolation: 'bg-red-100 text-red-800',
      categoryWarning: 'bg-amber-100 text-amber-800',
      
      // Recommendation box
      recommendationBackground: 'bg-blue-50 border-blue-200',
      recommendationTitle: 'text-blue-900',
      recommendationText: 'text-blue-800',
      
      // Text colors
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textTertiary: 'text-slate-500',
      
      // Export button
      exportButton: 'text-blue-600 hover:text-blue-700'
    },
    
    pequot: {
      // Backgrounds - Using the Off-White from the palette
      pageBackground: 'bg-[#F2F2F2]',
      
      // Header - Deep Teal background with Cyan accents
      headerBackground: 'bg-[#025159]',
      headerBorder: 'border-[#025159]',
      headerIcon: 'text-[#5CD7F2]', 
      headerTitle: 'text-white',
      headerSubtitle: 'text-[#5CD7F2]',
      
      // Primary buttons - Deep Teal
      primaryButton: 'bg-[#025159] hover:bg-[#013b42]',
      primaryButtonText: 'text-white',
      
      // Cards
      cardBackground: 'bg-white',
      cardBorder: 'border-slate-200',
      
      // Steps
      stepActive: 'bg-[#025159]',
      stepCompleted: 'bg-green-600', // Kept green for semantic success state
      stepInactive: 'bg-slate-300',
      stepDivider: 'bg-slate-300',
      
      // Upload area - Cyan hover effects
      uploadBorder: 'border-slate-300 hover:border-[#5CD7F2] hover:bg-[#5CD7F2]/10',
      uploadIcon: 'text-[#025159]',
      
      // Info box - Light Cyan tint
      infoBackground: 'bg-[#5CD7F2]/10 border-[#5CD7F2]/30',
      infoTitle: 'text-[#025159]',
      infoText: 'text-[#025159]',
      
      // Analyzing
      loaderIcon: 'text-[#5CD7F2]',
      progressBar: 'bg-slate-200',
      progressFill: 'bg-[#025159]',
      
      // Report header
      reportHeaderGradient: 'from-[#025159] to-[#013b42]',
      reportHeaderButton: 'bg-white text-[#025159] hover:bg-[#F2F2F2]',
      
      // Summary cards
      summaryGreen: 'bg-green-50 text-green-700 border-green-200',
      summaryRed: 'bg-red-50 text-red-700 border-red-200',
      summaryAmber: 'bg-amber-50 text-amber-700 border-amber-200',
      summaryBlue: 'bg-[#5CD7F2]/10 text-[#025159] border-[#5CD7F2]/20',
      
      // Category status
      categoryCompliant: 'bg-green-100 text-green-800',
      categoryViolation: 'bg-red-100 text-red-800',
      categoryWarning: 'bg-amber-100 text-amber-800',
      
      // Recommendation box
      recommendationBackground: 'bg-[#F2F2F2] border-[#025159]/20',
      recommendationTitle: 'text-[#025159]',
      recommendationText: 'text-[#0D0D0D]',
      
      // Text colors
      textPrimary: 'text-[#0D0D0D]',
      textSecondary: 'text-slate-600',
      textTertiary: 'text-slate-500',
      
      // Export button
      exportButton: 'text-[#025159] hover:text-[#013b42]'
    }
  };
  
  // Helper function to get theme from URL parameter
  export const getThemeFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme');
    return themes[themeParam] || themes.default;
  };