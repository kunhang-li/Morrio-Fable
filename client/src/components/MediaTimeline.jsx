import React, { useState, useEffect } from 'react';

export default function MediaTimeline({ storyId, userId }) {
  const [mediaItems, setMediaItems] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/stories/${storyId}/media`, {
      headers: { 'x-user-id': String(userId) },
    })
      .then((r) => r.json())
      .then((data) => setMediaItems(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [storyId, userId]);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const newItem = { id: Date.now(), url: URL.createObjectURL(file), media_type: 'image' };
    setMediaItems((prev) => [...prev, newItem]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('media_type', 'image');

      const res = await fetch(`/api/stories/${storyId}/media`, {
        method: 'POST',
        headers: { 'x-user-id': String(userId) },
        body: formData,
      });
      const saved = await res.json();
      setMediaItems((prev) => [...prev, saved]);
    } catch (_) {}
    setUploading(false);
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Media Timeline</h3>
      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
        {mediaItems.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ccc', borderRadius: 6, padding: 8, fontSize: 12 }}>
            <div style={{ width: 80, height: 60, background: '#eee', marginBottom: 4 }} />
            <span>{item.media_type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}