interface SparklineProps {
  values: number[];
  min: number;
  max: number;
  threshold?: number;     // draws a dashed reference line
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({ values, min, max, threshold, color = '#0f172a', width = 120, height = 36 }: SparklineProps) {
  if (values.length === 0) return null;
  const pad = 3;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const range = max - min || 1;
  const x = (i: number) => pad + (values.length === 1 ? w / 2 : (i / (values.length - 1)) * w);
  const y = (v: number) => pad + h - ((v - min) / range) * h;

  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const last = values[values.length - 1];
  const lastOverThreshold = threshold !== undefined && last >= threshold;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {threshold !== undefined && (
        <line x1={pad} y1={y(threshold)} x2={width - pad} y2={y(threshold)} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3,2" opacity={0.6} />
      )}
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(values.length - 1)} cy={y(last)} r={2.5} fill={lastOverThreshold ? '#dc2626' : color} />
    </svg>
  );
}
