export type Intent =
  | { type: 'pay'; name: string; amount?: number }
  | { type: 'pay_at'; query: string }
  | { type: 'balance' }
  | { type: 'transactions' }
  | { type: 'upcoming' }
  | { type: 'fd' }
  | { type: 'greet' }
  | { type: 'unknown' };

function parseAmount(raw: string): number | undefined {
  const cleaned = raw.replace(/[₹,\s]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? undefined : n;
}

export function parseIntent(input: string): Intent {
  const text = input.trim();

  // Pay @query
  const payAt = text.match(/^pay\s+@(\S*)/i);
  if (payAt) return { type: 'pay_at', query: payAt[1] };

  // Pay Name ₹Amount or Pay Name Amount
  const payFull = text.match(/^pay\s+([a-z\s]+?)\s+[₹₨]?([\d,]+(?:\.\d+)?)/i);
  if (payFull) {
    return { type: 'pay', name: payFull[1].trim(), amount: parseAmount(payFull[2]) };
  }

  // Pay Name (no amount)
  const payName = text.match(/^pay\s+([a-z\s]+)/i);
  if (payName) return { type: 'pay', name: payName[1].trim() };

  // Transfer
  const transfer = text.match(/^(transfer|send)\s+([a-z\s]+?)\s+[₹₨]?([\d,]+)/i);
  if (transfer) return { type: 'pay', name: transfer[2].trim(), amount: parseAmount(transfer[3]) };

  if (/\bbalance\b|\baccount\b|\bfunds\b|\bhow much\b/i.test(text)) return { type: 'balance' };
  if (/\btransaction|history|statement|spent\b/i.test(text)) return { type: 'transactions' };
  if (/\bupcoming|due|bills|remind|schedule\b/i.test(text)) return { type: 'upcoming' };
  if (/\bfd\b|fixed.?deposit|invest/i.test(text)) return { type: 'fd' };
  if (/^(hi|hello|hey|namaste|good\s+(morning|afternoon|evening))/i.test(text)) return { type: 'greet' };

  return { type: 'unknown' };
}

const genericResponses = [
  "I can help you pay someone, check your balance, view transactions, or create an FD. What would you like to do?",
  "Try: **Pay Priya ₹500**, **Check balance**, **My transactions**, or **New FD**.",
  "I'm your AI banking assistant. You can ask me anything about your account or make payments!",
];
let genericIdx = 0;

export function genericResponse(): string {
  return genericResponses[genericIdx++ % genericResponses.length];
}
