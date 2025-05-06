import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/app/components/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { Badge } from '@/app/components/badge';
import Link from 'next/link';
export function ChatHeader({ order }) {
    const router = useRouter();
    const { data, isLoading, refetch } = useQuery({
      queryKey: ['order', order?.id],
      enabled: false,
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
  
    const handleRefresh = async () => {
      setIsRefreshing(true);
      await refetch();
      setIsRefreshing(false);
    };
  
    return (
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 border-b">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/orders')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
  
            <div className="flex flex-col">
              <h1 className="text-sm font-medium leading-none">
                {isLoading ? (
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                ) : (
                  `Order #${order?.id?.substring(0, 8)}`
                )}
              </h1>
              {!isLoading && order && (
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {order.listing?.platform.name} • {order.listing?.username}
                  </span>
                </div>
              )}
            </div>
          </div>
  
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="h-8 w-8"
            >
              <RefreshCw 
                className={cn("h-4 w-4", 
                  (isRefreshing || isLoading) && "animate-spin"
                )} 
              />
            </Button>
  
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <Link href={`/dashboard/orders/${order?.id}`}>
                View Order
              </Link>
            </Button>
          </div>
        </div>
      </header>
    );
  }