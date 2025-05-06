import { Shield, AlertCircle, ChevronRight, CheckCircle, Upload, MapPin, Camera, Clock } from "lucide-react"
import { Button } from "@/app/components/button"
import { useRouter } from "next/navigation"

const STEP_ICONS = {
  identity: <Upload className="h-4 w-4 sm:h-5 sm:w-5" />,
  address: <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />,
  face: <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
}

const STATUS_STYLES = {
  pending: "text-muted-foreground",
  pending_review: "text-yellow-500",
  completed: "text-green-500",
  locked: "text-gray-400"
}

export function KycSteps({ steps = [], onStartStep }) {
  const router = useRouter()

  // Early return with a message if steps is undefined or empty
  if (!steps || steps.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-muted/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          <p className="text-sm sm:text-base">Verification steps are being loaded...</p>
        </div>
      </div>
    )
  }

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
  
  // Determine if a step is disabled for interaction
  const isStepDisabled = (step) => {
    return ["locked", "pending_review", "completed"].includes(step.status);
  }

  // Get appropriate button for each step status
  const getStepButton = (step) => {
    switch (step.status) {
      case "pending_review":
        return (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-yellow-500 text-xs sm:text-sm px-2 sm:px-3 min-w-[110px] sm:min-w-[130px] whitespace-nowrap"
          >
            Pending Review
            <Clock className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )
      case "completed":
        return (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-green-500 text-xs sm:text-sm px-2 sm:px-3"
          >
            Completed
            <CheckCircle className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )
      default:
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleStartStep(step.id, step.status)}
            disabled={isStepDisabled(step)}
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            {step.status === "locked" ? "Locked" : "Start"}
            <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )
    }
  }

  // Get step status description
  const getStepDescription = (step) => {
    if (step.status === "pending_review") {
      return "Pending review by our team";
    } else {
      return step.description;
    }
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {steps.map((step) => (
        <div 
          key={step.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border gap-3 sm:gap-0"
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className={`${STATUS_STYLES[step.status]} flex-shrink-0`}>
              {step.status === "pending_review" ? (
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : step.status === "completed" ? (
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                STEP_ICONS[step.type]
              )}
            </div>
            <div>
              <h3 className="font-medium text-sm sm:text-base">{step.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {getStepDescription(step)}
              </p>
            </div>
          </div>
          <div className="self-end sm:self-auto">
            {getStepButton(step)}
          </div>
        </div>
      ))}
    </div>
  )
} 