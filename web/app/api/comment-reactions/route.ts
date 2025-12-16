import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { comments, commentReactions, profiles, wallets, notifications, coinTransactions, pointsLog } from '@akorfa/shared';
import { eq, and, sql, desc } from 'drizzle-orm';

const TOP_COMMENT_COIN_REWARD = 5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { comment_id, user_id, reaction_type = 'like' } = body;

    if (!comment_id || !user_id) {
      return NextResponse.json({ error: 'comment_id and user_id are required' }, { status: 400 });
    }

    const db = getDb();

    const existingReaction = await db.select()
      .from(commentReactions)
      .where(and(
        eq(commentReactions.commentId, comment_id),
        eq(commentReactions.userId, user_id)
      ))
      .limit(1);

    if (existingReaction.length > 0) {
      return NextResponse.json({ error: 'Already reacted to this comment' }, { status: 400 });
    }

    await db.insert(commentReactions).values({
      commentId: comment_id,
      userId: user_id,
      reactionType: reaction_type
    });

    await db.update(comments)
      .set({
        likeCount: sql`COALESCE(${comments.likeCount}, 0) + 1`
      })
      .where(eq(comments.id, comment_id));

    const [updatedComment] = await db.select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId,
      likeCount: comments.likeCount,
      isTopComment: comments.isTopComment
    }).from(comments).where(eq(comments.id, comment_id));

    if (updatedComment && updatedComment.postId) {
      await checkAndUpdateTopComment(db, updatedComment.postId);
    }

    return NextResponse.json({ 
      success: true, 
      newLikeCount: updatedComment?.likeCount || 1 
    });
  } catch (err: any) {
    console.error('Comment reaction error:', err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}

async function checkAndUpdateTopComment(db: any, postId: string) {
  const allComments = await db.select({
    id: comments.id,
    userId: comments.userId,
    likeCount: comments.likeCount,
    isTopComment: comments.isTopComment,
    coinReward: comments.coinReward
  })
    .from(comments)
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.likeCount));

  if (allComments.length === 0) return;

  const topComment = allComments[0];
  const currentTopComment = allComments.find((c: any) => c.isTopComment);

  if (topComment.likeCount >= 3 && 
      (!currentTopComment || currentTopComment.id !== topComment.id)) {
    
    if (currentTopComment && currentTopComment.id !== topComment.id) {
      await db.update(comments)
        .set({ isTopComment: false })
        .where(eq(comments.id, currentTopComment.id));
    }

    if (!topComment.isTopComment) {
      await db.update(comments)
        .set({ 
          isTopComment: true,
          coinReward: TOP_COMMENT_COIN_REWARD
        })
        .where(eq(comments.id, topComment.id));

      if (topComment.userId) {
        await awardCoinsToCommenter(db, topComment.userId, topComment.id, postId);
      }
    }
  }
}

async function awardCoinsToCommenter(db: any, userId: string, commentId: string, postId: string) {
  const [existingWallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));

  if (existingWallet) {
    await db.update(wallets)
      .set({
        coinsBalance: sql`COALESCE(${wallets.coinsBalance}, 0) + ${TOP_COMMENT_COIN_REWARD}`,
        totalEarned: sql`COALESCE(${wallets.totalEarned}, 0) + ${TOP_COMMENT_COIN_REWARD}`,
        updatedAt: new Date()
      })
      .where(eq(wallets.userId, userId));
  } else {
    await db.insert(wallets).values({
      userId,
      coinsBalance: TOP_COMMENT_COIN_REWARD,
      pointsBalance: 0,
      totalEarned: TOP_COMMENT_COIN_REWARD,
      creatorLevel: 1
    });
  }

  await db.insert(coinTransactions).values({
    userId,
    amount: TOP_COMMENT_COIN_REWARD,
    transactionType: 'top_comment_reward',
    description: 'Earned coins for top comment on a post',
    referenceId: commentId,
    status: 'completed'
  });

  await db.insert(pointsLog).values({
    userId,
    amount: TOP_COMMENT_COIN_REWARD * 10,
    action: 'top_comment',
    description: 'Your comment was voted as most relevant!',
    referenceId: commentId,
    referenceType: 'comment'
  });

  await db.insert(notifications).values({
    userId,
    type: 'top_comment',
    title: 'Your comment is on top!',
    message: `Congratulations! Your comment was voted the most relevant and you earned ${TOP_COMMENT_COIN_REWARD} coins!`,
    referenceId: postId,
    referenceType: 'post',
    isRead: false
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('comment_id');
    const userId = searchParams.get('user_id');

    if (!commentId) {
      return NextResponse.json({ error: 'comment_id is required' }, { status: 400 });
    }

    const db = getDb();

    let hasReacted = false;
    if (userId) {
      const existing = await db.select()
        .from(commentReactions)
        .where(and(
          eq(commentReactions.commentId, commentId),
          eq(commentReactions.userId, userId)
        ))
        .limit(1);
      hasReacted = existing.length > 0;
    }

    const [comment] = await db.select({
      likeCount: comments.likeCount,
      isTopComment: comments.isTopComment
    }).from(comments).where(eq(comments.id, commentId));

    return NextResponse.json({
      likeCount: comment?.likeCount || 0,
      isTopComment: comment?.isTopComment || false,
      hasReacted
    });
  } catch (err: any) {
    console.error('Get comment reactions error:', err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
