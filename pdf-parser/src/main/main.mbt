fn main {
  println(@lib.test_wasm())
  println(@lib.get_parser_info())
  println("Test addition: " + @lib.test_numbers(5, 3).to_string())
}
