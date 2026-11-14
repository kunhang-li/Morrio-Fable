import React, { useState } from 'react';
import OnboardingFlow from './components/OnboardingFlow';
import StoryEditor from './components/StoryEditor';

const USER_ID = 1;

export default function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState(null);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Fable</h1>
      {!onboardingComplete ? (
        <OnboardingFlow
          userId={USER_ID}
          onComplete={() => setOnboardingComplete(true)}
        />
      ) : (
        <StoryEditor
          userId={USER_ID}
          storyId={activeStoryId}
          onStorySaved={(id) => setActiveStoryId(id)}
        />
      )}
    </div>
  );
}