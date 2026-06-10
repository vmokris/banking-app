import { useState, useRef } from 'react';
import type { FDState, FlowAction } from '../../types';
import { fdRates, formatINRFull, calcMaturity } from '../../data/mockData';

interface Props {
  state: FDState;
  onAction: (a: FlowAction) => void;
}

export default function FDCard({ state, onAction }: Props) {
  const [amtInput, setAmtInput] = useState(state.amount ? String(state.amount) : '');
  const inputRef = useRef<HTMLInputElement>(null);

  if (state.step === 'success') {
    return (
      <div className="flow-card">
        <div className="success-wrap">
          <div className="success-icon" style={{ background: 'rgba(108,99,255,0.15)', border: '2px solid rgba(108,99,255,0.3)' }}>
            🏦
          </div>
          <div className="success-title">FD Created!</div>
          <div className="success-sub">
            {formatINRFull(state.amount!)} @ {state.selectedRate!.rate}% for {state.selectedRate!.label}
          </div>
          <div style={{ fontSize: 13, color: '#00C896', marginTop: 4 }}>
            Matures to {formatINRFull(state.maturity!)}
          </div>
          <div className="success-ref">Ref: {state.txRef}</div>
        </div>
      </div>
    );
  }

  if (state.step === 'confirm') {
    const r = state.selectedRate!;
    const maturity = calcMaturity(state.amount!, r.rate, r.tenureDays);
    const interest = maturity - state.amount!;
    return (
      <div className="flow-card">
        <div className="flow-header"><span>🏦</span> Confirm FD</div>
        <div className="confirm-section">
          <div className="confirm-row">
            <span className="confirm-label">Principal</span>
            <span className="confirm-value">{formatINRFull(state.amount!)}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-label">Tenure</span>
            <span className="confirm-value">{r.label}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-label">Interest Rate</span>
            <span className="confirm-value" style={{ color: '#A89EFF' }}>{r.rate}% p.a.</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-label">Interest Earned</span>
            <span className="confirm-value" style={{ color: '#00C896' }}>+{formatINRFull(interest)}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-label">Maturity Amount</span>
            <span className="confirm-value" style={{ fontSize: 18, fontWeight: 700 }}>{formatINRFull(maturity)}</span>
          </div>
        </div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => onAction({ kind: 'cancel' })}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onAction({ kind: 'confirm_fd' })}>Create FD</button>
        </div>
      </div>
    );
  }

  if (state.step === 'enter_amount') {
    const r = state.selectedRate!;
    const previewMaturity = amtInput && parseFloat(amtInput) > 0
      ? calcMaturity(parseFloat(amtInput), r.rate, r.tenureDays)
      : null;
    return (
      <div className="flow-card">
        <div className="flow-header"><span>💰</span> Enter Amount — {r.label} @ {r.rate}%</div>
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
              if (e.key === 'Enter' && parseFloat(amtInput) >= 1000) {
                onAction({ kind: 'set_fd_amount', amount: parseFloat(amtInput) });
              }
            }}
            autoFocus
          />
        </div>
        {previewMaturity && (
          <div style={{ padding: '0 16px 12px', fontSize: 12, color: '#00C896' }}>
            Matures to {formatINRFull(previewMaturity)} after {r.label}
          </div>
        )}
        {amtInput && parseFloat(amtInput) < 1000 && (
          <div style={{ padding: '0 16px 8px', fontSize: 12, color: '#FF5C6A' }}>
            Minimum FD amount is ₹1,000
          </div>
        )}
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => onAction({ kind: 'cancel' })}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!amtInput || parseFloat(amtInput) < 1000}
            onClick={() => onAction({ kind: 'set_fd_amount', amount: parseFloat(amtInput) })}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // select_tenure
  return (
    <div className="flow-card">
      <div className="flow-header"><span>📊</span> Select Tenure</div>
      <div className="rate-grid">
        {fdRates.map(r => (
          <div
            key={r.tenureDays}
            className={`rate-row ${r.isBest ? 'best' : ''}`}
            onClick={() => onAction({ kind: 'select_tenure', rate: r })}
          >
            <div>
              <div className="rate-tenure">{r.label}</div>
              {r.isBest && <div className="rate-maturity">AI Recommended</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="rate-pct">{r.rate}%</div>
              {r.isBest && <span className="rate-badge">Best</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
