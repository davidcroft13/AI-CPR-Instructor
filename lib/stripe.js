import { loadStripe } from '@stripe/stripe-js';

// Get Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Initialize Stripe
let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise && STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Create checkout session via API
export const createCheckoutSession = async (paymentData) => {
  try {
    // Get the base URL for API calls
    const apiUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/create-checkout-session`
      : '/api/create-checkout-session';

    console.log('Creating checkout session with URL:', apiUrl);
    console.log('Payment data:', { ...paymentData, amount: paymentData.amount });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const responseData = await response.json();
    console.log('API response status:', response.status);
    console.log('API response data:', responseData);

    if (!response.ok) {
      throw new Error(responseData.error || responseData.message || 'Failed to create checkout session');
    }

    if (!responseData.sessionId) {
      throw new Error('No session ID returned from server');
    }

    return responseData.sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async (sessionId) => {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe not initialized. Please check your Stripe publishable key.');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};

// Payment amounts (in cents)
export const PAYMENT_AMOUNTS = {
  SIGNUP: 9900, // $99.00
  TEAM_MEMBER_SEAT: 9900, // $99.00 per seat
};

