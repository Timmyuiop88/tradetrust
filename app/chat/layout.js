import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Chat - TradeVero',
  description: 'Chat with buyers and sellers on TradeVero',
};

const MessageSkeleton = ({ align = 'left' }) => (
  <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-[75%] ${align === 'right' ? 'bg-primary/30' : 'bg-muted'} rounded-lg px-4 py-2 shadow-sm animate-pulse`}>
      <div className="h-4 w-24 bg-muted-foreground/20 rounded mb-2"></div>
      <div className="space-y-2">
        <div className="h-3 w-48 bg-muted-foreground/20 rounded"></div>
        <div className="h-3 w-32 bg-muted-foreground/20 rounded"></div>
      </div>
      <div className="flex justify-end mt-1">
        <div className="h-3 w-12 bg-muted-foreground/20 rounded"></div>
      </div>
    </div>
  </div>
);
export default function ChatLayout({ children }) {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen max-h-screen bg-background">
      {/* Header skeleton */}
      <div className="border-b p-4 animate-pulse">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-muted"></div>
          <div className="ml-3">
            <div className="h-4 w-24 bg-muted rounded"></div>
            <div className="h-3 w-16 bg-muted rounded mt-1"></div>
          </div>
        </div>
      </div>
      
      {/* Chat container with skeleton messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageSkeleton align="left" />
        <MessageSkeleton align="right" />
        <MessageSkeleton align="left" />
        <MessageSkeleton align="right" />
      </div>
      
      {/* Input skeleton */}
      <div className="border-t p-4 animate-pulse">
        <div className="flex items-center">
          <div className="flex-1 h-10 bg-muted rounded-md"></div>
          <div className="h-10 w-10 bg-muted rounded-full ml-2"></div>
        </div>
      </div>
    </div>
     
    }>
      {children}
    </Suspense>
  );
} 