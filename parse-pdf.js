#!/usr/bin/env bun

// PDF-to-Markdown CLI tool using MoonBit WASM
import { readFileSync } from 'fs';
import { resolve } from 'path';

async function loadWasmModule() {
    try {
        const wasmPath = resolve('./pdf-parser.wasm');
        const wasmBytes = readFileSync(wasmPath);
        
        // Provide imports that MoonBit runtime might need
        const imports = {
            env: {},
            spectest: {
                print_char: (c) => process.stdout.write(String.fromCharCode(c)),
                print: () => process.stdout.write('\n')
            }
        };
        
        const wasmModule = await WebAssembly.instantiate(wasmBytes, imports);
        return wasmModule.instance;
    } catch (error) {
        console.error('Failed to load WASM module:', error.message);
        return null;
    }
}

// Fallback JavaScript text extraction (same as browser version)
function extractTextFromPDFJS(bytes) {
    let extractedText = '';
    
    // Convert bytes to string to search for text patterns
    const pdfString = new TextDecoder('latin1', { fatal: false }).decode(bytes);
    
    // Look for text between BT (begin text) and ET (end text) operators
    const textBlocks = pdfString.match(/BT\\s+.*?ET/gs);
    
    if (textBlocks) {
        for (const block of textBlocks) {
            // Extract text from Tj and TJ operators (simplified)
            const textMatches = block.match(/\\((.*?)\\)\\s*Tj/g);
            if (textMatches) {
                for (const match of textMatches) {
                    const text = match.match(/\\((.*?)\\)/);
                    if (text && text[1]) {
                        // Check if it's Unicode hex string (starts with FEFF)
                        if (text[1].match(/^(FEFF|feff)[0-9A-Fa-f]+$/)) {
                            extractedText += decodeUnicodeHex(text[1]) + ' ';
                        } else {
                            extractedText += text[1] + ' ';
                        }
                    }
                }
            }
            
            // Also look for hex strings <FEFF...>
            const hexMatches = block.match(/<([0-9A-Fa-f]+)>\\s*Tj/g);
            if (hexMatches) {
                for (const match of hexMatches) {
                    const hex = match.match(/<([0-9A-Fa-f]+)>/);
                    if (hex && hex[1]) {
                        extractedText += decodeUnicodeHex(hex[1]) + ' ';
                    }
                }
            }
            
            // Also look for array-based text positioning
            const arrayTextMatches = block.match(/\\[(.*?)\\]\\s*TJ/g);
            if (arrayTextMatches) {
                for (const match of arrayTextMatches) {
                    const content = match.match(/\\[(.*?)\\]/);
                    if (content && content[1]) {
                        // Extract strings from array (very basic)
                        const strings = content[1].match(/\\((.*?)\\)/g);
                        if (strings) {
                            for (const str of strings) {
                                const cleanStr = str.replace(/[()]/g, '');
                                if (cleanStr.match(/^(FEFF|feff)[0-9A-Fa-f]+$/)) {
                                    extractedText += decodeUnicodeHex(cleanStr) + ' ';
                                } else {
                                    extractedText += cleanStr + ' ';
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Fallback: look for any readable text patterns
    if (!extractedText.trim()) {
        // Look for Unicode hex strings in the PDF
        const unicodeHexMatches = pdfString.match(/FEFF[0-9A-Fa-f]+/g);
        if (unicodeHexMatches) {
            for (const hex of unicodeHexMatches) {
                extractedText += decodeUnicodeHex(hex) + ' ';
            }
        }
        
        // If still nothing, find sequences of printable ASCII characters
        if (!extractedText.trim()) {
            const readableText = pdfString.match(/[a-zA-Z0-9\\s.,!?;:'"()-]{10,}/g);
            if (readableText) {
                extractedText = readableText.slice(0, 10).join('\\n');
            }
        }
    }
    
    // Clean up the extracted text
    return extractedText
        .replace(/\\s+/g, ' ')
        .trim();
}

// Decode Unicode hex string (FEFF0044 = 'D')
function decodeUnicodeHex(hexString) {
    // Remove BOM if present
    if (hexString.startsWith('FEFF') || hexString.startsWith('feff')) {
        hexString = hexString.substring(4);
    }
    
    let result = '';
    // Process each 4-character chunk as a UTF-16 code unit
    for (let i = 0; i < hexString.length; i += 4) {
        const codeUnit = parseInt(hexString.substring(i, i + 4), 16);
        if (!isNaN(codeUnit)) {
            result += String.fromCharCode(codeUnit);
        }
    }
    
    return result;
}

async function parsePDF(pdfPath, debugMode = false) {
    try {
        // Read PDF file
        const pdfBytes = readFileSync(pdfPath);
        const byteArray = Array.from(pdfBytes);
        
        // Load WASM module
        const wasmInstance = await loadWasmModule();
        
        let extractedText = '';
        let engine = '';
        let wasmError = null;
        
        if (wasmInstance && wasmInstance.exports.extract_text_from_pdf) {
            try {
                // Try WASM extraction
                extractedText = wasmInstance.exports.extract_text_from_pdf(byteArray);
                engine = 'MoonBit WASM';
            } catch (error) {
                wasmError = error.message;
                extractedText = extractTextFromPDFJS(pdfBytes);
                engine = 'JavaScript Fallback';
            }
        } else {
            extractedText = extractTextFromPDFJS(pdfBytes);
            engine = 'JavaScript Fallback';
        }
        
        // Validate PDF
        const isValidPDF = pdfBytes[0] === 0x25 && pdfBytes[1] === 0x50 && 
                          pdfBytes[2] === 0x44 && pdfBytes[3] === 0x46;
        const version = isValidPDF ? 
            `${String.fromCharCode(pdfBytes[5])}.${String.fromCharCode(pdfBytes[7])}` : 'Unknown';
        
        if (debugMode) {
            // YAML debug output
            console.log('---');
            console.log('pdf_info:');
            console.log(`  file: ${pdfPath}`);
            console.log(`  size: ${pdfBytes.length}`);
            console.log(`  valid: ${isValidPDF}`);
            console.log(`  version: "${version}"`);
            console.log('');
            console.log('extraction:');
            console.log(`  engine: "${engine}"`);
            console.log(`  characters: ${extractedText.length}`);
            if (wasmError) {
                console.log(`  wasm_error: "${wasmError}"`);
            }
            console.log('');
            console.log('objects:');
            console.log(`  count: ${countPDFObjects(pdfBytes)}`);
            console.log(`  streams: ${countPDFStreams(pdfBytes)}`);
            console.log('');
            console.log('header_bytes:');
            console.log(`  - [${Array.from(pdfBytes.slice(0, 20)).join(', ')}]`);
            console.log('');
            console.log('markdown: |');
            if (extractedText.trim()) {
                extractedText.split('\n').forEach(line => {
                    console.log('  ' + line);
                });
            } else {
                console.log('  (No readable text found)');
            }
            console.log('...');
        } else {
            // Normal mode - just output markdown
            if (extractedText.trim()) {
                console.log(extractedText);
            } else {
                console.log('(No readable text found)');
            }
        }
        
    } catch (error) {
        if (debugMode) {
            console.log('---');
            console.log('error:');
            console.log(`  message: "${error.message}"`);
            console.log(`  stack: |`);
            error.stack.split('\n').forEach(line => {
                console.log('    ' + line);
            });
            console.log('...');
        } else {
            console.error(`Error: ${error.message}`);
        }
        process.exit(1);
    }
}

// Helper to count PDF objects
function countPDFObjects(bytes) {
    let count = 0;
    const objPattern = [111, 98, 106]; // "obj" in ASCII
    
    for (let i = 0; i < bytes.length - 3; i++) {
        if (bytes[i] === objPattern[0] && 
            bytes[i + 1] === objPattern[1] && 
            bytes[i + 2] === objPattern[2]) {
            count++;
        }
    }
    return count;
}

// Helper to count PDF streams
function countPDFStreams(bytes) {
    let count = 0;
    const streamPattern = [115, 116, 114, 101, 97, 109]; // "stream" in ASCII
    
    for (let i = 0; i < bytes.length - 6; i++) {
        if (bytes[i] === streamPattern[0] && 
            bytes[i + 1] === streamPattern[1] && 
            bytes[i + 2] === streamPattern[2] &&
            bytes[i + 3] === streamPattern[3] &&
            bytes[i + 4] === streamPattern[4] &&
            bytes[i + 5] === streamPattern[5]) {
            count++;
        }
    }
    return count;
}

// CLI usage
const args = process.argv.slice(2);
const debugMode = args.includes('--debug');
const pdfPath = args.find(arg => !arg.startsWith('--'));

if (!pdfPath) {
    console.log('Usage: bun parse-pdf.js <pdf-file> [--debug]');
    console.log('');
    console.log('Examples:');
    console.log('  bun parse-pdf.js examples/sample1.pdf');
    console.log('  bun parse-pdf.js examples/sample2.pdf');
    console.log('  bun parse-pdf.js examples/sample1.pdf --debug');
    console.log('');
    console.log('Options:');
    console.log('  --debug    Output detailed YAML debugging information');
    process.exit(1);
}

parsePDF(resolve(pdfPath), debugMode);