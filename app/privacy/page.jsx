"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PrivacyPage() {
    const router = useRouter()
    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-3xl mx-auto py-12 px-4">
                <div
                    onClick={() => router.back()}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </div>

                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

                <div className="prose prose-gray max-w-none">
                    <p className="text-muted-foreground mb-8">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                        <p className="mb-4">We collect information that you provide directly to us, including:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Account information (name, email, password)</li>
                            <li>Profile information</li>
                            <li>Payment information</li>
                            <li>Communication preferences</li>
                            <li>Transaction history</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                        <p className="mb-4">We use the information we collect to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide and maintain our services</li>
                            <li>Process transactions</li>
                            <li>Send notifications and updates</li>
                            <li>Prevent fraud and abuse</li>
                            <li>Improve our platform</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                        <p className="mb-4">
                            We do not sell your personal information. We share information only:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>With your consent</li>
                            <li>To process payments</li>
                            <li>To comply with legal obligations</li>
                            <li>To protect rights and safety</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                        <p className="mb-4">
                            We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
                        <p className="mb-4">
                            We use cookies and similar technologies to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Keep you logged in</li>
                            <li>Remember your preferences</li>
                            <li>Understand how you use our platform</li>
                            <li>Improve our services</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
                        <p className="mb-4">
                            You have the right to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate information</li>
                            <li>Request deletion of your information</li>
                            <li>Opt out of marketing communications</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
                        <p className="mb-4">
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <p className="text-primary">support@tradevero.io</p>
                    </section>
                </div>
            </div>
        </div>
    )
} 