exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { email, name, phone, tags, evModel, state } = JSON.parse(event.body);
    if (!email || !email.includes('@')) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
    }

    const isQuoteRequest = tags && tags.includes('quote-request');

    // Subscribe to Beehiiv
    const payload = {
      email: email,
      reactivate_existing: true,
      send_welcome_email: !isQuoteRequest,
    };

    await fetch(
      'https://api.beehiiv.com/v2/publications/pub_33986136-9810-4002-9eb9-51b3cd83c398/subscriptions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YLMjFY543cckEXZs0NtqmJsW0eDkna0n1hJlvn7ydh8FHeF6X1ESLV4AU7uZBBHO',
        },
        body: JSON.stringify(payload),
      }
    );

    // If quote request, log to Google Sheet
    if (isQuoteRequest) {
      await fetch('https://script.google.com/macros/s/AKfycbyYiFANGUX7yIEks8LA3LtiRtKiYRfbx-aSbSU5zhlMltlREfhwtg2sOzAo4ZFRMbA-aA/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, phone, evModel, state }),
      });
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};
