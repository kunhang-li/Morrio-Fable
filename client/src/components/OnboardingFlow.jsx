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

  if (currentStep >= prompts.length - 1) {
    onComplete && onComplete();
    return null;
  }

  const prompt = prompts[currentStep];

  return (
    <div>
      <p style={{ color: '#888', fontSize: 14 }}>
        Step {currentStep + 1} of {prompts.length}
      </p>
      {/* TODO: Prompt completion progress bar — render progress bar here using progressPercent */}
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