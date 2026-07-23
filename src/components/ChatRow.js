// Компонент: ChatRow
import {
  Video,
  Trash2,
  Pin,
  BellOff,
  Users,
  Megaphone,
  BadgeCheck,
  Bookmark,
  Search
} from "lucide-react";
import { lastPreview } from "../utils/helpers";
import { Avatar } from "./index";

export function ChatRow({ c, active, onClick, onCtx, onCall, onDelete, onAvatar, typing }) {
  const m=(c.msgs&&c.msgs.length)?c.msgs[c.msgs.length-1]:null;
  const timeLabel = c.type==="point" ? (c.topics?.[0]?.time||"") : c.isCourse ? "11.07" : (m?m.time:"");
  const Badge = c.saved?Bookmark:c.type==="groups"?Users:c.type==="channels"?Megaphone:c.type==="point"?Users:null;
  const preview = c._searchHit || lastPreview(c);
  return (
    <div className="chat-row">
      <div className={"chat-row-inner"+(active?" active":"")} onClick={onClick} onContextMenu={onCtx}>
        <div style={{ position:"relative", cursor:"pointer" }} onClick={e=>{e.stopPropagation();onAvatar&&onAvatar(c);}}>
          <Avatar name={c.name} online={c.online} size={52}/>
          {Badge && !c.online &&
            <span style={{ position:"absolute", bottom:-2, right:-2, background:"var(--card)",
              borderRadius:"50%", padding:2, display:"grid", placeItems:"center" }}>
              <Badge size={13} color="var(--sub)"/></span>}
        </div>
        <div className="chat-main">
          <div className="chat-top">
            <span className="chat-name">
              {c.pinned && <Pin size={12} color="var(--sub)"/>}
              {c.name}{c.verified && <BadgeCheck size={14} color="var(--accent)"/>}</span>
            <span className="chat-time">{timeLabel}</span>
          </div>
          <div className="chat-bottom">
            <span className={"chat-preview"+(c._searchHit?" search-hit":"")+(typing?" typing-preview":"")}>
              {typing?<><span className="typing-dots"><span/><span/><span/></span> печатает...</>:
              <>{c._searchHit&&<Search size={12}/>}{preview}</>}</span>
            <span className="chat-badges">
              {c.muted && <BellOff size={13} color="var(--sub)"/>}
              {c.unread>0 && <span className={"unread"+(c.muted?" muted":"")}>{c.unread}</span>}
            </span>
          </div>
        </div>
      </div>
      {!active &&
        <div className="swipe-actions">
          <button className="swipe-btn" style={{ background:"#e8ddf7",
            color:"#a878f0" }} onClick={(e)=>{e.stopPropagation();onCall();}}><Video size={17}/></button>
          <button className="swipe-btn" style={{ background:"#fde0e3",
            color:"var(--danger)" }} onClick={(e)=>{e.stopPropagation();onDelete();}}><Trash2 size={17}/></button>
        </div>}
    </div>
  );
}

// подсветка совпадений поиска внутри текста

