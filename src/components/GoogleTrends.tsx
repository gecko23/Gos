
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState, useEffect } from 'react';
import { generateTrendsAnalysis, TrendsResult } from '../services/geminiService';

const COLORS = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58'];

interface Location {
    id: string;
    name: string;
    flag: string;
}

const LOCATIONS: Location[] = [
    { id: 'US', name: 'United States', flag: '🇺🇸' },
    { id: 'WORLD', name: 'Worldwide', flag: '🌍' },
    { id: 'CZ', name: 'Czech Republic', flag: '🇨🇿' }
];

export const GoogleTrends: React.FC = () => {
    const [terms, setTerms] = useState<string[]>(['Taylor Swift', 'Kim Kardashian']);
    const [inputValue, setInputValue] = useState('');
    const [data, setData] = useState<TrendsResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0]);

    useEffect(() => {
        if (terms.length > 0) {
            handleSearch();
        }
    }, [selectedLocation]); // Refresh when location changes

    const handleSearch = async () => {
        if (terms.length === 0) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateTrendsAnalysis(terms, selectedLocation.name);
            setData(result);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch trends data. Please check your connection or API key.');
        } finally {
            setIsLoading(false);
        }
    };

    const addTerm = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && terms.length < 4) {
            const newTerms = [...terms, inputValue.trim()];
            setTerms(newTerms);
            setInputValue('');
            updateTrends(newTerms);
        }
    };

    const removeTerm = (termToRemove: string) => {
        const newTerms = terms.filter(t => t !== termToRemove);
        setTerms(newTerms);
        if (newTerms.length > 0) {
            updateTrends(newTerms);
        } else {
            setData(null);
        }
    };

    const updateTrends = async (currentTerms: string[]) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateTrendsAnalysis(currentTerms, selectedLocation.name);
            setData(result);
        } catch (e: any) {
            setError(e.message || 'Failed to update trend data.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLoc = LOCATIONS.find(l => l.id === e.target.value) || LOCATIONS[0];
        setSelectedLocation(newLoc);
        // Effect hook will trigger search
    };

    // Charting logic
    const renderChart = () => {
        if (!data || !data.timeline || data.timeline.length === 0) return null;

        const height = 300;
        const width = 800; // viewBox width
        const padding = 40;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding * 2;

        const xStep = graphWidth / (data.timeline.length - 1);

        const makePath = (term: string) => {
            return data.timeline.map((point, i) => {
                const x = padding + i * xStep;
                const val = Number(point[term] || 0);
                const y = height - padding - (val / 100) * graphHeight;
                return `${i===0?'M':'L'} ${x} ${y}`;
            }).join(' ');
        };

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(val => {
                     const y = height - padding - (val / 100) * graphHeight;
                     return (
                         <g key={val}>
                             <line x1={padding} y1={y} x2={width-padding} y2={y} stroke="#e0e0e0" strokeDasharray={val === 0 ? "" : "4 4"} />
                             <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#888">{val}</text>
                         </g>
                     )
                })}
                
                {/* X Axis Labels */}
                {data.timeline.map((point, i) => {
                    if (i % 2 !== 0 && i !== data.timeline.length - 1) return null; // skip some labels
                    const x = padding + i * xStep;
                    return (
                        <text key={i} x={x} y={height - 10} textAnchor="middle" fontSize="10" fill="#888">{point.date}</text>
                    );
                })}

                {/* Lines */}
                {terms.map((term, i) => (
                    <path 
                        key={term}
                        d={makePath(term)}
                        fill="none"
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ))}
            </svg>
        );
    };

    return (
       // JSX Structure mimicking Google Trends
       <div className="flex flex-col h-full bg-white font-sans overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
             <div className="flex items-center gap-2">
                 <span className="text-2xl">📈</span>
                 <span className="text-xl font-medium text-gray-500">Google <span className="font-bold text-gray-700">Trends</span></span>
             </div>
             <div className="flex items-center gap-4">
                 <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                    <div className="relative group">
                        <select 
                            value={selectedLocation.id} 
                            onChange={handleLocationChange}
                            className="appearance-none bg-transparent hover:bg-gray-100 rounded px-2 py-1 pr-6 cursor-pointer focus:outline-none font-medium text-gray-700"
                        >
                            {LOCATIONS.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.flag} {loc.name}</option>
                            ))}
                        </select>
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs">▼</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="ml-2">Past 12 months</span>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">G</div>
             </div>
          </div>

          {/* Search/Compare Bar */}
          <div className="bg-[#f8f9fa] px-6 py-6 border-b border-gray-200">
              <div className="max-w-4xl mx-auto">
                  <div className="flex flex-wrap gap-3 items-center">
                      {terms.map((term, i) => (
                          <div key={term} className="flex items-center gap-2 bg-white pl-3 pr-2 py-2 rounded shadow-sm border border-gray-200 animate-in fade-in zoom-in">
                              <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
                              <span className="text-sm font-medium text-gray-700">{term}</span>
                              <button onClick={() => removeTerm(term)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">✕</button>
                          </div>
                      ))}
                      
                      {terms.length < 4 && (
                          <form onSubmit={addTerm} className="flex-grow min-w-[200px]">
                              <input 
                                  type="text" 
                                  value={inputValue}
                                  onChange={(e) => setInputValue(e.target.value)}
                                  placeholder={terms.length > 0 ? "Compare another term..." : "Enter a search term"}
                                  className="w-full bg-white border border-gray-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                              />
                          </form>
                      )}
                  </div>
              </div>
          </div>

          {/* Content */}
          <div className="flex-grow p-6">
              <div className="max-w-4xl mx-auto space-y-8">
                  {/* Error Message */}
                  {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3" role="alert">
                          <span className="text-xl">⚠️</span>
                          <div>
                              <p className="font-bold text-sm">Unable to load data</p>
                              <p className="text-sm">{error}</p>
                              <button 
                                  onClick={() => handleSearch()} 
                                  className="mt-2 text-xs font-bold underline hover:text-red-900"
                              >
                                  Try Again
                              </button>
                          </div>
                      </div>
                  )}

                  {/* Chart Card */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 relative min-h-[300px]">
                      <h3 className="text-lg font-normal text-gray-800 mb-6">Interest over time</h3>
                      
                      <div className="w-full aspect-[2/1] bg-white relative">
                          {isLoading && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-[1px] transition-all duration-300">
                                  <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                                  <p className="text-sm font-medium text-gray-500 animate-pulse">Analyzing search patterns...</p>
                              </div>
                          )}
                          
                          {!isLoading && !error && !data && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                  <span className="text-4xl mb-2">📊</span>
                                  <p>Enter search terms to visualize trends</p>
                              </div>
                          )}

                          {!error && renderChart()}
                      </div>
                  </div>

                  {/* Related Queries Grid */}
                  {data?.related && !isLoading && !error && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          {terms.map((term, i) => (
                              <div key={term} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                      <span className="text-sm font-medium text-gray-600">Related queries for <strong>{term}</strong></span>
                                      <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
                                  </div>
                                  <div className="p-0">
                                      {data.related[term]?.map((item, idx) => (
                                          <div key={idx} className="flex justify-between items-center px-6 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                              <span className="text-sm text-gray-700">{idx + 1}. {item.query}</span>
                                              <span className="text-xs font-medium text-gray-500">{item.value}</span>
                                          </div>
                                      )) || (
                                          <div className="p-6 text-center text-gray-400 text-sm">No related data available</div>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
       </div>
    );
};
