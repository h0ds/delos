export function PixelCard({ children, animated = true, glow = true, size = 64 }) {
  const sizePixels = `${size}px`
  const padding = size === 64 ? '6px' : '8px'

  return (
    <div
      className={`relative group ${animated ? 'animate-in-subtle' : ''}`}
      style={{
        width: sizePixels,
        height: sizePixels,
        background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.8) 0%, rgba(15, 15, 25, 0.9) 100%)',
        border: '2px solid',
        borderColor: 'rgb(82, 39, 255)',
        borderRadius: '2px',
        padding,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: glow
          ? '0 0 20px rgba(82, 39, 255, 0.4), inset 0 0 20px rgba(255, 159, 252, 0.05)'
          : '0 0 10px rgba(82, 39, 255, 0.2)',
        transition: 'all 0.3s ease-out',
        cursor: 'pointer'
      }}
    >
      {/* Pixel grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(82, 39, 255, 0.2) 25%, rgba(82, 39, 255, 0.2) 26%, transparent 27%, transparent 74%, rgba(82, 39, 255, 0.2) 75%, rgba(82, 39, 255, 0.2) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(82, 39, 255, 0.2) 25%, rgba(82, 39, 255, 0.2) 26%, transparent 27%, transparent 74%, rgba(82, 39, 255, 0.2) 75%, rgba(82, 39, 255, 0.2) 76%, transparent 77%, transparent)
          `,
          backgroundSize: `${size / 6.4}px ${size / 6.4}px`
        }}
      />

      {/* Animated glow corners - retro pixel effect */}
      {glow && (
        <>
          <div
            className="absolute top-0 left-0 w-1 h-1"
            style={{
              background: 'rgb(255, 159, 252)',
              boxShadow: '0 0 8px rgba(255, 159, 252, 0.8)',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
          <div
            className="absolute top-0 right-0 w-1 h-1"
            style={{
              background: 'rgb(82, 39, 255)',
              boxShadow: '0 0 8px rgba(82, 39, 255, 0.8)',
              animation: 'pulse 2s ease-in-out infinite 0.5s'
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-1 h-1"
            style={{
              background: 'rgb(82, 39, 255)',
              boxShadow: '0 0 8px rgba(82, 39, 255, 0.8)',
              animation: 'pulse 2s ease-in-out infinite 0.3s'
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-1 h-1"
            style={{
              background: 'rgb(255, 159, 252)',
              boxShadow: '0 0 8px rgba(255, 159, 252, 0.8)',
              animation: 'pulse 2s ease-in-out infinite 0.8s'
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">{children}</div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: 'inset 0 0 30px rgba(255, 159, 252, 0.3)',
          borderRadius: '2px',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}
