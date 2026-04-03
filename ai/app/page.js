"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { Send, Menu, Plus, MessageSquare, Trash2, Loader2 } from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await res.json();
      
      setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "**Error:** Could not reach the AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-gray-100 font-sans overflow-hidden selection:bg-purple-500/30">
      
      <div className={`${isSidebarOpen ? "w-64" : "w-0"} transition-all duration-300 ease-in-out bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col z-20 shrink-0 relative overflow-hidden`}>
        <div className="p-4">
          <button onClick={clearChat} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white p-3 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <Plus size={18} /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent</p>
          {messages.length > 0 ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 text-sm cursor-pointer hover:bg-white/10 transition-colors border border-white/5">
              <MessageSquare size={16} className="text-purple-400" />
              <span className="truncate">Current Conversation</span>
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic">No recent chats</p>
          )}
        </div>
        {messages.length > 0 && (
           <div className="p-4 border-t border-white/10">
             <button onClick={clearChat} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
               <Trash2 size={16} /> Clear History
             </button>
           </div>
        )}
      </div>

      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

        <header className="h-16 flex items-center px-4 border-b border-white/10 bg-black/20 backdrop-blur-md z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300">
            <Menu size={20} />
          </button>
          <h1 className="ml-4 font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            Nexus AI
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth z-10 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-70">
              <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(168,85,247,0.5)]">
                <MessageSquare size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">How can I help you today?</h2>
              <p className="text-gray-400 max-w-md text-center">Experience the power of Gemini embedded in a premium interface.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} max-w-4xl mx-auto`}>
                <div className={`p-5 rounded-2xl max-w-[85%] ${
                  msg.role === "user" 
                    ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg" 
                    : "bg-white/5 backdrop-blur-lg border border-white/10 text-gray-200 shadow-xl"
                }`}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <div className="rounded-xl overflow-hidden my-4 border border-white/10 shadow-lg">
                            <div className="bg-[#1e1e1e] px-4 py-2 text-xs text-gray-400 flex justify-between items-center border-b border-white/10">
                              <span>{match[1]}</span>
                            </div>
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{ margin: 0, padding: '1.5rem', background: '#111111' }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-black/30 text-purple-300 px-1.5 py-0.5 rounded-md font-mono text-sm" {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                    className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0"
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start max-w-4xl mx-auto">
              <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 flex items-center gap-3 text-purple-400">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-sm font-medium animate-pulse">AI is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 md:p-6 z-10 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-[#151515] border border-white/10 rounded-2xl shadow-2xl p-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-white px-4 py-3 outline-none placeholder:text-gray-500"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} className={input.trim() ? "text-purple-400" : "text-gray-500"} />
              </button>
            </div>
          </form>
          <p className="text-center text-xs text-gray-600 mt-4">AI can make mistakes. Verify important information.</p>
        </div>
      </div>
    </div>
  );
}