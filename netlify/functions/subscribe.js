exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email || !email.includes('@')) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
    }

    const response = await fetch(
      'https://api.beehiiv.com/v2/publications/pub_33986136-9810-4002-9eb9-51b3cd83c398/subscriptions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YLMjFY543cckEXZs0NtqmJsW0eDkna0n1hJlvn7ydh8FHeF6X1ESLV4AU7uZBBHO',
        },
        body: JSON.stringify({
          email: email,
          reactivate_existing: true,
          send_welcome_email: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Beehiiv error:', data);
      return { statusCode: 500, body: JSON.stringify({ error: 'Subscription failed' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};
