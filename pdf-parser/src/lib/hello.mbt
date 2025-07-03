// Simple WASM exports - will be called through main
pub fn test_wasm() -> String {
  "WASM is working! 🎉"
}

pub fn test_numbers(a: Int, b: Int) -> Int {
  a + b
}

pub fn get_parser_info() -> String {
  "PDFWasm Parser v0.1.0 - MoonBit + WebAssembly"
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
