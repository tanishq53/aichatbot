export async function POST(req) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ text: "⚠️ Error: GEMINI_API_KEY is missing in Vercel Environment Variables!" }), 
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanMessages = messages.filter(msg => msg.content && msg.content.trim() !== "");

    const contents = cleanMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // 🔥 NEW: The Secret System Instruction
    // This tells Nexus AI exactly how to behave before every single message.
    const systemInstruction = {
      parts: [{ 
        text: "You are Nexus AI, a highly intelligent assistant. Your core directive is to ALWAYS provide extremely short, concise, and direct answers (1 to 2 sentences maximum) by default. NEVER write long paragraphs unless the user explicitly types words like 'explain in detail', 'long answer', 'tell me more', or 'elaborate'." 
      }]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        system_instruction: systemInstruction, // We inject the rule here!
        contents: contents 
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ text: `⚠️ Google API Error: ${data.error?.message || "Unknown error"}` }), 
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const responseText = data.candidates[0].content.parts[0].text;
    return new Response(JSON.stringify({ text: responseText }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    return new Response(
      JSON.stringify({ text: `⚠️ Server Crash: ${error.message}` }), 
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
