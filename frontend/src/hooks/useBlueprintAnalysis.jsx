import { useState, useCallback } from 'react';
import { complianceApi } from '../services/complianceApi';

export const useBlueprintAnalysis = () => {
  const [status, setStatus] = useState('idle'); // idle, analyzing, complete, error
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const startAnalysis = useCallback(async (file) => {
    setStatus('analyzing');
    setProgress(0);
    setError(null);

    // 1. Start the UI Simulation (The visual candy)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90; // Stall at 90% until API finishes
        return prev + 10;
      });
    }, 400);

    try {
      // 2. Make the actual API Call
      const data = await complianceApi.analyzeBlueprint(file);
      
      // 3. When API finishes successfully:
      clearInterval(progressInterval);
      setProgress(100);
      setResult(data);
      
      // Small delay to let the user see "100%" before switching screens
      setTimeout(() => {
        setStatus('complete');
      }, 500);

    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message);
      setStatus('error');
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    progress,
    result,
    error,
    startAnalysis,
    resetAnalysis
  };
};