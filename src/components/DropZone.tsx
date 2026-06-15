import { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Shield, Upload, FileCode, Smartphone, Lock, Zap, FileText } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface Props {
  onFile: (file: File) => void;
  onXml: (xml: string) => void;
  loading: boolean;
}

export function DropZone({ onFile, onXml, loading }: Props) {
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'apk' | 'xml'>('apk');
  const [xmlText, setXmlText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError('');
    const name = file.name.toLowerCase();
    if (!name.endsWith('.apk') && !name.endsWith('.xml')) {
      setError('Please upload an .apk or AndroidManifest.xml file.');
      return;
    }
    if (name.endsWith('.xml')) {
      file.text().then(onXml).catch(() => setError('Failed to read file.'));
    } else {
      onFile(file);
    }
  }, [onFile, onXml]);

  const onDrop = useCallback((accepted: File[], rejected: { file: File }[]) => {
    const file = accepted[0] ?? rejected[0]?.file;
    if (file) processFile(file);
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: loading,
    noClick: true,
  });

  return (
    <div
      style={{ background: 'var(--bg)', position: 'relative' }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      {/* Theme toggle */}
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="text-center mb-10">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2" style={{ color: 'var(--t1)' }}>
          Android Permission Analyzer
        </h1>
        <p style={{ color: 'var(--t3)' }} className="text-base">
          Visual security analysis for Android APKs - runs entirely in your browser
        </p>
      </div>

      {/* Main card */}
      <div
        className="w-full max-w-lg rounded-2xl p-6"
        style={{ background: 'var(--s1)', border: '1px solid var(--s2)' }}
      >
        {/* Tabs */}
        <div
          className="flex rounded-xl p-1 mb-5"
          style={{ background: 'var(--bg)' }}
        >
          {(['apk', 'xml'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-150"
              style={
                tab === t
                  ? { background: '#6366f1', color: '#fff' }
                  : { color: 'var(--t3)' }
              }
            >
              {t === 'apk'
                ? <><Smartphone className="w-3.5 h-3.5" /> APK File</>
                : <><FileCode className="w-3.5 h-3.5" /> Paste XML</>
              }
            </button>
          ))}
        </div>

        {tab === 'apk' ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".apk,.xml"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ''; }}
            />
            <div
              {...getRootProps()}
              className="rounded-xl p-10 text-center transition-all duration-200 cursor-pointer"
              style={{
                border: `2px dashed ${isDragActive ? '#6366f1' : 'var(--s3)'}`,
                background: isDragActive ? 'rgba(99,102,241,0.08)' : 'var(--bg)',
              }}
              onClick={() => inputRef.current?.click()}
            >
              <input {...getInputProps()} />
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-2">
                  <div
                    className="w-10 h-10 rounded-full border-[3px] border-t-indigo-500 animate-spin"
                    style={{ borderColor: 'var(--s2)', borderTopColor: '#6366f1' }}
                  />
                  <p className="font-semibold" style={{ color: 'var(--t1)' }}>Analyzing...</p>
                  <p style={{ color: 'var(--t3)' }} className="text-sm">Parsing manifest and detecting patterns</p>
                </div>
              ) : (
                <>
                  <div
                    className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: isDragActive ? 'rgba(99,102,241,0.15)' : 'var(--s2)' }}
                  >
                    <Upload className="w-6 h-6" style={{ color: isDragActive ? '#818cf8' : 'var(--t3)' }} />
                  </div>
                  <p className="font-bold text-lg mb-1" style={{ color: 'var(--t1)' }}>
                    {isDragActive ? 'Drop to analyze' : 'Drop your APK here'}
                  </p>
                  <p style={{ color: 'var(--t3)' }} className="text-sm mb-4">
                    or{' '}
                    <span
                      className="cursor-pointer font-medium underline underline-offset-2"
                      style={{ color: '#818cf8' }}
                    >
                      click to browse
                    </span>
                  </p>
                  <p style={{ color: 'var(--t5)' }} className="text-xs">.apk and AndroidManifest.xml supported</p>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <textarea
              className="w-full h-44 rounded-xl p-4 text-xs font-mono resize-none outline-none transition-colors"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--s3)',
                color: 'var(--t1)',
                caretColor: '#6366f1',
              }}
              placeholder={'<?xml version="1.0"?>\n<manifest package="com.example.app">\n  <uses-permission android:name="..." />\n</manifest>'}
              value={xmlText}
              onChange={e => setXmlText(e.target.value)}
              onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--s3)')}
            />
            <button
              onClick={() => { if (xmlText.trim()) onXml(xmlText); }}
              disabled={!xmlText.trim() || loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-opacity"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                opacity: !xmlText.trim() || loading ? 0.5 : 1,
                cursor: !xmlText.trim() || loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze XML'}
            </button>
          </div>
        )}

        {error && (
          <div
            className="mt-4 flex items-center gap-2 rounded-xl p-3 text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
          >
            <span>&#9888;</span> {error}
          </div>
        )}
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-3 mt-8 justify-center">
        {[
          { icon: <Lock className="w-3.5 h-3.5" />, text: '100% local - no uploads' },
          { icon: <Zap className="w-3.5 h-3.5" />, text: 'Instant analysis' },
          { icon: <FileText className="w-3.5 h-3.5" />, text: 'PDF report export' },
        ].map(f => (
          <div
            key={f.text}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm"
            style={{ background: 'var(--s1)', border: '1px solid var(--s2)', color: 'var(--t2)' }}
          >
            {f.icon} {f.text}
          </div>
        ))}
      </div>
    </div>
  );
}
