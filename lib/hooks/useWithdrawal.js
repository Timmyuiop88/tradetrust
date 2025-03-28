"use client"

import { useState } from "react"
import { useSubscription } from "./useSubscription"
import { toast } from "sonner"

export function useWithdrawal({ onSuccess }) {
  const { data: subscription } = useSubscription()
  const [amount, setAmount] = useState("")
  const [payoutSettings, setPayoutSettings] = useState([])
  const [selectedPayoutId, setSelectedPayoutId] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingSettings, setFetchingSettings] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  const fetchPayoutSettings = async () => {
    try {
      setFetchingSettings(true)
      const response = await fetch('/api/users/payout-settings')
      if (response.ok) {
        const data = await response.json()
        setPayoutSettings(data)
        
        // Set default payout method if available
        const defaultSetting = data.find(setting => setting.isDefault)
        if (defaultSetting) {
          setSelectedPayoutId(defaultSetting.id)
        } else if (data.length > 0) {
          setSelectedPayoutId(data[0].id)
        }
      } else {
        setError("Failed to load payout methods")
      }
    } catch (error) {
      console.error('Error fetching payout settings:', error)
      setError("Failed to load payout methods")
    } finally {
      setFetchingSettings(false)
    }
  }
  
  const submitWithdrawal = async (balance) => {
    setError(null)
    
    // Validate inputs
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return false
    }
    
    if (parseFloat(amount) > balance) {
      setError("Insufficient balance")
      return false
    }
    
    // Check minimum withdrawal amount based on subscription plan
    const minimumWithdrawal = subscription?.plan?.minimumWithdrawal || 0
    if (parseFloat(amount) < minimumWithdrawal) {
      setError(`Minimum withdrawal amount is $${minimumWithdrawal}`)
      return false
    }
    
    if (!selectedPayoutId) {
      setError("Please select a payout method")
      return false
    }
    
    try {
      setLoading(true)
      
      // Calculate fee based on subscription plan
      const feePercentage = subscription?.plan?.withdrawalFeeRate || 0.02 // Default 2% fee
      const fee = parseFloat(amount) * feePercentage
      const netAmount = parseFloat(amount) - fee
      
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          fee,
          netAmount,
          payoutSettingId: selectedPayoutId,
          planTier: subscription?.plan?.tier || 'FREE'
        }),
      })
      
      if (response.ok) {
        setSuccess(true)
        setAmount("")
        toast.success("Withdrawal request submitted successfully")
        
        // Call the onSuccess callback if provided
        if (typeof onSuccess === 'function') {
          onSuccess()
        }
        
        return true
      } else {
        const data = await response.json()
        setError(data.error || "Failed to submit withdrawal request")
        return false
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error)
      setError("An unexpected error occurred")
      return false
    } finally {
      setLoading(false)
    }
  }
  
  const getWithdrawalInfo = (inputAmount) => {
    const parsedAmount = parseFloat(inputAmount) || 0
    const feePercentage = subscription?.plan?.withdrawalFeeRate || 0.02 // Default 2% fee
    const fee = parsedAmount * feePercentage
    const netAmount = parsedAmount - fee
    const processingTime = subscription?.plan?.withdrawalSpeed || 48 // Default 48 hours
    const minimumWithdrawal = subscription?.plan?.minimumWithdrawal || 0
    
    return {
      fee,
      netAmount,
      processingTime,
      minimumWithdrawal,
      isEligible: parsedAmount >= minimumWithdrawal
    }
  }
  
  return {
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
    getWithdrawalInfo
  }
} 