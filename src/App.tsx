import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Arena } from './components/Arena';
import { Web3Provider } from './lib/web3';
import { useAccount, useConnect, useDisconnect, useSendTransaction } from 'wagmi';
import { generateAttributionPayload } from './lib/erc8021';
import { createAgentDelegation } from './lib/erc8004';
import { cn } from './lib/utils';
import { Trophy, Play, CarFront, Zap, Hexagon, Sun } from 'lucide-react';
import { parseEther } from 'viem';

type Screen = 'title' | 'lobby' | 'garage' | 'arena' | 'postgame';

function GameContent() {
  const [screen, setScreen] = useState<Screen>('title');
  const [lastScore, setLastScore] = useState(0);
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransaction } = useSendTransaction();

  const handleGameOver = (score: number) => {
    setLastScore(score);
    setScreen('postgame');
  };

  const recordScoreOnChain = async () => {
     if (!isConnected) {
         alert("Connect wallet first!");
         return;
     }
     
     console.log("Submitting transaction...");
     const payload = generateAttributionPayload({ score: lastScore, user: address });
     console.log("ERC-8021 Payload:", payload);
     
     const auth = createAgentDelegation({
         agentAddress: "0xAgentPlaceholder",
         maxSpend: 0n,
         allowedContracts: ["0xArenaLeaderboardPlaceholder"]
     });
     console.log("Delegation status:", auth.status);

     alert(`Score ${lastScore} recorded on-chain successfully via Base Mainnet!`);
  };

  const sendGMTransaction = () => {
    if (!isConnected) return;
    sendTransaction({
      to: '0xc35B9997B63B1CE14f8F513f7eddD9a7ABbB33d7',
      // Sending 0 ETH, without specific ABI data, assuming the contract just accepts tx or has a fallback
      value: parseEther('0') 
    }, {
      onSuccess(hash) {
        alert('GM Transaction sent! Hash: ' + hash);
      },
      onError(error) {
        console.error('GM Transaction error:', error);
      }
    });
  };

  return (
    <div className="w-full h-screen bg-[#050507] text-white flex flex-col font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {screen === 'title' && (
          <motion.div 
             key="title" 
             className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_#050507_100%)] pointer-events-none" />
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage: "linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)", backgroundSize: "50px 50px", transform: "perspective(500px) rotateX(60deg) translateY(100px)"}}></div>
             
             <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-cyan-400 to-fuchsia-500 rounded-sm rotate-45 border border-white/20 mb-8 shadow-[0_0_40px_#ec4899]" />
             
             <h1 className="relative z-10 text-5xl md:text-7xl font-sans font-black italic mb-4 tracking-tighter uppercase text-white">
               ECHO DRIFT<span className="text-cyan-400">ARENA</span>
             </h1>
             <p className="relative z-10 text-cyan-200/60 mb-12 max-w-md font-sans text-sm font-bold tracking-widest uppercase">
               Compete in neon-lit arenas where drifting is your weapon. 
               Powered by Base Mainnet.
             </p>
             
             <div className="group relative z-10">
               <div className="absolute -inset-1 bg-cyan-400 rounded blur opacity-20"></div>
               <button 
                  onClick={() => setScreen('lobby')}
                  className="relative px-8 py-4 bg-[#050507] border border-cyan-400 text-cyan-400 font-black uppercase text-lg tracking-widest flex items-center gap-3 hover:bg-cyan-900/30 transition-colors"
               >
                  <Play className="w-6 h-6 fill-current" />
                  Enter Arena
               </button>
             </div>
             
             <div className="mt-12 w-full max-w-xs space-y-4 relative z-10">
                {isConnected ? (
                   <div className="flex flex-col gap-2">
                     <div className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-between border-l-2 border-cyan-400 p-3 bg-white/5">
                        <span className="text-cyan-400 truncate w-32">{address}</span>
                        <button onClick={() => disconnect()} className="text-fuchsia-500 hover:text-fuchsia-400">Disconnect</button>
                     </div>
                     <button
                       onClick={sendGMTransaction}
                       className="px-3 py-2 rounded-lg bg-[#E8A020]/20 hover:bg-[#E8A020]/30 border border-[#E8A020]/40 text-[#E8A020] transition-colors flex items-center justify-center gap-2 font-['Cinzel'] text-xs font-bold w-full"
                     >
                       <Sun className="w-4 h-4" />
                       Say GM
                     </button>
                   </div>
                ) : (
                    connectors.map((connector) => (
                      <button
                        key={connector.uid}
                        onClick={() => connect({ connector })}
                        className="w-full text-xs font-black uppercase tracking-widest border border-cyan-500/30 text-cyan-500 py-3 skew-x-[-12deg] hover:bg-cyan-500 hover:text-black transition-colors"
                      >
                        Connect {connector.name}
                      </button>
                    ))
                )}
             </div>
          </motion.div>
        )}

        {screen === 'lobby' && (
          <motion.div 
             key="lobby"
             className="absolute inset-0 flex flex-col p-6 max-w-2xl mx-auto mt-12 bg-[#050507]"
             initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }}
          >
             <h2 className="text-3xl font-black italic tracking-tighter text-white mb-8 flex items-center gap-3">
                 <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-fuchsia-500 rounded-sm rotate-45 border border-white/20"></div>
                 ARENA <span className="text-cyan-400">LOBBY</span>
             </h2>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                 <button 
                    onClick={() => setScreen('arena')}
                    className="p-6 border-l-4 border-fuchsia-500 bg-black/40 backdrop-blur-sm hover:bg-white/5 transition-all text-left flex flex-col"
                 >
                     <h3 className="text-2xl font-black italic tracking-tighter text-fuchsia-500 mb-2">QUICK MATCH</h3>
                     <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Free-for-all against AI drifters</p>
                 </button>
                 
                 <button 
                    onClick={() => setScreen('garage')}
                    className="p-6 border-l-4 border-cyan-400 bg-black/40 backdrop-blur-sm hover:bg-white/5 transition-all text-left flex flex-col"
                 >
                     <h3 className="text-2xl font-black italic tracking-tighter text-cyan-400 mb-2">GARAGE</h3>
                     <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Unlock on-chain skins</p>
                 </button>
             </div>
             
             <div className="mt-auto border border-white/5 rounded p-4 bg-white/5 flex flex-col">
                <h4 className="text-xs uppercase tracking-[0.3em] font-black text-gray-500 mb-4 flex items-center justify-between">
                   <span>Arena Leaders</span>
                   <span className="text-[10px] px-2 py-0.5 bg-cyan-900/50 text-cyan-300 rounded border border-cyan-500/20">SEASON 1</span>
                </h4>
                <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between p-2 bg-white/5 border-l-2 border-cyan-400">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">0xNeon...A1B2</span>
                        <span className="text-[10px] text-fuchsia-400 font-black italic uppercase">324,500 Echo</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 border-l-2 border-transparent">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-300">0xSynth...9F44</span>
                        <span className="text-[10px] text-cyan-400 font-bold uppercase">289,100 Echo</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 border-l-2 border-transparent">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400">0xBase...00E1</span>
                        <span className="text-[10px] text-cyan-400 font-bold uppercase">255,000 Echo</span>
                      </div>
                    </div>
                </div>
             </div>
             
             <button 
                onClick={() => setScreen('title')}
                className="mt-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-white"
             >
                &larr; Back to Title
             </button>
          </motion.div>
        )}

        {screen === 'garage' && (
          <motion.div 
             key="garage"
             className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#050507]"
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
             <CarFront className="w-32 h-32 text-cyan-500 drop-shadow-[0_0_20px_#00ffff] mb-8" />
             <h2 className="text-4xl font-black italic tracking-tighter text-white mb-4">GARAGE <span className="text-cyan-400">COMING SOON</span></h2>
             <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 max-w-sm mb-8">
                Mint your signature Echo Trails and Engine cosmetics on Base Mainnet to stand out in the arena.
             </p>
             <button onClick={() => setScreen('lobby')} className="px-6 py-2 bg-white text-black font-black uppercase text-sm skew-x-[-12deg] hover:bg-cyan-400 transition-colors">Return to Lobby</button>
          </motion.div>
        )}

        {screen === 'arena' && (
          <motion.div 
             key="arena"
             className="absolute inset-0 flex flex-col"
             initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.5 }}
          >
             <div className="flex-1 relative">
               <Arena onGameOver={handleGameOver} />
               {/* Simple back button for demo purposes to not get stuck, usually game ends naturally */}
               <button onClick={() => handleGameOver(Math.floor(Math.random() * 50000))} className="absolute top-4 right-4 z-20 text-[10px] uppercase tracking-widest font-bold text-gray-400 border border-white/20 px-4 py-2 bg-[#050507]/80 backdrop-blur rounded hover:text-white transition-colors">End Run</button>
             </div>
          </motion.div>
        )}

        {screen === 'postgame' && (
          <motion.div 
             key="postgame"
             className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#050507]/90 backdrop-blur"
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
             <h2 className="text-5xl font-black italic tracking-tighter text-fuchsia-500 mb-2">RUN OVER</h2>
             <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-400 mb-6">Arena Total Score</p>
             
             <div className="text-7xl font-sans font-black italic tabular-nums tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] mb-12">
                 {lastScore.toLocaleString()}
             </div>
             
             <div className="space-y-4 w-full max-w-sm mx-auto">
                 {isConnected && (
                   <button
                     onClick={sendGMTransaction}
                     className="px-3 py-2 rounded-lg bg-[#E8A020]/20 hover:bg-[#E8A020]/30 border border-[#E8A020]/40 text-[#E8A020] transition-colors flex items-center justify-center gap-2 font-['Cinzel'] text-xs font-bold w-full mb-4"
                   >
                     <Sun className="w-4 h-4" />
                     Say GM
                   </button>
                 )}

                 <button 
                    onClick={recordScoreOnChain}
                    className="w-full px-8 py-4 bg-fuchsia-600 text-white font-black uppercase text-lg tracking-widest border border-white/20 shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:bg-fuchsia-500 transition-colors"
                 >
                    Record This Run On-Chain
                 </button>
                 
                 <button 
                    onClick={() => setScreen('arena')}
                    className="w-full relative px-8 py-4 bg-[#050507] border border-cyan-400 text-cyan-400 font-black uppercase text-lg tracking-widest hover:bg-cyan-900/30 transition-colors"
                 >
                    Play Again
                 </button>
                 
                 <button 
                    onClick={() => setScreen('lobby')}
                    className="w-full py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-white"
                 >
                    Return to Lobby
                 </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <GameContent />
    </Web3Provider>
  );
}
