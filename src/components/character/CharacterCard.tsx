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

  // display holly with holly_avatar.svg
  if (name === "Holly") {
    avatarUrl = "/holly_avatar.svg";
  } else if (name === "Thomas") {
    avatarUrl = "/thomas_avatar.svg";
  } else if (name === "Guest") {
    avatarUrl = "/guest_avatar.svg";
  }

  return (
    <div
      className="relative bg-[#121216] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 active:scale-100"
      onClick={handleSelect}
    >
      {/* Dark background under the image */}
      <div className="absolute inset-0 bg-[#121216] z-0"></div>

      {/* add blur effect to the background */}
      <div className="absolute top-8 right-5 text-right px-2 z-10">
        {title && (
          <p
            className="text-[#D4AF37] text-base font-medium"
            style={{
              textShadow:
                "0px 1px 2px rgba(0, 0, 0, 0.8), 0px 0px 8px rgba(0, 0, 0, 0.6)",
            }}
          >
            {title}
          </p>
        )}
        <h2
          className="text-3xl font-bold bg-gradient-to-b from-[#feefd0] to-[#fcd587] bg-clip-text text-transparent"
          style={{
            fontFamily: "serif",
            filter:
              "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.2)) drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.25)) drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))",
          }}
        >
          {name}
        </h2>
      </div>
      <img
        src={avatarUrl}
        alt={name}
        className="relative w-full h-full object-cover z-0"
      />
    </div>
  );

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
