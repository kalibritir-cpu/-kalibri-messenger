// Корневой компонент приложения
import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  PencilLine,
  Phone,
  Video,
  X,
  Plus,
  Trash2,
  Pin,
  PinOff,
  Bell,
  BellOff,
  MessageCircle,
  Check,
  CheckCheck,
  Users,
  Megaphone,
  Settings,
  User,
  PhoneOff,
  Forward,
  Camera,
  Image as ImageIcon,
  Coffee,
  Activity,
  MapPin,
  Clock,
  Eye,
  Timer,
  AlertTriangle,
  ThumbsUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Headphones
,
  SkipBack,
  SkipForward,
  Pause,
  Play
} from "lucide-react";

import { now, uid } from "./utils/helpers";
import { WALLPAPERS, FOLDERS } from "./constants";
import {
  Avatar,
  IconBtn,
  Story,
  ChatRow,
  RailItem,
  BottomNav,
  ChatView,
  Overlay,
  SidePanel,
  PointTopics,
  CourseChat,
  PointView,
  CallRow,
  CallScreen,
  LoginScreen,
  ReportCard,
  ReportGallery,
  ReportChecklist,
  AttractionReportCard,
  ReportScheduleSettings,
  BreakStartModal,
  BreakReturnModal,
  BreakTimerBar,
  BreakCard,
  BreakBlockedNotice,
  BreakSummary,
  CuratorSchedule,
  PointSchedule,
  AttractionCheck,
  AttractionCheckCard,
  TimeManagementReport,
  ControlSection,
  ControlDetailView,
  ControlCard,
  CuratorStandards,
  WorkTemplates
} from "./components/index";
import { GroupFormsBlock, GroupFormModal, FORM_DEFS } from "./components/GroupForms";

import { seedState } from "./data/seedState";
import { LOGO } from "./assets/logo";
import STYLES from "./styles.css"; // текст CSS, инжектится через <style>{STYLES}</style>

/* ─── Панель «Кто отреагировал» ─── */
function ReactionsDetailPanel({ msg, chat, contacts }) {
  const [activeTab, setActiveTab] = useState("all");
  const rr = msg.reactions || {};
  const emojis = Object.keys(rr).filter(k=>!k.endsWith("__me") && rr[k]>0);
  const totalCount = emojis.reduce((s,k)=>s+rr[k],0);
  const names = chat.roster
    ? chat.roster.filter(r=>!r.isMe).map(r=>r.name)
    : (contacts||[]).map(c=>c.name);
  const cities = ["Москва","Санкт-Петербург","Когалым","Казань","Краснодар","Екатеринбург","Новосибирск","Самара"];
  const times = ["11:03","09:45","14:22","16:10","08:30","12:55","10:18","15:37","17:42","07:58"];
  const dateStr = "11 июл";
  let reactors = [], nameIdx = 0;
  emojis.forEach(emoji => {
    const cnt = rr[emoji];
    for(let i=0; i<cnt; i++){
      reactors.push({
        name: names[nameIdx % names.length],
        city: cities[nameIdx % cities.length],
        time: `${dateStr} в ${times[nameIdx % times.length]}`,
        emoji,
        isMe: i===0 && rr[emoji+"__me"],
      });
      nameIdx++;
    }
  });
  const tabs = [{ key:"all", label:`Все ${totalCount}` }, ...emojis.map(e=>({ key:e, label:`${e} ${rr[e]}` }))];
  const filtered = activeTab==="all" ? reactors : reactors.filter(r=>r.emoji===activeTab);
  return (
    <>
      <div className="react-detail-head">
        <span className="react-detail-title">{totalCount} {totalCount===1?"реакция":totalCount<5?"реакции":"реакций"}</span>
      </div>
      <div className="react-detail-tabs">
        {tabs.map(t=>
          <button key={t.key} className={"react-tab"+(activeTab===t.key?" active":"")}
            onClick={()=>setActiveTab(t.key)}>{t.label}</button>)}
      </div>
      <div className="react-detail-list">
        {filtered.map((r,i)=>
          <div key={i} className="react-detail-row">
            <Avatar name={r.name} size={42}/>
            <div className="react-detail-info">
              <div className="react-detail-name">{r.name}{r.isMe && <span className="react-detail-you"> (вы)</span>}</div>
              <div className="react-detail-sub">{r.city} · {r.time}</div>
            </div>
            <span className="react-detail-emoji">{r.emoji}</span>
          </div>)}
      </div>
    </>
  );
}

