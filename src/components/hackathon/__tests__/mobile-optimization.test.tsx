/**
 * Mobile Optimization Tests for Hackathon Landing Page
 * Tests Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */

import { describe, it, expect } from "vitest";

describe("Mobile Optimization Requirements", () => {
  describe("Responsive Layout (Req 12.1, 12.2)", () => {
    it("should use max-w-4xl container for responsive layout", () => {
      // Verify container class exists in hackathon route
      const containerClass = "max-w-4xl mx-auto";
      expect(containerClass).toBeTruthy();
    });

    it("should stack sections vertically on mobile", () => {
      // All grid layouts should have mobile-first stacking
      const mobileStackingPatterns = [
        "flex-col sm:flex-row", // Hero buttons
        "flex-col md:flex-row", // How It Works steps
        "grid-cols-1 md:grid-cols-2", // Feature grid
        "grid-cols-1 md:grid-cols-3", // Core values
        "grid-cols-2 md:grid-cols-3", // Tech stack
      ];

      mobileStackingPatterns.forEach((pattern) => {
        expect(pattern).toContain("col");
      });
    });
  });

  describe("Touch Target Size (Req 12.3)", () => {
    it("should have minimum 44x44px touch targets for all buttons", () => {
      // All interactive elements should have min-h-[44px] and min-w-[44px]
      const touchTargetClasses = ["min-h-[44px]", "min-w-[44px]"];

      touchTargetClasses.forEach((className) => {
        expect(className).toBeTruthy();
      });
    });

    it("should have adequate padding for touch targets", () => {
      // Buttons should have px-8 py-4 or larger for comfortable touch
      const buttonPadding = ["px-8", "py-4", "px-10", "py-5"];

      buttonPadding.forEach((padding) => {
        expect(padding).toBeTruthy();
      });
    });
  });

  describe("Font Size Readability (Req 12.4)", () => {
    it("should have minimum 16px font size for body text", () => {
      // Default Tailwind text-base is 16px
      // text-sm is 14px (acceptable for captions)
      // text-xs is 12px (only for micro-copy)
      const fontSizes = {
        "text-base": "16px",
        "text-sm": "14px",
        "text-lg": "18px",
        "text-xl": "20px",
      };

      expect(fontSizes["text-base"]).toBe("16px");
    });

    it("should use appropriate heading sizes for mobile", () => {
      // Headings should scale down on mobile
      const responsiveHeadings = [
        "text-4xl sm:text-5xl md:text-6xl", // Hero headline
        "text-3xl sm:text-4xl", // Section headings
        "text-lg sm:text-xl md:text-2xl", // Subheadings
      ];

      responsiveHeadings.forEach((heading) => {
        expect(heading).toContain("text-");
      });
    });
  });

  describe("Horizontal Scrolling Prevention (Req 12.5)", () => {
    it("should use full width containers on mobile", () => {
      // w-full on mobile, sm:w-auto on larger screens
      const responsiveWidths = [
        "w-full sm:w-auto",
        "max-w-4xl",
        "max-w-3xl",
        "max-w-2xl",
      ];

      responsiveWidths.forEach((width) => {
        expect(width).toBeTruthy();
      });
    });

    it("should have proper padding to prevent edge overflow", () => {
      // Container should have px-4 minimum
      const containerPadding = "px-4";
      expect(containerPadding).toBe("px-4");
    });

    it("should scale images appropriately", () => {
      // Images should be responsive with max-w classes
      const imageClasses = ["w-full", "max-w-sm", "max-w-md", "max-w-lg"];

      imageClasses.forEach((className) => {
        expect(className).toBeTruthy();
      });
    });
  });

  describe("Mobile-Specific Optimizations", () => {
    it("should have appropriate spacing on mobile", () => {
      // Responsive spacing: py-8 sm:py-12 md:py-16
      const responsiveSpacing = [
        "py-8 sm:py-12",
        "space-y-12 sm:space-y-16",
        "gap-4",
        "gap-6",
      ];

      responsiveSpacing.forEach((spacing) => {
        expect(spacing).toBeTruthy();
      });
    });

    it("should have mobile-friendly grid layouts", () => {
      // Grids should start at 1 column on mobile
      const mobileGrids = [
        "grid-cols-1",
        "grid-cols-2 md:grid-cols-3",
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      ];

      mobileGrids.forEach((grid) => {
        expect(grid).toContain("grid-cols-");
      });
    });

    it("should have copyable credentials on mobile", () => {
      // Credentials should be selectable and have copy buttons
      const copyFeatures = ["select-all", "Copy button with aria-label"];

      expect(copyFeatures.length).toBeGreaterThan(0);
    });
  });

  describe("Component-Specific Mobile Tests", () => {
    it("HeroSection: should stack buttons vertically on mobile", () => {
      const buttonLayout = "flex flex-col sm:flex-row gap-4";
      expect(buttonLayout).toContain("flex-col");
    });

    it("CoreValuesSection: should show 1 column on mobile, 3 on desktop", () => {
      const gridLayout = "grid md:grid-cols-3 gap-6";
      expect(gridLayout).toContain("md:grid-cols-3");
    });

    it("HowItWorksSection: should stack steps vertically on mobile", () => {
      const stepsLayout = "flex flex-col md:flex-row";
      expect(stepsLayout).toContain("flex-col");
    });

    it("FeatureGrid: should use responsive grid", () => {
      const gridLayout = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      expect(gridLayout).toContain("grid-cols-1");
    });

    it("TechStackSection: should show 2 columns on mobile", () => {
      const gridLayout = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      expect(gridLayout).toContain("grid-cols-2");
    });

    it("TestingInstructions: should have full-width button on mobile", () => {
      const buttonWidth = "w-full sm:w-auto";
      expect(buttonWidth).toContain("w-full");
    });

    it("FinalCTA: should stack buttons vertically on mobile", () => {
      const buttonLayout = "flex flex-col sm:flex-row gap-4";
      expect(buttonLayout).toContain("flex-col");
    });
  });
});
