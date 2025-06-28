import React, { useState } from 'react';
import { initializeGemini } from '@/lib/gemini';

interface ApiKeySetupProps {
  onApiKeySet: () => void;
}

export function ApiKeySetup({ onApiKeySet }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!apiKey.trim()) {
      setError('Por favor, ingresa tu API key de Google Gemini');
      setIsLoading(false);
      return;
    }

    try {
      const success = initializeGemini(apiKey.trim());
      if (success) {
        localStorage.setItem('gemini_api_key', apiKey.trim());
        onApiKeySet();
      } else {
        setError('Error al inicializar Gemini. Verifica tu API key.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al configurar la API key');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-lg border shadow-sm">
      <div className="p-6 text-center border-b">
        <h2 className="text-xl font-semibold">🔑 Configurar API Key</h2>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingresa tu API key aquí..."
                className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !apiKey.trim()}
          >
            {isLoading ? 'Configurando...' : 'Configurar API Key'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
          <p><strong>¿Cómo obtener tu API Key?</strong></p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Ve a <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google AI Studio</a></li>
            <li>Inicia sesión con tu cuenta de Google</li>
            <li>Haz clic en "Create API key"</li>
            <li>Copia la API key generada</li>
          </ol>
        </div>
      </div>
    </div>
  );
}