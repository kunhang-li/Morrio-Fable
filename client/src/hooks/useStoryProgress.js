import { useState, useCallback } from 'react';

export default function useStoryProgress(total) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState([]);

  const advance = useCallback(() => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      return next <= total ? next : prev;
    });
    setCompleted((prev) => {
      const step = prev.length;
      return prev.includes(step) ? prev : [...prev, step];
    });
  }, [total]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setCompleted([]);
  }, []);

  const progressPercent = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  return { currentStep, completed, advance, reset, progressPercent };
}