import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { OnboardingStep } from './OnboardingManager';

interface OnboardingWizardProps {
  steps: OnboardingStep[];
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  onClose: () => void;
}

const OnboardingWizard = ({
  steps,
  currentStep,
  onNext,
  onPrevious,
  onComplete,
  onClose
}: OnboardingWizardProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const calculatedRef = useRef(false);
  const scrollAttemptsRef = useRef(0);

  const isBillingHistoryStep = steps[currentStep]?.targetElement.includes('billing-history');
  const isHelpStep = steps[currentStep]?.targetElement.includes('help-section');
  const isPhoneNumbersStep = steps[currentStep]?.targetElement.includes('phonenumber-details-panel');
  const isAddTeamMember = steps[currentStep]?.targetElement.includes('add-team-member-button');

  useEffect(() => {
    if (currentStep >= steps.length) return;

    const calculatePosition = () => {
      const targetElement = document.querySelector(steps[currentStep].targetElement);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
        
        const stepConfig = steps[currentStep];
        const offset = stepConfig.offset || { x: 0, y: 0 };
        
        let top = 0;
        let left = 0;

        switch (stepConfig.position) {
          case 'top':
            top = rect.top + window.scrollY - 10 + offset.y;
            left = rect.left + window.scrollX + (rect.width / 2) + offset.x;
            break;
          case 'bottom':
            top = rect.bottom + window.scrollY + 10 + offset.y;
            left = rect.left + window.scrollX + (rect.width / 2) + offset.x;
            break;
          case 'left':
            top = rect.top + window.scrollY + (rect.height / 2) + offset.y;
            left = rect.left + window.scrollX - 10 + offset.x;
            break;
          case 'right':
            top = rect.top + window.scrollY + (rect.height / 2) + offset.y;
            left = rect.right + window.scrollX + 10 + offset.x;
            break;
          default:
            top = rect.bottom + window.scrollY + 10 + offset.y;
            left = rect.left + window.scrollX + offset.x;
        }

        setPosition({ top, left });
        calculatedRef.current = true;

        // Function to scroll to element
        const scrollToElement = () => {
          const elementRect = targetElement.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          // Check if element is not in viewport (with some padding)
          const isInView = elementRect.top >= 100 && elementRect.bottom <= viewportHeight - 100;
          
          if (!isInView) {
            targetElement.scrollIntoView({ 
              behavior: 'smooth',
              block: 'center'
            });
            
            // Update position after scroll
            setTimeout(() => {
              const newRect = targetElement.getBoundingClientRect();
              setTargetRect(newRect);
              
              let newTop = 0;
              let newLeft = 0;
              
              switch (stepConfig.position) {
                case 'top':
                  newTop = newRect.top + window.scrollY - 10 + offset.y;
                  newLeft = newRect.left + window.scrollX + (newRect.width / 2) + offset.x;
                  break;
                case 'bottom':
                  newTop = newRect.bottom + window.scrollY + 10 + offset.y;
                  newLeft = newRect.left + window.scrollX + (newRect.width / 2) + offset.x;
                  break;
                case 'left':
                  newTop = newRect.top + window.scrollY + (newRect.height / 2) + offset.y;
                  newLeft = newRect.left + window.scrollX - 10 + offset.x;
                  break;
                case 'right':
                  newTop = newRect.top + window.scrollY + (newRect.height / 2) + offset.y;
                  newLeft = newRect.right + window.scrollX + 10 + offset.x;
                  break;
                default:
                  newTop = newRect.bottom + window.scrollY + 10 + offset.y;
                  newLeft = newRect.left + window.scrollX + offset.x;
              }
              
              setPosition({ top: newTop, left: newLeft });
            }, 500);
          }
        };

        // Apply scrolling logic for both billing history and phone numbers
        if (isBillingHistoryStep || isPhoneNumbersStep || isHelpStep || isAddTeamMember) {
          scrollAttemptsRef.current = 0;
          const tryScroll = () => {
            scrollAttemptsRef.current += 1;
            if (scrollAttemptsRef.current <= 3) {
              scrollToElement();
              if (scrollAttemptsRef.current < 3) {
                setTimeout(tryScroll, 200 * scrollAttemptsRef.current);
              }
            }
          };
          
          setTimeout(tryScroll, 100);
        }
      }
    };

    setTimeout(calculatePosition, 100);
    
    const handleResize = () => {
      calculatedRef.current = false;
      calculatePosition();
    };

    const handleScroll = () => {
      setIsScrolling(true);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      calculatedRef.current = false;
      scrollAttemptsRef.current = 0;
    };
  }, [currentStep, steps, isBillingHistoryStep, isPhoneNumbersStep, isHelpStep, isAddTeamMember]);

  if (currentStep >= steps.length) return null;

  const currentStepData = steps[currentStep];

  return (
    <>
      <div 
        className="fixed inset-0  bg-opacity-30 z-40"
        onClick={onClose}
        style={{
          pointerEvents: 'auto',
        }}
      />
      
      {targetRect && (
        <div className="fixed inset-0 z-41 pointer-events-none">
          <div 
            className="absolute  bg-opacity-30"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: targetRect.top + window.scrollY,
            }}
          />
          <div 
            className="absolute bg-opacity-30"
            style={{
              top: targetRect.bottom + window.scrollY,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <div 
            className="absolute bg-opacity-30"
            style={{
              top: targetRect.top + window.scrollY,
              left: 0,
              width: targetRect.left + window.scrollX,
              height: targetRect.height,
            }}
          />
          <div 
            className="absolute bg-opacity-30"
            style={{
              top: targetRect.top + window.scrollY,
              left: targetRect.right + window.scrollX,
              right: 0,
              height: targetRect.height,
            }}
          />
        </div>
      )}

      {targetRect && (
        <div
          className="fixed z-45 border-3 border-white rounded-lg shadow-2xl pointer-events-none bg-transparent"
          style={{
            top: targetRect.top + window.scrollY - 4,
            left: targetRect.left + window.scrollX - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            border: '3px solid white',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5)',
            animation: (isBillingHistoryStep || isPhoneNumbersStep || isHelpStep || isAddTeamMember) ? 'pulse 2s infinite' : 'none',
          }}
        />
      )}

      <div
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 max-w-sm border-2 border-gray-300 dark:border-gray-600"
        style={{
          top: Math.max(20, position.top), 
          left: Math.max(20, Math.min(position.left, window.innerWidth - 320)), 
          transform: 'translateX(-50%)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
          {currentStepData.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
          {currentStepData.content}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </span>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={onPrevious}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Previous
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={onNext}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200 font-medium"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5); }
          50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 255, 255, 0.8); }
          100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5); }
        }
      `}</style>
    </>
  );
};

export default OnboardingWizard;