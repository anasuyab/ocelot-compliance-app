import React, { useState } from 'react';
import { 
  Download, CheckCircle, XCircle, AlertTriangle, 
  FileText, ArrowLeft, Building, Ruler, Scale, 
  BookOpen, Search, Info, ShieldCheck, ChevronDown, ChevronUp 
} from 'lucide-react';

const ComplianceReport = ({ 
  report, 
  fileName, 
  onReset 
}) => {
  if (!report) return null;

  const { summary, blueprint, results } = report;

  // 1. Calculate Score
  const score = Math.round((summary.compliant / summary.totalChecks) * 100);
  const isOverallCompliant = score >= 80; 

  // 2. Separate Categories
  const leaseComplianceCategory = results.find(r => r.category.includes("105(l)"));
  const otherCategories = results.filter(r => !r.category.includes("105(l)"));

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pass': return 'bg-green-100 text-green-800 border-green-200';
      case 'compliant': return 'bg-green-100 text-green-800 border-green-200';
      case 'fail': return 'bg-red-50 text-red-800 border-red-200'; 
      case 'violation': return 'bg-red-50 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pass': return <CheckCircle size={16} className="text-green-600" />;
      case 'compliant': return <CheckCircle size={16} className="text-green-600" />;
      case 'fail': return <XCircle size={16} className="text-red-600" />;
      case 'violation': return <XCircle size={16} className="text-red-600" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-600" />;
      default: return <Info size={16} className="text-gray-500" />;
    }
  };

  // --- SUB-COMPONENTS ---

  // 1. Collapsible Section Container
  const ReportSection = ({ title, icon, status, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden break-inside-avoid transition-all duration-200">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors select-none"
        >
          <div className="flex items-center gap-3">
             {icon}
             <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          
          <div className="flex items-center gap-4">
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(status)}`}>
               {status}
             </span>
             {isOpen ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
          </div>
        </div>
        
        {isOpen && (
          <div className="p-0 animate-in slide-in-from-top-2 duration-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  // 2. Individual Check Card
  const ComplianceItemCard = ({ item }) => (
    <div className="p-8 hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-1">{item.check}</h4>
        </div>

        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 border ${getStatusColor(item.status)}`}>
          {getStatusIcon(item.status)}
          {item.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Col: Findings */}
        <div className="space-y-4">
           <div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Observation & Finding</p>
             <p className="text-gray-900 font-medium leading-relaxed">{item.finding}</p>
           </div>
           
           {item.recommendation && (
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
               <span className="font-bold text-blue-700 block mb-1">Recommendation:</span>
               <span className="text-blue-900">{item.recommendation}</span>
             </div>
           )}
        </div>

        {/* Right Col: Evidence & Policy */}
        <div className="space-y-4 md:border-l md:border-gray-100 md:pl-8">
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Search size={12}/> Blueprint Evidence
              </p>
              <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded border border-gray-200">
                "{item.blueprint}"
              </p>
           </div>

           <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <BookOpen size={12}/> Policy Reference
              </p>
              <p className="text-sm text-gray-700 mb-1">{item.policy}</p>
              <div className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-gray-600 border border-gray-200">
                 {item.citation}
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* --- SIDEBAR --- */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm print:hidden">
        
        {/* Project Header */}
        <div className="p-6 border-b border-gray-100">
           <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
               <FileText size={24} />
             </div>
             <div>
               <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Project File</p>
               {/* 1. UPDATED: Uses fileName prop directly */}
               <h2 className="text-sm font-bold text-gray-900 leading-tight truncate w-56" title={fileName}>
                 {fileName}
               </h2>
             </div>
           </div>
           <p className="text-xs text-gray-400 mt-2">
             Uploaded: {blueprint.uploadDate}
           </p>
        </div>

        {/* Summary Stats */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
           {/* Score Card */}
           <div className={`p-5 rounded-2xl border-2 ${isOverallCompliant ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`font-bold ${isOverallCompliant ? 'text-green-700' : 'text-red-700'}`}>Compliance Score</span>
                {isOverallCompliant ? <CheckCircle className="text-green-600" /> : <AlertTriangle className="text-red-600" />}
              </div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{score}%</div>
              <p className="text-xs text-gray-600">
                {summary.compliant} pass / {summary.totalChecks} checks
              </p>
           </div>

           {/* Breakdown */}
           <div className="space-y-3">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Audit Breakdown</h4>
             <div className="flex justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
               <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/><span className="text-sm">Compliant</span></div>
               <span className="font-bold">{summary.compliant}</span>
             </div>
             <div className="flex justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
               <div className="flex items-center gap-2"><XCircle size={16} className="text-red-500"/><span className="text-sm">Violations</span></div>
               <span className="font-bold">{summary.violations}</span>
             </div>
             <div className="flex justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
               <div className="flex items-center gap-2"><AlertTriangle size={16} className="text-yellow-500"/><span className="text-sm">Warnings</span></div>
               <span className="font-bold">{summary.warnings}</span>
             </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={handlePrint}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-lg flex items-center justify-center gap-3 mb-3"
          >
            <Download size={24} />
            Export Report
          </button>
          <button onClick={onReset} className="w-full py-3 text-gray-500 font-semibold hover:text-gray-800 flex items-center justify-center gap-2">
            <ArrowLeft size={18} />
            Start New Project
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 overflow-y-auto p-10 print:p-0">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Print Header */}
          <div className="hidden print:block mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Compliance Audit Report</h1>
            <p className="text-gray-600">Project: {fileName} | Date: {blueprint.uploadDate}</p>
          </div>

          {/* 1. PRIMARY SECTION: 105(l) Lease Compliance (Collapsible) */}
          {leaseComplianceCategory && (
            <ReportSection 
              title="105(l) Lease Compliance" 
              icon={<ShieldCheck className="text-blue-600" />}
              status={leaseComplianceCategory.status}
              defaultOpen={true}
            >
               <div>
                {leaseComplianceCategory.items.map(item => (
                  <ComplianceItemCard key={item.id} item={item} />
                ))}
              </div>
            </ReportSection>
          )}

          {/* 2. OTHER CATEGORIES (Collapsible) */}
          <div className="space-y-8">
             {otherCategories.map((cat, idx) => (
               <ReportSection 
                  key={idx}
                  title={cat.category}
                  icon={<ShieldCheck className="text-blue-600" />} // Generic icon for others
                  status={cat.status}
                  defaultOpen={false} // Others closed by default to save space? Or true if you prefer.
               >
                 <div>
                   {cat.items.map(item => (
                     <ComplianceItemCard key={item.id} item={item} />
                   ))}
                 </div>
               </ReportSection>
             ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ComplianceReport;