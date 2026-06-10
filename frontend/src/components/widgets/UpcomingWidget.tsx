import { mockUpcoming, formatINRFull } from '../../data/mockData';

export default function UpcomingWidget() {
  return (
    <div className="widget-card">
      <div className="widget-header">Upcoming Payments</div>
      {mockUpcoming.map(p => (
        <div className="upcoming-item" key={p.id}>
          <div className="txn-icon" style={{ background: p.bgColor }}>{p.emoji}</div>
          <div className="txn-details">
            <div className="txn-name">{p.name}</div>
            <div className="txn-date">{formatINRFull(p.amount)}</div>
          </div>
          <span className={`due-badge ${p.dueInDays <= 5 ? 'due-soon' : 'due-later'}`}>
            {p.dueInDays === 1 ? 'Tomorrow' : `In ${p.dueInDays}d`}
          </span>
        </div>
      ))}
    </div>
  );
}
