import { pgTable, uuid, text, decimal, jsonb, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

// Profiles table (extends auth.users)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  username: text('username').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  akorfaScore: decimal('akorfa_score', { precision: 10, scale: 2 }).default('0'),
  layerScores: jsonb('layer_scores').default({}),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Assessments table
export const assessments = pgTable('assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  layerScores: jsonb('layer_scores').notNull(),
  overallScore: decimal('overall_score', { precision: 10, scale: 2 }).notNull(),
  insights: text('insights'),
  recommendations: jsonb('recommendations').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// Posts table
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

// Comments table
export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isHelpful: boolean('is_helpful').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// Reactions table
export const reactions = pgTable('reactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  reactionType: text('reaction_type'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// User events table
export const userEvents = pgTable('user_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  pointsEarned: integer('points_earned').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});
