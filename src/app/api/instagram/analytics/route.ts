import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analytics, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// Demo analytics endpoint - would use Instagram Graph API /insights in production
export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Fetch latest analytics
  const latestAnalytics = await db.query.analytics.findMany({
    where: eq(analytics.userId, user.id),
    orderBy: [desc(analytics.date)],
    limit: 30,
  });

  // Simulate some demo data if none exists
  if (latestAnalytics.length === 0) {
    await db.insert(analytics).values({
      userId: user.id,
      followers: 12480,
      newFollowers: 342,
      totalLikes: 8740,
      totalComments: 1240,
      reach: 45670,
      impressions: 89230,
      engagementRate: 4.8,
      data: {
        topPosts: [
          { id: 1, likes: 1240, comments: 89, reach: 5430 },
          { id: 2, likes: 980, comments: 67, reach: 4210 },
        ],
        growthTrend: [11200, 11560, 11890, 12140, 12480],
      }
    });
  }

  const currentStats = await db.query.analytics.findFirst({
    where: eq(analytics.userId, user.id),
    orderBy: [desc(analytics.date)],
  });

  return NextResponse.json({
    success: true,
    stats: currentStats || {},
    recentAnalytics: latestAnalytics,
    note: 'Real data would be fetched from Instagram Graph API insights endpoint using your access token.',
  });
}
