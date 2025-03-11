'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  AlertCircle, ArrowLeft, Clock, Loader2, Plus, Search, Shield, X,
  CheckCircle, XCircle, AlertTriangle, HelpCircle
} from 'lucide-react';

// Helper function to get status badge
const getStatusBadge = (status) => {
  switch (status) {
    case 'OPEN':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock className="h-3 w-3 mr-1" />
          Open
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Shield className="h-3 w-3 mr-1" />
          Under Review
        </span>
      );
    case 'RESOLVED_BUYER_FAVOR':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resolved (Buyer)
        </span>
      );
    case 'RESOLVED_SELLER_FAVOR':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resolved (Seller)
        </span>
      );
    case 'RESOLVED_COMPROMISE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resolved (Compromise)
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <HelpCircle className="h-3 w-3 mr-1" />
          {status}
        </span>
      );
  }
};

// Helper function to get reason badge
const getReasonBadge = (reason) => {
  switch (reason) {
    case 'ITEM_NOT_RECEIVED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Not Received
        </span>
      );
    case 'ITEM_NOT_AS_DESCRIBED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Not As Described
        </span>
      );
    case 'PAYMENT_ISSUE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Payment Issue
        </span>
      );
    case 'COMMUNICATION_ISSUE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Communication
        </span>
      );
    case 'ACCOUNT_ACCESS_ISSUE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Account Access
        </span>
      );
    case 'OTHER':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Other
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {reason}
        </span>
      );
  }
};

export default function DisputesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDisputes();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router, statusFilter, roleFilter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      
      let url = '/api/disputes';
      const params = new URLSearchParams();
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      if (roleFilter) {
        params.append('role', roleFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch disputes');
      }
      
      const data = await response.json();
      setDisputes(data.disputes);
    } catch (err) {
      console.error('Error fetching disputes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter disputes based on search query
  const filteredDisputes = searchQuery
    ? disputes.filter(dispute => 
        dispute.order.listing.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.order.buyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.order.listing.seller.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : disputes;

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex gap-4 items-center mb-6">
        <div onClick={() => router.push('/dashboard')} className="text-muted-foreground hover:text-foreground cursor-pointer flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
        </div>
        <h1 className="text-2xl font-bold">Disputes</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-destructive hover:text-destructive/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search disputes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RESOLVED_BUYER_FAVOR">Resolved (Buyer)</option>
          <option value="RESOLVED_SELLER_FAVOR">Resolved (Seller)</option>
          <option value="RESOLVED_COMPROMISE">Resolved (Compromise)</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        
        {session?.user?.role === 'ADMIN' && (
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All Disputes</option>
            <option value="moderator">Assigned to Me / Unassigned</option>
            <option value="initiator">Initiated by Me</option>
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDisputes.length > 0 ? (
        <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <ul className="divide-y divide-border">
            {filteredDisputes.map((dispute) => {
              const isBuyer = dispute.order.buyerId === session.user.id;
              const otherParty = isBuyer 
                ? dispute.order.listing.seller.email 
                : dispute.order.buyer.email;
              
              return (
                <li key={dispute.id} className="hover:bg-muted/50 transition-colors">
                  <Link href={`/disputes/${dispute.id}`}>
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 flex-shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Dispute for {dispute.order.listing.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isBuyer ? 'Seller' : 'Buyer'}: {otherParty}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {getStatusBadge(dispute.status)}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(dispute.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="mr-2">
                          {getReasonBadge(dispute.reason)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {dispute.description.length > 100
                            ? dispute.description.substring(0, 100) + '...'
                            : dispute.description}
                        </p>
                      </div>
                      {dispute.messages && dispute.messages.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last message: {dispute.messages[0].content.length > 50
                            ? dispute.messages[0].content.substring(0, 50) + '...'
                            : dispute.messages[0].content}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No disputes found</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            You don't have any active disputes. If you're having an issue with an order, you can open a dispute from the order details page.
          </p>
        </div>
      )}
    </div>
  );
} 