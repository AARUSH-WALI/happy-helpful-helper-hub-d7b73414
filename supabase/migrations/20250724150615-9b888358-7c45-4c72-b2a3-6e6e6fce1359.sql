-- Create chat_sessions table
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  summary TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_sessions
CREATE POLICY "Users can access their sessions"
  ON public.chat_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for chat_messages
CREATE POLICY "Users can access their messages"
  ON public.chat_messages
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for chat_sessions updated_at
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update session timestamp when messages are added
CREATE OR REPLACE FUNCTION update_chat_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_sessions
  SET updated_at = now()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to touch session when messages are added
CREATE TRIGGER touch_chat_session
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_session_updated_at();