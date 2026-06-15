import React from 'react';
import { Youtube, Sparkles, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
  hasResult: boolean;
  onNavigateToAnalyze: () => void;
}

export default function Navbar({ onReset, hasResult, onNavigateToAnalyze }: NavbarProps) {
  return (
    <nav className="border-b border-zinc-850 bg-black/65 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div 
            onClick={onReset}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative p-2 bg-zinc-900 border border-zinc-800 rounded-xl group-hover:border-zinc-700 group-hover:bg-zinc-800/50 transition-all duration-300">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-indigo-500/20 rounded-b-xl blur-md"></div>
              <Youtube className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 group-hover:scale-105 transition-all duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-white flex items-center gap-0.5 leading-none">
                ScriptScore<span className="text-zinc-400 font-medium">.</span><span className="text-indigo-400 font-semibold">ai</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase mt-1 leading-none font-semibold">
                AUDIENCE RETENTION SUITE
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-950/80 text-zinc-450 border border-zinc-900/60 font-mono tracking-wider max-sm:hidden">
              <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              SECURE CLIENT RUNTIME
            </span>

            {hasResult ? (
              <button
                onClick={onReset}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-750 rounded-xl transition-all cursor-pointer font-sans"
              >
                Reset Analyzer
              </button>
            ) : (
              <button
                onClick={onNavigateToAnalyze}
                className="inline-flex items-center px-4 py-2 text-xs font-bold text-black bg-white hover:bg-zinc-150 active:scale-95 duration-200 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer font-sans"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-600 fill-indigo-100" />
                Analyze Now
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
