/**
 * Image Optimization Script
 * ==========================
 * Compress large images untuk performance
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesToOptimize = [
  {
    input: './public/image-new-min.jpg',
    output: './public/image-new-min.jpg',
    quality: 75,
    width: 1920,
    desc: 'AksesibilitasSlider (7.7MB → ~1.2MB)'
  },
  {
    input: './public/blok-a-new.JPG',
    output: './public/blok-a-new.JPG',
    quality: 70,
    width: 600,
    desc: 'Blok A thumbnail (6.4MB → ~400KB)'
  },
  {
    input: './public/blok-b-new.JPG',
    output: './public/blok-b-new.JPG',
    quality: 70,
    width: 600,
    desc: 'Blok B thumbnail (6.2MB → ~400KB)'
  },
];

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');

  for (const image of imagesToOptimize) {
    try {
      if (!fs.existsSync(image.input)) {
        console.log(`⏭️  Skipped: ${image.input} (not found)`);
        continue;
      }

      const stats = fs.statSync(image.input);
      const sizeBefore = (stats.size / 1024 / 1024).toFixed(2);
      const tempFile = image.output + '.temp';

      // Compress ke temp file
      await sharp(image.input)
        .resize(image.width, null, { withoutEnlargement: true })
        .jpeg({ quality: image.quality, progressive: true })
        .toFile(tempFile);

      // Replace original dengan temp file
      fs.renameSync(tempFile, image.output);

      const statsAfter = fs.statSync(image.output);
      const sizeAfter = (statsAfter.size / 1024 / 1024).toFixed(2);
      const saved = ((1 - statsAfter.size / stats.size) * 100).toFixed(0);

      console.log(`✅ ${image.desc}`);
      console.log(`   ${sizeBefore}MB → ${sizeAfter}MB (saved ${saved}%)\n`);
    } catch (error) {
      console.error(`❌ Error optimizing ${image.input}:`, error.message);
    }
  }

  console.log('✨ Image optimization complete!');
}

optimizeImages();
