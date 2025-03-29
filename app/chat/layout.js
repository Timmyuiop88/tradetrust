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
      
     <MessageSkeleton />
     
    }>
      {children}
    </Suspense>
  );
} 