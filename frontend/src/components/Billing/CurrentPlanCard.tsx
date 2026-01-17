import React from 'react';
import { Edit, Calendar } from 'lucide-react';

interface CurrentPlanCardProps {
    colors: any;
    subscriptionLoading: boolean;
    billingData: any;
    plan: any;
    getStatusBadge: (status: string) => JSX.Element;
    handleChangePlan: () => void;
    handleCancelSubscription: () => void;
}

const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({
    colors,
    subscriptionLoading,
    billingData,
    plan,
    getStatusBadge,
    handleChangePlan,
    handleCancelSubscription
}) => {
    return (
        <div 
            className="p-6 rounded-lg border current-plan-card"
            style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        >
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-semibold">Current Plan</h2>
                {getStatusBadge(billingData.status)}
            </div>
            
            {subscriptionLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.textSecondary }}></div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            {plan?.icon && React.cloneElement(plan?.icon, { sx: { fontSize: 40 } })}
                            <span className="text-xl font-bold"> {billingData.currentPlan}</span>
                        </div>
                        <span className="text-2xl">{plan?.price}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2" style={{ color: colors.textSecondary }}>
                        <Calendar size={16} />
                        <span className="text-sm">
                            Next billing: {billingData.nextBillingDate}
                        </span>
                    </div>

                    <div className="flex flex-row gap-4 mt-4">
                        <button
                            className="mt-4 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-500 transition-colors text-white font-medium flex items-center gap-2 change-plan-button"
                            onClick={handleChangePlan}
                        >
                            <Edit size={16} />
                            Change Plan
                        </button>
                        {billingData.status === 'active' && (
                            <button
                                onClick={handleCancelSubscription}
                                className="mt-4 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-500 transition-colors text-white font-medium cancel-subscription-button"
                            >
                                Cancel Subscription
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CurrentPlanCard;