import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, Activity, FileText } from 'lucide-react';

interface LoaderProps {
  onComplete: () => void;
}

const LOADING_STEPS = [
  { text: "Reading script structure & format", icon: FileText },
  { text: "Diagnosing hook & psychological triggers", icon: Sparkles },
  { text: "Simulating student & general retention curve", icon: Activity },
  { text: "Running linguistic complexity scan", icon: Terminal },
];

export default function Loader({ onComplete }: LoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 600);
          return prev;
        }
      });
    }, 850);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4 max-w-md mx-auto">
      {/* Top Graphic Logo Animation */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-brand-accent/20 blur-3xl rounded-full scale-110"></div>
        <div className="relative flex items-center justify-center w-20 h-20 bg-brand-card border border-brand-border rounded-2xl animate-pulse">
          <Activity className="w-10 h-10 text-brand-accent animate-spin [animation-duration:15s]" />
        </div>
      </div>

      <h3 className="text-xl font-display font-semibold text-white tracking-tight mb-2">
        Analyzing Your Script
      </h3>
      <p className="text-sm text-zinc-400 mb-8 max-w-sm">
        Our model is checking retention markers, measuring narrative velocity, and framing emotional open loops.
      </p>

      {/* Steps list */}
      <div className="w-full bg-brand-card/50 border border-brand-border rounded-2xl p-5 space-y-4 text-left">
        {LOADING_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div 
              key={idx} 
              className={`flex items-center space-x-3 transition-all duration-350 ${
                isDone ? "opacity-40" : isActive ? "opacity-100 scale-[1.02]" : "opacity-20"
              }`}
            >
              <div className={`p-1.5 rounded-lg border ${
                isDone 
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : isActive
                  ? "border-brand-accent/50 bg-brand-accent/10 text-brand-accent animate-pulse"
                  : "border-zinc-700 bg-zinc-800 text-zinc-500"
              }`}>
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium tracking-wide ${
                  isActive ? "text-brand-text font-semibold" : isDone ? "text-zinc-400" : "text-zinc-500"
                }`}>
                  {step.text}
                </p>
              </div>

              {isActive && (
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
