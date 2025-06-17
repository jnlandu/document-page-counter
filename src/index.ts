import JSZip from 'jszip';
import { parse } from 'fast-xml-parser';
import * as mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';

export interface PageCountResult {
  pages: number;
  method: 'metadata' | 'heuristic' | 'word-count';
}

export interface PageCountOptions {
  wordsPerPage?: number;
  pdfBytesPerPage?: number;
  docxBytesPerPage?: number;
}

export class DocumentPageCounter {
  private options: Required<PageCountOptions>;

  constructor(options: PageCountOptions = {}) {
    this.options = {
      wordsPerPage: options.wordsPerPage ?? 250,
      pdfBytesPerPage: options.pdfBytesPerPage ?? 40_000,
      docxBytesPerPage: options.docxBytesPerPage ?? 15_000,
    };
  }

  /**
   * Count pages in a PDF document
   */
  async countPdfPages(buffer: ArrayBuffer): Promise<PageCountResult> {
    try {
      const pdf = await PDFDocument.load(new Uint8Array(buffer));
      const pages = pdf.getPageCount();
      return { pages, method: 'metadata' };
    } catch (err) {
      console.error('PDF parse error – estimating:', err);
      const pages = Math.max(1, Math.floor(buffer.byteLength / this.options.pdfBytesPerPage));
      return { pages, method: 'heuristic' };
    }
  }

  /**
   * Count pages in a DOCX document
   */
  async countDocxPages(buffer: ArrayBuffer): Promise<PageCountResult> {
    try {
      const zip = await JSZip.loadAsync(buffer);
      const appXml = await zip.file('docProps/app.xml')?.async('string');
      
      if (appXml) {
        // Try to read <Pages>42</Pages> from the XML
        const { Properties } = parse(appXml, { ignoreAttributes: false });
        const pageProp = Number(Properties?.Pages);
        
        if (!isNaN(pageProp) && pageProp > 0) {
          return { pages: pageProp, method: 'metadata' };
        }
      }

      // Fall back to word-count heuristic
      const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
      const words = value.trim().split(/\s+/).length;
      const pages = Math.max(1, Math.ceil(words / this.options.wordsPerPage));
      return { pages, method: 'word-count' };
    } catch (err) {
      console.error('DOCX parse error – estimating:', err);
      const pages = Math.max(1, Math.floor(buffer.byteLength / this.options.docxBytesPerPage));
      return { pages, method: 'heuristic' };
    }
  }

  /**
   * Count pages in a document (auto-detects type from MIME type)
   */
  async countPages(buffer: ArrayBuffer, mimeType: string): Promise<PageCountResult> {
    if (mimeType === 'application/pdf') {
      return this.countPdfPages(buffer);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return this.countDocxPages(buffer);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }

  /**
   * Count pages from a File object
   */
  async countPagesFromFile(file: File): Promise<PageCountResult> {
    const buffer = await file.arrayBuffer();
    return this.countPages(buffer, file.type);
  }
}

// Convenience function for simple usage
export async function countDocumentPages(
  buffer: ArrayBuffer, 
  mimeType: string, 
  options?: PageCountOptions
): Promise<PageCountResult> {
  const counter = new DocumentPageCounter(options);
  return counter.countPages(buffer, mimeType);
}

// Next.js API route helper
export function createPageCountHandler(options?: PageCountOptions) {
  const counter = new DocumentPageCounter(options);
  
  return async function handler(request: Request) {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      
      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const result = await counter.countPagesFromFile(file);
      
      return new Response(
        JSON.stringify(result), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      console.error('Page-count failure:', err);
      return new Response(
        JSON.stringify({
          error: 'Failed to count pages',
          message: err instanceof Error ? err.message : 'Unknown error',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}