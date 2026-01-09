import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function GlobalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages'],
    queryFn: async () => {
      // First get chat messages
      const { data: chatData, error: chatError } = await supabase
        .from('chat_messages')
        .select('id, user_id, content, image_url, created_at')
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (chatError) throw chatError;
      if (!chatData || chatData.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(chatData.map(m => m.user_id))];
      
      // Fetch profiles for those users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      // Create a map of user_id to profile
      const profilesMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      );

      // Combine messages with profiles
      return chatData.map(msg => ({
        ...msg,
        profiles: profilesMap.get(msg.user_id) || null,
      })) as ChatMessage[];
    },
    enabled: isOpen,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!isOpen) return;

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, queryClient]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl?: string }) => {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user!.id,
          content,
          image_url: imageUrl,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage('');
      setImageFile(null);
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const handleSend = async () => {
    if (!message.trim() && !imageFile) return;
    if (!user) {
      toast.error('Please log in to chat');
      return;
    }

    let imageUrl: string | undefined;
    
    if (imageFile) {
      // Upload to imgbb using our edge function
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const { data, error } = await supabase.functions.invoke('upload-image', {
        body: formData,
      });
      
      if (error) {
        toast.error('Failed to upload image');
        return;
      }
      
      imageUrl = data.url;
    }

    sendMessage.mutate({ content: message.trim() || '📷 Image', imageUrl });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg neon-glow"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] h-[500px] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-secondary/50">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="font-orbitron font-bold">Global Chat</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {(msg.profiles?.display_name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] ${msg.user_id === user?.id ? 'text-right' : ''}`}>
                      <p className="text-xs text-muted-foreground mb-1">
                        {msg.profiles?.display_name || 'Anonymous'} • {formatTime(msg.created_at)}
                      </p>
                      <div className={`rounded-lg p-3 ${
                        msg.user_id === user?.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary'
                      }`}>
                        {msg.image_url && (
                          <img 
                            src={msg.image_url} 
                            alt="Shared" 
                            className="rounded max-w-full mb-2 cursor-pointer"
                            onClick={() => window.open(msg.image_url!, '_blank')}
                          />
                        )}
                        {msg.content !== '📷 Image' && (
                          <p className="text-sm break-words">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          {user ? (
            <div className="p-4 border-t bg-secondary/30">
              {imageFile && (
                <div className="mb-2 relative inline-block">
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Preview" 
                    className="h-16 rounded"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-5 h-5"
                    onClick={() => setImageFile(null)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="w-4 h-4" />
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button 
                  size="icon" 
                  onClick={handleSend}
                  disabled={sendMessage.isPending || (!message.trim() && !imageFile)}
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-t bg-secondary/30 text-center">
              <p className="text-sm text-muted-foreground mb-2">Log in to chat</p>
              <Button asChild size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
