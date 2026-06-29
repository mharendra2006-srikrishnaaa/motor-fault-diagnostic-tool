/**
 * Professional gauge chart component for displaying motor health score.
 * Uses SVG for crisp rendering at any size.
 */

interface HealthGaugeProps {
  score: number;
  category: string;
  size?: number;
}

export default function HealthGauge({ score, category, size = 200 }: HealthGaugeProps) {
  const radius = 80;
  const strokeWidth = 12;
  const center = size / 2;

  // Arc calculation (180 degrees = half circle gauge)
  const startAngle = -180;
  const endAngle = 0;
  const range = endAngle - startAngle;
  const scoreAngle = startAngle + (score / 100) * range;

  // Convert angle to SVG arc coordinates
  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  const createArc = (start: number, end: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  // Color based on category
  const getColor = () => {
    switch (category) {
      case 'Excellent': return '#059669';
      case 'Good': return '#2563eb';
      case 'Warning': return '#d97706';
      case 'Critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
        {/* Background arc */}
        <path
          d={createArc(startAngle, endAngle)}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Score arc */}
        {score > 0 && (
          <path
            d={createArc(startAngle, scoreAngle)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
        {/* Score text */}
        <text
          x={center}
          y={center - 5}
          textAnchor="middle"
          className="text-3xl font-bold"
          fill={color}
          fontSize="32"
          fontWeight="700"
        >
          {score}
        </text>
        <text
          x={center}
          y={center + 18}
          textAnchor="middle"
          fill="#64748b"
          fontSize="12"
        >
          / 100
        </text>
      </svg>
      <span
        className="text-sm font-semibold px-3 py-1 rounded-full mt-1"
        style={{ color, backgroundColor: `${color}15` }}
      >
        {category}
      </span>
    </div>
  );
}
