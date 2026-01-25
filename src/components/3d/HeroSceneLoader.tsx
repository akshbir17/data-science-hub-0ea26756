const HeroSceneLoader = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0118]">
      {/* Animated background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl animate-pulse" />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-violet-500/30 blur-2xl animate-pulse"
        style={{ animationDelay: '0.5s' }}
      />
      
      {/* Rotating loader ring */}
      <div className="relative">
        {/* Outer ring */}
        <div className="w-24 h-24 rounded-full border-2 border-purple-500/20 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
        </div>
        
        {/* Inner ring - counter rotation */}
        <div className="absolute inset-3 rounded-full border-2 border-violet-500/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
        </div>
        
        {/* Center pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-pulse" />
        </div>
      </div>
      
      {/* Loading text */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-purple-300/70 text-sm font-medium tracking-wider animate-pulse">
          Loading Scene
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-purple-400/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
      
      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-purple-400/40 animate-pulse"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1.5 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

export default HeroSceneLoader;
