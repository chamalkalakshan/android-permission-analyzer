import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSearch, AlertCircle } from 'lucide-react';

interface Props {
  onFile: (file: File) => void;
  onXml: (xml: string) => void;
  loading: boolean;
}

export function DropZone({ onFile, onXml, loading }: Props) {
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'apk' | 'xml'>('apk');
  const [xmlText, setXmlText] = useState('');

  const onDrop = useCallback((accepted: File[]) => {
    setError('');
    const file = accepted[0];
    if (!file) return;
    if (!file.name.endsWith('.apk') && !file.name.endsWith('.xml')) {
      setError('Please upload an APK or AndroidManifest.xml file.');
      return;
    }
    if (file.name.endsWith('.xml')) {
      file.text().then(onXml);
    } else {
      onFile(file);
    }
  }, [onFile, onXml]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/octet-stream': ['.apk'], 'text/xml': ['.xml'], 'application/xml': ['.xml'] },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-6">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4">
          <FileSearch className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Android Permission Analyzer</h1>
        <p className="text-slate-400 mt-2 text-lg">Analyze APK permissions visually, detect risks, and generate reports</p>
      </div>

      <div className="w-full max-w-2xl">
        <div className="flex rounded-xl overflow-hidden mb-4 border border-slate-700">
          {(['apk', 'xml'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {t === 'apk' ? 'Upload APK File' : 'Paste XML Directly'}
            </button>
          ))}
        </div>

        {tab === 'apk' ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
              ${isDragActive ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]' : 'border-slate-600 bg-slate-800/50 hover:border-indigo-500 hover:bg-slate-800'}
              ${loading ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-300 font-medium">Analyzing permissions…</p>
              </div>
            ) : (
              <>
                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <p className="text-white font-semibold text-lg mb-1">
                  {isDragActive ? 'Drop your APK here' : 'Drag & drop your APK file'}
                </p>
                <p className="text-slate-400 text-sm">or click to browse · .apk and AndroidManifest.xml supported</p>
              </>
            )}
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
            <textarea
              className="w-full h-56 bg-slate-900 text-slate-200 text-sm font-mono rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-indigo-500 resize-none"
              placeholder='Paste your AndroidManifest.xml content here…'
              value={xmlText}
              onChange={e => setXmlText(e.target.value)}
            />
            <button
              onClick={() => { if (xmlText.trim()) onXml(xmlText); }}
              disabled={!xmlText.trim() || loading}
              className="mt-3 w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Analyzing…' : 'Analyze XML'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🔍', label: '40+ permissions explained' },
            { icon: '⚠️', label: 'Suspicious pattern detection' },
            { icon: '📄', label: 'PDF report export' },
          ].map(f => (
            <div key={f.label} className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-slate-400 text-xs">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
