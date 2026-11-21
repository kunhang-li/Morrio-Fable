import React, { useState } from 'react';
export default function PromptCard({ prompt, userId, onNext, isLast, onComplete }) {
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!response.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(userId) },
        body: JSON.stringify({ title: response.slice(0, 60), content: response, prompt_id: prompt.id }),
      });
    } catch (_) {}
    setSaving(false);
    setResponse('');
    isLast ? onComplete && onComplete() : onNext && onNext();
  }

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 16 }}>
      <p style={{ fontWeight: 600, marginBottom: 12 }}>{prompt.text}</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={4}
          style={{ width: '100%', boxSizing: 'border-box', padding: 8, fontSize: 14 }}
          placeholder="Write your response…"
        />
        <button type="submit" disabled={saving} style={{ marginTop: 8 }}>
          {saving ? 'Saving…' : isLast ? 'Finish' : 'Next'}
        </button>
      </form>
    </div>
  );
}