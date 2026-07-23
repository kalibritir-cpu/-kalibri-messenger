// Компонент: Message
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Pin,
  PinOff,
  Check,
  CheckCheck,
  Play,
  Pause,
  Forward,
  Reply,
  SmilePlus,
  Trash2,
  FileText,
  Download,
  PencilLine,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Wrench,
  Link2,
  MessageSquare,
  CornerDownRight,
  EyeOff,
  Circle,
  CircleCheckBig,
  Share2,
  ChevronDown
,
  Paperclip
,
  Users
,
  Headphones
} from "lucide-react";
import { highlight } from "../utils/helpers";
import { REACTIONS } from "../constants";

/* ── Подсветка @упоминаний в тексте ── */
function renderMentions(text) {
  if (!text) return text;
  const str = String(text);
  const parts = str.split(/(@[А-Яа-яЁёA-Za-z0-9 ]+?)(?=\s|$|[.,!?;:])/g);
  return parts.map((p, i) =>
    p.startsWith("@")
      ? <span key={i} className="mention-hl">{p}</span>
      : p
  );
}

function highlightWithMentions(text, q) {
  if (q) return highlight(text, q);
  return renderMentions(text);
}

/* ── Карточка проблемы внутри сообщения ── */
const PRIORITY_CFG = {
  high:   { label:"Высокий", color:"#f0616d", bg:"#fef0f1", icon:AlertTriangle },
  medium: { label:"Средний", color:"#e8a838", bg:"#fef9ec", icon:AlertTriangle },
  low:    { label:"Низкий",  color:"#25d10a", bg:"#eef4ff", icon:AlertTriangle },
};
const STATUS_PC = {
  open:     { label:"Открыта", color:"#e8a838", bg:"#fef9ec" },
  resolved: { label:"Решена",  color:"#25d10a", bg:"#eefbe9" },
};
function ReportCardBubble({ rc }) {
  const checked = rc.status === "checked";
  const stColor = checked ? "#25d10a" : "#f0b429";
  const stBg = checked ? "rgba(37,209,10,.14)" : "rgba(240,180,41,.16)";
  return (
    <div className="rcard" style={{ borderLeft:`3px solid ${rc.color||"#a878f0"}` }}>
      <div className="rcard-head">
        <span className="rcard-emoji">{rc.emoji||"📋"}</span>
        <span className="rcard-title">{rc.title}</span>
        <span className="rcard-status" style={{ background:stBg, color:stColor }}>
          {checked ? <><CheckCircle2 size={11}/> Проверен</> : <><Clock size={11}/> Не проверен</>}
        </span>
      </div>
      {rc.subtitle && <div className="rcard-sub">{rc.subtitle}</div>}
      <div className="rcard-body">
        {rc.employee && <div className="rcard-row"><User size={13}/><span>{rc.employee}</span></div>}
        {rc.point && <div className="rcard-row"><MapPin size={13}/><span>{rc.point}</span></div>}
        {rc.time && <div className="rcard-row"><Clock size={13}/><span>{rc.time}</span></div>}
        {(rc.photoCount>0 || rc.videoCount>0) &&
          <div className="rcard-row">
            <Paperclip size={13}/>
            <span>{[rc.photoCount>0?`фото ${rc.photoCount}`:null, rc.videoCount>0?`видео ${rc.videoCount}`:null].filter(Boolean).join(" · ")}</span>
          </div>}
      </div>
      {rc.fields?.length>0 &&
        <div className="rcard-fields">
          {rc.fields.map((f,i)=>
            <div key={i} className="rcard-field">
              <span className="rcard-field-label">{f.label}</span>
              <span className="rcard-field-value">{f.value}</span>
            </div>)}
        </div>}
      {rc.comment && <div className="rcard-desc">{rc.comment}</div>}
      {checked && rc.checkedBy && <div className="rcard-checked"><CheckCircle2 size={13} color="#25d10a"/><span>Проверил: {rc.checkedBy}</span></div>}
    </div>
  );
}

