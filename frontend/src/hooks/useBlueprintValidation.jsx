import { useState, useCallback } from 'react';
import { complianceApi } from '../services/complianceApi'; 

export const useBlueprintValidation = () => {
  const [validationStatus, setValidationStatus] = useState('idle'); // idle, validating, valid, invalid, error
  const [validationError, setValidationError] = useState(null);

  const validateBlueprint = useCallback(async (file) => {
    // 1. Reset State
    setValidationStatus('validating');
    setValidationError(null);

    try {
      // 2. Make the API Call (Mocked here for demonstration)
      const { result } = await complianceApi.validateBlueprint(file);

      if (result) {
        setValidationStatus('valid');
        return true;
      } else {
        setValidationStatus('invalid');
        setValidationError("The uploaded file is not a valid blueprint. Please upload a different file.");
        return false;
      }

    } catch (err) {
      console.error("Validation Failed:", err);
      setValidationStatus('error');
      setValidationError(err.message || "An error occurred during validation");
      return false;
    }
  }, []);

  const resetValidation = useCallback(() => {
    setValidationStatus('idle');
    setValidationError(null);
  }, []);

  return {
    validationStatus,
    validationError,
    validateBlueprint,
    resetValidation
  };
};