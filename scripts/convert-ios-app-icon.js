#!/usr/bin/env node

/**
 * Convert ios_app.png to WebP and create multiple sizes for mobile favicons
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const INPUT_FILE = path.join(PUBLIC_DIR, 'ios_app.png');

async function convertIcon() {
  console.log('🖼️  Converting ios_app.png to WebP and creating mobile favicon sizes...\n');

  if (!fs.existsSync(INPUT_FILE)) {
    console.error('❌ ios_app.png not found in public directory');
    process.exit(1);
  }

  try {
    // Convert to WebP at original size
    const webpPath = path.join(PUBLIC_DIR, 'ios_app.webp');
    await sharp(INPUT_FILE)
      .webp({ quality: 90 })
      .toFile(webpPath);
    
    const originalStats = fs.statSync(INPUT_FILE);
    const webpStats = fs.statSync(webpPath);
    console.log(`✅ ios_app.webp: ${(originalStats.size / 1024).toFixed(2)}KB → ${(webpStats.size / 1024).toFixed(2)}KB`);

    // Create 192x192 for logo192
    const logo192Webp = path.join(PUBLIC_DIR, 'logo192.webp');
    const logo192Png = path.join(PUBLIC_DIR, 'logo192.png');
    await sharp(INPUT_FILE)
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90 })
      .toFile(logo192Webp);
    await sharp(INPUT_FILE)
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(logo192Png);
    console.log(`✅ logo192.webp and logo192.png created (192x192)`);

    // Create 512x512 for logo512
    const logo512Webp = path.join(PUBLIC_DIR, 'logo512.webp');
    const logo512Png = path.join(PUBLIC_DIR, 'logo512.png');
    await sharp(INPUT_FILE)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90 })
      .toFile(logo512Webp);
    await sharp(INPUT_FILE)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(logo512Png);
    console.log(`✅ logo512.webp and logo512.png created (512x512)`);

    // Create favicon sizes (16x16, 32x32, 48x48)
    const favicon16 = path.join(PUBLIC_DIR, 'favicon-16x16.png');
    const favicon32 = path.join(PUBLIC_DIR, 'favicon-32x32.png');
    await sharp(INPUT_FILE)
      .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(favicon16);
    await sharp(INPUT_FILE)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(favicon32);
    console.log(`✅ favicon-16x16.png and favicon-32x32.png created`);

    // Update favicon.png to be a larger version (180x180 for apple-touch-icon)
    const faviconPng = path.join(PUBLIC_DIR, 'favicon.png');
    await sharp(INPUT_FILE)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(faviconPng);
    console.log(`✅ favicon.png updated (180x180)`);

    // Create WebP version of favicon
    const faviconWebp = path.join(PUBLIC_DIR, 'favicon.webp');
    await sharp(INPUT_FILE)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90 })
      .toFile(faviconWebp);
    console.log(`✅ favicon.webp created (180x180)`);

    console.log('\n✅ All icon conversions complete!');
  } catch (error) {
    console.error('❌ Error converting icons:', error);
    process.exit(1);
  }
}

convertIcon();

