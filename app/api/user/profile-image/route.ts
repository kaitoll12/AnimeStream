import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const blob = await put(file.name, file, { 
      access: 'public',
      addRandomSuffix: true,
      token: process.env.BLOB2_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
