import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    // Vercel handles securely injecting process.env.GEMINI_API_KEY
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(latestMessage);
    const responseText = result.response.text();

    return new Response(JSON.stringify({ text: responseText }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate response" }), { status: 500 });
  }
}