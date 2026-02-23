
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Upgrade {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  baseCPS: number;
  icon: string;
}

const UPGRADES: Upgrade[] = [
  { id: 'rig_1', name: 'Basic Mining Rig', description: 'Repurposed GPUs in a crate.', basePrice: 15, baseCPS: 1, icon: '📼' },
  { id: 'server_1', name: 'Server Rack', description: 'Standard enterprise computing power.', basePrice: 100, baseCPS: 5, icon: '🏢' },
  { id: 'quantum_1', name: 'Quantum Node', description: 'Sub-atomic processing clusters.', basePrice: 1100, baseCPS: 22, icon: '🔮' },
  { id: 'neural_1', name: 'Neural Link Cluster', description: 'Distributed human-AI network.', basePrice: 12000, baseCPS: 115, icon: '🧠' },
  { id: 'dyson_1', name: 'Dyson Swarm Piece', description: 'Star-powered compute potential.', basePrice: 130000, baseCPS: 600, icon: '☀️' },
];

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  priceUSD: number;
}

const CRYPTOS: Crypto[] = [
  { id: 'gcoin', name: 'G-Coin', symbol: 'G', icon: '⚡', color: 'text-emerald-400', priceUSD: 1.25 },
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: 'text-orange-500', priceUSD: 64200 },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', color: 'text-blue-400', priceUSD: 3450 },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', icon: 'Ð', color: 'text-yellow-500', priceUSD: 0.16 },
];

interface InventoryState {
  [key: string]: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  value: number;
}

interface Transaction {
  id: string;
  amount: number;
  crypto: string;
  address: string;
  type: 'WITHDRAW' | 'DEPOSIT' | 'SWAP';
  timestamp: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
}

interface WalletBalances {
  [key: string]: number;
}

type WalletProvider = 'MetaMask' | 'Coinbase' | 'Phantom' | 'G-Wallet';

