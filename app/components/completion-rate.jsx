import { Card, CardContent } from "@/app/components/card";
import { cn } from "@/app/lib/utils";
import { CheckCircle, AlertTriangle, Shield, Star, Clock } from "lucide-react";
import { useCompletionRate } from "@/app/hooks/useCompletionRate";

export function CompletionRate({ userId }) {
  const { stats, isLoading, error, isSeller } = useCompletionRate(userId);

  // Function to determine the color based on completion rate
  const getCompletionRateColor = (rate) => {
    if (rate >= 90) return "text-green-500";
    if (rate >= 70) return "text-amber-500";
    return "text-red-500";
  };

  // Function to determine the icon based on completion rate
  const getCompletionRateIcon = (rate) => {
    if (rate >= 70) return <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />;
    return <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />;
  };

  // If user is not a seller, don't render anything
  if (!isLoading && !isSeller) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="mt-4 sm:mt-6">
        <CardContent className="p-3 sm:p-6">
          <h3 className="text-sm sm:text-base font-medium mb-3 sm:mb-4">Seller Performance</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="animate-pulse flex items-center justify-between">
              <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              <div className="h-3 sm:h-4 w-14 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            </div>
            <div className="h-1.5 sm:h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded-md mb-1 sm:mb-2"></div>
                  <div className="h-4 sm:h-5 w-10 sm:w-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return null;
  }

  return (
    <Card className="mt-4 sm:mt-6">
      <CardContent className="p-3 sm:p-6">
        <h3 className="text-sm sm:text-base font-medium mb-3 sm:mb-4">Seller Performance</h3>
        
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Completion Rate</span>
            <div className={cn("flex items-center gap-1 font-medium text-sm sm:text-base", 
              getCompletionRateColor(stats.completionRate)
            )}>
              {getCompletionRateIcon(stats.completionRate)}
              <span>{stats.completionRate}%</span>
            </div>
          </div>
          
          <div className="h-1.5 sm:h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full",
                stats.completionRate >= 90 ? "bg-green-500" : 
                stats.completionRate >= 70 ? "bg-amber-500" : 
                "bg-red-500"
              )}
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
          
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2">
            {stats.completionRate >= 90 
              ? "Excellent seller with high completion rate" 
              : stats.completionRate >= 70 
              ? "Good seller with decent completion rate" 
              : "New seller or needs improvement"}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
          <div>
            <div className="flex items-center gap-1 text-muted-foreground mb-0.5 sm:mb-1">
              <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Total Sales</span>
            </div>
            <span className="font-medium">{stats.totalSales}</span>
          </div>
          
          <div>
            <div className="flex items-center gap-1 text-muted-foreground mb-0.5 sm:mb-1">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Avg. Rating</span>
            </div>
            <span className="font-medium">
              {stats.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
            </span>
          </div>
          
          <div>
            <div className="flex items-center gap-1 text-muted-foreground mb-0.5 sm:mb-1">
              <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Completed</span>
            </div>
            <span className="font-medium">{stats.completedOrders}/{stats.totalOrders}</span>
          </div>
          
          <div>
            <div className="flex items-center gap-1 text-muted-foreground mb-0.5 sm:mb-1">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Success Rate</span>
            </div>
            <span className={cn(
              "font-medium",
              getCompletionRateColor(stats.completionRate)
            )}>
              {stats.completionRate}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 