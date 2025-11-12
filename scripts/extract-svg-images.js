#!/usr/bin/env node

/**
 * Extract embedded base64 images from SVG files and convert to WebP
 * This will dramatically reduce file sizes (from 25MB+ to 200-500KB)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'images', 'backgrounds');

// SVG files to process
const SVG_FILES = [
  'smoke_bg.svg',
  'smoke_spark_bg.svg',
  'default_bg.svg',
];

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Extract base64 images from SVG
 */
function extractBase64Images(svgPath) {
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const base64Images = [];
  
  // Match data:image/png;base64,... or data:image/jpeg;base64,...
  const base64Regex = /data:image\/(png|jpeg|jpg);base64,([A-Za-z0-9+/=]+)/g;
  let match;
  let index = 0;
  
  while ((match = base64Regex.exec(svgContent)) !== null) {
    const format = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    base64Images.push({
      index,
      format,
      buffer,
      fullMatch: match[0],
    });
    index++;
  }
  
  return base64Images;
}

/**
 * Convert image to optimized WebP
 */
async function convertToWebP(imageBuffer, outputPath, quality = 75) {
  try {
    await sharp(imageBuffer)
      .webp({ quality })
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    return stats.size;
  } catch (error) {
    console.error(`Error converting to WebP: ${error.message}`);
    return null;
  }
}

/**
 * Create mobile-optimized version (50% width)
 */
async function createMobileVersion(imageBuffer, outputPath, quality = 70) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const mobileWidth = Math.floor(metadata.width * 0.5);
    
    await sharp(imageBuffer)
      .resize(mobileWidth, null, { withoutEnlargement: true })
      .webp({ quality })
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    return stats.size;
  } catch (error) {
    console.error(`Error creating mobile version: ${error.message}`);
    return null;
  }
}

/**
 * Process a single SVG file
 */
async function processSvgFile(svgFile) {
  const svgPath = path.join(PUBLIC_DIR, svgFile);
  
  if (!fs.existsSync(svgPath)) {
    console.log(`⚠️  ${svgFile} not found, skipping...`);
    return null;
  }
  
  console.log(`\n📄 Processing ${svgFile}...`);
  const svgStats = fs.statSync(svgPath);
  const originalSize = svgStats.size;
  console.log(`   Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  
  // Extract base64 images
  const images = extractBase64Images(svgPath);
  
  if (images.length === 0) {
    console.log(`   ⚠️  No base64 images found in ${svgFile}`);
    return null;
  }
  
  console.log(`   Found ${images.length} embedded image(s)`);
  
  const results = [];
  const baseName = path.basename(svgFile, '.svg');
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const suffix = images.length > 1 ? `_${i}` : '';
    
    // Desktop version
    const desktopPath = path.join(OUTPUT_DIR, `${baseName}${suffix}.webp`);
    const desktopSize = await convertToWebP(image.buffer, desktopPath, 75);
    
    if (desktopSize) {
      console.log(`   ✅ Desktop: ${(desktopSize / 1024).toFixed(2)} KB`);
      results.push({ type: 'desktop', path: desktopPath, size: desktopSize });
    }
    
    // Mobile version
    const mobilePath = path.join(OUTPUT_DIR, `${baseName}${suffix}_mobile.webp`);
    const mobileSize = await createMobileVersion(image.buffer, mobilePath, 70);
    
    if (mobileSize) {
      console.log(`   ✅ Mobile: ${(mobileSize / 1024).toFixed(2)} KB`);
      results.push({ type: 'mobile', path: mobilePath, size: mobileSize });
    }
  }
  
  const totalOptimized = results.reduce((sum, r) => sum + r.size, 0);
  const reduction = ((1 - totalOptimized / originalSize) * 100).toFixed(1);
  
  console.log(`   📊 Total optimized: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   🎉 Reduction: ${reduction}%`);
  
  return {
    file: svgFile,
    original: originalSize,
    optimized: totalOptimized,
    reduction: parseFloat(reduction),
    results,
  };
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Extracting and optimizing SVG background images...\n');
  
  // Check if sharp is available
  try {
    await import('sharp');
  } catch (e) {
    console.error('❌ sharp not found. Please install: npm install sharp --save-dev');
    process.exit(1);
  }
  
  const allResults = [];
  
  for (const svgFile of SVG_FILES) {
    const result = await processSvgFile(svgFile);
    if (result) {
      allResults.push(result);
    }
  }
  
  // Summary
  if (allResults.length > 0) {
    console.log('\n📊 Summary:');
    const totalOriginal = allResults.reduce((sum, r) => sum + r.original, 0);
    const totalOptimized = allResults.reduce((sum, r) => sum + r.optimized, 0);
    const totalReduction = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1);
    
    console.log(`\n   Original total: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Optimized total: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   🎉 Total reduction: ${totalReduction}%`);
    console.log(`   💾 Space saved: ${((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n📝 Next steps:');
    console.log('   1. Review the optimized images in public/images/backgrounds/');
    console.log('   2. Update your components to use the new WebP files');
    console.log('   3. Add lazy loading for background images');
    console.log('   4. Use responsive images (srcset) for mobile/desktop versions');
  }
  
  console.log('\n✅ Extraction complete!');
}

main().catch(console.error);

