// PDF Document Structure Types

pub enum PDFObject {
  PDFName(String)
  PDFString(String)
  PDFNumber(Int)
  PDFReal(Double)
  PDFBoolean(Bool)
  PDFNull
  PDFArray(Array[PDFObject])
  PDFDictionary(Map[String, PDFObject])
  PDFStream(Map[String, PDFObject], Array[Int])
  PDFReference(Int, Int)
}

pub struct PDFHeader {
  version : String
}

pub struct PDFXRefEntry {
  offset : Int
  generation : Int
  in_use : Bool
}

pub struct PDFXRef {
  entries : Array[PDFXRefEntry]
}

pub struct PDFTrailer {
  size : Int
  root : PDFObject
  info : PDFObject?
  prev : Int?
}

pub struct PDFDocument {
  header : PDFHeader
  objects : Map[Int, PDFObject]
  xref : PDFXRef
  trailer : PDFTrailer
}