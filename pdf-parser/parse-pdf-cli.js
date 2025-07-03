#!/usr/bin/env node

// Minimal Node.js wrapper for MoonBit-generated WASM
// This bridges Node.js file I/O with our MoonBit PDF parser

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load WASM module
async function loadWasm() {
    const wasmPath = resolve(__dirname, '../pdf-parser.wasm');
    const wasmBytes = readFileSync(wasmPath);
    
    const imports = {
        env: {},
        spectest: {
            print_char: (c) => process.stdout.write(String.fromCharCode(c)),
            print: () => process.stdout.write('\n')
        }
    };
    
    const wasmModule = await WebAssembly.instantiate(wasmBytes, imports);
    return wasmModule.instance;
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    const debugMode = args.includes('--debug');
    const pdfPath = args.find(arg => !arg.startsWith('--'));
    
    if (!pdfPath) {
        console.log('Usage: node parse-pdf-cli.js <pdf-file> [--debug]');
        console.log('');
        console.log('Options:');
        console.log('  --debug    Output detailed YAML debugging information');
        process.exit(1);
    }
    
    try {
        // Load PDF file
        const pdfBytes = readFileSync(resolve(pdfPath));
        const byteArray = Array.from(pdfBytes);
        
        // Load WASM
        const wasm = await loadWasm();
        
        if (wasm.exports.extract_text_from_pdf) {
            const extractedText = wasm.exports.extract_text_from_pdf(byteArray);
            
            if (debugMode) {
                // Output YAML debug info
                console.log('---');
                console.log('pdf_info:');
                console.log(`  file: ${pdfPath}`);
                console.log(`  size: ${pdfBytes.length}`);
                console.log(`  valid: ${pdfBytes[0] === 0x25 && pdfBytes[1] === 0x50 && pdfBytes[2] === 0x44 && pdfBytes[3] === 0x46}`);
                console.log('');
                console.log('extraction:');
                console.log('  engine: "MoonBit WASM"');
                console.log(`  characters: ${extractedText.length}`);
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
                console.log(extractedText || '(No readable text found)');
            }
        } else {
            console.error('Error: WASM module missing extract_text_from_pdf function');
            process.exit(1);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

main();