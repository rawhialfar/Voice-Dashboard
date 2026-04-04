import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Close, ArrowBack } from '@mui/icons-material';
import {
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { subscribe, getSubscription, updateSubscription } from '../../api/stripe';
import type { PaymentIntent } from '@stripe/stripe-js'; // Import the PaymentIntent type

// Define proper types
interface Plan {
  name: string;
  color: string;
  price: string;
  minutes: string;
  features: string[];
  icon?: React.ReactElement;
  amount?: number;
  black?: string;
}

interface StripeComponentProps {
  clientSecret: string;
  plan: Plan;
  onSuccess: () => void;
}

interface SubscriptionFormProps {
  open: boolean;
  plan: Plan;
  onSuccess: () => void;
  onClose: () => void;
  onBack: () => void;
}

interface Subscription {
  product?: {
    name?: string;
  };
}

const StripeComponent = ({ plan, onSuccess }: StripeComponentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }
    
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      // Trigger form validation
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setPaymentError(submitError?.message || 'Validation error');
        setPaymentLoading(false);
        return;
      }

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/`,
        },
        redirect: "if_required"
      });
      
      const confirmedPaymentIntent = paymentIntent as unknown as PaymentIntent;

      if (error) {
        setPaymentError(error.message || 'Payment error');
      } else if (paymentIntent && confirmedPaymentIntent.status === "succeeded") {
        try {
          localStorage.setItem('onboardChecked', 'true');

          // Cast paymentIntent to the proper type
          const confirmedPaymentIntent = paymentIntent as PaymentIntent;

          try {
            const sub = await getSubscription() as Subscription | null;
            if (sub && sub?.product && sub?.product.name) {
              await updateSubscription({
                paymentMethod: confirmedPaymentIntent.payment_method as string,
                newSubscriptionPlan: plan.name
              });
            }
          } catch (error) {
            await subscribe({
              paymentMethod: confirmedPaymentIntent.payment_method as string,
              subscriptionPlan: plan.name,
              businessName: localStorage.getItem('businessName') || 'My Organization'
            });
          }
          
          console.log("Subscription created and payment method associated successfully");
          if (onSuccess) onSuccess();
        } catch (apiError: any) {
          console.error("API Error:", apiError);
          setPaymentError(apiError?.response?.data?.error || "Subscription failed.");
        }
      } else {
        setPaymentError("Payment was not successful. Please try again.");
      }
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setPaymentError(err.message || "An unexpected error occurred");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ my: 2 }}>
        <PaymentElement />
      </Box>

      {paymentError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {paymentError}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || paymentLoading}
        sx={{ 
          py: 1.5,
          mt: 2,
          backgroundColor: plan.color,
          '&:hover': {
            backgroundColor: plan.color,
            opacity: 0.9
          }
        }}
      >
        {paymentLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          `Subscribe to ${plan.name}`
        )}
      </Button>
    </form>
  );
};

// Main SubscriptionForm component
const SubscriptionForm = ({ open, plan, onSuccess, onClose, onBack }: SubscriptionFormProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const isExpanded = expandedCards[plan.name] || false;
  const initialFeaturesCount = 4;
  const showReadMore = plan.features.length > initialFeaturesCount;

  const stripePromise = loadStripe('pk_test_51RxYmORtokePTGRRKg43vkjG8bL4fFHcOFKzlY4g0tQNvvDTgerIzKUmjciBDsc749w4xgmtP5L82ho4LNsgRl5J00TRMi3DY2');

  useEffect(() => {
    const fetchClientSecret = async () => {
      if (!open || !plan) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: plan.amount
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching client secret:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientSecret();
  }, [open, plan]);

  if (!open) return null;

  const toggleExpand = (planName: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [planName]: !prev[planName]
    }));
  };

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    localStorage.setItem('onboardChecked', 'true');
    window.location.href = "/"; 
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={onClose}>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <IconButton onClick={onBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">Complete Your Purchase</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2,
              mb: 2, 
              border: `2px solid ${plan.color || '#1976d2'}`,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${plan.color}15, #ffffff)`
            }}
          >
          <Box textAlign="center" mb={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              {plan.icon && React.cloneElement(plan.icon)}
              <Typography variant="h4" sx={{ ml: 1, fontWeight: 600, color: plan.black, fontSize: '1.8rem' }}>
                {plan.name}
              </Typography>
            </Box>
          </Box>

          <Box textAlign="center" mb={1}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: plan.color }}>
              {plan.price}
            </Typography>
            <Typography variant="body2" fontWeight="600" color="text.primary">
              {plan.minutes}
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ flexGrow: 1, mb: 2 }}>
            <List dense>
              {plan.features.slice(0, isExpanded ? plan.features.length : initialFeaturesCount).map((feature: string, index: number) => (
                <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon sx={{ color: plan.color, fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={feature} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>

            {showReadMore && (
              <Box textAlign="center" mt={1}>
                <Button
                  size="small"
                  onClick={() => toggleExpand(plan.name)}
                  endIcon={
                    <ExpandMoreIcon 
                      sx={{ 
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }} 
                    />
                  }
                  sx={{
                    color: plan.color,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: `${plan.color}10`
                    }
                  }}
                >
                  {isExpanded ? 'Show Less' : `+${plan.features.length - initialFeaturesCount} more`}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Setting up payment...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, py: 0.5 }}>
            {error}
          </Alert>
        )}

          {clientSecret && !loading && (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#556cd6',
                  }
                },
              }}
            >
              <StripeComponent clientSecret={clientSecret} onSuccess={handleSuccess} plan={plan} />
            </Elements>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionForm;