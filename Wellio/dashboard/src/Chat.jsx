// Chat.jsx (example)
import React, { useRef, useState } from "react";
import Orb from "./components/Orb";

export default function Chat() {
  const inputRef = useRef(null);
  const [typing, setTyping] = useState(false);
  let t;

  const onInput = () => {
    setTyping(true);
    clearTimeout(t);
    t = setTimeout(() => setTyping(false), 800); // stop after idle
  };

  return (
    <div className="layout">
      <div className="left-pane">
        <textarea
          id="chat-input"
          ref={inputRef}
          onInput={onInput}
          onKeyDown={onInput}
          placeholder="Type your message…"
        />
      </div>

      <div className="right-pane">
        <Orb
          isListening={false}
          isSpeaking={false}
          isThinking={false}
          isTyping={typing}
          followRef={inputRef}          // or followSelector="#chat-input"
          size={360}
        />
      </div>
    </div>
  );
}
