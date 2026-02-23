import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { AppDefinition, WindowState } from '../types';

interface VideoGeneratorProps {
  onAppOpen: (app: AppDefinition, defaultWindowState?: WindowState) => void;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onAppOpen }) => {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState(false);

  const checkApiKey = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setApiKeySelected(selected);
    }
  };

  useEffect(() => {
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setApiKeySelected(true); // Assume success for now, actual check will happen on generation
    }
  };

  const generateVideo = async () => {
    if (!apiKeySelected) {
      setError('Please select an API key first.');
      return;
    }
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9',
        },
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setVideoUrl(downloadLink);
      } else {
        setError('Video generation failed: No download link found.');
      }
    } catch (e: any) {
      console.error('Video generation error:', e);
      if (e.message.includes('Requested entity was not found.')) {
        setError('API key error: Please select a valid paid API key.');
        setApiKeySelected(false);
      } else {
        setError(`Video generation failed: ${e.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = 'generated_video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (videoUrl) {
      // In a real app, you'd integrate with a sharing service.
      // For this simulation, we'll just copy the URL.
      navigator.clipboard.writeText(videoUrl);
      alert('Video URL copied to clipboard!');
    }
  };

  return (
    <div className="p-4 w-full h-full flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Video Generator</h1>
      {!apiKeySelected && (
        <div className="text-center mb-4">
          <p className="text-red-600 mb-2">A paid Gemini API key is required for video generation.</p>
          <button
            className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200"
            onClick={handleSelectApiKey}
          >
            Select API Key
          </button>
          <p className="text-sm text-gray-600 mt-2">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Learn about billing
            </a>
          </p>
        </div>
      )}

      {apiKeySelected && (
        <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-xl">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Enter your video prompt here... (e.g., A futuristic city with flying cars at sunset)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          ></textarea>
          <button
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={generateVideo}
            disabled={isLoading || !prompt}
          >
            {isLoading ? 'Generating Video...' : 'Generate Video'}
          </button>

          {error && <p className="text-red-600 mt-4 text-center">Error: {error}</p>}

          {isLoading && (
            <div className="mt-6 text-center text-blue-600">
              <p>Video generation can take a few minutes. Please wait...</p>
              <div className="mt-2 animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}

          {videoUrl && (
            <div className="mt-6 text-center">
              <h2 className="text-xl font-semibold mb-3">Generated Video</h2>
              <video controls src={videoUrl} className="w-full rounded-lg shadow-lg mb-4"></video>
              <div className="flex justify-center space-x-4">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  onClick={handleDownload}
                >
                  Download
                </button>
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                  onClick={handleShare}
                >
                  Share URL
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
