// PDF text extraction functions for WASM

pub fn test_wasm() -> String {
  "WASM is working! 🎉"
}

pub fn test_numbers(a: Int, b: Int) -> Int {
  a + b
}

pub fn get_parser_info() -> String {
  "PDFWasm Parser v0.1.0 - MoonBit + WebAssembly"
}

// PDF metadata structure
struct PDFMetadata {
  title: String
  author: String
  creation_date: String
  producer: String
  creator: String
}

// Extract text from PDF byte array and format as Markdown
pub fn extract_text_from_pdf(data: Array[Int]) -> String {
  let mut markdown_text = ""
  let mut i = 0
  let text_blocks : Array[TextBlock] = []
  
  // First, extract metadata for front matter
  let metadata = extract_pdf_metadata(data)
  
  // Look for content streams and decompress them
  let content_streams = find_content_streams(data)
  
  // Process each content stream
  for stream_info in content_streams {
    match stream_info {
      (stream_data, filter) => {
        // Try to decompress the stream
        let processed_data = match decompress_stream(stream_data, filter) {
          Ok(decompressed) => decompressed
          Err(_) => stream_data  // Use raw data if decompression fails
        }
        
        // Extract text from the processed stream
        let mut j = 0
        while j < processed_data.length() - 1 {
          if processed_data[j] == 66 && processed_data[j + 1] == 84 { // "BT" in ASCII
            let text_block = extract_text_block_with_info(processed_data, j)
            if text_block.text != "" {
              text_blocks.push(text_block)
            }
          }
          j = j + 1
        }
      }
    }
  }
  
  // If no streams found, try direct extraction (for simple PDFs)
  if content_streams.length() == 0 {
    while i < data.length() - 1 {
      if data[i] == 66 && data[i + 1] == 84 { // "BT" in ASCII
        let text_block = extract_text_block_with_info(data, i)
        if text_block.text != "" {
          text_blocks.push(text_block)
        }
      }
      i = i + 1
    }
  }
  
  // Second pass: format as markdown
  markdown_text = format_as_markdown(text_blocks)
  
  if markdown_text == "" {
    markdown_text = extract_fallback_text(data)
  }
  
  // Add front matter if we have metadata
  if metadata.title != "" || metadata.author != "" || metadata.creation_date != "" {
    let front_matter = format_front_matter(metadata)
    markdown_text = front_matter + "\n" + markdown_text
  }
  
  if markdown_text.length() > 3000 {
    markdown_text.substring(start=0, end=3000)
  } else {
    markdown_text
  }
}

// Text block with positioning and font info
struct TextBlock {
  text: String
  font_size: Double
  x_pos: Double
  y_pos: Double
  is_bold: Bool
}

// Extract text block with positioning and font information
fn extract_text_block_with_info(data: Array[Int], start: Int) -> TextBlock {
  let mut text = ""
  let font_size = 12.0
  let x_pos = 0.0
  let y_pos = 0.0
  let is_bold = false
  let mut i = start + 2  // Skip past "BT"
  
  // Look for font size commands (e.g., "/F1 24 Tf")
  while i < data.length() - 2 {
    // Look for "ET" (End Text) to stop
    if data[i] == 69 && data[i + 1] == 84 {
      break
    }
    
    // Look for font size pattern: number followed by "Tf"
    if i + 2 < data.length() && data[i + 1] == 84 && data[i + 2] == 102 { // "Tf"
      // font_size = extract_font_size_before(data, i) // Skip for now
    }
    
    // Look for text positioning "Td" command
    if i + 1 < data.length() && data[i] == 84 && data[i + 1] == 100 { // "Td"
      // let pos = extract_position_before(data, i) // Skip for now
      // x_pos = pos.0
      // y_pos = pos.1
    }
    
    // Look for ")" followed by "Tj" pattern
    if data[i] == 41 && i + 2 < data.length() && 
       data[i + 1] == 84 && data[i + 2] == 106 { // ")Tj"
      
      // Extract text before this point
      let extracted = extract_string_before_position(data, i)
      if extracted != "" {
        text = text + extracted + " "
      }
    }
    
    i = i + 1
  }
  
  { text, font_size, x_pos, y_pos, is_bold }
}

