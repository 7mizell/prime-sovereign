// Stripe Checkout Session Creator for Prime Sovereign Listings
// Requires STRIPE_SECRET_KEY in Netlify env vars

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const TIER_PRICES = {
  essential: { amount: 50000, name: 'Essential Tier — Single Listing', description: 'MLS Description + 5 Social Captions + Email Announcement + Feature Sheet (24hr)' },
  professional: { amount: 100000, name: 'Professional Tier — Single Listing', description: 'Everything in Essential + Neighborhood Guide + Video Script + Open House Flyer + Objection Handlers (24hr)' },
  sovereign: { amount: 150000, name: 'Sovereign Tier — Single Listing', description: 'Everything in Professional + 1000-word Lifestyle Narrative + Drone Shot List + Virtual Staging Brief + Press Release + Seller Net Sheet (12hr)' },
  cornerstone: { amount: 200000, name: 'Cornerstone Retainer — Monthly', description: '4 listings/mo (Tier 2) + Brand Voice Guide + Monthly Report + 1 Strategy Call', recurring: true },
  dominion: { amount: 300000, name: 'Dominion Retainer — Monthly', description: '6 listings/mo (Tier 2/3) + Brand Voice Guide + Quarterly Insights + 2 Strategy Calls', recurring: true },
  empire: { amount: 400000, name: 'Empire Retainer — Monthly', description: '8 listings/mo (Tier 3) + Team Brand Voice Guide + Weekly Pulse + Dedicated Manager', recurring: true }
};

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[STRIPE] Missing STRIPE_SECRET_KEY env var');
    return { statusCode: 500, body: JSON.stringify({ error: 'Payment system not configured' }) };
  }

  try {
    const { tier, email, listing_address } = JSON.parse(event.body);

    if (!tier || !TIER_PRICES[tier]) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid tier selected' }) };
    }

    const price = TIER_PRICES[tier];
    const isRecurring = price.recurring === true;

    // Create or retrieve customer
    let customer;
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({ email, metadata: { source: 'prime-sovereign-landing' } });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: price.name,
            description: price.description,
            metadata: { tier, listing_address: listing_address || 'pending' }
          },
          unit_amount: price.amount,
          ...(isRecurring && { recurring: { interval: 'month' } })
        },
        quantity: 1
      }],
      mode: isRecurring ? 'subscription' : 'payment',
      success_url: `${process.env.URL || 'https://primesovereign.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'https://primesovereign.com'}/canceled`,
      metadata: {
        tier,
        listing_address: listing_address || 'pending',
        source: 'prime-sovereign-landing'
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required'
    });

    console.log(`[STRIPE] Checkout created: ${session.id} | Tier: ${tier} | Email: ${email}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url, sessionId: session.id })
    };
  } catch (err) {
    console.error('[STRIPE ERROR]', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Failed to create checkout session' })
    };
  }
};