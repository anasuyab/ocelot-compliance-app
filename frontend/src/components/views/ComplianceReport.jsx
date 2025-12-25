import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight, Search, Download } from 'lucide-react';
import SummaryCard from '../common/SummaryCard';
import DetailRow from '../common/DetailRow';

const ComplianceReport = ({ report, blueprintImage,  onReset, theme }) => {
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
      {/* Summary Cards Section */}
      <div className={`${theme.cardBackground} rounded-xl shadow-lg border ${theme.cardBorder} overflow-hidden`}>
        <div className={`bg-gradient-to-r ${theme.reportHeaderGradient} text-white px-6 py-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Compliance Report</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-2 py-1 bg-white/20 rounded text-sm text-white backdrop-blur-sm">
                    Blueprint Analysis
                </div>
                {/* Optional: Show a tiny thumbnail instead */}
                {blueprintImage && (
                    <img src={blueprintImage} alt="Thumbnail" className="w-8 h-8 rounded object-cover border border-white/50" />
                )}
                </div>
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

      {/* Detailed Results Section */}
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

export default ComplianceReport;