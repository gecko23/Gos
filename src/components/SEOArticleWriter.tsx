
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState, useEffect } from 'react';
import { generateSeoArticle } from '../services/geminiService';

interface SavedArticle {
    id: string;
    keyword: string;
    content: string;
    timestamp: number;
    params: {
        audience: string;
        tone: string;
        secondaryKeywords: string;
    }
}

type ViewMode = 'writer' | 'comparison';

export const SEOArticleWriter: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('writer');
    const [keyword, setKeyword] = useState('');
    const [audience, setAudience] = useState('');
    const [tone, setTone] = useState('');
    const [secondaryKeywords, setSecondaryKeywords] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [articleContent, setArticleContent] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    // History state
    const [history, setHistory] = useState<SavedArticle[]>(() => {
        const saved = localStorage.getItem('seo_article_history');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('seo_article_history', JSON.stringify(history));
    }, [history]);

    const handleGenerate = async () => {
        if (!keyword.trim()) {
            setError('Please enter a main keyword or topic.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setArticleContent('');

        try {
            const result = await generateSeoArticle(keyword, audience, tone, secondaryKeywords);
            setArticleContent(result);
            
            // Save to history
            const newArticle: SavedArticle = {
                id: Math.random().toString(36).substr(2, 9),
                keyword: keyword.trim(),
                content: result,
                timestamp: Date.now(),
                params: {
                    audience,
                    tone,
                    secondaryKeywords
                }
            };
            setHistory(prev => [newArticle, ...prev]);
        } catch (e: any) {
            setError(e.message || 'Failed to generate the article.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartOver = () => {
        setKeyword('');
        setAudience('');
        setTone('');
        setSecondaryKeywords('');
        setArticleContent('');
        setError(null);
        setCopySuccess(false);
    };
    
    const copyToClipboard = () => {
        if(articleContent) {
            navigator.clipboard.writeText(articleContent).then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            });
        }
    };

    const loadFromHistory = (article: SavedArticle) => {
        setKeyword(article.keyword);
        setAudience(article.params.audience);
        setTone(article.params.tone);
        setSecondaryKeywords(article.params.secondaryKeywords);
        setArticleContent(article.content);
        setViewMode('writer');
        setError(null);
    };

    const deleteFromHistory = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    const ComparisonTable = () => (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden rounded-2xl border border-gray-200 shadow-xl bg-white">
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 p-8 text-white text-center relative">
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Premium Options</div>
                <h2 className="text-3xl font-black italic tracking-tighter">SROVNÁNÍ SLUŽEB OBSAHU</h2>
                <p className="text-blue-100 mt-2 font-medium">Najděte ideální balanc mezi AI efektivitou a lidskou expertízou</p>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-5 text-gray-500 uppercase text-[10px] font-black tracking-widest">Služba / Aktivita</th>
                            <th className="px-6 py-5 text-gray-700 uppercase text-[10px] font-black tracking-widest border-l border-gray-100">Svépomocí (s AI)</th>
                            <th className="px-6 py-5 bg-blue-50/50 text-blue-700 uppercase text-[10px] font-black tracking-widest border-l border-blue-100 relative">
                                Plný servis (Pro vás)
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded shadow-lg">Doporučujeme</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {[
                            { icon: '✍️', activity: 'Psaní článků', diy: 'Píšete s využitím AI', pro: 'Píšeme pro vás' },
                            { icon: '🗺️', activity: 'Strategie obsahu', diy: 'Samostatné plánování', pro: 'Strategie na míru od expertů' },
                            { icon: '🔍', activity: 'Výzkum klíčových slov', diy: 'Přístup k výzkumným nástrojům', pro: 'Výzkum hotový pro vás' },
                            { icon: '🚀', activity: 'SEO optimalizace', diy: 'Optimalizace pomocí AI', pro: 'Odborná optimalizace pro lidi' },
                            { icon: '🔗', activity: 'Zpětné odkazy', diy: '—', pro: 'Zkušení tvůrci odkazů v týmu' },
                            { icon: '📅', activity: 'Vydavatelství', diy: 'Publikování jedním kliknutím', pro: 'Plánované a spravované' },
                            { icon: '📞', activity: 'Strategické volání', diy: 'Podpora přes chat', pro: 'Týdenní/měsíční hovory' },
                            { icon: '📊', activity: 'Objem obsahu', diy: 'Neomezené (vytvoříte sami)', pro: 'Dle zvoleného plánu' },
                        ].map((row, idx) => (
                            <tr key={idx} className="group hover:bg-gray-50/80 transition-all duration-200">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{row.icon}</span>
                                        <span className="font-bold text-gray-800">{row.activity}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500 italic border-l border-gray-100">{row.diy}</td>
                                <td className="px-6 py-4 bg-blue-50/20 text-blue-800 font-semibold border-l border-blue-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                        {row.pro}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="p-8 bg-gray-50 text-center border-t border-gray-200 flex flex-col items-center gap-4">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setViewMode('writer')}
                        className="bg-white text-gray-700 border border-gray-300 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                    >
                        Zpět k editoru
                    </button>
                    <button 
                        className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2"
                        onClick={() => alert('Poptávka byla odeslána. Brzy vás budeme kontaktovat!')}
                    >
                        Chci Plný Servis
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Konzultace zdarma • Rychlé nasazení • Prokazatelné výsledky</p>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 h-full flex flex-col items-center justify-start overflow-hidden font-sans">
            <div className="w-full max-w-5xl h-full flex flex-col">
                {/* Header & Toggle */}
                <div className="text-center mb-6 flex-shrink-0 relative">
                    <h1 className="text-4xl font-black italic tracking-tighter text-gray-900 flex items-center justify-center gap-3">
                        <span className="text-blue-600">G</span> SEO WRITER
                    </h1>
                    
                    <div className="flex justify-center mt-6">
                        <div className="bg-gray-200 p-1.5 rounded-2xl inline-flex shadow-inner border border-gray-300">
                            <button 
                                onClick={() => setViewMode('writer')}
                                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'writer' ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                ✍️ Writer Tool
                            </button>
                            <button 
                                onClick={() => setViewMode('comparison')}
                                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'comparison' ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                📊 Srovnání
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-grow flex gap-6 overflow-hidden">
                    {/* Main Content Area */}
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4 pb-12 custom-scrollbar">
                        {viewMode === 'comparison' ? (
                            <ComparisonTable />
                        ) : (
                            <>
                                {!articleContent && !isLoading && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl space-y-6 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                                            <div className="border-b border-gray-100 pb-4">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-1">Article Configuration</h3>
                                                <p className="text-xs text-gray-500">Provide parameters to optimize your SEO content generation.</p>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="main-keyword" className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Main Keyword / Topic*</label>
                                                    <input
                                                        type="text"
                                                        id="main-keyword"
                                                        value={keyword}
                                                        onChange={(e) => setKeyword(e.target.value)}
                                                        placeholder="e.g., 'sustainable gardening techniques'"
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label htmlFor="target-audience" className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Target Audience</label>
                                                        <input
                                                            type="text"
                                                            id="target-audience"
                                                            value={audience}
                                                            onChange={(e) => setAudience(e.target.value)}
                                                            placeholder="e.g., 'beginner gardeners'"
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="tone-of-voice" className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Tone of Voice</label>
                                                        <input
                                                            type="text"
                                                            id="tone-of-voice"
                                                            value={tone}
                                                            onChange={(e) => setTone(e.target.value)}
                                                            placeholder="e.g., 'professional but friendly'"
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="secondary-keywords" className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Secondary Keywords</label>
                                                    <input
                                                        type="text"
                                                        id="secondary-keywords"
                                                        value={secondaryKeywords}
                                                        onChange={(e) => setSecondaryKeywords(e.target.value)}
                                                        placeholder="e.g., 'composting, water conservation, organic fertilizer'"
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={handleGenerate} 
                                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-3" 
                                                    disabled={isLoading || !keyword.trim()}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                            Generating...
                                                        </>
                                                    ) : '✍️ Generate SEO Article'}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-blue-600/5 border border-blue-600/20 p-6 rounded-2xl flex items-center gap-4 group">
                                            <div className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-300">💡</div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-blue-700 mb-1">Pro Tip</p>
                                                <p className="text-xs text-blue-600/80 leading-relaxed">For the best results, include specific secondary keywords that represent long-tail search queries in your niche.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isLoading && (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-gray-200 shadow-inner">
                                        <div className="relative mb-8">
                                            <div className="w-24 h-24 border-4 border-blue-100 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center text-3xl">🖋️</div>
                                        </div>
                                        <h2 className="text-2xl font-black italic tracking-tighter text-gray-800 mb-2">Analyzing search patterns...</h2>
                                        <p className="text-sm text-gray-500 max-w-xs mx-auto">Gemini is synthesizing high-ranking content structures based on your requirements.</p>
                                    </div>
                                )}

                                {articleContent && !isLoading && (
                                    <div className="w-full animate-in zoom-in-95 duration-500">
                                        <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-50/90 backdrop-blur-md py-3 z-10 border-b border-gray-200 px-1">
                                             <div className="flex items-center gap-3">
                                                 <div className="bg-blue-600 text-white p-2 rounded-lg text-lg">📄</div>
                                                 <div>
                                                     <h2 className="text-lg font-black tracking-tight text-gray-900 leading-tight">
                                                         {keyword}
                                                     </h2>
                                                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Article Preview</p>
                                                 </div>
                                             </div>
                                             <div className="flex gap-3">
                                                <button onClick={copyToClipboard} className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
                                                    {copySuccess ? '✅ Copied' : '📋 Copy Text'}
                                                </button>
                                                 <button onClick={handleStartOver} className="bg-gray-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2">
                                                    Start New
                                                </button>
                                             </div>
                                        </div>
                                         <div className="p-10 bg-white border border-gray-200 rounded-2xl shadow-2xl min-h-[500px] prose prose-slate max-w-none">
                                           <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed selection:bg-blue-100">
                                               {articleContent}
                                           </div>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-start gap-4" role="alert">
                                        <span className="text-2xl">⚠️</span>
                                        <div>
                                            <strong className="font-black uppercase tracking-widest text-xs block mb-1">Generation Failed</strong>
                                            <span className="text-sm opacity-80">{error}</span>
                                            <button onClick={() => setError(null)} className="mt-4 text-xs font-bold underline block">Dismiss and retry</button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* History Sidebar */}
                    <div className="w-72 flex-shrink-0 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Recent Works</h3>
                            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black">{history.length}</span>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center p-6 opacity-30 grayscale">
                                    <p className="text-5xl mb-4">📜</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Your archive <br/> is currently empty</p>
                                </div>
                            ) : (
                                history.map((item) => (
                                    <div 
                                        key={item.id}
                                        onClick={() => loadFromHistory(item)}
                                        className="group relative bg-white border border-gray-100 p-4 rounded-xl cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-black text-gray-800 truncate pr-4">{item.keyword}</span>
                                            <button 
                                                onClick={(e) => deleteFromHistory(item.id, e)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all text-sm p-1"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] font-bold">
                                            <span className="text-gray-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                                            <span className="text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">{item.params.tone || 'Auto'}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {history.length > 0 && (
                            <button 
                                onClick={() => { if(confirm('Permanently clear all history?')) setHistory([]); }}
                                className="p-4 text-[10px] font-black text-red-400 bg-red-50/50 hover:bg-red-50 hover:text-red-600 transition-all uppercase tracking-[0.2em] border-t border-gray-100"
                            >
                                Clear Archive
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};
