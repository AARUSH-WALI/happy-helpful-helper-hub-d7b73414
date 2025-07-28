import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  session_id?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  updated_at: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  // Create a new chat session
  const createSession = useCallback(async (title?: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: title || 'New Chat'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSessionId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create chat session",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Load messages from a session
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: ChatMessage[] = data.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.created_at),
        session_id: msg.session_id
      }));

      setMessages(formattedMessages);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "Error",
        description: "Failed to load chat session",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Save a message to the database
  const saveMessage = useCallback(async (message: ChatMessage, sessionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: message.id,
          session_id: sessionId,
          user_id: user.id,
          role: message.role,
          content: message.content
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
      toast({
        title: "Error",
        description: "Failed to save message",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Send message and get AI response
  const sendMessage = useCallback(async (content: string, sessionId?: string): Promise<ChatMessage | null> => {
    try {
      setIsLoading(true);
      console.log('Starting sendMessage with content:', content);

      // Get user profile for context
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User authenticated:', !!user);
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('dietary_restrictions, allergies, preferences')
        .eq('user_id', user.id)
        .single();

      // Use provided session ID or current session ID
      let activeSessionId = sessionId || currentSessionId;
      
      // Create new session if none exists
      if (!activeSessionId) {
        activeSessionId = await createSession();
        if (!activeSessionId) return null;
      }

      // Create user message
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        content,
        role: 'user',
        timestamp: new Date(),
        session_id: activeSessionId
      };

      // Add user message to state and save to DB
      setMessages(prev => [...prev, userMessage]);
      await saveMessage(userMessage, activeSessionId);

      // Prepare context for AI
      const userContext = profile ? {
        dietary_restrictions: profile.dietary_restrictions || [],
        allergies: profile.allergies || [],
        preferences: profile.preferences || []
      } : null;

      // Get conversation history for context
      const conversationMessages = [...messages, userMessage].slice(-10); // Last 10 messages

      // Call OpenAI function
      console.log('Calling chat-openai function with messages:', conversationMessages.length);
      const { data, error } = await supabase.functions.invoke('chat-openai', {
        body: {
          messages: conversationMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          user_context: userContext
        }
      });

      console.log('OpenAI function response:', { data, error });
      if (error) throw error;

      if (!data.message) {
        throw new Error('No response from AI');
      }

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
        session_id: activeSessionId
      };

      // Add assistant message to state and save to DB
      setMessages(prev => [...prev, assistantMessage]);
      await saveMessage(assistantMessage, activeSessionId);

      return assistantMessage;

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentSessionId, createSession, saveMessage, toast]);

  // Convert speech to text
  const speechToText = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const base64Audio = btoa(binary);

      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      return data.text || null;
    } catch (error) {
      console.error('Error converting speech to text:', error);
      toast({
        title: "Error",
        description: "Failed to convert speech to text",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Get chat sessions list
  const getSessions = useCallback(async (): Promise<ChatSession[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data.map(session => ({
        id: session.id,
        title: session.title,
        summary: session.summary,
        created_at: session.created_at,
        updated_at: session.updated_at
      }));
    } catch (error) {
      console.error('Error getting sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive"
      });
      return [];
    }
  }, [toast]);

  return {
    messages,
    isLoading,
    currentSessionId,
    sendMessage,
    speechToText,
    createSession,
    loadSession,
    getSessions,
    setMessages
  };
};