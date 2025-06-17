import { createPageCountHandler } from 'document-page-counter';

// Using the pre-built handler from our package
export const POST = createPageCountHandler({
  wordsPerPage: 250,
  pdfBytesPerPage: 40_000,
  docxBytesPerPage: 15_000
});

// Alternative manual implementation (commented out)
/*
import { NextResponse } from 'next/server';
import { countDocumentPages } from 'document-page-counter';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const result = await countDocumentPages(buffer, file.type, {
      wordsPerPage: 250,
      pdfBytesPerPage: 40_000,
      docxBytesPerPage: 15_000
    });
    
    return NextResponse.json(result);
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
*/