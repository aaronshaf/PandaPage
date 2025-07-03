// PDF text extraction functions for WASM

pub fn test_wasm() -> String {
  "WASM is working! 🎉"
}

// Simple test function that returns markdown with front matter
pub fn test_markdown() -> String {
  "---\ntitle: \"Test PDF\"\nauthor: \"MoonBit\"\ndate: \"2024-01-01\"\n---\n\n# Test Document\n\nThis is a test from WebAssembly with YAML front matter!"
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

// Simple wrapper for JavaScript - accepts Int array one element at a time
pub fn js_init_pdf_array(size: Int) -> Int {
  // For now, just return a simple value to test
  size
}

pub fn js_add_pdf_byte(index: Int, byte: Int) -> Int {
  // For now, just return a simple value to test
  index + byte
}

pub fn js_extract_text() -> String {
  // For now, return a test string with front matter
  "---\ntitle: \"Test PDF\"\nauthor: \"Test Author\"\n---\n\nThis is a test from WASM with front matter!"
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
  
  // Sort text blocks by reading order (top-to-bottom, left-to-right)
  let sorted_blocks = sort_text_blocks_by_reading_order(text_blocks)
  
  // Detect page breaks based on Y-position analysis
  let page_detected_blocks = detect_page_breaks(sorted_blocks)
  
  // Second pass: format as markdown
  markdown_text = format_as_markdown(page_detected_blocks)
  
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
  page_number: Int
}

// Extract text block with positioning and font information
fn extract_text_block_with_info(data: Array[Int], start: Int) -> TextBlock {
  let mut text = ""
  let mut font_size = 12.0  // Default font size
  let mut x_pos = 0.0
  let mut y_pos = 0.0
  let is_bold = false
  let mut i = start + 2  // Skip past "BT"
  
  // Look for font size commands and text within the BT...ET block
  while i < data.length() - 2 {
    // Look for "ET" (End Text) to stop
    if data[i] == 69 && data[i + 1] == 84 {
      break
    }
    
    // Look for font command pattern: "Tf" preceded by font size
    if i + 2 < data.length() && data[i + 1] == 84 && data[i + 2] == 102 { // "Tf"
      font_size = extract_font_size_before(data, i)
    }
    
    // Look for text positioning "Td" command
    if i + 1 < data.length() && data[i] == 84 && data[i + 1] == 100 { // "Td"
      let pos = extract_position_before(data, i)
      x_pos = x_pos + pos.0
      y_pos = y_pos + pos.1
    }
    
    // Look for absolute positioning "Tm" command (text matrix)
    if i + 1 < data.length() && data[i] == 84 && data[i + 1] == 109 { // "Tm"
      let matrix = extract_text_matrix_before(data, i)
      x_pos = matrix.0
      y_pos = matrix.1
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
  
  { text, font_size, x_pos, y_pos, is_bold, page_number: 1 }
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

// Format text blocks as markdown with font size-based headings and page breaks
fn format_as_markdown(blocks: Array[TextBlock]) -> String {
  let mut markdown = ""
  let mut current_paragraph = ""
  let base_font_size = calculate_base_font_size(blocks)
  let mut current_page = 1
  
  for i = 0; i < blocks.length(); i = i + 1 {
    let block = blocks[i]
    let text = block.text.trim(" \t\n\r").to_string()
    
    // Check for page break
    if block.page_number > current_page {
      // Flush current paragraph before page break
      if current_paragraph != "" {
        markdown = markdown + current_paragraph.trim(" \t\n\r").to_string() + "\n\n"
        current_paragraph = ""
      }
      
      // Add page break marker
      markdown = markdown + "---\n\n**Page " + block.page_number.to_string() + "**\n\n"
      current_page = block.page_number
    }
    
    if text != "" {
      let heading_level = determine_heading_level(block.font_size, base_font_size)
      
      // Flush current paragraph before adding heading
      if heading_level > 0 && current_paragraph != "" {
        markdown = markdown + current_paragraph.trim(" \t\n\r").to_string() + "\n\n"
        current_paragraph = ""
      }
      
      if heading_level > 0 {
        // Format as heading
        let heading_prefix = generate_heading_prefix(heading_level)
        markdown = markdown + heading_prefix + " " + text + "\n\n"
      } else {
        // Accumulate as paragraph text
        if current_paragraph == "" {
          current_paragraph = text + " "
        } else {
          current_paragraph = current_paragraph + text + " "
        }
        
        // Add paragraph breaks for readability - more frequent for better structure
        if current_paragraph.length() > 200 {
          markdown = markdown + current_paragraph.trim(" \t\n\r").to_string() + "\n\n"
          current_paragraph = ""
        }
      }
    }
  }
  
  // Flush final paragraph
  if current_paragraph != "" {
    markdown = markdown + current_paragraph.trim(" \t\n\r").to_string() + "\n\n"
  }
  
  markdown
}

// Calculate the most common (base) font size in the document
fn calculate_base_font_size(blocks: Array[TextBlock]) -> Double {
  if blocks.length() == 0 {
    return 12.0
  }
  
  // Count frequency of font sizes
  let mut size_12_count = 0
  let mut size_14_count = 0
  let mut size_16_count = 0
  let mut size_18_count = 0
  let mut size_24_count = 0
  let mut other_count = 0
  
  for block in blocks {
    let size = block.font_size
    if size >= 11.5 && size <= 12.5 {
      size_12_count = size_12_count + 1
    } else if size >= 13.5 && size <= 14.5 {
      size_14_count = size_14_count + 1
    } else if size >= 15.5 && size <= 16.5 {
      size_16_count = size_16_count + 1
    } else if size >= 17.5 && size <= 18.5 {
      size_18_count = size_18_count + 1
    } else if size >= 23.0 && size <= 25.0 {
      size_24_count = size_24_count + 1
    } else {
      other_count = other_count + 1
    }
  }
  
  // Return the most common size, defaulting to 12.0
  let max_count = size_12_count
  let mut base_size = 12.0
  
  if size_14_count > max_count {
    base_size = 14.0
  }
  if size_16_count > max_count {
    base_size = 16.0
  }
  if size_18_count > max_count {
    base_size = 18.0
  }
  
  base_size
}

// Determine heading level based on font size relative to base size
fn determine_heading_level(font_size: Double, base_size: Double) -> Int {
  let size_ratio = font_size / base_size
  
  if size_ratio >= 2.0 {
    1  // # Main heading (24pt vs 12pt base)
  } else if size_ratio >= 1.5 {
    2  // ## Secondary heading (18pt vs 12pt base)
  } else if size_ratio >= 1.3 {
    3  // ### Tertiary heading (16pt vs 12pt base)
  } else if size_ratio >= 1.1 {
    4  // #### Minor heading (14pt vs 12pt base)
  } else {
    0  // Regular paragraph text
  }
}

// Generate markdown heading prefix (# ## ### ####)
fn generate_heading_prefix(level: Int) -> String {
  match level {
    1 => "#"
    2 => "##"
    3 => "###"
    4 => "####"
    5 => "#####"
    6 => "######"
    _ => "#"
  }
}

// Sort text blocks by reading order (top-to-bottom, left-to-right within lines)
fn sort_text_blocks_by_reading_order(blocks: Array[TextBlock]) -> Array[TextBlock] {
  if blocks.length() == 0 {
    return blocks
  }
  
  // Create a copy of the blocks array for sorting
  let sorted_blocks : Array[TextBlock] = []
  for block in blocks {
    sorted_blocks.push(block)
  }
  
  // Simple bubble sort implementation for reading order
  // Primary sort: Y-position (descending - higher Y values first)
  // Secondary sort: X-position (ascending - left to right)
  let mut i = 0
  while i < sorted_blocks.length() - 1 {
    let mut j = 0
    while j < sorted_blocks.length() - i - 1 {
      let current = sorted_blocks[j]
      let next = sorted_blocks[j + 1]
      
      let should_swap = 
        // If Y positions differ significantly (more than 5 units), sort by Y (descending)
        if (current.y_pos - next.y_pos).abs() > 5.0 {
          current.y_pos < next.y_pos
        } else {
          // If on same line (similar Y), sort by X (ascending)
          current.x_pos > next.x_pos
        }
      
      if should_swap {
        // Swap elements
        sorted_blocks[j] = next
        sorted_blocks[j + 1] = current
      }
      
      j = j + 1
    }
    i = i + 1
  }
  
  sorted_blocks
}

// Detect page breaks based on Y-position analysis
fn detect_page_breaks(blocks: Array[TextBlock]) -> Array[TextBlock] {
  if blocks.length() == 0 {
    return blocks
  }
  
  let result_blocks : Array[TextBlock] = []
  let mut current_page = 1
  let mut previous_y = blocks[0].y_pos
  
  for i = 0; i < blocks.length(); i = i + 1 {
    let block = blocks[i]
    let mut updated_block = block
    
    // Check for significant Y-position jump (likely page break)
    // A jump of more than 100 units upward suggests a new page
    if i > 0 && block.y_pos > previous_y + 100.0 {
      current_page = current_page + 1
    }
    
    // Update block with detected page number
    updated_block = { 
      text: block.text, 
      font_size: block.font_size, 
      x_pos: block.x_pos, 
      y_pos: block.y_pos, 
      is_bold: block.is_bold, 
      page_number: current_page 
    }
    
    result_blocks.push(updated_block)
    previous_y = block.y_pos
  }
  
  result_blocks
}

// Extract font size from bytes before a position (e.g., "/F1 24 Tf")
fn extract_font_size_before(data: Array[Int], pos: Int) -> Double {
  let mut i = pos - 1
  let mut size_str = ""
  let mut decimal_str = ""
  let mut has_decimal = false
  
  // Look backwards for space or start of number
  while i >= 0 && data[i] != 32 { // space
    i = i - 1
  }
  
  if i >= 0 {
    i = i + 1
    // Collect digits and decimal point
    while i < pos {
      let byte_val = data[i]
      if byte_val >= 48 && byte_val <= 57 { // digits 0-9
        if has_decimal {
          decimal_str = decimal_str + Int::unsafe_to_char(byte_val).to_string()
        } else {
          size_str = size_str + Int::unsafe_to_char(byte_val).to_string()
        }
      } else if byte_val == 46 && has_decimal == false { // decimal point '.'
        has_decimal = true
      } else {
        break // Stop at non-numeric character
      }
      i = i + 1
    }
  }
  
  // Convert size string to double
  if size_str != "" {
    let base_size = match size_str {
      "6" => 6.0
      "8" => 8.0
      "9" => 9.0
      "10" => 10.0
      "11" => 11.0
      "12" => 12.0
      "14" => 14.0
      "16" => 16.0
      "18" => 18.0
      "20" => 20.0
      "22" => 22.0
      "24" => 24.0
      "28" => 28.0
      "32" => 32.0
      "36" => 36.0
      "48" => 48.0
      "72" => 72.0
      _ => parse_size_fallback(size_str)
    }
    
    // Add decimal part if present
    if has_decimal && decimal_str != "" {
      let decimal_value = match decimal_str {
        "25" => 0.25
        "5" => 0.5
        "75" => 0.75
        _ => 0.0
      }
      base_size + decimal_value
    } else {
      base_size
    }
  } else {
    12.0 // Default font size
  }
}

// Fallback parser for less common font sizes
fn parse_size_fallback(size_str: String) -> Double {
  // Handle two-digit and three-digit sizes
  if size_str.length() == 2 {
    let first = size_str.charcode_at(0) - 48
    let second = size_str.charcode_at(1) - 48
    if first >= 0 && first <= 9 && second >= 0 && second <= 9 {
      (first * 10 + second).to_double()
    } else {
      12.0
    }
  } else if size_str.length() == 3 {
    let first = size_str.charcode_at(0) - 48
    let second = size_str.charcode_at(1) - 48
    let third = size_str.charcode_at(2) - 48
    if first >= 0 && first <= 9 && second >= 0 && second <= 9 && third >= 0 && third <= 9 {
      (first * 100 + second * 10 + third).to_double()
    } else {
      12.0
    }
  } else {
    12.0
  }
}

// Extract position coordinates before a Td command (x y Td)
fn extract_position_before(data: Array[Int], pos: Int) -> (Double, Double) {
  let mut i = pos - 1
  let numbers : Array[Double] = []
  let mut current_num = ""
  let mut has_decimal = false
  
  // Look backwards for up to 20 characters to find two numbers
  let start_search = if pos >= 20 { pos - 20 } else { 0 }
  
  i = start_search
  while i < pos && numbers.length() < 2 {
    let byte_val = data[i]
    
    if byte_val >= 48 && byte_val <= 57 { // digits 0-9
      current_num = current_num + Int::unsafe_to_char(byte_val).to_string()
    } else if byte_val == 46 && has_decimal == false { // decimal point '.'
      current_num = current_num + "."
      has_decimal = true
    } else if byte_val == 45 && current_num == "" { // minus sign at start
      current_num = current_num + "-"
    } else {
      // End of number - parse and store it
      if current_num != "" && current_num != "-" && current_num != "." {
        let parsed = parse_position_number(current_num)
        numbers.push(parsed)
        current_num = ""
        has_decimal = false
      }
    }
    i = i + 1
  }
  
  // Parse final number if any
  if current_num != "" && current_num != "-" && current_num != "." {
    let parsed = parse_position_number(current_num)
    numbers.push(parsed)
  }
  
  if numbers.length() >= 2 {
    (numbers[numbers.length() - 2], numbers[numbers.length() - 1])
  } else {
    (0.0, 0.0)
  }
}

// Extract text matrix coordinates before a Tm command (a b c d e f Tm)
fn extract_text_matrix_before(data: Array[Int], pos: Int) -> (Double, Double) {
  let mut i = pos - 1
  let numbers : Array[Double] = []
  let mut current_num = ""
  let mut has_decimal = false
  
  // Look backwards for up to 40 characters to find 6 numbers (we want e and f)
  let start_search = if pos >= 40 { pos - 40 } else { 0 }
  
  i = start_search
  while i < pos && numbers.length() < 6 {
    let byte_val = data[i]
    
    if byte_val >= 48 && byte_val <= 57 { // digits 0-9
      current_num = current_num + Int::unsafe_to_char(byte_val).to_string()
    } else if byte_val == 46 && has_decimal == false { // decimal point '.'
      current_num = current_num + "."
      has_decimal = true
    } else if byte_val == 45 && current_num == "" { // minus sign at start
      current_num = current_num + "-"
    } else {
      // End of number - parse and store it
      if current_num != "" && current_num != "-" && current_num != "." {
        let parsed = parse_position_number(current_num)
        numbers.push(parsed)
        current_num = ""
        has_decimal = false
      }
    }
    i = i + 1
  }
  
  // Parse final number if any
  if current_num != "" && current_num != "-" && current_num != "." {
    let parsed = parse_position_number(current_num)
    numbers.push(parsed)
  }
  
  // Return the last two numbers (e, f) which represent x, y translation
  if numbers.length() >= 2 {
    (numbers[numbers.length() - 2], numbers[numbers.length() - 1])
  } else {
    (0.0, 0.0)
  }
}

// Parse a number string to Double for positioning
fn parse_position_number(num_str: String) -> Double {
  // Simple parser for common position values
  match num_str {
    "0" => 0.0
    "1" => 1.0
    "2" => 2.0
    "3" => 3.0
    "4" => 4.0
    "5" => 5.0
    "10" => 10.0
    "12" => 12.0
    "15" => 15.0
    "20" => 20.0
    "24" => 24.0
    "25" => 25.0
    "30" => 30.0
    "36" => 36.0
    "50" => 50.0
    "72" => 72.0
    "100" => 100.0
    "200" => 200.0
    "300" => 300.0
    "400" => 400.0
    "500" => 500.0
    "600" => 600.0
    "700" => 700.0
    "800" => 800.0
    _ => {
      // Try to parse manually for other values
      if num_str.has_prefix("-") {
        -parse_position_number(num_str.substring(start=1))
      } else {
        // For now, return a reasonable default based on string length
        match num_str.length() {
          1 => 0.0
          2 => 10.0
          3 => 100.0
          _ => 0.0
        }
      }
    }
  }
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


