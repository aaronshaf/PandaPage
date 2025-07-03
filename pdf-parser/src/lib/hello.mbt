pub fn parse_pdf_basic(data: Array[Int]) -> String {
  match parse_pdf_header(data) {
    Ok(version) => "PDF Version: " + version
    Err(error) => "Error: " + error
  }
}
