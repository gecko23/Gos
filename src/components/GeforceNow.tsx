
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState, useEffect, useRef } from 'react';

interface Game {
  id: string;
  title: string;
  poster: string;
  category: string;
  developer: string;
  heroImage: string;
}

const GAMES: Game[] = [
  { id: '1', title: 'Cyberpunk 2077', category: 'RPG', developer: 'CD PROJEKT RED', poster: '🌇', heroImage: 'https://images.unsplash.com/photo-1605898835373-02f740d05d18?q=80&w=2070&auto=format&fit=crop' },
  { id: '2', title: 'Apex Legends', category: 'Shooter', developer: 'Respawn', poster: '🎖️', heroImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop' },
  { id: '3', title: 'The Witcher 3', category: 'Adventure', developer: 'CD PROJEKT RED', poster: '⚔️', heroImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop' },
  { id: '4', title: 'Fortnite', category: 'Battle Royale', developer: 'Epic Games', poster: '🧱', heroImage: 'https://images.unsplash.com/photo-1509194390444-8828de8485ec?q=80&w=1974&auto=format&fit=crop' },
  { id: '5', title: 'Genshin Impact', category: 'Adventure', developer: 'miHoYo', poster: '✨', heroImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1968&auto=format&fit=crop' },
  { id: '6', title: 'Destiny 2', category: 'Shooter', developer: 'Bungie', poster: '🌌', heroImage: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop' },
  { id: '7', title: 'Portal 2', category: 'Puzzle', developer: 'Valve', poster: '🌀', heroImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop' },
  { id: '8', title: 'Dying Light 2', category: 'Action', developer: 'Techland', poster: '🧟', heroImage: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=2076&auto=format&fit=crop' },
];

export const GeforceNow: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);
  const streamTimeoutRef = useRef<number | null>(null);

  const filteredGames = GAMES.filter(game => 
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLaunch = (game: Game) => {
    setSelectedGame(game);
    setIsLaunching(true);
    setLaunchStep(0);
  };

  const stopStream = () => {
    setIsStreaming(false);
    setIsLaunching(false);
    setSelectedGame(null);
  };

  useEffect(() => {
    if (isLaunching && !isStreaming) {
      const steps = [
        'Checking network connection...', 
        'Allocating RTX 4080 Rig...', 
        'Initializing cloud environment...', 
        'Synchronizing game data...',
        'Handshaking with host...'
      ];
      
      const interval = window.setInterval(() => {
        setLaunchStep(prev => {
          if (prev >= steps.length - 1) {
            window.clearInterval(interval);
            streamTimeoutRef.current = window.setTimeout(() => {
              setIsLaunching(false);
              setIsStreaming(true);
            }, 800);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
      return () => {
        window.clearInterval(interval);
        if (streamTimeoutRef.current) window.clearTimeout(streamTimeoutRef.current);
      };
    }
  }, [isLaunching, isStreaming]);

  const launchSteps = [
    'Checking network connection...', 
    'Allocating RTX 4080 Rig...', 
    'Initializing cloud environment...', 
    'Synchronizing game data...',
    'Handshaking with host...'
  ];

  if (isStreaming) {
    return (
      <div className="h-full w-full bg-black relative flex flex-col items-center justify-center animate-in fade-in duration-700">
        {/* Mock Stream Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm scale-105"
          style={{ backgroundImage: `url(${selectedGame?.heroImage})` }}
        />
        
        {/* Stream Interface */}
        <div className="relative z-10 w-full h-full flex flex-col">
          {/* Overlay Top Bar */}
          <div className="p-4 flex justify-between items-start opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-4">
              <div className="bg-zinc-900 border border-zinc-700 px-3 py-1 rounded text-[10px] font-bold text-zinc-400">
                1080p | 120 FPS | 14ms
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#76b900]">
                <span className="w-2 h-2 rounded-full bg-[#76b900] animate-pulse"></span>
                STREAMING: {selectedGame?.title}
              </div>
            </div>
            <button 
              onClick={stopStream}
              className="bg-white/10 hover:bg-rose-600/20 hover:text-rose-500 px-4 py-1.5 rounded text-[10px] font-bold transition-all border border-white/10"
            >
              QUIT SESSION
            </button>
          </div>

          <div className="flex-grow flex items-center justify-center">
             <div className="text-center group">
                <div className="text-8xl mb-4 group-hover:scale-110 transition-transform duration-500">
                  {selectedGame?.poster}
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter mb-2 drop-shadow-2xl">
                  {selectedGame?.title.toUpperCase()}
                </h1>
                <p className="text-zinc-400 font-mono text-xs tracking-[0.2em]">PRESS [START] TO BEGIN SESSION</p>
                <div className="mt-8 flex justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-[#76b900] border-t-transparent animate-spin"></div>
                </div>
             </div>
          </div>

          {/* Overlay Bottom Controls */}
          <div className="p-6 flex justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 to-transparent">
             <div className="flex items-center gap-8 bg-zinc-900/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/5">
                <button className="text-zinc-400 hover:text-[#76b900] transition-colors">🎤</button>
                <button className="text-zinc-400 hover:text-[#76b900] transition-colors">📷</button>
                <div className="w-px h-4 bg-zinc-700"></div>
                <button className="text-zinc-400 hover:text-[#76b900] transition-colors">⚙️</button>
                <button className="text-zinc-400 hover:text-[#76b900] transition-colors">💬</button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden select-none relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#76b90022,_transparent_70%)] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => { setSearchTerm(''); setSelectedGame(null); }}>
            <div className="w-8 h-8 bg-[#76b900] rounded flex items-center justify-center font-black text-black italic text-xl shadow-[0_0_15px_#76b90044] group-hover:scale-105 transition-transform">N</div>
            <span className="font-black tracking-tighter text-lg uppercase italic text-zinc-100">GeForce <span className="text-[#76b900]">NOW</span></span>
          </div>
          <div className="hidden lg:flex gap-8 text-[11px] font-black uppercase tracking-widest text-zinc-500">
            <button className="text-zinc-100 border-b-2 border-[#76b900] pb-5 translate-y-2.5">Storefront</button>
            <button className="hover:text-white transition-colors pb-5 translate-y-2.5">Library</button>
            <button className="hover:text-white transition-colors pb-5 translate-y-2.5">Ultimate Rig</button>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#76b900] transition-colors">🔍</span>
            <input 
              type="text" 
              placeholder="Search games, genres, publishers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900/50 border border-white/5 rounded-full py-2.5 pl-11 pr-5 text-xs w-80 focus:ring-1 focus:ring-[#76b900] focus:bg-zinc-900 outline-none transition-all placeholder:text-zinc-700"
            />
          </div>
          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            <button className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-sm transition-colors border border-white/5">⚙️</button>
            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#76b900]">Ultimate</p>
                  <p className="text-[9px] text-zinc-500">Rig Status: OK</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center text-xs font-black shadow-lg">JD</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-grow overflow-y-auto custom-scrollbar relative">
        {/* Hero Section (only when not searching) */}
        {!searchTerm && (
          <div className="relative h-[480px] flex-shrink-0 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10"></div>
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-105"
              style={{ backgroundImage: `url(${GAMES[0].heroImage})` }}
            />
            <div className="relative z-20 h-full flex flex-col justify-end px-16 pb-20 gap-4 max-w-2xl">
              <div className="flex items-center gap-3">
                 <span className="bg-[#76b900] text-black font-black text-[9px] px-2 py-0.5 rounded uppercase">Featured</span>
                 <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.3em]">CD PROJEKT RED</span>
              </div>
              <h1 className="text-6xl font-black italic tracking-tighter leading-none mb-2 drop-shadow-2xl">CYBERPUNK <br/> 2077</h1>
              <p className="text-zinc-300 text-sm leading-relaxed font-medium opacity-80 mb-4">The ultimate cloud gaming experience. Full Ray Tracing, DLSS 3.5, and low-latency response powered by NVIDIA RTX 4080 clusters.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleLaunch(GAMES[0])}
                  className="bg-[#76b900] text-black px-10 py-3.5 rounded-sm font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_30px_#76b90033]"
                >
                  PLAY NOW
                </button>
                <button className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 px-8 py-3.5 rounded-sm font-black text-xs transition-all uppercase tracking-widest">
                  View Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Sections */}
        <div className="px-12 py-10 space-y-12">
          {/* Section: Top Picks */}
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-4">
              <span className="w-12 h-px bg-zinc-800"></span>
              Jump Back In
              <span className="w-2 h-2 rounded-full bg-[#76b900] animate-pulse"></span>
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {filteredGames.map(game => (
                <div 
                  key={game.id}
                  onClick={() => handleLaunch(game)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-zinc-900 rounded-lg overflow-hidden relative mb-3 shadow-2xl ring-1 ring-white/5 group-hover:ring-[#76b900]/50 transition-all duration-300 group-hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4 z-10">
                       <button className="w-full bg-[#76b900] text-black py-2.5 rounded font-black text-[10px] uppercase tracking-widest scale-95 group-hover:scale-100 transition-all">
                        Launch
                       </button>
                    </div>
                    <div 
                      className="w-full h-full bg-cover bg-center flex items-center justify-center text-7xl grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                      style={{ backgroundImage: `url(${game.heroImage})` }}
                    >
                      <div className="bg-black/40 backdrop-blur-sm w-full h-full flex items-center justify-center">
                        {game.poster}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xs font-black truncate group-hover:text-[#76b900] transition-colors uppercase tracking-tight">{game.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[9px] text-zinc-600 font-bold uppercase">{game.category}</p>
                    <span className="text-[8px] text-zinc-700 font-bold">RTX ON</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredGames.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-700 gap-6">
                <span className="text-6xl animate-bounce">💨</span>
                <div className="text-center">
                   <p className="font-black text-sm uppercase tracking-widest">No Matches Found</p>
                   <p className="text-xs mt-1">Try expanding your search or browse our genres.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Launching Simulation Overlay */}
      {isLaunching && !isStreaming && (
        <div className="absolute inset-0 z-[100] bg-[#050505]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
          <div className="mb-10 relative">
            <div className="w-32 h-32 border-4 border-[#76b900]/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-[#76b900] rounded-full animate-[spin_1s_linear_infinite]"></div>
            <div className="absolute inset-0 flex items-center justify-center text-5xl drop-shadow-[0_0_20px_#76b90044]">
              {selectedGame?.poster}
            </div>
          </div>
          
          <h2 className="text-3xl font-black italic tracking-tighter mb-1 text-zinc-100">
            LAUNCHING {selectedGame?.title.toUpperCase()}
          </h2>
          <p className="text-zinc-500 font-mono text-[10px] tracking-[0.3em] uppercase mb-10 h-4">
            {launchSteps[launchStep]}
          </p>
          
          <div className="w-80 h-1 bg-zinc-900 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#76b90033] to-transparent animate-[pulse_2s_infinite]"></div>
            <div 
              className="h-full bg-[#76b900] transition-all duration-700 shadow-[0_0_20px_#76b900aa]" 
              style={{ width: `${((launchStep + 1) / launchSteps.length) * 100}%` }}
            ></div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 max-w-sm w-full">
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-white/5 text-left">
               <p className="text-[9px] font-black text-[#76b900] uppercase mb-1">Latency</p>
               <p className="text-sm font-black text-white">12-14 MS</p>
            </div>
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-white/5 text-left">
               <p className="text-[9px] font-black text-[#76b900] uppercase mb-1">Stream</p>
               <p className="text-sm font-black text-white">4K @ 120</p>
            </div>
          </div>
          
          <button 
            onClick={() => { setIsLaunching(false); setSelectedGame(null); }}
            className="mt-12 text-zinc-700 hover:text-white text-[10px] font-bold uppercase tracking-[0.3em] transition-all border-b border-zinc-800 hover:border-white pb-1"
          >
            Abort Connection
          </button>
        </div>
      )}

      {/* Footer Status Bar */}
      <footer className="h-10 bg-black border-t border-white/5 flex items-center justify-between px-8 text-[9px] text-zinc-600 font-black uppercase tracking-widest z-50">
        <div className="flex gap-8 items-center">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#76b900] shadow-[0_0_5px_#76b900]"></span> SERVER: US-EAST-04 (RTX 4080)</span>
          <span className="flex items-center gap-2">BANDWIDTH: 450 MBPS</span>
        </div>
        <div className="flex gap-8 items-center">
          <span className="text-[#76b900] hidden md:inline">G-SYNC ACTIVATED</span>
          <span className="text-zinc-400">MEMBERSHIP: ULTIMATE TIER</span>
          <div className="w-px h-3 bg-zinc-800"></div>
          <span>© 2024 NVIDIA CORP</span>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #050505;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #76b900;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
