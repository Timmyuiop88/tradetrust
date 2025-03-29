"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/hooks/useUser";
import { useKycStatus } from "@/app/hooks/useKyc";
import { Button } from "@/app/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/app/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/avatar";
import { Badge } from "@/app/components/badge";
//import { Separator } from "@/app/components/separator"
import {
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  FileText,
  CreditCard,
  Package,
  Settings,
  Edit,
  ExternalLink,
  Wallet,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Wallet2,
  Users,
  AlertTriangle, Info, Moon, Sun 
} from "lucide-react";
import { format } from "date-fns";
import { AddBalanceSheet } from "@/app/components/add-balance-sheet";
import { UserReviews } from "./user-reviews";
import { useSession, signOut } from "next-auth/react";
import { CompactPlanIndicator } from "@/app/components/CompactPlanIndicator";
import { FollowersCount } from "@/app/components/followers-count";
import NotificationSettings from "@/app/dashboard/settings/notifications";
import { NotificationBell } from "@/app/components/notification-bell";
import { useTheme } from "next-themes";
import { NotificationsSheet } from "@/app/components/notifications-sheet";
export default function ProfilePage() {
  const router = useRouter();
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useUser();
  const { data: kycData, isLoading: kycLoading } = useKycStatus();
  const [activeTab, setActiveTab] = useState("overview");
  const [balanceData, setBalanceData] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const [activityData, setActivityData] = useState(null);
  const [activityLoading, setActivityLoading] = useState(true);
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { theme, setTheme } = useTheme()
  // Define formatDate function at the top level
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Invalid date";
    }
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const handleLogout = () => {
    signOut();
    router.push("/login");
  };

  // Fetch user balance data
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setBalanceLoading(true);
        const response = await fetch("/api/user/balance");
        if (response.ok) {
          const data = await response.json();
          setBalanceData(data);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
  }, []);

  // Fetch user sales data if they're a seller
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setSalesLoading(true);
        const response = await fetch("/api/user/listings/stats");
        if (response.ok) {
          const data = await response.json();
          setSalesData(data);
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
      } finally {
        setSalesLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  // Add this effect to fetch user activity
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setActivityLoading(true);
        const response = await fetch("/api/user/activity");
        if (response.ok) {
          const data = await response.json();
          setActivityData(data);
        }
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivity();
  }, []);

  // Add detailed debugging
  useEffect(() => {
    console.log("Profile page loaded with userData:", userData);
    if (userData) {
      console.log("User data details:", {
        id: userData.id,
        email: userData.email,
        hasKyc: userData.kyc,
      });

      if (userData.kyc) {
        console.log("KYC data:", {
          fullName: userData.kyc.fullName,
          country: userData.kyc.country,
          countryType: typeof userData.kyc.country,
          address: userData.kyc.address,
          verified: userData.kyc.verified,
          hasDocuments: !!userData.kyc.documents,
        });
      }
    }
  }, [userData]);

  if (userLoading || kycLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="h-24 bg-muted animate-pulse rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
          </div>
          <div className="md:col-span-2">
            <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <p>
                Error loading profile:{" "}
                {userError.message || "Please try again later"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = userData || {};
  const isKycVerified = user.isKycVerified || kycData?.isKycVerified;
  const kycDocuments = user.kyc?.documents || {};
  const hasIdDocument = !!kycDocuments.governmentId;
  const hasFaceVerification = !!kycDocuments.faceScan;
  const hasAddressProof = !!kycDocuments.addressProof;

  // Log the final user object we're using for rendering
  console.log("Final user object for rendering:", {
    name: user.name || user.kyc?.fullName,
    email: user.email,
    country: user.kyc?.country,
    hasKyc: !!user.kyc,
  });

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Helper function to get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case "PURCHASE":
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case "SALE":
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case "LISTING_CREATED":
        return <Package className="h-5 w-5 text-purple-500" />;
      case "BALANCE_ADDED":
        return <ArrowUpRight className="h-5 w-5 text-green-500" />;
      case "WITHDRAWAL":
        return <ArrowDownRight className="h-5 w-5 text-amber-500" />;
      case "DISPUTE_OPENED":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "DISPUTE_RESOLVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-primary" />;
    }
  };

  // Helper function to get entity icon
  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case "order":
        return <CreditCard className="h-3 w-3" />;
      case "listing":
        return <Package className="h-3 w-3" />;
      case "dispute":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Helper function to get activity message
  const getActivityMessage = (activity) => {
    switch (activity.type) {
      case "PURCHASE":
        return `Purchased ${activity.metadata?.listingTitle || "an item"}`;
      case "SALE":
        return `Sold ${activity.metadata?.listingTitle || "an item"}`;
      case "LISTING_CREATED":
        return `Created listing: ${
          activity.metadata?.listingTitle || "New listing"
        }`;
      case "BALANCE_ADDED":
        return `Added ${formatCurrency(activity.metadata?.amount)} to balance`;
      case "WITHDRAWAL":
        return `Withdrew ${formatCurrency(
          activity.metadata?.amount
        )} from balance`;
      case "DISPUTE_OPENED":
        return `Opened a dispute for order #${activity.entityId}`;
      case "DISPUTE_RESOLVED":
        return `Dispute resolved for order #${activity.entityId}`;
      default:
        return activity.description || "Activity recorded";
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-0">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-1xl md:text-2xl font-bold">Your Profile</h2>
            <div className="flex items-center gap-2">
              <NotificationBell />
            <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="gap-1"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => router.push("/dashboard/settings")}
              >
                <Settings className="h-4 w-4" />
              
              </Button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 p-5 border-2 border-primary">
              <AvatarFallback className="text-2xl font-bold text-black dark:text-primary">
                {user.firstName && user.lastName 
                  ? `${user.firstName[0]}${user.lastName[0]}` 
                  : user.firstName 
                    ? user.firstName[0] 
                    : user.email 
                      ? user.email[0].toUpperCase() 
                      : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-1xl md:text-2xl font-bold">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user.email || "User"}
              </h1>
              <p className="text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">{user.email}</p>

              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                <Badge
              
                  variant={isKycVerified ? "default" : "danger"}
                >
                  {isKycVerified ? "KYC Verified" : "KYC Incomplete"}
                </Badge>
                <Badge
                  
                  variant={user.isEmailVerified ? "default" : "danger"}
                >
                  {user.isEmailVerified ? "Email Verified" : "Email Unverified"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="w-full mb-6">
              <CompactPlanIndicator />
            </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-primary" />
              Buying Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2  justify-between flex-col md:flex-row">
              <div className="text-2xl font-bold md:text-3xl">
                {balanceLoading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  formatCurrency(balanceData?.balance?.buyingBalance || 0)
                )}
              </div>
              <AddBalanceSheet>
                <Button size="sm" className="gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Add Funds
                </Button>
              </AddBalanceSheet>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-500" />
              Selling Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2  justify-between flex-col md:flex-row">
              <div className="text-2xl font-bold md:text-3xl">
                {balanceLoading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  formatCurrency(balanceData?.balance?.sellingBalance || 0)
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => router.push("/dashboard/balance")}
              >
                <ExternalLink className="h-4 w-4" />
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
      className="mb-6"
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="tabtext">Overview</TabsTrigger>
          <TabsTrigger value="kyc" className="tabtext">KYC </TabsTrigger>
          <TabsTrigger value="activity" className="tabtext">Activity</TabsTrigger>
          <TabsTrigger value="logout" className="tabtext">Logout</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-sm md:font-medium overflow-hidden text-ellipsis whitespace-nowrap ">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.kyc?.fullName || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-sm md:font-medium overflow-hidden text-ellipsis whitespace-nowrap ">
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-sm md:font-medium overflow-hidden text-ellipsis whitespace-nowrap ">
                    {user.kyc?.country || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-sm md:font-medium overflow-hidden text-ellipsis whitespace-nowrap ">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
             
            </CardFooter>
          </Card>

          {/* Seller Stats (if user has listings) */}
          {!salesLoading && salesData?.totalListings > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Seller Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      Active Listings
                    </p>
                    <p className="text-2xl font-bold">
                      {salesData?.activeListings || 0}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold">
                      {salesData?.totalSales || 0}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(salesData?.totalRevenue || 0)}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                    <p className="text-2xl font-bold">
                      {salesData?.averageRating?.toFixed(1) || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => router.push("/dashboard/listings")}
                  >
                    <Package className="h-4 w-4" />
                    Manage Listings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-center justify-center py-4 gap-2"
                  onClick={() => router.push("/dashboard/balance")}
                >
                  <Wallet className="h-6 w-6 text-primary" />
                  <span>Manage Balance</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col items-center justify-center py-4 gap-2"
                  onClick={() => router.push("/dashboard/sell")}
                >
                  <Package className="h-6 w-6 text-primary" />
                  <span>Create Listing</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col items-center justify-center py-4 gap-2"
                  onClick={() =>
                    router.push(
                      `/dashboard/profile/${session?.user?.id}/followers?tab=following`
                    )
                  }
                >
                  <Users className="h-6 w-6 text-primary" />
                  <div className="flex flex-col items-center">
                    <span>
                      My Favorites{" "}
                      {session?.user?.id && (
                        <FollowersCount
                          userId={session?.user?.id}
                          displayMode="compact"
                        />
                      )}
                    </span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col items-center justify-center py-4 gap-2"
                  onClick={() => router.push("/dashboard/settings#payment")}
                >
                  <Wallet2 className="h-6 w-6 text-primary" />
                  <span>Payment Methods</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc">
          <Card>
            <CardHeader>
              <CardTitle>KYC Verification</CardTitle>
              <CardDescription>
                Complete your identity verification to unlock all platform
                features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Verification Status */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isKycVerified ? "bg-green-100" : "bg-amber-100"
                      }`}
                    >
                      {isKycVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Verification Status</p>
                      <p className="text-sm text-muted-foreground">
                        {isKycVerified
                          ? "Your identity has been verified"
                          : "Verification required"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isKycVerified ? "success" : "warning"}>
                    {isKycVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </div>

              {/* Verification Steps */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Verification Steps</h3>

                {/* Personal Information */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center mt-0.5 ${
                        user.kyc ? "bg-green-100" : "bg-muted"
                      }`}
                    >
                      {user.kyc ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium">1</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Personal Information</h4>
                        {user.kyc ? (
                          <Badge variant="outline" className="text-green-600">
                            Completed
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push("/dashboard/kyc")}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Provide your full name, address, and date of birth
                      </p>

                      {user.kyc && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Full Name</p>
                            <p className="font-medium">
                              {user.kyc.fullName || "Not provided"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Country</p>
                            <p className="font-medium">
                              {user.kyc.country || "Not provided"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ID Verification */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center mt-0.5 ${
                        hasIdDocument ? "bg-green-100" : "bg-muted"
                      }`}
                    >
                      {hasIdDocument ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium">2</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">ID Verification</h4>
                        {hasIdDocument ? (
                          <Badge variant="outline" className="text-green-600">
                            Completed
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push("/dashboard/kyc/documents")
                            }
                            disabled={!user.kyc}
                          >
                            {!user.kyc ? "Complete Step 1 First" : "Upload ID"}
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload a government-issued ID (passport, driver's
                        license, etc.)
                      </p>

                      {hasIdDocument && (
                        <div className="mt-3">
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            ID Document Uploaded
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Verification */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center mt-0.5 ${
                        hasAddressProof ? "bg-green-100" : "bg-muted"
                      }`}
                    >
                      {hasAddressProof ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium">3</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Address Verification</h4>
                        {hasAddressProof ? (
                          <Badge variant="outline" className="text-green-600">
                            Completed
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push("/dashboard/kyc/documents")
                            }
                            disabled={!hasIdDocument}
                          >
                            {!hasIdDocument
                              ? "Complete Step 2 First"
                              : "Upload Proof"}
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload a proof of address (utility bill, bank statement,
                        etc.)
                      </p>

                      {hasAddressProof && (
                        <div className="mt-3">
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Address Proof Uploaded
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Face Verification */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center mt-0.5 ${
                        hasFaceVerification ? "bg-green-100" : "bg-muted"
                      }`}
                    >
                      {hasFaceVerification ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium">4</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Face Verification</h4>
                        {hasFaceVerification ? (
                          <Badge variant="outline" className="text-green-600">
                            Completed
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push("/dashboard/kyc/face-verification")
                            }
                            disabled={!hasAddressProof}
                          >
                            {!hasAddressProof
                              ? "Complete Step 3 First"
                              : "Verify Face"}
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Complete a quick face scan to verify your identity
                      </p>

                      {hasFaceVerification && (
                        <div className="mt-3">
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Face Verification Complete
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Benefits */}
              <div className="rounded-lg bg-muted/50 p-4">
                <h3 className="text-sm font-medium mb-2">
                  Benefits of Verification
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Higher purchase limits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Ability to sell accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Withdraw funds to your bank account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Enhanced account security</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => router.push("/dashboard/kyc")}
                disabled={isKycVerified}
              >
                {isKycVerified
                  ? "Verification Complete"
                  : "Start Verification Process"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg border animate-pulse"
                    >
                      <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                      <div className="h-4 bg-muted rounded w-20 mt-2 sm:mt-0" />
                    </div>
                  ))}
                </div>
              ) : !activityData?.items?.length ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    No recent activity to display
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityData.items.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {activity.title || getActivityMessage(activity)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {activity.description}
                          {activity.status &&
                            activity.status !== "COMPLETED" && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                {activity.status}
                              </span>
                            )}
                        </p>
                      </div>

                      <div className="text-xs text-muted-foreground mt-1 sm:mt-0 self-start sm:self-center whitespace-nowrap">
                        {formatDate(activity.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activityData?.items?.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => router.push("/dashboard/activity")}
                  >
                    View All Activity
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logout">
        <Card>
            <CardHeader>
              <CardTitle>Logout</CardTitle>
              <CardDescription>
                Are you sure you want to logout?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLogout}>Yes, logout</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <NotificationSettings />
      {/* Add the UserReviews component at the bottom of the page if has verified KYC */}
      {userData.kyc && <UserReviews />}
    </div>
  );
}

function getActivityIcon(type) {
  switch (type) {
    case "PURCHASE":
      return <CreditCard className="h-5 w-5 text-blue-600" />;
    case "SALE":
      return <DollarSign className="h-5 w-5 text-green-600" />;
    case "DEPOSIT":
      return <ArrowUpRight className="h-5 w-5 text-green-600" />;
    case "WITHDRAWAL":
      return <ArrowDownRight className="h-5 w-5 text-red-600" />;
    case "LISTING_CREATED":
      return <Package className="h-5 w-5 text-purple-600" />;
    case "KYC_UPDATE":
      return <Shield className="h-5 w-5 text-amber-600" />;
    default:
      return <Clock className="h-5 w-5 text-gray-600" />;
  }
}

function getActivityIconBackground(type) {
  switch (type) {
    case "PURCHASE":
      return "bg-blue-100";
    case "SALE":
      return "bg-green-100";
    case "DEPOSIT":
      return "bg-green-100";
    case "WITHDRAWAL":
      return "bg-red-100";
    case "LISTING_CREATED":
      return "bg-purple-100";
    case "KYC_UPDATE":
      return "bg-amber-100";
    default:
      return "bg-gray-100";
  }
}

function getStatusVariant(status) {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "success";
    case "PENDING":
      return "warning";
    case "FAILED":
      return "destructive";
    default:
      return "outline";
  }
}
