"use client";

import { getScoreColor, getScoreLabel } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  label: string;
  size?: "sm" | "lg";
}

export function ScoreRing({ score, label, size = "sm" }: ScoreRingProps) {
  const radius = size === "lg" ? 54 : 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const colorClass = getScoreColor(score);

  const strokeColor =
    score >= 80 ? "#22c55e" :
    score >= 60 ? "#eab308" :
    score >= 40 ? "#f97316" :
    "#ef4444";

  const svgSize = size === "lg" ? 128 : 88;
  const strokeWidth = size === "lg" ? 8 : 6;
  const center = svgSize / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${size === "lg" ? "text-3xl" : "text-xl"} ${colorClass}`}>
            {score}
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className={`text-xs font-medium ${size === "lg" ? "text-sm" : ""} text-gray-400`}>{label}</div>
        {size === "lg" && (
          <div className={`text-xs ${colorClass} font-medium`}>{getScoreLabel(score)}</div>
        )}
      </div>
    </div>
  );
}
