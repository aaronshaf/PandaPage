import { Effect, Stream, Chunk } from "effect";
import { PdfInput, PdfMetadata } from "./types";
import { debug } from "./debug";

// Error types
export class PdfReadError {
  readonly _tag = "PdfReadError";
  constructor(readonly message: string, readonly cause?: unknown) {}
}

export class PdfParseError {
  readonly _tag = "PdfParseError";
  constructor(readonly message: string, readonly cause?: unknown) {}
}

// Convert various input types to ArrayBuffer
export const toArrayBuffer = (input: PdfInput): Effect.Effect<ArrayBuffer, PdfReadError> =>
  Effect.gen(function* () {
    if (input instanceof ArrayBuffer) {
      return input;
    }
    
    if (input instanceof Blob || input instanceof File) {
      try {
        return yield* Effect.promise(() => input.arrayBuffer());
      } catch (error) {
        return yield* Effect.fail(new PdfReadError("Failed to read blob/file", error));
      }
    }
    
    if (input instanceof ReadableStream) {
      try {
        const reader = input.getReader();
        const chunks: Uint8Array[] = [];
        
        while (true) {
          const { done, value } = yield* Effect.promise(() => reader.read());
          if (done) break;
          chunks.push(value);
        }
        
        // Combine chunks into single ArrayBuffer
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        
        return result.buffer;
      } catch (error) {
        return yield* Effect.fail(new PdfReadError("Failed to read stream", error));
      }
    }
    
    if (typeof input === "string" || input instanceof URL) {
      // In browser, fetch the file
      const url = input instanceof URL ? input : new URL(input, window.location.href);
      
      try {
        const response = yield* Effect.promise(() => fetch(url));
        if (!response.ok) {
          return yield* Effect.fail(new PdfReadError(`Failed to fetch: ${response.statusText}`));
        }
        return yield* Effect.promise(() => response.arrayBuffer());
      } catch (error) {
        return yield* Effect.fail(new PdfReadError("Failed to fetch PDF", error));
      }
    }
    
    return yield* Effect.fail(new PdfReadError("Unsupported input type"));
  });

// Convert ArrayBuffer to Stream of chunks for streaming processing
export const toChunkStream = (
  buffer: ArrayBuffer,
  chunkSize: number = 1024 * 16 // 16KB chunks
): Stream.Stream<Chunk.Chunk<number>, never> => {
  const uint8Array = new Uint8Array(buffer);
  const chunks: Chunk.Chunk<number>[] = [];
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const end = Math.min(i + chunkSize, uint8Array.length);
    const chunk = Array.from(uint8Array.slice(i, end));
    chunks.push(Chunk.fromIterable(chunk));
  }
  
  return Stream.fromIterable(chunks);
};

// Basic PDF structure validation
export const validatePdfHeader = (buffer: ArrayBuffer): Effect.Effect<boolean, PdfParseError> =>
  Effect.gen(function* () {
    const bytes = new Uint8Array(buffer);
    
    // PDF files start with %PDF-
    const header = String.fromCharCode(...bytes.slice(0, 5));
    if (!header.startsWith("%PDF-")) {
      return yield* Effect.fail(new PdfParseError("Invalid PDF header"));
    }
    
    return true;
  });

// Parse PDF to extract basic structure
export const parsePdfStructure = (buffer: ArrayBuffer): Effect.Effect<{
  version: string;
  objects: Map<string, any>;
  trailer: any;
}, PdfParseError> =>
  Effect.gen(function* () {
    const bytes = new Uint8Array(buffer);
    const text = new TextDecoder('latin1').decode(bytes);
    
    // Extract PDF version
    const versionMatch = text.match(/%PDF-(\d\.\d)/);
    const version = versionMatch ? versionMatch[1] : "1.4";
    
    // Find trailer section (contains reference to document info)
    const trailerPatterns = [
      /trailer\s*<<([^>]+)>>/,
      /trailer\s*<<([\s\S]*?)>>/,
      /trailer[\s\n]*<<([^>]+)>>/,
      /trailer[\s\n]*<<([\s\S]*?)>>/
    ];
    
    let trailerMatch = null;
    let trailer: any = {};
    
    for (const pattern of trailerPatterns) {
      trailerMatch = text.match(pattern);
      if (trailerMatch) break;
    }
    
    if (trailerMatch) {
      // Parse trailer dictionary
      const trailerContent = trailerMatch[1];
      const infoMatch = trailerContent.match(/\/Info\s+(\d+)\s+\d+\s+R/);
      if (infoMatch) {
        trailer.infoRef = infoMatch[1];
      }
    }
    
    return {
      version,
      objects: new Map(),
      trailer
    };
  });

