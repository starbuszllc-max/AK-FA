import { pgTable, uuid, text, decimal, jsonb, timestamp, integer, boolean, unique, date } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  username: text('username').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  akorfaScore: decimal('akorfa_score', { precision: 10, scale: 2 }).default('0'),
  layerScores: jsonb('layer_scores').default({}),
  metadata: jsonb('metadata').default({}),
  goals: jsonb('goals').default([]),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastActiveDate: date('last_active_date'),
  totalXp: integer('total_xp').default(0),
  level: integer('level').default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const assessments = pgTable('assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  layerScores: jsonb('layer_scores').notNull(),
  overallScore: decimal('overall_score', { precision: 10, scale: 2 }).notNull(),
  insights: text('insights'),
  recommendations: jsonb('recommendations').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  layer: text('layer').default('social'),
  postType: text('post_type').default('post'),
  likeCount: integer('like_count').default(0),
  commentCount: integer('comment_count').default(0),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isHelpful: boolean('is_helpful').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const reactions = pgTable('reactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  reactionType: text('reaction_type'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const userEvents = pgTable('user_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  pointsEarned: integer('points_earned').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const challenges = pgTable('challenges', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  layer: text('layer').default('social'),
  durationDays: integer('duration_days').default(7),
  pointsReward: integer('points_reward').default(50),
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  startsAt: timestamp('starts_at', { withTimezone: true }).defaultNow(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  participantCount: integer('participant_count').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const challengeParticipants = pgTable('challenge_participants', {
  id: uuid('id').defaultRandom().primaryKey(),
  challengeId: uuid('challenge_id').references(() => challenges.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  status: text('status').default('active'),
  progress: integer('progress').default(0),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true })
});

export const badges = pgTable('badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').default('star'),
  layer: text('layer'),
  requirementType: text('requirement_type').notNull(),
  requirementValue: integer('requirement_value').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const userBadges = pgTable('user_badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  badgeId: uuid('badge_id').notNull().references(() => badges.id, { onDelete: 'cascade' }),
  earnedAt: timestamp('earned_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  uniqueUserBadge: unique().on(table.userId, table.badgeId)
}));

export const dailyInsights = pgTable('daily_insights', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  insightDate: date('insight_date').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  focusLayer: text('focus_layer'),
  actionItems: jsonb('action_items').default([]),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const userGoals = pgTable('user_goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  layer: text('layer'),
  targetDate: date('target_date'),
  progress: integer('progress').default(0),
  status: text('status').default('active'),
  aiSuggested: boolean('ai_suggested').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true })
});

export const groups = pgTable('groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  layer: text('layer'),
  avatarUrl: text('avatar_url'),
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  memberCount: integer('member_count').default(0),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const groupMembers = pgTable('group_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').references(() => groups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  role: text('role').default('member'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  uniqueGroupMember: unique().on(table.groupId, table.userId)
}));

export const accountabilityPartners = pgTable('accountability_partners', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  partnerId: uuid('partner_id').references(() => profiles.id, { onDelete: 'cascade' }),
  status: text('status').default('pending'),
  matchScore: integer('match_score'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const stories = pgTable('stories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  content: text('content'),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'),
  layer: text('layer'),
  viewCount: integer('view_count').default(0),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});
