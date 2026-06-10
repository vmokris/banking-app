import { mockTransactions, formatINRFull } from '../../data/mockData';
import { colors } from '../../design-system/tokens';

export default function TransactionsWidget() {
  return (
    <div className="widget-card">
      <div className="widget-header">Recent Transactions</div>
      {mockTransactions.map(txn => (
        <div className="txn-item" key={txn.id}>
          <div className="txn-icon" style={{ background: txn.bgColor }}>
            {txn.emoji}
          </div>
          <div className="txn-details">
            <div className="txn-name">{txn.name}</div>
            <div className="txn-date">{txn.date}</div>
          </div>
          <div className={`txn-amount ${txn.type}`}>
            {txn.type === 'credit' ? '+' : '−'}{formatINRFull(txn.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
