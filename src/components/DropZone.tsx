import { useCallback, useState, useRef } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Shield, AlertCircle, FileCode, Smartphone } from 'lucide-react';

interface Props {
  onFile: (file: File) => void;
  onXml: (xml: string) => void;
  loading: boolean;
}

export function DropZone({ onFile, onXml, loading }: Props) {
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'apk' | 'xml'>('apk');
  const [xmlText, setXmlText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError('');
    const name = file.name.toLowerCase();
    if (!name.endsWith('.apk') && !name.endsWith('.xml')) {
      setError('Please upload an .apk or AndroidManifest.xml file.');
      return;
    }
    if (name.endsWith('.xml')) {
      file.text().then(onXml).catch(() => setError('Failed to read XML file.'));
    } else {
      onFile(file);
    }
  }, [onFile, onXml]);

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setDragOver(false);
    if (rejected.length > 0 && accepted.length === 0) {
      // react-dropzone rejected due to MIME type — try by extension anyway
      const file = rejected[0]?.file;
      if (file) { processFile(file); return; }
    }
    if (accepted[0]) processFile(accepted[0]);
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // No accept filter — validate by extension in onDrop to handle all MIME variations
    maxFiles: 1,
    disabled: loading,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const isActive = isDragActive || dragOver;

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-rose-600/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 opacity-20 blur-sm" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Android Permission Analyzer</h1>
          <p className="text-slate-400 mt-2 text-base">Instant visual security analysis for any APK</p>
        </div>

        {/* Glass card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/40">
          {/* Tab switcher */}
          <div className="flex bg-white/5 rounded-2xl p-1 mb-5 border border-white/5">
            {(['apk', 'xml'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  tab === t
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'apk' ? <><Smartphone className="w-3.5 h-3.5" /> APK File</> : <><FileCode className="w-3.5 h-3.5" /> Paste XML</>}
              </button>
            ))}
          </div>

          {tab === 'apk' ? (
            <>
              {/* Hidden native input for browse */}
              <input
                ref={inputRef}
                type="file"
                accept=".apk,.xml"
                className="hidden"
                onChange={handleInputChange}
              />

              <div
                {...getRootProps()}
                className={`
                  relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer
                  transition-all duration-300 group
                  ${isActive
                    ? 'border-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-500/20 scale-[1.01]'
                    : 'border-white/15 bg-white/3 hover:border-indigo-500/60 hover:bg-indigo-500/5 hover:shadow-lg hover:shadow-indigo-500/10'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input {...getInputProps()} />
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-[3px] border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    <p className="text-slate-300 font-semibold">Analyzing permissions…</p>
                    <p className="text-slate-500 text-sm">Parsing manifest and detecting patterns</p>
                  </div>
                ) : (
                  <>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-indigo-500/20 scale-110' : 'bg-white/5 group-hover:bg-indigo-500/10'}`}>
                      <Shield className={`w-8 h-8 transition-colors duration-300 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                    </div>
                    <p className="text-white font-bold text-lg mb-1">
                      {isActive ? 'Release to analyze' : 'Drop your APK here'}
                    </p>
                    <p className="text-slate-400 text-sm mb-4">
                      or{' '}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                        className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 font-medium transition-colors"
                      >
                        click to browse
                      </button>
                    </p>
                    <p className="text-slate-600 text-xs">.apk · AndroidManifest.xml supported</p>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <textarea
                className="w-full h-48 bg-white/5 border border-white/10 text-slate-200 text-xs font-mono rounded-2xl p-4 focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/5 resize-none transition-all placeholder-slate-600"
                placeholder={'<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="...">\n  ...\n</manifest>'}
                value={xmlText}
                onChange={e => setXmlText(e.target.value)}
              />
              <button
                onClick={() => { if (xmlText.trim()) onXml(xmlText); }}
                disabled={!xmlText.trim() || loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? 'Analyzing…' : 'Analyze Manifest'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2.5 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {[
            '🔒 Privacy-first · 100% local',
            '⚡ Instant analysis',
            '📊 Visual reports',
            '40+ permissions explained',
          ].map(pill => (
            <span key={pill} className="text-xs text-slate-400 bg-white/5 border border-white/8 px-3 py-1.5 rounded-full backdrop-blur-sm">
              {pill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
