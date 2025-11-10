// API endpoint for creating Stripe Checkout sessions
// This should be deployed as a serverless function (Vercel, Netlify, Supabase Edge Function, etc.)
// 
// Required environment variables:
// - STRIPE_SECRET_KEY: Your Stripe secret key
// - SUPABASE_URL: Your Supabase project URL
// - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Initialize Stripe only if key exists
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}

// Initialize Supabase only if credentials exist
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
  }
}

module.exports = async function handler(req, res) {
  // Ensure we always return JSON, even on errors
  const sendError = (status, message, details = null) => {
    res.status(status).json({ 
      error: message,
      ...(details && { details })
    });
  };

  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check for required environment variables
    if (!stripe) {
      console.error('STRIPE_SECRET_KEY is not set or invalid');
      return sendError(500, 'Server configuration error: Stripe key missing or invalid');
    }

    if (!supabase) {
      console.error('Supabase credentials not set or invalid');
      return sendError(500, 'Server configuration error: Supabase credentials missing or invalid');
    }

    const { paymentType, amount, userEmail, userName, teamId, successUrl, cancelUrl } = req.body;

    console.log('Received payment request:', { paymentType, amount, userEmail, userName, teamId });

    if (!paymentType || !amount || !userEmail || !userName) {
      return sendError(400, 'Missing required fields', {
        received: { paymentType, amount, userEmail, userName }
      });
    }

    // Create Stripe Checkout Session
    console.log('Creating Stripe checkout session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: paymentType === 'signup' 
                ? 'CPR AI Trainer - Individual Signup' 
                : 'CPR AI Trainer - Team Member Seat',
              description: paymentType === 'signup'
                ? 'Full access to CPR training platform'
                : 'Team member seat access',
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${process.env.BASE_URL || 'http://localhost:19006'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.BASE_URL || 'http://localhost:19006'}/payment-cancel`,
      customer_email: userEmail,
      metadata: {
        paymentType,
        userName,
        teamId: teamId || '',
      },
    });

    console.log('Stripe session created successfully:', session.id);
    console.log('Checkout URL:', session.url);

    // Create pending payment record in database
    // Note: This requires the user to exist first, so for signup flow,
    // we'll create the payment record after account creation
    // For team member payments, the user should already exist

    return res.status(200).json({ 
      sessionId: session.id,
      url: session.url // Return the checkout URL for direct redirect
    });
  } catch (error) {
    console.error('Error in handler:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Ensure we always return JSON
    return sendError(500, error.message || 'Failed to create checkout session', {
      type: error.name || 'UnknownError',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
}

