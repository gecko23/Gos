
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState, useEffect } from 'react';
import { GeneratedContent } from './GeneratedContent';
import { InteractionData } from '../types';

interface BrowserProps {
    content: string;
    isLoading: boolean;
    onInteract: (data: InteractionData) => void;
    appContext: string;
    history: InteractionData[];
}

export const Browser: React.FC<BrowserProps> = ({ content, isLoading, onInteract, appContext, history }) => {
    const [url, setUrl] = useState('');
    const [displayUrl, setDisplayUrl] = useState('newtab');

    // Update the URL bar when navigation happens via history
    useEffect(() => {
        if (history.length > 0) {
            // Check the LATEST interaction, not the first one
            const lastInteraction = history[history.length - 1];
            
            if (lastInteraction.type === 'app_open_with_url' || lastInteraction.type === 'url_navigation') {
                setDisplayUrl(lastInteraction.value || '');
                setUrl(lastInteraction.value || '');
            } else if (lastInteraction.id === 'browser_search' || lastInteraction.id === 'browser_address_enter') {
                setDisplayUrl(lastInteraction.value || '');
                setUrl(lastInteraction.value || '');
            }
        }
    }, [history]);

    const handleNavigate = (e: React.FormEvent) => {
        e.preventDefault();
        const targetUrl = url.trim();
        if (!targetUrl) return;

        onInteract({
            id: 'browser_address_enter',
            type: 'url_navigation',
            value: targetUrl,
            elementType: 'input',
            elementText: targetUrl,
            appContext
        });
    };

    const isNewTab = displayUrl === 'newtab' || (!content && !isLoading);

    return (
        <div className="flex flex-col h-full bg-white font-sans text-gray-800">
            <style>{`
                @keyframes browser-progress {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
            
            {/* Chrome Toolbar */}
            <div className="bg-[#f2f2f2] border-b border-gray-300 p-2 flex items-center gap-3 shadow-sm z-20 relative">
                <div className="flex items-center gap-1 ml-1">
                    <button className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 transition-colors" title="Back">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <button className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 transition-colors" title="Forward">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                    <button 
                        className={`p-1.5 rounded-full hover:bg-gray-200 text-gray-600 transition-colors ${isLoading ? 'animate-spin text-blue-500' : ''}`} 
                        title="Reload"
                        onClick={() => {
                             onInteract({ 
                                 id: 'browser_reload', 
                                 type: 'url_navigation', 
                                 value: displayUrl, 
                                 elementType: 'button', 
                                 elementText: 'Reload', 
                                 appContext 
                             });
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    </button>
                    <button 
                        className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 transition-colors" 
                        title="Home"
                        onClick={() => {
                            setDisplayUrl('newtab');
                            setUrl('');
                            // We don't necessarily need to trigger an interaction for local newtab, 
                            // but clearing the content is handled by the isNewTab logic.
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    </button>
                </div>

                <form onSubmit={handleNavigate} className="flex-grow flex items-center relative">
                    <div className="absolute left-3 text-gray-400 flex items-center justify-center">
                        {isLoading ? (
                            <svg className="animate-spin h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        )}
                    </div>
                    <input 
                        type="text" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Search Google or type a URL"
                        className="w-full bg-white border border-gray-300 rounded-full py-1.5 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-sm transition-all"
                    />
                </form>

                <div className="flex items-center gap-1 pr-1">
                    <button className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                </div>

                {/* Loading Progress Bar */}
                {isLoading && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-transparent overflow-hidden pointer-events-none">
                        <div className="h-full bg-blue-500 animate-[browser-progress_1.5s_infinite_linear] origin-left w-full"></div>
                    </div>
                )}
            </div>

            {/* Browser Content */}
            <div className="flex-grow overflow-hidden relative bg-white">
                {isNewTab ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="mb-8 flex flex-col items-center">
                            <h1 className="text-6xl font-black italic tracking-tighter mb-2">
                                <span className="text-blue-500">G</span>
                                <span className="text-red-500">o</span>
                                <span className="text-yellow-500">o</span>
                                <span className="text-blue-500">g</span>
                                <span className="text-green-500">l</span>
                                <span className="text-red-500">e</span>
                            </h1>
                            <div className="flex gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                <span>Advanced Search Engine</span>
                            </div>
                        </div>

                        <div className="w-full max-w-xl">
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">🔍</span>
                                <input 
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleNavigate(e)}
                                    placeholder="Search anything on the web..."
                                    className="w-full py-3.5 pl-12 pr-4 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all text-gray-700"
                                />
                            </div>
                            
                            <div className="flex justify-center gap-3 mt-8">
                                <button onClick={handleNavigate} className="bg-gray-50 border border-transparent hover:border-gray-200 px-6 py-2 rounded-md text-sm text-gray-700 font-medium transition-all">Google Search</button>
                                <button className="bg-gray-50 border border-transparent hover:border-gray-200 px-6 py-2 rounded-md text-sm text-gray-700 font-medium transition-all">I'm Feeling Lucky</button>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-6 mt-16 max-w-md mx-auto">
                                {[
                                    { name: 'Gmail', icon: '📩' },
                                    { name: 'YouTube', icon: '🎬' },
                                    { name: 'Maps', icon: '📍' },
                                    { name: 'News', icon: '📰' },
                                    { name: 'Photos', icon: '🖼️' },
                                ].map(site => (
                                    <button 
                                        key={site.name}
                                        onClick={() => { setUrl(site.name.toLowerCase() + '.com'); onInteract({ id: `shortcut_${site.name}`, type: 'url_navigation', value: `https://www.${site.name.toLowerCase()}.com`, elementType: 'icon', elementText: site.name, appContext }); }}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl group-hover:bg-gray-200 transition-all shadow-sm">
                                            {site.icon}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{site.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isLoading && (
                            <div className="mt-12 flex flex-col items-center gap-3 animate-in fade-in duration-500">
                                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Waking up the web...</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto">
                        <GeneratedContent 
                            htmlContent={content} 
                            onInteract={onInteract} 
                            appContext={appContext} 
                            isLoading={isLoading} 
                        />
                    </div>
                )}
            </div>
            
            {/* Browser Bottom Status Bar */}
            <div className="h-6 bg-[#f2f2f2] border-t border-gray-300 px-3 flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                        {isLoading ? 'Requesting...' : 'Connected'}
                    </span>
                    <span>TLS 1.3 Secure</span>
                </div>
                <span>© 2024 G OS Browser</span>
            </div>
        </div>
    );
};
