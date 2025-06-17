# Document Page Counter Demo

A simple Next.js app that shows how to use the `document-page-counter` package to count pages in documents.

⭐ **Like this project? [Star it on GitHub](https://github.com/jnlandu/document-page-counter)!**

## What it does

This demo lets you upload PDF and Word documents and count their pages. You can process files on the server or directly in your browser.

## Features

- Upload PDF and DOCX files
- Count pages on the server or client-side
- See results instantly
- Clean, modern interface

## Getting started

1. Go to the demo folder:
```bash
cd demo
```

2. Install everything:
```bash
npm install
```

3. Start the app:
```bash
npm run dev
```

4. Open http://localhost:3000

## How to use it

1. Click "Choose File" and pick a PDF or Word document
2. Choose how you want to process it:
    - Server-side (via API)
    - Client-side (in your browser)
3. See the page count and file info

## What files are supported

- PDF files (`.pdf`)
- Word documents (`.docx`)

## How it works

The demo uses the `document-page-counter` package in two ways:

**Server-side** (in `app/api/count-pages/route.ts`):
```typescript
import { createPageCountHandler } from 'document-page-counter';

export const POST = createPageCountHandler();
```

**Client-side** (in `app/page.tsx`):
```typescript
const { countDocumentPages } = await import('document-page-counter');
const result = await countDocumentPages(buffer, file.type);
```

## Project structure

```
demo/
├── app/
│   ├── api/count-pages/route.ts   # Server endpoint
│   ├── page.tsx                   # Main page
│   └── layout.tsx                 # App layout
├── package.json
└── README.md
```

## Want to learn more?

- Check out the [main package docs](../doc-page-counter/README.md)
- See the [project overview](../README.md)
- Read the [Next.js docs](https://nextjs.org/docs)

