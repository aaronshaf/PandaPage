test "test_wasm" {
  if @lib.test_wasm() != "WASM is working! 🎉" {
    fail("@lib.test_wasm() failed")
  }
}

test "test_numbers" {
  if @lib.test_numbers(5, 3) != 8 {
    fail("@lib.test_numbers(5, 3) != 8")
  }
}

test "get_parser_info" {
  let info = @lib.get_parser_info()
  if info.contains("PDFWasm Parser") == false {
    fail("Parser info doesn't contain expected text")
  }
}

test "extract_unicode_hex" {
  // Test extracting "Dummy PDF file" from Unicode hex
  let hex_data = "FEFF00440075006D006D00790020005000440046002000660069006C0065"
  
  // Create a simple PDF-like structure with BT/ET and the hex string
  let test_data : Array[Int] = []
  
  // Add "BT" (Begin Text)
  test_data.push(66) // B
  test_data.push(84) // T
  test_data.push(10) // newline
  
  // Add "(" 
  test_data.push(40) // (
  
  // Add the hex string
  for i = 0; i < hex_data.length(); i = i + 1 {
    test_data.push(hex_data.charcode_at(i))
  }
  
  // Add ")Tj"
  test_data.push(41) // )
  test_data.push(84) // T
  test_data.push(106) // j
  test_data.push(10) // newline
  
  // Add "ET" (End Text)
  test_data.push(69) // E
  test_data.push(84) // T
  
  let result = @lib.extract_text_from_pdf(test_data)
  if result.contains("Dummy PDF file") == false {
    fail("Failed to extract Unicode text: \{result}")
  }
}