"use client"

import { useState } from "react"
import { Button } from "./button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Switch } from "./switch"
import { cn } from "@/app/lib/utils"

export function CookiePolicy() {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Essential cookies can't be disabled
    functional: false,
    analytics: false,
    marketing: false,
  })
  
  const updatePreference = (type) => {
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }
  
  const savePreferences = () => {
    localStorage.setItem("cookie-consent", "custom")
    localStorage.setItem("cookie-preferences", JSON.stringify(cookiePreferences))
    alert("Your cookie preferences have been saved.")
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Cookie Policy</h2>
        <p className="text-muted-foreground mb-4">
          This Cookie Policy explains how TrustTrade uses cookies and similar technologies to recognize you when you 
          visit our website. It explains what these technologies are and why we use them, as well as your rights to 
          control our use of them.
        </p>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-3">What are cookies?</h3>
        <p className="text-muted-foreground mb-4">
          Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
          Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well 
          as to provide reporting information.
        </p>
        <p className="text-muted-foreground mb-4">
          Cookies set by the website owner (in this case, TrustTrade) are called "first-party cookies". Cookies set 
          by parties other than the website owner are called "third-party cookies". Third-party cookies enable 
          third-party features or functionality to be provided on or through the website (e.g., advertising, interactive 
          content, and analytics).
        </p>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-3">Why do we use cookies?</h3>
        <p className="text-muted-foreground mb-4">
          We use first-party and third-party cookies for several reasons. Some cookies are required for technical 
          reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" 
          cookies. Other cookies also enable us to track and target the interests of our users to enhance the 
          experience on our Website. Third parties serve cookies through our Website for advertising, analytics, 
          and other purposes.
        </p>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-3">Types of cookies we use</h3>
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Essential Cookies</CardTitle>
                  <CardDescription>Always active</CardDescription>
                </div>
                <Switch checked disabled />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                These cookies are necessary for the website to function and cannot be switched off in our systems. 
                They are usually only set in response to actions made by you which amount to a request for services, 
                such as setting your privacy preferences, logging in, or filling in forms.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Functional Cookies</CardTitle>
                  <CardDescription>Enhance your experience</CardDescription>
                </div>
                <Switch 
                  checked={cookiePreferences.functional} 
                  onCheckedChange={() => updatePreference('functional')} 
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                These cookies enable the website to provide enhanced functionality and personalization. They may be 
                set by us or by third-party providers whose services we have added to our pages. If you do not allow 
                these cookies, then some or all of these services may not function properly.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Analytics Cookies</CardTitle>
                  <CardDescription>Help us improve our website</CardDescription>
                </div>
                <Switch 
                  checked={cookiePreferences.analytics} 
                  onCheckedChange={() => updatePreference('analytics')} 
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                These cookies allow us to count visits and traffic sources so we can measure and improve the performance 
                of our site. They help us to know which pages are the most and least popular and see how visitors move 
                around the site. All information these cookies collect is aggregated and therefore anonymous.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Marketing Cookies</CardTitle>
                  <CardDescription>Personalized ads and content</CardDescription>
                </div>
                <Switch 
                  checked={cookiePreferences.marketing} 
                  onCheckedChange={() => updatePreference('marketing')} 
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                These cookies may be set through our site by our advertising partners. They may be used by those 
                companies to build a profile of your interests and show you relevant advertisements on other sites. 
                They do not store directly personal information, but are based on uniquely identifying your browser 
                and internet device.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={savePreferences}>
          Save Preferences
        </Button>
      </div>
    </div>
  )
} 