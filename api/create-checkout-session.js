// API endpoint for creating Stripe Checkout sessions
// This should be deployed as a serverless function (Vercel, Netlify, Supabase Edge Function, etc.)
// 
// Required environment variables:
// - STRIPE_SECRET_KEY: Your Stripe secret key
// - SUPABASE_URL: Your Supabase project URL
// - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
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
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error: Stripe key missing' });
  }

  try {
    const { paymentType, amount, userEmail, userName, teamId, successUrl, cancelUrl } = req.body;

    console.log('Received payment request:', { paymentType, amount, userEmail, userName, teamId });

    if (!paymentType || !amount || !userEmail || !userName) {
      return res.status(400).json({ error: 'Missing required fields' });
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

    // Create pending payment record in database
    // Note: This requires the user to exist first, so for signup flow,
    // we'll create the payment record after account creation
    // For team member payments, the user should already exist

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: error.message || 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

