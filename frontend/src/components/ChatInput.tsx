import { useState, useRef } from 'react';

interface Props { onSend: (text: string) => void; disabled?: boolean; }

export default function ChatInput({ onSend, disabled }: Props) {
  const [val, setVal] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const t = val.trim();
    if (!t || disabled) return;
    onSend(t);
    setVal('');
    if (ref.current) { ref.current.style.height = 'auto'; }
  }

  return (
    <div className="input-bar">
      <div className="input-row">
        <textarea
          ref={ref}
          className="chat-textarea"
          rows={1}
          placeholder="Ask anything or say Pay @..."
          value={val}
          onChange={e => {
            setVal(e.target.value);
            const el = ref.current;
            if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
        />
        <button className="send-btn" disabled={!val.trim() || disabled} onClick={submit}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </button>
      </div>
      <div className="hint-text">Pay Priya ₹500 · Check balance · New FD</div>
    </div>
  );
}
