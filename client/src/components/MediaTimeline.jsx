import React, { useState, useEffect } from 'react';

export default function MediaTimeline({ storyId, userId }) {
  const [mediaItems, setMediaItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
    if (!file || uploading) return;
  
    setUploading(true);
    setUploadError('');
  
    // Create a temporary media item
    const newItem = {
      id: `temp-${Date.now()}`,
      url: URL.createObjectURL(file),
      media_type: 'image'
    };
  
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
  
      if (!res.ok) {
        throw new Error('Upload failed');
      }
  
      const saved = await res.json();
// Reconcile the optimistic upload with the server-confirmed item.
// Avoid removing unrelated media when temporary IDs are missing.
      setMediaItems(prev => [
        ...prev.filter(item =>
          newItem.id == null || item.id !== newItem.id
        ),
        saved
      ]);
  
    } catch (error) {
      setMediaItems((prev) =>
        prev.filter((item) => item.id !== newItem.id)
      );
  
      setUploadError('Upload failed. Please try again.');
  
    } finally {
      URL.revokeObjectURL(newItem.url);
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Media Timeline</h3>
      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
      {uploadError && (
        <p style={{ color: 'red' }}>{uploadError}</p>
      )}
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