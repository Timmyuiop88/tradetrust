import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Chat - TradeTrust',
  description: 'Chat with buyers and sellers on TradeTrust',
};

export default function ChatLayout({ children }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      </div>
    }>
      {children}
    </Suspense>
  );
} 