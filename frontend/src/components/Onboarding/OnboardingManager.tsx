/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import OnboardingWizard from './CombinedOnboardingWizard';
import getOnboardingTooltips from './OnboardingTooltips';

export interface OnboardingStep {
  id: string;
  targetElement: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: { x: number; y: number };
}

export interface OnboardingQueueItem {
  id: string;
  page: string;
  steps: OnboardingStep[];
  priority: number;
  completed: boolean;
  seen: boolean;
}

interface OnboardingContextType {
  isOnboardingActive: boolean;
  currentQueueItem: OnboardingQueueItem | null;
  currentStep: number;
  showOnboarding: boolean;
  startOnboarding: (page?: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeCurrentQueueItem: () => void;
  closeOnboarding: () => void;
  addToQueue: (item: Omit<OnboardingQueueItem, 'completed' | 'seen'>) => void;
  markPageAsSeen: (page: string) => void;
  shouldShowOnboarding: (page: string) => boolean;
  resetOnboarding: () => void;
  isPageReadyForOnboarding: (page: string) => boolean;
  setPageReady: (page: string, isReady: boolean) => void;
  setIsFirstTimeUser: (value: boolean) => void;
  isFirstTimeUser: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

// localStorage keys
const ONBOARDING_KEYS = {
  FIRST_TIME_USER: 'onboarding_first_time_user',
  SEEN_PAGES: 'onboarding_seen_pages',
  COMPLETED_ITEMS: 'onboarding_completed_items',
  SIDEBAR_COMPLETED: 'onboarding_sidebar_completed'
} as const;

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const [onboardingQueue, setOnboardingQueue] = useState<OnboardingQueueItem[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(-1);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>(''); 
  const [pageReadyStates, setPageReadyStates] = useState<Record<string, boolean>>({});

  const [sidebarCompleted, setSidebarCompleted] = useState<boolean>(() => {
    return localStorage.getItem(ONBOARDING_KEYS.SIDEBAR_COMPLETED) === 'true';
  });

  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(() => {
    const stored = localStorage.getItem(ONBOARDING_KEYS.FIRST_TIME_USER);
    return stored === null ? true : stored === 'true';
  });

  const location = useLocation();

  // Get current page 
  useEffect(() => {
    const currentPath = location.pathname;
    let page = '';

    if (currentPath === '/') page = 'analytics';
    else if (currentPath === '/conversations') page = 'conversations';
    else if (currentPath === '/billing') page = 'billing';
    else if (currentPath === '/settings') page = 'settings';

    setCurrentPage(page);
  }, [location.pathname]);

  const getSeenPages = (): Set<string> => {
    try {
      const stored = localStorage.getItem(ONBOARDING_KEYS.SEEN_PAGES);
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  };

  const setSeenPages = (pages: Set<string>) => {
    try {
      localStorage.setItem(ONBOARDING_KEYS.SEEN_PAGES, JSON.stringify([...pages]));
    } catch (error) {
      console.error('Failed to save seen pages to localStorage:', error);
    }
  };

  const getCompletedItems = (): Set<string> => {
    try {
      const stored = localStorage.getItem(ONBOARDING_KEYS.COMPLETED_ITEMS);
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  };

  const setCompletedItems = (items: Set<string>) => {
    try {
      localStorage.setItem(ONBOARDING_KEYS.COMPLETED_ITEMS, JSON.stringify([...items]));
    } catch (error) {
      console.error('Failed to save completed items to localStorage:', error);
    }
  };

  useEffect(() => {
    const initializeQueue = () => {
      if (!isFirstTimeUser) {
        setOnboardingQueue([]);
        return;
      }

      const seenPages = getSeenPages();
      const completedItems = getCompletedItems();

      const defaultQueue: OnboardingQueueItem[] = getOnboardingTooltips(completedItems, seenPages);
      setOnboardingQueue(defaultQueue);
    };

    initializeQueue();
  }, [isFirstTimeUser]);

  // SIDEBAR FIRST - Only auto-start sidebar for first-time users
  useEffect(() => {
    if (!isFirstTimeUser) {
      return;
    }

    if (onboardingQueue.length > 0 && currentQueueIndex === -1 && !sidebarCompleted) {
      const sidebarItemIndex = onboardingQueue.findIndex(item => 
        item.page === 'sidebar' && !item.completed && !item.seen
      );
      
      if (sidebarItemIndex !== -1) {
        setCurrentQueueIndex(sidebarItemIndex);
        setShowOnboarding(true);
        
        const updatedQueue = [...onboardingQueue];
        updatedQueue[sidebarItemIndex] = {
          ...updatedQueue[sidebarItemIndex],
          seen: true
        };
        setOnboardingQueue(updatedQueue);
        
        const seenPages = getSeenPages();
        seenPages.add('sidebar');
        setSeenPages(seenPages);
      }
    }
  }, [onboardingQueue, currentQueueIndex, sidebarCompleted, isFirstTimeUser]);

  const currentQueueItem = currentQueueIndex >= 0 ? onboardingQueue[currentQueueIndex] : null;

  const startOnboarding = useCallback((page?: string) => {
    if (!isFirstTimeUser) {
      return;
    }

    const targetPage = page || currentPage;
    if (!targetPage) return;

    if (!isPageReadyForOnboarding(targetPage)) {
      return;
    }

    const hasOnboardingForPage = onboardingQueue.some(item => item.page === targetPage);
    if (!hasOnboardingForPage) {
      return;
    }

    if (shouldShowOnboarding(targetPage)) {
      const pageItemIndex = onboardingQueue.findIndex(item => 
        item.page === targetPage && !item.seen && !item.completed
      );
      
      if (pageItemIndex !== -1) {
        setCurrentQueueIndex(pageItemIndex);
        setCurrentStep(0);
        setShowOnboarding(true);
        
        const updatedQueue = [...onboardingQueue];
        updatedQueue[pageItemIndex] = {
          ...updatedQueue[pageItemIndex],
          seen: true
        };
        setOnboardingQueue(updatedQueue);
        
        const seenPages = getSeenPages();
        seenPages.add(targetPage);
        setSeenPages(seenPages);
        return;
      }
    }

    if (!page && !sidebarCompleted && isFirstTimeUser) {
      const sidebarItemIndex = onboardingQueue.findIndex(item => item.page === 'sidebar' && !item.completed);
      if (sidebarItemIndex !== -1) {
        setCurrentQueueIndex(sidebarItemIndex);
        setCurrentStep(0);
        setShowOnboarding(true);
        
        const updatedQueue = [...onboardingQueue];
        updatedQueue[sidebarItemIndex] = {
          ...updatedQueue[sidebarItemIndex],
          seen: true
        };
        setOnboardingQueue(updatedQueue);
        
        const seenPages = getSeenPages();
        seenPages.add('sidebar');
        setSeenPages(seenPages);
      }
    }
  }, [isFirstTimeUser, currentPage, onboardingQueue, sidebarCompleted]);

  const nextStep = useCallback(() => {
    if (!currentQueueItem) return;

    if (currentStep < currentQueueItem.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeCurrentQueueItem();
    }
  }, [currentQueueItem, currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const completeCurrentQueueItem = useCallback(() => {
    if (currentQueueIndex === -1 || !currentQueueItem) return;

    const updatedQueue = [...onboardingQueue];
    updatedQueue[currentQueueIndex] = {
      ...currentQueueItem,
      completed: true,
      seen: true
    };

    setOnboardingQueue(updatedQueue);

    const completedItems = getCompletedItems();
    completedItems.add(currentQueueItem.id);
    setCompletedItems(completedItems);

    const seenPages = getSeenPages();
    seenPages.add(currentQueueItem.page);
    setSeenPages(seenPages);

    if (currentQueueItem.page === 'sidebar') {
      setSidebarCompleted(true);
      localStorage.setItem(ONBOARDING_KEYS.SIDEBAR_COMPLETED, 'true');
    }

    setShowOnboarding(false);
    setCurrentQueueIndex(-1);
    setCurrentStep(0);
  }, [currentQueueIndex, currentQueueItem, onboardingQueue]);

  const closeOnboarding = useCallback(() => {
    if (currentQueueItem) {
      const updatedQueue = [...onboardingQueue];
      const currentIndex = onboardingQueue.findIndex(item => item.id === currentQueueItem.id);
      if (currentIndex !== -1) {
        updatedQueue[currentIndex] = {
          ...currentQueueItem,
          seen: true
        };
        setOnboardingQueue(updatedQueue);

        const seenPages = getSeenPages();
        seenPages.add(currentQueueItem.page);
        setSeenPages(seenPages);

        if (currentQueueItem.page === 'sidebar') {
          setSidebarCompleted(true);
          localStorage.setItem(ONBOARDING_KEYS.SIDEBAR_COMPLETED, 'true');
        }
      }
    }
    setShowOnboarding(false);
    setCurrentQueueIndex(-1);
    setCurrentStep(0);
  }, [currentQueueItem, onboardingQueue]);

  const addToQueue = useCallback((item: Omit<OnboardingQueueItem, 'completed' | 'seen'>) => {
    const newItem: OnboardingQueueItem = { ...item, completed: false, seen: false };
    setOnboardingQueue(prev => {
      const updated = [...prev, newItem].sort((a, b) => a.priority - b.priority);
      return updated;
    });
  }, []);

  const markPageAsSeen = useCallback((page: string) => {
    const seenPages = getSeenPages();
    seenPages.add(page);
    setSeenPages(seenPages);
    
    setOnboardingQueue(prev => 
      prev.map(item => 
        item.page === page ? { ...item, seen: true } : item
      )
    );
  }, []);

  const shouldShowOnboarding = useCallback((page: string): boolean => {
    if (!isFirstTimeUser) {
      return false;
    }

    if (!sidebarCompleted && page !== 'sidebar') {
      return false;
    }

    const hasUnseenOnboarding = onboardingQueue.some(
      item => item.page === page && !item.seen && !item.completed
    );
    
    return hasUnseenOnboarding;
  }, [isFirstTimeUser, sidebarCompleted, onboardingQueue]);

  const setPageReady = useCallback((page: string, isReady: boolean) => {
    setPageReadyStates(prev => ({
      ...prev,
      [page]: isReady
    }));
  }, []);

  const isPageReadyForOnboarding = useCallback((page: string): boolean => {
    return pageReadyStates[page] === true;
  }, [pageReadyStates]);

  const resetOnboarding = useCallback(() => {
    const resetQueue = onboardingQueue.map(item => ({
      ...item,
      completed: false,
      seen: false
    }));
    setOnboardingQueue(resetQueue);
    setSidebarCompleted(false);
    setCurrentQueueIndex(-1);
    setCurrentStep(0);
    setShowOnboarding(false);
    setPageReadyStates({});
    
    setSeenPages(new Set());
    setCompletedItems(new Set());
    
    setTimeout(() => {
      const sidebarIndex = resetQueue.findIndex(item => item.page === 'sidebar');
      if (sidebarIndex !== -1) {
        setCurrentQueueIndex(sidebarIndex);
        setCurrentStep(0);
        setShowOnboarding(true);
        
        const updatedQueue = [...resetQueue];
        updatedQueue[sidebarIndex] = {
          ...updatedQueue[sidebarIndex],
          seen: true
        };
        setOnboardingQueue(updatedQueue);
        
        const seenPages = new Set();
        seenPages.add('sidebar');
        setSeenPages(seenPages);
      }
    }, 500);
  }, [onboardingQueue]);

  const value: OnboardingContextType = useMemo(() => ({
    isOnboardingActive: showOnboarding,
    currentQueueItem,
    currentStep,
    showOnboarding,
    startOnboarding,
    nextStep,
    previousStep,
    completeCurrentQueueItem,
    closeOnboarding,
    addToQueue,
    markPageAsSeen,
    shouldShowOnboarding,
    resetOnboarding,
    isPageReadyForOnboarding,
    setPageReady,
    setIsFirstTimeUser,
    isFirstTimeUser,
  }), [
    showOnboarding,
    currentQueueItem,
    currentStep,
    startOnboarding,
    nextStep,
    previousStep,
    completeCurrentQueueItem,
    closeOnboarding,
    addToQueue,
    markPageAsSeen,
    shouldShowOnboarding,
    resetOnboarding,
    isPageReadyForOnboarding,
    setPageReady,
    setIsFirstTimeUser,
    isFirstTimeUser,
  ]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {showOnboarding && currentQueueItem && (
        <OnboardingWizard
          steps={currentQueueItem.steps}
          currentStep={currentStep}
          onNext={nextStep}
          onPrevious={previousStep}
          onComplete={completeCurrentQueueItem}
          onClose={closeOnboarding}
        />
      )}
    </OnboardingContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { ONBOARDING_KEYS };