import React, { useState, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Shield, Lock, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { updatePaymentMethod } from '../../api/stripe';

// Initialize Stripe with test key
const stripePromise = loadStripe('pk_test_51RxYmORtokePTGRRKg43vkjG8bL4fFHcOFKzlY4g0tQNvvDTgerIzKUmjciBDsc749w4xgmtP5L82ho4LNsgRl5J00TRMi3DY2');

const CheckoutForm = ({ onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { isDarkMode } = useTheme();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) 
      return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError('Card element not found');
        setProcessing(false);
        return;
      }

      // Create PaymentMethod using Stripe Elements
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      await updatePaymentMethod({
        paymentMethod: paymentMethod.id
      });
      console.log('Payment method updated successfully');
      
      setSuccess(true);
      setProcessing(false);
      
      // Call success callback with payment method details
      setTimeout(() => {
        if (onSuccess) onSuccess(paymentMethod);
      }, 1500);
      
    } catch (err) {
      console.error('Error updating payment method:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update payment method. Please try again.');
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
      isDarkMode ? 'bg-black/30' : 'bg-black/20'
    } backdrop-blur-md`}>
      <div className={`relative w-full max-w-lg rounded-xl shadow-2xl transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* Header with close button */}
        <div className={`p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard size={28} className={isDarkMode ? 'text-indigo-400' : 'text-blue-600'} />
              <div>
                <h2 className="text-3xl whitespace-nowrap font-semibold">Update Payment Method</h2>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className={`p-4 border rounded-lg ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-700' 
                : 'border-gray-300 bg-gray-50'
            }`}>
              <CardElement 
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: isDarkMode ? '#F9FAFB' : '#374151',
                      '::placeholder': {
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                      },
                      backgroundColor: 'transparent',
                    },
                  },
                  hidePostalCode: true,
                }}
              />
            </div>
            
            {error && (
              <div className={`p-3 rounded-lg border ${
                isDarkMode 
                  ? 'text-red-300 bg-red-900/20 border-red-700' 
                  : 'text-red-700 bg-red-50 border-red-200'
              }`}>
                {error}
              </div>
            )}
            
            {success && (
              <div className={`p-3 rounded-lg border ${
                isDarkMode 
                  ? 'text-green-300 bg-green-900/20 border-green-700' 
                  : 'text-green-700 bg-green-50 border-green-200'
              }`}>
                Payment method updated successfully!
              </div>
            )}
            
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={handleClose}
                className={`flex-1 px-4 py-3 rounded-lg font-medium border transition-all duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!stripe || processing}
                className={`flex-1 px-6 py-3 rounded-lg font-medium text-lg transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white'
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  'Update Payment'
                )}
              </button>
            </div>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className={`flex items-center gap-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <Shield size={16} />
                <span>PCI Compliant</span>
              </div>
              <div className={`flex items-center gap-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <Lock size={16} />
                <span>Secure Encryption</span>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

// Main Stripe component that can be used as a modal
const StripePaymentModal = ({ isOpen, onClose, onSuccess } : any) => {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm onClose={onClose} onSuccess={onSuccess} />
    </Elements>
  );
};

// Standalone Stripe page component (original functionality)
const Stripe = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <CreditCard size={48} className={`mx-auto mb-4 ${
              isDarkMode ? 'text-indigo-400' : 'text-blue-600'
            }`} />
            <h1 className="text-3xl font-bold">Payment Gateway</h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Secure payment processing
            </p>
          </div>

          <div className={`rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className={`p-4 bg-gradient-to-r ${
              isDarkMode 
                ? 'from-indigo-700 to-purple-700' 
                : 'from-blue-600 to-purple-600'
            }`}>
              <h2 className="text-xl font-semibold text-white text-center">
                Secure Payment
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { StripePaymentModal };
export default Stripe;