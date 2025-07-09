// Document metadata parsing functions
import type { DocumentMetadata } from '../../types/document';

/**
 * Parse document metadata from core and app properties XML
 * @param corePropsXml - Core properties XML string
 * @param appPropsXml - App properties XML string (unused for now)
 * @returns Document metadata
 */
export function parseMetadata(corePropsXml: string | undefined, _appPropsXml: string | undefined): DocumentMetadata {
  const metadata: DocumentMetadata = {};
  
  if (corePropsXml) {
    let doc: Document;
    if (typeof DOMParser === 'undefined') {
      // @ts-ignore
      const { DOMParser: XMLDOMParser } = require('@xmldom/xmldom');
      const parser = new XMLDOMParser();
      doc = parser.parseFromString(corePropsXml, "text/xml");
    } else {
      const parser = new DOMParser();
      doc = parser.parseFromString(corePropsXml, "text/xml");
    }
    
    // Dublin Core namespace
    const dcNs = "http://purl.org/dc/elements/1.1/";
    const cpNs = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties";
    const dctermsNs = "http://purl.org/dc/terms/";
    
    const title = doc.getElementsByTagNameNS(dcNs, "title")[0]?.textContent;
    if (title) metadata.title = title;
    
    const creator = doc.getElementsByTagNameNS(dcNs, "creator")[0]?.textContent;
    if (creator) metadata.author = creator;
    
    const created = doc.getElementsByTagNameNS(dctermsNs, "created")[0]?.textContent;
    if (created) metadata.createdDate = new Date(created);
    
    const modified = doc.getElementsByTagNameNS(dctermsNs, "modified")[0]?.textContent;
    if (modified) metadata.modifiedDate = new Date(modified);
    
    const keywords = doc.getElementsByTagNameNS(cpNs, "keywords")[0]?.textContent;
    if (keywords) metadata.keywords = keywords.split(',').map(k => k.trim());
    
    const description = doc.getElementsByTagNameNS(dcNs, "description")[0]?.textContent;
    if (description) metadata.description = description;
    
    const language = doc.getElementsByTagNameNS(dcNs, "language")[0]?.textContent;
    if (language) metadata.language = language;
  }
  
  return metadata;
}