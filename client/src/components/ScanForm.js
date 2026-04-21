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

const TABS = [
  { value: 'url',        label: 'URL' },
  { value: 'email',      label: 'Email' },
  { value: 'attachment', label: 'File' },
];

export default function ScanForm({ onResult }) {
  const [inputType, setInputType]       = useState('url');
  const [raw, setRaw]                   = useState('');
  const [attachmentFile, setAttachment] = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const fileInputRef                    = useRef(null);

  useEffect(() => {
    if (inputType !== 'attachment') {
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [inputType]);

  const onAttachmentPick = (e) => {
    const file = e.target.files && e.target.files[0];
    setAttachment(file || null);
    setError(null);
    if (file) {
      const check = validateVtFileUpload(file.name, file.size, file.type);
      if (!check.ok) {
        setError(check.error);
        setAttachment(null);
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
          fileMime: attachmentFile.type || '',
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
    setAttachment(null);
    setError(null);
    onResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const placeholders = {
    url:   'https://suspicious-domain.com/login',
    email: 'Paste raw email headers + body…',
  };

  return (
    <form onSubmit={submit} className="scan-form">

      {/* ── Tab switcher ── */}
      <div className="tab-group" role="tablist">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={inputType === value}
            className={`tab-btn${inputType === value ? ' active' : ''}`}
            onClick={() => setInputType(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Text input (URL / Email) ── */}
      {inputType !== 'attachment' && (
        <div className="field-group">
          <label className="field-label" htmlFor="scan-raw-input">
            {inputType === 'url' ? 'target url' : 'email content'}
          </label>
          <textarea
            id="scan-raw-input"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={inputType === 'url' ? 3 : 8}
            placeholder={placeholders[inputType]}
            spellCheck={false}
          />
        </div>
      )}

      {/* ── File input ── */}
      {inputType === 'attachment' && (
        <div className="field-group">
          <label className="field-label" htmlFor="attachment-file">
            attachment file
          </label>
          <div className="file-drop-zone">
            <input
              id="attachment-file"
              ref={fileInputRef}
              type="file"
              accept={vtAcceptAttribute()}
              onChange={onAttachmentPick}
            />
            <svg className="file-drop-icon" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span className="file-drop-text">drop file or click to browse</span>
            <span className="file-drop-sub">vt-supported types · max 32 mb</span>
          </div>

          {attachmentFile && (
            <div className="file-picked">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <strong>{attachmentFile.name}</strong>
              <span className="file-picked-size">
                {(attachmentFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="row">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Scanning…' : 'Run scan'}
        </button>
        <button type="button" onClick={clear} className="muted">
          CLR
        </button>
      </div>

      {error && <div className="error">{error}</div>}

    </form>
  );
}