// Extract metadata from PDF Info dictionary
export const extractMetadata = (buffer: ArrayBuffer): Effect.Effect<PdfMetadata, PdfParseError> =>
  Effect.gen(function* () {
    debug.log("Extracting PDF metadata...");
    
    const structure = yield* parsePdfStructure(buffer);
    const text = new TextDecoder('latin1').decode(new Uint8Array(buffer));
    
    // Default metadata
    let metadata: PdfMetadata = {
      pageCount: 1,
      title: undefined,
      author: undefined,
    };
    
    // Try to extract Info dictionary
    if (structure.trailer.infoRef) {
      debug.log(`Looking for Info object ${structure.trailer.infoRef}`);
      
      // Try different patterns to match the Info object
      const patterns = [
        new RegExp(`${structure.trailer.infoRef}\\s+\\d+\\s+obj\\s*<<([^>]+)>>`, 's'),
        new RegExp(`${structure.trailer.infoRef}\\s+\\d+\\s+obj\\s*<<([\\s\\S]*?)>>`, ''),
        new RegExp(`${structure.trailer.infoRef}\\s+\\d+\\s+obj[\\s\\S]*?<<([\\s\\S]*?)>>[\\s\\S]*?endobj`, ''),
      ];
      
      let infoMatch = null;
      for (const pattern of patterns) {
        infoMatch = text.match(pattern);
        if (infoMatch) {
          debug.log(`Found Info object with pattern`);
          break;
        }
      }
      
      if (infoMatch) {
        const infoContent = infoMatch[1];
        
        // Helper function to extract PDF string values (handles escaped parens)
        const extractPdfString = (content: string, key: string): string | undefined => {
          // Match hex strings
          const hexMatch = content.match(new RegExp(`\\/${key}\\s*<([0-9A-Fa-f]+)>`));
          if (hexMatch) {
            return decodeHexString(hexMatch[1]);
          }
          
          // Match regular strings with proper escaped parentheses handling
          // This regex matches balanced parentheses and handles escaped ones
          const stringMatch = content.match(new RegExp(`\\/${key}\\s*\\(([^\\)\\\\]*(?:\\\\.[^\\)\\\\]*)*)\\)`));
          if (stringMatch) {
            return decodeString(stringMatch[1]);
          }
          
          return undefined;
        };
        
        // Extract title
        const title = extractPdfString(infoContent, 'Title');
        if (title) metadata.title = title;
        
        // Extract author
        const author = extractPdfString(infoContent, 'Author');
        if (author) metadata.author = author;
        
        // Extract creator
        const creator = extractPdfString(infoContent, 'Creator');
        if (creator) metadata.creator = creator;
        
        // Extract producer
        const producer = extractPdfString(infoContent, 'Producer');
        if (producer) metadata.producer = producer;
        
        // Extract creation date
        const creationMatch = infoContent.match(/\/CreationDate\s*\((D:\d{14}[^)]*)\)/);
        if (creationMatch) {
          const dateStr = creationMatch[1];
          metadata.creationDate = parsePdfDate(dateStr);
        }
      }
    }
    
    // Count pages by looking for Page objects
    const pageMatches = text.match(/\/Type\s*\/Page(?!\w)/g);
    if (pageMatches) {
      metadata.pageCount = pageMatches.length;
    }
    
    return metadata;
  });

// Helper to decode PDF strings (handle escape sequences)
const decodeString = (str: string): string => {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
};

// Helper to parse PDF date format (D:YYYYMMDDHHmmSS+HH'mm')
const parsePdfDate = (dateStr: string): Date => {
  // Remove the "D:" prefix
  dateStr = dateStr.replace(/^D:/, '');
  
  const year = parseInt(dateStr.substr(0, 4));
  const month = parseInt(dateStr.substr(4, 2)) - 1;
  const day = parseInt(dateStr.substr(6, 2));
  const hour = parseInt(dateStr.substr(8, 2)) || 0;
  const minute = parseInt(dateStr.substr(10, 2)) || 0;
  const second = parseInt(dateStr.substr(12, 2)) || 0;
  
  // For simplicity, create the date in local time
  // This ensures the date displays correctly
  return new Date(year, month, day, hour, minute, second);
};

// Helper to decode hex strings from PDF (often UTF-16BE)
const decodeHexString = (hex: string): string => {
  // Remove any whitespace
  hex = hex.replace(/\s/g, '');
  
  // Check for UTF-16BE BOM (FEFF)
  if (hex.startsWith('FEFF') || hex.startsWith('feff')) {
    // UTF-16BE encoded
    hex = hex.substring(4); // Skip BOM
    let result = '';
    
    // Process UTF-16BE pairs
    for (let i = 0; i < hex.length; i += 4) {
      if (i + 3 < hex.length) {
        const codePoint = parseInt(hex.substr(i, 4), 16);
        result += String.fromCharCode(codePoint);
      }
    }
    
    return result;
  } else {
    // Try as regular hex-encoded ASCII
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
      const byte = parseInt(hex.substr(i, 2), 16);
      result += String.fromCharCode(byte);
    }
    return result;
  }
};