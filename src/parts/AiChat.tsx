import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_OPTIONS = [
  { label: "🎟 Biljettpriser",  prompt: "Vad kostar biljetter och vilka typer finns det?" },
  { label: "🍿 Mat & Dryck",    prompt: "Vad kan jag köpa att äta och dricka på biografen?" },
  { label: "🕐 Öppettider",     prompt: "Vilka öppettider har ni?" },
  { label: "📍 Hitta hit",      prompt: "Var ligger ni och hur tar jag mig dit?" },
  { label: "🎬 Filmtips",       prompt: "Kan du ge mig ett filmtips baserat på genre?" },
  { label: "📅 Föreställningar",prompt: "När har ni föreställningar och hur bokar jag?" },
];

export default function FloatingAiChat() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState<Message[]>([
    { role: "assistant", content: "Hej! Välkommen till Filmvisarna! 🎬 Hur kan jag hjälpa dig idag?" },
  ]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [status, setStatus]       = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w               = window as any;
  const voiceSupported  = "SpeechRecognition" in w || "webkitSpeechRecognition" in w;
  const ttsSupported    = "speechSynthesis" in w;

  const bottomRef       = useRef<HTMLDivElement>(null);
  const textareaRef     = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef  = useRef<any>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      w.speechSynthesis?.cancel();
    };
  }, []);

  // ── TTS ────────────────────────────────────────────────────────────────────
  function speakText(text: string) {
    if (!ttsSupported) return;
    w.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang  = "sv-SE";
    u.rate  = 1.0;
    const voices: SpeechSynthesisVoice[] = w.speechSynthesis.getVoices();
    const sv = voices.find((v) => v.lang.startsWith("sv"));
    if (sv) u.voice = sv;
    u.onstart = () => setIsSpeaking(true);
    u.onend   = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    w.speechSynthesis.speak(u);
  }

  function stopSpeaking() {
    w.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  // ── Voice input ────────────────────────────────────────────────────────────
  function startVoiceInput() {
    if (!voiceSupported) return;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang            = "sv-SE";
    rec.interimResults  = true;
    rec.continuous      = false;

    rec.onstart = () => { setIsListening(true); setStatus("🎙 Lyssnar..."); };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setInput(t);
    };

    rec.onend = () => {
      setIsListening(false);
      setStatus("");
      setInput((cur: string) => {
        if (cur.trim()) setTimeout(() => sendMessage(cur), 100);
        return cur;
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      setIsListening(false);
      if (e.error !== "aborted") {
        setStatus("Röstinmatning misslyckades.");
        setTimeout(() => setStatus(""), 3000);
      }
    };

    rec.start();
  }

  function stopVoiceInput() {
    recognitionRef.current?.stop();
    setIsListening(false);
    setStatus("");
  }

  // ── Send message ───────────────────────────────────────────────────────────
  async function sendMessage(override?: string) {
    const text = (override ?? input).trim();
    if (!text || loading) return;

    const userMsg: Message       = { role: "user", content: text };
    const updated: Message[]     = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    setStatus("Tänker...");

    try {
      const res  = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      const reply: string =
        data.choices?.[0]?.message?.content || "Något gick fel, försök igen.";
      const next = [...updated, { role: "assistant" as const, content: reply }];
      setMessages(next);
      speakText(reply);
    } catch {
      setMessages([...updated, {
        role: "assistant",
        content: "Kunde inte ansluta till servern. Försök igen senare.",
      }]);
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const hasUserMessages = messages.length > 1;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Chat window ── */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: "90px", right: "24px",
          width: "370px", maxWidth: "calc(100vw - 48px)",
          backgroundColor: "white", borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          zIndex: 9999, display: "flex", flexDirection: "column", overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            backgroundColor: "#1a1a2e", color: "white",
            padding: "14px 18px", display: "flex",
            alignItems: "center", justifyContent: "space-between", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🤖</span>
              <span style={{ fontWeight: 600, fontSize: "15px" }}>Filmvisarna AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{
              background: "none", border: "none", color: "white",
              fontSize: "22px", cursor: "pointer", lineHeight: 1, padding: 0,
            }}>×</button>
          </div>

          {/* Quick option buttons — large grid before any user message */}
          {!hasUserMessages && (
            <div style={{ padding: "12px 12px 0", backgroundColor: "#f5f5f5" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px",
              }}>
                {QUICK_OPTIONS.map((opt) => (
                  <button key={opt.label} disabled={loading}
                    onClick={() => sendMessage(opt.prompt)}
                    style={{
                      background: "white", border: "1px solid #ddd",
                      borderRadius: "10px", padding: "9px 10px",
                      fontSize: "13px", textAlign: "left", cursor: "pointer",
                      opacity: loading ? 0.5 : 1, transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f0f0f0")}
                    onMouseLeave={e => (e.currentTarget.style.background = "white")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{
            height: hasUserMessages ? "360px" : "200px",
            overflowY: "auto", padding: "14px",
            display: "flex", flexDirection: "column", gap: "10px",
            backgroundColor: "#f5f5f5", transition: "height 0.3s",
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                maxWidth: "82%", padding: "10px 14px",
                borderRadius: msg.role === "user"
                  ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                backgroundColor: msg.role === "user" ? "#1a1a2e" : "white",
                color: msg.role === "user" ? "white" : "#222",
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                fontSize: "14px", lineHeight: "1.5",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {msg.content}
              </div>
            ))}

            {loading && (
              <div style={{
                alignSelf: "flex-start", backgroundColor: "white",
                padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                fontSize: "14px", color: "#888",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}>
                ✍️ Skriver...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick pill buttons — compact row once conversation starts */}
          {hasUserMessages && (
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "6px",
              padding: "8px 12px", borderTop: "1px solid #eee",
              backgroundColor: "white",
            }}>
              {QUICK_OPTIONS.map((opt) => (
                <button key={opt.label} disabled={loading}
                  onClick={() => sendMessage(opt.prompt)}
                  style={{
                    background: "transparent", border: "1px solid #ddd",
                    borderRadius: "999px", padding: "4px 10px",
                    fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap",
                    opacity: loading ? 0.5 : 1,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f0f0")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Status bar */}
          {status && (
            <div style={{
              fontSize: "12px", color: "#888", padding: "4px 14px 0",
              backgroundColor: "white",
            }}>
              {status}
            </div>
          )}

          {/* Input row */}
          <div style={{
            padding: "10px 12px 12px", borderTop: "1px solid #eee",
            display: "flex", gap: "8px", alignItems: "flex-end",
            backgroundColor: "white", flexShrink: 0,
          }}>
            {/* Stop TTS */}
            {isSpeaking && (
              <button onClick={stopSpeaking} title="Stoppa uppläsning" style={{
                flexShrink: 0, width: "38px", height: "38px",
                background: "transparent", border: "1px solid #ddd",
                borderRadius: "10px", cursor: "pointer", fontSize: "16px",
              }}>🔇</button>
            )}

            <textarea ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Lyssnar..." : "Skriv eller tala..."}
              rows={1}
              disabled={isListening}
              style={{
                flex: 1, padding: "10px 12px", borderRadius: "10px",
                border: "1px solid #ddd", resize: "none", fontSize: "14px",
                outline: "none", fontFamily: "inherit", lineHeight: "1.4",
                backgroundColor: isListening ? "#f9f9f9" : "white",
              }}
            />

            {/* Mic button */}
            {voiceSupported && (
              <button
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                disabled={loading}
                title={isListening ? "Sluta lyssna" : "Tala din fråga"}
                style={{
                  flexShrink: 0, width: "38px", height: "38px",
                  backgroundColor: isListening ? "#e53935" : "transparent",
                  border: `1px solid ${isListening ? "#e53935" : "#ddd"}`,
                  borderRadius: "10px", cursor: "pointer", fontSize: "16px",
                  opacity: loading ? 0.4 : 1,
                  animation: isListening ? "pulse-mic 1s ease-in-out infinite" : "none",
                }}
              >
                {isListening ? "⏹" : "🎙"}
              </button>
            )}

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                flexShrink: 0, width: "38px", height: "38px",
                backgroundColor: "#1a1a2e", color: "white", border: "none",
                borderRadius: "10px", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: "17px", opacity: loading || !input.trim() ? 0.4 : 1,
                transition: "opacity 0.2s",
              }}
            >➤</button>
          </div>
        </div>
      )}

      {/* Pulse animation for mic */}
      <style>{`
        @keyframes pulse-mic {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>

      {/* ── Floating button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Öppna AI-chatt"
        style={{
          position: "fixed", bottom: "24px", right: "24px",
          width: "56px", height: "56px", borderRadius: "50%",
          backgroundColor: "#1a1a2e", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)", zIndex: 10000,
          fontSize: "26px", transition: "transform 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isOpen ? "✕" : "🤖"}
      </button>
    </>
  );
}