import { NextResponse } from 'next/server';
import { createPageCountHandler } from './index';

// Your original Next.js API route, now using the packaged library
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const mime = file.type;
    let pages = 0;

    // Import your packaged library
    const { countDocumentPages } = await import('./index');
    
    const result = await countDocumentPages(buffer, mime);
    pages = result.pages;

    return NextResponse.json({ pages });
  } catch (err) {
    console.error('Page-count failure:', err);
    return NextResponse.json(
      {
        error: 'Failed to count pages',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Alternative: Use the pre-built handler
export const POSTSimplified = createPageCountHandler({
  wordsPerPage: 250,
  pdfBytesPerPage: 40_000,
  docxBytesPerPage: 15_000
});