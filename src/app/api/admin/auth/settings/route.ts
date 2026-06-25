import { NextResponse } from 'next/server';
import { readContent, writeContent } from '@/lib/content';
import { verifyPassword, hashPassword } from '@/lib/hash';

// Default fallback hash for "gularora2026"
const DEFAULT_HASH = '$2a$12$UuTDd3J0W0ablxbSz6g2HOpe3levS.D49HLEnMBrgGtHFTdAN9DQG';

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    const content = await readContent();
    const currentHash = content.auth?.passwordHash || process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;
    console.log("currentHash", currentHash);
    console.log("currentPassword", currentPassword);

    // Verify current password
    const isCurrentValid = await verifyPassword(currentPassword, currentHash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect.' },
        { status: 401 }
      );
    }

    // Hash the new password
    const newHash = await hashPassword(newPassword);

    // Save hash to JSON content
    if (!content.auth) {
      content.auth = {};
    }
    content.auth.passwordHash = newHash;

    // Add an updatedAt timestamp for audit trail
    content.auth.updatedAt = new Date().toISOString();

    await writeContent(content);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
