import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  ElementsConsumer,
} from '@stripe/react-stripe-js';

// Make sure to use your actual publishable key
const stripePromise = loadStripe('pk_test_51RxYmORtokePTGRRKg43vkjG8bL4fFHcOFKzlY4g0tQNvvDTgerIzKUmjciBDsc749w4xgmtP5L82ho4LNsgRl5J00TRMi3DY2');

class CheckoutForm extends React.Component {
  handleSubmit = async (event) => {
    event.preventDefault();
    const { stripe, elements } = this.props;

    if (elements == null || stripe == null) {
      console.error('Stripe or Elements not loaded');
      return;
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      console.error('Form validation error:', submitError);
      return;
    }

    try {
      // Create the PaymentIntent and obtain clientSecret from your backend
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1099, // $10.99 in cents
          currency: 'usd'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create PaymentIntent');
      }

      const { client_secret: clientSecret } = await res.json();
      
      // Confirm the payment with the clientSecret
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        console.error('Payment confirmation error:', error);
      } else {
        console.log('Payment successful - redirecting');
      }
    } catch (error) {
      console.error('Error during payment process:', error);
    }
  };

  render() {
    const { stripe } = this.props;
    return (
      <form onSubmit={this.handleSubmit} style={{ maxWidth: '400px', margin: '20px' }}>
        <h3>Test Stripe Integration</h3>
        <div style={{ marginBottom: '20px' }}>
          <PaymentElement />
        </div>
        <button 
          type="submit" 
          disabled={!stripe}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: stripe ? '#5469d4' : '#cccccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: stripe ? 'pointer' : 'not-allowed'
          }}
        >
          Pay $10.99
        </button>
      </form>
    );
  }
}

const InjectedCheckoutForm = () => (
  <ElementsConsumer>
    {({ stripe, elements }) => (
      <CheckoutForm stripe={stripe} elements={elements} />
    )}
  </ElementsConsumer>
);

// Test component wrapper
const StripeComponent = () => {
  const [clientSecret, setClientSecret] = React.useState(null);

  React.useEffect(() => {
    // Fetch client secret when component mounts
    const fetchClientSecret = async () => {
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 1099,
            currency: 'usd'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setClientSecret(data.clientSecret);
        } else {
          console.error('Failed to fetch client secret');
        }
      } catch (error) {
        console.error('Error fetching client secret:', error);
      }
    };

    fetchClientSecret();
  }, []);

  // Options must include clientSecret for Payment Element to work
  const options = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#5469d4',
      }
    },
  } : null;

  if (!clientSecret) {
    return <div>Loading payment form...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Stripe Integration Test</h2>
      <p>Use test card: 4242 4242 4242 4242</p>
      
      <Elements stripe={stripePromise} options={options}>
        <InjectedCheckoutForm />
      </Elements>
    </div>
  );
};

export default StripeComponent;