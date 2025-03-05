import { Card, CardHeader, CardContent, CardTitle } from "./card";
import { CheckCircle } from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";

export function FeaturedAccountCard({ platform, followers, engagement, price, verified, icon: Icon }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg group">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">{platform}</CardTitle>
          </div>
          {verified && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <CheckCircle className="mr-1 h-3 w-3" /> Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col space-y-1">
            <span className="text-muted-foreground">Followers</span>
            <span className="font-medium">{followers}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-muted-foreground">Engagement</span>
            <span className="font-medium">{engagement}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-2xl font-bold">${price}</span>
          <Button size="sm" className="group-hover:bg-primary">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}