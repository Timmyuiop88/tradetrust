"use client"

import { useState } from "react"
import { Button } from "@/app/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/components/dialog"
import { Input } from "@/app/components/input"
import { Label } from "@/app/components/label"
import { RadioGroup, RadioGroupItem } from "@/app/components/radio-group"
import { usePayoutSettings } from "@/app/hooks/usePayoutSettings"
import { Wallet, Plus, Trash2, Check, AlertCircle, Loader2 } from "lucide-react"
import { Badge } from "@/app/components/badge"
import axios from "axios"

// Payment method icons
const methodIcons = {
    BTC: "₿",
    USDT_TRC20: "₮",
    ETH: "Ξ",
    //BANK_TRANSFER: "🏦"
}

// Payment method labels
const methodLabels = {
    BTC: "Bitcoin (BTC)",
    USDT_TRC20: "Tether (USDT-TRC0)",
    ETH: "Ethereum (ETH)",
    //BANK_TRANSFER: "Bank Transfer"
}

export function PaymentSettingsSection() {
    const { data: payoutSettings, isLoading, refetch } = usePayoutSettings()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedMethod, setSelectedMethod] = useState("BTC")
    const [address, setAddress] = useState("")
    const [isDefault, setIsDefault] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [editingId, setEditingId] = useState(null)

    const handleOpenModal = (existingMethod = null) => {
        if (existingMethod) {
            setSelectedMethod(existingMethod.method)
            setAddress(existingMethod.address)
            setIsDefault(existingMethod.isDefault)
            setEditingId(existingMethod.id)
        } else {
            setSelectedMethod("BTC")
            setAddress("")
            setIsDefault(payoutSettings?.length === 0) // Default to true if first method
            setEditingId(null)
        }
        setError(null)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setError(null)
    }

    const handleSubmit = async () => {
        setError(null)

        if (!address.trim()) {
            setError("Please enter a valid address")
            return
        }

        setIsUpdating(true)

        try {
            await axios.post("/api/users/payout-settings", {
                id: editingId,
                method: selectedMethod,
                address: address.trim(),
                isDefault
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
            handleCloseModal()
            refetch()
        } catch (err) {
            console.error("Error saving payment method:", err)
            setError(err.response?.data?.error || "Failed to save payment method")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this payment method?")) {
            try {
                await axios.post("/api/users/payout-settings", {
                    id: id,
                    delete: true
                }, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                refetch()
            } catch (err) {
                console.error("Failed to delete payment method", err)
            }
        }
    }

    return (
        <div className="space-y-6">
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start gap-2">
                    <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p>Payment method saved successfully</p>
                </div>
            )}

            <div className="flex items-center justify-between">
                {/*<h2 className="text-[18px] sm:text-xs md:text-sm font-semibold">Payout Methods</h2>*/}
                <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleOpenModal()}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Method
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : !payoutSettings || payoutSettings.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No payout methods</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Add a payout method to receive payments for your sales
                    </p>
                    <Button className="mt-4" onClick={() => handleOpenModal()}>
                        Add Your First Method
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {payoutSettings.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg w-full">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold">
                                    {methodIcons[method.method] || "💰"}
                                </div>
                                <div className="w-full text-[10px] sm:text-xs md:text-sm">
                                    <div className="font-medium flex items-center gap-2 text-[10px] sm:text-xs md:text-sm">
                                        {methodLabels[method.method] || method.method}
                                        {method.isDefault && (
                                            <Badge variant="outline" className="text-xs">Default</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-[300px]">
                                        {method.address}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs md:text-sm">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenModal(method)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDelete(method.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Payment Method Modal */}
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
                        <DialogDescription>
                            Add a payment method to receive your earnings
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <RadioGroup
                                value={selectedMethod}
                                onValueChange={setSelectedMethod}
                                className="grid grid-cols-1 gap-2"
                            >
                                {Object.entries(methodLabels).map(([value, label]) => (
                                    <div key={value} className="flex items-center space-x-2 border p-3 rounded-md">
                                        <RadioGroupItem value={value} id={value} />
                                        <Label htmlFor={value} className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{methodIcons[value]}</span>
                                                <span>{label}</span>
                                            </div>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">
                                {selectedMethod === "BANK_TRANSFER" ? "Bank Details" : "Wallet Address"}
                            </Label>
                            <Input
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder={selectedMethod === "BANK_TRANSFER"
                                    ? "Enter your bank account details"
                                    : `Enter your ${methodLabels[selectedMethod]} address`
                                }
                            />
                            <p className="text-sm text-muted-foreground">
                                {selectedMethod === "BANK_TRANSFER"
                                    ? "Include account number, bank name, and any routing information"
                                    : "Double-check your address to avoid loss of funds"
                                }
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="default-method"
                                checked={isDefault}
                                onChange={(e) => setIsDefault(e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="default-method">Set as default payment method</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isUpdating}>
                            {isUpdating ? "Saving..." : "Save Method"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 