import { mockUser, formatINR } from '../data/mockData';

interface Props { onNotifClick: () => void; }

export default function Header({ onNotifClick }: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="header">
      <div className="header-left">
        <div className="avatar">{mockUser.initials}</div>
        <div>
          <div className="header-name">{mockUser.name.split(' ')[0]}</div>
          <div className="header-greeting">{greeting} 👋</div>
        </div>
      </div>
      <div className="header-right">
        <div className="balance-pill">{formatINR(mockUser.balance)}</div>
        <div className="icon-btn" onClick={onNotifClick} title="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
      </div>
    </header>
  );
}