// Extract text from a BT...ET block (legacy function)
fn extract_text_block(data: Array[Int], start: Int) -> String {
  let block = extract_text_block_with_info(data, start)
  block.text
}

// Extract string content before a given position (look backwards for opening parenthesis)
fn extract_string_before_position(data: Array[Int], end_pos: Int) -> String {
  let mut start_pos = end_pos - 1
  let mut result = ""
  
  // Find opening parenthesis
  while start_pos >= 0 && data[start_pos] != 40 { // "(" in ASCII
    start_pos = start_pos - 1
  }
  
  if start_pos >= 0 && data[start_pos] == 40 {
    // Extract string between parentheses
    let mut hex_string = ""
    for j = start_pos + 1; j < end_pos; j = j + 1 {
      let char_code = data[j]
      if char_code >= 32 && char_code <= 126 { // Printable ASCII
        hex_string = hex_string + Int::unsafe_to_char(char_code).to_string()
      }
    }
    
    // Check if it's a Unicode hex string (starts with FEFF)
    if hex_string.has_prefix("FEFF") || hex_string.has_prefix("feff") {
      result = decode_unicode_hex(hex_string)
    } else {
      result = hex_string
    }
  }
  
  result
}

// Decode Unicode hex string (FEFF0044 = 'D')
pub fn decode_unicode_hex(hex_string: String) -> String {
  let mut clean_hex = hex_string
  
  // Remove BOM if present
  if clean_hex.has_prefix("FEFF") || clean_hex.has_prefix("feff") {
    clean_hex = clean_hex.substring(start=4)
  }
  
  let mut result = ""
  let mut i = 0
  
  // Process each 4-character chunk as a UTF-16 code unit
  while i + 3 < clean_hex.length() {
    let hex_chunk = clean_hex.substring(start=i, end=i+4)
    
    // Convert hex to integer
    match parse_hex(hex_chunk) {
      Some(code_unit) => {
        if code_unit > 0 && code_unit < 65536 {
          result = result + Int::unsafe_to_char(code_unit).to_string()
        }
      }
      None => ()
    }
    
    i = i + 4
  }
  
  result
}

// Parse hex string to integer using MoonBit's strconv
fn parse_hex(hex: String) -> Option[Int] {
  // MoonBit should have hex parsing in strconv
  // For now, implement manually
  let mut value = 0
  
  for i = 0; i < hex.length(); i = i + 1 {
    let c_code = hex.charcode_at(i)
    let c = Int::unsafe_to_char(c_code)
    let digit = if c >= '0' && c <= '9' {
      c.to_int() - '0'.to_int()
    } else if c >= 'A' && c <= 'F' {
      c.to_int() - 'A'.to_int() + 10
    } else if c >= 'a' && c <= 'f' {
      c.to_int() - 'a'.to_int() + 10
    } else {
      return None
    }
    
    value = value * 16 + digit
  }
  
  Some(value)
}

// Fallback text extraction - look for readable ASCII sequences
fn extract_fallback_text(data: Array[Int]) -> String {
  let mut text = ""
  let mut current_word = ""
  
  for i = 0; i < data.length(); i = i + 1 {
    let byte = data[i]
    
    if byte >= 32 && byte <= 126 { // Printable ASCII
      current_word = current_word + Int::unsafe_to_char(byte).to_string()
    } else {
      if current_word.length() >= 3 { // Only keep words with 3+ chars
        text = text + current_word + " "
      }
      current_word = ""
    }
    
    if text.length() > 1500 { // Limit fallback extraction
      break
    }
  }
  
  text
}

