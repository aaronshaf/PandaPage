// Main DOCX Inspector library
import JSZip from "jszip";

export interface DocxFile {
  name: string;
  content: string | ArrayBuffer;
  size: number;
  type: "xml" | "binary" | "unknown";
}

export interface DocxRelationship {
  id: string;
  type: string;
  target: string;
  targetMode?: string;
}

export interface DocxInspectionResult {
  fileName: string;
  fileSize: number;
  files: DocxFile[];
  relationships: DocxRelationship[];
  contentTypes: Record<string, string>;
  documentStructure: {
    hasDocument: boolean;
    hasStyles: boolean;
    hasNumbering: boolean;
    hasSettings: boolean;
    hasTheme: boolean;
    hasComments: boolean;
    hasFootnotes: boolean;
    hasEndnotes: boolean;
    hasHeaders: boolean;
    hasFooters: boolean;
    hasImages: number;
    hasEmbeddedObjects: number;
  };
  statistics: {
    totalFiles: number;
    xmlFiles: number;
    binaryFiles: number;
    totalUncompressedSize: number;
    compressionRatio: number;
  };
}

export class DocxInspector {
  async inspect(buffer: ArrayBuffer, fileName?: string): Promise<DocxInspectionResult> {
    const zip = new JSZip();
    const zipData = await zip.loadAsync(buffer);

    const files: DocxFile[] = [];
    const relationships: DocxRelationship[] = [];
    let contentTypes: Record<string, string> = {};

    let totalUncompressedSize = 0;
    let xmlFiles = 0;
    let binaryFiles = 0;
    let imageCount = 0;
    let embeddedObjectCount = 0;

    // Process all files in the ZIP
    for (const [path, file] of Object.entries(zipData.files)) {
      if (file.dir) continue;

      const content = await this.getFileContent(file);
      const fileType = this.determineFileType(path, content);

      files.push({
        name: path,
        content,
        size: content instanceof ArrayBuffer ? content.byteLength : content.length,
        type: fileType,
      });

      totalUncompressedSize += content instanceof ArrayBuffer ? content.byteLength : content.length;

      if (fileType === "xml") {
        xmlFiles++;
      } else if (fileType === "binary") {
        binaryFiles++;
      }

      // Count images
      if (this.isImageFile(path)) {
        imageCount++;
      }

      // Count embedded objects
      if (this.isEmbeddedObject(path)) {
        embeddedObjectCount++;
      }

      // Parse specific files
      if (path.endsWith(".rels") && typeof content === "string") {
        relationships.push(...this.parseRelationships(content));
      }

      if (path === "[Content_Types].xml" && typeof content === "string") {
        contentTypes = this.parseContentTypes(content);
      }
    }

    // Analyze document structure
    const documentStructure = this.analyzeDocumentStructure(files);

    return {
      fileName: fileName || "unknown.docx",
      fileSize: buffer.byteLength,
      files,
      relationships,
      contentTypes,
      documentStructure: {
        ...documentStructure,
        hasImages: imageCount,
        hasEmbeddedObjects: embeddedObjectCount,
      },
      statistics: {
        totalFiles: files.length,
        xmlFiles,
        binaryFiles,
        totalUncompressedSize,
        compressionRatio: buffer.byteLength / totalUncompressedSize,
      },
    };
  }

  private async getFileContent(file: JSZip.JSZipObject): Promise<string | ArrayBuffer> {
    // Try to read as text first for XML files
    if (this.isLikelyXmlFile(file.name)) {
      try {
        return await file.async("text");
      } catch {
        // Fall back to binary if text parsing fails
        return await file.async("arraybuffer");
      }
    } else {
      // Read binary files as ArrayBuffer
      return await file.async("arraybuffer");
    }
  }

  private determineFileType(
    path: string,
    content: string | ArrayBuffer,
  ): "xml" | "binary" | "unknown" {
    // Check binary files first by path
    if (this.isImageFile(path) || this.isEmbeddedObject(path)) {
      return "binary";
    }

    // Check if content is string and looks like XML
    if (typeof content === "string") {
      if (content.trim().startsWith("<?xml") || content.trim().startsWith("<")) {
        return "xml";
      }
    }

    // Check by file extension for XML files
    if (this.isLikelyXmlFile(path)) {
      return "xml";
    }

    return content instanceof ArrayBuffer ? "binary" : "unknown";
  }

  private isLikelyXmlFile(path: string): boolean {
    return path.endsWith(".xml") || path.endsWith(".rels");
  }

