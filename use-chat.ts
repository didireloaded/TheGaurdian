import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMonitoring } from '@/hooks/use-monitoring';
import { useToast } from '@/hooks/use-toast';

export type MessageType = 'alert' | 'update' | 'request' | 'general';

export interface Message {
  id: string;
  message: string;
  message_type: MessageType;
  created_at: string;
  location_name?: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState<MessageType>('general');
  const [filter, setFilter] = useState<MessageType | 'all'>('all');
  const { toast } = useToast();
  const { trackEvent, trackError } = useMonitoring();

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchMessages();
          trackEvent('chat_message_received');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('messages')
        .select(`
          id,
          message,
          message_type,
          created_at,
          location_name,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setMessages(data.reverse() as Message[]);
        trackEvent('chat_messages_loaded', { messageCount: data.length });
      }
    } catch (error) {
      trackError(error as Error, {
        componentName: 'useChat',
        functionName: 'fetchMessages',
      });
      toast({
        title: 'Error loading messages',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('messages').insert({
        message: newMessage.trim(),
        message_type: messageType,
      });

      if (error) throw error;

      setNewMessage('');
      trackEvent('chat_message_sent', {
        messageType,
        messageLength: newMessage.length,
      });
    } catch (error) {
      trackError(error as Error, {
        componentName: 'useChat',
        functionName: 'sendMessage',
      });
      toast({
        title: 'Error sending message',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(msg => msg.message_type === filter);

  return {
    messages: filteredMessages,
    newMessage,
    setNewMessage,
    loading,
    messageType,
    setMessageType,
    filter,
    setFilter,
    sendMessage,
  };
}