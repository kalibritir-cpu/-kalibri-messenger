// Компонент: PointTopics
import { useState } from "react";
import {
  Search,
  MoreVertical,
  ChevronLeft,
  Pin,
  BellOff,
  CheckCheck,
  Layers,
  Camera,
  Settings2,
  Users
} from "lucide-react";
import { IconBtn, TopicAvatar } from "./index";

const POINT_FILTERS = [
  { id:"all", name:"Все" },
  { id:"new", name:"Новые" },
  { id:"pdd", name:"ПДД" },
  { id:"group", name:"Группы" },
];
export function PointTopics({ chat, onBack, onOpenTopic, onProfile, onStandards, onMembers, canManage , formsBlock }) {
  const [search,setSearch]=useState("");
  const topics=chat.topics||[];
  const q=search.trim().toLowerCase();
  const list=topics.filter(t=>{
    if(q && !(t.name.toLowerCase().includes(q)||(t.preview||"").toLowerCase().includes(q))) return false;
    return true;
  });
  return (
    <>
      <div className="chat-head point-head" onClick={onProfile}>
        <button className="back-btn" onClick={e=>{e.stopPropagation();onBack();}}><ChevronLeft size={26}/></button>
        <div className="point-head-info">
          <div className="point-head-name">{chat.name}</div>
          <div className="point-head-sub">{chat.subtitle||"группа"}</div>
        </div>
        <IconBtn soft onClick={e=>{e.stopPropagation();onProfile&&onProfile();}} title="Ещё"><MoreVertical size={20}/></IconBtn>
      </div>

      <div className="point-scroll">
        {formsBlock}
        <div className="point-search">
          <div className="search-box">
            <Search size={18}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск"/>
          </div>
        </div>

        <div className="topic-list">
          {!q && <div className="topic-row feed-row" onClick={()=>onOpenTopic({_isFeed:true})}>
            <div className="feed-avatar"><Layers size={24}/></div>
            <div className="topic-main">
              <div className="topic-top">
                <span className="topic-name">Общая лента</span>
                <span className="topic-meta"><span className="topic-time"></span></span>
              </div>
              <div className="topic-bottom">
                <span className="topic-preview" style={{color:"var(--sub)"}}>Все сообщения из всех тем</span>
              </div>
            </div>
          </div>}
          {list.map(t=>(
            <div key={t.id} className="topic-row" onClick={()=>onOpenTopic(t)}>
              <TopicAvatar emoji={t.emoji} color={t.color} size={52}/>
              <div className="topic-main">
                <div className="topic-top">
                  <span className="topic-name">{t.name}</span>
                  <span className="topic-meta">
                    {t.muted && <BellOff size={14} color="var(--sub)"/>}
                    {t.status==="read" && <CheckCheck size={15} color="var(--accent)"/>}
                    <span className="topic-time">{t.time}</span>
                  </span>
                </div>
                {t.description && !t.sender && !t.preview && <div className="topic-desc">{t.description}</div>}
                {t.sender && <div className="topic-sender">{t.sender}</div>}
                <div className="topic-bottom">
                  <span className="topic-preview">{t.preview || (t.description && t.sender ? t.description : "")}{t.pinned && <Pin size={13} color="var(--sub)" style={{marginLeft:6,verticalAlign:"middle"}}/>}</span>
                  <span className="topic-badges">
                    {t.mention && <span className="topic-mention">@</span>}
                    {t.unread>0 && <span className={"unread"+(t.muted?" muted":"")}>{t.unread}</span>}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {list.length===0 && <div className="s-note" style={{margin:"24px 16px"}}>Ничего не найдено.</div>}
        </div>
      </div>
    </>
  );
}

