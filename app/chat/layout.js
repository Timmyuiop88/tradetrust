import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Chat - TradeTrust',
  description: 'Chat with buyers and sellers on TradeTrust',
};

export default function ChatLayout({ children }) {
  return (
    <Suspense>
      {children}
    </Suspense>
  );
} 