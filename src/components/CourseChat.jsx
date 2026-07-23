// Компонент: CourseChat
import { useState, useRef, useEffect, Fragment } from "react";
import {
  MoreVertical,
  ChevronLeft,
  X,
  Mic,
  Send,
  Pin,
  Lock,
  Reply,
  BadgeCheck,
  Paperclip,
  Hash,
  Clock,
  LayoutGrid
} from "lucide-react";
import { now, uid } from "../utils/helpers";
import { IconBtn, Message, RoundBtn } from "./index";

export function CourseChat({ chat, me, onBack, onPhotoView, stub, onProfile }) {
  const [secs,setSecs]=useState(()=> (chat.feed||[]).map(s=>({ ...s, msgs:s.msgs.map(m=>({...m})) })));
  const [tab,setTab]=useState("all");
  const [draft,setDraft]=useState("");
  const [reply,setReply]=useState(null);
  const [pinned,setPinned]=useState(chat.pinnedText);
  const endRef=useRef(null);
  useEffect(()=>{ endRef.current?.scrollIntoView(); },[tab,secs]);

  if(!chat) return null;
  const writableSec = secs.find(s=>s.writable);
  // писать можно только в разрешённые разделы; на «Все» пишем в болталку
  const target = tab==="all" ? writableSec?.id : (secs.find(s=>s.id===tab)?.writable ? tab : null);
  const targetSec = secs.find(s=>s.id===target);
  const canWrite = !!targetSec;

  // построить ленту: для «Все» — все разделы подряд; иначе — раздел
  const feedItems=[];
  const pushSec=(s)=>{ s.msgs.forEach(m=> feedItems.push({ ...m, _sec:s.id })); };
  if(tab==="all") secs.forEach(pushSec); else { const s=secs.find(x=>x.id===tab); if(s) pushSec(s); }

  const react=(secId,mid,emoji)=> setSecs(prev=> prev.map(s=> s.id!==secId? s : { ...s,
    msgs:s.msgs.map(m=>{ if(m.id!==mid) return m; const r={...(m.reactions||{})}; const mk=emoji+"__me";
      if(r[mk]){ r[emoji]=Math.max(0,(r[emoji]||1)-1); delete r[mk]; if(!r[emoji])delete r[emoji]; }
      else { r[emoji]=(r[emoji]||0)+1; r[mk]=true; } return {...m,reactions:r}; }) }));
  const del=(secId,mid)=> setSecs(prev=> prev.map(s=> s.id!==secId? s : { ...s, msgs:s.msgs.filter(m=>m.id!==mid) }));
  const send=()=>{ const t=draft.trim(); if(!t||!target) return;
    const nm={ id:uid(), out:true, sender:"Вы", t, time:now(), status:"sent",
      replyTo: reply? { name:reply.out?"Вы":(reply.sender||"—"), text:(reply.t||"").slice(0,60) } : undefined };
    setSecs(prev=> prev.map(s=> s.id!==target? s : { ...s, msgs:[...s.msgs, nm] }));
    setDraft(""); setReply(null);
  };

  let lastDay=null;
  return (
    <>
      <div className="chat-head course-head" style={{ cursor:"default" }}>
        <button className="back-btn course-back" onClick={onBack}>
          <ChevronLeft size={24}/>{chat.unread>0 && <span className="back-badge">{chat.unread}</span>}</button>
        <div className="course-head-info">
          <div className="course-head-name">{chat.name}{chat.verified && <BadgeCheck size={16} color="var(--accent)"/>}</div>
          <div className="course-head-sub">{chat.subtitle||`${chat.members} участников`}</div>
        </div>
        <IconBtn soft onClick={onProfile||stub}><MoreVertical size={20}/></IconBtn>
      </div>

      <div className="course-tabs">
        <button className="ctab-grid" title="Разделы"><LayoutGrid size={20}/></button>
        <button className={"ctab"+(tab==="all"?" on":"")} onClick={()=>setTab("all")}>Все</button>
        {secs.map(s=>
          <button key={s.id} className={"ctab"+(tab===s.id?" on":"")} onClick={()=>setTab(s.id)}>
            {s.id==="ann" ? <Hash size={15}/> : <span className="ctab-emoji">{s.emoji}</span>}
            {s.name}{s.alert && <span className="ctab-alert">❗</span>}
          </button>)}
      </div>

      {pinned &&
        <div className="pinned-bar">
          <span className="pin-ic"><Pin size={15} fill="currentColor"/></span>
          <div className="pin-body">
            <div className="pin-title">Закреплённое сообщение</div>
            <div className="pin-text">🔔 {pinned}</div>
          </div>
          <IconBtn onClick={()=>setPinned(null)} title="Открепить"><X size={18}/></IconBtn>
        </div>}

      <div className="msgs course-msgs">
        {feedItems.map((m,i)=>{
          const showDay = m.day && m.day!==lastDay; if(m.day) lastDay=m.day;
          return (
            <Fragment key={m.id}>
              {showDay && <div className="day-chip">{m.day}</div>}
              {m.service
                ? <div className="service-msg">{m.t}</div>
                : <Message msg={m} chat={chat} me={me}
                    onReply={setReply} onDelete={(id)=>del(m._sec,id)}
                    onPhoto={onPhotoView||(()=>{})} onStub={stub}
                    onReact={(id,e)=>react(m._sec,id,e)} onForward={()=>{}}
                    onPin={()=>{}} onInfo={()=>{}}/>}
            </Fragment>
          );
        })}
        {feedItems.length===0 && <div className="s-note" style={{margin:"24px auto"}}>В этом разделе пока нет сообщений.</div>}
        <div ref={endRef}/>
      </div>

      {reply &&
        <div className="reply-bar">
          <Reply size={20} color="var(--accent)"/>
          <div className="reply-bar-body">
            <div className="reply-bar-name">{reply.out?"Вы":(reply.sender||"—")}</div>
            <div className="reply-bar-text">{(reply.t||"").split("\n")[0]}</div>
          </div>
          <IconBtn onClick={()=>setReply(null)}><X size={20}/></IconBtn>
        </div>}

      {canWrite ?
        <div className="composer">
          <RoundBtn variant="soft" onClick={stub}><Paperclip size={20}/></RoundBtn>
          <div className="input-pill">
            <textarea rows={1} value={draft} placeholder={`Написать в «${targetSec?.name||"раздел"}»...`}
              onChange={e=>setDraft(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); } }}/>
            <button className="emoji-btn-inline" onClick={stub}><Clock size={20}/></button>
          </div>
          {draft.trim()
            ? <RoundBtn onClick={send}><Send size={20}/></RoundBtn>
            : <RoundBtn variant="soft" onClick={stub}><Mic size={20}/></RoundBtn>}
        </div>
      :
        <div className="composer-locked">
          <Lock size={17}/>
          <span>Только администраторы могут писать здесь{writableSec?` · для общения откройте «${writableSec.name}»`:""}</span>
        </div>}
    </>
  );
}

