interface Props { onChip: (text: string) => void; }

const CHIPS = [
  { label: '💰 Check Balance',    text: 'Check my balance' },
  { label: '💸 Pay Someone',      text: 'Pay @' },
  { label: '🏦 New FD',           text: 'Create a fixed deposit' },
  { label: '📋 Transactions',     text: 'Show my transactions' },
  { label: '📅 Upcoming Bills',   text: 'Show upcoming payments' },
];

export default function QuickChips({ onChip }: Props) {
  return (
    <div className="chips-wrap">
      {CHIPS.map(c => (
        <button key={c.label} className="chip" onClick={() => onChip(c.text)}>
          {c.label}
        </button>
      ))}
    </div>
  );
}
