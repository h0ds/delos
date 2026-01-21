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
          background: 'linear-gradient(45deg, #FF4500, #FF9F00, #FF4500)',
          backgroundSize: '200% 200%',
          animation: 'gradientFlow 3s ease infinite',
          boxShadow: '0 0 20px rgba(255, 82, 82, 0.6), 0 0 40px rgba(255, 159, 82, 0.3)'
        }}
      />

      {/* Glow layer */}
      <div
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 159, 82, 0.4) 0%, transparent 70%)',
          filter: 'blur(8px)',
          animation: 'pulse 2s ease-in-out infinite'
        }}
      />
    </div>
  )
}
