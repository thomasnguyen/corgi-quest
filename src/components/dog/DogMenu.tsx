import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface DogMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeDogId: Id<"dogs"> | null;
  householdId: Id<"households">;
  onDogSelect: (dogId: Id<"dogs">) => void;
  onAddDog: () => void;
}

/**
 * DogMenu component - Bottom sheet for dog selection and management
 *
 * Displays all household dogs with active dog marked as "(current)".
 * Includes "+ Add new dog" button and supports tap-to-dismiss and swipe-down gestures.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.2
 */
export function DogMenu({
  isOpen,
  onClose,
  activeDogId,
  householdId,
  onDogSelect,
  onAddDog,
}: DogMenuProps) {
  // Query household dogs - Requirements: 2.2, 9.1
  const dogs = useQuery(api.queries.getHouseholdDogs, { householdId });

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Swipe gesture tracking
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Handle open/close animations - Requirements: 2.1, 10.2
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle backdrop click - Requirements: 2.4
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle swipe down gesture - Requirements: 2.4
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (startY === null || currentY === null) return;

    const deltaY = currentY - startY;

    // If swiped down more than 100px, close the menu
    if (deltaY > 100) {
      onClose();
    }

    // Reset swipe state
    setStartY(null);
    setCurrentY(null);
  };

  // Calculate swipe offset for visual feedback
  const swipeOffset =
    startY !== null && currentY !== null ? Math.max(0, currentY - startY) : 0;

  // Don't render if not open and animation is complete
  if (!shouldRender) return null;

  // Render using portal to bypass stacking context issues
  return createPortal(
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{ zIndex: 1000 }}
      onClick={handleBackdropClick}
    >
      {/* Backdrop - Requirements: 2.4 */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? "opacity-50" : "opacity-0"
        }`}
        style={{ willChange: "opacity" }}
      />

      {/* Bottom Sheet - Requirements: 2.1, 10.2, 10.3 */}
      <div
        ref={sheetRef}
        className={`relative w-full max-w-md bg-[#1a1a1e] rounded-t-3xl border-t border-[#3d3d3d]/30 transition-transform duration-300 ${
          isAnimating ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          transform: `translate3d(0, ${isAnimating ? swipeOffset : "100%"}px, 0)`,
          willChange: "transform",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe indicator */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-[#3d3d3d] rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3d3d3d]/30">
          <h2 className="text-[#f9dca0] text-lg font-semibold">Dogs</h2>
        </div>

        {/* Dog List - Will be implemented in task 5.2 */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {dogs === undefined ? (
            // Loading state
            <div className="text-[#888] text-sm text-center py-8">
              Loading dogs...
            </div>
          ) : dogs.length === 0 ? (
            // Empty state
            <div className="text-[#888] text-sm text-center py-8">
              No dogs yet. Add your first dog!
            </div>
          ) : (
            // Dog list - Requirements: 2.2, 2.5
            <div className="space-y-2">
              {dogs.map((dog) => {
                const isActive = dog._id === activeDogId;
                return (
                  <button
                    key={dog._id}
                    onClick={() => {
                      // Requirements: 3.1 - Call setActiveDogId, close menu, trigger context switch
                      onDogSelect(dog._id);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#121216]/80 border border-[#3d3d3d]/30 hover:border-[#f5c35f]/50 transition-colors cursor-pointer active:scale-98 min-h-[44px]"
                  >
                    {/* Dog emoji avatar */}
                    <span className="text-2xl">🐶</span>

                    {/* Dog info */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[#f9dca0] text-sm font-medium">
                          {dog.name}
                        </span>
                        {isActive && (
                          <span className="text-[#888] text-xs">(current)</span>
                        )}
                      </div>
                      <div className="text-[#888] text-xs">
                        Level {dog.overallLevel}
                      </div>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="w-2 h-2 bg-[#f5c35f] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Add New Dog Button - Requirements: 2.3 */}
        <div className="px-6 py-4 border-t border-[#3d3d3d]/30">
          <button
            onClick={onAddDog}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-[#f5c35f] hover:bg-[#f5c35f]/90 transition-colors cursor-pointer active:scale-98 min-h-[44px]"
          >
            <span className="text-[#1a1a1e] text-base font-semibold">+</span>
            <span className="text-[#1a1a1e] text-sm font-semibold">
              Add new dog
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
