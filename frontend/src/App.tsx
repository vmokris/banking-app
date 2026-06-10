import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, PaymentState, FDState, FlowAction } from './types';
import { parseIntent, genericResponse } from './utils/chatParser';
import { searchContacts, mockUpcoming, calcMaturity } from './data/mockData';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import QuickChips from './components/QuickChips';
import BalanceWidget from './components/widgets/BalanceWidget';
import TransactionsWidget from './components/widgets/TransactionsWidget';
import UpcomingWidget from './components/widgets/UpcomingWidget';
import PaymentCard from './components/flows/PaymentCard';
import FDCard from './components/flows/FDCard';

let msgCounter = 0;
function uid() { return `m${++msgCounter}`; }
function txRef() { return `TXN${Date.now().toString(36).toUpperCase()}`; }

function formatTime(d: Date) {
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addMsg = useCallback((msg: Omit<ChatMessage, 'id' | 'time'>) => {
    const full = { ...msg, id: uid(), time: new Date() } as ChatMessage;
    setMessages(prev => [...prev, full]);
    return full.id;
  }, []);

  const updateMsg = useCallback((id: string, updater: (m: ChatMessage) => ChatMessage) => {
    setMessages(prev => prev.map(m => m.id === id ? updater(m) : m));
  }, []);

  // Initial greeting + proactive suggestion
  useEffect(() => {
    const soonPayment = mockUpcoming.find(p => p.dueInDays <= 3);
    addMsg({ kind: 'text', role: 'ai', text: "Hi Ananya! 👋 I'm your AI banking assistant. How can I help you today?" });
    if (soonPayment) {
      setTimeout(() => {
        addMsg({
          kind: 'suggestion',
          text: `Reminder: **${soonPayment.name}** of **₹${soonPayment.amount.toLocaleString('en-IN')}** is due in ${soonPayment.dueInDays} days. Want me to pay it now?`,
          paymentName: soonPayment.name,
          amount: soonPayment.amount,
        });
      }, 600);
    }
  }, [addMsg]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  async function handleSend(text: string) {
    addMsg({ kind: 'text', role: 'user', text });
    setIsTyping(true);
    await delay(600 + Math.random() * 400);
    setIsTyping(false);
    await processIntent(text);
  }

  async function processIntent(text: string) {
    const intent = parseIntent(text);

    switch (intent.type) {
      case 'balance':
        addMsg({ kind: 'text', role: 'ai', text: "Here's your current account summary:" });
        addMsg({ kind: 'widget', widget: 'balance' });
        break;

      case 'transactions':
        addMsg({ kind: 'text', role: 'ai', text: "Here are your recent transactions:" });
        addMsg({ kind: 'widget', widget: 'transactions' });
        break;

      case 'upcoming':
        addMsg({ kind: 'text', role: 'ai', text: "Here are your upcoming payments:" });
        addMsg({ kind: 'widget', widget: 'upcoming' });
        break;

      case 'fd':
        addMsg({ kind: 'text', role: 'ai', text: "Great idea! I've analysed current rates. The **3-year FD at 7.5% p.a.** gives the best returns. Pick a tenure:" });
        addMsg({ kind: 'fd', state: { step: 'select_tenure' } });
        break;

      case 'pay_at': {
        addMsg({ kind: 'text', role: 'ai', text: "Sure, let me pull up your contacts:" });
        addMsg({ kind: 'payment', state: { step: 'search', query: intent.query, matches: [] } });
        break;
      }

      case 'pay': {
        const matches = searchContacts(intent.name);
        if (matches.length === 0) {
          addMsg({ kind: 'text', role: 'ai', text: `I couldn't find "${intent.name}" in your contacts. Try **Pay @** to search by UPI or bank details.` });
        } else if (matches.length === 1) {
          if (intent.amount) {
            addMsg({ kind: 'text', role: 'ai', text: `Found **${matches[0].name}** on ${matches[0].bank}. Please confirm:` });
            addMsg({ kind: 'payment', state: { step: 'confirm', query: intent.name, matches, selected: matches[0], amount: intent.amount } });
          } else {
            addMsg({ kind: 'text', role: 'ai', text: `Found **${matches[0].name}** on ${matches[0].bank}. How much would you like to send?` });
            addMsg({ kind: 'payment', state: { step: 'enter_amount', query: intent.name, matches, selected: matches[0] } });
          }
        } else {
          addMsg({ kind: 'text', role: 'ai', text: `Found ${matches.length} people matching **"${intent.name}"**. Who would you like to pay?` });
          addMsg({ kind: 'payment', state: { step: 'select', query: intent.name, matches, amount: intent.amount } });
        }
        break;
      }

      case 'greet':
        addMsg({ kind: 'text', role: 'ai', text: "Hello! 👋 What can I do for you today? You can pay someone, check your balance, view transactions, or create an FD." });
        break;

      default:
        addMsg({ kind: 'text', role: 'ai', text: genericResponse() });
    }
  }

  function handleFlowAction(msgId: string, action: FlowAction) {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;

      if (m.kind === 'payment') {
        return handlePayAction(m.state, action, msgId);
      }
      if (m.kind === 'fd') {
        return handleFDAction(m.state, action, msgId);
      }
      return m;
    }));
  }

  function handlePayAction(state: PaymentState, action: FlowAction, msgId: string): ChatMessage {
    if (action.kind === 'cancel') {
      setTimeout(() => addMsg({ kind: 'text', role: 'ai', text: "Payment cancelled. Anything else I can help with?" }), 100);
      return { id: msgId, time: new Date(), kind: 'payment', state: { ...state, step: 'success', txRef: '' } } as ChatMessage;
    }

    if (action.kind === 'select_contact') {
      if (state.amount) {
        return { id: msgId, time: new Date(), kind: 'payment', state: { ...state, step: 'confirm', selected: action.contact } } as ChatMessage;
      }
      return { id: msgId, time: new Date(), kind: 'payment', state: { ...state, step: 'enter_amount', selected: action.contact } } as ChatMessage;
    }

    if (action.kind === 'set_amount') {
      return { id: msgId, time: new Date(), kind: 'payment', state: { ...state, step: 'confirm', amount: action.amount } } as ChatMessage;
    }

    if (action.kind === 'confirm_payment') {
      const ref = txRef();
      setTimeout(() => {
        addMsg({ kind: 'text', role: 'ai', text: `✅ Done! ₹${state.amount?.toLocaleString('en-IN')} sent to ${state.selected?.name}. Ref: **${ref}**` });
      }, 300);
      return { id: msgId, time: new Date(), kind: 'payment', state: { ...state, step: 'success', txRef: ref } } as ChatMessage;
    }

    return { id: msgId, time: new Date(), kind: 'payment', state } as ChatMessage;
  }

  function handleFDAction(state: FDState, action: FlowAction, msgId: string): ChatMessage {
    if (action.kind === 'cancel') {
      setTimeout(() => addMsg({ kind: 'text', role: 'ai', text: "FD creation cancelled. Anything else I can help with?" }), 100);
      return { id: msgId, time: new Date(), kind: 'fd', state: { ...state, step: 'success', txRef: '' } } as ChatMessage;
    }

    if (action.kind === 'select_tenure') {
      return { id: msgId, time: new Date(), kind: 'fd', state: { ...state, step: 'enter_amount', selectedRate: action.rate } } as ChatMessage;
    }

    if (action.kind === 'set_fd_amount') {
      return { id: msgId, time: new Date(), kind: 'fd', state: { ...state, step: 'confirm', amount: action.amount } } as ChatMessage;
    }

    if (action.kind === 'confirm_fd') {
      const ref = txRef();
      const maturity = calcMaturity(state.amount!, state.selectedRate!.rate, state.selectedRate!.tenureDays);
      setTimeout(() => {
        addMsg({ kind: 'text', role: 'ai', text: `🎉 FD created! ₹${state.amount?.toLocaleString('en-IN')} locked for ${state.selectedRate?.label} @ ${state.selectedRate?.rate}%. Matures to **₹${maturity.toLocaleString('en-IN')}**.` });
      }, 300);
      return { id: msgId, time: new Date(), kind: 'fd', state: { ...state, step: 'success', maturity, txRef: ref } } as ChatMessage;
    }

    return { id: msgId, time: new Date(), kind: 'fd', state } as ChatMessage;
  }

  function handleSuggestionPay(name: string | undefined, amount: number | undefined) {
    if (!name || !amount) return;
    const text = `Pay ${name} ₹${amount.toLocaleString('en-IN')}`;
    addMsg({ kind: 'text', role: 'user', text });
    setIsTyping(true);
    delay(600).then(() => { setIsTyping(false); processIntent(text); });
  }

  const showChips = messages.filter(m => m.kind === 'text' && (m as {role:string}).role === 'user').length === 0;

  return (
    <div className="app">
      <Header onNotifClick={() => handleSend('Show upcoming payments')} />
      <div className="chat-area">
        {messages.map(msg => (
          <MessageRow
            key={msg.id}
            msg={msg}
            onFlowAction={(a) => handleFlowAction(msg.id, a)}
            onSuggestionYes={handleSuggestionPay}
            onSuggestionNo={() => addMsg({ kind: 'text', role: 'ai', text: "Got it! Let me know when you need anything." })}
          />
        ))}
        {showChips && (
          <div className="widget-wrap" style={{ marginLeft: 0 }}>
            <QuickChips onChip={handleSend} />
          </div>
        )}
        {isTyping && (
          <div className="msg-row">
            <div className="msg-ai-avatar">✦</div>
            <div className="typing-indicator">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}

// ── Message row renderer ──────────────────────────────────────────────────────

interface MsgRowProps {
  msg: ChatMessage;
  onFlowAction: (a: FlowAction) => void;
  onSuggestionYes: (name?: string, amount?: number) => void;
  onSuggestionNo: () => void;
}

function MessageRow({ msg, onFlowAction, onSuggestionYes, onSuggestionNo }: MsgRowProps) {
  if (msg.kind === 'text') {
    const isUser = msg.role === 'user';
    return (
      <div className={`msg-row ${isUser ? 'user' : ''}`}>
        {!isUser && <div className="msg-ai-avatar">✦</div>}
        <div>
          <div className={`bubble ${isUser ? 'user' : 'ai'}`}>
            <RichText text={msg.text} />
          </div>
          <div className="msg-time">{formatTime(msg.time)}</div>
        </div>
      </div>
    );
  }

  if (msg.kind === 'widget') {
    return (
      <div className="widget-wrap">
        {msg.widget === 'balance'      && <BalanceWidget />}
        {msg.widget === 'transactions' && <TransactionsWidget />}
        {msg.widget === 'upcoming'     && <UpcomingWidget />}
      </div>
    );
  }

  if (msg.kind === 'payment') {
    return (
      <div className="widget-wrap">
        <PaymentCard state={msg.state} onAction={onFlowAction} />
      </div>
    );
  }

  if (msg.kind === 'fd') {
    return (
      <div className="widget-wrap">
        <FDCard state={msg.state} onAction={onFlowAction} />
      </div>
    );
  }

  if (msg.kind === 'suggestion') {
    return (
      <div className="widget-wrap" style={{ marginLeft: 0 }}>
        <div className="suggestion-banner">
          <div className="suggestion-icon">💡</div>
          <div className="suggestion-text">
            <RichText text={msg.text} />
            <div className="suggestion-actions">
              <button className="suggestion-btn yes" onClick={() => onSuggestionYes(msg.paymentName, msg.amount)}>
                Yes, pay now
              </button>
              <button className="suggestion-btn no" onClick={onSuggestionNo}>
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i}>{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
