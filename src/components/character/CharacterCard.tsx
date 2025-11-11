import { Id } from "convex/_generated/dataModel";

interface CharacterCardProps {
  userId: Id<"users">;
  name: string;
  title?: string;
  avatarUrl?: string;
  onSelect: (userId: Id<"users">) => void;
}

/**
 * CharacterCard component for character selection screen
 * Gacha-style card with dark background, golden border, and character art
 * Requirements: 29
 */
export default function CharacterCard({
  userId,
  name,
  title,
  avatarUrl,
  onSelect,
}: CharacterCardProps) {
  const handleSelect = () => {
    onSelect(userId);
  };

  return (
    <div className="relative bg-[#121216] border-2 border-[#D4AF37] rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] active:scale-100">
      {/* Golden glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/10 to-transparent rounded-xl pointer-events-none" />

      {/* Character Avatar/Portrait */}
      <div className="relative mb-4 flex justify-center">
        <div className="w-32 h-32 rounded-full bg-[#1a1a1e] border-2 border-[#D4AF37]/50 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl">👤</div>
          )}
        </div>
      </div>

      {/* Character Name */}
      <h2 className="text-2xl font-bold text-white text-center mb-2">{name}</h2>

      {/* Character Title */}
      {title && (
        <p className="text-[#D4AF37] text-center text-sm font-medium mb-4">
          {title}
        </p>
      )}

      {/* Select Button */}
      <button
        onClick={handleSelect}
        className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F5C35F] text-[#121216] py-3 rounded-lg font-bold text-lg transition-all duration-200 hover:from-[#F5C35F] hover:to-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] active:scale-95"
      >
        Select
      </button>
    </div>
  );
}
