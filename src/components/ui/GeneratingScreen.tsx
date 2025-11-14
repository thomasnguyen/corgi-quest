/**
 * GeneratingScreen component - Beautiful loading screen for AI image generation
 * Shows animated visual feedback while generating images
 */
export default function GeneratingScreen() {
  return (
    <div className="fixed inset-0 bg-[#121216] bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center px-6 max-w-md">
        {/* Animated Orb */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full border-4 border-[#f5c35f]/30 animate-pulse"></div>
          
          {/* Middle ring */}
          <div className="absolute inset-2 rounded-full border-2 border-[#f5c35f]/50 animate-spin" style={{ animationDuration: '3s' }}></div>
          
          {/* Inner core */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#f5c35f] to-[#f9dca0] animate-pulse flex items-center justify-center">
            <div className="text-4xl">✨</div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#f5c35f] mb-2">
          Generating Magic...
        </h2>
        
        {/* Description */}
        <p className="text-[#f9dca0] text-sm mb-6">
          Creating a unique look for your corgi
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#f5c35f] animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#f5c35f] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#f5c35f] animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

