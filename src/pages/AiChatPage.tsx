import AiChat from "../parts/AiChat";
import { useState, useRef, useEffect } from "react";
import { LuBot } from "react-icons/lu";
import { FaExpand, FaWindowClose } from "react-icons/fa";

AiChatPage.route = {
  path: "/ai-chat",
  menuLabel: "AI Chat",
  index: 4,
};

export default function AiChatPage() {
  const [open, setOpen] = useState(false);
  const [fullPage, setFullPage] = useState(false);

  const windowRef = useRef<HTMLDivElement>(null);
  const dragData = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
  });

  const startDrag = (e: React.MouseEvent) => {
    if (fullPage) return;

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

  return (
    <>
      {/* Floating Button */}
      <button
        className="floating-ai-button"
        onClick={() => {
          setOpen(!open);
          setFullPage(false);
        }}
        aria-label="Open AI Chat"
      >
        <LuBot size={50} />
      </button>

      {/* FULL PAGE CHAT */}
      {fullPage && (
        <div className="ai-fullpage">
          <button
            className="ai-fullpage-close"
            onClick={() => setFullPage(false)}
          >
            <FaWindowClose size={26} />
          </button>

          <AiChat />
        </div>
      )}

      {/* FLOATING CHAT WINDOW */}
      {open && !fullPage && (
        <div
          className="floating-ai-window"
          ref={windowRef}
          onMouseDown={startDrag}
        >
          <div className="floating-ai-drag-handle"></div>

          {/* Expand to Full Page */}
          <button
            className="floating-ai-expand"
            onClick={() => {
              setFullPage(true);
              setOpen(false);
            }}
            aria-label="Expand AI Chat"
          >
            <FaExpand size={20} />
          </button>

          {/* Close Floating */}
          <button
            className="floating-ai-close"
            onClick={() => setOpen(false)}
            aria-label="Close AI Chat"
          >
            <FaWindowClose size={20} />
          </button>

          <AiChat />
        </div>
      )}
    </>
  );
}