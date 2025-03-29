import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Chat - TradeVero',
  description: 'Chat with buyers and sellers on TradeVero',
};

export default function ChatLayout({ children }) {
  return (
    <Suspense>
      {children}
    </Suspense>
  );
} 