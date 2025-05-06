"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/sheet";
import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { Label } from "@/app/components/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/radio-group";
import { Loader2, AlertCircle, Plane, Clock, ArrowDown } from "lucide-react";
import { useWithdrawal } from "@/lib/hooks/useWithdrawal";
import { formatCurrency } from "@/lib/utils";

export function WithdrawSheet({ children, balance = 0, onSuccess }) {
  const [open, setOpen] = useState(false);

  const {
    amount,
    setAmount,
    payoutSettings,
    selectedPayoutId,
    setSelectedPayoutId,
    loading,
    fetchingSettings,
    error,
    setError,
    success,
    setSuccess,
    fetchPayoutSettings,
    submitWithdrawal,
    getWithdrawalInfo,
  } = useWithdrawal({ onSuccess });

  // Calculate withdrawal details based on current amount
  const withdrawalInfo = getWithdrawalInfo(amount);

  useEffect(() => {
    if (open) {
      fetchPayoutSettings();
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await submitWithdrawal(balance);

    if (result) {
      // Close the sheet after a delay
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setError(null);
      setSuccess(false);
    }
  };

  const formatPayoutMethodLabel = (method, details) => {
    const methodLabels = {
      BTC: "Bitcoin",
      ETH: "Ethereum",
      USDT_TRC20: "USDT (TRC20)",
      BANK_TRANSFER: "Bank Transfer",
    };

    const label = methodLabels[method] || method;

    if (method === "BTC" || method === "ETH" || method === "USDT_TRC20") {
      return `${label} - ${details.address.substring(
        0,
        6
      )}...${details.address.substring(details.address.length - 4)}`;
    } else if (method === "BANK_TRANSFER") {
      return `${label} - ${details.bankName} (${details.accountNumber.substring(
        details.accountNumber.length - 4
      )})`;
    }

    return label;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Withdraw Funds</SheetTitle>
        </SheetHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Plane className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              Withdrawal Request Submitted!
            </h3>
            <p className="text-muted-foreground mb-6">
              Your withdrawal request is on its way to processing. You can track
              its status in the withdrawals tab.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Withdraw</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  step="0.01"
                  min={withdrawalInfo.minimumWithdrawal}
                  max={balance}
                  disabled={loading || fetchingSettings}
                />
              </div>

              {parseFloat(amount) > 0 && (
                <div className="mt-2 p-3 bg-muted/30 rounded-md space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fee:</span>
                    <span>{formatCurrency(withdrawalInfo.fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>You'll receive:</span>
                    <span>{formatCurrency(withdrawalInfo.netAmount)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      Estimated processing time: {withdrawalInfo.processingTime}
                      h
                    </span>
                  </div>
                </div>
              )}

              {balance <= 0 && (
                <p className="text-sm text-amber-600 flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  You don't have any funds available to withdraw
                </p>
              )}

              {parseFloat(amount) > 0 &&
                parseFloat(amount) < withdrawalInfo.minimumWithdrawal && (
                  <p className="text-sm text-amber-600 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Minimum withdrawal amount is{" "}
                    {formatCurrency(withdrawalInfo.minimumWithdrawal)}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label>Select Payment Method</Label>
              {fetchingSettings ? (
                <div className="flex items-center justify-center py-4">
                  <div className="space-y-2 w-full">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="h-14 bg-muted rounded-md animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              ) : payoutSettings.length > 0 ? (
                <RadioGroup
                  value={selectedPayoutId}
                  onValueChange={setSelectedPayoutId}
                >
                  <div className="space-y-2">
                    {payoutSettings.map((setting) => (
                      <div
                        key={setting.id}
                        className="flex items-center space-x-2 border p-3 rounded-md"
                      >
                        <RadioGroupItem
                          value={setting.id}
                          id={setting.id}
                          disabled={loading}
                        />
                        <Label
                          htmlFor={setting.id}
                          className="flex-1 cursor-pointer"
                        >
                          {formatPayoutMethodLabel(
                            setting.method,
                            setting.details
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="border rounded-md p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    No payout methods found
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      (window.location.href = href="/marketplace/settings#payment")
                    }
                  >
                    Add Payout Method
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  loading ||
                  fetchingSettings ||
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  parseFloat(amount) > balance ||
                  parseFloat(amount) < withdrawalInfo.minimumWithdrawal ||
                  !selectedPayoutId
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Withdraw Funds"
                )}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