  private isImageFile(path: string): boolean {
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".svg"];
    return (
      imageExtensions.some((ext) => path.toLowerCase().endsWith(ext)) ||
      path.includes("word/media/")
    );
  }

  private isEmbeddedObject(path: string): boolean {
    return (
      path.includes("word/embeddings/") ||
      path.includes("word/oleObjects/") ||
      path.endsWith(".bin")
    );
  }

  private parseRelationships(content: string): DocxRelationship[] {
    const relationships: DocxRelationship[] = [];

    try {
      // Simple XML parsing for relationships
      const relationshipRegex = /<Relationship\s+([^>]+)>/g;
      let match;

      while ((match = relationshipRegex.exec(content)) !== null) {
        const attrs = match[1];
        const rel: DocxRelationship = {
          id: this.extractAttribute(attrs, "Id") || "",
          type: this.extractAttribute(attrs, "Type") || "",
          target: this.extractAttribute(attrs, "Target") || "",
        };

        const targetMode = this.extractAttribute(attrs, "TargetMode");
        if (targetMode) {
          rel.targetMode = targetMode;
        }

        relationships.push(rel);
      }
    } catch (error) {
      console.warn("Failed to parse relationships:", error);
    }

    return relationships;
  }

  private parseContentTypes(content: string): Record<string, string> {
    const contentTypes: Record<string, string> = {};

    try {
      // Parse Default elements
      const defaultRegex = /<Default\s+([^>]+)>/g;
      let match;

      while ((match = defaultRegex.exec(content)) !== null) {
        const attrs = match[1];
        const extension = this.extractAttribute(attrs, "Extension");
        const contentType = this.extractAttribute(attrs, "ContentType");

        if (extension && contentType) {
          contentTypes[extension] = contentType;
        }
      }

      // Parse Override elements
      const overrideRegex = /<Override\s+([^>]+)>/g;
      while ((match = overrideRegex.exec(content)) !== null) {
        const attrs = match[1];
        const partName = this.extractAttribute(attrs, "PartName");
        const contentType = this.extractAttribute(attrs, "ContentType");

        if (partName && contentType) {
          contentTypes[partName] = contentType;
        }
      }
    } catch (error) {
      console.warn("Failed to parse content types:", error);
    }

    return contentTypes;
  }

  private extractAttribute(attrs: string, name: string): string | null {
    const regex = new RegExp(`${name}="([^"]*)"`, "i");
    const match = attrs.match(regex);
    return match ? match[1] : null;
  }

  private analyzeDocumentStructure(files: DocxFile[]) {
    const structure = {
      hasDocument: false,
      hasStyles: false,
      hasNumbering: false,
      hasSettings: false,
      hasTheme: false,
      hasComments: false,
      hasFootnotes: false,
      hasEndnotes: false,
      hasHeaders: false,
      hasFooters: false,
    };

    for (const file of files) {
      const path = file.name.toLowerCase();

      if (path === "word/document.xml") {
        structure.hasDocument = true;
      } else if (path === "word/styles.xml") {
        structure.hasStyles = true;
      } else if (path === "word/numbering.xml") {
        structure.hasNumbering = true;
      } else if (path === "word/settings.xml") {
        structure.hasSettings = true;
      } else if (path.includes("word/theme/")) {
        structure.hasTheme = true;
      } else if (path === "word/comments.xml") {
        structure.hasComments = true;
      } else if (path === "word/footnotes.xml") {
        structure.hasFootnotes = true;
      } else if (path === "word/endnotes.xml") {
        structure.hasEndnotes = true;
      } else if (path.includes("word/header")) {
        structure.hasHeaders = true;
      } else if (path.includes("word/footer")) {
        structure.hasFooters = true;
      }
    }

    return structure;
  }

  // Utility methods for file analysis

  getDocumentXml(result: DocxInspectionResult): string | null {
    const docFile = result.files.find((f) => f.name === "word/document.xml");
    return docFile && typeof docFile.content === "string" ? docFile.content : null;
  }

  getStylesXml(result: DocxInspectionResult): string | null {
    const stylesFile = result.files.find((f) => f.name === "word/styles.xml");
    return stylesFile && typeof stylesFile.content === "string" ? stylesFile.content : null;
  }

  getNumberingXml(result: DocxInspectionResult): string | null {
    const numberingFile = result.files.find((f) => f.name === "word/numbering.xml");
    return numberingFile && typeof numberingFile.content === "string"
      ? numberingFile.content
      : null;
  }

  getRelationshipsForPart(result: DocxInspectionResult, partPath: string): DocxRelationship[] {
    const relsPath = partPath.replace(/\/[^/]+$/, "/_rels/") + partPath.split("/").pop() + ".rels";
    return result.relationships.filter((rel) => result.files.some((f) => f.name === relsPath));
  }

  getImageFiles(result: DocxInspectionResult): DocxFile[] {
    return result.files.filter((f) => this.isImageFile(f.name));
  }

  getEmbeddedObjects(result: DocxInspectionResult): DocxFile[] {
    return result.files.filter((f) => this.isEmbeddedObject(f.name));
  }
}
