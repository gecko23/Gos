/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState } from 'react';
import { translateText, translateImage } from '../services/geminiService';

type Mode = 'text' | 'image';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]); // remove data:mime/type;base64, part
        reader.onerror = error => reject(error);
    });
};

export const Translator: React.FC = () => {
    const [mode, setMode] = useState<Mode>('text');
    const [inputText, setInputText] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('Spanish');
    const [translatedText, setTranslatedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Image state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleTranslateText = async () => {
        if (!inputText.trim() || !targetLanguage.trim()) {
            setError('Please enter text and a target language.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setTranslatedText('');
        try {
            const result = await translateText(inputText, targetLanguage);
            setTranslatedText(result);
        } catch (e: any) {
            setError(e.message || 'Failed to translate text.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
            setTranslatedText('');
            setError(null);
        }
    };

    const handleTranslateImage = async () => {
        if (!imageFile || !targetLanguage.trim()) {
            setError('Please select an image and a target language.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setTranslatedText('');

        try {
            const base64Image = await fileToBase64(imageFile);
            const result = await translateImage(base64Image, imageFile.type, targetLanguage);
            setTranslatedText(result);
        } catch (e: any) {
            setError(e.message || 'Failed to translate image.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyToClipboard = () => {
        if(translatedText) {
            navigator.clipboard.writeText(translatedText).then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            });
        }
    };

    const TabButton: React.FC<{ currentMode: Mode, targetMode: Mode, children: React.ReactNode }> = ({ currentMode, targetMode, children }) => (
        <button
            onClick={() => setMode(targetMode)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${currentMode === targetMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="p-6 bg-gray-50 h-full flex flex-col items-center justify-start overflow-y-auto">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Translator</h1>
                    <p className="text-gray-600 mt-2">Translate text or text within images.</p>
                </div>
                
                <div className="flex border-b border-gray-300 mb-4">
                    <TabButton currentMode={mode} targetMode="text">📝 Text</TabButton>
                    <TabButton currentMode={mode} targetMode="image">🖼️ Image</TabButton>
                </div>

                <div className="mb-4">
                    <label htmlFor="targetLanguage" className="llm-label">Translate to:</label>
                    <input
                        type="text"
                        id="targetLanguage"
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        placeholder="e.g., French, Japanese"
                        className="llm-input w-full"
                        disabled={isLoading}
                    />
                </div>
                
                {mode === 'text' ? (
                    <div>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Enter text to translate..."
                            className="llm-textarea w-full"
                            rows={5}
                            disabled={isLoading}
                        />
                        <button onClick={handleTranslateText} className="llm-button w-full mt-2" disabled={isLoading || !inputText.trim()}>
                            {isLoading ? 'Translating...' : 'Translate Text'}
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300 overflow-hidden relative shadow-inner mb-4">
                           {imagePreviewUrl ? (
                                <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-contain" />
                           ) : (
                               <div className="text-gray-400 text-center p-4">
                                   <p className="text-3xl mb-2">📤</p>
                                   <p className="font-medium">Upload an image to translate</p>
                               </div>
                           )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            disabled={isLoading}
                        />
                         <button onClick={handleTranslateImage} className="llm-button w-full mt-4" disabled={isLoading || !imageFile}>
                            {isLoading ? 'Translating...' : 'Translate Image'}
                        </button>
                    </div>
                )}
                
                {error && <p className="text-red-500 text-center my-4">{error}</p>}

                { (isLoading || translatedText) && (
                    <div className="mt-6 w-full">
                        <h2 className="llm-title">Translation Result:</h2>
                         <div className="relative p-4 bg-white border border-gray-300 rounded-md min-h-[100px]">
                           {isLoading && !translatedText ? (
                               <div className="flex items-center justify-center h-full">
                                   <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                               </div>
                           ) : (
                               <>
                                   <p className="llm-text whitespace-pre-wrap !m-0">{translatedText}</p>
                                   <button onClick={copyToClipboard} title="Copy to clipboard" className="absolute top-2 right-2 p-1.5 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
                                        {copySuccess ? 
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg text-green-600" viewBox="0 0 16 16">
                                                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022z"/>
                                            </svg> :
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard" viewBox="0 0 16 16">
                                              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zM-1 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5z"/>
                                            </svg>
                                        }
                                   </button>
                               </>
                           )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};