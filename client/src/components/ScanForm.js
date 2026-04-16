import React, { useState, useRef, useEffect } from 'react';
import { postScan } from '../services/api';
import { validateVtFileUpload, vtAcceptAttribute } from '../constants/vtUploadAllowlist';

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export default function ScanForm({ onResult }) {
  const [inputType, setInputType] = useState('url');
  const [raw, setRaw] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (inputType !== 'attachment') {
      setAttachmentFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [inputType]);

  const onAttachmentPick = (e) => {
    const file = e.target.files && e.target.files[0];
    setAttachmentFile(file || null);
    setError(null);
    if (file) {
      const check = validateVtFileUpload(file.name, file.size, file.type);
      if (!check.ok) {
        setError(check.error);
        setAttachmentFile(null);
        e.target.value = '';
      }
    }
  };

  const submit = async (e) => {
    e && e.preventDefault();
    setError(null);
    setLoading(true);
    onResult(null);

    try {
      if (inputType === 'attachment') {
        if (!attachmentFile) {
          setError('Choose a file to scan.');
          setLoading(false);
          return;
        }
        const check = validateVtFileUpload(
          attachmentFile.name,
          attachmentFile.size,
          attachmentFile.type
        );
        if (!check.ok) {
          setError(check.error);
          setLoading(false);
          return;
        }
        const dataUrl = await readFileAsDataURL(attachmentFile);
        const res = await postScan({
          inputType,
          raw: dataUrl,
          fileName: attachmentFile.name,
          fileMime: attachmentFile.type || ''
        });
        onResult(res);
      } else {
        const res = await postScan({ inputType, raw });
        onResult(res);
      }
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setRaw('');
    setAttachmentFile(null);
    setError(null);
    onResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <form onSubmit={submit} className="scan-form">
      <label>Type</label>
      <select
        value={inputType}
        onChange={(e) => setInputType(e.target.value)}
      >
        <option value="url">URL</option>
        <option value="email">Email</option>
        <option value="attachment">Attachment</option>
      </select>

      {inputType === 'attachment' ? (
        <>
          <label htmlFor="attachment-file">File (VirusTotal-supported types, max 32 MB)</label>
          <input
            id="attachment-file"
            ref={fileInputRef}
            type="file"
            accept={vtAcceptAttribute()}
            onChange={onAttachmentPick}
          />
          {attachmentFile && (
            <div className="file-picked">
              Selected: <strong>{attachmentFile.name}</strong> (
              {(attachmentFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </>
      ) : (
        <>
          <label>Input</label>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={8}
          />
        </>
      )}

      <div className="row">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Scanning…' : 'Run scan'}
        </button>
        <button type="button" onClick={clear} className="muted">
          Clear
        </button>
      </div>

      {error && <div className="error">{error}</div>}
    </form>
  );
}
