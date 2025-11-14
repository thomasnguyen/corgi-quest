#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts PNG files to WebP and optimizes SVG files
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const PNG_FILES = [
  "main_bg.png",
  "summon.png",
  "smoke_spark.png",
  "mage_avatar.png",
  "mage_bg.png",
  "default_avatar.png",
  "tanstack-circle-logo.png",
  "logo192.png",
  "logo512.png",
  "favicon.png",
];

const SVG_FILES_TO_OPTIMIZE = ["Border.svg"];

// Quality settings for different image types
const QUALITY_SETTINGS = {
  "main_bg.png": 80,
  "summon.png": 85,
  "smoke_spark.png": 85,
  "mage_avatar.png": 90,
  "mage_bg.png": 80,
  "default_avatar.png": 90,
  "tanstack-circle-logo.png": 90,
  "logo192.png": 90,
  "logo512.png": 90,
  "favicon.png": 90,
};

async function checkDependencies() {
  console.log("📦 Checking dependencies...");

  try {
    await import("sharp");
    console.log("✅ sharp is installed");
  } catch (e) {
    console.log("❌ sharp not found. Installing...");
    execSync("npm install sharp --save-dev", { stdio: "inherit" });
  }

  try {
    await import("svgo");
    console.log("✅ svgo is installed");
  } catch (e) {
    console.log("❌ svgo not found. Installing...");
    execSync("npm install svgo --save-dev", { stdio: "inherit" });
  }
}

async function convertPngToWebP(pngFile) {
  const sharp = (await import("sharp")).default;
  const inputPath = path.join(PUBLIC_DIR, pngFile);
  const outputPath = path.join(PUBLIC_DIR, pngFile.replace(".png", ".webp"));

  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  File not found: ${pngFile}`);
    return null;
  }

  const quality = QUALITY_SETTINGS[pngFile] || 85;
  const stats = fs.statSync(inputPath);
  const originalSize = (stats.size / 1024).toFixed(2);

  try {
    await sharp(inputPath).webp({ quality }).toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newSize = (newStats.size / 1024).toFixed(2);
    const reduction = ((1 - newStats.size / stats.size) * 100).toFixed(1);

    console.log(
      `✅ ${pngFile}: ${originalSize}KB → ${newSize}KB (${reduction}% reduction)`
    );
    return { original: stats.size, optimized: newStats.size, reduction };
  } catch (error) {
    console.error(`❌ Error converting ${pngFile}:`, error.message);
    return null;
  }
}

async function optimizeSvg(svgFile) {
  const { optimize } = await import("svgo");
  const inputPath = path.join(PUBLIC_DIR, svgFile);

  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  File not found: ${svgFile}`);
    return null;
  }

  const svgContent = fs.readFileSync(inputPath, "utf8");
  const originalSize = (Buffer.byteLength(svgContent) / 1024).toFixed(2);

  const config = {
    multipass: true,
    plugins: ["preset-default"],
  };

  try {
    const result = await optimize(svgContent, { path: inputPath, ...config });

    if (!result || !result.data) {
      console.log(`⚠️  No optimization result for ${svgFile}`);
      return null;
    }

    const outputPath = path.join(
      PUBLIC_DIR,
      svgFile.replace(".svg", ".optimized.svg")
    );
    fs.writeFileSync(outputPath, result.data);

    const newSize = (Buffer.byteLength(result.data) / 1024).toFixed(2);
    const reduction = (
      (1 - Buffer.byteLength(result.data) / Buffer.byteLength(svgContent)) *
      100
    ).toFixed(1);

    console.log(
      `✅ ${svgFile}: ${originalSize}KB → ${newSize}KB (${reduction}% reduction)`
    );

    // Replace original if optimization was successful
    if (Buffer.byteLength(result.data) < Buffer.byteLength(svgContent)) {
      fs.copyFileSync(outputPath, inputPath);
      fs.unlinkSync(outputPath);
      console.log(`   Replaced original with optimized version`);
    } else {
      fs.unlinkSync(outputPath);
      console.log(`   Optimization didn't reduce size, keeping original`);
    }

    return {
      original: Buffer.byteLength(svgContent),
      optimized: Buffer.byteLength(result.data),
      reduction,
    };
  } catch (error) {
    console.error(`❌ Error optimizing ${svgFile}:`, error.message);
    return null;
  }
}

async function main() {
  console.log("🚀 Starting image optimization...\n");

  // Check dependencies
  await checkDependencies();
  console.log("");

  // Convert PNGs to WebP
  console.log("🖼️  Converting PNG files to WebP...");
  const pngResults = [];
  for (const pngFile of PNG_FILES) {
    const result = await convertPngToWebP(pngFile);
    if (result) {
      pngResults.push(result);
    }
  }
  console.log("");

  // Optimize SVGs
  console.log("🎨 Optimizing SVG files...");
  const svgResults = [];
  for (const svgFile of SVG_FILES_TO_OPTIMIZE) {
    const result = await optimizeSvg(svgFile);
    if (result) {
      svgResults.push(result);
    }
  }
  console.log("");

  // Summary
  console.log("📊 Summary:");
  if (pngResults.length > 0) {
    const totalOriginal = pngResults.reduce((sum, r) => sum + r.original, 0);
    const totalOptimized = pngResults.reduce((sum, r) => sum + r.optimized, 0);
    const totalReduction = ((1 - totalOptimized / totalOriginal) * 100).toFixed(
      1
    );
    console.log(
      `   PNG → WebP: ${(totalOriginal / 1024).toFixed(2)}KB → ${(totalOptimized / 1024).toFixed(2)}KB (${totalReduction}% reduction)`
    );
  }
  if (svgResults.length > 0) {
    const totalOriginal = svgResults.reduce((sum, r) => sum + r.original, 0);
    const totalOptimized = svgResults.reduce((sum, r) => sum + r.optimized, 0);
    const totalReduction = ((1 - totalOptimized / totalOriginal) * 100).toFixed(
      1
    );
    console.log(
      `   SVG Optimization: ${(totalOriginal / 1024).toFixed(2)}KB → ${(totalOptimized / 1024).toFixed(2)}KB (${totalReduction}% reduction)`
    );
  }
  console.log("\n✅ Image optimization complete!");
  console.log(
    "\n⚠️  Note: Large SVG files (smoke_bg.svg, smoke_spark_bg.svg, etc.) need manual extraction"
  );
  console.log(
    "   of embedded raster images. These are too large to process automatically."
  );
}

main().catch(console.error);
