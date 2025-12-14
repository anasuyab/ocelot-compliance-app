import React, { useState } from 'react';
import { Upload, FileText, Image, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight, Download, Search, Loader } from 'lucide-react';
import { getThemeFromURL } from './themes/themes';

const App = () => {
  const [currentStep, setCurrentStep] = useState('upload'); // upload, analyzing, report
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Get theme from URL parameter
  const theme = getThemeFromURL();

  // Mock data for the report
  const mockReport = {
    summary: {
      compliant: 8,
      violations: 3,
      warnings: 2,
      totalChecks: 13
    },
    blueprint: {
      name: 'Tribal Admin Office - Floor Plan.pdf',
      uploadDate: new Date().toLocaleDateString(),
      facilityType: 'Administrative Office',
      totalArea: '2,400 sq ft'
    },
    results: [
      {
        category: 'Space Requirements',
        status: 'compliant',
        items: [
          {
            id: 1,
            check: 'Office Space Square Footage',
            status: 'pass',
            finding: 'Office spaces range from 150-200 sq ft, exceeding minimum requirement of 100 sq ft per occupant',
            blueprint: 'Room 101, 102, 103 measured at 150, 175, 200 sq ft respectively',
            policy: '25 CFR 900.70(a) - Adequate space for program administration',
            citation: 'Indian Affairs Manual Part 80, Chapter 7, Section 1.7.B.2'
          },
          {
            id: 2,
            check: 'Common Area Allocation',
            status: 'pass',
            finding: 'Common areas (break room, conference room) total 400 sq ft, meeting guideline of 15-20% of total space',
            blueprint: 'Break room: 200 sq ft, Conference room: 200 sq ft',
            policy: 'General facility standards for administrative offices',
            citation: 'Building Code Section 310.1'
          }
        ]
      },
      {
        category: 'Accessibility & Egress',
        status: 'violation',
        items: [
          {
            id: 3,
            check: 'Exit Door Width',
            status: 'fail',
            finding: 'Exit door in Room 104 measures 30 inches wide, below ADA minimum requirement',
            blueprint: 'Room 104 exit door marked as 30" on blueprint',
            policy: 'ADA Standards require minimum 32 inches clear width for doorways',
            citation: 'ADA Standards Section 404.2.3',
            recommendation: 'Widen door opening to minimum 32 inches or replace with compliant door frame'
          },
          {
            id: 4,
            check: 'Main Corridor Width',
            status: 'pass',
            finding: 'Main corridor width of 48 inches exceeds minimum requirement',
            blueprint: 'Main corridor marked as 48" throughout',
            policy: 'Minimum 44 inches for accessible routes',
            citation: 'ADA Standards Section 403.5.1'
          },
          {
            id: 5,
            check: 'Bathroom Accessibility',
            status: 'fail',
            finding: 'Bathroom door opens inward, blocking required clear floor space for wheelchair maneuvering',
            blueprint: 'Bathroom layout shows door swing conflicts with 60" turning diameter',
            policy: 'Accessible bathrooms must provide 60-inch diameter turning space',
            citation: 'ADA Standards Section 603.2.1',
            recommendation: 'Reverse door swing to open outward or use sliding door'
          }
        ]
      },
      {
        category: 'Fire Safety & Equipment',
        status: 'warning',
        items: [
          {
            id: 6,
            check: 'Fire Extinguisher Placement',
            status: 'pass',
            finding: 'Fire extinguishers placed every 75 feet, meeting maximum travel distance requirement',
            blueprint: '4 fire extinguishers marked on plan at strategic locations',
            policy: 'Maximum 75 feet travel distance to extinguisher',
            citation: 'NFPA 10 Section 6.1'
          },
          {
            id: 7,
            check: 'Emergency Exit Signage',
            status: 'warning',
            finding: 'Exit signs shown on blueprint but specifications not provided',
            blueprint: 'Exit signs indicated but illumination details missing',
            policy: 'Exit signs must be illuminated and meet visibility requirements',
            citation: 'IBC Section 1013',
            recommendation: 'Verify exit signs are illuminated and meet photometric requirements'
          }
        ]
      },
      {
        category: '105(l) Lease Compliance',
        status: 'compliant',
        items: [
          {
            id: 8,
            check: 'Program Space Allocation',
            status: 'pass',
            finding: 'Facility layout supports identified PFSAs with appropriate space allocation',
            blueprint: 'Administrative offices, meeting spaces, and support areas clearly designated',
            policy: 'Facility must support programs, functions, services, or activities (PFSAs) under funding agreement',
            citation: 'Indian Affairs Manual Part 80, Chapter 7, Section 1.6.A'
          },
          {
            id: 9,
            check: 'Facility Use Documentation',
            status: 'pass',
            finding: 'Blueprint clearly identifies administrative program spaces matching funding agreement',
            blueprint: 'Spaces labeled for tribal governance, social services, and administration',
            policy: '105(l) lease must support PFSAs contained in approved funding agreement',
            citation: '25 U.S.C. § 5324(l)'
          }
        ]
      }
    ]
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const startAnalysis = () => {
    setCurrentStep('analyzing');

    // Make the actual API call
    fetch('/api/analyze')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // or response.text() if your backend returns plain text
      })
      .then(data => {
        console.log('Analysis results:', data); 
      })
      .catch(error => {
        console.error('Error during analysis API call:', error);
      });

    // Simulate analysis progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setAnalysisProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setCurrentStep('report'), 500);
      }
    }, 400);
  };

  const resetApp = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setAnalysisProgress(0);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.pageBackground}`}>
      {/* Header */}
      <div className={`${theme.headerBackground} border-b ${theme.headerBorder} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText className={`w-8 h-8 ${theme.headerIcon}`} />
            <div>
              <h1 className={`text-2xl font-bold ${theme.headerTitle}`}>Blueprint Compliance Checker</h1>
              <p className={`text-sm ${theme.headerSubtitle}`}>105(l) Lease Facility Requirements Analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <StepIndicator number={1} label="Upload" active={currentStep === 'upload'} completed={currentStep !== 'upload'} theme={theme} />
          <div className={`w-16 h-0.5 ${theme.stepDivider}`}></div>
          <StepIndicator number={2} label="Analysis" active={currentStep === 'analyzing'} completed={currentStep === 'report'} theme={theme} />
          <div className={`w-16 h-0.5 ${theme.stepDivider}`}></div>
          <StepIndicator number={3} label="Report" active={currentStep === 'report'} theme={theme} />
        </div>

        {/* Upload View */}
        {currentStep === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className={`${theme.cardBackground} rounded-xl shadow-lg p-8 border ${theme.cardBorder}`}>
              <div className="text-center mb-6">
                <Upload className={`w-16 h-16 ${theme.headerIcon} mx-auto mb-4`} />
                <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>Upload Blueprint</h2>
                <p className={theme.textSecondary}>Upload a blueprint or floor plan to check compliance with 105(l) lease facility requirements</p>
              </div>

              <label className="block">
                <div className={`border-2 border-dashed ${theme.uploadBorder} rounded-lg p-12 text-center transition-colors cursor-pointer`}>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                  />
                  {uploadedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <Image className="w-8 h-8 text-green-600" />
                      <div className="text-left">
                        <p className={`font-semibold ${theme.textPrimary}`}>{uploadedFile.name}</p>
                        <p className={`text-sm ${theme.textSecondary}`}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className={`w-12 h-12 ${theme.uploadIcon} mx-auto mb-3`} />
                      <p className={`${theme.textPrimary} font-medium`}>Click to upload or drag and drop</p>
                      <p className={`text-sm ${theme.textTertiary} mt-1`}>PDF, PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </label>

              {uploadedFile && (
                <button 
                  onClick={startAnalysis}
                  className={`w-full mt-6 ${theme.primaryButton} ${theme.primaryButtonText} font-semibold py-3 rounded-lg transition-colors`}
                >
                  Analyze Blueprint
                </button>
              )}
            </div>

            <div className={`mt-6 ${theme.infoBackground} rounded-lg p-4 border`}>
              <h3 className={`font-semibold ${theme.infoTitle} mb-2`}>What We Check:</h3>
              <ul className={`text-sm ${theme.infoText} space-y-1`}>
                <li>• Space requirements and square footage</li>
                <li>• ADA accessibility and door widths</li>
                <li>• Fire safety equipment placement</li>
                <li>• Emergency egress requirements</li>
                <li>• 105(l) lease facility standards</li>
                <li>• PFSA program space allocation</li>
              </ul>
            </div>
          </div>
        )}

        {/* Analyzing View */}
        {currentStep === 'analyzing' && (
          <div className="max-w-2xl mx-auto">
            <div className={`${theme.cardBackground} rounded-xl shadow-lg p-12 border ${theme.cardBorder}`}>
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <Loader className={`w-24 h-24 ${theme.loaderIcon} animate-spin`} />
                </div>
                <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>Analyzing Blueprint</h2>
                <p className={`${theme.textSecondary} mb-6`}>Our AI is examining your blueprint against policy requirements...</p>
                
                <div className={`w-full ${theme.progressBar} rounded-full h-3 mb-4`}>
                  <div 
                    className={`${theme.progressFill} h-3 rounded-full transition-all duration-300`}
                    style={{ width: `${analysisProgress}%` }}
                  ></div>
                </div>
                <p className={`text-sm ${theme.textSecondary}`}>{analysisProgress}% Complete</p>

                <div className="mt-8 space-y-3 text-left">
                  <AnalysisStep label="Extracting blueprint features" completed={analysisProgress > 20} />
                  <AnalysisStep label="Retrieving relevant policies" completed={analysisProgress > 40} />
                  <AnalysisStep label="Checking space requirements" completed={analysisProgress > 60} />
                  <AnalysisStep label="Verifying accessibility standards" completed={analysisProgress > 80} />
                  <AnalysisStep label="Generating compliance report" completed={analysisProgress > 95} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report View */}
        {currentStep === 'report' && (
          <ComplianceReport report={mockReport} onReset={resetApp} theme={theme} />
        )}
      </div>
    </div>
  );
};

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

