import * as pako from 'pako';
import { Effect } from 'effect';

// Extract and decode a PDF stream object
export function extractAndDecodeStream(
  objNum: string, 
  pdfBytes: Uint8Array,
  logging = false
): string | null {
  if (logging) console.log(`=== Starting extractAndDecodeStream for object ${objNum} ===`);
  const text = new TextDecoder('latin1').decode(pdfBytes);
  
  // Find the object start
  const objStart = text.indexOf(`${objNum} 0 obj`);
  if (logging) console.log(`Object ${objNum} search result: ${objStart}`);
  if (objStart === -1) {
    if (logging) console.log(`Object ${objNum} not found`);
    return null;
  }
  
  // Find the stream keyword
  const streamKeyword = text.indexOf('stream', objStart);
  if (logging) console.log(`Stream keyword search result: ${streamKeyword}`);
  if (streamKeyword === -1) {
    if (logging) console.log(`Stream not found in object ${objNum}`);
    return null;
  }
  
  // Extract the dictionary between << and >>
  const dictStart = text.indexOf('<<', objStart);
  const dictEnd = text.indexOf('>>', dictStart);
  if (logging) console.log(`Dictionary bounds: start=${dictStart}, end=${dictEnd}`);
  if (dictStart === -1 || dictEnd === -1) {
    if (logging) console.log(`Dictionary not found in object ${objNum}`);
    return null;
  }
  
  const dictStr = text.substring(dictStart + 2, dictEnd);
  
  // Find stream end
  const endstreamIndex = text.indexOf('endstream', streamKeyword);
  if (logging) console.log(`Endstream index: ${endstreamIndex}`);
  if (endstreamIndex === -1) {
    if (logging) console.log(`endstream not found for object ${objNum}`);
    return null;
  }
  
  // Extract binary stream data
  const streamStartBytes = streamKeyword + 6; // length of "stream"
  // Use the text-based endstream position we already found
  const streamEndBytes = endstreamIndex;
  
  if (logging) console.log(`Binary stream bounds: start=${streamStartBytes}, end=${streamEndBytes}`);
  
  // Skip the newline after stream
  let streamStart = streamStartBytes;
  if (pdfBytes[streamStart] === 0x0d && pdfBytes[streamStart + 1] === 0x0a) {
    streamStart += 2; // CRLF
  } else if (pdfBytes[streamStart] === 0x0a || pdfBytes[streamStart] === 0x0d) {
    streamStart += 1; // LF or CR
  }
  
  let streamData = pdfBytes.slice(streamStart, streamEndBytes);
  
  // Get the declared length (could be direct or indirect reference)
  const lengthMatch = dictStr.match(/\/Length\s+(\d+)(?:\s+\d+\s+R)?/);
  if (lengthMatch) {
    let declaredLength: number;
    
    // Check if it's an indirect reference
    if (dictStr.includes(`/Length ${lengthMatch[1]} 0 R`) || 
        dictStr.includes(`/Length ${lengthMatch[1]} `) && dictStr.includes(' R')) {
      // It's an indirect reference, need to look up the actual length
      const lengthObjNum = lengthMatch[1];
      const lengthObjPattern = new RegExp(`${lengthObjNum}\\s+\\d+\\s+obj\\s*(\\d+)\\s*endobj`);
      const lengthObjMatch = text.match(lengthObjPattern);
      if (lengthObjMatch) {
        declaredLength = parseInt(lengthObjMatch[1]);
        if (logging) console.log(`Resolved length reference: ${declaredLength}`);
      } else {
        declaredLength = streamData.length; // Fallback
        if (logging) console.log(`Failed to resolve length reference, using ${declaredLength}`);
      }
    } else {
      // Direct length
      declaredLength = parseInt(lengthMatch[1]);
      if (logging) console.log(`Direct length: ${declaredLength}`);
    }
    
    if (declaredLength < streamData.length) {
      streamData = streamData.slice(0, declaredLength);
      if (logging) console.log(`Trimmed stream data to declared length: ${declaredLength}`);
    }
  }
  
  // Check if compressed
  if (/\/Filter\s*\/FlateDecode/.test(dictStr)) {
    try {
      const decompressed = pako.inflate(streamData);
      if (logging) console.log(`Successfully decompressed stream, length: ${decompressed.length}`);
      return new TextDecoder('latin1').decode(decompressed);
    } catch (err) {
      if (logging) console.warn(`Failed to decompress stream ${objNum}:`, err);
      return null;
    }
  }
  
  return new TextDecoder('latin1').decode(streamData);
}

// Extract all page content streams
export function extractPageContentStreams(
  pageObj: string,
  pdfBytes: Uint8Array,
  logging = false
): Effect.Effect<string[], Error> {
  return Effect.try(() => {
    const streams: string[] = [];
    
    // Extract Contents reference
    const contentsMatch = pageObj.match(/\/Contents\s*(\[[\s\S]*?\]|(\d+)\s+\d+\s+R)/);
    if (!contentsMatch) return streams;
    
    const contentsRef = contentsMatch[1];
    
    // Handle array of content streams
    if (contentsRef.startsWith('[')) {
      const refs = contentsRef.match(/(\d+)\s+\d+\s+R/g) || [];
      for (const ref of refs) {
        const objNum = ref.match(/(\d+)/)?.[1];
        if (objNum) {
          const stream = extractAndDecodeStream(objNum, pdfBytes, logging);
          if (stream) streams.push(stream);
        }
      }
    } else {
      // Single content stream
      const objNum = contentsRef.match(/(\d+)/)?.[1];
      if (objNum) {
        const stream = extractAndDecodeStream(objNum, pdfBytes, logging);
        if (stream) streams.push(stream);
      }
    }
    
    return streams;
  });
}