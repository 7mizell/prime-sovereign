exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, listing_address } = JSON.parse(event.body);

    if (!email || !email.includes('@')) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Valid email required' }) };
    }

    // Store lead in Netlify Forms or external service
    // For now, log and return success
    console.log(`[LEAD] ${new Date().toISOString()} | ${email} | ${listing_address || 'no address'}`);

    // TODO: Integrate with:
    // 1. Airtable/Google Sheets for lead tracking
    // 2. SendGrid/Mailgun for auto-reply with free rewrite
    // 3. Stripe for checkout session if paid tier selected

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Free rewrite queued. Check your inbox within 2 hours.' })
    };
  } catch (err) {
    console.error('[LEAD ERROR]', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};