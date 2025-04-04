import { CheckCircle } from "lucide-react"

export function Steps({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between px-2 sm:px-0 overflow-x-auto">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id
        const isCompleted = currentStep > step.id
        
        return (
          <div key={step.id} className="flex items-center flex-shrink-0">
            {/* Step with connector */}
            <div className="flex flex-col items-center">
              {/* Step circle */}
              <div 
                className={`
                  flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-full 
                  ${isCompleted 
                    ? 'bg-primary text-white' 
                    : isActive 
                      ? 'bg-primary/10 border-2 border-primary text-primary' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                  }
                  transition-all duration-200
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                ) : (
                  <span className="text-xs sm:text-sm font-medium">{step.id}</span>
                )}
              </div>
              
              {/* Step title */}
              <span 
                className={`
                  mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium whitespace-nowrap
                  ${isActive || isCompleted ? 'text-primary' : 'text-gray-500'}
                `}
              >
                {step.title}
              </span>
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div 
                className={`
                  h-0.5 w-4 sm:w-full max-w-12 sm:max-w-24 mx-1 sm:mx-2
                  ${currentStep > index + 1 
                    ? 'bg-primary' 
                    : 'bg-gray-200 dark:bg-gray-700'}
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
} 