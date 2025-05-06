import { useCallback } from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/app/components/button';
import { useRouter } from 'next/navigation';
import { cn } from "@/app/lib/utils"

export function ChatErrorState({ error }) {
  const router = useRouter();

  const handleBackClick = useCallback(() => {
    router.push('/dashboard/orders');
  }, [router]);

  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="h-14 border-b flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackClick}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          
          <h2 className="text-lg font-semibold">
            {error?.message || 'Unable to load chat'}
          </h2>
          
          <p className="text-sm text-muted-foreground">
            {error?.message 
              ? 'Please try again or contact support if the problem persists.'
              : 'There was a problem loading the chat. Please try again.'}
          </p>

          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
            <Button
              variant="default"
              onClick={handleBackClick}
            >
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
