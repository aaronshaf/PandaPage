#!/usr/bin/env bun

import * as fs from 'fs';

function debugPDF(filename: string) {
  const pdfBuffer = fs.readFileSync(filename);
  const pdfText = new TextDecoder('latin1').decode(pdfBuffer);
  
  console.log(`\nDebugging ${filename}:`);
  console.log("=".repeat(50));
  
  // Find all objects
  const objPattern = /(\d+)\s+\d+\s+obj/g;
  const objects: any[] = [];
  let match;
  
  while ((match = objPattern.exec(pdfText)) !== null) {
    const objNum = match[1];
    const start = match.index!;
    const endPattern = new RegExp(`endobj`, 'g');
    endPattern.lastIndex = start;
    const endMatch = endPattern.exec(pdfText);
    
    if (endMatch) {
      const objContent = pdfText.substring(start, endMatch.index! + 6);
      objects.push({
        num: objNum,
        content: objContent,
        start,
        isPage: /\/Type\s*\/Page\s/.test(objContent) && !/\/Type\s*\/Pages/.test(objContent),
        isStream: objContent.includes('stream'),
        hasContents: /\/Contents\s+/.test(objContent)
      });
    }
  }
  
  console.log(`Total objects: ${objects.length}`);
  
  // Show pages
  const pages = objects.filter(o => o.isPage);
  console.log(`\nPages found: ${pages.length}`);
  
  pages.forEach((page, idx) => {
    console.log(`\nPage ${idx + 1} (object ${page.num}):`);
    console.log("-".repeat(30));
    
    // Show first 300 chars
    console.log(page.content.substring(0, 300) + "...");
    
    // Find Contents reference
    const contentsMatch = page.content.match(/\/Contents\s+(\d+)\s+\d+\s+R/);
    if (contentsMatch) {
      const contentsObjNum = contentsMatch[1];
      console.log(`\nContents object: ${contentsObjNum}`);
      
      // Find the contents object
      const contentsObj = objects.find(o => o.num === contentsObjNum);
      if (contentsObj) {
        console.log("Contents object preview:");
        console.log(contentsObj.content.substring(0, 200) + "...");
      }
    }
  });
  
  // Show stream objects
  const streams = objects.filter(o => o.isStream);
  console.log(`\n\nStream objects: ${streams.length}`);
  streams.slice(0, 5).forEach(stream => {
    console.log(`\nStream object ${stream.num}:`);
    const preview = stream.content.substring(0, 150);
    console.log(preview + "...");
  });
}

// Debug sample3.pdf
debugPDF('./../../assets/examples/sample3.pdf');