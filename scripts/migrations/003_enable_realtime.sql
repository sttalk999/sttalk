-- Enable Supabase Realtime for messages table
-- Run this in Supabase SQL Editor

-- Enable realtime for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Note: Make sure the 'messages' table exists before running this.
-- If you get an error, the table might already be added to the publication.

-- To verify realtime is enabled, you can run:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
