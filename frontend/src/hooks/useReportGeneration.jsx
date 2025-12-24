import { useState, useCallback } from 'react';
import { complianceApi } from '../services/complianceApi'; 

export const useReportGeneration = () => {
  const [generationStatus, setGenerationStatus] = useState('idle'); // idle, generating, valid, invalid, error
  const [generationError, setGenerationError] = useState(null);
  const [report, setReport] = useState(null)

  const generateReport = useCallback(async (file, rooms) => {
    // 1. Reset State
    setGenerationStatus('generating');
    setGenerationError(null);
    setReport(null);

    try {
      // 2. Make the API Call 
      const { report } = await complianceApi.generateReport(file);

      if (report) {
        setGenerationStatus('complete');
        setReport(report);
      } else {
        setGenerationStatus('incomplete');
        setGenerationStatus("The report could not be generated.");
      }

    } catch (err) {
      console.error("Generation Failed:", err);
      setGenerationStatus('error');
      setGenerationStatus(err.message || "An error occurred during generating report");
    }
  }, []);

  return {
    generationStatus,
    generationError,
    generateReport,
    report
  };
};