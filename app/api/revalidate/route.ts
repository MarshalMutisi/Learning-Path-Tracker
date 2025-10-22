// File: app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }
    
    revalidatePath(path);
    
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch {
    // Removed the unused error parameter since we're not using it
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}