import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Power, Loader2, MoreVertical } from "lucide-react";
import { Button } from "@/app/components/button";
import { useToggleListingStatus, useUpdateListing } from "@/app/hooks/useListings";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/dialog";
import { Input } from "@/app/components/input";
import { Label } from "@/app/components/label";
import { Textarea } from "@/app/components/textarea";
import { toast } from "@/app/components/custom-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

export function ListingCard({ listing }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedListing, setEditedListing] = useState({
    price: listing.price,
    description: listing.description,
    negotiable: listing.negotiable
  });

  const { mutate: toggleStatus, isPending: isTogglingStatus } = useToggleListingStatus();
  const { mutate: updateListing, isPending: isUpdating } = useUpdateListing();

  const isActive = listing.status === "AVAILABLE";

  const handleToggleStatus = () => {
    const newStatus = isActive ? "INACTIVE" : "AVAILABLE";
    const actionText = isActive ? "deactivate" : "reactivate";
    
    if (confirm(`Are you sure you want to ${actionText} this listing?`)) {
      toggleStatus(
        { id: listing.id, status: newStatus },
        {
          onSuccess: () => {
            toast.success(`Listing ${isActive ? "deactivated" : "reactivated"} successfully`);
          },
          onError: (error) => {
            const errorMessage = error.data?.error || error.message || `Failed to ${actionText} listing`;
            
            if (error.data?.activeListings && error.data?.maxActiveListings) {
              toast.error(
                `${errorMessage} (${error.data.activeListings}/${error.data.maxActiveListings} active listings)`,
                { duration: 5000 }
              );
            } else {
              toast.error(errorMessage);
            }
          }
        }
      );
    }
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    updateListing(
      { id: listing.id, ...editedListing },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          toast.success("Listing updated successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update listing");
        }
      }
    );
  };

  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col">
        <CardContent className="flex-grow p-4 flex items-center justify-between">
          <div className="flex-1 pr-2">
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">{listing.username || listing.title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-2">{listing.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={handleEdit}
                disabled={isUpdating || isTogglingStatus || (listing.status !== "AVAILABLE" && listing.status !== "INACTIVE")}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleToggleStatus}
                disabled={isTogglingStatus || isUpdating || (listing.status !== "AVAILABLE" && listing.status !== "INACTIVE")}
                className={`cursor-pointer ${isActive ? "text-destructive" : "text-green-500"}`}
              >
                <Power className="mr-2 h-4 w-4" />
                <span>{isActive ? "Deactivate" : "Reactivate"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <span className="font-bold">{formatCurrency(listing.price)}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Listed: {new Date(listing.createdAt).toLocaleDateString()}
            </span>
            <Badge variant={isActive ? "success" : "secondary"}>
              {isActive ? "ACTIVE" : "INACTIVE"}
            </Badge>
            {(isUpdating || isTogglingStatus) && (
              <Loader2 className="h-4 w-4 animate-spin ml-1" />
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={editedListing.price}
                onChange={(e) => setEditedListing({ ...editedListing, price: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedListing.description}
                onChange={(e) => setEditedListing({ ...editedListing, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="negotiable"
                checked={editedListing.negotiable}
                onChange={(e) => setEditedListing({ ...editedListing, negotiable: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="negotiable">Price is negotiable</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ListingCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="flex-grow p-4 flex items-center justify-between">
        <div className="w-3/4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-1 animate-pulse"></div>
        </div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </CardFooter>
    </Card>
  );
} 