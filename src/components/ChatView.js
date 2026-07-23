// Компонент: ChatView
import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Video,
  ChevronLeft,
  X,
  Plus,
  Mic,
  Smile,
  Send,
  Trash2,
  Pin,
  Reply,
  BadgeCheck,
  ArrowUp,
  ArrowDown,
  Paperclip,
  Film,
  Image as ImageIcon,
  PencilLine,
  Forward,
  Copy,
  Phone,
  AtSign,
  Users
,
  FileText
} from "lucide-react";
import { statusLine } from "../utils/helpers";
import { EMOJIS , canWriteInTopic } from "../constants";
import { ClipboardList, Lock, SmilePlus } from "lucide-react";
import { Avatar, IconBtn, Toggle, Message, RoundBtn } from "./index";

/* ── Группы упоминаний ── */
const MENTION_GROUPS = [
  { tag:"Все сотрудники смены", icon:"👥", desc:"Текущая смена" },
  { tag:"Все руководители", icon:"👔", desc:"Руководство" },
  { tag:"Все кураторы", icon:"🎓", desc:"Кураторы сети" },
  { tag:"Все сотрудники", icon:"🏢", desc:"Вся точка" },
];

export function ChatView({ active, me, reply, draft, setDraft, emojiOpen, setEmojiOpen, recording, recSec,
  onBack, onProfile, onStub, onSend, onReply, cancelReply, onDelete, onPhotoPick, onAttach, onPhotoView,
  startRec, cancelRec, stopRec, msgEndRef, inputRef, typing,
  onReact, onForward, onPin, onInfo, onEditMsg, onAddComment, onToast,
  onReactionsDetail, extraContent, bottomExtra, onTemplate, writeAccessLive, onPlayVoice, voicePlayingId, voiceBar, onExplain }) {
  // Кто может писать в этой теме/чате
  const myRole = (active.roster||[]).find(r=>r.isMe)?.role || "member";
  const accessLevel = writeAccessLive || active.writeAccess || "all";
  const canWrite = canWriteInTopic(accessLevel, myRole);
  const writeHint = accessLevel==="owner"
    ? "Писать может только владелец группы"
    : "Писать могут кураторы и администраторы";

  const fileRef=useRef(null);
  const photoRef=useRef(null), videoRef=useRef(null), docRef=useRef(null), audioRef=useRef(null);
  const [attachOpen,setAttachOpen]=useState(false);
  const [noCompress,setNoCompress]=useState(false);
  const [search,setSearch]=useState(null);      // null = закрыт; строка = запрос
  const [matchIdx,setMatchIdx]=useState(0);
  const msgRefs=useRef({});
  const recStr=`${String(Math.floor(recSec/60)).padStart(2,"0")}:${String(recSec%60).padStart(2,"0")}`;

  // @Упоминания
  const [mentionOpen,setMentionOpen]=useState(false);
  const [mentionQ,setMentionQ]=useState("");

  // Список индивидуальных участников чата для упоминаний (с @handle)
  const rosterPeople = (active.roster||[]).filter(r=>!r.isMe).map(r=>({name:r.name, handle:r.handle||""}));

  const mentionItems = (() => {
    const q = mentionQ.toLowerCase();
    const groups = MENTION_GROUPS.filter(g => g.tag.toLowerCase().includes(q));
    const people = rosterPeople.filter(p => p.name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q));
    return { groups, people };
  })();

  const insertMention = (tag) => {
    const val = draft;
    const atIdx = val.lastIndexOf("@");
    if (atIdx >= 0) {
      setDraft(val.substring(0, atIdx) + "@" + tag + " ");
    } else {
      setDraft(val + "@" + tag + " ");
    }
    setMentionOpen(false);
    setMentionQ("");
    inputRef.current?.focus();
  };

  // Отслеживаем ввод @ в draft
  const handleDraftChange = (e) => {
    const val = e.target.value;
    setDraft(val);
    // Ищем @ в текущей позиции
    const cursor = e.target.selectionStart;
    const before = val.substring(0, cursor);
    const atIdx = before.lastIndexOf("@");
    if (atIdx >= 0) {
      const afterAt = before.substring(atIdx + 1);
      // Если после @ нет пробела — показываем popup
      if (!afterAt.includes(" ") && !afterAt.includes("\n")) {
        setMentionOpen(true);
        setMentionQ(afterAt);
        return;
      }
    }
    setMentionOpen(false);
    setMentionQ("");
  };

  // Редактирование сообщения
  const [editing,setEditing]=useState(null);  // {id, text} — сообщение в режиме редактирования

  // Комментарии (треды) — только для определённых групп
  const commentsEnabled = active.name==="УРОКИ ОТ КАЛИБРИ" || active.name==="Я СТАЖЕР В КАЛИБРИ"
    || active.groupId==="course" || active.groupId==="g-intern";
  const [commentThread,setCommentThread]=useState(null); // {msg} — открытый тред
  const [commentDraft,setCommentDraft]=useState("");
  const commentEndRef=useRef(null);

  const openComment=(msg)=>{ setCommentThread({msg}); setCommentDraft(""); };
  const sendComment=()=>{
    if(!commentDraft.trim()||!commentThread) return;
    onAddComment&&onAddComment(commentThread.msg.id, commentDraft.trim());
    setCommentDraft("");
  };

  // Скопировать ссылку на сообщение
  const copyLink=(msg)=>{
    const chatId = active.groupId || active.pointId || active.id;
    const link = `kalibri://msg/${chatId}/${msg.id}`;
    if(navigator.clipboard) navigator.clipboard.writeText(link).catch(()=>{});
    onToast&&onToast({title:"Ссылка скопирована",sub:link});
  };

  // Множественный выбор
  const [selecting,setSelecting]=useState(false);
  const [selectedIds,setSelectedIds]=useState(new Set());

  const startEditing=(msg)=>{
    setEditing({ id:msg.id, text:msg.t });
    setDraft(msg.t);
    cancelReply();
    inputRef.current?.focus();
  };
  const cancelEditing=()=>{ setEditing(null); setDraft(""); };
  const submitEdit=()=>{
    if(!editing) return;
    const t=draft.trim();
    if(!t){ cancelEditing(); return; }
    onEditMsg&&onEditMsg(editing.id, t);
    cancelEditing();
  };

  // Копирование текста в буфер
  const copyMsg=(msg)=>{
    if(msg.t && navigator.clipboard){ navigator.clipboard.writeText(msg.t).catch(()=>{}); }
  };

  // Множественный выбор
  const toggleSelect=(id, startSelecting)=>{
    if(startSelecting && !selecting) setSelecting(true);
    setSelectedIds(prev=>{
      const next=new Set(prev);
      if(next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const exitSelecting=()=>{ setSelecting(false); setSelectedIds(new Set()); };
  // Удалять могут только администраторы
  const myRole = (active.roster||[]).find(r=>r.isMe)?.role;
  const canDeleteInSelect = myRole==="owner"||myRole==="admin"||active.type==="personal";
  const deleteSelected=()=>{
    selectedIds.forEach(id=>onDelete(id));
    exitSelecting();
  };
  const forwardSelected=()=>{
    const msgs=active.msgs.filter(m=>selectedIds.has(m.id));
    if(msgs.length) onForward(msgs[0]);
    exitSelecting();
  };

  const q=(search||"").trim().toLowerCase();
  const matches = q ? active.msgs.filter(m=>(m.t||"").toLowerCase().includes(q)) : [];
  const activeMatchId = matches.length ? matches[Math.min(matchIdx,matches.length-1)].id : null;

  const jump=(dir)=>{
    if(!matches.length) return;
    let ni=(matchIdx+dir+matches.length)%matches.length;
    setMatchIdx(ni);
    const el=msgRefs.current[matches[ni].id];
    el?.scrollIntoView({behavior:"smooth",block:"center"});
  };
  useEffect(()=>{ setMatchIdx(0);
    if(matches.length){ const el=msgRefs.current[matches[0].id]; el?.scrollIntoView({block:"center"}); }
  },[search]);

  const pinnedMsg = [...active.msgs].reverse().find(m=>m.pinned);
  const scrollToPinned=()=>{ const el=msgRefs.current[pinnedMsg?.id]; el?.scrollIntoView({behavior:"smooth",block:"center"}); };

  return (
    <>
      {search===null ?
        <div className="chat-head" onClick={onProfile}>
          <button className="back-btn" onClick={e=>{e.stopPropagation();onBack();}}><ChevronLeft size={26}/></button>
          <Avatar name={active.name} size={44} online={active.online} ring/>
          <div className="chat-head-info">
            <div className="chat-head-name">{active.name}
              {active.verified && <BadgeCheck size={15} color="var(--accent)"/>}</div>
            <div className={"chat-head-status"+(typing?" head-typing":active.online?" online":"")}>
              {typing?<>печатает<span className="typing-dots typing-dots-head"><span/><span/><span/></span></>:statusLine(active)}</div>
          </div>
          <IconBtn onClick={e=>{e.stopPropagation();setSearch("");}} title="Поиск в чате"><Search size={19}/></IconBtn>
          <IconBtn onClick={e=>{e.stopPropagation();onStub(false);}} title="Звонок"><Phone size={19}/></IconBtn>
          <IconBtn onClick={e=>{e.stopPropagation();onStub(true);}} title="Видеозвонок"><Video size={19}/></IconBtn>
        </div>
      :
        <div className="chat-head search-head">
          <div className="search-box in-chat">
            <Search size={18}/>
            <input autoFocus value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Поиск в чате" onKeyDown={e=>{ if(e.key==="Enter") jump(e.shiftKey?-1:1); }}/>
          </div>
          {q && <span className="search-count">{matches.length?`${matchIdx+1}/${matches.length}`:"0/0"}</span>}
          <IconBtn soft onClick={()=>jump(-1)} title="Предыдущее"><ArrowUp size={18}/></IconBtn>
          <IconBtn soft onClick={()=>jump(1)} title="Следующее"><ArrowDown size={18}/></IconBtn>
          <IconBtn soft onClick={()=>setSearch(null)} title="Закрыть"><X size={19}/></IconBtn>
        </div>}

      {pinnedMsg &&
        <div className="pinned-bar" onClick={scrollToPinned}>
          <span className="pin-ic"><Pin size={15} fill="currentColor"/></span>
          <div className="pin-body">
            <div className="pin-title">Закреплённое сообщение</div>
            <div className="pin-text">{pinnedMsg.photo?"📷 Фото":pinnedMsg.voice?"🎤 Голосовое":pinnedMsg.t}</div>
          </div>
          <IconBtn onClick={e=>{e.stopPropagation();onPin(pinnedMsg.id);}} title="Открепить"><X size={18}/></IconBtn>
        </div>}

      {/* Панель множественного выбора — нижняя полоса */}

      <div className="msgs">
        <div className="day-chip">Сегодня</div>
        {active.msgs.map((m,mi)=>
          <React.Fragment key={m.id}>
          {m._topicName && (mi===0||active.msgs[mi-1]?._topicName!==m._topicName) &&
            <div className="feed-topic-label"><span className="feed-topic-pill"># {m._topicName} ›</span></div>}
          <Message msg={m} chat={active} me={me}
            mRef={el=>{ if(el) msgRefs.current[m.id]=el; }}
            onReply={onReply} onDelete={onDelete} onPhoto={onPhotoView} onStub={onStub}
            onReact={onReact} onForward={onForward} onPin={onPin} onInfo={onInfo} onReactionsDetail={onReactionsDetail}
            onPlayVoice={onPlayVoice} voicePlayingId={voicePlayingId}
            onEdit={startEditing} onCopy={copyMsg} onCopyLink={copyLink}
            onComment={openComment} commentsEnabled={commentsEnabled}
            query={q} isMatch={m.id===activeMatchId}
            selecting={selecting} selected={selectedIds.has(m.id)} onSelect={toggleSelect}/>
          </React.Fragment>)}
        {extraContent}
        {typing && <div className="typing"><span/><span/><span/></div>}
        <div ref={msgEndRef}/>
      </div>

      {voiceBar}

      {/* Полоска редактирования / ответа */}
      {editing &&
        <div className="reply-bar edit-bar">
          <PencilLine size={20} color="var(--accent)"/>
          <div className="reply-bar-body">
            <div className="reply-bar-name">Редактирование</div>
            <div className="reply-bar-text">{editing.text}</div>
          </div>
          <IconBtn onClick={cancelEditing}><X size={20}/></IconBtn>
        </div>}

      {!editing && reply &&
        <div className="reply-bar">
          <Reply size={20} color="var(--accent)"/>
          <div className="reply-bar-body">
            <div className="reply-bar-name">{reply.out?me.name:(reply.sender||active.name)}</div>
            <div className="reply-bar-text">{reply.photo?"Фото":reply.voice?"Голосовое":reply.t}</div>
          </div>
          <IconBtn onClick={cancelReply}><X size={20}/></IconBtn>
        </div>}

      {bottomExtra && <div className="bottom-extra-scroll">{bottomExtra}</div>}
      {active.requireReaction && <div className="readonly-bar"><SmilePlus size={16}/> Поставьте реакцию на сообщения</div>}

      {/* @Mention popup */}
      {canWrite && mentionOpen && (mentionItems.groups.length>0 || mentionItems.people.length>0) &&
        <div className="mention-popup">
          {mentionItems.groups.map(g=>
            <div key={g.tag} className="mention-item group" onClick={()=>insertMention(g.tag)}>
              <span className="mention-ic">{g.icon}</span>
              <div className="mention-info">
                <div className="mention-tag">@{g.tag}</div>
                <div className="mention-desc">{g.desc}</div>
              </div>
            </div>)}
          {mentionItems.people.length>0 && mentionItems.groups.length>0 && <div className="mention-sep"/>}
          {mentionItems.people.map(p=>
            <div key={p.handle||p.name} className="mention-item" onClick={()=>insertMention(p.handle||p.name)}>
              <span className="mention-ic"><AtSign size={16}/></span>
              <div className="mention-info">
                <div className="mention-tag">{p.name}</div>
                {p.handle && <div className="mention-handle">@{p.handle}</div>}
              </div>
            </div>)}
        </div>}

      {canWrite && emojiOpen &&
        <div className="emoji-panel">
          {EMOJIS.map((e,i)=><span key={i} onClick={()=>setDraft(d=>d+e)}>{e}</span>)}</div>}

      {!selecting && !canWrite &&
        <div className="composer composer-disabled" title={writeHint}>
          <RoundBtn variant="soft" disabled><Plus size={22}/></RoundBtn>
          <div className="input-pill">
            <textarea rows={1} disabled placeholder={writeHint}/>
            <button className="emoji-btn-inline" disabled><Smile size={22}/></button>
          </div>
          <RoundBtn variant="soft" disabled><Mic size={20}/></RoundBtn>
        </div>}

      {!selecting && canWrite && <div className="composer">
        {recording ?
          <>
            <div className="rec-bar"><span className="rec-dot"/><span>Запись... {recStr}</span></div>
            <RoundBtn variant="soft" onClick={cancelRec}><Trash2 size={20}/></RoundBtn>
            <RoundBtn onClick={stopRec}><Send size={20}/></RoundBtn>
          </>
          :
          <>
            <RoundBtn onClick={()=>setAttachOpen(o=>!o)}><Plus size={22} style={{transform:attachOpen?"rotate(45deg)":"none",transition:"transform .2s"}}/></RoundBtn>
            <div className="input-pill">
              <textarea ref={inputRef} rows={1} value={draft} placeholder="Напишите сообщение..."
                onChange={handleDraftChange}
                onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); setMentionOpen(false); editing?submitEdit():onSend(); }
                  if(e.key==="Escape"){ if(mentionOpen){setMentionOpen(false);} else if(editing) cancelEditing(); } }}/>
              <button className="emoji-btn-inline" onClick={()=>setEmojiOpen(o=>!o)}><Smile size={22}/></button>
            </div>
            {draft.trim()
              ? <RoundBtn onClick={editing?submitEdit:onSend}><Send size={20}/></RoundBtn>
              : <RoundBtn variant="soft" onClick={startRec}><Mic size={20}/></RoundBtn>}
            <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{onAttach("photo",e,noCompress);setAttachOpen(false);}}/>
            <input ref={videoRef} type="file" accept="video/*" style={{display:"none"}} onChange={e=>{onAttach("video",e,noCompress);setAttachOpen(false);}}/>
            <input ref={docRef} type="file" style={{display:"none"}} onChange={e=>{onAttach("file",e,noCompress);setAttachOpen(false);}}/>
            <input ref={audioRef} type="file" accept="audio/*" style={{display:"none"}}
              onChange={e=>{onAttach("audio",e,noCompress);setAttachOpen(false);}}/>
          </>}
      </div>}

      {!active.readOnly && !selecting && attachOpen && !recording &&
        <div className="attach-sheet">
          <div className="attach-grid">
            <button className="attach-item" onClick={()=>photoRef.current.click()}>
              <span className="attach-ic photo"><ImageIcon size={24}/></span>Фото</button>
            <button className="attach-item" onClick={()=>videoRef.current.click()}>
              <span className="attach-ic video"><Film size={24}/></span>Видео</button>
            <button className="attach-item" onClick={()=>docRef.current.click()}>
              <span className="attach-ic file"><Paperclip size={24}/></span>Файл</button>
            {onTemplate && <button className="attach-item" onClick={()=>{setAttachOpen(false);onTemplate();}}>
              <span className="attach-ic tpl"><ClipboardList size={24}/></span>Шаблоны</button>}
            {(myRole==="owner"||myRole==="admin") && <button className="attach-item" onClick={()=>audioRef.current.click()}>
              <span className="attach-ic voice"><Mic size={24}/></span>Голосовое</button>}
            {onExplain && <button className="attach-item" onClick={()=>{setAttachOpen(false);onExplain();}}>
              <span className="attach-ic explain"><FileText size={24}/></span>Объяснительная</button>}
          </div>
          <div className="attach-opt" onClick={()=>setNoCompress(v=>!v)}>
            <div className="attach-opt-txt">
              <div className="attach-opt-title">Отправлять без сжатия</div>
              <div className="attach-opt-sub">Исходное качество фото и видео</div>
            </div>
            <Toggle on={noCompress} onClick={()=>setNoCompress(v=>!v)}/>
          </div>
        </div>}

      {/* Панель множественного выбора — нижняя (как в Telegram) */}
      {selecting &&
        <div className="select-bottom-bar">
          <button className="sel-btn cancel" onClick={exitSelecting}>
            <X size={20}/>
            <span className="sel-label">Выбрано: {selectedIds.size}</span>
          </button>
          <div className="sel-spacer"/>
          {canDeleteInSelect &&
            <button className="sel-btn danger" onClick={deleteSelected} disabled={!selectedIds.size}>
              <Trash2 size={20}/>
              <span className="sel-label">Удалить</span>
            </button>}
          <button className="sel-btn" onClick={forwardSelected} disabled={!selectedIds.size}>
            <span className="sel-label">Переслать</span>
            <Forward size={20}/>
          </button>
        </div>}

      {/* Тред комментариев */}
      {commentThread && (()=>{
        const origMsg = active.msgs.find(m=>m.id===commentThread.msg.id) || commentThread.msg;
        const comments = origMsg.comments || [];
        return (
          <div className="comment-overlay">
            <div className="comment-head">
              <button className="back-btn" onClick={()=>setCommentThread(null)}><ChevronLeft size={22}/></button>
              <div className="comment-head-title">Комментарии</div>
              <span className="comment-count">{comments.length}</span>
            </div>
            <div className="comment-orig">
              <div className="comment-orig-sender">{origMsg.out?me.name:(origMsg.sender||active.name)}</div>
              <div className="comment-orig-text">{origMsg.photo?"📷 Фото":origMsg.voice?"🎤 Голосовое":origMsg.t}</div>
              <div className="comment-orig-time">{origMsg.time}</div>
            </div>
            <div className="comment-list">
              {comments.map((c,i)=>
                <div key={i} className={"comment-item"+(c.out?" out":"")}>
                  <div className="comment-sender">{c.out?me.name:c.sender}</div>
                  <div className="comment-text">{c.text}</div>
                  <div className="comment-time">{c.time}</div>
                </div>)}
              {comments.length===0 && <div className="comment-empty">Нет комментариев</div>}
              <div ref={commentEndRef}/>
            </div>
            <div className="comment-composer">
              <textarea rows={1} value={commentDraft} placeholder="Написать комментарий..."
                onChange={e=>setCommentDraft(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendComment(); } }}/>
              <RoundBtn onClick={sendComment} disabled={!commentDraft.trim()}><Send size={18}/></RoundBtn>
            </div>
          </div>);
      })()}
    </>
  );
}
