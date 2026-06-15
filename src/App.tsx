import { useState, useEffect } from 'react';
import { DropZone } from './components/DropZone';
import { Dashboard } from './components/Dashboard';
import { parseApk, parseXmlText, type ParsedManifest } from './utils/apkParser';

function App() {
  const [manifest, setManifest] = useState<ParsedManifest | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const result = await parseApk(file);
      setManifest(result);
      setFileName(file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse APK');
    } finally {
      setLoading(false);
    }
  };

  const handleXml = async (xml: string) => {
    setLoading(true);
    setError('');
    try {
      const result = parseXmlText(xml);
      setManifest(result);
      setFileName('AndroidManifest.xml');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse XML');
    } finally {
      setLoading(false);
    }
  };

  if (manifest) {
    return <Dashboard manifest={manifest} fileName={fileName} onReset={() => setManifest(null)} />;
  }

  return (
    <>
      <DropZone onFile={handleFile} onXml={handleXml} loading={loading} />
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-xl text-sm shadow-lg">
          {error}
        </div>
      )}
    </>
  );
}

export default App;