function ProblemCardBubble({ pc }) {
  const pr = PRIORITY_CFG[pc.priority] || PRIORITY_CFG.medium;
  const st = STATUS_PC[pc.status] || STATUS_PC.open;
  const PrIcon = pr.icon;
  return (
    <div className="pcard" style={{ borderLeft:`3px solid ${pr.color}` }}>
      <div className="pcard-head">
        <Wrench size={16} color={pr.color}/>
        <span className="pcard-title">{pc.title}</span>
        <span className="pcard-status" style={{ background:st.bg, color:st.color }}>{st.label}</span>
      </div>
      <div className="pcard-body">
        <div className="pcard-row"><MapPin size={13}/><span>{pc.point}</span></div>
        <div className="pcard-row"><PrIcon size={13} color={pr.color}/><span style={{color:pr.color, fontWeight:600}}>{pr.label} приоритет</span></div>
        {pc.assignee && <div className="pcard-row"><User size={13}/><span>{pc.assignee}</span></div>}
        {pc.created && <div className="pcard-row"><Clock size={13}/><span>Создана: {pc.created}</span></div>}
        {pc.resolved && <div className="pcard-row"><CheckCircle2 size={13} color="#25d10a"/><span>Решена: {pc.resolved}</span></div>}
      </div>
      {pc.description && <div className="pcard-desc">{pc.description}</div>}
      {pc.solution && <div className="pcard-solution"><CheckCircle2 size={13} color="#25d10a"/><span>{pc.solution}</span></div>}
    </div>
  );
}

