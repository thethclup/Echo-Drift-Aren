import React, { useEffect, useRef, useState } from "react";
import { GameEngine } from "../game/engine";

export function Arena({ onGameOver }: { onGameOver: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(100);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const engine = new GameEngine(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      onEchoFire: () => {
         // Could play sound here
      }
    });
    
    engineRef.current = engine;
    engine.start();

    const handleResize = () => {
      engine.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Score sync loop
    const uiInterval = setInterval(() => {
       setScore(Math.floor(engine.getScore()));
       if (engine.player) {
           setEnergy(Math.floor(engine.player.energy));
       }
    }, 100);

    return () => {
      engine.stop();
      window.removeEventListener("resize", handleResize);
      clearInterval(uiInterval);
    };
  }, []);

  const handleTouch = (action: string, isDown: boolean) => {
      if (!engineRef.current) return;
      (engineRef.current.controls as any)[action] = isDown;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, action: string) => {
    e.target.setPointerCapture(e.pointerId);
    handleTouch(action, true);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>, action: string) => {
    e.target.releasePointerCapture(e.pointerId);
    handleTouch(action, false);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
      />
      
      {/* UI Overlay */}
      <div className="absolute top-8 left-4 p-4 bg-black/40 border-l-4 border-fuchsia-500 backdrop-blur-sm pointer-events-none">
        <div className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-400 font-bold mb-1">Arena Score</div>
        <div className="text-4xl font-black italic tabular-nums tracking-tighter text-white drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
           {score.toLocaleString()}
        </div>
      </div>

      <div className="absolute top-8 right-4 text-right pointer-events-none">
        <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold mb-1">Echo Capacity</div>
        <div className="w-32 md:w-48 h-2 bg-gray-800 rounded-full overflow-hidden border border-cyan-500/30 ml-auto">
          <div 
             className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] transition-all duration-100"
             style={{ width: `${energy}%` }}
          />
        </div>
        <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white">Status: <span className={energy >= 20 ? "text-green-400" : "text-fuchsia-500"}>{energy >= 20 ? "Ready" : "Charging"}</span></div>
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-8 inset-x-0 w-full flex justify-between px-4 md:px-12 z-10 touch-none">
         {/* Steering */}
         <div className="flex gap-2">
             <button
                className="w-20 h-16 bg-[#050507]/80 active:bg-white/20 border-b-4 border-white/20 backdrop-blur skew-x-[-15deg] flex items-center justify-center text-white/50 active:text-white transition-colors"
                onPointerDown={(e) => handlePointerDown(e, 'left')}
                onPointerUp={(e) => handlePointerUp(e, 'left')}
                onPointerCancel={(e) => handlePointerUp(e, 'left')}
                onContextMenu={(e) => e.preventDefault()}
             >
                <div className="skew-x-[15deg] font-black text-2xl">&larr;</div>
             </button>
             <button
                className="w-20 h-16 bg-[#050507]/80 active:bg-white/20 border-b-4 border-white/20 backdrop-blur skew-x-[-15deg] flex items-center justify-center text-white/50 active:text-white transition-colors"
                onPointerDown={(e) => handlePointerDown(e, 'right')}
                onPointerUp={(e) => handlePointerUp(e, 'right')}
                onPointerCancel={(e) => handlePointerUp(e, 'right')}
                onContextMenu={(e) => e.preventDefault()}
             >
                <div className="skew-x-[15deg] font-black text-2xl">&rarr;</div>
             </button>
         </div>

         {/* Actions */}
         <div className="flex gap-3">
             <button
                className="w-24 h-16 bg-[#050507]/80 active:bg-cyan-900/50 border border-cyan-400 text-cyan-400 skew-x-[-15deg] flex items-center justify-center transition-colors"
                onPointerDown={(e) => handlePointerDown(e, 'drift')}
                onPointerUp={(e) => handlePointerUp(e, 'drift')}
                onPointerCancel={(e) => handlePointerUp(e, 'drift')}
                onContextMenu={(e) => e.preventDefault()}
             >
                <div className="skew-x-[15deg] font-black italic tracking-widest text-sm uppercase">Drift</div>
             </button>
             <button
                className="w-24 h-16 bg-fuchsia-600 active:bg-fuchsia-500 text-white border border-white/20 shadow-[0_0_15px_rgba(236,72,153,0.4)] skew-x-[-15deg] flex items-center justify-center transition-colors"
                onPointerDown={(e) => handlePointerDown(e, 'boost')}
                onPointerUp={(e) => handlePointerUp(e, 'boost')}
                onPointerCancel={(e) => handlePointerUp(e, 'boost')}
                onClick={() => engineRef.current?.fireEcho()}
                onContextMenu={(e) => e.preventDefault()}
             >
                <div className="skew-x-[15deg] font-black italic tracking-widest text-sm uppercase">Echo</div>
             </button>
         </div>
      </div>
    </div>
  );
}
