#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function copyAssets() {
  const assetsDir = join(__dirname, '../../../assets/examples');
  const publicDir = join(__dirname, '../public');
  
  try {
    // Ensure public directory exists
    await fs.mkdir(publicDir, { recursive: true });
    
    // Read all files from assets directory
    const files = await fs.readdir(assetsDir);
    
    console.log('Copying assets to public directory...');
    
    for (const file of files) {
      const sourcePath = join(assetsDir, file);
      const targetPath = join(publicDir, file);
      
      await fs.copyFile(sourcePath, targetPath);
      console.log(`✓ Copied ${file}`);
    }
    
    console.log(`✅ Successfully copied ${files.length} files to public directory`);
  } catch (error) {
    console.error('❌ Error copying assets:', error.message);
    process.exit(1);
  }
}

copyAssets();