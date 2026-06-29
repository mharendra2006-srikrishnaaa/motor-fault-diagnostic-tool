/**
 * Futuristic animated background with grid lines and floating particles.
 */

import { useMemo } from 'react';

export default function AnimatedBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${10 + Math.random() * 20}s`,
      size: `${1 + Math.random() * 2}px`,
    }));
  }, []);

  return (
    <>
      <div className="animated-bg" />
      <div className="particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>
    </>
  );
}
