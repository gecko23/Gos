/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React from 'react';
import { ConversationalResponse } from '../types';

type VoiceAssistantState = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceAssistantProps {
  isOpen: boolean;
  state: VoiceAssistantState;
  userTranscript: string;
  assistantResponse: ConversationalResponse;
  onClose: () => void;
  onMicClick: () => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  isOpen,
  state,
  userTranscript,
  assistantResponse,
  onClose,
  onMicClick,
}) => {
  if (!isOpen) return null;

  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking...';
      case 'idle':
      default:
        return 'Hi! How can I help?';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}>
      <div
        className="bg-white/80 rounded-2xl shadow-2xl w-full max-w-lg h-[400px] flex flex-col p-6 text-gray-800"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold">G Assistant</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
            aria-label="Close Assistant">
            &times;
          </button>
        </div>

        <div className="flex-grow flex flex-col justify-end min-h-0">
          <div className="overflow-y-auto pr-2">
            {userTranscript && (
              <div className="text-right mb-4">
                <p className="inline-block bg-blue-500 text-white rounded-lg px-4 py-2 max-w-full break-words">
                  {userTranscript}
                </p>
              </div>
            )}
            {assistantResponse.text && (
              <div className="text-left mb-4">
                <div className="inline-block bg-gray-200 text-gray-800 rounded-lg px-4 py-2 max-w-full break-words">
                    <p>{assistantResponse.text}</p>
                    {assistantResponse.sources && assistantResponse.sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-300">
                            <h4 className="text-xs font-bold text-gray-600 mb-1">Sources:</h4>
                            <ul className="list-none p-0">
                                {assistantResponse.sources.map((source, index) => (
                                    <li key={index} className="text-xs truncate">
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                           {index + 1}. {source.web.title || source.web.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
              </div>
            )}
          </div>
          <p className="text-center text-gray-600 my-4 flex-shrink-0">
            {getStatusText()}
          </p>
        </div>

        <div className="flex justify-center items-center mt-auto pt-4 flex-shrink-0">
          <button
            onClick={onMicClick}
            className="relative flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 text-white shadow-lg transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:bg-gray-400"
            aria-label={
              state === 'listening' ? 'Stop listening' : 'Start listening'
            }
            disabled={state === 'processing' || state === 'speaking'}>
            {state === 'listening' && (
              <>
                <span className="animate-[pulse-ring_1.25s_cubic-bezier(0.215,0.61,0.355,1)_infinite] absolute inline-flex rounded-full h-full w-full bg-blue-500"></span>
                <span className="animate-[pulse-dot_1.25s_cubic-bezier(0.455,0.03,0.515,0.955)_-0.4s_infinite] absolute inline-flex rounded-full h-3 w-3 bg-blue-200"></span>
              </>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
