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

    console.log('API response status:', response.status);
    console.log('API response headers:', Object.fromEntries(response.headers.entries()));

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      // If not JSON, read as text to see the error
      const text = await response.text();
      console.error('Non-JSON response received:', text);
      throw new Error(`Server error: ${text.substring(0, 200)}`);
    }

    console.log('API response data:', responseData);

    if (!response.ok) {
      throw new Error(responseData.error || responseData.message || `Server error (${response.status})`);
    }

    if (!responseData.sessionId) {
      throw new Error('No session ID returned from server');
    }

    // Return both sessionId and URL for compatibility
    return {
      sessionId: responseData.sessionId,
      url: responseData.url
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Redirect to Stripe Checkout
// Updated to use direct URL redirect instead of deprecated redirectToCheckout method
export const redirectToCheckout = async (checkoutData) => {
  try {
    // checkoutData can be either a URL string or an object with {sessionId, url}
    let checkoutUrl;
    
    if (typeof checkoutData === 'string') {
      // If it's a URL string, use it directly
      checkoutUrl = checkoutData;
    } else if (checkoutData?.url) {
      // If it's an object with a URL, use that
      checkoutUrl = checkoutData.url;
    } else if (checkoutData?.sessionId) {
      // Fallback: if we only have sessionId, construct the URL
      // This shouldn't happen with the new API, but keeping for compatibility
      throw new Error('Checkout URL not provided. Please update your API to return the checkout URL.');
    } else {
      throw new Error('Invalid checkout data provided');
    }

    // Direct redirect to Stripe Checkout URL
    if (typeof window !== 'undefined') {
      window.location.href = checkoutUrl;
    } else {
      throw new Error('Cannot redirect: window object not available');
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

