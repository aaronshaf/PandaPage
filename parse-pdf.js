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
                        extractedText += text[1] + ' ';
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
                                extractedText += cleanStr + ' ';
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Fallback: look for any readable text patterns
    if (!extractedText.trim()) {
        // Find sequences of printable ASCII characters
        const readableText = pdfString.match(/[a-zA-Z0-9\\s.,!?;:'"()-]{10,}/g);
        if (readableText) {
            extractedText = readableText.slice(0, 10).join('\\n');
        }
    }
    
    // Clean up the extracted text
    return extractedText
        .replace(/\\s+/g, ' ')
        .trim();
}

async function parsePDF(pdfPath) {
    try {
        // Read PDF file
        const pdfBytes = readFileSync(pdfPath);
        const byteArray = Array.from(pdfBytes);
        
        console.log(`📄 Processing: ${pdfPath} (${pdfBytes.length} bytes)`);
        
        // Load WASM module
        const wasmInstance = await loadWasmModule();
        
        let extractedText = '';
        let engine = '';
        
        if (wasmInstance && wasmInstance.exports.extract_text_from_pdf) {
            try {
                // Try WASM extraction
                extractedText = wasmInstance.exports.extract_text_from_pdf(byteArray);
                engine = '🦀 MoonBit WASM';
                console.log('✅ WASM extraction successful');
            } catch (wasmError) {
                console.warn('⚠️ WASM extraction failed, falling back to JS:', wasmError.message);
                extractedText = extractTextFromPDFJS(pdfBytes);
                engine = '📄 JavaScript Fallback';
            }
        } else {
            console.warn('⚠️ WASM module not available, using JS fallback');
            extractedText = extractTextFromPDFJS(pdfBytes);
            engine = '📄 JavaScript Fallback';
        }
        
        // Validate PDF
        const isValidPDF = pdfBytes[0] === 0x25 && pdfBytes[1] === 0x50 && 
                          pdfBytes[2] === 0x44 && pdfBytes[3] === 0x46;
        const version = isValidPDF ? 
            `${String.fromCharCode(pdfBytes[5])}.${String.fromCharCode(pdfBytes[7])}` : 'Unknown';
        
        console.log(`🔧 Engine: ${engine}`);
        console.log(`📋 PDF Valid: ${isValidPDF ? '✅' : '❌'} | Version: ${version}`);
        console.log(`📝 Extracted ${extractedText.length} characters`);
        console.log('\\n' + '='.repeat(60));
        console.log('MARKDOWN OUTPUT:');
        console.log('='.repeat(60));
        
        if (extractedText.trim()) {
            console.log(extractedText);
        } else {
            console.log('(No readable text found)');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// CLI usage
const pdfPath = process.argv[2];

if (!pdfPath) {
    console.log('Usage: bun parse-pdf.js <pdf-file>');
    console.log('');
    console.log('Examples:');
    console.log('  bun parse-pdf.js examples/sample1.pdf');
    console.log('  bun parse-pdf.js examples/sample2.pdf');
    process.exit(1);
}

parsePDF(resolve(pdfPath));