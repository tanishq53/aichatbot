export async function POST(req) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Convert your chat history into the exact format Google's raw API expects
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content || "" }]
    }));

    // Make a direct, raw web request to Google (Bypassing the broken NPM package entirely)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    // If Google rejects it, catch the exact error and send it to your screen
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || "Google rejected the request" }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract the AI's text from the raw data
    const responseText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ text: responseText }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error("Direct Fetch Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to connect" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