// Format text blocks as markdown
fn format_as_markdown(blocks: Array[TextBlock]) -> String {
  let mut markdown = ""
  let mut current_paragraph = ""
  
  for i = 0; i < blocks.length(); i = i + 1 {
    let block = blocks[i]
    let text = block.text
    
    if text != "" {
      // For now, treat all text as paragraphs
      // TODO: Add heading detection based on font size
      if current_paragraph == "" {
        current_paragraph = text + " "
      } else {
        current_paragraph = current_paragraph + text + " "
      }
      
      // Add paragraph breaks every few text blocks for readability
      if i % 5 == 4 && current_paragraph != "" {
        markdown = markdown + current_paragraph + "\n\n"
        current_paragraph = ""
      }
    }
  }
  
  // Flush final paragraph
  if current_paragraph != "" {
    markdown = markdown + current_paragraph + "\n\n"
  }
  
  markdown
}

// Extract font size from bytes before a position
fn extract_font_size_before(data: Array[Int], pos: Int) -> Double {
  let mut i = pos - 1
  let mut size_str = ""
  
  // Look backwards for space, then collect digits
  while i >= 0 && data[i] != 32 { // space
    i = i - 1
  }
  
  if i >= 0 {
    i = i + 1
    while i < pos && data[i] >= 48 && data[i] <= 57 { // digits 0-9
      size_str = size_str + Int::unsafe_to_char(data[i]).to_string()
      i = i + 1
    }
  }
  
  if size_str != "" {
    // Simple string to double conversion for basic sizes
    match size_str {
      "24" => 24.0
      "18" => 18.0
      "16" => 16.0
      "14" => 14.0
      "12" => 12.0
      "10" => 10.0
      _ => 12.0
    }
  } else {
    12.0
  }
}

// Extract position coordinates before a Td command
fn extract_position_before(data: Array[Int], pos: Int) -> (Double, Double) {
  // Simplified - just return default positions for now
  (0.0, 0.0)
}

// Helper function to find streams
fn find_pdf_streams(data: Array[Int]) -> Int {
  let mut count = 0
  let stream_pattern = [115, 116, 114, 101, 97, 109] // "stream" in ASCII
  
  for i = 0; i < data.length() - 6; i = i + 1 {
    if data[i] == stream_pattern[0] && 
       data[i + 1] == stream_pattern[1] && 
       data[i + 2] == stream_pattern[2] &&
       data[i + 3] == stream_pattern[3] &&
       data[i + 4] == stream_pattern[4] &&
       data[i + 5] == stream_pattern[5] {
      count = count + 1
    }
  }
  
  count
}

// Extract PDF metadata from Info dictionary
fn extract_pdf_metadata(data: Array[Int]) -> PDFMetadata {
  let mut title = ""
  let mut author = ""
  let mut creation_date = ""
  let mut producer = ""
  let mut creator = ""
  
  // Look for common metadata patterns
  // /Title<FEFF...>, /Author<FEFF...>, etc.
  let mut i = 0
  while i < data.length() - 10 {
    // Check for /Title
    if data[i] == 47 && data[i + 1] == 84 && data[i + 2] == 105 && 
       data[i + 3] == 116 && data[i + 4] == 108 && data[i + 5] == 101 { // "/Title"
      title = extract_metadata_value(data, i + 6)
    }
    
    // Check for /Author  
    if data[i] == 47 && data[i + 1] == 65 && data[i + 2] == 117 && 
       data[i + 3] == 116 && data[i + 4] == 104 && data[i + 5] == 111 && 
       data[i + 6] == 114 { // "/Author"
      author = extract_metadata_value(data, i + 7)
    }
    
    // Check for /Creator
    if data[i] == 47 && data[i + 1] == 67 && data[i + 2] == 114 && 
       data[i + 3] == 101 && data[i + 4] == 97 && data[i + 5] == 116 && 
       data[i + 6] == 111 && data[i + 7] == 114 { // "/Creator"
      creator = extract_metadata_value(data, i + 8)
    }
    
    // Check for /Producer
    if data[i] == 47 && data[i + 1] == 80 && data[i + 2] == 114 && 
       data[i + 3] == 111 && data[i + 4] == 100 && data[i + 5] == 117 && 
       data[i + 6] == 99 && data[i + 7] == 101 && data[i + 8] == 114 { // "/Producer"
      producer = extract_metadata_value(data, i + 9)
    }
    
    // Check for /CreationDate
    if data[i] == 47 && data[i + 1] == 67 && data[i + 2] == 114 && 
       data[i + 3] == 101 && data[i + 4] == 97 && data[i + 5] == 116 && 
       data[i + 6] == 105 && data[i + 7] == 111 && data[i + 8] == 110 { // "/Creation"
      creation_date = extract_metadata_date(data, i + 13)
    }
    
    i = i + 1
  }
  
  { title, author, creation_date, producer, creator }
}

