# Document Page Counter

A simple TypeScript library that counts pages in PDF and DOCX documents. It tries multiple methods to make sure you always get an answer.

## What it does

- Counts pages in PDF files using document metadata
- Counts pages in DOCX files from properties or word count estimates
- Falls back to smart guessing if the usual methods don't work
- Works great with Next.js projects
- Written in TypeScript for better development experience

## Get started

```bash
npm install document-page-counter
```

## Basic example

```typescript
import { countDocumentPages } from 'document-page-counter';

const file = document.getElementById('fileInput').files[0];
const buffer = await file.arrayBuffer();
const result = await countDocumentPages(buffer, file.type);

console.log(`Your document has ${result.pages} pages`);
```

## Using with Next.js

This was built for Next.js API routes, so it's super easy to use:

```typescript
// app/api/count-pages/route.ts
import { createPageCountHandler } from 'document-page-counter';

// That's it! One line and you're done
export const POST = createPageCountHandler();
```

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
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Could not count pages' 
    }, { status: 500 });
  }
}
```

## Demo
Check out the [demo folder](../demo) for a complete Next.js example with file upload and both server/client-side processing.

## How it works

The library tries different approaches:
1. **PDF files**: Reads page count from document metadata, falls back to size estimation
2. **DOCX files**: Checks document properties, estimates from word count, or uses file size

You'll get a result like this:
```typescript
{
  pages: 5,
  method: 'metadata' // or 'word-count' or 'heuristic'
}
```

## Supported files

- PDF files (`application/pdf`)
- Word documents (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)

## Why this exists

I got tired of writing the same page counting code over and over. So I made this library to handle the annoying parts (parsing different file formats, dealing with errors, fallback strategies) so you don't have to.

## Like this project?

Give it a ⭐ on GitHub if you find it useful! 

## License

MIT License - do whatever you want with it.
