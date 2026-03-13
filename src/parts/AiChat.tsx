import { useState, useRef, useEffect } from "react";

export default function FloatingAiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hej! Välkommen till Filmvisarna! 🎬 Hur kan jag hjälpa dig idag?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
  if (bottomRef.current) {
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [messages, loading]);


  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();
      const reply =
        data.choices?.[0]?.message?.content ||
        "Något gick fel, försök igen.";
      setMessages([...updatedMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "Kunde inte ansluta till servern. Försök igen senare." },
      ]);
    }

    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: '360px',
          maxWidth: 'calc(100vw - 48px)',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>

          {/* Header */}
          <div style={{
            backgroundColor: '#1a1a2e',
            color: 'white',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🤖</span>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>Filmvisarna AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{
              background: 'none', border: 'none', color: 'white',
              fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: 0
            }}>×</button>
          </div>

          {/* Messages */}
          <div style={{
            height: '380px',
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: '#f5f5f5'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                maxWidth: '82%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user'
                  ? '16px 16px 4px 16px'
                  : '16px 16px 16px 4px',
                backgroundColor: msg.role === 'user' ? '#1a1a2e' : 'white',
                color: msg.role === 'user' ? 'white' : '#222',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                fontSize: '14px',
                lineHeight: '1.5',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {msg.content}
              </div>
            ))}

            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                backgroundColor: 'white',
                padding: '10px 14px',
                borderRadius: '16px 16px 16px 4px',
                fontSize: '14px',
                color: '#888',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
              }}>
                ✍️ Skriver...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '8px',
            backgroundColor: 'white',
            flexShrink: 0
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Skriv ett meddelande... (Enter för att skicka)"
              rows={1}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #ddd',
                resize: 'none',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.4'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                backgroundColor: '#1a1a2e',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '0 16px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontSize: '18px',
                opacity: loading || !input.trim() ? 0.4 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#1a1a2e',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          zIndex: 10000,
          fontSize: '24px',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Öppna AI-chatt"
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </>
  );
}