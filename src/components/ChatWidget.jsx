import React, { useState, useEffect, useRef } from "react";

/**
 * ChatWidget.jsx
 * - Primary: OpenAI Chat Completions (VITE_OPENAI_API_KEY & VITE_OPENAI_MODEL)
 * - Fallback: Hugging Face Inference (VITE_HF_API_KEY & VITE_HF_MODEL)
 * - Frontend-only, conversation memory (last N turns), questionnaire buttons, PII fallback
 *
 * ENV required:
 * - VITE_OPENAI_API_KEY
 * - VITE_OPENAI_MODEL (e.g. gpt-3.5-turbo)
 * - optional: VITE_HF_API_KEY, VITE_HF_MODEL
 *
 * NOTE: Browser calls with API keys expose them to the client. For production, proxy server or Rocket.new integration is recommended.
 */

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-3.5-turbo";

const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
const HF_MODEL = import.meta.env.VITE_HF_MODEL || "tiiuae/falcon-7b-instruct";

const COMPLIANCE_QUESTIONS = [
  "What type of data are you handling today?",
  "Does it contain personal identifiers?",
  "Are files shared externally?",
  "Are data transfers encrypted?",
  "Do employees access this data remotely?",
  "Are audit logs maintained?",
  "Has any data breach occurred recently?",
  "Is anonymization used in processing?",
  "Are user consents collected?",
  "How long is data retained?",
  "Are access controls role-based?",
  "Is third-party sharing involved?",
  "Are employees trained on data privacy?",
  "Are remediation steps documented?",
  "Would you like to generate a summary report now?"
];

/* ------------------ Local PII detection fallback ------------------ */
const PII_REGEX = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(?:\+?\d{1,3}[-.\s]?)?(?:\d{2,4}[-.\s]?){1,3}\d{2,4}/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  credit_card: /\b(?:\d[ -]*?){13,16}\b/g
};

function detectPII(text = "") {
  const findings = [];
  if (!text) return findings;
  Object.entries(PII_REGEX).forEach(([type, regex]) => {
    const matches = [...(text.matchAll(regex) || [])];
    matches.forEach((m) => {
      const value = m[0];
      const index = m.index || 0;
      findings.push({
        type,
        value,
        index,
        snippet: text.substr(Math.max(0, index - 30), Math.min(120, value.length + 60)),
        confidence: type === "ssn" || type === "credit_card" ? "high" : "medium"
      });
    });
  });
  return findings;
}

/* ------------------ Prompt builder (conversation memory) ------------------ */
function buildSystemInstruction() {
  return `You are a helpful, professional compliance assistant. Provide clear, actionable answers with examples and remediation steps when relevant. Keep responses concise but complete.`;
}

function buildOpenAIPayload(history = [], userMessage = "") {
  // Build messages array for OpenAI chat/completions
  const system = { role: "system", content: buildSystemInstruction() };

  // keep last N turns (user+assistant)
  const maxTurns = 8;
  const recent = history.slice(-maxTurns);

  const messages = [system];
  // convert our internal messages to OpenAI chat messages
  recent.forEach((m) => {
    if (m.from === "user") messages.push({ role: "user", content: m.text });
    else if (m.from === "bot") messages.push({ role: "assistant", content: m.text });
    // ignore question-list items
  });
  // add the current user message last
  messages.push({ role: "user", content: userMessage });

  return { model: OPENAI_MODEL, messages, max_tokens: 512, temperature: 0.6, top_p: 0.9 };
}

/* ------------------ OpenAI & HF callers ------------------ */
async function callOpenAI(payload) {
  if (!OPENAI_KEY) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.warn("OpenAI non-ok", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.warn("OpenAI error", e);
    return null;
  }
}

async function callHFModel(prompt) {
  if (!HF_API_KEY) return null;
  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(HF_MODEL)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        options: { wait_for_model: true },
        parameters: { max_new_tokens: 256, temperature: 0.6, top_p: 0.9 }
      })
    });
    if (!res.ok) {
      console.warn("HF non-ok", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    if (Array.isArray(data) && data[0]?.generated_text) return String(data[0].generated_text).trim();
    if (data?.generated_text) return String(data.generated_text).trim();
    return null;
  } catch (e) {
    console.warn("HF error", e);
    return null;
  }
}

