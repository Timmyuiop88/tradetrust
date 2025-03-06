import { Shield, AlertCircle, ChevronRight, CheckCircle, Upload, MapPin, Camera, Clock } from "lucide-react"
import { Button } from "@/app/components/button"
import { useRouter } from "next/navigation"

const STEP_ICONS = {
  identity: <Upload className="h-5 w-5" />,
  address: <MapPin className="h-5 w-5" />,
  face: <Camera className="h-5 w-5" />
}

const STATUS_STYLES = {
  pending: "text-muted-foreground",
  pending_review: "text-yellow-500",
  completed: "text-green-500",
  locked: "text-gray-400"
}

export function KycSteps({ steps, onStartStep }) {
  const router = useRouter()

  const handleStartStep = (stepId, status) => {
    // Don't allow navigation if step is locked or pending review
    if (status === "locked" || status === "pending_review") {
      return
    }
    
    switch (stepId) {
      case 1:
        router.push('/dashboard/sell/kyc/1')
        break
      case 2:
        router.push('/dashboard/sell/kyc/2')
        break
      case 3:
        router.push('/dashboard/sell/kyc/3')
        break
      default:
        break
    }
  }

  const getStepButton = (step) => {
    switch (step.status) {
      case "pending_review":
        return (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-yellow-500"
          >
            Pending Review
            <Clock className="ml-2 h-4 w-4" />
          </Button>
        )
      case "completed":
        return (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-green-500"
          >
            Completed
            <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        )
      default:
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleStartStep(step.id, step.status)}
            disabled={step.status === "locked"}
          >
            {step.status === "locked" ? "Locked" : "Start"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )
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
            <div className={STATUS_STYLES[step.status]}>
              {step.status === "pending_review" ? (
                <Clock className="h-5 w-5" />
              ) : step.status === "completed" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                STEP_ICONS[step.type]
              )}
            </div>
            <div>
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-muted-foreground">
                {step.status === "pending_review" 
                  ? "Pending review by our team" 
                  : step.description}
              </p>
            </div>
          </div>
          {getStepButton(step)}
        </div>
      ))}
    </div>
  )
} 