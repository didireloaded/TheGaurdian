import { MessageCircle, Send, Filter, AlertTriangle, Info, HelpCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Message, MessageType } from '@/hooks/use-chat';

const messageTypeConfig = {
  alert: {
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    label: 'Alert'
  },
  update: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Update'
  },
  request: {
    icon: HelpCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    label: 'Request'
  },
  general: {
    icon: MessageCircle,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    label: 'General'
  }
};

interface ChatPresenterProps {
  messages: Message[];
  newMessage: string;
  loading: boolean;
  messageType: MessageType;
  filter: MessageType | 'all';
  onNewMessageChange: (value: string) => void;
  onMessageTypeChange: (type: MessageType) => void;
  onFilterChange: (filter: MessageType | 'all') => void;
  onSendMessage: (e: React.FormEvent) => void;
}

const MessageTypeIcon = ({ type }: { type: MessageType }) => {
  const config = messageTypeConfig[type];
  const Icon = config.icon;
  return <Icon className={cn("h-4 w-4", config.color)} />;
};

export function ChatPresenter({
  messages,
  newMessage,
  loading,
  messageType,
  filter,
  onNewMessageChange,
  onMessageTypeChange,
  onFilterChange,
  onSendMessage,
}: ChatPresenterProps) {
  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Community Chat</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onFilterChange('all')}>
                All Messages
              </DropdownMenuItem>
              {Object.entries(messageTypeConfig).map(([key, config]) => (
                <DropdownMenuItem 
                  key={key}
                  onClick={() => onFilterChange(key as MessageType)}
                >
                  <config.icon className={cn("h-4 w-4 mr-2", config.color)} />
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card className="p-8 text-center border-border">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </Card>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-emergency flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary-foreground">
                    {msg.profiles?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {msg.profiles?.full_name || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                    <Badge variant="outline" className={cn(
                      "ml-auto",
                      messageTypeConfig[msg.message_type || 'general'].bgColor,
                      messageTypeConfig[msg.message_type || 'general'].color
                    )}>
                      <MessageTypeIcon type={msg.message_type || 'general'} />
                      <span className="ml-1">{messageTypeConfig[msg.message_type || 'general'].label}</span>
                    </Badge>
                  </div>
                  <Card className={cn(
                    "p-3 border-border",
                    messageTypeConfig[msg.message_type || 'general'].bgColor
                  )}>
                    <p className="text-sm">{msg.message}</p>
                    {msg.location_name && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {msg.location_name}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <div className="sticky bottom-16 bg-background border-t border-border p-4">
        <form onSubmit={onSendMessage} className="max-w-lg mx-auto space-y-2">
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    messageTypeConfig[messageType].bgColor,
                    messageTypeConfig[messageType].color
                  )}
                >
                  <MessageTypeIcon type={messageType} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(messageTypeConfig).map(([key, config]) => (
                  <DropdownMenuItem 
                    key={key}
                    onClick={() => onMessageTypeChange(key as MessageType)}
                  >
                    <config.icon className={cn("h-4 w-4 mr-2", config.color)} />
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              value={newMessage}
              onChange={(e) => onNewMessageChange(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={loading}
            />
            <Button 
              type="submit"
              disabled={loading || !newMessage.trim()}
              className={cn(
                messageTypeConfig[messageType].bgColor,
                messageTypeConfig[messageType].color
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      <Navigation />
    </div>
  );
}