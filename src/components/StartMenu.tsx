
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState, useMemo } from 'react';
import { APP_DEFINITIONS_CONFIG } from '../constants';
import { AppDefinition } from '../types';

interface StartMenuProps {
  isOpen: boolean;
  onAppOpen: (app: AppDefinition) => void;
  onClose: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onAppOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return APP_DEFINITIONS_CONFIG;
    return APP_DEFINITIONS_CONFIG.filter(app => 
      app.name.toLowerCase().includes(query) || 
      (app.category && app.category.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const pinnedApps = useMemo(() => {
    // Just pick the first 6 as "pinned" for now
    return APP_DEFINITIONS_CONFIG.slice(0, 6);
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="absolute bottom-16 left-4 w-[520px] h-[640px] bg-white/70 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] border border-white/40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 ring-1 ring-black/5"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search Header */}
      <div className="p-8 pb-4">
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">🔍</span>
          <input 
            type="text" 
            autoFocus
            placeholder="Search apps, settings, and files..." 
            className="w-full bg-white/50 border border-gray-200/50 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto px-8 py-4 custom-scrollbar">
        {searchQuery ? (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">Search Results</h3>
            <div className="grid grid-cols-4 gap-4">
              {filteredApps.map(app => (
                <AppIcon key={app.id} app={app} onClick={() => onAppOpen(app)} />
              ))}
              {filteredApps.length === 0 && (
                <div className="col-span-4 py-20 text-center opacity-30">
                  <span className="text-4xl mb-2 block">🔍</span>
                  <p className="text-xs font-bold uppercase">No matches found</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned Section */}
            <div>
              <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Pinned</h3>
                <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">All Apps ›</button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {pinnedApps.map(app => (
                  <AppIcon key={app.id} app={app} onClick={() => onAppOpen(app)} />
                ))}
              </div>
            </div>

            {/* Recommended Section (Static Mock) */}
            <div>
              <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Recommended</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                    { name: 'Recent Project.docx', icon: '📝', date: '2h ago' },
                    { name: 'Financials_Q4.xlsx', icon: '📊', date: '5h ago' },
                    { name: 'Brand_Assets.zip', icon: '📁', date: 'Yesterday' },
                    { name: 'Meeting_Notes.txt', icon: '🗒️', date: 'Yesterday' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/40 cursor-pointer transition-all border border-transparent hover:border-white/50">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">{item.icon}</div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-700 truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{item.date}</p>
                        </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Profile Bar */}
      <div className="p-4 bg-gray-50/50 backdrop-blur-md border-t border-white/20 flex items-center justify-between px-8">
        <div className="flex items-center gap-3 py-2">
          <div className="w-10 h-10 rounded-full bg-blue-600 border border-white flex items-center justify-center text-white font-black shadow-lg">G</div>
          <div className="text-left">
            <p className="text-xs font-black text-gray-800">Gemini User</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Administrator</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button className="p-2 hover:bg-white/80 rounded-xl transition-all group" title="Lock">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-gray-900"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-xl transition-all group" title="Shut Down">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-rose-600"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
            </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
};

const AppIcon: React.FC<{ app: AppDefinition; onClick: () => void }> = ({ app, onClick }) => {
    const isImage = app.icon.startsWith('http') || app.icon.startsWith('data:');
    return (
        <button 
          onClick={onClick}
          className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-white/50 transition-all group active:scale-90"
        >
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm border border-gray-100/50 group-hover:scale-110 transition-transform group-hover:shadow-xl group-hover:shadow-blue-500/10">
                {isImage ? <img src={app.icon} alt="" className="w-8 h-8 object-contain" /> : app.icon}
            </div>
            <span className="text-[10px] font-bold text-gray-600 text-center leading-tight line-clamp-2 max-w-[70px] group-hover:text-gray-900 transition-colors uppercase tracking-tighter">
                {app.name}
            </span>
        </button>
    );
};
