// Компонент: PointView
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  MapPin
} from "lucide-react";

export function PointView({ point, onBack, onOpen }) {
  if(!point) return (
    <div className="empty"><MapPin size={64} color="var(--sub)"/>
      <div className="empty-hint">Точка не назначена вашему аккаунту</div></div>
  );
  return (
    <>
      <div className="chat-head" style={{ cursor:"default" }}>
        <button className="back-btn" onClick={onBack}><ChevronLeft size={26}/></button>
        <div className="chat-head-info">
          <div className="chat-head-name">Моя точка</div>
          <div className="chat-head-status">филиал вашего аккаунта</div>
        </div>
      </div>
      <div className="sections-scroll">
        <div className="point-hero">
          <div className="point-hero-ic"><MapPin size={40}/></div>
          <div className="point-hero-name">{point.name}</div>
          <div className="point-hero-addr">{point.address}</div>
          <span className={"point-badge"+(point.online?" on":"")}>
            {point.online?"● Открыта":"○ Закрыта"}</span>
        </div>
        <div className="s-card">
          <div className="s-row" onClick={onOpen}>
            <span className="s-ic"><MessageCircle size={20}/></span>
            <span className="s-label">Открыть чат точки</span>
            <ChevronRight size={18} color="var(--sub)"/>
          </div>
          <div className="s-row">
            <span className="s-ic"><MapPin size={20}/></span>
            <span className="s-label">Адрес</span>
            <span className="s-val">{point.address}</span>
          </div>
        </div>
        <div className="s-note">Ваша точка закреплена за аккаунтом и не может быть изменена вручную.</div>
      </div>
    </>
  );
}

