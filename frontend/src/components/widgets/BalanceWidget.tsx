import { mockUser, formatINRFull, formatINR } from '../../data/mockData';
import { colors } from '../../design-system/tokens';

export default function BalanceWidget() {
  return (
    <div className="balance-card">
      <div className="balance-label">Available Balance</div>
      <div className="balance-amount">{formatINRFull(mockUser.balance)}</div>
      <div className="balance-acct">Savings Account · {mockUser.accountNumber}</div>
      <div className="balance-row">
        <div className="balance-stat">
          <div className="balance-stat-label">This Month Spent</div>
          <div className="balance-stat-value" style={{ color: colors.danger }}>
            {formatINR(mockUser.monthlySpend)}
          </div>
        </div>
        <div className="balance-stat">
          <div className="balance-stat-label">Saved This Month</div>
          <div className="balance-stat-value" style={{ color: colors.success }}>
            +{formatINR(mockUser.savings)}
          </div>
        </div>
      </div>
    </div>
  );
}
