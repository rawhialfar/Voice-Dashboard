import React, { useState, useEffect } from 'react';
import { useTheme } from "../contexts/ThemeContext";
import { getUserInformation } from "../api/user";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CreditCard, Mail, FileText, RefreshCw } from 'lucide-react';
import { StripePaymentModal } from '../components/Stripe/StripePaymentMethod';
import { getSubscription, cancelSubscription, getLastFourDigitsOnCard, customerInvoices, getMinutesUsedInPeriod } from '../api/stripe';
import { usePlans } from '../components/Plans';
import { useOnboarding } from '../components/Onboarding/OnboardingManager';
import CurrentPlanCard from '../components/Billing/CurrentPlanCard';
import UsageStatistics from '../components/Billing/UsageStatistics';
import PaymentMethod from '../components/Billing/PaymentMethod';
import BillingHistory from '../components/Billing/BillingHistory';

interface Invoice {
    id: string;
    created: number;
    description?: string;
    number?: string;
    amount_due: number;
    currency?: string;
    status?: string;
    invoice_pdf?: string;
    status_transitions?: {
        paid_at?: number;
    };
}

const stripePromise = loadStripe('pk_test_51RxYmORtokePTGRRKg43vkjG8bL4fFHcOFKzlY4g0tQNvvDTgerIzKUmjciBDsc749w4xgmtP5L82ho4LNsgRl5J00TRMi3DY2');

