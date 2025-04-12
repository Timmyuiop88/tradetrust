import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/avatar';
import { cn } from '@/app/lib/utils';

export function MessageItem({ message }) {
    const { data: session } = useSession();
    
    // Early return if message is undefined
    if (!message) {
      return null;
    }

    // Extract user data with fallbacks
    const messageUser = message.user || {};
    const isOwn = messageUser.id === session?.user?.id;
  
    return (
      <div className={cn(
        "flex gap-2 p-2",
        isOwn && "justify-end"
      )}>
        {!isOwn && (
          <Avatar>
            <AvatarImage 
              src={messageUser.image} 
              alt={messageUser.name || 'User avatar'}
            />
            <AvatarFallback>
              {(messageUser.name?.[0] || '?').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
  
        <div className={cn(
          "flex flex-col gap-1 max-w-[75%]",
          isOwn && "items-end"
        )}>
          {!isOwn && messageUser.name && (
            <span className="text-xs text-muted-foreground">
              {messageUser.name}
            </span>
          )}
  
          <div className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isOwn 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted"
          )}>
            {message.text || 'No message content'}
          </div>
  
          <span className="text-[10px] text-muted-foreground">
            {formatMessageTime(message.created_at || new Date())}
          </span>
        </div>
      </div>
    );
}

// Helper function to format message time
function formatMessageTime(timestamp) {
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  } catch (error) {
    return '';
  }
}