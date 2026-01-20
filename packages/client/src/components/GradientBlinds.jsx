import { useMemo } from 'react'

export function GradientBlinds({ count = 8, animated = true, speed = 'normal' }) {
  // Speed multiplier for animation
  const speedMap = {
    slow: 40,
    normal: 25,
    fast: 15
  }

  const blinds = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const hue = (i / count) * 360
      return {
        id: i,
        hue,
        delay: i * 0.1
      }
    })
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      {/* Background base */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/80" />

      {/* Gradient blinds */}
      <div className="absolute inset-0">
        {blinds.map(blind => (
          <div
            key={blind.id}
            className={`absolute inset-y-0 ${animated ? 'animate-gradient-shift' : ''}`}
            style={{
              left: `${(blind.id / count) * 100}%`,
              width: `${100 / count}%`,
              background: `linear-gradient(
                135deg,
                hsl(${blind.hue}, 100%, 50%) 0%,
                hsl(${(blind.hue + 60) % 360}, 100%, 45%) 100%
              )`,
              opacity: 0.03,
              animation: animated
                ? `gradientShift ${speedMap[speed]}s ease-in-out ${blind.delay}s infinite alternate`
                : 'none',
              mixBlendMode: 'screen'
            }}
          />
        ))}
      </div>

      {/* Subtle overlay grid */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(255, 159, 252, .1) 25%, rgba(255, 159, 252, .1) 26%, transparent 27%, transparent 74%, rgba(255, 159, 252, .1) 75%, rgba(255, 159, 252, .1) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255, 159, 252, .1) 25%, rgba(255, 159, 252, .1) 26%, transparent 27%, transparent 74%, rgba(255, 159, 252, .1) 75%, rgba(255, 159, 252, .1) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  )
}
