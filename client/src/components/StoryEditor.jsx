import React, { useState, useEffect, useRef, useCallback } from 'react';
import MediaTimeline from './MediaTimeline';
export default function StoryEditor({ userId, storyId, onStorySaved }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const contentRef = useRef('');
  const lastSavedRef = useRef('');
  const dirtyRef = useRef(false);
  const readyRef = useRef(false);
  const savingRef = useRef(false);
  const debounceRef = useRef(null);
  const editingRef = useRef(false);
  const activeStoryRef = useRef(storyId);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    let cancelled = false;
    activeStoryRef.current = storyId;

    if (!storyId) return;

    fetch(`/api/stories/${storyId}`, {
      headers: { 'x-user-id': String(userId) }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load story');
        return res.json();
      })
      .then((story) => {
        if (cancelled || editingRef.current) return;

        const restoredContent =
          story.draft_content ?? story.content ?? '';

        setTitle(story.title || '');
        setContent(restoredContent);
        contentRef.current = restoredContent;
        lastSavedRef.current = restoredContent;
        dirtyRef.current = false;
        readyRef.current = false;
      })
      .catch(() => {
        if (!cancelled) setStatus('Failed to load story');
      });

    return () => {cancelled = true;
    };
  }, [storyId, userId]);

  const saveDraft = useCallback(async (force = false) => {
    if (!storyId || savingRef.current) return;
    if (!dirtyRef.current) return;
    if (!force && !readyRef.current) return;

    const snapshot = contentRef.current;

    if (snapshot === lastSavedRef.current) {
      dirtyRef.current = false;
      return;
    }

    savingRef.current = true;
    setSaveStatus('Saving...');

    try {
      const res = await fetch(`/api/stories/${storyId}/draft`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId)
        },
        body: JSON.stringify({
          draft_content: snapshot
        })
      });

      if (!res.ok) {
        throw new Error('Draft save failed');
      }
      if (activeStoryRef.current === storyId) {
        lastSavedRef.current = snapshot;
        dirtyRef.current = contentRef.current !== snapshot;

        setSaveStatus(
          dirtyRef.current ? 'Unsaved changes' : 'Saved just now'
        );
      }
    } catch (_) {
      if (activeStoryRef.current === storyId) {
        setSaveStatus('Save failed — click to retry');
      }
    } finally {
      savingRef.current = false;
    }
  }, [storyId, userId]);

  useEffect(() => {
    if (!storyId) return;

    const interval = setInterval(() => {saveDraft();}, 30000);

    return () => clearInterval(interval);
  }, [storyId, saveDraft]);
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  function handleContentChange(e) {
    const nextContent = e.target.value;

    editingRef.current = true;
    setContent(nextContent);
    contentRef.current = nextContent;

    dirtyRef.current = nextContent !== lastSavedRef.current;
    readyRef.current = false;
    setSaveStatus(dirtyRef.current ? 'Unsaved changes' : 'Saved just now');

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      readyRef.current = true;
    }, 500);
  }

  async function handleSave(e) {
    if (e) e.preventDefault();

    if (!title.trim()) {
      setStatus('Title is required.');
      return;
    }

    const savedContent = contentRef.current;
    const targetStoryId = storyId;

    setStatus('Saving…');

    try {
      const method = storyId ? 'PUT' : 'POST';
      const url = storyId
        ? `/api/stories/${storyId}`
        : '/api/stories';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId)
        },
        body: JSON.stringify({
          title,
          content: savedContent
        })
      });

      const data = await res.json();

      if (!res.ok || !data.id) {
        throw new Error(data.error || 'Error saving story');
      }
      lastSavedRef.current = savedContent;
      dirtyRef.current = contentRef.current !== savedContent;

      setStatus('Saved');
      setSaveStatus(
        dirtyRef.current ? 'Unsaved changes' : 'Saved just now'
      );

      if (onStorySaved) onStorySaved(data.id);
    } catch (err) {
      setStatus(err.message || 'Error saving story');
    }
  }

  return (
    <div>
      <h2>Story Editor</h2>

      <form onSubmit={handleSave}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Story title"
          style={{
            display: 'block',
            width: '100%',
            marginBottom: 8,
            padding: 8,
            boxSizing: 'border-box'
          }}
        />

        <textarea
          value={content}
          onChange={handleContentChange}
          rows={8}
          placeholder="Write your story…"
          style={{
            display: 'block',
            width: '100%',
            padding: 8,
            boxSizing: 'border-box'
          }}
        />

        <button type="submit" style={{ marginTop: 8 }}>
          Save
        </button>

        {status && (
          <span style={{ marginLeft: 12, color: '#555', fontSize: 13 }}>
            {status}
          </span>
        )}
      </form>

      {storyId && saveStatus && (
        <div style={{ marginTop: 12, fontSize: 13 }}>
          {saveStatus === 'Save failed — click to retry' ? (
            <button
              type="button"
              onClick={() => saveDraft(true)}
              style={{
                color: '#b91c1c',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {saveStatus}
            </button>
          ) : (
            <span
              role="status"
              style={{
                color: saveStatus === 'Saved just now'
                  ? '#15803d'
                  : '#555'
              }}
            >
              {saveStatus}
            </span>
          )}
        </div>
      )}

      {storyId && (
        <MediaTimeline storyId={storyId} userId={userId} />
      )}
    </div>
  );
}
