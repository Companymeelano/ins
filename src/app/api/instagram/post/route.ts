import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Demo endpoint - in production use Instagram Graph API Content Publishing with /media and /media_publish
export async function POST(request: NextRequest) {
  try {
    const { username, caption, imageUrl, postType = 'feed', scheduledFor, aiGenerated = false } = await request.json();

    if (!username || !caption || !imageUrl) {
      return NextResponse.json({ error: 'Username, caption and imageUrl required' }, { status: 400 });
    }

    let user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      // auto-create demo user
      [user] = await db.insert(users).values({ username }).returning();
    }

    // Simulate posting to Instagram Graph API
    const mediaId = `ig_media_${Date.now()}`;

    const [newPost] = await db.insert(posts).values({
      userId: user.id,
      instagramMediaId: mediaId,
      caption,
      imageUrl,
      postType,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      status: scheduledFor ? 'scheduled' : 'published',
      aiGenerated,
      publishedAt: scheduledFor ? null : new Date(),
    }).returning();

    // Simulate AI optimization for explore (demo)
    const optimizedCaption = caption + '\n\n#Explore #Viral #AIgenerated ' + (aiGenerated ? 'Generated with AI for maximum reach' : '');

    return NextResponse.json({
      success: true,
      post: newPost,
      message: `Post ${scheduledFor ? 'scheduled' : 'published'} successfully!`,
      optimizedCaption,
      instagramMediaId: mediaId,
      note: 'In production this would call Instagram Graph API /media + /media_publish endpoints with proper access token.'
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
