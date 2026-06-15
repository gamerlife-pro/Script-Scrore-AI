import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreRing({ score, size = 120, strokeWidth = 10 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Color selection based on the score level
  let strokeColor = "stroke-brand-accent";
  let glowColor = "bg-brand-accent/20";
  let textColor = "text-white";

  if (score >= 90) {
    strokeColor = "stroke-indigo-400";
    glowColor = "shadow-indigo-500/20";
  } else if (score >= 80) {
    strokeColor = "stroke-brand-accent";
    glowColor = "shadow-brand-accent/20";
  } else if (score >= 70) {
    strokeColor = "stroke-amber-400";
    glowColor = "shadow-amber-500/15";
    textColor = "text-amber-100";
  } else {
    strokeColor = "stroke-rose-500";
    glowColor = "shadow-rose-500/10";
    textColor = "text-rose-100";
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Glow Backing */}
      <div className={`absolute inset-3 rounded-full blur-xl opacity-30 ${glowColor}`}></div>

      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Circle */}
        <circle
          className="stroke-zinc-800"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Animated Progress Circle */}
        <circle
          className={`transition-all duration-1000 ease-out ${strokeColor}`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Score Label overlay */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`text-4xl font-display font-extrabold tracking-tight ${textColor}`}>
          {score}
        </span>
        <span className="text-[10px] font-mono font-medium tracking-widest text-zinc-500 uppercase mt-0.5">
          / 100
        </span>
      </div>
    </div>
  );
}
