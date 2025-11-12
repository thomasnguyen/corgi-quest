#!/usr/bin/env node

/**
 * Script to optimize avatar SVG files by:
 * 1. Extracting embedded base64 PNG images
 * 2. Resizing and optimizing them
 * 3. Converting to WebP format
 * 4. Updating SVG to reference optimized images
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const AVATAR_FILES = [
  'public/holly_avatar.svg',
  'public/thomas_avatar.svg',
  'public/guest_avatar.svg'
];

const MAX_DIMENSION = 1024; // Max width/height for avatars
const QUALITY = 80; // WebP quality (0-100) - reduced for better compression

async function extractBase64Image(svgContent) {
  // Find base64 image data
  const base64Match = svgContent.match(/data:image\/png;base64,([^"']+)/);
  if (!base64Match) {
    return null;
  }
  
  return Buffer.from(base64Match[1], 'base64');
}

async function optimizeImage(imageBuffer, outputPath, targetSizeKB = 100) {
  // Get image metadata
  const metadata = await sharp(imageBuffer).metadata();
  
  // Calculate new dimensions (maintain aspect ratio)
  let width = metadata.width;
  let height = metadata.height;
  let quality = QUALITY;
  let dimension = MAX_DIMENSION;
  
  // Try to get under target size
  let stats;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    // Calculate dimensions
    if (width > dimension || height > dimension) {
      if (width > height) {
        width = dimension;
        height = Math.round((metadata.height / metadata.width) * dimension);
      } else {
        height = dimension;
        width = Math.round((metadata.width / metadata.height) * dimension);
      }
    }
    
    // Optimize and convert to WebP
    await sharp(imageBuffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality })
      .toFile(outputPath);
    
    // Get file size
    stats = fs.statSync(outputPath);
    const sizeKB = stats.size / 1024;
    
    // If we're under target, we're done
    if (sizeKB <= targetSizeKB) {
      break;
    }
    
    // Otherwise, reduce quality or dimension
    if (quality > 60) {
      quality -= 10;
    } else if (dimension > 512) {
      dimension -= 128;
      width = metadata.width;
      height = metadata.height;
    } else {
      break; // Can't optimize further
    }
    
    attempts++;
  }
  
  return {
    path: outputPath,
    size: stats.size,
    width,
    height,
    quality
  };
}

async function updateSVG(svgPath, imagePath) {
  let svgContent = fs.readFileSync(svgPath, 'utf8');
  
  // Replace base64 image with external reference
  const relativePath = path.relative(path.dirname(svgPath), imagePath);
  const webpPath = relativePath.replace(/\\/g, '/'); // Normalize path separators
  
  // Find and replace the image element (handle both xlink:href and href)
  svgContent = svgContent.replace(
    /<image[^>]*(?:xlink:)?href="data:image\/png;base64,[^"']+"[^>]*>/g,
    (match) => {
      // Preserve existing attributes but replace href
      return match.replace(
        /(?:xlink:)?href="data:image\/png;base64,[^"']+"/,
        `href="${webpPath}"`
      );
    }
  );
  
  fs.writeFileSync(svgPath, svgContent, 'utf8');
  
  return fs.statSync(svgPath).size;
}

async function optimizeAvatar(avatarPath) {
  console.log(`\nProcessing ${avatarPath}...`);
  
  // Read SVG
  const svgContent = fs.readFileSync(avatarPath, 'utf8');
  const originalSize = fs.statSync(avatarPath).size;
  
  // Create output path for optimized image
  const avatarName = path.basename(avatarPath, '.svg');
  const outputImagePath = path.join(path.dirname(avatarPath), `${avatarName}.webp`);
  
  let imageBuffer;
  let originalImageSize = 0;
  
  // Try to extract base64 image from SVG
  imageBuffer = await extractBase64Image(svgContent);
  
  // If no base64, check if WebP already exists and optimize that
  if (!imageBuffer) {
    if (fs.existsSync(outputImagePath)) {
      console.log(`  Found existing WebP, re-optimizing...`);
      imageBuffer = fs.readFileSync(outputImagePath);
      originalImageSize = fs.statSync(outputImagePath).size;
    } else {
      console.log(`  ⚠️  No image found, skipping...`);
      return;
    }
  } else {
    originalImageSize = imageBuffer.length;
  }
  
  const totalOriginalSize = originalSize + originalImageSize;
  console.log(`  Original total: ${(totalOriginalSize / 1024).toFixed(2)} KB`);
  
  // Optimize image (target 100KB)
  const optimized = await optimizeImage(imageBuffer, outputImagePath, 100);
  console.log(`  Optimized image: ${(optimized.size / 1024).toFixed(2)} KB (${optimized.width}x${optimized.height}, quality: ${optimized.quality})`);
  
  // Update SVG if it had base64
  let newSvgSize = originalSize;
  if (imageBuffer && imageBuffer.length !== originalImageSize) {
    newSvgSize = await updateSVG(avatarPath, outputImagePath);
  }
  console.log(`  SVG size: ${(newSvgSize / 1024).toFixed(2)} KB`);
  
  const totalSize = optimized.size + newSvgSize;
  const savings = totalOriginalSize - totalSize;
  const savingsPercent = ((savings / totalOriginalSize) * 100).toFixed(1);
  
  console.log(`  ✅ Total: ${(totalSize / 1024).toFixed(2)} KB (saved ${(savings / 1024).toFixed(2)} KB, ${savingsPercent}%)`);
  
  return {
    original: totalOriginalSize,
    optimized: totalSize,
    savings
  };
}

async function main() {
  console.log('🎨 Optimizing avatar images...\n');
  
  let totalOriginal = 0;
  let totalOptimized = 0;
  
  for (const avatarPath of AVATAR_FILES) {
    if (!fs.existsSync(avatarPath)) {
      console.log(`⚠️  File not found: ${avatarPath}`);
      continue;
    }
    
    const result = await optimizeAvatar(avatarPath);
    if (result) {
      totalOriginal += result.original;
      totalOptimized += result.optimized;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Original total: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Optimized total: ${(totalOptimized / 1024).toFixed(2)} KB`);
  console.log(`  Total savings: ${((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Reduction: ${(((totalOriginal - totalOptimized) / totalOriginal) * 100).toFixed(1)}%`);
}

main().catch(console.error);

