
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState } from 'react';
import { generateKeywordIdeas, KeywordData } from '../services/geminiService';

export const KeywordResearcher: React.FC = () => {
    const [seedKeyword, setSeedKeyword] = useState('');
    const [results, setResults] = useState<KeywordData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<keyof KeywordData>('vol');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSearch = async (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        if (!seedKeyword.trim()) return;

        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            const data = await generateKeywordIdeas(seedKeyword);
            setResults(data);
        } catch (err: any) {
            setError(err.message || 'Failed to retrieve keyword data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSort = (field: keyof KeywordData) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedResults = [...results].sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        
        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
    });

    const exportToCSV = () => {
        const headers = ['Keyword', 'Volume', 'CPC', 'Difficulty', 'Competition'];
        const csvContent = [
            headers.join(','),
            ...sortedResults.map(row => `${row.keyword},${row.vol},${row.cpc},${row.difficulty},${row.competition}`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `keywords_${seedKeyword.replace(/\s+/g, '_')}.csv`;
        link.click();
    };

    /**
     * Professional SVG Sparkline Component
     */
    const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
        if (!data || data.length === 0) return null;
        
        const width = 80;
        const height = 24;
        const padding = 2;
        
        // Scale data points to SVG coordinates
        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
            // Invert y because SVG y=0 is at the top
            const y = height - ((val / 100) * (height - padding * 2) + padding);
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="flex flex-col items-center justify-center w-20 h-8">
                <svg width={width} height={height} className="overflow-visible">
                    {/* Background path for subtle fill */}
                    <path
                        d={`M ${padding},${height} L ${points} L ${width - padding},${height} Z`}
                        fill="rgba(37, 99, 235, 0.1)"
                    />
                    {/* Main sparkline */}
                    <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                    />
                    {/* Last point indicator */}
                    <circle
                        cx={(data.length - 1) / (data.length - 1) * (width - padding * 2) + padding}
                        cy={height - ((data[data.length - 1] / 100) * (height - padding * 2) + padding)}
                        r="2"
                        fill="#2563eb"
                    />
                </svg>
            </div>
        );
    };

    const DifficultyMeter: React.FC<{ score: number }> = ({ score }) => {
        let color = 'bg-green-500';
        if (score > 30) color = 'bg-yellow-500';
        if (score > 70) color = 'bg-red-500';

        return (
            <div className="flex items-center gap-2">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${score}%` }}></div>
                </div>
                <span className="text-xs font-bold text-gray-600">{score}</span>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans text-gray-800">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text-lg font-bold">K</div>
                    <h1 className="text-xl font-medium text-gray-700">Keyword Planner <span className="text-xs text-gray-400 font-normal">powered by Google Ads™ Logic</span></h1>
                </div>
                {results.length > 0 && (
                    <button 
                        onClick={exportToCSV}
                        className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded border border-transparent hover:border-blue-100 transition-colors"
                    >
                        ⬇ Export .CSV
                    </button>
                )}
            </header>

            {/* Search Bar */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discover new keywords</label>
                    <div className="flex shadow-sm rounded-md">
                        <input 
                            type="text" 
                            className="flex-grow min-w-0 block w-full px-4 py-3 rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Enter products or services closely related to your business"
                            value={seedKeyword}
                            onChange={(e) => setSeedKeyword(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !seedKeyword}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Loading...' : 'Get Results'}
                        </button>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">🌐 Location: United States</span>
                        <span className="flex items-center gap-1">🗣️ Language: English</span>
                        <span className="flex items-center gap-1">📅 Date range: Last 12 months</span>
                    </div>
                </form>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-auto bg-white relative">
                {error && (
                    <div className="p-8 text-center">
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-block">{error}</div>
                    </div>
                )}

                {!isLoading && !error && results.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                        <div className="text-6xl mb-4 opacity-20">📊</div>
                        <p className="text-lg font-medium">Enter a keyword to see volume and forecast data.</p>
                    </div>
                )}

                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-600 font-medium">Gathering forecast data...</p>
                    </div>
                )}

                {results.length > 0 && (
                    <div className="min-w-full inline-block align-middle">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-2 flex justify-between items-center text-xs text-gray-500">
                            <span>{results.length} keywords available</span>
                            <span>Currency: USD</span>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('vol')}
                                    >
                                        Avg. Monthly Searches {sortField === 'vol' && (sortDirection === 'desc' ? '↓' : '↑')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last 6 Months Trend
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('difficulty')}
                                    >
                                        Difficulty (KD)
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('cpc')}
                                    >
                                        Top of page bid (high)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedResults.map((row) => (
                                    <tr key={row.keyword} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {row.keyword}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {row.vol.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Sparkline data={row.trend} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <DifficultyMeter score={row.difficulty || 0} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            ${row.cpc.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