/* ------------------ Failover function: try OpenAI -> HF -> local fallback ------------------ */
async function getAIReply(history = [], userText = "") {
  // 1) Try OpenAI chat completion with conversation memory
  const payload = buildOpenAIPayload(history, userText);
  const openaiReply = await callOpenAI(payload);
  if (openaiReply) return openaiReply;

  // 2) Try a simpler HF fallback (single prompt built from system + recent messages)
  const system = buildSystemInstruction();
  const recent = history.slice(-6).map((m) => `${m.from === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n");
  const prompt = `${system}\n\nContext:\n${recent}\n\nUser: ${userText}\nAssistant:`;
  const hfReply = await callHFModel(prompt);
  if (hfReply) {
    // try to strip repeated prompt echoes
    return hfReply.replace(/User:.*Assistant:/g, "").trim();
  }

  // 3) Local fallback: PII detection or generic reply
  const findings = detectPII(userText);
  if (findings.length > 0) {
    return `I detected ${findings.length} potential sensitive items (e.g. ${findings
      .slice(0, 3)
      .map((f) => f.type)
      .join(", ")}). I recommend masking/anonymizing those fields before sharing. You can attach a TXT/CSV sample for a deeper scan.`;
  }
  return "I couldn't reach an external model right now. Please try again in a moment — or tell me more about your data (type, sharing, or paste a sample).";
}

/* ------------------ The ChatWidget component ------------------ */
export default function ChatWidget({ position = "right" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: `m-${Date.now()}`, from: "bot", text: "Hi — I'm your Compliance Assistant. Ask me anything about data, privacy, or remediation." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    // show questionnaire at first open for a fresh session
    if (open && messages.length === 1) {
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, from: "bot", text: "Here are some standard compliance questions to get started:" },
        { id: `q-${Date.now()}`, from: "questions", list: COMPLIANCE_QUESTIONS }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  function addMessage(m) {
    setMessages((p) => [...p, { id: `m-${Date.now()}-${Math.random()}`, ...m }]);
  }

  async function handleSend(rawText) {
    const text = (rawText ?? input).trim();
    if (!text) return;
    addMessage({ from: "user", text });
    setInput("");
    setLoading(true);

    // get AI reply (OpenAI -> HF -> local)
    try {
      const aiReply = await getAIReply(messages, text);
      addMessage({ from: "bot", text: aiReply });
    } catch (err) {
      console.error("Failed to get AI reply", err);
      addMessage({
        from: "bot",
        text: "Something went wrong while getting a reply. Try again in a moment."
      });
    } finally {
      setLoading(false);
    }
  }

  function handleQuestionClick(q) {
    handleSend(q);
  }

  function resetConversation() {
    setMessages([{ id: `m-${Date.now()}`, from: "bot", text: "New session started — ask anything or click a questionnaire item to begin." }]);
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)} />}

      <div className={`fixed bottom-6 ${position === "right" ? "right-6" : "left-6"} z-50 flex items-end`}>
        <div className={`transform transition-all duration-200 ${open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"} w-[360px] max-h-[78vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden`} style={{ boxShadow: "0 12px 40px rgba(2,6,23,0.45)" }}>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-semibold">AI</div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Compliance Assistant</div>
                  <div className="text-xs text-gray-500">Context-aware — I remember recent messages to answer better.</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={resetConversation} title="Reset conversation" className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">Reset</button>
                <button onClick={() => setOpen(false)} aria-label="Close" className="p-1 hover:bg-gray-100 rounded">✕</button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="h-[58vh] overflow-y-auto p-4 pr-2" style={{ scrollbarWidth: "thin" }}>
                <div className="space-y-3">
                  {messages.map((m) =>
                    m.from === "questions" ? (
                      <div key={m.id} className="grid grid-cols-1 gap-2">
                        {m.list.map((q, idx) => (
                          <button key={idx} onClick={() => handleQuestionClick(q)} className="text-left p-2 border rounded bg-muted/30 hover:bg-muted/50 text-sm transition">
                            {q}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[78%] px-3 py-2 rounded-lg shadow ${m.from === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-800 border border-gray-100"}`} style={{ whiteSpace: "pre-wrap" }}>
                          {m.text}
                        </div>
                      </div>
                    )
                  )}
                  {loading && <div className="text-sm text-gray-500 italic">Typing…</div>}
                  <div ref={bottomRef} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-white border-t">
              <div className="flex items-center space-x-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask anything — I will answer in context..."
                  className="flex-1 resize-none px-3 py-2 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button onClick={() => handleSend()} disabled={loading} className="ml-2 px-3 py-2 rounded bg-blue-600 text-white hover:brightness-95 disabled:opacity-50">
                  {loading ? "..." : "Send"}
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div>Tip: click a question to auto-ask, or type “show questions” to display them again.</div>
                <div>
                  <button onClick={() => setMessages((p)=>[...p, { id:`q-${Date.now()}`, from: "questions", list: COMPLIANCE_QUESTIONS }])} className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">📋 View Questions</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Launcher */}
        <div className="ml-4 -mb-6">
          <button onClick={() => setOpen(!open)} aria-label="Open assistant" className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl" style={{ background: "linear-gradient(180deg,#0066ff,#0047b3)", boxShadow: "0 8px 30px rgba(0,86,255,0.18)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="#fff" strokeWidth="1.6"/></svg>
          </button>
        </div>
      </div>
    </>
  );
}


