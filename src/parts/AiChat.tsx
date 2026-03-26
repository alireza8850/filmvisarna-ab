import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const QUICK_QUESTIONS = [
  { label: "🎬 Filmdetaljer", prompt: "Vilka filmer visas just nu?" },
  { label: "💰 Priser", prompt: "Vad kostar biljetterna?" },
  { label: "📍 Plats & öppettider", prompt: "Var ligger biografen och när är den öppen?" },
  { label: "🎟️ Hur bokar jag?", prompt: "Hur bokar jag en biljett?" },
  { label: "🍿 Snacks & kiosk", prompt: "Vad finns i kiosken?" },
  { label: "❌ Avboka bokning", prompt: "Hur avbokar jag min bokning?" },
];

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hej och välkommen till Filmvisarna! 🎬 Jag är din digitala biografassistent och hjälper dig gärna med allt som rör våra filmer, visningar, salonger och bokningar. Vad vill du veta?",
      },
    ]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Voice input setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "sv-SE";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log("AI response:", JSON.stringify(data));

      // Try all known response formats
      const content =
        data?.choices?.[0]?.message?.content ||
        data?.message ||
        data?.content ||
        data?.reply ||
        data?.text ||
        "Inget svar från assistenten.";

      const assistantMessage: Message = {
        role: "assistant",
        content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Något gick fel: ${
            error instanceof Error ? error.message : "Okänt fel"
          }`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-chat">
      {/* Header */}
      <div className="ai-title">
        <span>🎬 Filmvisarna Assistent</span>
      </div>

      {/* Quick question buttons */}
      <div className="ai-quick-questions">
        {QUICK_QUESTIONS.map(({ label, prompt }) => (
          <button
            key={label}
            className="ai-quick-btn"
            onClick={() => sendMessage(prompt)}
            disabled={isLoading}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="ai-chat-body">
        {messages.map((message, index) => (
          <div key={index} className={`ai-chat-message ${message.role}`}>
            {message.role === "assistant" && (
              <span className="ai-avatar">🎬</span>
            )}
            <div className="ai-message-bubble">{message.content}</div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="ai-chat-message assistant">
            <span className="ai-avatar">🎬</span>
            <div className="ai-message-bubble ai-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="ai-chat-footer">
        <div className="ai-chat-input-area">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv din fråga här..."
            rows={1}
          />

          {/* Voice button */}
          <button
            className={`ai-voice-btn ${isListening ? "listening" : ""}`}
            onClick={toggleVoice}
            title={isListening ? "Stoppa röstinmatning" : "Tala"}
          >
            {isListening ? "🔴" : "🎤"}
          </button>

          {/* Send button */}
          <button
            className="ai-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
          >
            Skicka
          </button>
        </div>
      </div>
    </div>
  );
}