// Extract metadata value after a field name
fn extract_metadata_value(data: Array[Int], start: Int) -> String {
  let mut i = start
  
  // Skip whitespace
  while i < data.length() && data[i] == 32 {
    i = i + 1
  }
  
  if i < data.length() && data[i] == 60 { // '<' for hex string
    i = i + 1
    let mut hex_str = ""
    
    // Collect hex characters until '>'
    while i < data.length() && data[i] != 62 { // '>'
      hex_str = hex_str + Int::unsafe_to_char(data[i]).to_string()
      i = i + 1
    }
    
    // Check if it's Unicode hex
    if hex_str.has_prefix("FEFF") || hex_str.has_prefix("feff") {
      decode_unicode_hex(hex_str)
    } else {
      hex_str
    }
  } else if i < data.length() && data[i] == 40 { // '(' for literal string
    i = i + 1
    let mut str_val = ""
    
    // Collect characters until ')'
    while i < data.length() && data[i] != 41 { // ')'
      str_val = str_val + Int::unsafe_to_char(data[i]).to_string()
      i = i + 1
    }
    
    str_val
  } else {
    ""
  }
}

// Extract date value
fn extract_metadata_date(data: Array[Int], start: Int) -> String {
  let mut i = start
  
  // Skip whitespace
  while i < data.length() && data[i] == 32 {
    i = i + 1
  }
  
  if i < data.length() && data[i] == 40 { // '(' for date string
    i = i + 1
    let mut date_str = ""
    
    // Collect characters until ')'
    while i < data.length() && data[i] != 41 { // ')'
      if data[i] >= 32 && data[i] <= 126 {
        date_str = date_str + Int::unsafe_to_char(data[i]).to_string()
      }
      i = i + 1
    }
    
    // Format PDF date (D:YYYYMMDDHHmmSSOHH'mm') to readable format
    if date_str.has_prefix("D:") && date_str.length() >= 10 {
      let year = date_str.substring(start=2, end=6)
      let month = date_str.substring(start=6, end=8)
      let day = date_str.substring(start=8, end=10)
      year + "-" + month + "-" + day
    } else {
      date_str
    }
  } else {
    ""
  }
}

// Format metadata as YAML front matter
fn format_front_matter(metadata: PDFMetadata) -> String {
  let mut front_matter = "---\n"
  
  if metadata.title != "" {
    front_matter = front_matter + "title: \"" + metadata.title + "\"\n"
  }
  
  if metadata.author != "" {
    front_matter = front_matter + "author: \"" + metadata.author + "\"\n"
  }
  
  if metadata.creation_date != "" {
    front_matter = front_matter + "date: \"" + metadata.creation_date + "\"\n"
  }
  
  if metadata.creator != "" {
    front_matter = front_matter + "generator: \"" + metadata.creator + "\"\n"
  }
  
  if metadata.producer != "" {
    front_matter = front_matter + "pdf_producer: \"" + metadata.producer + "\"\n"
  }
  
  front_matter = front_matter + "---\n"
  
  front_matter
}

// Find all content streams in the PDF
fn find_content_streams(data: Array[Int]) -> Array[(Array[Int], StreamFilter)] {
  let streams : Array[(Array[Int], StreamFilter)] = []
  let mut i = 0
  
  while i < data.length() {
    // Look for stream objects
    match extract_stream_content(data, i) {
      Ok((stream_data, filter)) => {
        streams.push((stream_data, filter))
        // Skip past this stream
        i = i + stream_data.length() + 20  // Rough estimate
      }
      Err(_) => {
        i = i + 1
      }
    }
  }
  
  streams
}
