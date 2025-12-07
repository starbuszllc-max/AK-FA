import {NextResponse} from 'next/server';
import {db} from '../../../lib/db';
import {posts, userEvents, profiles} from '@akorfa/shared/src/schema';
import {calculateAkorfaScore} from '@akorfa/shared/dist/scoring';
import {eq, desc, sql} from 'drizzle-orm';

export async function GET() {
  try {
    const allPosts = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        layer: posts.layer,
        postType: posts.postType,
        likeCount: posts.likeCount,
        commentCount: posts.commentCount,
        viewCount: posts.viewCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        profiles: {
          username: profiles.username,
          avatarUrl: profiles.avatarUrl
        }
      })
      .from(posts)
      .leftJoin(profiles, eq(posts.userId, profiles.id))
      .orderBy(desc(posts.createdAt))
      .limit(50);
    return NextResponse.json({posts: allPosts});
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({error: err.message ?? String(err)}, {status: 500});
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const content = body.content ?? '';
    const layer = body.layer ?? 'social';
    const user_id = body.user_id ?? null;

    const [newPost] = await db.insert(posts).values({
      userId: user_id,
      content: content,
      layer: layer
    }).returning();

    if (user_id) {
      await db.insert(userEvents).values({
        userId: user_id,
        eventType: 'post_created',
        pointsEarned: 5,
        metadata: {post_id: newPost.id}
      });

      const scoreDelta = calculateAkorfaScore({postsCreated: 1});
      await db.update(profiles)
        .set({
          akorfaScore: sql`COALESCE(${profiles.akorfaScore}, 0) + ${scoreDelta}`,
          updatedAt: new Date()
        })
        .where(eq(profiles.id, user_id));
    }

    return NextResponse.json({post: newPost});
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({error: err.message ?? String(err)}, {status: 500});
  }
}
