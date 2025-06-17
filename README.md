# Document Page Counter

A TypeScript library for counting pages in PDF and DOCX documents with multiple fallback strategies.

## Features

- **PDF Support**: Uses `pdf-lib` to extract exact page count from PDF metadata
- **DOCX Support**: Extracts page count from document properties or estimates from word count
- **Fallback Strategies**: Multiple methods to ensure you always get a page count
- **Next.js Integration**: Pre-built API route handlers
- **TypeScript**: Full type safety and IntelliSense support
- **Configurable**: Customize heuristics for different document types

## Installation

```bash
npm install document-page-counter
```

## Quick Start

### Basic Usage

```typescript
import { countDocumentPages } from 'document-page-counter';

// From a File object
const file = document.getElementById('fileInput').files[0];
const buffer = await file.arrayBuffer();
const result = await countDocumentPages(buffer, file.type);

console.log(`Document has ${result.pages} pages (method: ${result.method})`);
```

### Class-based Usage

```typescript
import { DocumentPageCounter } from 'document-page-counter';

const counter = new DocumentPageCounter({
  wordsPerPage: 300, // Custom words per page estimate
  pdfBytesPerPage: 50000, // Custom PDF size heuristic
  docxBytesPerPage: 20000 // Custom DOCX size heuristic
});

const result = await counter.countPagesFromFile(file);
```

### Next.js API Routes

#### Option 1: Use the pre-built handler

```typescript
// app/api/count-pages/route.ts
import { createPageCountHandler } from 'document-page-counter';

export const POST = createPageCountHandler({
  wordsPerPage: 250
});
```

#### Option 2: Manual integration

```typescript
// app/api/count-pages/route.ts
import { NextResponse } from 'next/server';
import { countDocumentPages } from 'document-page-counter';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const result = await countDocumentPages(buffer, file.type);
    
    return NextResponse.json({ 
      pages: result.pages,
      method: result.method 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to count pages' 
    }, { status: 500 });
  }
}
```

## API Reference

### `countDocumentPages(buffer, mimeType, options?)`

Count pages in a document buffer.

**Parameters:**
- `buffer: ArrayBuffer` - The document buffer
- `mimeType: string` - MIME type ('application/pdf' or 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
- `options?: PageCountOptions` - Configuration options

**Returns:** `Promise<PageCountResult>`

### `DocumentPageCounter`

Class for counting pages with configurable options.

**Constructor Options:**
- `wordsPerPage?: number` - Words per page for DOCX estimation (default: 250)
- `pdfBytesPerPage?: number` - Bytes per page for PDF size estimation (default: 40,000)
- `docxBytesPerPage?: number` - Bytes per page for DOCX size estimation (default: 15,000)

**Methods:**
- `countPages(buffer, mimeType)` - Count pages from buffer
- `countPagesFromFile(file)` - Count pages from File object
- `countPdfPages(buffer)` - Count PDF pages specifically
- `countDocxPages(buffer)` - Count DOCX pages specifically

### `PageCountResult`

```typescript
interface PageCountResult {
  pages: number;
  method: 'metadata' | 'heuristic' | 'word-count';
}
```

- `metadata`: Extracted from document properties (most accurate)
- `word-count`: Estimated from word count (DOCX fallback)
- `heuristic`: Estimated from file size (last resort)

## Supported File Types

- **PDF**: `application/pdf`
- **DOCX**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## Error Handling

The library uses fallback strategies to ensure you always get a page count:

1. **PDF**: Try to parse with pdf-lib → fallback to size estimation
2. **DOCX**: Try document properties → word count estimation → size estimation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Dependencies

- `jszip` - For reading DOCX files
- `fast-xml-parser` - For parsing XML in DOCX files  
- `mammoth` - For extracting text from DOCX files
- `pdf-lib` - For reading PDF files