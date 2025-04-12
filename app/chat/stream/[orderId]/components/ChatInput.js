import { useState, useRef } from 'react';
import { TextareaAutosize } from './TextareaAutosize';
import { Button } from '@/app/components/button';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ChatInput({ channel }) {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef(null);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!message.trim() || isSubmitting) return;
  
      setIsSubmitting(true);
      try {
        await channel.sendMessage({
          text: message.trim(),
        });
        setMessage('');
        textareaRef.current?.focus();
      } catch (error) {
        toast.error('Failed to send message');
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return (
      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <form 
          onSubmit={handleSubmit}
          className="container flex items-center gap-2 p-4 max-w-3xl mx-auto"
        >
          <div className="relative flex-1">
            <TextareaAutosize
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (message.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
              placeholder="Type a message..."
              className="w-full resize-none rounded-lg bg-muted px-3 py-2 text-sm ring-offset-background 
                placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 
                focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              minRows={1}
              maxRows={4}
            />
          </div>
  
          <Button 
            type="submit" 
            size="icon"
            disabled={!message.trim() || isSubmitting}
            className="h-10 w-10"
            aria-label="Send message"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    );
  }