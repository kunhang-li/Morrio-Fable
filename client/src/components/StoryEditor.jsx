
import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import MediaTimeline from './MediaTimeline';
const AUTOSAVE_INTERVAL = 30000;
const DEBOUNCE_DELAY = 500;
export default function StoryEditor({
  userId,
  storyId,
  onStorySaved
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [activeStoryId, setActiveStoryId] = useState(storyId || null);
  const latestRef = useRef({ title: '', content: '' });
  const persistedRef = useRef({ title: '', content: '' });
  const storyIdRef = useRef(storyId || null);
  const createdHereRef = useRef(null);
  const onStorySavedRef = useRef(onStorySaved);
  const dirtyRef = useRef(false);
  const settledRef = useRef(false);
  const busyRef = useRef(false);
  const editingRef = useRef(false);
  const debounceRef = useRef(null);
  useEffect(() => {
    onStorySavedRef.current = onStorySaved;
  }, [onStorySaved]);
  useEffect(() => {
    if (!storyId) return;
// New stories have no ID yet, so create the record on first autosave.
// Reuse the generated ID to avoid creating duplicates on retries.
    storyIdRef.current = storyId;
    setActiveStoryId(storyId);
    if (String(createdHereRef.current) === String(storyId)) {
      return;
    }

    let cancelled = false;

    fetch(`/api/stories/${storyId}`, {
      headers: { 'x-user-id': String(userId) }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load story');
        return res.json();
      })
      .then((story) => {
        if (cancelled || editingRef.current) return;

        const restored = {
          title: story.title || '',
          content: story.draft_content ?? story.content ?? ''
        };

        latestRef.current = restored;
        persistedRef.current = restored;

        setTitle(restored.title);
        setContent(restored.content);

        dirtyRef.current = false;
        settledRef.current = false;
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('Failed to load story');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [storyId, userId]);

  function isDirty() {
    const current = latestRef.current;
    const saved = persistedRef.current;

    return current.title !== saved.title ||
      current.content !== saved.content;
  }

  function handleChange(field, value) {
    editingRef.current = true;

    if (field === 'title') {
      setTitle(value);
    } else {
      setContent(value);
    }

    latestRef.current = {
      ...latestRef.current,
      [field]: value
    };

    dirtyRef.current = isDirty();
    settledRef.current = false;

    setSaveStatus(
      dirtyRef.current ? 'Unsaved changes' : 'Saved just now'
    );

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      settledRef.current = true;
    }, DEBOUNCE_DELAY);
  }

  const saveDraft = useCallback(async (force = false) => {
    if (busyRef.current || !dirtyRef.current) return;
    if (!force && !settledRef.current) return;

    busyRef.current = true;
    setSaveStatus('Saving...');

    const snapshot = { ...latestRef.current };

    try {
      let id = storyIdRef.current;
      if (!id) {
        const createRes = await fetch('/api/stories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(userId)
          },
          body: JSON.stringify({
            title: snapshot.title.trim() || 'Untitled Story',
            content: ''
          })
        });

        if (!createRes.ok) {
          throw new Error('Failed to create story');
        }

        const created = await createRes.json();

        if (!created.id) {
          throw new Error('Missing story ID');
        }

        id = created.id;
        storyIdRef.current = id;
        createdHereRef.current = id;
        setActiveStoryId(id);

        if (onStorySavedRef.current) {
          onStorySavedRef.current(id);
        }
      }

      const res = await fetch(`/api/stories/${id}/draft`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId)
        },
        body: JSON.stringify({
          draft_content: snapshot.content,
          title: snapshot.title.trim() || 'Untitled Story'
        })
      });

      if (!res.ok) {
        throw new Error('Draft save failed');
      }

      persistedRef.current = snapshot;
      dirtyRef.current = isDirty();

      setSaveStatus(
        dirtyRef.current ? 'Unsaved changes' : 'Saved just now'
      );
    } catch (err) {
      console.error('Autosave failed:', err);
      setSaveStatus('Save failed — click to retry');
    } finally {
      busyRef.current = false;
    }
  }, [userId]);
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft();
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [saveDraft]);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  async function handleSave(e) {
    if (e) e.preventDefault();

    const snapshot = { ...latestRef.current };

    if (!snapshot.title.trim()) {
      setStatus('Title is required.');
      return;
    }
    if (busyRef.current) {
      setStatus('Saving in progress. Please retry.');
      return;
    }

    busyRef.current = true;
    setStatus('Saving...');

    try {
      const id = storyIdRef.current;
      const res = await fetch(
        id ? `/api/stories/${id}` : '/api/stories',
        {
          method: id ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(userId)
          },
          body: JSON.stringify(snapshot)
        }
      );

      const data = await res.json();

      if (!res.ok || !data.id) {
        throw new Error(data.error || 'Error saving story');
      }

      storyIdRef.current = data.id;
      createdHereRef.current = data.id;
      setActiveStoryId(data.id);

      persistedRef.current = snapshot;
      dirtyRef.current = isDirty();

      setStatus('Saved');
      setSaveStatus(
        dirtyRef.current ? 'Unsaved changes' : 'Saved just now'
      );

      if (onStorySavedRef.current) {
        onStorySavedRef.current(data.id);
      }
    } catch (err) {
      setStatus(err.message || 'Error saving story');
    } finally {
      busyRef.current = false;
    }
  }

  return (
    <div>
      <h2>Story Editor</h2>

      <form onSubmit={handleSave}>
        <input
          value={title}
          onChange={(e) => handleChange('title', e.target.value)}
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
          onChange={(e) => handleChange('content', e.target.value)}
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
          <span style={{
            marginLeft: 12,
            color: '#555',
            fontSize: 13
          }}>
            {status}
          </span>
        )}
      </form>

      {saveStatus && (
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
            <span role="status" style={{
              color: saveStatus === 'Saved just now'
                ? '#15803d'
                : '#555'
            }}>
              {saveStatus}
            </span>
          )}
        </div>
      )}

      {activeStoryId && (
        <MediaTimeline
          storyId={activeStoryId}
          userId={userId}
        />
      )}
    </div>
  );
}
