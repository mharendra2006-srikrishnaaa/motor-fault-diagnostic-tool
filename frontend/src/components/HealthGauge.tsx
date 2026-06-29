/**
 * Futuristic glowing gauge chart for motor health score.
 */

interface HealthGaugeProps {
  score: number;
  category: string;
  size?: number;
}

export default function HealthGauge({ score, category, size = 220 }: HealthGaugeProps) {
  const radius = 85;
  const strokeWidth = 10;
  const center = size / 2;

  // Arc calculation (180 degrees = half circle gauge)
  const startAngle = -180;
  const endAngle = 0;
  const range = endAngle - startAngle;
  const scoreAngle = startAngle + (score / 100) * range;

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

  const getColor = () => {
    switch (category) {
      case 'Excellent': return '#00ff88';
      case 'Good': return '#00f0ff';
      case 'Warning': return '#ffaa00';
      case 'Critical': return '#ff3366';
      default: return '#6b7280';
    }
  };

  const getGlowClass = () => {
    switch (category) {
      case 'Excellent': return 'glow-text-green';
      case 'Good': return 'glow-text';
      case 'Warning': return 'glow-text-amber';
      case 'Critical': return 'glow-text-red';
      default: return '';
    }
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        {/* Outer glow ring */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d={createArc(startAngle, endAngle)}
          fill="none"
          stroke="rgba(100, 116, 139, 0.2)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Score arc with glow */}
        {score > 0 && (
          <path
            d={createArc(startAngle, scoreAngle)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#glow)"
            style={{ transition: 'all 1s ease-out' }}
          />
        )}

        {/* Score text */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          fill={color}
          fontSize="36"
          fontWeight="700"
          fontFamily="Orbitron"
          filter="url(#glow)"
        >
          {score}
        </text>
        <text
          x={center}
          y={center + 15}
          textAnchor="middle"
          fill="rgba(148, 163, 184, 0.6)"
          fontSize="11"
          fontFamily="Orbitron"
        >
          / 100
        </text>
      </svg>
      <span className={`font-orbitron text-sm font-bold mt-2 tracking-wider ${getGlowClass()}`}>
        {category.toUpperCase()}
      </span>
    </div>
  );
}