export function Message({ msg, chat, me, onReply, onDelete, onPhoto, onStub, onReact, onForward, onPin, onInfo, onEdit, onCopy, onCopyLink, onComment, commentsEnabled,
  query, isMatch, mRef, selecting, selected, onSelect, onReactionsDetail, onVoiceListened, onVoiceListeners }) {
  const [ctxOpen,setCtxOpen]=useState(false);   // контекстное меню (bottom sheet)
  const [emojiExpanded,setEmojiExpanded]=useState(false); // развёрнутые смайлики
  const [playingLocal,setPlayingLocal]=useState(false);
  const playing = voicePlayingId===msg.id || playingLocal;
  const setPlaying = setPlayingLocal;
  const [voiceProg,setVoiceProg]=useState(0); // 0..1
  const voiceTimer=useRef(null);
  const wrapRef=useRef(null);
  const lp=useRef(null);
  const startLP=()=>{ if(selecting) return; lp.current=setTimeout(()=>{ setCtxOpen(true); }, 400); };
  const cancelLP=()=>{ if(lp.current){ clearTimeout(lp.current); lp.current=null; } };

  // Удалять сообщения: в личных чатах — своё; в группах/каналах/точке — только админ или владелец
  const isGroupLike = chat.type==="groups"||chat.type==="channels"||chat.type==="point"||chat.isCourse;
  const myRole = chat.roster?.find(x=>x.isMe)?.role;
  const canDelete = isGroupLike ? (myRole==="owner"||myRole==="admin") : msg.out;

  // Воспроизведение голосового (эмуляция)
  const audioEl=useRef(null);
  const toggleVoice=()=>{
    // Если есть реальный аудиофайл — проигрываем его
    if(msg.voiceSrc && onPlayVoice){ onPlayVoice(msg); return; }
    if(msg.voiceSrc){
      if(!audioEl.current){
        audioEl.current=new Audio(msg.voiceSrc);
        audioEl.current.ontimeupdate=()=>{
          const d=audioEl.current.duration||1;
          setVoiceProg(audioEl.current.currentTime/d);
        };
        audioEl.current.onended=()=>{ setPlaying(false); setVoiceProg(0); onVoiceListened && onVoiceListened(msg.id); };
      }
      if(playing){ audioEl.current.pause(); setPlaying(false); }
      else { audioEl.current.play().catch(()=>{}); setPlaying(true); }
      return;
    }
    if(playing){ clearInterval(voiceTimer.current); setPlaying(false); return; }
    const parts=(msg.voice||"0:05").split(":").map(Number);
    const totalSec=(parts[0]||0)*60+(parts[1]||5);
    const step=100;
    let elapsed=voiceProg*totalSec*1000;
    setPlaying(true);
    voiceTimer.current=setInterval(()=>{
      elapsed+=step;
      const p=elapsed/(totalSec*1000);
      if(p>=1){ clearInterval(voiceTimer.current); setPlaying(false); setVoiceProg(0); onVoiceListened && onVoiceListened(msg.id); return; }
      setVoiceProg(p);
    },step);
  };
  useEffect(()=>()=>{ clearInterval(voiceTimer.current); if(audioEl.current) audioEl.current.pause(); },[]);

  let content;
  if(msg.reportCard){
    content=<ReportCardBubble rc={msg.reportCard}/>;
  } else if(msg.problemCard){
    content=<ProblemCardBubble pc={msg.problemCard}/>;
  } else if(msg.photo){
    content=<><img src={msg.photo} onClick={()=>onPhoto(msg.photo)} alt=""/>{msg.raw&&<span className="raw-tag">без сжатия</span>}{msg.t&&<div style={{marginTop:4}}>{highlightWithMentions(msg.t,query)}</div>}</>;
  } else if(msg.video){
    content=<div className="msg-video">
      <video src={msg.video} controls preload="metadata"/>
      {msg.raw&&<span className="raw-tag">без сжатия</span>}
      {msg.t&&<div style={{marginTop:4}}>{highlightWithMentions(msg.t,query)}</div>}
    </div>;
  } else if(msg.file){
    content=<div className="msg-file">
      <span className="file-ic"><FileText size={22}/></span>
      <div className="file-meta">
        <div className="file-name">{msg.file.name}</div>
        <div className="file-size">{msg.file.size}{msg.raw?" · без сжатия":""}</div>
      </div>
      <a className="file-dl" href={msg.file.data} download={msg.file.name} onClick={e=>e.stopPropagation()}><Download size={18}/></a>
    </div>;
  } else if(msg.voice){
    const bars=Array.from({length:26}).map((_,i)=>{
      const h=(25+Math.abs(Math.sin(i*1.3))*70);
      const filled = i/26 <= voiceProg;
      return <span key={i} className={filled?"bar filled":"bar"} style={{ height:h+"%" }}/>;
    });
    content=<div className="voice">
      <div className={"voice-play"+(playing?" active":"")} onClick={toggleVoice}>
        {playing?<Pause size={16} fill="currentColor"/>:<Play size={16} fill="currentColor"/>}
      </div>
      <div className="wave">{bars}</div>
      <span style={{fontSize:12,opacity:.8}}>{msg.voice}</span>
      {(msg.listeners||[]).length>0 && onVoiceListeners &&
        <button className="voice-heard" title="Кто прослушал"
          onClick={(e)=>{ e.stopPropagation(); onVoiceListeners(msg); }}>
          <CheckCheck size={13}/><i>{(msg.listeners||[]).length}</i>
        </button>}
    </div>;
  } else { content=highlightWithMentions(msg.t,query); }
  const reactions = msg.reactions || {};
  const reactKeys = Object.keys(reactions).filter(k=>!k.endsWith("__me") && reactions[k]>0);

  const handleClick=()=>{
    if(selecting && onSelect) onSelect(msg.id);
  };

  const ALL_EMOJI = ["👍","❤️","🔥","🎉","👏","💯","✅","🙏","😊","😍","🥰","🤩","🥳","😎","🤝","💪","✨","⭐","🏆","🥇","🚀","⚡","💡","🎯","🍀","🌟","💚","💙","💜","🧡","😂","🤗"];
  // Действие из контекстного меню
  const ctxAct=(fn)=>{ setCtxOpen(false); setEmojiExpanded(false); fn(); };

  return (
    <div className={"msg-wrap "+(msg.out?"out":"in")+(selecting?" selecting":"")+(selected?" selected":"")}
      ref={el=>{ wrapRef.current=el; mRef&&mRef(el); }}
      onClick={handleClick}>
      {msg.forwarded &&
        <div className="fwd-label"><Forward size={12}/> Переслано от <b>{msg.forwarded}</b></div>}

      <div className="msg-row">
        <div className={"bubble "+(msg.out?"out":"in")+(msg.photo?" photo":"")+(isMatch?" match":"")}
          onClick={e=>{if(!selecting){e.stopPropagation();setCtxOpen(true);}}}
          onContextMenu={e=>{e.preventDefault();setCtxOpen(true);}}
          onDoubleClick={()=>!selecting&&onReact(msg.id,REACTIONS[0])}
          onTouchStart={startLP} onTouchEnd={cancelLP} onTouchMove={cancelLP}
          onMouseDown={startLP} onMouseUp={cancelLP} onMouseLeave={cancelLP}>
          {chat.type!=="personal" && !msg.out && msg.sender &&
            <div className="bubble-sender">{msg.sender}{msg.auto && <span className="auto-badge"><SmilePlus size={11}/> авто</span>}</div>}
          {msg.replyTo &&
            <div className="bubble-reply"><b>{msg.replyTo.name}</b><span>{msg.replyTo.text}</span></div>}
          {msg.pinned && <span className="bubble-pin"><Pin size={11} fill="currentColor"/></span>}
          {content}
          <span className="bubble-time">
            {msg.edited && <span className="edited-tag">изм.</span>}
            {msg.time}
            {msg.out && (msg.status==="read"||msg.status==="delivered"
              ? <CheckCheck size={14}/> : msg.status==="sent" ? <Check size={14}/> : null)}</span>
        </div>
        {/* Кружок выбора — справа от баббла */}
        {selecting &&
          <div className="msg-select-circle" onClick={e=>{e.stopPropagation(); onSelect&&onSelect(msg.id);}}>
            {selected ? <CircleCheckBig size={24} color="var(--accent)"/> : <Circle size={24} color="var(--sub)"/>}
          </div>}
      </div>

      {/* Кнопка комментариев */}
      {commentsEnabled && !selecting &&
        <div className={"msg-comments-btn "+(msg.out?"out":"in")} onClick={()=>onComment&&onComment(msg)}>
          <CornerDownRight size={14}/>
          <span>{(msg.comments||[]).length ? `${(msg.comments||[]).length} комментари${(msg.comments||[]).length===1?"й":(msg.comments||[]).length<5?"я":"ев"}` : "Комментировать"}</span>
        </div>}

      {reactKeys.length>0 &&
        <div className={"reactions "+(msg.out?"out":"in")}>
          {reactKeys.map(r=>
            <button key={r} className={"reaction"+(reactions[r+"__me"]?" mine":"")}
              onClick={()=>onReact(msg.id,r)}>{r}<i>{reactions[r]}</i></button>)}
          {onReactionsDetail &&
            <button className="reaction reaction-who" title="Кто отреагировал"
              onClick={(e)=>{ e.stopPropagation(); onReactionsDetail(msg); }}>
              <Users size={13}/></button>}
        </div>}

      {/* ═══ Bottom-sheet контекстное меню (portal для z-index) ═══ */}
      {ctxOpen && createPortal(
        <div className="ctx-overlay" onClick={()=>{setCtxOpen(false);setEmojiExpanded(false);}}>
          <div className="ctx-sheet" onClick={e=>e.stopPropagation()}>
            {/* Реакции */}
            {!emojiExpanded ?
              <div className="ctx-reactions">
                {REACTIONS.map(r=>
                  <span key={r} className="ctx-react-btn" onClick={()=>ctxAct(()=>onReact(msg.id,r))}>{r}</span>)}
                <span className="ctx-react-btn ctx-react-more" onClick={(e)=>{e.stopPropagation();setEmojiExpanded(true);}}><ChevronDown size={20}/></span>
              </div>
            :
              <div className="ctx-emoji-grid">
                {ALL_EMOJI.map(r=>
                  <span key={r} className="ctx-react-btn" onClick={()=>ctxAct(()=>onReact(msg.id,r))}>{r}</span>)}
              </div>
            }
            <div className="ctx-handle"/>
            {/* Пункты меню */}
            <div className="ctx-menu">
              {msg.out && msg.t && !msg.photo && !msg.voice && !msg.file && !msg.video &&
                <div className="ctx-item" onClick={()=>ctxAct(()=>onEdit&&onEdit(msg))}>
                  <PencilLine size={20}/><span>Редактировать</span></div>}
              <div className="ctx-item" onClick={()=>ctxAct(()=>onReply(msg))}>
                <Reply size={20}/><span>Ответить</span></div>
              <div className="ctx-item" onClick={()=>ctxAct(()=>onForward(msg))}>
                <Share2 size={20}/><span>Переслать</span></div>
              {reactKeys.length>0 &&
                <div className="ctx-item" onClick={()=>ctxAct(()=>onReactionsDetail&&onReactionsDetail(msg))}>
                  <SmilePlus size={20}/><span>Реакции</span></div>}
              {(myRole==="owner"||myRole==="admin") &&
                <div className="ctx-item" onClick={()=>ctxAct(()=>{})}>
                  <EyeOff size={20}/><span>Отметить непрочитанным</span></div>}
              {msg.t &&
                <div className="ctx-item" onClick={()=>ctxAct(()=>onCopy&&onCopy(msg))}>
                  <Copy size={20}/><span>Скопировать текст</span></div>}
              <div className="ctx-item" onClick={()=>ctxAct(()=>onPin(msg.id))}>
                {msg.pinned?<PinOff size={20}/>:<Pin size={20}/>}<span>{msg.pinned?"Открепить":"Закрепить"}</span></div>
              <div className="ctx-item" onClick={()=>ctxAct(()=>onSelect&&onSelect(msg.id,true))}>
                <CircleCheckBig size={20}/><span>Выбрать</span></div>
              {canDelete &&
                <div className="ctx-item danger" onClick={()=>ctxAct(()=>onDelete(msg.id))}>
                  <Trash2 size={20}/><span>Удалить</span></div>}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
