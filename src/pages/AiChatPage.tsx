import AiChat from "../parts/AiChat";
import { useState, useRef , useEffect} from "react";
import { FaCommentDots } from "react-icons/fa6";
import { LuBot } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

AiChatPage.route = {
  path: "/ai-chat",
  menuLabel: "AI Chat",
  index: 4,
};


export default function AiChatPage() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const windowRef = useRef<HTMLDivElement>(null);
  const dragData = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
  });

  const startDrag = (e: React.MouseEvent) => {
    if (
      !(e.target as HTMLElement).classList.contains("floating-ai-drag-handle")
    ) {
      return;
    }

    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragData.current.isDragging = true;
    dragData.current.startX = e.clientX;
    dragData.current.startY = e.clientY;
    dragData.current.initialLeft = rect.left;
    dragData.current.initialTop = rect.top;

    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const onDrag = (e: MouseEvent) => {
    if (!dragData.current.isDragging || !windowRef.current) return;

    const deltaX = e.clientX - dragData.current.startX;
    const deltaY = e.clientY - dragData.current.startY;

    windowRef.current.style.left = `${dragData.current.initialLeft + deltaX}px`;
    windowRef.current.style.top = `${dragData.current.initialTop + deltaY}px`;
  };

  const stopDrag = () => {
    dragData.current.isDragging = false;
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
  };

  useEffect(() => {
    if (open && windowRef.current) {
      windowRef.current.style.top = "auto";
      windowRef.current.style.left = "auto";
    }
  }, [open]);

  const openFullPage = () => {
    navigate("/ai-chat");
  };

  

  return (
    <>
      {/* Floating Button */}
      <button
        className="floating-ai-button"
        onClick={() => setOpen(!open)}
        aria-label="Open AI Chat"
      >
        <LuBot size={50} />
      </button>

      {/* Chat Window */}
      {open && (
        <div
          className="floating-ai-window"
          ref={windowRef}
          onMouseDown={startDrag}
        >
          <div className="floating-ai-drag-handle"></div>

          {/* Open full window */}
          <button
            className="floating-ai-expand"
            onClick={openFullPage}
            aria-label="Open full AI assistant"
          >
            ⬜
          </button>

          <button
            className="floating-ai-close"
            onClick={() => setOpen(false)}
            aria-label="Close AI Chat"
          >
            ×
          </button>
          <AiChat />
        </div>
      )}
    </>
  );
}