export const CTFarm: React.FC = () => {
  // Game State
  const [coins, setCoins] = useState<number>(0);
  const [inventory, setInventory] = useState<InventoryState>(
    UPGRADES.reduce((acc, curr) => ({ ...acc, [curr.id]: 0 }), {})
  );
  
  // Wallet State
  const [balances, setBalances] = useState<WalletBalances>(
    CRYPTOS.reduce((acc, curr) => ({ ...acc, [curr.symbol]: 1.5 }), {}) // Start with some small balances for demo
  );
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<WalletProvider | null>(null);
  const [targetAddress, setTargetAddress] = useState<string>('');
  
  // UI State
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto>(CRYPTOS[0]);
  const [isMining, setIsMining] = useState<boolean>(true);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'mining' | 'wallet'>('mining');
  
  const particleIdCounter = useRef(0);

  // Calculate current CPS
  const currentCPS = UPGRADES.reduce((acc, upgrade) => {
    return acc + (inventory[upgrade.id] * upgrade.baseCPS);
  }, 0);

  // Passive income tick - only if isMining is true
  useEffect(() => {
    if (!isMining) return;
    const timer = setInterval(() => {
      setCoins(prev => prev + (currentCPS / 10));
    }, 100);
    return () => clearInterval(timer);
  }, [currentCPS, isMining]);

  const handleManualClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const value = 1;
    setCoins(prev => prev + value);
    
    const newParticle = { id: particleIdCounter.current++, x, y, value };
    setParticles(prev => [...prev, newParticle]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);
  };

  const buyUpgrade = (upgrade: Upgrade) => {
    const price = Math.floor(upgrade.basePrice * Math.pow(1.15, inventory[upgrade.id]));
    if (coins >= price) {
      setCoins(prev => prev - price);
      setInventory(prev => ({ ...prev, [upgrade.id]: prev[upgrade.id] + 1 }));
    }
  };

  const initiateConnect = () => {
    setShowConnectModal(true);
  };

  const handleProviderSelect = (provider: WalletProvider) => {
    setSelectedProvider(provider);
    setIsProcessing(true);
    // Simulate connection delay
    setTimeout(() => {
      const mockAddr = provider === 'Phantom' 
        ? `${Math.random().toString(36).substr(2, 44)}`
        : `0x${Math.random().toString(16).substr(2, 40)}`;
      setWalletAddress(mockAddr);
      setTargetAddress(mockAddr);
      setIsConnected(true);
      setIsProcessing(false);
      setShowConnectModal(false);
    }, 1500);
  };

  const handleDeposit = () => {
    if (!isConnected) return;
    setIsProcessing(true);
    const depositAmount = selectedCrypto.id === 'doge' ? 1000 : 0.05;
    
    setTimeout(() => {
      setBalances(prev => ({
        ...prev,
        [selectedCrypto.symbol]: prev[selectedCrypto.symbol] + depositAmount
      }));
      
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        amount: depositAmount,
        crypto: selectedCrypto.symbol,
        address: walletAddress || 'EXTERNAL',
        type: 'DEPOSIT',
        status: 'CONFIRMED',
        timestamp: new Date().toLocaleTimeString(),
      };
      setTransactions(prev => [newTx, ...prev].slice(0, 15));
      setIsProcessing(false);
    }, 1200);
  };

  const handleWithdraw = () => {
    if (coins < 10) return;
    if (!targetAddress.trim()) {
      alert("Please enter a destination wallet address.");
      return;
    }
    
    setIsProcessing(true);
    const amountToWithdraw = Math.floor(coins);
    const destination = targetAddress;
    
    setTimeout(() => {
      setCoins(prev => prev - amountToWithdraw);
      setBalances(prev => ({
        ...prev,
        [selectedCrypto.symbol]: prev[selectedCrypto.symbol] + amountToWithdraw
      }));
      
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        amount: amountToWithdraw,
        crypto: selectedCrypto.symbol,
        address: destination,
        type: 'WITHDRAW',
        status: 'CONFIRMED',
        timestamp: new Date().toLocaleTimeString(),
      };
      setTransactions(prev => [newTx, ...prev].slice(0, 15));
      setIsProcessing(false);
    }, 1500);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setSelectedProvider(null);
  };

  return (
    <div className="h-full w-full bg-slate-900 text-slate-100 flex flex-col font-mono overflow-hidden select-none relative">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      
      {/* Top Header */}
      <div className="bg-slate-800/90 backdrop-blur-xl p-4 border-b border-emerald-500/20 flex justify-between items-center shadow-2xl z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
               <span className={`text-2xl ${isMining ? 'animate-pulse' : ''}`}>{selectedCrypto.icon}</span>
            </div>
            <div>
              <h1 className="text-white font-black text-lg tracking-tighter">CT FARM <span className="text-emerald-500 font-normal">v4.0</span></h1>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isMining ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{isMining ? 'Mining Active' : 'System Halted'}</span>
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700/50"></div>
          
          {/* Navigation Controls */}
          <div className="flex bg-slate-950/80 rounded-xl p-1 border border-slate-700/50 shadow-inner">
            <button 
              onClick={() => setActiveTab('mining')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeTab === 'mining' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <span className="text-sm">⛏️</span> SYNTHESIZER
            </button>
            <button 
              onClick={() => setActiveTab('wallet')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeTab === 'wallet' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <span className="text-sm">👛</span> WALLET
            </button>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {!isConnected ? (
            <button 
              onClick={initiateConnect}
              className="group bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all active:scale-95 flex items-center gap-2 border border-blue-400/30"
            >
              CONNECT WALLET
              <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {selectedProvider} Connected
                </div>
                <div className="text-slate-500 text-[9px] font-mono">{walletAddress?.substring(0, 12)}...{walletAddress?.substring(36)}</div>
              </div>
              <button 
                onClick={disconnectWallet}
                className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/50 transition-all text-slate-400 hover:text-rose-500"
                title="Disconnect Wallet"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">
        {/* Left Sidebar: Assets & Network */}
        <div className="w-80 bg-slate-800/20 border-r border-slate-800/50 p-4 flex flex-col gap-6 overflow-y-auto backdrop-blur-md">
          {/* Asset List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Asset Portfolio</h2>
              <button className="text-[9px] text-blue-400 hover:underline">Manage</button>
            </div>
            <div className="space-y-2">
              {CRYPTOS.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => setSelectedCrypto(c)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex justify-between items-center group relative overflow-hidden ${selectedCrypto.id === c.id ? 'bg-slate-700/40 border-emerald-500/30 shadow-lg' : 'bg-slate-900/40 border-transparent hover:border-slate-700'}`}
                >
                  <div className="flex items-center gap-3 z-10">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-950 text-lg border border-slate-800 group-hover:scale-110 transition-transform`}>
                      {c.icon}
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-slate-100 uppercase tracking-tighter">{c.name}</div>
                      <div className="text-[9px] text-slate-500 font-mono">{c.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right z-10">
                    <div className={`text-xs font-black ${c.color}`}>{balances[c.symbol].toLocaleString()}</div>
                    <div className="text-[8px] text-slate-600 font-mono">${(balances[c.symbol] * c.priceUSD).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                  </div>
                  {selectedCrypto.id === c.id && <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Network Health */}
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3 shadow-inner">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Network Status</h3>
            <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <span className="text-[9px] text-slate-500">Node Latency</span>
                 <span className="text-[9px] text-emerald-400 font-bold">12ms</span>
               </div>
               <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                 <div className="w-full h-full bg-emerald-500/40"></div>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[9px] text-slate-500">Validation Protocol</span>
                 <span className="text-[9px] text-blue-400 font-bold">POS v2.4</span>
               </div>
            </div>
          </div>

          {/* Log History */}
          <div className="flex-grow min-h-0 flex flex-col">
            <h2 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Network Feed</h2>
            <div className="space-y-2 overflow-y-auto flex-grow pr-1 custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-20 grayscale scale-75">
                  <span className="text-4xl mb-2">📜</span>
                  <p className="text-[10px] font-bold text-center">NO BROADCASTS DETECTED</p>
                </div>
              ) : (
                transactions.map(tx => (
                  <div key={tx.id} className="text-[10px] bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/50 group hover:bg-slate-900/50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-black tracking-tighter ${tx.type === 'DEPOSIT' ? 'text-blue-400' : 'text-emerald-400'}`}>
                        {tx.type === 'DEPOSIT' ? '📥 INCOMING' : '📤 OUTGOING'}
                      </span>
                      <span className="text-slate-600 text-[8px] font-mono">{tx.timestamp}</span>
                    </div>
                    <div className="text-[11px] font-black text-slate-300">
                        {tx.amount} {tx.crypto}
                    </div>
                    <div className="text-[8px] text-slate-600 truncate mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        REF: {tx.id}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="flex-grow flex flex-col items-center justify-center relative p-8">
          
          {activeTab === 'mining' ? (
            /* MINING INTERFACE */
            <div className="w-full max-w-2xl flex flex-col items-center animate-in fade-in duration-500">
              <div className="mb-12 text-center group">
                <div className={`${selectedCrypto.color} text-6xl font-black tracking-tighter transition-all group-hover:scale-105 duration-300`}>
                  {Math.floor(coins).toLocaleString()} <span className="text-2xl font-normal opacity-40 italic">{selectedCrypto.symbol}</span>
                </div>
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-3 opacity-60">
                   Synthetic Yield Reserve
                </div>
              </div>

              <div 
                onClick={handleManualClick}
                className="group relative cursor-pointer active:scale-95 transition-all duration-75"
              >
                {/* Core Synthesizer Orb */}
                <div className={`w-64 h-64 rounded-full bg-gradient-to-br from-emerald-500/20 via-blue-600/20 to-purple-600/20 p-2 flex items-center justify-center shadow-[0_0_100px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_120px_rgba(16,185,129,0.3)] transition-all duration-500 relative`}>
                  
                  {/* Rotating Rings */}
                  <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-[spin_15s_linear_infinite]"></div>
                  <div className="absolute inset-4 rounded-full border border-blue-500/10 animate-[spin_10s_linear_infinite_reverse]"></div>
                  <div className="absolute inset-8 rounded-full border border-purple-500/5 animate-[spin_25s_linear_infinite]"></div>

                  <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center gap-3 border border-slate-800 shadow-inner overflow-hidden relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.1),_transparent)]"></div>
                    <div className={`text-9xl drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500 relative ${isMining ? 'opacity-100 grayscale-0' : 'opacity-20 grayscale scale-90'}`}>
                      {selectedCrypto.icon}
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-[0.4em] relative transition-colors ${isMining ? 'text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-slate-700'}`}>
                        {isMining ? 'PROCESSING' : 'IDLE'}
                    </div>
                  </div>
                </div>
                
                {/* Click Particles */}
                {particles.map(p => (
                  <div 
                    key={p.id}
                    className="absolute text-emerald-400 font-black text-2xl pointer-events-none animate-[ping_1s_ease-out_forwards] -translate-y-16"
                    style={{ left: p.x, top: p.y }}
                  >
                    +{p.value}
                  </div>
                ))}
              </div>

              {/* Quick Actions Panel */}
              <div className="mt-20 w-full grid grid-cols-2 gap-6 max-w-lg">
                 <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50 backdrop-blur-md">
                   <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] font-black text-slate-500 uppercase">Miner State</span>
                     <button 
                        onClick={() => setIsMining(!isMining)}
                        className={`w-8 h-4 rounded-full relative transition-all ${isMining ? 'bg-emerald-500' : 'bg-slate-600'}`}
                     >
                       <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isMining ? 'left-4.5' : 'left-0.5'}`}></div>
                     </button>
                   </div>
                   <div className="text-xl font-black text-white">{isMining ? currentCPS.toFixed(1) : '0.0'} <span className="text-[10px] font-normal text-slate-500">CPS</span></div>
                 </div>

                 <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50 backdrop-blur-md">
                   <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] font-black text-slate-500 uppercase">Market Value</span>
                     <span className="text-[9px] text-emerald-400 font-bold">+2.4%</span>
                   </div>
                   <div className="text-xl font-black text-white">${selectedCrypto.priceUSD.toLocaleString()}</div>
                 </div>
              </div>
            </div>
          ) : (
            /* WALLET INTERFACE */
            <div className="w-full max-w-2xl animate-in zoom-in-95 fade-in duration-300">
               <div className="bg-slate-800/60 border border-slate-700/50 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                 <div className="p-10 border-b border-slate-700/50 bg-gradient-to-br from-blue-600/20 via-slate-800/0 to-emerald-600/20">
                   <div className="flex justify-between items-start mb-6">
                     <div>
                        <h2 className="text-3xl font-black tracking-tight mb-2">SAFE HARBOR</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60 italic">Decentralized Bridge Protocol</p>
                     </div>
                     <div className="bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-700 flex items-center gap-3">
                       <span className="text-xl">{selectedCrypto.icon}</span>
                       <span className="text-sm font-black">{selectedCrypto.symbol} HUB</span>
                     </div>
                   </div>

                   <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Balance</span>
                     <div className="text-5xl font-black tracking-tighter text-white">
                        {balances[selectedCrypto.symbol].toLocaleString()} <span className="text-xl font-normal opacity-30 italic">{selectedCrypto.symbol}</span>
                     </div>
                   </div>
                 </div>

                 <div className="p-10 space-y-10">
                   {/* Wallet Stats */}
                   <div className="grid grid-cols-3 gap-6">
                     {[
                       { label: 'Network', value: 'Mainnet-v4', color: 'text-blue-400' },
                       { label: 'Avg Fee', value: '0.001 G', color: 'text-emerald-400' },
                       { label: 'Confirmations', value: '1288', color: 'text-purple-400' }
                     ].map(stat => (
                       <div key={stat.label} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-700/50">
                         <div className="text-[9px] text-slate-500 font-black uppercase mb-1">{stat.label}</div>
                         <div className={`text-xs font-black ${stat.color}`}>{stat.value}</div>
                       </div>
                     ))}
                   </div>

                   {/* Transaction Forms */}
                   <div className="space-y-6">
                     <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transfer Destination</label>
                        <span className="text-[9px] text-slate-600 font-mono">Verified Node Address</span>
                     </div>
                     <div className="relative group">
                       <input 
                          type="text"
                          value={targetAddress}
                          onChange={(e) => setTargetAddress(e.target.value)}
                          placeholder="Paste recipient address or DNS..."
                          className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl px-5 py-4 text-xs font-mono text-emerald-400 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                         <button className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors">Scan</button>
                         <button onClick={() => setTargetAddress(walletAddress || '')} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors">Self</button>
                       </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6 pt-4">
                       <button 
                         onClick={handleDeposit}
                         disabled={!isConnected || isProcessing}
                         className="flex items-center justify-center gap-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 rounded-2xl py-6 transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                       >
                         <span className="text-3xl group-hover:-translate-y-1 transition-transform">📥</span>
                         <div className="text-left">
                            <span className="block text-[11px] font-black text-blue-400 uppercase tracking-widest">Bridge In</span>
                            <span className="block text-[8px] text-blue-500/60 font-bold">DEPOSIT ASSETS</span>
                         </div>
                       </button>

                       <button 
                         onClick={handleWithdraw}
                         disabled={coins < 10 || isProcessing || !targetAddress.trim()}
                         className="flex items-center justify-center gap-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 rounded-2xl py-6 transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                       >
                         <span className="text-3xl group-hover:translate-x-1 transition-transform">📤</span>
                         <div className="text-left">
                            <span className="block text-[11px] font-black text-emerald-400 uppercase tracking-widest">Bridge Out</span>
                            <span className="block text-[8px] text-emerald-500/60 font-bold">WITHDRAW ASSETS</span>
                         </div>
                       </button>
                     </div>
                   </div>
                 </div>

                 <div className="p-6 bg-slate-950/80 border-t border-slate-700/50 flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Active Gateway: P2P_CLUSTER_US_EAST</span>
                    <span className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                       Secured by AES-256
                    </span>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Upgrade Sidebar */}
        <div className="w-80 bg-slate-800/20 border-l border-emerald-500/10 flex flex-col overflow-y-auto p-4 gap-4 backdrop-blur-xl">
          <h2 className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-700/50 pb-3 flex justify-between items-center">
            Synthesis Units
            <span className="text-[8px] text-emerald-500 font-mono tracking-normal">LOAD: {(currentCPS * 2.5).toFixed(1)}%</span>
          </h2>
          {UPGRADES.map(upgrade => {
            const count = inventory[upgrade.id];
            const price = Math.floor(upgrade.basePrice * Math.pow(1.15, count));
            const canAfford = coins >= price;

            return (
              <button
                key={upgrade.id}
                onClick={() => buyUpgrade(upgrade)}
                disabled={!canAfford}
                className={`
                  group text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 relative
                  ${canAfford 
                    ? 'bg-slate-700/30 border-slate-700 hover:border-emerald-500/40 hover:bg-slate-700/50 shadow-sm' 
                    : 'bg-slate-900/20 border-transparent opacity-40 grayscale cursor-not-allowed'}
                `}
              >
                <div className="text-3xl bg-slate-950 w-12 h-12 flex items-center justify-center rounded-xl shadow-inner group-hover:scale-110 transition-transform border border-slate-800">
                  {upgrade.icon}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="font-black text-[10px] text-slate-100 uppercase tracking-tighter">{upgrade.name}</span>
                    <span className="text-[10px] font-black text-emerald-500">x{count}</span>
                  </div>
                  <div className="text-[8px] text-slate-500 font-bold uppercase leading-tight mb-2 opacity-60 group-hover:opacity-100 transition-opacity">{upgrade.description}</div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-black ${canAfford ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {price.toLocaleString()} {selectedCrypto.symbol}
                    </span>
                    <span className="text-[8px] text-slate-600 font-mono">+{upgrade.baseCPS} CPS</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Connection Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-[2rem] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black italic tracking-tighter text-white">BRIDGE TO...</h3>
              <button onClick={() => setShowConnectModal(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { name: 'MetaMask', icon: '🦊', color: 'hover:border-orange-500/50' },
                { name: 'Coinbase', icon: '🔵', color: 'hover:border-blue-500/50' },
                { name: 'Phantom', icon: '👻', color: 'hover:border-purple-500/50' },
                { name: 'G-Wallet', icon: '⚡', color: 'hover:border-emerald-500/50' }
              ].map(provider => (
                <button 
                  key={provider.name}
                  onClick={() => handleProviderSelect(provider.name as WalletProvider)}
                  className={`flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl transition-all ${provider.color} hover:bg-slate-800/50 group`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{provider.icon}</span>
                    <span className="text-sm font-black text-white">{provider.name}</span>
                  </div>
                  <span className="text-slate-700 group-hover:text-white transition-colors">→</span>
                </button>
              ))}
            </div>

            <p className="mt-8 text-[9px] text-slate-600 font-bold text-center uppercase tracking-widest leading-relaxed">
              BY CONNECTING, YOU AGREE TO THE <br/>
              <span className="text-blue-500 hover:underline cursor-pointer">SYNTHESIS SERVICE PROTOCOLS</span>
            </p>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-[110] bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-emerald-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
              {selectedCrypto.icon}
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-emerald-500 font-black tracking-[0.4em] animate-pulse text-sm">ENCRYPTING DATASTREAM</p>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Validating Block Signature...</p>
          </div>
          
          <div className="mt-12 w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      )}

      {/* Global Status Bar */}
      <footer className="bg-slate-950 border-t border-slate-800 p-2.5 px-6 text-[9px] font-black text-slate-600 flex justify-between items-center z-30 uppercase tracking-[0.1em]">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> GRID-ALPHA: ONLINE</span>
          <span>LATENCY: 14MS</span>
          <span>LOAD: {Math.floor(Math.random() * 20 + 40)}%</span>
        </div>
        <div className="flex gap-4">
          <span className="text-blue-500/80">GEMINI_SECURE_NODE_V4</span>
          <span className="text-slate-800">|</span>
          <span className="text-slate-500 italic">Blockchain Verified</span>
        </div>
      </footer>

      <style>{`
        @keyframes ping {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(1.8); opacity: 0; }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};
