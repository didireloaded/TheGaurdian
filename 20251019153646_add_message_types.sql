-- Create message type enum
CREATE TYPE message_type AS ENUM ('alert', 'update', 'request', 'general');

-- Add message_type column to messages table
ALTER TABLE public.messages
ADD COLUMN message_type message_type NOT NULL DEFAULT 'general';

-- Update RLS policies for messages
DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.messages;

CREATE POLICY "Users can view messages"
ON public.messages FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert messages"
ON public.messages FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Grant access to authenticated users
GRANT SELECT ON public.messages TO authenticated;
GRANT INSERT ON public.messages TO authenticated;