-- Migration: Create notifications table
-- Run this in Supabase SQL Editor

-- Create notification_type enum
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('alert', 'message', 'system', 'mention', 'comment', 'like');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL DEFAULT 'system',
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

-- Service role or authenticated users can insert notifications
CREATE POLICY "Authenticated users can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Grant access
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;
