// Компонент: CallRow
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed
} from "lucide-react";
import { Avatar } from "./index";

export function CallRow({ c, onCall }) {
  const DirIcon = c.missed ? PhoneMissed : c.dir==="in" ? PhoneIncoming : PhoneOutgoing;
  const dirColor = c.missed ? "var(--danger)" : c.dir==="in" ? "var(--online)" : "var(--sub)";
  const KindIcon = c.kind==="video" ? Video : Phone;
  return (
    <div className="chat-row">
      <div className="chat-row-inner">
        <Avatar name={c.name} size={50}/>
        <div className="chat-main">
          <div className="chat-name" style={{ color: c.missed?"var(--danger)":"var(--ink)" }}>{c.name}</div>
          <div className="chat-preview" style={{ display:"flex", alignItems:"center", gap:5 }}>
            <DirIcon size={14} color={dirColor}/>
            <KindIcon size={13} color="var(--sub)"/>
            {c.kind==="video" ? "Видеозвонок" : "Аудиозвонок"}
            <span style={{ opacity:.7 }}>· {c.missed ? "Пропущенный" : c.dur ? c.dur : (c.dir==="in" ? "Входящий" : "Исходящий")}</span>
          </div>
        </div>
        <span className="call-time">{c.time}</span>
        <button className="contact-call" onClick={()=>onCall(c.kind)} title={c.kind==="video"?"Видеозвонок":"Аудиозвонок"}>
          <KindIcon size={18} color="var(--accent)"/></button>
      </div>
    </div>
  );
}

