import React, { useState, useEffect, useRef } from 'react';
import MediaTimeline from './MediaTimeline';

// TODO: Auto-save draft indicator
// Implement auto-save that persists draft content to the server every 30 seconds
// while the user is actively editing. Display a status indicator showing
// 'Saving...', 'Saved', or 'Save failed'. Debounce input changes and batch
// them into the periodic save rather than firing on every keystroke.

export default function StoryEditor({ userId, storyId, onStorySaved }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  // TODO: Auto-save draft indicator — add saveStatus state ('Saving...', 'Saved', 'Save failed')
  // TODO: Auto-save draft indicator — set up 30-second interval and debounce ref here

  async function handleSave(e) {
    if (e) e.preventDefault();
    if (!title.trim()) { setStatus('Title is required.'); return; }
    setStatus('Saving…');
    try {
      const method = storyId ? 'PUT' : 'POST';
      const url = storyId ? `/api/stories/${storyId}` : '/api/stories';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(userId) },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (data.id) { onStorySaved && onStorySaved(data.id); setStatus('Saved'); }
      else setStatus(data.error || 'Error saving story');
    } catch (_) { setStatus('Error saving story'); }
  }

  return (
    <div>
      <h2>Story Editor</h2>
      {/* TODO: Auto-save draft indicator — render saveStatus indicator ('Saving...', 'Saved', 'Save failed') */}
      <form onSubmit={handleSave}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Story title"
          style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8, boxSizing: 'border-box' }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="Write your story…"
          style={{ display: 'block', width: '100%', padding: 8, boxSizing: 'border-box' }}
        />
        <button type="submit" style={{ marginTop: 8 }}>Save</button>
        {status && <span style={{ marginLeft: 12, color: '#555', fontSize: 13 }}>{status}</span>}
      </form>
      {storyId && <MediaTimeline storyId={storyId} userId={userId} />}
    </div>
  );
}