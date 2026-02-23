
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState, useEffect, useRef } from 'react';

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  type: 'payment' | 'deposit';
  category: string;
}

export const Wallet: React.FC = () => {
  const [balance, setBalance] = useState(2450.75);
  const [view, setView] = useState<'home' | 'scan' | 'confirm' | 'success'>('home');
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', merchant: 'Whole Foods Market', amount: -84.20, date: 'Today', type: 'payment', category: 'Groceries' },
    { id: '2', merchant: 'Direct Deposit - Tech Corp', amount: 3200.00, date: 'Yesterday', type: 'deposit', category: 'Salary' },
    { id: '3', merchant: 'Starbucks Coffee', amount: -5.40, date: 'Yesterday', type: 'payment', category: 'Food & Drink' },
    { id: '4', merchant: 'Uber Trip', amount: -14.50, date: 'Oct 24', type: 'payment', category: 'Transport' },
  ]);
  
  const [connectedBanks, setConnectedBanks] = useState<string[]>([]);
  const [paysafecardBalance, setPaysafecardBalance] = useState<number>(0);

  const handleConnectBank = () => {
    alert('Simulating connection to a new bank... (In a real app, this would involve OAuth)');
    setConnectedBanks(prev => [...prev, `Bank ${prev.length + 1}`]);
  };

  const handleAddPaysafecard = () => {
    const pin = prompt('Enter Paysafecard PIN (e.g., 1234-5678-9012-3456):');
    if (pin && pin.length === 19) { // Basic validation
      alert('Simulating Paysafecard top-up... (In a real app, this would validate PIN)');
      setPaysafecardBalance(prev => prev + 50); // Simulate adding 50 units
    } else if (pin) {
      alert('Invalid PIN format. Please enter a 16-digit PIN with hyphens.');
    }
  };
  
  const [scanStatus, setScanStatus] = useState<string>('Align QR code within frame');
  const [detectedMerchant, setDetectedMerchant] = useState<{name: string, amount: number} | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up stream on unmount or view change
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    setView('scan');
    setScanStatus('Initializing camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setScanStatus('Scanning...');
      
      // Simulate detection after 2 seconds
      setTimeout(() => {
        setDetectedMerchant({
          name: 'Blue Bottle Coffee',
          amount: 6.50
        });
        setView('confirm');
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
      }, 2500);

    } catch (err) {
      // Camera access denied or not available. Handle gracefully without logging as an error.
      setScanStatus('Camera access denied. Simulating scan...');
      // Fallback simulation
      setTimeout(() => {
        setDetectedMerchant({
          name: 'Blue Bottle Coffee',
          amount: 6.50
        });
        setView('confirm');
      }, 2000);
    }
  };

  const handlePayment = () => {
    if (!detectedMerchant) return;
    
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      merchant: detectedMerchant.name,
      amount: -detectedMerchant.amount,
      date: 'Just now',
      type: 'payment',
      category: 'Food & Drink'
    };
    
    setBalance(prev => prev - detectedMerchant.amount);
    setTransactions(prev => [newTransaction, ...prev]);
    setView('success');
    
    setTimeout(() => {
      setView('home');
      setDetectedMerchant(null);
    }, 2000);
  };

  const handleCancelScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setView('home');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="h-full w-full bg-gray-50 flex flex-col font-sans overflow-hidden relative">
      
      {/* Top Bar */}
      <div className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">W</div>
          <span className="font-bold text-gray-800 text-lg">G Wallet</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
           <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto relative">
        {view === 'home' && (
          <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Card Section */}
            <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-xl transform transition-transform hover:scale-[1.01]">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700"></div>
              {/* Abstract Patterns */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full translate-y-1/4 -translate-x-1/4 blur-xl"></div>
              
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-lg tracking-wider">G Platinum</span>
                  <span className="italic font-serif font-black opacity-80">VISA</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs opacity-70 uppercase tracking-widest">Current Balance</p>
                  <p className="text-3xl font-bold tracking-tight">{formatCurrency(balance)}</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="font-mono text-sm opacity-80">•••• •••• •••• 4288</p>
                  <p className="text-xs opacity-70">EXP 12/28</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-4 gap-4">
              <button 
                onClick={startScanning}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                  📷
                </div>
                <span className="text-xs font-bold text-blue-700">Scan to Pay</span>
              </button>
              
              {[
                { icon: '💸', label: 'Send' },
                { icon: '📥', label: 'Request' },
                { icon: '💳', label: 'Cards' },
              ].map((action) => (
                <button 
                  key={action.label}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center text-xl shadow-sm">
                    {action.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-600">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Connected Banks */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Connected Banks</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                {connectedBanks.length === 0 ? (
                  <p className="p-4 text-gray-500 text-sm">No banks connected.</p>
                ) : (
                  connectedBanks.map((bank, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <p className="font-bold text-sm text-gray-900">{bank}</p>
                      <span className="text-xs text-green-600">Connected</span>
                    </div>
                  ))
                )}
                <button 
                  onClick={handleConnectBank}
                  className="w-full bg-gray-50 text-blue-600 py-3 rounded-b-2xl font-bold text-sm hover:bg-gray-100 transition-colors"
                >
                  Connect a Bank
                </button>
              </div>
            </div>

            {/* Paysafecard */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Paysafecard</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                  <p className="font-bold text-sm text-gray-900">Current Balance</p>
                  <span className="font-bold text-sm text-gray-900">{formatCurrency(paysafecardBalance)}</span>
                </div>
                <button 
                  onClick={handleAddPaysafecard}
                  className="w-full bg-gray-50 text-blue-600 py-3 rounded-b-2xl font-bold text-sm hover:bg-gray-100 transition-colors"
                >
                  Add Paysafecard
                </button>
              </div>
            </div>

            {/* Transactions */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Recent Activity</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {tx.category === 'Groceries' ? '🛒' : 
                         tx.category === 'Food & Drink' ? '☕' : 
                         tx.category === 'Transport' ? '🚗' : 
                         tx.type === 'deposit' ? '💰' : '🛍️'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{tx.merchant}</p>
                        <p className="text-xs text-gray-500">{tx.date} • {tx.category}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${tx.type === 'deposit' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'deposit' ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'scan' && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
            <div className="relative w-full h-full flex flex-col">
               <video 
                 ref={videoRef} 
                 autoPlay 
                 playsInline 
                 className="absolute inset-0 w-full h-full object-cover"
               />
               
               {/* Overlay */}
               <div className="absolute inset-0 bg-black/30 flex flex-col items-center">
                  <div className="mt-20 text-white font-bold text-lg drop-shadow-md">{scanStatus}</div>
                  
                  {/* Scanner Frame */}
                  <div className="relative mt-auto mb-auto w-64 h-64 border-2 border-white/50 rounded-3xl overflow-hidden shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
                     <div className="absolute inset-0 border-[3px] border-transparent border-t-blue-500/80 border-r-blue-500/80 rounded-tr-3xl w-16 h-16 right-0 top-0"></div>
                     <div className="absolute inset-0 border-[3px] border-transparent border-t-blue-500/80 border-l-blue-500/80 rounded-tl-3xl w-16 h-16 left-0 top-0"></div>
                     <div className="absolute inset-0 border-[3px] border-transparent border-b-blue-500/80 border-r-blue-500/80 rounded-br-3xl w-16 h-16 right-0 bottom-0"></div>
                     <div className="absolute inset-0 border-[3px] border-transparent border-b-blue-500/80 border-l-blue-500/80 rounded-bl-3xl w-16 h-16 left-0 bottom-0"></div>
                     
                     <div className="w-full h-1 bg-red-500/80 absolute top-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>

                  <button 
                    onClick={handleCancelScan}
                    className="mb-12 px-8 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white font-bold hover:bg-white/30 transition-all"
                  >
                    Cancel
                  </button>
               </div>
            </div>
            <style>{`
              @keyframes scan {
                0% { top: 10%; opacity: 0; }
                25% { opacity: 1; }
                75% { opacity: 1; }
                100% { top: 90%; opacity: 0; }
              }
            `}</style>
          </div>
        )}

        {view === 'confirm' && detectedMerchant && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-end z-50 animate-in fade-in duration-300">
             <div className="bg-white w-full rounded-t-3xl p-8 pb-12 animate-in slide-in-from-bottom duration-300">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
                <div className="text-center mb-8">
                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                     ☕
                   </div>
                   <h2 className="text-2xl font-bold text-gray-900">{detectedMerchant.name}</h2>
                   <p className="text-gray-500 text-sm">Payment Request</p>
                </div>

                <div className="flex justify-between items-center py-4 border-y border-gray-100 mb-8">
                   <span className="text-gray-600 font-medium">Total Amount</span>
                   <span className="text-3xl font-bold text-gray-900">{formatCurrency(detectedMerchant.amount)}</span>
                </div>

                <div className="space-y-3">
                   <button 
                     onClick={handlePayment}
                     className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
                   >
                     Confirm Payment
                   </button>
                   <button 
                     onClick={handleCancelScan}
                     className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all"
                   >
                     Decline
                   </button>
                </div>
             </div>
          </div>
        )}

        {view === 'success' && (
          <div className="absolute inset-0 bg-green-500 flex flex-col items-center justify-center z-50 animate-in fade-in duration-300 text-white">
             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 animate-[bounce_0.5s_ease-out]">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                </svg>
             </div>
             <h2 className="text-3xl font-bold mb-2">Payment Sent!</h2>
             <p className="opacity-90">{formatCurrency(detectedMerchant?.amount || 0)} to {detectedMerchant?.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};
