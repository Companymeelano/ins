import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// This is a demo endpoint. In production connect via Meta OAuth for Instagram Graph API
export async function POST(request: NextRequest) {
  try {
    const { username, accessToken, igUserId, fbPageId } = await request.json();

    if (!username || !accessToken) {
      return NextResponse.json({ error: 'Username and access token required' }, { status: 400 });
    }

    const [existing] = await db.select().from(users).where(eq(users.username, username));

    if (existing) {
      await db.update(users)
        .set({
          instagramAccessToken: accessToken,
          instagramUserId: igUserId || existing.instagramUserId,
          facebookPageId: fbPageId || existing.facebookPageId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id));
    } else {
      await db.insert(users).values({
        username,
        instagramAccessToken: accessToken,
        instagramUserId: igUserId,
        facebookPageId: fbPageId,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Instagram account connected successfully (Demo mode - Graph API recommended)',
      username,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to connect account' }, { status: 500 });
  }
}
