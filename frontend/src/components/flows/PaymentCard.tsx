import { useState, useRef, useEffect } from 'react';
import type { PaymentState, FlowAction } from '../../types';
import { searchContacts, formatINRFull } from '../../data/mockData';
import { avatarColors } from '../../design-system/tokens';

interface Props {
  state: PaymentState;
  onAction: (a: FlowAction) => void;
}

export default function PaymentCard({ state, onAction }: Props) {
  const [amtInput, setAmtInput] = useState(state.amount ? String(state.amount) : '');
  const [searchQ, setSearchQ] = useState(state.query || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const results = searchContacts(searchQ);

  useEffect(() => { inputRef.current?.focus(); }, [state.step]);

  if (state.step === 'success') {
    return (
      <div className="flow-card">
        <div className="success-wrap">
          <div className="success-icon">✓</div>
          <div className="success-title">Payment Sent!</div>
          <div className="success-sub">
            {formatINRFull(state.amount!)} sent to {state.selected?.name}
          </div>
          <div className="success-ref">Ref: {state.txRef}</div>
        </div>
      </div>
    );
  }

  if (state.step === 'confirm') {
    const c = state.selected!;
    return (
      <div className="flow-card">
        <div className="flow-header">
          <span>💸</span> Confirm Payment
        </div>
        <div className="confirm-section">
          <div className="confirm-row">
            <span className="confirm-label">To</span>
            <span className="confirm-value">{c.name}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-label">UPI</span>
            <span className="confirm-value" style={{ fontSize: 12, color: '#8892B0' }}>{c.upi}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-label">Amount</span>
            <span className="confirm-value" style={{ fontSize: 18, fontWeight: 700, color: '#F0F4FF' }}>
              {formatINRFull(state.amount!)}
            </span>
          </div>
          <div className="confirm-row">
            <span className="confirm-label">From</span>
            <span className="confirm-value">Savings ****4521</span>
          </div>
        </div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => onAction({ kind: 'cancel' })}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onAction({ kind: 'confirm_payment' })}>
            Pay Now
          </button>
        </div>
      </div>
    );
  }

  if (state.step === 'enter_amount') {
    const c = state.selected!;
    return (
      <div className="flow-card">
        <div className="flow-header">
          <div
            className="contact-avatar"
            style={{ background: avatarColors[c.colorIdx], width: 28, height: 28, fontSize: 11, borderRadius: '50%', display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff' }}
          >
            {c.initials}
          </div>
          <span>Pay {c.name}</span>
        </div>
        <div className="amount-input-wrap">
          <span className="rupee-prefix">₹</span>
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            className="amount-input"
            type="number"
            placeholder="0"
            value={amtInput}
            onChange={e => setAmtInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && parseFloat(amtInput) > 0) {
                onAction({ kind: 'set_amount', amount: parseFloat(amtInput) });
              }
            }}
          />
        </div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => onAction({ kind: 'cancel' })}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!amtInput || parseFloat(amtInput) <= 0}
            onClick={() => onAction({ kind: 'set_amount', amount: parseFloat(amtInput) })}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (state.step === 'select') {
    return (
      <div className="flow-card">
        <div className="flow-header"><span>👥</span> Select Contact</div>
        {state.matches.map(c => (
          <ContactRow key={c.id} contact={c} onSelect={() => onAction({ kind: 'select_contact', contact: c })} />
        ))}
      </div>
    );
  }

  // step === 'search'
  return (
    <div className="flow-card">
      <div className="flow-header"><span>🔍</span> Search Contact</div>
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        className="contact-search-input"
        placeholder="Name, UPI ID, or bank..."
        value={searchQ}
        onChange={e => setSearchQ(e.target.value)}
      />
      <div style={{ maxHeight: 240, overflowY: 'auto' }}>
        {results.map(c => (
          <ContactRow key={c.id} contact={c} onSelect={() => onAction({ kind: 'select_contact', contact: c })} />
        ))}
        {results.length === 0 && (
          <div style={{ padding: '16px', fontSize: 13, color: '#8892B0', textAlign: 'center' }}>
            No contacts found
          </div>
        )}
      </div>
    </div>
  );
}

function ContactRow({ contact: c, onSelect }: { contact: ReturnType<typeof searchContacts>[0]; onSelect: () => void }) {
  return (
    <div className="contact-item" onClick={onSelect}>
      <div className="contact-avatar" style={{ background: avatarColors[c.colorIdx] }}>
        {c.initials}
      </div>
      <div>
        <div className="contact-name">{c.name}</div>
        <div className="contact-sub">{c.bank} · {c.account}</div>
      </div>
    </div>
  );
}
