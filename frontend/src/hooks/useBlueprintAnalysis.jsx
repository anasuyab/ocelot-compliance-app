import { useState, useCallback, useRef } from 'react';
import { complianceApi } from '../services/complianceApi';

export const useBlueprintAnalysis = () => {
  const [status, setStatus] = useState('idle'); // idle, analyzing, complete, error
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // USE REF: This persists across re-renders and ensures we can kill the timer accurately
  const intervalRef = useRef(null);

  const startAnalysis = useCallback(async (file) => {
    // 1. Reset State
    setStatus('analyzing');
    setProgress(0);
    setError(null);
    setResult(null);

    // 2. Start Simulation (Stalls at 90%)
    // Clear any existing intervals first just to be safe
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        // If we are already at 90% or more, stop incrementing (wait for API)
        if (prev >= 90) return 90;
        return prev + 10;
      });
    }, 400);

    try {
      // 3. Make the API Call
      const data = await complianceApi.analyzeBlueprint(file);
      
      // 4. API SUCCESS!
      // Kill the simulation timer immediately
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Force 100% and Complete
      setProgress(100);
      setResult(data);
      
      // Slight delay to ensure the UI sees the 100% bar before switching
      setTimeout(() => {
        setStatus('complete');
      }, 500);

    } catch (err) {
      // 5. API ERROR
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      console.error("Analysis Failed:", err);
      setError(err.message || "An unexpected error occurred");
      setStatus('error');
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
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