const ComplianceReport = ({ report, onReset, theme }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default: return null;
    }
  };

  const getCategoryStatus = (status) => {
    switch(status) {
      case 'compliant': return { bg: theme.categoryCompliant, icon: <CheckCircle className="w-5 h-5" /> };
      case 'violation': return { bg: theme.categoryViolation, icon: <XCircle className="w-5 h-5" /> };
      case 'warning': return { bg: theme.categoryWarning, icon: <AlertTriangle className="w-5 h-5" /> };
      default: return { bg: 'bg-slate-100 text-slate-800' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className={`${theme.cardBackground} rounded-xl shadow-lg border ${theme.cardBorder} overflow-hidden`}>
        <div className={`bg-gradient-to-r ${theme.reportHeaderGradient} text-white px-6 py-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Compliance Report</h2>
              <p className="text-blue-100">{report.blueprint.name}</p>
            </div>
            <button 
              onClick={onReset}
              className={`${theme.reportHeaderButton} px-4 py-2 rounded-lg font-medium transition-colors`}
            >
              New Analysis
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <SummaryCard 
              label="Compliant" 
              value={report.summary.compliant} 
              total={report.summary.totalChecks}
              color={theme.summaryGreen}
              icon={<CheckCircle className="w-6 h-6" />}
            />
            <SummaryCard 
              label="Violations" 
              value={report.summary.violations} 
              total={report.summary.totalChecks}
              color={theme.summaryRed}
              icon={<XCircle className="w-6 h-6" />}
            />
            <SummaryCard 
              label="Warnings" 
              value={report.summary.warnings} 
              total={report.summary.totalChecks}
              color={theme.summaryAmber}
              icon={<AlertTriangle className="w-6 h-6" />}
            />
            <SummaryCard 
              label="Total Checks" 
              value={report.summary.totalChecks} 
              color={theme.summaryBlue}
              icon={<Search className="w-6 h-6" />}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className={`text-sm ${theme.textSecondary}`}>
              <span className="font-medium">Facility Type:</span> {report.blueprint.facilityType} • 
              <span className="font-medium"> Area:</span> {report.blueprint.totalArea}
            </div>
            <button className={`flex items-center gap-2 ${theme.exportButton} font-medium text-sm`}>
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="space-y-4">
        {report.results.map((category, idx) => {
          const statusStyle = getCategoryStatus(category.status);
          const isExpanded = expandedCategories[category.category];

          return (
            <div key={idx} className={`${theme.cardBackground} rounded-xl shadow-lg border ${theme.cardBorder} overflow-hidden`}>
              <button
                onClick={() => toggleCategory(category.category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`${statusStyle.bg} p-2 rounded-lg`}>
                    {statusStyle.icon}
                  </div>
                  <div className="text-left">
                    <h3 className={`font-bold ${theme.textPrimary}`}>{category.category}</h3>
                    <p className={`text-sm ${theme.textSecondary}`}>{category.items.length} checks performed</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50">
                  {category.items.map((item, itemIdx) => (
                    <div key={item.id} className={`p-6 ${itemIdx !== 0 ? 'border-t border-slate-200' : ''}`}>
                      <div className="flex items-start gap-3 mb-3">
                        {getStatusIcon(item.status)}
                        <div className="flex-1">
                          <h4 className={`font-semibold ${theme.textPrimary} mb-1`}>{item.check}</h4>
                          <p className={`text-slate-700 text-sm mb-3`}>{item.finding}</p>
                          
                          <div className="space-y-2">
                            <DetailRow label="Blueprint" text={item.blueprint} />
                            <DetailRow label="Policy" text={item.policy} />
                            <DetailRow label="Citation" text={item.citation} />
                            {item.recommendation && (
                              <div className={`mt-3 ${theme.recommendationBackground} border rounded-lg p-3`}>
                                <p className={`text-sm font-medium ${theme.recommendationTitle} mb-1`}>Recommendation:</p>
                                <p className={`text-sm ${theme.recommendationText}`}>{item.recommendation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, total, color, icon }) => {
  return (
    <div className={`${color} border rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {total && <div className="text-sm opacity-75 mt-1">of {total}</div>}
    </div>
  );
};

const DetailRow = ({ label, text }) => (
  <div className="text-sm">
    <span className="font-medium text-slate-700">{label}:</span>{' '}
    <span className="text-slate-600">{text}</span>
  </div>
);

export default App;