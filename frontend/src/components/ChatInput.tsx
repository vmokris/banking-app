import { useState, useRef } from 'react';
import { searchContacts } from '../data/mockData';
import type { Contact } from '../data/mockData';
import { avatarColors } from '../design-system/tokens';

interface Props { onSend: (text: string) => void; disabled?: boolean; }

// Match "pay @xxx" where xxx is 3+ chars
const AT_RE = /pay\s+@(\w{3,})/i;

export default function ChatInput({ onSend, disabled }: Props) {
  const [val, setVal] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const atMatch = val.match(AT_RE);
  const suggestions: Contact[] = atMatch ? searchContacts(atMatch[1]).slice(0, 4) : [];

  function selectContact(c: Contact) {
    const newVal = val.replace(AT_RE, `Pay ${c.name} `);
    setVal(newVal);
    ref.current?.focus();
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }

  function submit() {
    const t = val.trim();
    if (!t || disabled) return;
    onSend(t);
    setVal('');
    if (ref.current) { ref.current.style.height = 'auto'; }
  }

  return (
    <div className="input-bar">
      {suggestions.length > 0 && (
        <div className="at-suggestions">
          <div className="at-suggestions-label">
            <span className="at-at">@</span>{atMatch![1]}
          </div>
          {suggestions.map(c => (
            <div key={c.id} className="at-suggestion-item" onClick={() => selectContact(c)}>
              <div
                className="contact-avatar"
                style={{ background: avatarColors[c.colorIdx], width: 34, height: 34, fontSize: 12, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', flexShrink: 0 }}
              >
                {c.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: '#F0F4FF', fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#8892B0', marginTop: 1 }}>{c.bank} · {c.account}</div>
              </div>
              <div style={{ fontSize: 11, color: '#4A5568' }}>{c.upi}</div>
            </div>
          ))}
        </div>
      )}

      <div className="input-row">
        <textarea
          ref={ref}
          className="chat-textarea"
          rows={1}
          placeholder="Ask anything or say Pay @name..."
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
      <div className="hint-text">Pay @Priya · Check balance · New FD</div>
    </div>
  );
}
