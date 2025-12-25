import { useState, useCallback } from 'react';
import { complianceApi } from '../services/complianceApi'; 

export const useReportGeneration = () => {
  const [generationStatus, setGenerationStatus] = useState('idle'); // idle, generating, complete, error
  const [generationError, setGenerationError] = useState(null);
  const [report, setReport] = useState(null);

  const generateReport = useCallback(async (file, rooms) => {
    // 1. Reset State
    setGenerationStatus('generating');
    setGenerationError(null);
    setReport(null);

    try {
      // 2. Make the API Call 
      const report = await complianceApi.generateReport(file, rooms);

      console.log("Report " + report)
      
      if (report) {
        setGenerationStatus('complete');
        setReport(report);
      } else { 
        console.log("report was empty")
        setGenerationStatus('error');
        setGenerationError("The report could not be generated.");
      }
    } catch (err) {
      console.error("Generation Failed:", err);
      setGenerationStatus('error');
      setGenerationError(err.message || "An error occurred during report generation");
    }
  }, []);

  return {
    generationStatus,
    generationError,
    generateReport,
    report
  };
};