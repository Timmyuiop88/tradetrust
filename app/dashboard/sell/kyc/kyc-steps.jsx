import { Shield, AlertCircle, ChevronRight, CheckCircle, Upload, MapPin, Camera } from "lucide-react"
import { Button } from "@/app/components/button"
import { useRouter } from "next/navigation"

const STEP_ICONS = {
  identity: <Upload className="h-5 w-5" />,
  address: <MapPin className="h-5 w-5" />,
  face: <Camera className="h-5 w-5" />
}

export function KycSteps({ steps, onStartStep }) {
  const router = useRouter()

  const handleStartStep = (stepId) => {
    switch (stepId) {
      case 1:
        router.push('/dashboard/sell/kyc/identity-verification')
        break
      case 2:
        router.push('/dashboard/sell/kyc/address-verification')
        break
      case 3:
        router.push('/dashboard/sell/kyc/face-verification')
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-6">
      {steps.map((step) => (
        <div 
          key={step.id}
          className="flex items-center justify-between p-4 rounded-lg border"
        >
          <div className="flex items-center space-x-4">
            {step.status === "completed" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <div className={`${step.status === "pending" ? "text-muted-foreground" : "text-primary"}`}>
                {STEP_ICONS[step.type]}
              </div>
            )}
            <div>
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
          <Button
            variant={step.status === "completed" ? "outline" : "default"}
            size="sm"
            onClick={() => handleStartStep(step.id)}
            disabled={step.status === "locked"}
          >
            {step.status === "completed" ? "View" : "Start"} 
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
} 