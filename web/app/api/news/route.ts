import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { newsArticles, newsSources } from '@akorfa/shared/src/schema';
import { desc, eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = getDb();
    
    let query = db
      .select({
        id: newsArticles.id,
        title: newsArticles.title,
        summary: newsArticles.summary,
        imageUrl: newsArticles.imageUrl,
        videoUrl: newsArticles.videoUrl,
        sourceUrl: newsArticles.sourceUrl,
        author: newsArticles.author,
        category: newsArticles.category,
        viewCount: newsArticles.viewCount,
        likeCount: newsArticles.likeCount,
        publishedAt: newsArticles.publishedAt,
        newsSource: {
          name: newsSources.name,
          logoUrl: newsSources.logoUrl,
          trustScore: newsSources.trustScore
        }
      })
      .from(newsArticles)
      .leftJoin(newsSources, eq(newsArticles.sourceId, newsSources.id))
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit);

    if (category && category !== 'all') {
      query = query.where(eq(newsArticles.category, category));
    }

    const articles = await query;

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
}
