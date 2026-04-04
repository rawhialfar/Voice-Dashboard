// /c:/Users/Rawhi Alfar/Documents/Genovation/Voice-Dashboard/frontend/src/components/OnboardingTooltips.tsx
export type OnboardingStep = {
    id: string
    targetElement: string
    title: string
    content: string
    position: 'top' | 'bottom' | 'left' | 'right'
    offset?: { x: number; y: number }
}

export type OnboardingPage = {
    id: string
    page: string
    steps: OnboardingStep[]
    priority: number
    completed: boolean
    seen: boolean
}

/**
 * Returns the onboarding pages list. Pass Sets for completedItems and seenPages
 * so completed/seen flags are computed dynamically.
 */
export const getOnboardingTooltips = (
    completedItems: Set<string>,
    seenPages: Set<string>
): OnboardingPage[] => [
    {
        id: 'sidebar-onboarding',
        page: 'sidebar',
        steps: [
            {
                id: 'sidebar-intro',
                targetElement: '.sidebar-container',
                title: 'Welcome to Your Dashboard',
                content:
                    'This is your main navigation sidebar. Use it to access different sections of your application.',
                position: 'right',
                offset: { x: -100, y: 0 }
            },
            {
                id: 'analytics-nav',
                targetElement: '[data-onboarding="analytics-nav"]',
                title: 'Analytics Dashboard',
                content:
                    'View your call analytics, metrics, and performance data. Track usage and costs here.',
                position: 'right',
                offset: { x: 20, y: 0 }
            },
            {
                id: 'conversations-nav',
                targetElement: '[data-onboarding="conversations-nav"]',
                title: 'Conversations',
                content: 'Review and analyze your call conversations and transcripts.',
                position: 'right',
                offset: { x: 20, y: 0 }
            },
            {
                id: 'billing-nav',
                targetElement: '[data-onboarding="billing-nav"]',
                title: 'Billing & Usage',
                content: 'Manage your subscription, view invoices, and monitor usage limits.',
                position: 'right',
                offset: { x: 20, y: 0 }
            },
            {   id: 'voice-agents-nav',
                targetElement: '[data-onboarding="voice-agents-nav"]',
                title: 'Voice Agents',
                content: 'Create and manage your AI voice agents and knowledge bases here.',
                position: 'right',
                offset: { x: 20, y: 0 }
            },
            {  id: 'organization-nav',
                targetElement: '[data-onboarding="organization-nav"]',
                title: 'Organization Management',
                content: 'Manage your organization settings, users, and roles from this section.',
                position: 'right',
                offset: { x: 20, y: 0 }
            },
            {
                id: 'settings-nav',
                targetElement: '[data-onboarding="settings-nav"]',
                title: 'Settings',
                content:
                    'Configure your AI agent, voice settings, and integration preferences.',
                position: 'right',
                offset: { x: 20, y: 0 }
            },
            {
                id: 'user-profile',
                targetElement: '.user-profile-section',
                title: 'Your Profile',
                content:
                    'Access your account settings, view the changelog, and logout from here.',
                position: 'right',
                offset: { x: 0, y: -100 }
            }
        ],
        priority: 1,
        completed: completedItems.has('sidebar-onboarding'),
        seen: seenPages.has('sidebar')
    },
    {
        id: 'analytics-onboarding',
        page: 'analytics',
        steps: [
            {
                id: 'welcome',
                targetElement: '.analytics-title',
                title: 'Welcome to Analytics Dashboard',
                content:
                    'This is your analytics dashboard where you can track call performance, costs, and metrics.',
                position: 'bottom',
                offset: { x: -20, y: 10 }
            },
            {
                id: 'time-filter',
                targetElement: '.time-filter',
                title: 'Time Filter',
                content:
                    'Use this dropdown to filter your analytics data by different time periods - day, week, month, or year.',
                position: 'bottom',
                offset: { x: -100, y: 10 }
            },
            {
                id: 'call-direction',
                targetElement: '.call-direction',
                title: 'Call Direction Filter',
                content:
                    'Filter calls by direction - view all calls, only inbound, or only outbound calls.',
                position: 'bottom',
                offset: { x: -100, y: 10 }
            },
            {
                id: 'metrics',
                targetElement: '.metrics-grid',
                title: 'Key Metrics',
                content:
                    'These cards show your most important call metrics with comparisons to previous periods.',
                position: 'bottom',
                offset: { x: -200, y: 10 }
            },
            {
                id: 'charts',
                targetElement: '.charts-grid',
                title: 'Interactive Charts',
                content:
                    'Visualize your call data with interactive charts. Hover over data points to see detailed information.',
                position: 'top',
                offset: { x: -200, y: -10 }
            }
        ],
        priority: 2,
        completed: completedItems.has('analytics-onboarding'),
        seen: seenPages.has('analytics')
    },
    {
        id: 'conversations-onboarding',
        page: 'conversations',
        steps: [
            {
                id: 'conversations-welcome',
                targetElement: '.conversations-container',
                title: 'Conversations Dashboard',
                content:
                    'This is where you can review all your call conversations, transcripts, and analytics.',
                position: 'bottom',
                offset: { x: -20, y: 10 }
            },
            {
                id: 'conversations-search',
                targetElement: '.conversations-search',
                title: 'Search Conversations',
                content:
                    'Quickly find specific calls by phone number, name, or any text from the transcript.',
                position: 'bottom',
                offset: { x: -100, y: 10 }
            },
            {
                id: 'conversations-filters',
                targetElement: '.time-filter-conversations',
                title: 'Time & Sentiment Filters',
                content:
                    'Filter calls by time period and sentiment to focus on specific types of conversations.',
                position: 'bottom',
                offset: { x: -100, y: 10 }
            },
            {
                id: 'conversations-list',
                targetElement: '.calls-list',
                title: 'Call History',
                content:
                    'Browse all your calls here. Each card shows sentiment, direction, and timestamp.',
                position: 'right',
                offset: { x: 20, y: 0 }
            },
            {
                id: 'conversation-view',
                targetElement: '.conversation-view',
                title: 'Conversation Details',
                content:
                    'View full transcripts or AI-generated summaries of selected calls.',
                position: 'left',
                offset: { x: -20, y: 0 }
            },
            {
                id: 'call-details',
                targetElement: '.call-details-sidebar',
                title: 'Call Analytics',
                content:
                    'See detailed call metrics including duration, sentiment analysis, and technical details.',
                position: 'left',
                offset: { x: -20, y: 0 }
            },
        ],
        priority: 3,
        completed: false,
        seen: false
    },
    {
        id: 'billing-onboarding',
        page: 'billing',
        steps: [
            {
                id: 'billing-welcome',
                targetElement: '.billing-container',
                title: 'Billing & Subscription Management',
                content:
                    'Manage your subscription plan, payment methods, and view billing history in one place.',
                position: 'bottom',
                offset: { x: 20, y: 10 }
            },
            {
                id: 'current-plan',
                targetElement: '.current-plan-card',
                title: 'Current Plan',
                content:
                    'View your active subscription plan, next billing date, and manage your subscription settings.',
                position: 'bottom',
                offset: { x: 20, y: 0 }
            },
            {
                id: 'change-plan',
                targetElement: '.change-plan-button',
                title: 'Change Your Plan',
                content:
                    'Upgrade or downgrade your subscription plan based on your usage needs.',
                position: 'right',
                offset: { x: 0, y: -10 }
            },
            {
                id: 'payment-method',
                targetElement: '.payment-method-card',
                title: 'Payment Method',
                content:
                    'View and update your payment method. Your card information is securely stored with Stripe.',
                position: 'right',
                offset: { x: -20, y: 0 }
            },
            {
                id: 'usage-statistics',
                targetElement: '.usage-statistics-card',
                title: 'Usage Statistics',
                content:
                    'Monitor your call minutes usage against your plan limits to avoid overages.',
                position: 'bottom',
                offset: { x: -20, y: 0 }
            },
            {
                id: 'billing-history',
                targetElement: '.billing-history-section',
                title: 'Billing History',
                content:
                    'Access all your past invoices and payment history. Download receipts for your records.',
                position: 'top',
                offset: { x: 0, y: -10 }
            },
            {
                id: 'download-invoices',
                targetElement: '.download-invoice-button',
                title: 'Download Invoices',
                content:
                    'Download PDF copies of your invoices for accounting and record-keeping purposes.',
                position: 'left',
                offset: { x: -20, y: 0 }
            },
            {
                id: 'help-section',
                targetElement: '.help-section',
                title: 'Need Help?',
                content:
                    'Contact our support team or view documentation for any billing-related questions.',
                position: 'top',
                offset: { x: 0, y: -10 }
            }
        ],
        priority: 4,
        completed: false,
        seen: false
    },
    {
        id: 'organization-onboarding',
        page: 'organization',
        steps: [
            {
                id: 'organization-overview',
                targetElement: 'h1.text-2xl.font-bold.capitalize',
                title: 'Organization Management',
                content: 'Welcome to Organization Management! Here you can manage your team members, set permissions, and view organization details.',
                position: 'bottom',
                offset: { x: -20, y: 10 }
            },
            {
                id: 'organization-details',
                targetElement: '.mx-auto.rounded-xl.border.p-6',
                title: 'Organization Details',
                content: 'View your organization name, subscription plan, and member count. This section updates automatically as you add/remove members.',
                position: 'top',
                offset: { x: 0, y: -10 }
            },
            {
                id: 'team-members-list',
                targetElement: '.w-80.flex.flex-col.rounded-xl.border',
                title: 'Team Members List',
                content: 'View all team members in your organization. Click on any member to manage their permissions or remove them.',
                position: 'right',
                offset: { x: 20, y: 0 }
            },
            {
                id: 'add-team-member-button',
                targetElement: '.w-full.flex.items-center.justify-center.gap-2.px-4.py-3.rounded-lg.font-medium',
                title: 'Add Team Member',
                content: 'Click here to add new team members to your organization. You can set their permissions during creation.',
                position: 'right',
                offset: { x: 20, y: 0 }
            },
            {
                id: 'member-card-selection',
                targetElement: '.relative.p-3.cursor-pointer.group:first-child',
                title: 'Select a Team Member',
                content: 'Click on any team member card to view their details and manage permissions in the right panel.',
                position: 'right',
                offset: { x: 20, y: 0 }
            },
        ],
        priority: 4,
        completed: false,
        seen: false
    },
    {
        id: 'voice-agents-onboarding',
        page: 'voice-agents',
        steps: [
            {
                id: 'voice-agents-overview',
                targetElement: '.voice-agents-container',
                title: 'Voice Agents Dashboard',
                content: 'Manage AI voice agents, knowledge bases, and phone numbers all in one place.',
                position: 'bottom',
                offset: { x: -20, y: 10 }
            },
            {
                id: 'agents-management',
                targetElement: '.voice-agents-card',
                title: 'Agents Management',
                content: 'View, create, configure, and delete your voice agents. Click on any agent to edit its settings or assign phone numbers.',
                position: 'right',
                offset: { x: 20, y: 0 }
            },
            {
                id: 'knowledge-bases-overview',
                targetElement: '.knowledge-bases-card',
                title: 'Knowledge Bases',
                content: 'Create and manage information repositories for your agents. Add text, files, or URLs as sources.',
                position: 'right',
                offset: { x: 20, y: 0 }
            },
            {
                id: 'phone-numbers-management',
                targetElement: '.phone-numbers-card',
                title: 'Phone Numbers',
                content: 'Manage phone numbers and assign them to your agents for inbound/outbound calling.',
                position: 'right',
                offset: { x: 20, y: 0 }
            },
            {
                id: 'details-panel',
                targetElement: '.details-card',
                title: 'DetailsManagement',
                content: 'When a phone number/agent/knowledge base Perform any action, the details panel will be updated.',
                position: 'right',
                offset: { x: -20, y: 0 }
            },
        ],
        priority: 3,
        completed: false,
        seen: false
    }
]

export default getOnboardingTooltips