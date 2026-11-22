import React, { useEffect, useState } from 'react';
import useStoryProgress from '../hooks/useStoryProgress';
import PromptCard from './PromptCard';

// TODO: Prompt completion progress bar
// Add a visual progress bar driven by progressPercent from useStoryProgress.
// It should display a percentage label and animate smoothly between steps.

export default function OnboardingFlow({ userId, onComplete }) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentStep, advance, reset, progressPercent } = useStoryProgress(prompts.length);


  useEffect(() => {
    fetch('/api/prompts')
      .then((r) => r.json())
      .then((data) => { setPrompts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    reset();
  }, [prompts.length, reset]);

  if (loading) return <p>Loading prompts…</p>;
  if (!prompts.length) return <p>No prompts available.</p>;

  // Prevent premature completion caused by zero-based indexing.
  if (currentStep >= prompts.length) {
    return null;
  }

  const prompt = prompts[currentStep];
  const completed = Math.min(currentStep, prompts.length);
  const progress = prompts.length > 0 ? Math.round((completed / prompts.length) * 100): 0;
  return (
    <div>
      <p style={{ color: '#888', fontSize: 14 }}>
        Step {currentStep + 1} of {prompts.length}
      </p>
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}
        >
          <span>Onboarding Progress</span>
          <span>{progress}%</span>
        </div>

        <div
          role="progressbar"
          aria-label="Onboarding progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          style={{
            width: '100%',
            height: '10px',
            backgroundColor: '#e5e7eb',
            borderRadius: '5px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#2563eb',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
      <PromptCard
        prompt={prompt}
        userId={userId}
        onNext={() => {
          advance();
        }}
        isLast={currentStep === prompts.length - 1}
        onComplete={onComplete}
      />
    </div>
  );
}