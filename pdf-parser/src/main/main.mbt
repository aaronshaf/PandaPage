fn main {
  println(@lib.test_wasm())
  println(@lib.get_parser_info())
  println("Test addition: " + @lib.test_numbers(5, 3).to_string())
}

// Public interface functions that can be called from JavaScript
pub fn js_test_wasm() -> String {
  @lib.test_wasm()
}

pub fn js_test_numbers(a: Int, b: Int) -> Int {
  @lib.test_numbers(a, b)
}

pub fn js_get_parser_info() -> String {
  @lib.get_parser_info()
}

pub fn js_extract_text_from_pdf(data: Array[Int]) -> String {
  @lib.extract_text_from_pdf(data)
}