const Billing: React.FC = () => {
    const { isDarkMode } = useTheme();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscriptionLoading, setSubscriptionLoading] = useState(true);
    const [usageLoading, setUsageLoading] = useState(true);  
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [plan, setPlan] = useState();
    const [invoiceDate, setInvoiceDate] = useState(null);
    const [billingData, setBillingData] = useState<{
        currentPlan: string;
        planPrice: string;
        nextBillingDate: string;
        customerInvoices: Invoice[];
        status: string;
        paymentMethod: string;
        expiryDate: string;
    }>({
        currentPlan: "No Active Plan",
        planPrice: "$0/month",
        nextBillingDate: "N/A",
        customerInvoices: [],
        status: "inactive",
        paymentMethod: "No payment method",
        expiryDate: "N/A",
    });
    const [usageData, setUsageData] = useState({ 
        callMinutes: 0,
        callLimit: 0,
        usagePercent: 0
    });
    const plans = usePlans();
    const [visibleInvoicesCount, setVisibleInvoicesCount] = useState(4);
    
    const { shouldShowOnboarding, startOnboarding, setPageReady } = useOnboarding();

    useEffect(() => {
        setPageReady('billing', true);
        if (shouldShowOnboarding('billing')) {
          startOnboarding('billing');
        }
      }, [setPageReady, shouldShowOnboarding, startOnboarding]);

    const fetchUsageData = async () => {
        setUsageLoading(true);
        try {
            const usageResponse = await getMinutesUsedInPeriod();
            const callMinutes = usageResponse?.totalMinutesUsed || 0;
            const callLimit = usageResponse?.totalMinutesAllowed || 0;
            const usagePercent = callLimit ? (callMinutes / callLimit) * 100 : 0;
            
            setUsageData({
                callMinutes,
                callLimit,
                usagePercent: Math.min(usagePercent, 100) 
            });
            setPageReady('billing', true);
            
        } catch (error) {
            console.error("Error fetching usage data:", error);
            setUsageData({
                callMinutes: 0,
                callLimit: plan?.minLimit || 0,
                usagePercent: 0
            });
        } finally {
            setUsageLoading(false);
        }
    };

    useEffect(() => {
        if (plan) {
            fetchUsageData();
        }
    }, [plan]);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const _invoices = await customerInvoices();
                const invoicesData = _invoices?.invoices?.data || _invoices?.data || _invoices || [];
                
                if (invoicesData.length > 0) {
                    const mostRecentInvoice = invoicesData[0];
                    const invoiceDate = mostRecentInvoice.status_transitions?.paid_at || mostRecentInvoice.created;
                    setInvoiceDate(invoiceDate);
                    
                    setBillingData(prev => ({
                        ...prev,
                        customerInvoices: invoicesData,
                        nextBillingDate: calculateNextBillingDate(invoiceDate)
                    }));
                }
                
                setBillingData(prev => ({
                    ...prev,
                    customerInvoices: invoicesData
                }));
                
            } catch (error) {
                console.error("Error fetching invoices:", error);
            } 
        };
        fetchInvoices();
    }, []);

    useEffect(() => {
        if (invoiceDate && subscription) {
            updateBillingDataFromSubscription(subscription);
        }
    }, [invoiceDate, subscription]);

    useEffect(() => {
        const getLastFour = async () => {
            const cardInfo = await getLastFourDigitsOnCard();
            setBillingData(prev => ({
                ...prev,
                paymentMethod: cardInfo ? `Visa **** ${cardInfo?.lastfour}` : "No payment method",
                expiryDate: cardInfo
                ? `${new Date(cardInfo.expYear, cardInfo.expMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
                : "N/A"
            }));
        };
        getLastFour();
    }, []);

    useEffect(() => {
        const loadUserData = async () => {
            setLoading(true);
            try {
                setUserData(await getUserInformation());
            } catch (error) {
                console.error("Error loading user data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, []);

    useEffect(() => {
        const fetchSubscription = async () => {
            setSubscriptionLoading(true);
            try {
                const sub = await getSubscription();
                setSubscription(sub);
                const currentPlan = plans.find(p => p.name === sub.product?.name);
                setPlan(currentPlan);
                updateBillingDataFromSubscription(sub);
                
                if (currentPlan) {
                    await fetchUsageData();
                }
            } catch (error) {
                console.error("Error fetching subscription:", error);
                setBillingData(prev => ({
                    ...prev,
                    currentPlan: "No Active Plan",
                    status: "inactive"
                }));
            } finally {
                setSubscriptionLoading(false);
            }
        };
        fetchSubscription();
    }, []);

    const updateBillingDataFromSubscription = (sub) => {
        if (sub && sub.product) {
            const product = sub.product;
            setBillingData(prev => ({
                ...prev,
                currentPlan: product.name || "Unknown Plan",
                planPrice: formatPlanPrice(product.default_price),
                status: product.active ? "active" : "inactive",
                nextBillingDate: calculateNextBillingDate(invoiceDate) || "N/A",
            }));
        }
    };

    const formatPlanPrice = (priceId) => {
        if (subscription?.product?.name === "Queen Plan") {
            return "$300/month";
        } else if (subscription?.product?.name === "King Plan") {
            return "$600/month";
        } else if (subscription?.product?.name === "Emperor Plan") {
            return "$2000/month";
        } else if (subscription?.product?.name === "Knight Plan") {
            return "$50/month";
        }
        return "$0/month";
    };

    const calculateNextBillingDate = (invoiceTimestamp) => {
        if (!invoiceTimestamp) return "N/A";
        
        const timestamp = invoiceTimestamp.toString().length === 10 ? 
                        invoiceTimestamp * 1000 : invoiceTimestamp;
        
        const invoiceDate = new Date(timestamp);
        const nextBillingDate = new Date(invoiceDate);
        
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        
        if (nextBillingDate.getDate() !== invoiceDate.getDate()) {
            nextBillingDate.setDate(0); 
        }
        
        return nextBillingDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const handleContactSupport = () => {
        window.open("mailto:Support@genovation.ai", '_blank'); 
    };

    const handleViewDocumentation = () => {
        window.open("https://genovation.ai/#process", '_blank'); 
    };

    const handleCancelSubscription = async () => {
        if (window.confirm('Are you sure you want to cancel your subscription?')) {
            try {
                await cancelSubscription({
                    subscriptionPlan: plan?.name,
                });
                alert('Subscription cancelled successfully');
                window.location.href = "/login";
            } catch (error) {
                console.error('Error cancelling subscription:', error);
                alert('Error cancelling subscription');
            }
        }
    };

    const handleRefreshSubscription = async () => {
        setSubscriptionLoading(true);
        setUsageLoading(true);
        try {
            const sub = await getSubscription();
            setSubscription(sub);
            updateBillingDataFromSubscription(sub);
            await fetchUsageData();
        } catch (error) {
            console.error('Error refreshing subscription:', error);
        } finally {
            setSubscriptionLoading(false);
            setUsageLoading(false);
        }
    };

    const handleChangePlan = async () => {
        window.location.href = "/plan";
    }

    const colors = {
        bg: isDarkMode ? "#1E2939" : "#ffffff",
        text: isDarkMode ? "#ffffff" : "#000000",
        textSecondary: isDarkMode ? "#A0AEC0" : "#666666",
        cardBg: isDarkMode ? "#2A3648" : "#f8f9fa",
        border: isDarkMode ? "#4A5568" : "#e5e5e5",
        button: isDarkMode ? "#0060faff" : "#3B82F6",
    };

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false); 
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: 'bg-green-100 text-green-800', text: 'Active' },
            inactive: { color: 'bg-gray-100 text-gray-800', text: 'Inactive' },
            canceled: { color: 'bg-red-100 text-red-800', text: 'Canceled' },
            past_due: { color: 'bg-yellow-100 text-yellow-800', text: 'Past Due' }
        };
        
        const config = statusConfig[status] || statusConfig.inactive;
        return (
            <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
                {config.text}
            </span>
        );
    };

    return (
        <div 
            className="p-8 w-full h-[calc(100vh)] overflow-y-auto "
            style={{ backgroundColor: colors.bg, color: colors.text }}
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold billing-container">Billing</h1>
                <button 
                    onClick={handleRefreshSubscription}
                    disabled={subscriptionLoading || usageLoading}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors refresh-billing"
                    style={{ 
                        borderColor: colors.border,
                        backgroundColor: colors.cardBg,
                        color: colors.text 
                    }}
                >
                    <RefreshCw size={16} className={subscriptionLoading || usageLoading ? 'animate-spin' : ''} />
                </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 mb-8 ">
                <CurrentPlanCard
                    colors={colors}
                    subscriptionLoading={subscriptionLoading}
                    billingData={billingData}
                    plan={plan}
                    getStatusBadge={getStatusBadge}
                    handleChangePlan={handleChangePlan}
                    handleCancelSubscription={handleCancelSubscription}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <PaymentMethod
                    colors={colors}
                    billingData={billingData}
                    setShowPaymentModal={setShowPaymentModal}
                />
                <UsageStatistics
                    colors={colors}
                    usageLoading={usageLoading}
                    usageData={usageData}
                />
            </div>
            
            <BillingHistory
                colors={colors}
                billingData={billingData}
                visibleInvoicesCount={visibleInvoicesCount}
                setVisibleInvoicesCount={setVisibleInvoicesCount}
                handleDownloadInvoice={(invoiceId) => {
                    const invoice = billingData.customerInvoices.find(inv => inv.id === invoiceId);
                    if (invoice && invoice.invoice_pdf) {
                        window.open(invoice.invoice_pdf, '_blank');
                    } else {
                        alert('Invoice PDF not available.');
                    }
                }}
            />

            {/* Additional Billing Information */}
            <div 
                className="p-6 rounded-lg border mt-6 help-section"
                style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
            >
                <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
                <p className="mb-4" style={{ color: colors.textSecondary }}>
                    If you have any questions about your billing, please contact our support team.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleContactSupport}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2 contact-support-button"
                    >
                        <Mail size={16} />
                        Contact Support
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center gap-2 view-documentation-button"
                        onClick={handleViewDocumentation}
                    >
                        <FileText size={16} />
                        View Documentation
                    </button>
                </div>
            </div>

            {/* Payment Method Modal */}
            {showPaymentModal && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
                     isDarkMode 
                        ? 'bg-black/20' 
                        : 'bg-white/20'
                    } backdrop-blur-lg`}>
                    <div className="relative w-full max-w-lg">
                        <Elements stripe={stripePromise}>
                            <StripePaymentModal 
                                isOpen={showPaymentModal}
                                onClose={() => setShowPaymentModal(false)}
                                onSuccess={handlePaymentSuccess}
                            />
                        </Elements>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Billing;