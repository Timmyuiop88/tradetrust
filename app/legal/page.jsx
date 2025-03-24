"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/app/components/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import { ShieldCheck, LockIcon } from "lucide-react"
import { Header } from "@/app/components/header"
import { Footer } from "@/app/components/footer"
import { 
  AnimateOnScroll, 
  AnimateStagger, 
  StaggerItem,
  fadeIn,
  fadeInUp,
  zoomIn
} from "@/app/components/animate"
import { motion, AnimatePresence } from "framer-motion"

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState("terms")
  
  const currentYear = new Date().getFullYear()
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-[900px] mx-auto">
            <AnimateOnScroll variants={fadeInUp} className="text-center mb-12">
              <div className="inline-flex items-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
                <LockIcon className="mr-2 h-4 w-4" />
                Legal Information
              </div>
              <h1 className="text-4xl font-bold mb-4">Privacy Policy & Terms</h1>
              <p className="text-lg text-muted-foreground">
                Our commitment to privacy, security, and clear terms for all users
              </p>
            </AnimateOnScroll>
            
            <AnimateOnScroll variants={fadeIn} className="w-full">
              <Tabs defaultValue="terms" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-10">
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                    <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                  </TabsList>
                </div>
                
                <AnimatePresence mode="wait">
                  {/* Terms of Service */}
                  <TabsContent value="terms" className="prose dark:prose-invert max-w-none">
                    <AnimateStagger className="space-y-8">
                      <StaggerItem>
                        <h2 className="text-2xl font-bold">Terms of Service</h2>
                        <p className="text-muted-foreground text-sm mb-6">Last updated: May 1, {currentYear}</p>
                        
                        <p>Welcome to TrustTrade. These Terms of Service ("Terms") govern your use of the TrustTrade website and services. By accessing or using TrustTrade, you agree to be bound by these Terms.</p>
                      </StaggerItem>
                      
                      <StaggerItem>
                        <h3 className="text-xl font-bold">1. Account Terms</h3>
                        <div className="space-y-4 mt-4">
                          <p>1.1 You must create an account to use certain features of TrustTrade. You are responsible for maintaining the security of your account and password.</p>
                          
                          <p>1.2 You must provide accurate, complete, and up-to-date information when creating your account. You are responsible for any activity that occurs under your account.</p>
                          
                          <p>1.3 You must be at least 18 years old to create an account and use TrustTrade services.</p>
                          
                          <p>1.4 TrustTrade reserves the right to suspend or terminate accounts that violate these Terms or for any other reason at our sole discretion.</p>
                        </div>
                      </StaggerItem>
                      
                      <StaggerItem>
                        <h3 className="text-xl font-bold">2. Platform Rules</h3>
                        <div className="space-y-4 mt-4">
                          <p>2.1 You agree not to use TrustTrade for any illegal purposes or in violation of any applicable laws or regulations.</p>
                          
                          <p>2.2 You agree not to misrepresent social media accounts you list for sale, including but not limited to followers, engagement, or account history.</p>
                          
                          <p>2.3 You agree not to attempt to circumvent our escrow system or make arrangements outside the platform for transactions initiated on TrustTrade.</p>
                          
                          <p>2.4 You agree not to use TrustTrade to sell accounts that contain illegal content or violate the terms of service of the social media platform.</p>
                        </div>
                      </StaggerItem>
                      
                      <StaggerItem>
                        <h3 className="text-xl font-bold">3. Escrow Service</h3>
                        <div className="space-y-4 mt-4">
                          <p>3.1 TrustTrade provides an escrow service to facilitate transactions between buyers and sellers.</p>
                          
                          <p>3.2 Buyers agree to deposit funds into escrow before the account transfer process begins.</p>
                          
                          <p>3.3 Funds will be released to sellers only after the buyer confirms receipt of the account and verifies access.</p>
                          
                          <p>3.4 If a dispute arises during the transaction, TrustTrade reserves the right to make the final decision regarding the disbursement of escrow funds based on the evidence provided by both parties.</p>
                        </div>
                      </StaggerItem>
                      
                      <AnimateOnScroll variants={fadeInUp} className="space-y-8">
                        <div>
                          <h3 className="text-xl font-bold">4. Fees and Payments</h3>
                          <div className="space-y-4 mt-4">
                            <p>4.1 TrustTrade charges a commission fee on successful transactions. The fee structure is available on our website and may be updated from time to time.</p>
                            
                            <p>4.2 All fees are non-refundable once a transaction is successfully completed.</p>
                            
                            <p>4.3 TrustTrade is not responsible for any taxes that may apply to your transactions. Users are responsible for determining and paying any applicable taxes.</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">5. Account Transfers</h3>
                          <div className="space-y-4 mt-4">
                            <p>5.1 Sellers are responsible for ensuring they have the right to sell the social media account and that the transfer does not violate the terms of service of the respective social media platform.</p>
                            
                            <p>5.2 Buyers and sellers agree to follow TrustTrade's transfer process to ensure a secure transfer of account ownership.</p>
                            
                            <p>5.3 TrustTrade does not guarantee that the transfer of social media accounts will not result in penalties from the respective social media platforms. Users acknowledge that buying and selling social media accounts may be against the terms of service of some platforms.</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">6. Disclaimer of Warranties</h3>
                          <div className="space-y-4 mt-4">
                            <p>6.1 TrustTrade provides its services "as is" and "as available" without warranties of any kind, either express or implied.</p>
                            
                            <p>6.2 TrustTrade does not warrant that the service will be uninterrupted, timely, secure, or error-free.</p>
                            
                            <p>6.3 TrustTrade does not guarantee the accuracy or completeness of any information provided by sellers regarding their social media accounts.</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">7. Limitation of Liability</h3>
                          <div className="space-y-4 mt-4">
                            <p>7.1 In no event shall TrustTrade be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the service.</p>
                            
                            <p>7.2 TrustTrade's liability to you for any cause whatsoever, regardless of the form of the action, will always be limited to the amount you paid to TrustTrade.</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">8. Modifications to Terms</h3>
                          <div className="space-y-4 mt-4">
                            <p>8.1 TrustTrade reserves the right to modify these Terms at any time. We will notify users of significant changes through our website or by email.</p>
                            
                            <p>8.2 Your continued use of TrustTrade after any changes indicates your acceptance of the modified Terms.</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">9. Governing Law</h3>
                          <div className="space-y-4 mt-4">
                            <p>9.1 These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
                            
                            <p>9.2 Any dispute arising from these Terms shall be resolved in the courts located in the United States.</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">10. Contact Information</h3>
                          <div className="space-y-4 mt-4">
                            <p>10.1 If you have any questions about these Terms, please contact us at legal@TrustTrade.com.</p>
                          </div>
                        </div>
                      </AnimateOnScroll>
                    </AnimateStagger>
                  </TabsContent>
                  
                  {/* Privacy Policy */}
                  <TabsContent value="privacy" className="prose dark:prose-invert max-w-none">
                    <AnimateStagger className="space-y-8">
                      <StaggerItem>
                        <h2 className="text-2xl font-bold">Privacy Policy</h2>
                        <p className="text-muted-foreground text-sm mb-6">Last updated: May 1, {currentYear}</p>
                        
                        <p>At TrustTrade, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>
                      </StaggerItem>
                      
                      <StaggerItem>
                        <h3 className="text-xl font-bold">1. Information We Collect</h3>
                        <div className="space-y-4 mt-4">
                          <p><strong>1.1 Personal Information:</strong> We collect information that identifies, relates to, describes, or could reasonably be linked to you, including:</p>
                          <ul className="list-disc pl-6 space-y-2">
                            <li>Contact information (name, email address, phone number)</li>
                            <li>Account credentials</li>
                            <li>Payment information</li>
                            <li>Identity verification documents</li>
                            <li>Social media account information</li>
                          </ul>
                          
                          <p><strong>1.2 Usage Information:</strong> We automatically collect certain information about how you interact with our website, including:</p>
                          <ul className="list-disc pl-6 space-y-2">
                            <li>IP address</li>
                            <li>Browser type</li>
                            <li>Device information</li>
                            <li>Pages viewed</li>
                            <li>Time spent on pages</li>
                            <li>Referring website</li>
                          </ul>
                        </div>
                      </StaggerItem>
                      
                      <StaggerItem>
                        <h3 className="text-xl font-bold">2. How We Use Your Information</h3>
                        <div className="space-y-4 mt-4">
                          <p>We use the information we collect for various purposes, including:</p>
                          <ul className="list-disc pl-6 space-y-2">
                            <li>Providing and maintaining our services</li>
                            <li>Processing transactions and payments</li>
                            <li>Verifying user identity and account ownership</li>
                            <li>Resolving disputes between buyers and sellers</li>
                            <li>Communicating with you about your account, transactions, or customer support</li>
                            <li>Sending marketing communications (with your consent)</li>
                            <li>Improving our website and services</li>
                            <li>Detecting and preventing fraud or abuse</li>
                            <li>Complying with legal obligations</li>
                          </ul>
                        </div>
                      </StaggerItem>
                      
                      <AnimateOnScroll variants={fadeInUp} className="space-y-8">
                        <div>
                          <h3 className="text-xl font-bold">3. How We Share Your Information</h3>
                          <div className="space-y-4 mt-4">
                            <p>We may share your information in the following circumstances:</p>
                            
                            <p><strong>3.1 With Transaction Partners:</strong> We may share necessary information with buyers or sellers to facilitate account transfers and transactions.</p>
                            
                            <p><strong>3.2 With Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, and customer service.</p>
                            
                            <p><strong>3.3 For Legal Purposes:</strong> We may disclose information if required by law, regulation, legal process, or governmental request, or to protect our rights, property, or safety, or the rights, property, or safety of others.</p>
                            
                            <p><strong>3.4 Business Transfers:</strong> If TrustTrade is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">4. Data Security</h3>
                          <div className="space-y-4 mt-4">
                            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, accidental loss, alteration, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">5. Your Rights</h3>
                          <div className="space-y-4 mt-4">
                            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
                            <ul className="list-disc pl-6 space-y-2">
                              <li>Access and receive a copy of your personal information</li>
                              <li>Correct inaccurate or incomplete information</li>
                              <li>Delete your personal information</li>
                              <li>Object to or restrict the processing of your information</li>
                              <li>Data portability</li>
                              <li>Withdraw consent (where processing is based on consent)</li>
                            </ul>
                            
                            <p>To exercise these rights, please contact us using the information provided at the end of this policy.</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">6. Cookies and Similar Technologies</h3>
                          <div className="space-y-4 mt-4">
                            <p>We use cookies and similar tracking technologies to track activity on our website and to collect information about how you use our services. Cookies are small data files that are placed on your device when you visit a website.</p>
                            
                            <p>You can set your browser to refuse all or some browser cookies, or to alert you when cookies are being sent. However, if you disable or refuse cookies, some parts of our website may not function properly.</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">7. Children's Privacy</h3>
                          <div className="space-y-4 mt-4">
                            <p>Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information.</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">8. International Data Transfers</h3>
                          <div className="space-y-4 mt-4">
                            <p>Your information may be transferred to, and maintained on, computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those in your jurisdiction.</p>
                            
                            <p>If you are located outside the United States and choose to provide information to us, please note that we transfer the data to the United States and process it there. Your submission of information represents your agreement to this transfer.</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">9. Changes to This Privacy Policy</h3>
                          <div className="space-y-4 mt-4">
                            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
                            
                            <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold">10. Contact Us</h3>
                          <div className="space-y-4 mt-4">
                            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                            <p>Email: privacy@TrustTrade.com</p>
                            <p>Address: 123 TrustTrade Way, San Francisco, CA 94105, USA</p>
                          </div>
                        </div>
                      </AnimateOnScroll>
                    </AnimateStagger>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </AnimateOnScroll>
            
            <AnimateOnScroll variants={zoomIn} className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                If you have any questions about our Terms or Privacy Policy, please contact us
              </p>
              <Button asChild variant="outline">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </AnimateOnScroll>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 