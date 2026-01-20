export function GlowingGradientCircle({ size = 32 }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size
      }}
    >
      {/* Animated gradient circle */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #5227FF, #FF9FFC, #5227FF)',
          backgroundSize: '200% 200%',
          animation: 'gradientFlow 3s ease infinite',
          boxShadow: '0 0 20px rgba(82, 39, 255, 0.6), 0 0 40px rgba(255, 159, 252, 0.3)'
        }}
      />

      {/* Glow layer */}
      <div
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 159, 252, 0.4) 0%, transparent 70%)',
          filter: 'blur(8px)',
          animation: 'pulse 2s ease-in-out infinite'
        }}
      />
    </div>
  )
}
