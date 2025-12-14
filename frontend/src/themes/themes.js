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
    
    custom: {
      // Background gradients - Purple theme
      pageBackground: 'from-purple-50 to-pink-50',
      
      // Header
      headerBackground: 'bg-gradient-to-r from-purple-600 to-pink-600',
      headerBorder: 'border-purple-300',
      headerIcon: 'text-white',
      headerTitle: 'text-white',
      headerSubtitle: 'text-purple-100',
      
      // Primary buttons
      primaryButton: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
      primaryButtonText: 'text-white',
      
      // Cards
      cardBackground: 'bg-white',
      cardBorder: 'border-purple-200',
      
      // Steps
      stepActive: 'bg-purple-600',
      stepCompleted: 'bg-green-600',
      stepInactive: 'bg-purple-200',
      stepDivider: 'bg-purple-200',
      
      // Upload area
      uploadBorder: 'border-purple-300 hover:border-purple-500 hover:bg-purple-50',
      uploadIcon: 'text-purple-400',
      
      // Info box
      infoBackground: 'bg-purple-50 border-purple-200',
      infoTitle: 'text-purple-900',
      infoText: 'text-purple-800',
      
      // Analyzing
      loaderIcon: 'text-purple-600',
      progressBar: 'bg-purple-200',
      progressFill: 'bg-gradient-to-r from-purple-600 to-pink-600',
      
      // Report header
      reportHeaderGradient: 'from-purple-600 to-pink-600',
      reportHeaderButton: 'bg-white text-purple-600 hover:bg-purple-50',
      
      // Summary cards
      summaryGreen: 'bg-green-50 text-green-700 border-green-200',
      summaryRed: 'bg-red-50 text-red-700 border-red-200',
      summaryAmber: 'bg-amber-50 text-amber-700 border-amber-200',
      summaryBlue: 'bg-purple-50 text-purple-700 border-purple-200',
      
      // Category status
      categoryCompliant: 'bg-green-100 text-green-800',
      categoryViolation: 'bg-red-100 text-red-800',
      categoryWarning: 'bg-amber-100 text-amber-800',
      
      // Recommendation box
      recommendationBackground: 'bg-purple-50 border-purple-200',
      recommendationTitle: 'text-purple-900',
      recommendationText: 'text-purple-800',
      
      // Text colors
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textTertiary: 'text-slate-500',
      
      // Export button
      exportButton: 'text-purple-600 hover:text-purple-700'
    }
  };
  
  // Helper function to get theme from URL parameter
  export const getThemeFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme');
    return themes[themeParam] || themes.default;
  };