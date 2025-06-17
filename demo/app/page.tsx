'use client';

import { useState } from 'react';

interface PageCountResult {
  pages: number;
  method: 'metadata' | 'heuristic' | 'word-count';
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<PageCountResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/count-pages', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClientSideCount = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Dynamic import to use the package on client side
      const { countDocumentPages } = await import('document-page-counter');
      
      const buffer = await file.arrayBuffer();
      const result = await countDocumentPages(buffer, file.type);
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isSupported = file && (
    file.type === 'application/pdf' || 
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Document Page Counter Demo
          </h1>
          
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a PDF or DOCX file
              </label>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* File Info */}
            {file && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">File Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Name:</strong> {file.name}</p>
                  <p><strong>Size:</strong> {(file.size / 1024).toFixed(1)} KB</p>
                  <p><strong>Type:</strong> {file.type}</p>
                  <p><strong>Supported:</strong> 
                    <span className={isSupported ? 'text-green-600' : 'text-red-600'}>
                      {isSupported ? ' Yes ✓' : ' No ✗'}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {file && isSupported && (
              <div className="flex space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Counting...' : 'Count Pages (Server)'}
                </button>
                
                <button
                  onClick={handleClientSideCount}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Counting...' : 'Count Pages (Client)'}
                </button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-red-800">
                    <strong>Error:</strong> {error}
                  </div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  📄 Page Count Result
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Pages:</span>
                    <span className="ml-2 text-2xl font-bold text-green-700">
                      {result.pages}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Method:</span>
                    <span className="ml-2 text-green-700 capitalize">
                      {result.method}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  <strong>Method explanation:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• <strong>metadata</strong> - Extracted from document properties (most accurate)</li>
                    <li>• <strong>word-count</strong> - Estimated from word count (DOCX fallback)</li>
                    <li>• <strong>heuristic</strong> - Estimated from file size (last resort)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">How to test:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>1. Upload a PDF or DOCX file</li>
                <li>2. Try both server-side and client-side counting</li>
                <li>3. Compare the results and methods used</li>
                <li>4. Test with different file types and sizes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}