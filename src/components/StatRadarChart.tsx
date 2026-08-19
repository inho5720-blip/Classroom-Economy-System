import React from 'react';
import { StudentStats, StatKey } from '../types';

interface StatRadarChartProps {
  stats: StudentStats;
  size?: number;
}

const STAT_CONFIG: { key: StatKey; label: string; icon: string; color: string }[] = [
  { key: 'diligence', label: '성실', icon: '⚡', color: '#0284C7' },
  { key: 'frugality', label: '절약', icon: '💰', color: '#059669' },
  { key: 'contribution', label: '기여', icon: '🤝', color: '#E11D48' },
  { key: 'wisdom', label: '지혜', icon: '📖', color: '#4F46E5' },
  { key: 'credit', label: '신용', icon: '⚖️', color: '#D97706' },
];

export const StatRadarChart: React.FC<StatRadarChartProps> = ({ stats, size = 260 }) => {
  const center = size / 2;
  const radius = size * 0.36;
  const numAxes = STAT_CONFIG.length;
  const angleStep = (Math.PI * 2) / numAxes;
  const maxStat = 100;

  // Compute vertices for polygon
  const points = STAT_CONFIG.map((config, index) => {
    const rawVal = stats[config.key] || 10;
    const normalized = Math.min(1, Math.max(0.12, rawVal / maxStat));
    const angle = index * angleStep - Math.PI / 2; // start from top
    const x = center + radius * normalized * Math.cos(angle);
    const y = center + radius * normalized * Math.sin(angle);
    return { x, y, val: rawVal, angle, config };
  });

  const polygonPointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Grid level polygons (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="overflow-visible select-none drop-shadow-xs">
        {/* Background Grid Rings */}
        {gridLevels.map((lvl, idx) => {
          const gridPoints = STAT_CONFIG.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * lvl * Math.cos(angle);
            const y = center + radius * lvl * Math.sin(angle);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={idx}
              points={gridPoints}
              fill={idx === gridLevels.length - 1 ? '#F8FAFC' : 'transparent'}
              stroke="#E2E8F0"
              strokeWidth="1.2"
              strokeDasharray={idx === gridLevels.length - 1 ? undefined : '3,3'}
            />
          );
        })}

        {/* Axis Lines */}
        {STAT_CONFIG.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#E2E8F0"
              strokeWidth="1.2"
            />
          );
        })}

        {/* Dynamic Data Polygon */}
        <polygon
          points={polygonPointsStr}
          fill="url(#pastelRadarGradient)"
          stroke="#F59E0B"
          strokeWidth="2.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Vertex Points */}
        {points.map((p, i) => (
          <g key={i} className="transition-all duration-500 ease-out">
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill={p.config.color}
              stroke="#FFFFFF"
              strokeWidth="2"
              className="drop-shadow-xs"
            />
          </g>
        ))}

        {/* Radar Fill Gradient */}
        <defs>
          <radialGradient id="pastelRadarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.25" />
          </radialGradient>
        </defs>

        {/* Labels at outer edges */}
        {STAT_CONFIG.map((config, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = radius + 26;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          const val = stats[config.key] || 10;

          return (
            <g key={i} transform={`translate(${x}, ${y})`}>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[12px] font-bold fill-slate-700"
              >
                {config.icon} {config.label}
              </text>
              <text
                y="14"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[11px] font-mono font-bold fill-amber-700"
              >
                {val}점
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
