import { NextResponse } from 'next/server';
import { getOpenAI, hasOpenAIKey } from '../../../../lib/openai';
import { db } from '../../../../lib/db';
import { profiles, assessments, dailyInsights } from '@akorfa/shared/src/schema';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const layerNames = ['environment', 'biological', 'internal', 'cultural', 'social', 'conscious', 'existential'];

export async function POST(req: Request) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    const [profile] = await db.select().from(profiles).where(eq(profiles.id, user_id)).limit(1);

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const recentAssessments = await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, user_id))
      .orderBy(desc(assessments.createdAt))
      .limit(5);

    const goals = profile.goals || [];
    const focusLayers = (profile.metadata as any)?.focusLayers || [];
    const randomLayer = focusLayers.length > 0 
      ? focusLayers[Math.floor(Math.random() * focusLayers.length)]
      : layerNames[Math.floor(Math.random() * layerNames.length)];

    let insight;
    
    if (hasOpenAIKey()) {
      const openai = getOpenAI();
      const systemPrompt = `You are an insightful wellness coach. Generate a personalized daily insight for someone on their self-discovery journey.

User Context:
- Name: ${profile.fullName || 'Friend'}
- Goals: ${JSON.stringify(goals)}
- Focus Layers: ${focusLayers.join(', ') || 'all layers'}
- Current Akorfa Score: ${profile.akorfaScore || 0}
- Layer Scores: ${JSON.stringify(profile.layerScores || {})}
- Recent Assessments: ${recentAssessments.length}
- Today's Focus: ${randomLayer} layer

Generate a JSON response:
{
  "title": "A catchy, inspiring title (max 50 chars)",
  "content": "2-3 sentences of personalized insight about their ${randomLayer} layer and how to improve it today. Be specific and actionable.",
  "actionItems": ["First action item", "Second action item", "Third action item"]
}

Make it personal, warm, and motivating. Reference their goals if possible.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate my personalized daily insight.' }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 300
      });
      insight = JSON.parse(response.choices[0].message.content || '{}');
    } else {
      insight = {
        title: `Focus on Your ${randomLayer.charAt(0).toUpperCase() + randomLayer.slice(1)} Today`,
        content: `Today is a great opportunity to work on your ${randomLayer} layer. Take a moment to reflect on how this area of your life is developing and what small step you can take to improve it.`,
        actionItems: [
          `Spend 10 minutes reflecting on your ${randomLayer} layer`,
          'Write down one thing you are grateful for',
          'Take one small action toward your goals'
        ]
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const insightId = uuidv4();

    await db.insert(dailyInsights).values({
      id: insightId,
      userId: user_id,
      insightDate: today,
      title: insight.title,
      content: insight.content,
      focusLayer: randomLayer,
      actionItems: insight.actionItems,
      isRead: false,
    });

    const today2 = new Date();
    const lastActive = profile.lastActiveDate ? new Date(profile.lastActiveDate) : null;
    let newStreak = profile.currentStreak || 0;
    
    if (lastActive) {
      const diff = Math.floor((today2.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        newStreak += 1;
      } else if (diff > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    await db.update(profiles)
      .set({
        lastActiveDate: today,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, profile.longestStreak || 0),
        totalXp: (profile.totalXp || 0) + 10,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user_id));

    return NextResponse.json({
      insight: {
        id: insightId,
        title: insight.title,
        content: insight.content,
        focusLayer: randomLayer,
        actionItems: insight.actionItems,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      streak: newStreak,
    });
  } catch (err: any) {
    console.error('Generate insight error:', err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
