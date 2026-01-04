import { useState, useEffect, useRef } from 'react';
import { Send, Search, ArrowLeft, Phone, Video, MessageCircle } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
}

const Chat = () => {
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) {
        loadUsers(user.id);
      }
    });
  }, []);

  const loadUsers = async (currentUserId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .neq('id', currentUserId);

    if (data) {
      setUsers(data);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    if (!currentUser) return;

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      scrollToBottom();

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', currentUser.id)
        .eq('sender_id', otherUserId);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedUser || !currentUser) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUser.id,
        receiver_id: selectedUser.id,
        content: message.trim()
      });

    if (error) {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setMessage('');
      loadMessages(selectedUser.id);
    }
  };

  const openChat = (user: Profile) => {
    setSelectedUser(user);
    setView('chat');
    loadMessages(user.id);
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ChatList = () => (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="p-6 pb-4 bg-card border-b border-border">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="divide-y divide-border">
          {filteredUsers.length === 0 ? (
            <Card className="m-6 p-12 text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No users found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start a conversation with community members
              </p>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => openChat(user)}
                className="w-full p-4 flex items-center hover:bg-muted transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-2xl text-white font-bold">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (user.full_name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <span className="font-semibold">{user.full_name || 'User'}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      <Navigation />
    </div>
  );

  const ChatView = () => {
    if (!selectedUser) return <ChatList />;

    return (
      <div className="min-h-screen bg-background flex flex-col pb-20">
        {/* Chat Header */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setView('list')} className="mr-3">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-xl text-white font-bold">
              {selectedUser.avatar_url ? (
                <img src={selectedUser.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                (selectedUser.full_name || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <div className="ml-3">
              <h2 className="font-semibold">{selectedUser.full_name || 'User'}</h2>
              <p className="text-xs text-muted-foreground">SafeGuard Member</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Video className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-2">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUser?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex items-end gap-2 max-w-md">
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-sm text-white font-bold flex-shrink-0">
                        {(selectedUser.full_name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${isMe
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                        }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-card border-t border-border p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="bg-primary p-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>
        <Navigation />
      </div>
    );
  };

  return view === 'list' ? <ChatList /> : <ChatView />;
};

export default Chat;
