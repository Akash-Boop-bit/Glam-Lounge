import { NextResponse } from 'next/server';
import { readContent, writeContent } from '@/lib/content';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const content = await readContent();
    return NextResponse.json({ success: true, data: content });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json({ success: false, error: 'Section and data are required' }, { status: 400 });
    }

    const currentContent = await readContent();
    currentContent[section] = data;

    await writeContent(currentContent);

    // Trigger Next.js cache revalidation for the landing page
    revalidatePath('/');

    return NextResponse.json({ success: true, data: currentContent });
  } catch (error: any) {
    console.error('API content write error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
