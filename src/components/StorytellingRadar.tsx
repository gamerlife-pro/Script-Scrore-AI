import React from 'react';
import { StorytellingMetrics } from '../types';

interface StorytellingRadarProps {
  metrics: StorytellingMetrics;
}

export default function StorytellingRadar({ metrics }: StorytellingRadarProps) {
  const { setup, conflict, resolution, pacing } = metrics;

  // Let's calculate coordinates based on a 200x200 SVG canvas with center at (100, 100)
  // Max reach on each axis is 80 units
  const maxReach = 75;
  const center = 100;

  const topPoint = { x: center, y: center - (setup / 100) * maxReach };
  const rightPoint = { x: center + (conflict / 100) * maxReach, y: center };
  const bottomPoint = { x: center, y: center + (resolution / 100) * maxReach };
  const leftPoint = { x: center - (pacing / 100) * maxReach, y: center };

  // Helper points for drawing the outer wireframe concentric diamond levels
  const levelRatios = [0.25, 0.5, 0.75, 1];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-6 bg-zinc-950/45 border border-zinc-900 rounded-2xl w-full">
      {/* SVG Radar Visualizer */}
      <div className="relative flex items-center justify-center w-full max-w-[210px] aspect-square mx-auto lg:mx-0">
        {/* Glow behind radar */}
        <div className="absolute inset-8 rounded-full bg-indigo-500/5 blur-2xl"></div>

        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
          {/* Grid Concentric Squares/Diamonds */}
          {levelRatios.map((ratio, index) => {
            const reach = maxReach * ratio;
            return (
              <polygon
                key={index}
                points={`${center},${center - reach} ${center + reach},${center} ${center},${center + reach} ${center - reach},${center}`}
                fill="none"
                className="stroke-zinc-850"
                strokeWidth={1}
                strokeDasharray={index === 3 ? "none" : "3 3"}
              />
            );
          })}

          {/* Grid X/Y Axes */}
          <line x1={center - maxReach} y1={center} x2={center + maxReach} y2={center} className="stroke-zinc-850/70" strokeWidth={1} />
          <line x1={center} y1={center - maxReach} x2={center} y2={center + maxReach} className="stroke-zinc-850/70" strokeWidth={1} />

          {/* Labels for each axis element */}
          <text x={center} y={center - maxReach - 8} textAnchor="middle" className="text-[9px] font-mono tracking-widest font-bold fill-zinc-500 uppercase">
            Setup
          </text>
          <text x={center + maxReach + 8} y={center + 3} textAnchor="start" className="text-[9px] font-mono tracking-widest font-bold fill-zinc-500 uppercase">
            Conflict
          </text>
          <text x={center} y={center + maxReach + 14} textAnchor="middle" className="text-[9px] font-mono tracking-widest font-bold fill-zinc-500 uppercase">
            Resolution
          </text>
          <text x={center - maxReach - 8} y={center + 3} textAnchor="end" className="text-[9px] font-mono tracking-widest font-bold fill-zinc-500 uppercase">
            Pacing
          </text>

          {/* Radar shaded indicator polygon */}
          <polygon
            points={`${topPoint.x},${topPoint.y} ${rightPoint.x},${rightPoint.y} ${bottomPoint.x},${bottomPoint.y} ${leftPoint.x},${leftPoint.y}`}
            fill="rgba(99, 102, 241, 0.08)"
            className="stroke-indigo-400"
            strokeWidth={1.5}
          />

          {/* Individual coordinate points */}
          <circle cx={topPoint.x} cy={topPoint.y} r={3.5} className="fill-white stroke-indigo-400" strokeWidth={1.5} />
          <circle cx={rightPoint.x} cy={rightPoint.y} r={3.5} className="fill-white stroke-indigo-400" strokeWidth={1.5} />
          <circle cx={bottomPoint.x} cy={bottomPoint.y} r={3.5} className="fill-white stroke-indigo-400" strokeWidth={1.5} />
          <circle cx={leftPoint.x} cy={leftPoint.y} r={3.5} className="fill-white stroke-indigo-400" strokeWidth={1.5} />
        </svg>
      </div>

      {/* Numeric breakdown cards on the side */}
      <div className="flex-1 w-full space-y-4">
        {[
          { label: "Narrative Setup", value: setup, color: "bg-indigo-400", desc: "Setting context & opening core premise" },
          { label: "Conflict Amplitude", value: conflict, color: "bg-rose-400", desc: "Clarity of stakes & curiosity markers" },
          { label: "Resolution Payoff", value: resolution, color: "bg-emerald-400", desc: "Viewer fulfillment & final wrap payoff" },
          { label: "Delivery Pacing", value: pacing, color: "bg-amber-400", desc: "Sentence variance and stream speed" }
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col text-left">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                {item.label}
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-300">
                {item.value}%
              </span>
            </div>
            
            {/* Progress Track */}
            <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
              <div 
                className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                style={{ width: `${item.value}%` }}
              />
            </div>
            <span className="text-[9px] text-zinc-500 mt-1 leading-none font-mono">
              {item.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
