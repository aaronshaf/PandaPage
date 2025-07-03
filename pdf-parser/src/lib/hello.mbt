// WASM-exported functions for JavaScript interface

pub fn parse_pdf_basic(data: Array[Int]) -> String {
  match parse_pdf_header(data) {
    Ok(version) => "PDF Version: " + version
    Err(error) => "Error: " + error
  }
}

// Export for WASM: Parse PDF and return detailed analysis
pub fn analyze_pdf(data: Array[Int]) -> String {
  let header_result = parse_pdf_header(data)
  let object_count = find_pdf_objects(data).length()
  let stream_count = find_pdf_streams(data)
  
  match header_result {
    Ok(version) => {
      "{\n  \"valid\": true,\n  \"version\": \"" + version + "\",\n  \"size\": " + data.length().to_string() + ",\n  \"objects\": " + object_count.to_string() + ",\n  \"streams\": " + stream_count.to_string() + "\n}"
    }
    Err(error) => {
      "{\n  \"valid\": false,\n  \"error\": \"" + error + "\"\n}"
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
