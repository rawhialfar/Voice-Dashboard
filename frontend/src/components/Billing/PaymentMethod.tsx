import React from 'react';
import { CreditCard, Edit } from 'lucide-react';

interface PaymentMethodProps {
    colors: any;
    billingData: any;
    setShowPaymentModal: (show: boolean) => void;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({
    colors,
    billingData,
    setShowPaymentModal
}) => {
    return (
        <div 
            className="p-6 rounded-lg border flex flex-col justify-between payment-method-card"
            style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        >
            <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
            <div className="flex items-center justify-between gap-2 mb-2" style={{ color: colors.textSecondary }}>
                <div className="flex items-center gap-2">
                    <CreditCard size={20} />
                    <span className="text-md">{billingData.paymentMethod}</span>
                </div>
                <span className="text-md">Expires: {billingData.expiryDate}</span>
            </div>
            {billingData.status === 'active' && (
                <button
                    onClick={() => setShowPaymentModal(true)}
                    className="mt-4 px-4 py-2 w-fit rounded-lg bg-blue-700 hover:bg-blue-500 transition-colors text-white font-medium flex items-center gap-2 update-payment-button"
                >
                    <Edit size={16} />
                    Update Payment Method
                </button>
            )}
        </div>
    );
};

export default PaymentMethod;