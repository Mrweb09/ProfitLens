"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "How do I fix my biggest issue?",
  "Which fix will make me the most money?",
  "How do I improve my trust score?",
  "What should I do first this week?",
];

export function AIChat({ auditId }: { auditId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I've read your full audit report. Ask me anything about your results — I'll give you specific advice based on your site." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(question?: string) {
    const q = question ?? input.trim();
    if (!q) return;
    setInput("");
    setLoading(true);

    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/audit/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          question: q,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[560px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 glass rounded-2xl mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "assistant" ? "bg-violet-600" : "bg-white/10"}`}>
              {m.role === "assistant" ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "assistant" ? "bg-white/5 text-gray-200" : "bg-violet-600 text-white"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/5 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/30 text-gray-300 rounded-full px-3 py-1.5 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && send()}
          placeholder="Ask about your audit..."
          disabled={loading}
        />
        <Button onClick={() => send()} disabled={loading || !input.trim()} variant="gradient" size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
