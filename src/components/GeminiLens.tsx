
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState, useRef } from 'react';
import { analyzeContent } from '../services/geminiService';

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

export const GeminiLens: React.FC = () => {
    const [fileData, setFileData] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
    const [prompt, setPrompt] = useState('');
    const [chat, setChat] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setFileData({
                    data: result.split(',')[1],
                    mimeType: file.type,
                    preview: result
                });
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async (customPrompt?: string) => {
        const activePrompt = customPrompt || prompt;
        if (!activePrompt.trim()) return;

        setIsLoading(true);
        setError(null);
        
        // Add user message to local chat display
        setChat(prev => [...prev, { role: 'user', text: activePrompt }]);
        if (!customPrompt) setPrompt('');

        try {
            const result = await analyzeContent(activePrompt, fileData ? { data: fileData.data, mimeType: fileData.mimeType } : undefined);
            setChat(prev => [...prev, { role: 'assistant', text: result }]);
        } catch (e: any) {
            setError(e.message || "Failed to analyze.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setFileData({
                    data: result.split(',')[1],
                    mimeType: file.type,
                    preview: result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const reset = () => {
        setFileData(null);
        setChat([]);
        setError(null);
    };

    return (
        <div className="h-full w-full bg-[#0a0c10] text-slate-100 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/5 backdrop-blur-xl z-20 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)]">✨</div>
                    <h1 className="text-lg font-black italic tracking-tighter uppercase">Gemini <span className="text-purple-400">Lens</span></h1>
                </div>
                <div className="flex gap-4">
                    {fileData && (
                        <button onClick={reset} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Session</button>
                    )}
                    <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-bold text-purple-400 uppercase tracking-widest">Gemini 3 Pro Active</div>
                </div>
            </header>

            <div className="flex-grow flex overflow-hidden">
                {/* File/Preview Section */}
                <div 
                    className={`w-1/2 p-8 flex flex-col items-center justify-center border-r border-white/5 bg-[#0f1117]/50 relative transition-all duration-500 ${!fileData ? 'group' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    {!fileData ? (
                        <div className="flex flex-col items-center text-center max-w-sm">
                            <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center text-5xl mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner group-hover:shadow-purple-500/10 border border-white/5">📂</div>
                            <h2 className="text-xl font-bold mb-2">Multimodal Input</h2>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">Drop an image, screenshot, or document here to start a deep analytical session.</p>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-purple-400 transition-all active:scale-95 shadow-xl shadow-purple-500/5"
                            >
                                Browse Files
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,text/*" />
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
                             <div className="flex-grow bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                                {fileData.mimeType.startsWith('image') ? (
                                    <img src={fileData.preview} className="w-full h-full object-contain" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                                        <div className="text-6xl mb-4">📄</div>
                                        <p className="font-bold text-sm uppercase tracking-widest">Document Loaded</p>
                                        <p className="text-xs opacity-60 mt-1">{fileData.mimeType}</p>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest">
                                    Analyze Target
                                </div>
                             </div>
                             
                             {/* Suggestion Chips */}
                             <div className="flex flex-wrap gap-2">
                                {[
                                    "Summarize this",
                                    "Explain logic",
                                    "Extract entities",
                                    "Describe visual",
                                    "Fix issues"
                                ].map(chip => (
                                    <button 
                                        key={chip}
                                        onClick={() => handleAnalyze(chip)}
                                        className="px-4 py-2 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white transition-all"
                                    >
                                        {chip}
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}
                </div>

                {/* Chat/Analysis Section */}
                <div className="w-1/2 flex flex-col bg-[#0a0c10]">
                    <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {chat.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 grayscale scale-75">
                                <span className="text-6xl mb-4">🧠</span>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Waiting for Prompt</p>
                            </div>
                        ) : (
                            chat.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-purple-600 text-white font-medium' : 'bg-white/5 border border-white/10 text-slate-300'}`}>
                                        <div className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">
                                            {msg.role === 'user' ? 'Analytical Request' : 'Gemini 3 Pro Intelligence'}
                                        </div>
                                        <div className="whitespace-pre-wrap">{msg.text}</div>
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl w-[60%] flex items-center gap-3">
                                    <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Reasoning...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 border-t border-white/5 bg-white/2 backdrop-blur-lg">
                        <div className="relative group">
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAnalyze())}
                                placeholder="Describe your analytical goal..."
                                className="w-full bg-[#151921] border border-white/10 rounded-2xl px-5 py-4 pr-16 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all resize-none min-h-[60px] max-h-[150px]"
                            />
                            <button 
                                onClick={() => handleAnalyze()}
                                disabled={isLoading || !prompt.trim()}
                                className="absolute right-3 bottom-3 w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center hover:bg-purple-500 transition-all disabled:opacity-30 active:scale-95 shadow-lg shadow-purple-500/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </div>
                        {error && <p className="text-[10px] font-bold text-rose-500 mt-2 ml-2">⚠️ {error}</p>}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(168,85,247,0.2);
                }
            `}</style>
        </div>
    );
};