export default function App() {
  const [state,setState]=useState(seedState);
  const [tab,setTab]=useState("chats");
  const [folder,setFolder]=useState("personal");
  const [activeId,setActiveId]=useState(null);
  const [search,setSearch]=useState("");
  const [reply,setReply]=useState(null);
  const [draft,setDraft]=useState("");
  const [emojiOpen,setEmojiOpen]=useState(false);
  const [recording,setRecording]=useState(false);
  const [recSec,setRecSec]=useState(0);
  const [panel,setPanel]=useState(null);
  const [modal,setModal]=useState(null); // null | {step:"pick"} | {step:"name", type, label, nameVal}
  const newChatInputRef=useRef(null);
  const [ctx,setCtx]=useState(null);
  const [lightbox,setLightbox]=useState(null);
  const [formOpen,setFormOpen]=useState(null); // id открытой анкеты
  const submitForm=(payload)=>{
    const chatId = pointTopicsId || groupTopicsId || active?.pointId || active?.id || "point";
    setState(s=>({...s, formSubmissions:[
      { id:uid(), chatId, time:now(), status:"pending", ...payload },
      ...(s.formSubmissions||[])]}));
    setFormOpen(null);
    setToast({ title:"Обращение отправлено ✅",
      sub: payload.anon ? "Отправлено анонимно" : "Руководство рассмотрит его" });
  };
  // ===== Глобальный плеер голосовых: живёт поверх чата при прокрутке =====
  const [voicePlay,setVoicePlay]=useState(null); // {id,src,name,dur,playing,prog,rate}
  const voiceAudio=useRef(null);
  const playVoice=(msg, chatName)=>{
    const src=msg.voiceSrc;
    if(!src) return;
    // тот же трек — просто пауза/продолжение
    if(voicePlay && voicePlay.id===msg.id && voiceAudio.current){
      if(voiceAudio.current.paused){ voiceAudio.current.play().catch(()=>{}); setVoicePlay(v=>({...v,playing:true})); }
      else { voiceAudio.current.pause(); setVoicePlay(v=>({...v,playing:false})); }
      return;
    }
    if(voiceAudio.current){ voiceAudio.current.pause(); voiceAudio.current=null; }
    const au=new Audio(src);
    au.playbackRate=voicePlay?.rate||1;
    au.ontimeupdate=()=>setVoicePlay(v=>v?{...v,prog:au.currentTime/(au.duration||1)}:v);
    au.onended=()=>setVoicePlay(v=>v?{...v,playing:false,prog:0}:v);
    voiceAudio.current=au;
    au.play().catch(()=>{});
    setVoicePlay({ id:msg.id, src, name:msg.out?state.me.name:(msg.sender||chatName||"Аудиосообщение"),
      dur:msg.voice||"00:00", playing:true, prog:0, rate:voicePlay?.rate||1 });
  };
  const voiceToggle=()=>{
    const au=voiceAudio.current; if(!au) return;
    if(au.paused){ au.play().catch(()=>{}); setVoicePlay(v=>({...v,playing:true})); }
    else { au.pause(); setVoicePlay(v=>({...v,playing:false})); }
  };
  const voiceSeek=(delta)=>{ const au=voiceAudio.current; if(!au) return;
    au.currentTime=Math.max(0, Math.min(au.duration||0, au.currentTime+delta)); };
  const voiceRate=()=>{ const au=voiceAudio.current; if(!au) return;
    const rates=[1,1.5,2]; const cur=voicePlay?.rate||1;
    const next=rates[(rates.indexOf(cur)+1)%rates.length];
    au.playbackRate=next; setVoicePlay(v=>({...v,rate:next})); };
  const voiceClose=()=>{ if(voiceAudio.current){ voiceAudio.current.pause(); voiceAudio.current=null; } setVoicePlay(null); };
  useEffect(()=>()=>{ if(voiceAudio.current) voiceAudio.current.pause(); },[]);
  const [story,setStory]=useState(null);
  const [newStory,setNewStory]=useState(null);   // черновик новой истории {text,photo}
  const storyFileRef=useRef(null);
  const [chatOpen,setChatOpen]=useState(false);
  const [chatFilter,setChatFilter]=useState("all"); // "all" | "new"
  const [showInstall,setShowInstall]=useState(true); // баннер «Установить приложение»
  const [storiesOpen,setStoriesOpen]=useState(false); // раскрыта ли лента историй
  const [installConfirm,setInstallConfirm]=useState(false); // модалка-инструкция установки
  const prevTabRef=useRef({t:"chats",f:"personal"}); // откуда пришли в настройки
  // PWA: манифест на лету + перехват beforeinstallprompt + appinstalled
  useEffect(()=>{
    const onBIP=(e)=>{ e.preventDefault(); window.__kbDeferredPrompt=e; };
    const onInst=()=>{ setShowInstall(false); setToast({title:"Приложение установлено ✅",sub:"Калибри добавлен на главный экран"}); };
    window.addEventListener("beforeinstallprompt",onBIP);
    window.addEventListener("appinstalled",onInst);
    if(!document.querySelector('link[rel="manifest"]')){
      try{
        const m={name:"Калибри",short_name:"Калибри",start_url:location.href.split("#")[0],display:"standalone",
          background_color:"#101418",theme_color:"#25d10a",
          icons:[{src:LOGO,sizes:"192x192",type:"image/png",purpose:"any"},{src:LOGO,sizes:"512x512",type:"image/png",purpose:"any"}]};
        const b=new Blob([JSON.stringify(m)],{type:"application/manifest+json"});
        const l=document.createElement("link"); l.rel="manifest"; l.href=URL.createObjectURL(b);
        document.head.appendChild(l);
      }catch(e){}
    }
    return ()=>{ window.removeEventListener("beforeinstallprompt",onBIP); window.removeEventListener("appinstalled",onInst); };
  },[]);
  const [typingIn,setTypingIn]=useState(null);
  const [courseView,setCourseView]=useState(false);   // открыт экран разделов «Уроки от Калибри»
  const [pointView,setPointView]=useState(false);      // открыт экран «Моя точка»
  const [pointTopicsId,setPointTopicsId]=useState(null); // открыт чат «Точка» со списком тем
  const [groupTopicsId,setGroupTopicsId]=useState(null); // открыт чат группы со списком тем
  const [openedSections,setOpenedSections]=useState({}); // section-чаты, созданные на лету
  const [call,setCall]=useState(null);                 // активный звонок {name,kind}
  const [authed,setAuthed]=useState(true);             // вошёл ли пользователь в аккаунт
  const [toast,setToast]=useState(null);               // всплывающее уведомление {title,sub}
  const [confirmDlg,setConfirmDlg]=useState(null);     // модалка подтверждения {message,confirmLabel,onYes}
  const [reportView,setReportView]=useState(null);    // открытый фотоотчёт (id)
  const [controlDetail,setControlDetail]=useState(null); // "photos"|"breaks"|"time" — полноэкранная секция Контроля
  const [reactionsDetail,setReactionsDetail]=useState(null); // {msg, chat} — панель «кто отреагировал»
  const [voiceListeners,setVoiceListeners]=useState(null);     // {msg, chat} — панель «кто прослушал»
  // === Система перерывов ===
  const [templateView,setTemplateView]=useState(false); // открыт экран шаблонов
  const [breakModal,setBreakModal]=useState(null);    // {type:"start"|"return", breakCfg, ...}
  const [activeBreak,setActiveBreak]=useState(null);  // {startTime,returnBy,duration,pointName,employeeName,...}
  const [breakTimerMin,setBreakTimerMin]=useState(false); // свёрнутый таймер
  const [postponeCount,setPostponeCount]=useState(0);
  const recTimer=useRef(null), msgEndRef=useRef(null), inputRef=useRef(null), micStreamRef=useRef(null);

  const active=state.chats.find(c=>c.id===activeId) || openedSections[activeId];
  const totalUnread=state.chats.reduce((a,c)=>a+(c.unread||0),0);
  const courseChat=state.chats.find(c=>c.isCourse);

  // Синхронизируем data-theme на body, чтобы порталы наследовали CSS-переменные
  useEffect(()=>{ document.body.setAttribute("data-theme", state.settings.theme); },[state.settings.theme]);
  useEffect(()=>{ msgEndRef.current?.scrollIntoView(); },[active?.msgs?.length,activeId,typingIn]);
  useEffect(()=>{ const cl=()=>setCtx(null); window.addEventListener("click",cl); return ()=>window.removeEventListener("click",cl); },[]);
  useEffect(()=>{ if(story){ const t=setTimeout(()=>setStory(null),4000); return ()=>clearTimeout(t);} },[story]);
  useEffect(()=>{ if(toast){ const t=setTimeout(()=>setToast(null),4200); return ()=>clearTimeout(t);} },[toast]);

  const patchChat=(id,fn)=>setState(s=>({ ...s, chats:s.chats.map(c=>c.id===id?fn(c):c) }));
  const openChat=(id)=>{
    const c=state.chats.find(x=>x.id===id);
    if(c?.isCourse){ setCourseView(true); setChatOpen(true); setPanel(null); patchChat(id,x=>({...x,unread:0})); return; }
    if(c?.type==="point"){ setPointTopicsId(id); setActiveId(null); setChatOpen(true); setPanel(null); setCourseView(false); setPointView(false); setGroupTopicsId(null); return; }
    // Группы с темами → показать список тем
    if(c?.type==="groups" && c.topics && c.topics.length>0){
      setGroupTopicsId(id); setActiveId(null); setChatOpen(true); setPanel(null); setCourseView(false); setPointView(false); setPointTopicsId(null); patchChat(id,x=>({...x,unread:0})); return;
    }
    setActiveId(id); setReply(null); setChatOpen(true); setPanel(null); setCourseView(false); setPointView(false); setPointTopicsId(null); setGroupTopicsId(null);
    patchChat(id,x=>({...x,unread:0}));
  };
  const closeChat=()=>{ setActiveId(null); setChatOpen(false); setCourseView(false); setPointView(false); setPointTopicsId(null); setGroupTopicsId(null); setSearch(""); };
  // Закрытие опций: если закрываем профиль «Точки» — открываем пустое окно сообщения
  const closePanel=()=>{ setPanel(null); };

  // открыть тему внутри чата «Точка» как обычный чат
  const openTopic=(topic)=>{
    // «Общая лента» для точки
    if(topic._isFeed){
      const ptChat=state.chats.find(x=>x.id===pointTopicsId);
      if(!ptChat) return;
      const tid="pfeed-"+pointTopicsId;
      const allMsgs=[];
      (ptChat.topics||[]).forEach(tp=>{
        const sender=tp.sender||"Куратор точки";
        allMsgs.push({id:uid(),t:tp.emoji+" "+tp.name+": "+tp.preview, out:tp.sender==="Вы", sender, time:tp.time||"09:00", status:"read", _topicName:tp.emoji+" "+tp.name});
      });
      setOpenedSections(prev=>({ ...prev, [tid]:{ id:tid, type:"groups", fromPoint:true, pointId:pointTopicsId,
        name:"Общая лента", verified:false, members:34, muted:false, unread:0, readOnly:true,
        roster:[
          { name:"Куратор точки", role:"owner", online:true },
          { name:"Ник", role:"admin", online:true, isMe:true },
          { name:"Лезина Когалым", role:"member", online:true },
          { name:"Зухра Когалым новый", role:"member", online:false },
        ],
        msgs:allMsgs } }));
      setActiveId(tid); setReply(null); return;
    }
    const tid="topic-"+topic.id;
    if(!openedSections[tid]){
      const ptChat=state.chats.find(x=>x.id===pointTopicsId);
      const defaultRoster=[
        { name:"Куратор точки", role:"owner", online:true },
        { name:"Ник", role:"admin", online:true, isMe:true },
        { name:"Лезина Когалым", role:"member", online:true },
        { name:"Зухра Когалым новый", role:"member", online:false },
      ];
      const roster = ptChat?.roster||defaultRoster;
      setOpenedSections(prev=>({ ...prev, [tid]:{ id:tid, type:"groups", fromPoint:true, pointId:pointTopicsId,
        name:topic.name, verified:false, members:ptChat?.roster?.length||34, muted:false, unread:0,
        requireReaction:!!topic.requireReaction,
        writeAccess: topic.writeAccess || "all",
        roster,
        msgs:topic.msgs||[
          {id:uid(),t:topic.emoji+" Тема «"+topic.name+"»",out:false,sender:topic.sender||"Куратор точки",time:topic.time||"09:00",status:"read"},
          {id:uid(),t:topic.preview,out:false,sender:topic.sender||"Куратор точки",time:topic.time||"09:01",status:"read"},
        ] } }));
    }
    setActiveId(tid); setReply(null);
  };

  // открыть тему внутри обычной группы
  const openGroupTopic=(topic)=>{
    const grpChat=state.chats.find(x=>x.id===groupTopicsId);
    if(!grpChat) return;
    // «Общая лента» — все сообщения из всех тем, только чтение
    if(topic._isFeed){
      const tid="gfeed-"+groupTopicsId;
      const allMsgs=[];
      (grpChat.topics||[]).forEach(tp=>{
        (tp.msgs||[]).forEach(m=>{
          if(m.service) { allMsgs.push({...m}); return; }
          allMsgs.push({...m, _topicName:tp.emoji+" "+tp.name});
        });
      });
      setOpenedSections(prev=>({ ...prev, [tid]:{ id:tid, type:"groups", fromGroup:true, groupId:groupTopicsId,
        name:"Общая лента", verified:false, members:grpChat.roster?.length||0, muted:false, unread:0,
        readOnly:true, roster:grpChat.roster||[],
        msgs:allMsgs } }));
      setActiveId(tid); setReply(null); return;
    }
    const tid="gtopic-"+topic.id;
    if(!openedSections[tid]){
      setOpenedSections(prev=>({ ...prev, [tid]:{ id:tid, type:"groups", fromGroup:true, groupId:groupTopicsId,
        name:topic.name, verified:false, members:grpChat.roster?.length||0, muted:false, unread:0,
        roster:grpChat.roster||[],
        msgs:topic.msgs||[] } }));
    }
    setActiveId(tid); setReply(null);
  };

  // открыть раздел курса
  const openSection=(sec)=>{
    if(sec.kind==="point"){ setPointView(true); return; }
    // section-чат: берём готовый из sectionChats или уже открытый
    if(!openedSections[sec.id]){
      const tmpl=state.sectionChats?.[sec.id] || { name:sec.name+" · Уроки от Калибри", msgs:[] };
      setOpenedSections(prev=>({ ...prev, [sec.id]:{ id:sec.id, type:"channels", fromCourse:true,
        name:tmpl.name, verified:tmpl.verified, subscribers:tmpl.subscribers, muted:false, unread:0,
        msgs:tmpl.msgs?[...tmpl.msgs]:[] } }));
    }
    setActiveId(sec.id); setReply(null); setPointView(false);
  };
  // открыть чат своей точки
  const openPointChat=()=>{
    const p=state.me.point; const pid="point-"+p.id;
    if(!openedSections[pid]){
      setOpenedSections(prev=>({ ...prev, [pid]:{ id:pid, type:"groups", fromPoint:true,
        name:p.name, online:p.online, members:34, muted:false, unread:0,
        msgs:[ {id:uid(),t:"📍 Это чат вашей точки: "+p.name,out:false,sender:"Куратор точки",time:"09:00",status:"read"},
               {id:uid(),t:"Здесь публикуются объявления вашего филиала.",out:false,sender:"Куратор точки",time:"09:01",status:"read"} ] } }));
    }
    setActiveId(pid); setReply(null); setPointView(false);
  };

  // Поиск людей: по имени/фамилии и по @юзернейму — из контактов и участников групп
  const foundPeople=()=>{
    const q=search.trim().toLowerCase().replace(/^@/,"");
    if(!q) return [];
    const seen=new Set(), out=[];
    const push=(p)=>{
      if(!p?.name || seen.has(p.name)) return;
      const nm=p.name.toLowerCase(), hd=(p.handle||"").toLowerCase();
      if(nm.includes(q) || hd.includes(q)){ seen.add(p.name); out.push(p); }
    };
    (state.contacts||[]).forEach(push);
    (state.chats||[]).forEach(c=>(c.roster||[]).forEach(r=>{ if(!r.isMe) push(r); }));
    return out.slice(0,5);
  };

  const filteredChats=()=>{
    const q=search.toLowerCase();
    // Раздел (папка) учитывается всегда — и при поиске тоже
    let list=state.chats.filter(c=>c.type===folder||(folder==="groups"&&c.type==="point"));
    // Фильтр «Новые» — только непрочитанные
    if(!q && chatFilter==="new") list=list.filter(c=>(c.unread||0)>0);
    if(!q) return [...list].sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
    // имя чата совпадает — показать как обычно
    const byName=list.filter(c=>c.name.toLowerCase().includes(q));
    // поиск по тексту сообщений — добавить чаты с совпадением (и тот текст)
    const byMsg=[];
    list.forEach(c=>{
      if(byName.find(x=>x.id===c.id)) return;
      const hit=(c.msgs||[]).slice().reverse().find(m=>(m.t||"").toLowerCase().includes(q));
      if(hit) byMsg.push({...c, _searchHit:hit.t});
    });
    // также среди byName добавить searchHit если есть
    const enriched=byName.map(c=>{
      const hit=(c.msgs||[]).slice().reverse().find(m=>(m.t||"").toLowerCase().includes(q));
      return hit?{...c, _searchHit:hit.t}:c;
    });
    return [...enriched,...byMsg].sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
  };

  // патч активного чата — работает и для обычных, и для section/point-чатов
  // Голосовое прослушано полностью — фиксируем слушателя и время
  const markVoiceListened=(msgId)=>{
    patchActive(c=>({...c, msgs:c.msgs.map(m=>{
      if(m.id!==msgId) return m;
      const list=m.listeners||[];
      if(list.find(l=>l.name===state.me.name)) return m;   // уже отмечен
      return {...m, listeners:[...list, { name:state.me.name, time:now() }]};
    })}));
  };

  const patchActive=(fn)=>{
    if(!activeId) return;
    if(openedSections[activeId]){ setOpenedSections(prev=>({ ...prev, [activeId]:fn(prev[activeId]) })); }
    else { patchChat(activeId,fn); }
  };

  const send=()=>{
    const t=draft.trim(); if(!t||!active) return;
    const msg={ id:uid(), t, out:true, time:now(), status:"sent" };
    if(reply) msg.replyTo={ name:reply.out?state.me.name:(reply.sender||active.name),
      text:reply.photo?"Фото":reply.voice?"Голосовое":reply.t };
    patchActive(c=>({...c,msgs:[...c.msgs,msg]}));
    setDraft(""); setReply(null); setEmojiOpen(false);
    setTimeout(()=>patchActive(c=>({...c,msgs:c.msgs.map(m=>m.id===msg.id?{...m,status:"delivered"}:m)})),600);
    setTimeout(()=>patchActive(c=>({...c,msgs:c.msgs.map(m=>m.id===msg.id?{...m,status:"read"}:m)})),1400);
    if(!active.saved && active.type==="personal"){
      const cid=active.id;
      setTimeout(()=>setTypingIn(cid), 700);
      setTimeout(()=>{ const R=["Понял 👌","Хорошо","Договорились 🤝","Спасибо!","Сейчас посмотрю","Отличная идея! 🔥","Да, согласен","🎯"];
        setTypingIn(null);
        patchChat(cid,c=>({...c,msgs:[...c.msgs,{id:uid(),t:R[Math.random()*R.length|0],out:false,time:now(),status:"read"}]})); },1900);
    }
  };
  const delMsg=(mid)=>patchActive(c=>({...c,msgs:c.msgs.filter(m=>m.id!==mid)}));
  // Добавить комментарий к сообщению (тред)
  const addComment=(msgId, text)=>{
    const comment={ sender:state.me.name, text, time:now(), out:true };
    patchActive(c=>({...c,msgs:c.msgs.map(m=>m.id===msgId?{...m,comments:[...(m.comments||[]),comment]}:m)}));
  };
  // Редактирование сообщения: заменяет текст и ставит флаг edited
  const editMsg=(mid,newText)=>patchActive(c=>({...c,msgs:c.msgs.map(m=>m.id===mid?{...m,t:newText,edited:true}:m)}));

  // переключить реакцию текущего пользователя
  const reactTo=(mid,emoji)=>patchActive(c=>({...c,msgs:c.msgs.map(m=>{
    if(m.id!==mid) return m;
    const r={...(m.reactions||{})};
    const mineKey=emoji+"__me";
    if(r[mineKey]){ r[emoji]=Math.max(0,(r[emoji]||1)-1); delete r[mineKey]; if(r[emoji]===0) delete r[emoji]; }
    else { r[emoji]=(r[emoji]||0)+1; r[mineKey]=true; }
    return {...m,reactions:r};
  })}));

  // закрепить/открепить сообщение (только одно закреплённое)
  const pinMsg=(mid)=>patchActive(c=>{
    const target=c.msgs.find(m=>m.id===mid);
    const willPin=!target?.pinned;
    return {...c,msgs:c.msgs.map(m=>({...m,pinned: m.id===mid ? willPin : (willPin?false:m.pinned)}))};
  });

  // пересылка: выбор сообщения -> модалка выбора чата
  const [forwardMsg,setForwardMsg]=useState(null);
  const [msgInfo,setMsgInfo]=useState(null);   // {msg, chat} для окна «Кто прочитал»
  const doForward=(targetId)=>{
    if(!forwardMsg) return;
    const src=forwardMsg;
    const fwdName = src.out ? state.me.name : (src.sender || active?.name || "Собеседник");
    const copy={ id:uid(), out:true, time:now(), status:"sent", forwarded:fwdName,
      t:src.t, photo:src.photo, voice:src.voice };
    if(openedSections[targetId]){ setOpenedSections(prev=>({ ...prev, [targetId]:{...prev[targetId], msgs:[...prev[targetId].msgs, copy]} })); }
    else patchChat(targetId,c=>({...c,msgs:[...c.msgs,copy]}));
    setForwardMsg(null);
    openChat(targetId);
  };
  const fmtSize=(b)=>{ if(b<1024)return b+" Б"; if(b<1048576)return (b/1024).toFixed(0)+" КБ"; return (b/1048576).toFixed(1)+" МБ"; };
  const pushMedia=(payload)=>{
    const msg={ id:uid(), out:true, t:"", time:now(), status:"sent", ...payload };
    patchActive(c=>({...c,msgs:[...c.msgs,msg]}));
    setTimeout(()=>patchActive(c=>({...c,msgs:c.msgs.map(m=>m.id===msg.id?{...m,status:"delivered"}:m)})),600);
    setTimeout(()=>patchActive(c=>({...c,msgs:c.msgs.map(m=>m.id===msg.id?{...m,status:"read"}:m)})),1400);
  };
  const onAttach=(kind, e, raw)=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader();
    r.onload=()=>{
      if(kind==="photo") pushMedia({ photo:r.result, raw:!!raw });
      else if(kind==="video") pushMedia({ video:r.result, raw:!!raw });
      else if(kind==="audio"){
        // Аудиофайл отправляем как голосовое: читаем длительность
        const au=new Audio();
        au.onloadedmetadata=()=>{
          const sec=Math.max(1, Math.round(au.duration||0));
          const dur=`${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;
          pushMedia({ voice:dur, voiceSrc:r.result });
        };
        au.onerror=()=>pushMedia({ voice:"00:05", voiceSrc:r.result });
        au.src=r.result;
      }
      else pushMedia({ file:{ name:f.name, size:fmtSize(f.size), data:r.result }, raw:!!raw });
    };
    r.readAsDataURL(f); e.target.value=""; };
  const onPhoto=(e)=>onAttach("photo", e, false);

  const startRec=async()=>{
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      micStreamRef.current=stream;
    } catch(e) { /* продолжаем запись даже без разрешения */ }
    setRecording(true); setRecSec(0); recTimer.current=setInterval(()=>setRecSec(s=>s+1),1000);
  };
  const stopMicStream=()=>{ if(micStreamRef.current){ micStreamRef.current.getTracks().forEach(t=>t.stop()); micStreamRef.current=null; } };
  const cancelRec=()=>{ clearInterval(recTimer.current); setRecording(false); stopMicStream(); };
  const stopRec=()=>{ clearInterval(recTimer.current); setRecording(false); stopMicStream();
    const d=`${String(Math.floor(recSec/60)).padStart(2,"0")}:${String(recSec%60).padStart(2,"0")}`;
    patchActive(c=>({...c,msgs:[...c.msgs,{id:uid(),voice:d,out:true,time:now(),status:"sent"}]})); };

  const openStory=(s)=>{ setState(st=>({...st,stories:st.stories.map(x=>x.id===s.id?{...x,seen:true}:x)})); setStory(s); };
  const addStory=()=>setNewStory({ text:"", photo:null, video:null, textColor:"#fff", textPos:"bottom" });
  const storyPickPhoto=(e)=>{ const f=e.target.files[0]; if(!f) return;
    const isVideo=f.type.startsWith("video");
    const r=new FileReader();
    r.onload=()=>setNewStory(ns=>({...ns, photo:isVideo?null:r.result, video:isVideo?r.result:null}));
    r.readAsDataURL(f); e.target.value=""; };
  const publishStory=()=>{ if(!newStory?.photo && !newStory?.video){ setNewStory(null); return; }
    setState(st=>({...st,stories:[{id:uid(),name:st.me.name,seen:false,text:newStory.text||"",
      photo:newStory.photo, video:newStory.video,
      textColor:newStory.textColor||"#fff", textPos:newStory.textPos||"bottom"},...st.stories]}));
    setNewStory(null); };

  // ===== Фотоотчёты =====
  const updateReport = (updated) => {
    setState(st=>({...st, photoReports: st.photoReports.map(r=>r.id===updated.id?updated:r)}));
  };
  const submitReport = (items, reportType="open") => {
    const t = now();
    const ptSettings = state.photoReportSettings?.["point"] || {};
    const deadline = reportType==="close"
      ? (ptSettings.closeDeadline || "22:10")
      : (ptSettings.openDeadline || "10:03");
    const isLate = t > deadline;
    const rpt = {
      id: uid(), pointId: "point",
      pointName: state.chats.find(c=>c.id==="point")?.name || "Точка",
      sender: state.me.name,
      curatorName: "Куратор точки",
      date: "Сегодня", time: t,
      reportType, status: "pending", late: isLate, items
    };
    setState(st=>({...st, photoReports: [rpt, ...st.photoReports]}));
    if(isLate) {
      setToast({ title:"⚠️ Опоздание зафиксировано", sub:`Отчёт отправлен в ${t}, крайний срок — ${deadline}` });
    }
  };
  const viewingReport = reportView ? state.photoReports.find(r=>r.id===reportView) : null;
  // Является ли текущий пользователь куратором для данного отчёта
  const isCuratorFor = (rpt) => rpt?.curatorName === state.me.name;

  // свой диалог подтверждения вместо window.confirm — он не работает в некоторых
  // встроенных превью-окнах (например, в песочнице внутри iframe без allow-modals),
  // из-за чего кнопки вроде «Выйти из аккаунта» выглядели нерабочими
  const askConfirm=(message,onYes,confirmLabel)=>setConfirmDlg({message,onYes,confirmLabel});

  const delChat=(id)=>{ askConfirm("Удалить чат?",()=>{ setState(s=>({...s,chats:s.chats.filter(x=>x.id!==id)})); if(activeId===id) closeChat(); },"Удалить"); };
  const chatCtx=(e,c)=>{ e.preventDefault(); setCtx({ x:e.clientX, y:e.clientY, items:[
    { Icon:c.pinned?PinOff:Pin, label:(c.pinned?"Открепить":"Закрепить"), fn:()=>patchChat(c.id,x=>({...x,pinned:!x.pinned})) },
    { Icon:c.muted?Bell:BellOff, label:(c.muted?"Включить звук":"Выключить звук"), fn:()=>patchChat(c.id,x=>({...x,muted:!x.muted})) },
    { Icon:CheckCheck, label:"Прочитано", fn:()=>patchChat(c.id,x=>({...x,unread:0})) },
    { Icon:Trash2, label:"Удалить чат", danger:true, fn:()=>delChat(c.id) },
  ] }); };

  const newChatType=(type)=>{ const label=type==="groups"?"Название группы":type==="channels"?"Название канала":"Имя собеседника";
    setModal({step:"name", type, label, nameVal:""});
    setTimeout(()=>newChatInputRef.current?.focus(), 100); };
  const confirmNewChat=()=>{
    if(!modal||modal.step!=="name") return;
    const name=(modal.nameVal||"").trim(); if(!name){ setModal(null); return; }
    const c={ id:uid(), type:modal.type, name, online:modal.type==="personal", muted:false, unread:0, msgs:[] };
    if(modal.type==="groups") c.members=1; if(modal.type==="channels") c.subscribers="1";
    setState(s=>({...s,chats:[c,...s.chats]})); setTab("chats"); setModal(null); openChat(c.id); };
  const startChatWith=(name)=>{ let c=state.chats.find(x=>x.name===name&&x.type==="personal");
    if(!c){ c={ id:uid(), type:"personal", name, online:false, muted:false, unread:0, msgs:[] }; setState(s=>({...s,chats:[c,...s.chats]})); }
    setTab("chats"); openChat(c.id); };

  // Запуск звонка: открывает экран звонка и добавляет запись в журнал
  const startCall=(name, kind)=>{
    if(!name){ return; }
    setCall({ name, kind: kind||"audio" });
  };
  const endCall=(logged)=>{
    if(call){
      setState(s=>({ ...s, calls:[{ id:uid(), name:call.name, dir:"out",
        missed: !logged, kind:call.kind, time:now(), date:"Сегодня",
        dur: logged ? logged.dur : null }, ...s.calls] }));
    }
    setCall(null);
  };
  // старая обёртка stub теперь запускает звонок (video=true → видеозвонок)
  const stub=(v)=>{ if(active) startCall(active.name, v?"video":"audio"); };
  // выход из аккаунта: чаты сохраняются в state, показываем экран входа
  const logout=()=>{
    closeChat(); setPanel(null); setActiveId(null); setChatOpen(false);
    setTab("chats"); setFolder("personal"); setSearch(""); setCall(null); setForwardMsg(null);
    setAuthed(false);
  };
  const login=(asRole)=>{
    if(asRole){
      const role = asRole==="member" ? "member" : "owner";
      setState(s=>({...s,
        me:{...s.me, role},
        chats:(s.chats||[]).map(c=>({...c,
          roster:(c.roster||[]).map(r=>r.isMe?{...r, role}:r)}))}));
    }
    setAuthed(true); setTab("chats");
  };
  // регистрация: новая заявка уходит в список "registrationRequests", её видит администратор
  // на экране «Заявки на регистрацию» (в настройках) и одобряет/отклоняет
  const registerRequest=(data)=>{
    setState(s=>({...s, registrationRequests:[
      { id:uid(), name:data.name, phone:data.phone, point:data.point, time:now(), status:"pending" },
      ...(s.registrationRequests||[]),
    ]}));
  };

  const isNarrow = typeof window!=="undefined" && window.innerWidth<=768;

  if(!authed){
    return (
      <>
        <style>{STYLES}</style>
        <LoginScreen theme={state.settings.theme} me={state.me} onLogin={login} onRegister={registerRequest}/>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className={"kb-root"+(chatOpen?" chat-open":"")+(showInstall?" install-banner-on":"")} data-theme={state.settings.theme}
        style={{ "--scale":state.settings.textScale||1,
          "--chat-bg": (WALLPAPERS.find(w=>w.id===state.settings.wallpaper)?.css)
            || (state.settings.wallpaper && (state.settings.wallpaper.startsWith("#") || state.settings.wallpaper.startsWith("url("))
                ? state.settings.wallpaper : undefined),
          "--chat-bg-size": (state.settings.wallpaper||"").startsWith("url(") ? "cover" : undefined }}>

        {/* Баннер «Установить как приложение» */}
        {showInstall &&
          <div className="install-banner">
            <div className="install-banner-ic"><img src={LOGO} alt=""/></div>
            <div className="install-banner-text">
              <div className="install-banner-title">Установить Калибри</div>
              <div className="install-banner-sub">Добавьте приложение на главный экран</div>
            </div>
            <button className="install-banner-btn" onClick={()=>{
              const p=window.__kbDeferredPrompt;
              if(p){ window.__kbDeferredPrompt=null; p.prompt();
                p.userChoice&&p.userChoice.then(ch=>{ if(ch&&ch.outcome==="accepted"){ setShowInstall(false);
                  setToast({title:"Приложение установлено ✅",sub:"Калибри добавлен на главный экран"}); } }); }
              else setInstallConfirm(true);
            }}>Установить</button>
            <button className="install-banner-x" onClick={()=>setShowInstall(false)} title="Скрыть"><X size={18}/></button>
          </div>}
        {installConfirm &&
          <div className="kb-inst-ovl" onClick={()=>setInstallConfirm(false)}>
            <div className="kb-inst-box" onClick={e=>e.stopPropagation()}>
              <div className="kb-inst-title">Установка приложения</div>
              <div className="kb-inst-text">{/iP(hone|ad|od)/.test(navigator.userAgent)
                ? "Нажмите кнопку «Поделиться» внизу Safari и выберите «На экран “Домой”»."
                : "Откройте меню браузера (⋮) и выберите «Установить приложение» или «Добавить на главный экран»."}</div>
              <div className="kb-inst-row">
                <button className="kb-inst-btn ghost" onClick={()=>setInstallConfirm(false)}>Закрыть</button>
                <button className="kb-inst-btn pri" onClick={()=>setInstallConfirm(false)}>Понятно</button>
              </div>
            </div>
          </div>}

        {/* Rail */}
        <div className="rail">
          <RailItem Icon={MessageCircle} l="Чаты" b={totalUnread} active={tab==="chats"&&folder==="personal"} onClick={()=>{setTab("chats");setFolder("personal");setPanel(null);}}/>
          <RailItem Icon={User} l="Контакты" active={tab==="contacts"} onClick={()=>{setTab("contacts");setPanel(null);}}/>
          <RailItem Icon={Phone} l="Звонки" active={tab==="calls"} onClick={()=>{setTab("calls");setPanel(null);}}/>
          <div style={{width:36,height:1,background:"var(--line)",margin:"6px 0"}}/>
          {FOLDERS.filter(f=>f.id!=="all"&&f.id!=="personal").map(f=>{ const cnt=state.chats.filter(c=>c.type===f.id||(f.id==="groups"&&c.type==="point")).reduce((a,c)=>a+(c.unread||0),0);
            return <RailItem key={f.id} Icon={f.Icon} l={f.name} b={cnt} active={tab==="chats"&&folder===f.id}
              onClick={()=>{setTab("chats");setFolder(f.id);setPanel(null);}}/>; })}
          <div style={{flex:1}}/>
          <RailItem Icon={Settings} l="Опции" active={tab==="settings"} onClick={()=>{if(tab!=="settings") prevTabRef.current={t:tab,f:folder}; setTab("settings");setPanel({kind:"settings"});}}/>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-inner" key={tab}>
          <div className="side-head">
            {tab==="settings" &&
              <button className="back-btn" onClick={()=>{ const pv=prevTabRef.current||{t:"chats",f:"personal"};
                setTab(pv.t); if(pv.t==="chats") setFolder(pv.f||"personal"); setPanel(null); }}>
                <ChevronLeft size={26}/></button>}
            {tab!=="settings" && <div className="side-logo"><img src={LOGO} alt="Калибри"/></div>}
            <div className="side-title">{tab==="contacts"?"Контакты":tab==="calls"?"Звонки":tab==="settings"?"Настройки":folder==="groups"?"Группы":folder==="channels"?"Каналы":"Чаты"}</div>
            {tab==="chats" &&
              <div className="stories-mini" onClick={()=>setStoriesOpen(o=>!o)} title="Истории">
                {state.stories.filter(s=>!s.seen).slice(0,3).map(s=>
                  <span key={s.id} className="stories-mini-ring">
                    <Avatar name={s.name} photo={s.photo} size={24}/>
                  </span>)}
              </div>}
          </div>
          {tab==="chats" && storiesOpen &&
            <div className="stories-wrap">
              <div className="stories-title">Истории</div>
              <div className="stories">
                <Story add onClick={addStory}/>
                {state.stories.map(s=><Story key={s.id} s={s} onClick={()=>openStory(s)}/>)}
              </div>
            </div>}

          {tab!=="settings" &&
          <div className="search-box">
            <Search size={18}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск"/>
            {search && <button className="search-clear" onClick={()=>setSearch("")} title="Очистить"><X size={16}/></button>}
          </div>}

          {tab==="chats" &&
            <div className="chat-filter-tabs">
              <button className={"chat-filter-tab"+(chatFilter==="all"?" active":"")} onClick={()=>setChatFilter("all")}>Все</button>
              <button className={"chat-filter-tab"+(chatFilter==="new"?" active":"")} onClick={()=>setChatFilter("new")}>Новые</button>
            </div>}

          {/* Мигающие темы без реакции */}
          {tab==="chats" && folder==="groups" && (()=>{
            const alerts=[];
            state.chats.filter(c=>c.type==="point"||c.type==="groups").forEach(ch=>{
              (ch.topics||[]).filter(tp=>tp.requireReaction).forEach(tp=>{
                const msgs=tp.msgs||[];
                const unreacted=msgs.filter(m=>m.needReaction && !(m.reactions&&m.reactions.length));
                if(unreacted.length>0) alerts.push({chat:ch, topic:tp, count:unreacted.length});
              });
            });
            return alerts.length>0 ? <div className="unreacted-alerts">
              {alerts.map(a=>
                <div key={a.topic.id} className="unreacted-alert" onClick={()=>{
                  if(a.chat.type==="point"){setPointTopicsId(a.chat.id);openTopic(a.topic);}
                  else{setGroupTopicsId(a.chat.id);openGroupTopic(a.topic);}
                }}>
                  <span className="unreacted-dot"/>
                  <span className="unreacted-emoji">{a.topic.emoji}</span>
                  <div className="unreacted-info">
                    <div className="unreacted-name">{a.topic.name}</div>
                    <div className="unreacted-sub">{a.chat.name} · {a.count} без реакции</div>
                  </div>
                  <span className="unreacted-badge">{a.count}</span>
                </div>)}
            </div> : null;
          })()}

          <div className="list" key={tab+"-"+folder}>
            {tab==="settings" && <div className="settings-page">
              <div className="p-hero">
                <Avatar name={state.me.name} size={108} emoji={state.me.emoji} color={state.me.avatarColor} photo={state.me.photo} online={true}/>
                <div className="p-name">{state.me.name}</div>
                {(state.me.handle || state.me.phone) && <div className="p-id-row">
                  {state.me.handle && <span className="p-id-handle">@{state.me.handle}</span>}
                  {state.me.handle && state.me.phone && <span className="p-id-dot">·</span>}
                  {state.me.phone && <span className="p-id-phone">{state.me.phone}</span>}
                </div>}
              </div>
              <div className="s-card">
                <div className="s-row" onClick={()=>setPanel({kind:"notifications"})}><span className="s-ic"><Bell size={20}/></span><span className="s-label">Уведомления</span><ChevronRight size={18} color="var(--sub)"/></div>
                <div className="s-row" onClick={()=>setPanel({kind:"messages"})}><span className="s-ic"><MessageCircle size={20}/></span><span className="s-label">Сообщения</span><ChevronRight size={18} color="var(--sub)"/></div>
                <div className="s-row" onClick={()=>setPanel({kind:"folders"})}><span className="s-ic"><Settings size={20}/></span><span className="s-label">Папки</span><ChevronRight size={18} color="var(--sub)"/></div>
              </div>
              <div className="s-card">
                <div className="s-row" onClick={()=>setPanel({kind:"media"})}><span className="s-ic"><ImageIcon size={20}/></span><span className="s-label">Медиа</span><ChevronRight size={18} color="var(--sub)"/></div>
                <div className="s-row" onClick={()=>setPanel({kind:"storage"})}><span className="s-ic"><Clock size={20}/></span><span className="s-label">Память</span><ChevronRight size={18} color="var(--sub)"/></div>
              </div>
              <div className="s-card">
                <div className="s-row" onClick={()=>setPanel({kind:"appearance"})}><span className="s-ic"><Eye size={20}/></span><span className="s-label">Оформление</span><ChevronRight size={18} color="var(--sub)"/></div>
              </div>
              <div className="s-card">
                <div className="s-row" onClick={()=>setPanel({kind:"about"})}><span className="s-ic"><Activity size={20}/></span><span className="s-label">Помощь</span><ChevronRight size={18} color="var(--sub)"/></div>
                <div className="s-row" onClick={()=>setPanel({kind:"about"})}><span className="s-ic"><CheckCircle2 size={20}/></span><span className="s-label">О Калибри</span><span className="s-val">Версия 3.1</span></div>
              </div>
              <div className="s-card">
                <div className="s-row" onClick={()=>setPanel({kind:"requests"})}><span className="s-ic"><Plus size={20}/></span><span className="s-label">Заявки на регистрацию</span><ChevronRight size={18} color="var(--sub)"/></div>
                <div className="s-row" onClick={()=>setPanel({kind:"accounts"})}><span className="s-ic"><Users size={20}/></span><span className="s-label">Аккаунты</span><ChevronRight size={18} color="var(--sub)"/></div>
                <div className="s-row" onClick={()=>setPanel({kind:"groupManager"})}><span className="s-ic"><Users size={20}/></span><span className="s-label">Группы и отделы</span><ChevronRight size={18} color="var(--sub)"/></div>
              </div>
              <div className="s-card">
                <div className="s-row danger" onClick={()=>askConfirm("Выйти из аккаунта? Ваши чаты сохранятся.",()=>{setPanel(null);logout();},"Выйти")}><span className="s-ic"><PhoneOff size={20}/></span><span className="s-label">Выйти из аккаунта</span></div>
              </div>
            </div>}
            {tab==="contacts" && state.contacts.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())).map(c=>
              <div key={c.name} className="chat-row">
                <div className="chat-row-inner" onClick={()=>startChatWith(c.name)}>
                  <Avatar name={c.name} online={c.online} size={50}/>
                  <div className="chat-main"><div className="chat-name">{c.name}</div>
                    <div className="chat-preview">{c.online?"в сети":"был(а) недавно"}</div></div>
                  <button className="contact-call" onClick={e=>{e.stopPropagation();startCall(c.name,"audio");}} title="Аудиозвонок"><Phone size={18}/></button>
                  <button className="contact-call" onClick={e=>{e.stopPropagation();startCall(c.name,"video");}} title="Видеозвонок"><Video size={18}/></button>
                </div></div>)}

            {tab==="calls" && (state.calls?.length ?
              (()=>{ // группировка по дате
                const groups={}; state.calls.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()))
                  .forEach(c=>{ (groups[c.date]=groups[c.date]||[]).push(c); });
                return Object.entries(groups).map(([date,items])=>
                  <div key={date}>
                    <div className="s-group-title">{date}</div>
                    {items.map(c=><CallRow key={c.id} c={c} onCall={(k)=>startCall(c.name,k)}/>)}
                  </div>);
              })()
              :
              <div style={{ padding:"50px 20px", textAlign:"center", color:"var(--sub)" }}>
                <PhoneOff size={48} style={{margin:"0 auto 16px"}}/>
                <div style={{marginBottom:8,fontWeight:600,color:"var(--ink)"}}>Журнал звонков пуст</div>
                <div style={{fontSize:13}}>Позвоните из чата или списка контактов</div></div>)}

            {tab==="chats" && search && foundPeople().length>0 && <>
              <div className="s-group-title">Люди</div>
              {foundPeople().map(p=>
                <div key={p.name} className="person-hit">
                  <Avatar name={p.name} size={46} online={p.online}/>
                  <div className="person-hit-main">
                    <div className="person-hit-name">{p.name}</div>
                    <div className="person-hit-sub">
                      {p.handle ? "@"+p.handle : (p.online?"в сети":"был(а) недавно")}
                      {p.tag && <span className="person-hit-tag">{p.tag}</span>}
                    </div>
                  </div>
                  <button className="person-hit-btn" title="Написать"
                    onClick={()=>{ setSearch(""); startChatWith(p.name); }}><MessageCircle size={18}/></button>
                  <button className="person-hit-btn" title="Позвонить"
                    onClick={()=>startCall(p.name,"audio")}><Phone size={18}/></button>
                  <button className="person-hit-btn" title="Видеозвонок"
                    onClick={()=>startCall(p.name,"video")}><Video size={18}/></button>
                </div>)}
              <div className="s-group-title">Сообщения</div>
            </>}

            {tab==="chats" && (filteredChats().length ? filteredChats().map(c=>
              <ChatRow key={c.id} c={c} active={activeId===c.id} onClick={()=>openChat(c.id)}
                onCtx={e=>chatCtx(e,c)} onCall={()=>stub(true)} onDelete={()=>delChat(c.id)}
                onAvatar={()=>setPanel({kind:"profile",id:c.id})} typing={typingIn===c.id}/>
            ) : (foundPeople().length===0 ? <div className="empty-search">
                <Search size={34}/>
                <div className="empty-search-title">{search ? "Ничего не найдено" : "Нет чатов"}</div>
                {search && <div className="empty-search-sub">Попробуйте изменить запрос</div>}
              </div> : null))}
          </div>
          </div>

          <div className="bottom-nav">
            <BottomNav tab={tab} folder={folder} totalUnread={totalUnread}
              groupsUnread={state.chats.filter(c=>c.type==="groups").reduce((a,c)=>a+(c.unread||0),0)}
              onTab={(t)=>{ if(t==="settings"&&tab!=="settings") prevTabRef.current={t:tab,f:folder}; setTab(t); if(t==="chats") setFolder("personal"); setPanel(null); }}
              onGroups={()=>{ setTab("chats"); setFolder("groups"); setPanel(null); }}/>
          </div>
        </div>

        {/* Main */}
        <div className="main">
          {pointView ?
            <PointView point={state.me.point} onBack={()=>{ setPointView(false); }}
              onOpen={openPointChat}/>
          : (pointTopicsId && !active) ?
            <PointTopics chat={state.chats.find(c=>c.id===pointTopicsId)} onBack={closeChat}
              onOpenTopic={openTopic}
              canManage={(()=>{const ch=state.chats.find(c=>c.id===pointTopicsId); const r=(ch?.roster||[]).find(x=>x.isMe); return r?.role==="owner"||r?.role==="admin";})()}
              onProfile={()=>setPanel({kind:"profile",id:pointTopicsId})}
              onStandards={()=>setPanel({kind:"standards",id:pointTopicsId})}
              onMembers={()=>setPanel({kind:"members",id:pointTopicsId})}
              formsBlock={<GroupFormsBlock enabled={state.groupForms?.[pointTopicsId]} onOpen={setFormOpen}/>}/>
          : (groupTopicsId && !active) ?
            <PointTopics chat={state.chats.find(c=>c.id===groupTopicsId)} onBack={closeChat}
              onOpenTopic={openGroupTopic}
              canManage={(()=>{const ch=state.chats.find(c=>c.id===groupTopicsId); const r=(ch?.roster||[]).find(x=>x.isMe); return r?.role==="owner"||r?.role==="admin";})()}
              onProfile={()=>setPanel({kind:"profile",id:groupTopicsId})}
              onStandards={()=>setPanel({kind:"standards",id:groupTopicsId})}
              onMembers={()=>setPanel({kind:"members",id:groupTopicsId})}
              formsBlock={<GroupFormsBlock enabled={state.groupForms?.[groupTopicsId]} onOpen={setFormOpen}/>}/>
          : (courseView && !active) ?
            <CourseChat chat={courseChat} me={state.me} onBack={closeChat} onPhotoView={setLightbox} stub={stub}
              onProfile={()=>setPanel({kind:"profile",id:courseChat.id})}/>
          : !active ?
            <div className="empty">
              <img src={LOGO} alt=""/>
              <div className="empty-hint">Выберите чат, чтобы начать общение</div>
            </div>
          : templateView ?
            <WorkTemplates
              config={{
                employees: state.attractionCheck?.employees || ["Лезина Когалым","Милана","Зухра Когалым новый","Ясмина","Анна Петрова"],
                pointName: state.chats.find(c=>c.id==="point")?.name || "Точка",
                employeeName: state.me.name,
                customTemplates: state.customTemplates || [],
              }}
              startTemplate={typeof templateView==="string"?templateView:null}
              onBack={()=>setTemplateView(false)}
              onSend={(report)=>{
                // Единая карточка отчёта (одинаковый вид для всех тем)
                const card={
                  emoji: report.categoryEmoji || "📋",
                  color: report.categoryColor || "#a878f0",
                  title: report.templateName || "Отчёт",
                  subtitle: report.categoryName || "",
                  employee: report.employee || state.me.name,
                  point: report.pointName || (state.chats.find(c=>c.id==="point")?.name || ""),
                  time: report.time || now(),
                  photoCount: report.photoCount || 0,
                  videoCount: report.videoCount || 0,
                  fields: report.fields || [],
                  comment: report.comment || "",
                  status: "pending",           // «Не проверен» до проверки куратором
                  checkedBy: null,
                };
                const msg={ id:uid(), out:true, time:now(), status:"sent", reportCard:card };
                if(active){
                  if(openedSections[activeId]){ setOpenedSections(prev=>({...prev,[activeId]:{...prev[activeId],msgs:[...prev[activeId].msgs,msg]}})); }
                  else { patchChat(activeId,c=>({...c,msgs:[...c.msgs,msg]})); }
                }
                // Дублируем отчёт в группу «Управление» (контроль)
                const ctrlMsg={ id:uid(), out:false, sender:state.me.name, time:now(), status:"sent",
                  reportCard:{...card} };
                setState(s=>({...s,
                  customTemplates: report._customTemplates || s.customTemplates,
                  chats: s.chats.map(c=>{
                    if(c.id!=="g-mgmt") return c;
                    const topics=(c.topics||[]).map(t=>
                      (t.id==="tp-mgmt-ctrl")
                        ? {...t, msgs:[...(t.msgs||[]), ctrlMsg]} : t);
                    return {...c, topics, msgs:[...(c.msgs||[]), ctrlMsg], unread:(c.unread||0)+1};
                  })
                }));
                setToast({title:"Отчёт отправлен ✅", sub:"Ожидает проверки куратором"});
              }}/>
          : active.id==="topic-tp-sched" ?
            <PointSchedule msgs={active.msgs||[]} roster={
              (state.chats.find(c=>c.id==="point")||{}).roster||[]}
              me={state.me}
              onSend={(text)=>{
                const msg={id:uid(),t:text,out:true,sender:state.me.name,time:now(),status:"sent"};
                setOpenedSections(prev=>({...prev,[activeId]:{...prev[activeId],msgs:[...(prev[activeId]?.msgs||[]),msg]}}));
              }}
              onBack={()=>{ setActiveId(null); setPointTopicsId(active.pointId||"point"); }}
              onToast={setToast}/>
          : active.id==="topic-tp-mgmt-schedule" ?
            <CuratorSchedule schedule={state.curatorSchedule}
              onBack={()=>{ setActiveId(null); setPointTopicsId(active.pointId); }}
              onUpdate={(sched)=>setState(s=>({...s, curatorSchedule:sched}))}/>
          :
            <ChatView active={active} me={state.me} reply={reply} draft={draft} setDraft={setDraft}
              emojiOpen={emojiOpen} setEmojiOpen={setEmojiOpen} recording={recording} recSec={recSec}
              onBack={()=>{
                if(active.pointId){ setActiveId(null); setPointTopicsId(active.pointId); }
                else if(active.groupId){ setActiveId(null); setGroupTopicsId(active.groupId); }
                else if(active.fromCourse||active.fromPoint){ setActiveId(null); setCourseView(!active.fromPoint); setPointView(active.fromPoint); }
                else closeChat(); }}
              onProfile={()=>{
                // Если мы внутри темы — открываем настройки этой темы
                const topicPrefix = active.id?.startsWith("topic-") ? "topic-" : active.id?.startsWith("gtopic-") ? "gtopic-" : null;
                if(topicPrefix){
                  const topicId = active.id.slice(topicPrefix.length);
                  const chatId = active.pointId || active.groupId;
                  setPanel({kind:"topicSettings", chatId, topicId});
                } else {
                  setPanel({kind:"profile",id:active.pointId||active.groupId||active.id});
                }
              }} onStub={stub}
              onSend={send} onReply={setReply} cancelReply={()=>setReply(null)} onDelete={delMsg}
              onPhotoPick={onPhoto} onAttach={onAttach} onPhotoView={setLightbox} startRec={startRec} cancelRec={cancelRec} stopRec={stopRec}
              msgEndRef={msgEndRef} inputRef={inputRef} typing={typingIn===active.id}
              onReact={reactTo} onForward={setForwardMsg} onPin={pinMsg}
              onInfo={(m)=>setMsgInfo({ msg:m, chat:active })} onEditMsg={editMsg}
              onReactionsDetail={(m)=>setReactionsDetail({ msg:m, chat:active })}
              onPlayVoice={(m)=>playVoice(m, active.name)}
              voiceBar={voicePlay &&
                <div className="voice-bar">
                  <button className="vb-btn" onClick={()=>voiceSeek(-5)} title="Назад 5с"><SkipBack size={20}/></button>
                  <button className="vb-btn vb-play" onClick={voiceToggle} title={voicePlay.playing?"Пауза":"Играть"}>
                    {voicePlay.playing ? <Pause size={20}/> : <Play size={20}/>}</button>
                  <button className="vb-btn" onClick={()=>voiceSeek(5)} title="Вперёд 5с"><SkipForward size={20}/></button>
                  <div className="vb-main">
                    <div className="vb-name">{voicePlay.name}</div>
                    <div className="vb-sub">Аудиосообщение</div>
                  </div>
                  <span className="vb-time">{voicePlay.dur}</span>
                  <button className="vb-btn vb-rate" onClick={voiceRate} title="Скорость">{voicePlay.rate}×</button>
                  <button className="vb-btn" onClick={voiceClose} title="Закрыть"><X size={20}/></button>
                  <div className="vb-progress"><i style={{width:(voicePlay.prog*100)+"%"}}/></div>
                </div>}
              voicePlayingId={voicePlay?.playing?voicePlay.id:null}
              onVoiceListened={markVoiceListened}
              onVoiceListeners={(m)=>setVoiceListeners({ msg:m, chat:active })}
              onAddComment={addComment} onToast={setToast}
              writeAccessLive={(()=>{
                const ownerId = active.pointId || active.groupId;
                const oc = state.chats.find(c=>c.id===ownerId);
                const tid = (active.id||"").replace(/^g?topic-/,"");
                const tp = (oc?.topics||[]).find(t=>t.id===tid);
                return tp?.writeAccess || active.writeAccess || "all";
              })()}
              onExplain={()=>{ setTemplateView("explanation"); }}
              onTemplate={(()=>{
                // Шаблоны доступны только в группах точек (не в управлении, уроках, стажёрах, личных чатах)
                const ownerId = active.pointId || active.groupId || active.id;
                const ownerChat = state.chats.find(c=>c.id===ownerId) || active;
                const isPointGroup = ownerChat?.type==="point" && ownerId!=="g-mgmt";
                return isPointGroup ? ()=>setTemplateView(true) : undefined;
              })()}
              extraContent={(active.id==="g-mgmt"||active.groupId==="g-mgmt"||active.pointId==="g-mgmt")?
                <>{(active.id==="g-mgmt"||active.id==="topic-tp-mgmt-ctrl") && <>
                    {(state.photoReports||[]).length>0 &&
                      <ControlSection icon={Camera} iconColor="#25d10a"
                        title="Фотоотчёты"
                        summary={(state.photoReports||[]).map(r=>(r.pointName||"")+" · "+(({pending:"Ожидает",rejected:"Исправить",accepted:"Принят"})[r.status]||r.status)).join("; ")}
                        onExpand={()=>setControlDetail("photos")}/>}
                    {(state.breakRecords||[]).length>0 &&
                      <ControlSection icon={Coffee} iconColor="#e8a838"
                        title="Перерывы"
                        summary={(()=>{const brs=state.breakRecords||[]; const active2=brs.filter(b=>b.status==="active"); const done=brs.filter(b=>b.status==="returned"||b.status==="early"); const late=brs.filter(b=>b.status==="late"||b.status==="noConfirm"); const parts=[]; if(active2.length)parts.push("На перерыве: "+active2.length); if(done.length)parts.push("Вернулись: "+done.length); if(late.length)parts.push("Опоздания: "+late.length); return parts.join(" · ")||"Нет активных";})()}
                        onExpand={()=>setControlDetail("breaks")}/>}
                    {(state.timeManagementData||[]).length>0 &&
                      <ControlSection icon={Activity} iconColor="#ef6ba8"
                        title="Тайм-менеджмент"
                        summary={(()=>{const cities=state.timeManagementData||[]; const total=cities.reduce((s,c)=>s+c.total,0); const reacted=cities.reduce((s,c)=>s+c.reacted,0); const missed=cities.reduce((s,c)=>s+c.missed,0); return cities.length+" гор. · "+reacted+" реакций"+(missed>0?" · "+missed+" пропущено":"");})()}
                        onExpand={()=>setControlDetail("time")}/>}
                  </>}
                  {(active.id==="topic-tp-mgmt-attract") &&
                    <AttractionCheckCard checkData={state.attractionCheck} onSubmit={(d)=>{
                      setState(st=>({...st, attractionCheckReports:[{id:uid(),...d,at:Date.now()},...(st.attractionCheckReports||[])]}));
                      setToast({title:"Проверка отправлена ✅",sub:"Данные привлечения сохранены"});
                    }}/>}
                </>:null}
              bottomExtra={(active.pointId && active.pointId!=="g-mgmt") ? (()=>{
                const ptId = active.pointId||"point";
                const cfg = state.photoReportSettings?.[ptId] || {};
                const t = now();
                const openDL = cfg.openDeadline || "10:03";
                const closeStart = cfg.closeStart || "22:00";
                const closeDL = cfg.closeDeadline || "22:10";
                const showOpen = t <= openDL;
                const showClose = t >= closeStart;
                // Перерывы: показываем карточку если текущее время в интервале перерыва
                const breaks = cfg.breaks || [];
                const activeBreaks = breaks.filter(b=>b.enabled!==false && t>=b.start && t<=b.end);
                // Проверяем блокировку: есть ли активный перерыв коллеги
                const colleagueOnBreak = (state.breakRecords||[]).find(br=>
                  br.status==="active" && br.employeeName!==state.me.name && br.pointName===active.name);
                return <>
                  {showOpen && state.photoReportOpenChecklist?.length ?
                    <ReportChecklist checklist={state.photoReportOpenChecklist}
                      deadline={openDL} reportType="open" onSubmit={submitReport}/>:null}
                  {showClose && state.photoReportCloseChecklist?.length ?
                    <ReportChecklist checklist={state.photoReportCloseChecklist}
                      deadline={closeDL} reportType="close" onSubmit={submitReport}/>:null}
                  {/* Карточки перерывов в рабочей группе */}
                  {(state.breakRecords||[]).filter(br=>br.pointName===active.name).map(br=>
                    <BreakCard key={br.id} breakData={br} isCurator={false}/>)}
                  {/* Кнопка демо: начать перерыв */}
                  {activeBreaks.length>0 && !activeBreak && !colleagueOnBreak &&
                    <div className="brk-trigger-card" onClick={()=>setBreakModal({
                      type:"start", breakCfg:activeBreaks[0],
                      pointName:active.name||"Отдел"})}>
                      <Coffee size={18} color="#25d10a"/>
                      <div className="brk-trigger-info">
                        <div className="brk-trigger-title">{activeBreaks[0].name||"Перерыв"}</div>
                        <div className="brk-trigger-sub">Доступен сейчас · {activeBreaks[0].start}–{activeBreaks[0].end}</div>
                      </div>
                    </div>}
                  {colleagueOnBreak && !activeBreak &&
                    <BreakBlockedNotice
                      colleagueName={colleagueOnBreak.employeeName}
                      returnBy={colleagueOnBreak.returnBy}/>}
                  {/* Отчёты привлечения */}
                  {cfg.attractEnabled && cfg.attractReportRequired!==false && (cfg.attractSlots||[])
                    .filter(sl=>sl.active!==false && t>=sl.start && t<=sl.end)
                    .map(sl=><AttractionReportCard key={sl.id} slot={sl}
                      onSubmit={(rpt)=>{ /* сохранение отчёта */ }}/>)}
                </>;
              })():null}/>}
        </div>

        {/* Right panel */}
        <SidePanel panel={panel} setPanel={setPanel} state={state} setState={setState}
          patchChat={patchChat} closeChat={closeChat} activeId={activeId} onLogout={logout} onClose={closePanel}
          askConfirm={askConfirm} onStub={stub}/>

        {/* Modal */}
        {modal && modal.step==="pick" &&
          <Overlay onClose={()=>setModal(null)}>
            <div className="modal-title">Новый чат</div>
            <div style={{ padding:"10px 16px 18px" }}>
              {[{t:"personal",c:"#25d10a",Icon:User,l:"Личный чат"},
                {t:"groups",c:"#25d10a",Icon:Users,l:"Новая группа"}].map(o=>
                <div key={o.t} className="pick-row" onClick={()=>newChatType(o.t)}>
                  <div className="pick-ic" style={{ background:o.c }}><o.Icon size={20}/></div>
                  <span className="pick-label">{o.l}</span></div>)}
            </div>
          </Overlay>}
        {modal && modal.step==="name" &&
          <Overlay onClose={()=>setModal(null)}>
            <div className="modal-title">{modal.type==="groups"?"Новая группа":"Новый чат"}</div>
            <div style={{ padding:"10px 16px 18px" }}>
              <input ref={newChatInputRef} className="new-chat-input" type="text" autoFocus
                placeholder={modal.label+"…"} value={modal.nameVal}
                onChange={e=>setModal(m=>({...m, nameVal:e.target.value}))}
                onKeyDown={e=>{ if(e.key==="Enter") confirmNewChat(); }}/>
              <button className="promote-btn" style={{borderRadius:"var(--radius-md)",marginTop:12,width:"100%"}}
                onClick={confirmNewChat}>
                <Check size={18}/> Создать</button>
            </div>
          </Overlay>}

        {/* Read info modal */}
        {msgInfo &&
          <Overlay onClose={()=>setMsgInfo(null)}>
            <div className="modal-title">Информация о сообщении</div>
            {(()=>{
              const { msg, chat } = msgInfo;
              const preview = msg.photo?"📷 Фото":msg.voice?"🎤 Голосовое":msg.t;
              const isGroup = chat.type==="groups" && Array.isArray(chat.roster);
              const statusLbl = msg.status==="read"?"Прочитано":msg.status==="delivered"?"Доставлено":"Отправлено";
              // Список читателей для группы (демо на основе roster)
              let readers=[], notYet=[];
              if(isGroup){
                const others = chat.roster.filter(r=>!r.isMe && r.name!==msg.sender);
                if(msg.out){
                  if(msg.status==="read"){ readers=others; }
                  else if(msg.status==="delivered"){ readers=others.filter(r=>r.online); notYet=others.filter(r=>!r.online); }
                  else { notYet=others; }
                }
              }
              return (
                <div style={{ padding:"4px 16px 18px" }}>
                  <div className="fwd-preview" style={{marginLeft:0,marginRight:0}}>{preview}</div>
                  <div className="info-line"><Check size={15}/><span>Отправлено</span><b>{msg.time}</b></div>
                  {msg.out && (msg.status==="delivered"||msg.status==="read") &&
                    <div className="info-line"><CheckCheck size={15}/><span>Доставлено</span><b>{msg.time}</b></div>}
                  {msg.out && msg.status==="read" && !isGroup &&
                    <div className="info-line read"><CheckCheck size={15} color="var(--accent)"/><span>Прочитано</span><b>{msg.time}</b></div>}
                  {!msg.out &&
                    <div className="info-line"><span style={{marginLeft:23}}>Входящее сообщение</span></div>}

                  {isGroup && msg.out &&
                    <>
                      <div className="s-group-title" style={{padding:"14px 0 6px"}}>
                        Прочитали · {readers.length} из {readers.length+notYet.length}</div>
                      {readers.map(r=>
                        <div key={r.name} className="reader-row">
                          <Avatar name={r.name} size={38} online={r.online}/>
                          <div className="reader-info"><div className="reader-name">{r.name}</div>
                            <div className="reader-time"><CheckCheck size={12} color="var(--accent)"/> прочитано · {msg.time}</div></div>
                        </div>)}
                      {notYet.map(r=>
                        <div key={r.name} className="reader-row dim">
                          <Avatar name={r.name} size={38} online={r.online}/>
                          <div className="reader-info"><div className="reader-name">{r.name}</div>
                            <div className="reader-time"><Check size={12}/> ещё не прочитал</div></div>
                        </div>)}
                    </>}
                </div>
              );
            })()}
          </Overlay>}

        {/* Кто прослушал голосовое */}
        {voiceListeners &&
          <Overlay onClose={()=>setVoiceListeners(null)}>
            <div className="react-detail-head">
              <span className="react-detail-title">
                Прослушали: {(voiceListeners.msg.listeners||[]).length}
              </span>
            </div>
            <div className="react-detail-list">
              {(voiceListeners.msg.listeners||[]).map((l,i)=>
                <div key={i} className="react-detail-row">
                  <Avatar name={l.name} size={42}/>
                  <div className="react-detail-info">
                    <div className="react-detail-name">{l.name}
                      {l.name===state.me.name && <span className="react-detail-you"> (вы)</span>}
                    </div>
                    <div className="react-detail-sub">прослушал полностью · {l.time}</div>
                  </div>
                  <span className="react-detail-emoji"><CheckCheck size={16}/></span>
                </div>)}
            </div>
          </Overlay>}

        {formOpen &&
          <GroupFormModal formId={formOpen} meName={state.me.name}
            onClose={()=>setFormOpen(null)} onSubmit={submitForm}/>}

        {/* Reactions detail modal */}
        {reactionsDetail &&
          <Overlay onClose={()=>setReactionsDetail(null)}>
            <ReactionsDetailPanel msg={reactionsDetail.msg} chat={reactionsDetail.chat} contacts={state.contacts}/>
          </Overlay>}

        {/* Forward modal */}
        {forwardMsg &&
          <Overlay onClose={()=>setForwardMsg(null)}>
            <div className="modal-title">Переслать в…</div>
            <div className="fwd-preview">
              {forwardMsg.photo?"📷 Фото":forwardMsg.voice?"🎤 Голосовое":forwardMsg.t}
            </div>
            <div className="fwd-list">
              {state.chats.filter(c=>!c.isCourse).map(c=>
                <div key={c.id} className="pick-row" onClick={()=>doForward(c.id)}>
                  <Avatar name={c.name} size={42} online={c.online}/>
                  <span className="pick-label">{c.name}</span>
                  <Forward size={18} color="var(--sub)"/>
                </div>)}
            </div>
          </Overlay>}

        {/* Context menu */}
        {ctx &&
          <div className="ctx" style={{ left:Math.min(ctx.x,window.innerWidth-190),
            top:Math.min(ctx.y,window.innerHeight-220) }}>
            {ctx.items.map((it,i)=>
              <div key={i} className={"ctx-item"+(it.danger?" danger":"")}
                onClick={()=>{it.fn();setCtx(null);}}><it.Icon size={16}/>{it.label}</div>)}
          </div>}

        {/* Story */}
        {story &&
          <div className="story-view" onClick={()=>setStory(null)}
            style={(story.photo||story.video)?{background:"#000"}:story.color?{background:`linear-gradient(160deg, ${story.color}, color-mix(in srgb, ${story.color} 45%, #0a0f13))`}:undefined}>
            {story.video
              ? <video className="story-bg-img" src={story.video} autoPlay loop playsInline/>
              : story.photo && <img className="story-bg-img" src={story.photo} alt=""/>}
            <div className="story-bar"><i/></div>
            <div className="story-head"><Avatar name={story.name} size={38}/><b>{story.name}</b>
              <button className="story-close" onClick={e=>{e.stopPropagation();setStory(null);}}><X size={24}/></button>
            </div>
            {story.text && <div className={"story-text pos-"+(story.textPos||"bottom")}
              style={story.textColor?{color:story.textColor}:undefined}>{story.text}</div>}
          </div>}

        {/* Создание истории */}
        {newStory &&
          <Overlay onClose={()=>setNewStory(null)}>
            <div className="modal-title">Новая история</div>
            <div className="story-editor-photo">
              {(newStory.photo || newStory.video)
                ? <div className="story-preview">
                    {newStory.video
                      ? <video src={newStory.video} autoPlay loop muted playsInline/>
                      : <img src={newStory.photo} alt=""/>}
                    <textarea className={"story-overlay-text pos-"+(newStory.textPos||"bottom")}
                      style={{color:newStory.textColor||"#fff"}}
                      value={newStory.text} placeholder="Добавить текст…"
                      onChange={e=>setNewStory(ns=>({...ns,text:e.target.value}))}/>
                    <button className="story-editor-reset" title="Выбрать другое"
                      onClick={()=>setNewStory(ns=>({...ns,photo:null,video:null}))}><X size={16}/></button>
                  </div>
                : <div className="story-pick-btns">
                    <button className="story-pick-btn" onClick={()=>storyFileRef.current?.click()}>
                      <Camera size={28}/><span>Фото или видео</span></button>
                    <button className="story-pick-btn" onClick={()=>storyFileRef.current?.click()}>
                      <ImageIcon size={28}/><span>Из галереи</span></button>
                  </div>}
              <input ref={storyFileRef} type="file" accept="image/*,video/*" style={{display:"none"}} onChange={storyPickPhoto}/>
            </div>
            {(newStory.photo || newStory.video) && <>
              <div className="story-tools">
                <div className="story-tool-group">
                  <span className="story-tool-label">Цвет текста</span>
                  <div className="story-colors">
                    {["#fff","#111","#25d10a","#f0b429","#ef6ba8","#5b8def"].map(col=>
                      <button key={col} className={"story-color"+((newStory.textColor||"#fff")===col?" on":"")}
                        style={{background:col}} onClick={()=>setNewStory(ns=>({...ns,textColor:col}))}/>)}
                  </div>
                </div>
                <div className="story-tool-group">
                  <span className="story-tool-label">Положение</span>
                  <div className="story-pos-btns">
                    {[["top","Сверху"],["center","По центру"],["bottom","Снизу"]].map(([id,lbl])=>
                      <button key={id} className={"story-pos-btn"+((newStory.textPos||"bottom")===id?" on":"")}
                        onClick={()=>setNewStory(ns=>({...ns,textPos:id}))}>{lbl}</button>)}
                  </div>
                </div>
              </div>
              <button className="promote-btn" style={{borderRadius:"var(--radius-md)",marginTop:12}}
                onClick={publishStory}>
                <Plus size={18}/> Опубликовать</button>
            </>}
          </Overlay>}

        {/* Всплывающее уведомление */}
        {toast &&
          <div className="kb-toast" onClick={()=>{setToast(null);setPanel({kind:"editProfile"});}}>
            <div className="kb-toast-ic">🎂</div>
            <div className="kb-toast-body">
              <div className="kb-toast-title">{toast.title}</div>
              {toast.sub && <div className="kb-toast-sub">{toast.sub}</div>}
            </div>
            <button className="kb-toast-x" onClick={e=>{e.stopPropagation();setToast(null);}}><X size={18}/></button>
          </div>}

        {/* Галерея фотоотчёта */}
        {viewingReport &&
          <div className="rpt-gallery-overlay">
            <ReportGallery report={viewingReport}
              isCurator={isCuratorFor(viewingReport)}
              onBack={()=>setReportView(null)}
              onUpdate={updateReport}/>
          </div>}

        {/* Полноэкранный просмотр секции Контроль */}
        {controlDetail==="photos" &&
          <ControlDetailView icon={Camera} iconColor="#25d10a" title="Фотоотчёты" onBack={()=>setControlDetail(null)}>
            {(state.photoReports||[]).map(rpt=>{
              const stMap={pending:{l:"Ожидает",c:"#f0b429",bg:"#fef9ec"},rejected:{l:"Исправить",c:"#f0616d",bg:"#fef0f1"},accepted:{l:"Принят",c:"#25d10a",bg:"#eefbe9"}};
              const sc=stMap[rpt.status]||stMap.pending;
              const rtMap={open:"Открытие",close:"Закрытие"};
              return <ControlCard key={rpt.id} icon={Camera} iconColor={sc.c}
                title={`Фотоотчёт: ${rtMap[rpt.reportType]||"открытие"}`}
                badgeLabel={sc.l} badgeBg={sc.bg} badgeColor={sc.c}
                rows={[
                  {icon:MapPin, text:rpt.pointName, color:"#a878f0"},
                  {icon:User, text:`${rpt.sender} · ${rpt.time}`},
                  ...(rpt.late?[{icon:Clock, text:"Опоздание", color:"var(--danger)", warn:true}]:[]),
                ]}
                thumbs={rpt.items.map(it=>it.photo)}
                actionLabel="Посмотреть фотоотчёт" actionIcon={Eye}
                onAction={()=>setReportView(rpt.id)}/>;
            })}
          </ControlDetailView>}
        {controlDetail==="breaks" &&
          <ControlDetailView icon={Coffee} iconColor="#e8a838" title="Перерывы" onBack={()=>setControlDetail(null)}>
            {(state.breakRecords||[]).map(br=>{
              const bsMap={active:{l:"На перерыве",c:"#25d10a"},postponed:{l:"Перенесён",c:"#e8a838"},
                returned:{l:"Вернулся",c:"#25d10a"},early:{l:"Раньше",c:"#25d10a"},
                late:{l:"Опоздание",c:"#f0616d"},noConfirm:{l:"Не подтверждено",c:"#f0616d"},
                unused:{l:"Не использован",c:"#8a97a6"},cancelled:{l:"Отменён",c:"#8a97a6"}};
              const sc=bsMap[br.status]||bsMap.active;
              return <ControlCard key={br.id} icon={Coffee} iconColor={sc.c}
                title={sc.l}
                badgeLabel={br.duration?br.duration+" мин":null} badgeBg="var(--soft)" badgeColor="var(--sub)"
                rows={[
                  {icon:MapPin, text:br.pointName, color:"#a878f0"},
                  {icon:User, text:br.employeeName},
                  ...(br.startTime?[{icon:Coffee, text:`Начало: ${br.startTime}`}]:[]),
                  ...(br.returnBy?[{icon:Bell, text:`Вернуться до: ${br.returnBy}`}]:[]),
                  ...(br.actualReturn?[{icon:CheckCircle2, text:`Факт: ${br.actualReturn}`+(br.lateMinutes>0?` (+${br.lateMinutes} мин)`:"")}]:[]),
                ]}
                expandRows={[
                  ...(br.curator?[{icon:Users, text:`Куратор: ${br.curator}`}]:[]),
                  ...(br.postponeCount>0?[{icon:Clock, text:`Переносов: ${br.postponeCount}`}]:[]),
                ]}/>;
            })}
          </ControlDetailView>}
        {controlDetail==="time" &&
          <ControlDetailView icon={Activity} iconColor="#ef6ba8" title="Тайм-менеджмент" onBack={()=>setControlDetail(null)}>
            {(state.timeManagementData||[]).map(city=>{
              const missedPct=city.total>0?Math.round((city.missed/city.total)*100):0;
              return <ControlCard key={city.id} icon={Activity} iconColor="#ef6ba8"
                title={city.name}
                badgeLabel={city.missed>0?`${city.missed} пропущено`:null}
                badgeBg={city.missed>0?"color-mix(in srgb, var(--danger) 12%, transparent)":"var(--soft)"}
                badgeColor={city.missed>0?"var(--danger)":"var(--sub)"}
                rows={[
                  {icon:ThumbsUp, text:`Реакций: ${city.reacted} из ${city.total}`, color:"var(--accent)"},
                  {icon:Timer, text:`Среднее время: ${city.avgReactionTime||"—"}`},
                  ...(city.worstPeriod?[{icon:AlertTriangle, text:`Слабый период: ${city.worstPeriod}`, color:"var(--danger)", warn:true}]:[]),
                ]}
                expandRows={(city.periods||[]).map(p=>({
                  icon:p.status==="missed"?AlertTriangle:p.status==="late"?Clock:CheckCircle2,
                  text:`${p.period} · ${p.employee} — ${p.status==="missed"?"Пропущено":p.status==="late"?`С опозданием +${p.delay} мин`:"Вовремя"}`,
                  color:p.status==="missed"?"var(--danger)":p.status==="late"?"#e8a838":"var(--accent)",
                  warn:p.status==="missed"
                }))}/>;
            })}
          </ControlDetailView>}

        {/* Lightbox */}
        {lightbox &&
          <div className="lightbox" onClick={()=>setLightbox(null)}><img src={lightbox} alt=""/></div>}

        {/* Экран звонка */}
        {call && <CallScreen call={call} onEnd={endCall} contacts={state.contacts}/>}

        {/* Диалог подтверждения (замена window.confirm, которая не работает во встроенных превью) */}
        {confirmDlg &&
          <Overlay onClose={()=>setConfirmDlg(null)}>
            <div className="modal-title">Подтверждение</div>
            <div className="confirm-body">{confirmDlg.message}</div>
            <div className="confirm-actions">
              <button className="confirm-btn ghost" onClick={()=>setConfirmDlg(null)}>Отмена</button>
              <button className="confirm-btn danger" onClick={()=>{ confirmDlg.onYes&&confirmDlg.onYes(); setConfirmDlg(null); }}>
                {confirmDlg.confirmLabel||"Да"}</button>
            </div>
          </Overlay>}

        {/* === Система перерывов: модалки === */}
        {breakModal?.type==="start" &&
          <BreakStartModal
            breakCfg={breakModal.breakCfg}
            employeeName={state.me.name}
            pointName={breakModal.pointName||"Отдел"}
            postponeCount={postponeCount}
            maxPostponeCount={breakModal.breakCfg?.maxPostponeCount||2}
            onStart={(startTime, returnBy, dur)=>{
              setActiveBreak({ startTime, returnBy, duration:dur,
                pointName:breakModal.pointName, employeeName:state.me.name,
                breakName:breakModal.breakCfg?.name });
              setBreakModal(null);
              // Карточка «начал перерыв» в группу
              setState(st=>({...st, breakRecords:[
                { id:uid(), status:"active", pointName:breakModal.pointName||"Отдел",
                  employeeName:state.me.name, startTime, returnBy, duration:dur,
                  curator:breakModal.breakCfg?.curator||"" },
                ...(st.breakRecords||[])]}));
              setToast({title:"Перерыв начат",sub:`Вернуться до ${returnBy}`});
            }}
            onPostpone={(reason)=>{
              setPostponeCount(c=>c+1);
              setBreakModal(null);
              setState(st=>({...st, breakRecords:[
                { id:uid(), status:"postponed", pointName:breakModal.pointName||"Отдел",
                  employeeName:state.me.name, postponeReason:reason,
                  postponeCount:postponeCount+1 },
                ...(st.breakRecords||[])]}));
              setToast({title:"Перерыв перенесён",sub:reason});
              // Повторное окно через maxPostpone минут (симуляция)
              const mp = parseInt(breakModal.breakCfg?.maxPostpone)||20;
              setTimeout(()=>setBreakModal({...breakModal}), Math.min(mp*1000, 15000));
            }}/>}

        {breakModal?.type==="return" &&
          <BreakReturnModal
            startTime={activeBreak?.startTime}
            returnBy={activeBreak?.returnBy}
            onReturn={(actualTime)=>{
              const isLate = actualTime > (activeBreak?.returnBy||"");
              setState(st=>({...st, breakRecords:(st.breakRecords||[]).map(br=>
                br.status==="active" && br.employeeName===state.me.name
                  ? {...br, status:isLate?"late":"returned", actualReturn:actualTime,
                     lateMinutes:isLate?Math.ceil((new Date(`2000-01-01T${actualTime}`) -
                       new Date(`2000-01-01T${activeBreak?.returnBy}`))/60000):0}
                  : br)}));
              setActiveBreak(null);
              setBreakModal(null);
              setPostponeCount(0);
              setToast({title:isLate?"Возвращение с опозданием":"Возвращение подтверждено",
                sub:isLate?`Опоздание на ${Math.ceil((new Date(`2000-01-01T${actualTime}`) -
                  new Date(`2000-01-01T${activeBreak?.returnBy}`))/60000)} мин`:"Спасибо!"});
            }}/>}

        {/* Плавающий таймер перерыва */}
        {activeBreak &&
          <BreakTimerBar
            startTime={activeBreak.startTime}
            returnBy={activeBreak.returnBy}
            duration={activeBreak.duration}
            minimized={breakTimerMin}
            onToggle={()=>setBreakTimerMin(m=>!m)}
            onExpand={()=>setBreakModal({type:"return"})}/>}
      </div>
    </>
  );
}

