// Компонент: SidePanel
import { LOGO } from "../assets/logo";
import { useState } from "react";
import {
  PencilLine,
  ChevronLeft,
  ChevronRight,
  X,
  Smile,
  Trash2,
  Pin,
  PinOff,
  Bell,
  MessageCircle,
  MessagesSquare,
  Folder,
  Database,
  Palette,
  HelpCircle,
  Check,
  Users,
  Megaphone,
  User,
  BadgeCheck,
  Play,
  Sun,
  Moon,
  Crown,
  Inbox,
  Target,
  MapPin,
  UserPlus,
  Crown,
  Shield,
  LogOut,
  Camera,
  Clock,
  Image as ImageIcon,
  Plus,
  Link2,
  Building2,
  Settings2,
  Video,
  Ellipsis,
  Pencil,
  Hash,
  File,
  Film,
  Link,
  Mic,
  Bookmark,
  Paperclip,
  Phone,
  Copy,
  Timer,
  Send,
  Zap,
  BellRing,
  CalendarDays,
  Snowflake,
  Archive,
  LockOpen,
  Recycle,
  Bot,
  Package,
  GripVertical,
  MoreVertical,
  FolderOpen,
  FolderPlus
} from "lucide-react";
import { avatarColor, statusLine, uid, formatPhone } from "../utils/helpers";
import { WALLPAPERS, AV, ROLE_LABEL, WRITE_ACCESS } from "../constants";
import { Avatar, IconBtn, Toggle, PhotoAvatar, PromotePanel, ReportScheduleSettings, CuratorStandards } from "./index";

export function SidePanel({ panel, setPanel, state, setState, patchChat, closeChat, activeId, onLogout, onClose, askConfirm, onStub:onStubProp }) {
  const open=!!panel; const me=state.me, s=state.settings;
  const requests = state.registrationRequests||[];
  const pendingRequests = requests.filter(r=>r.status==="pending");
  const setReqStatus=(id,status)=>setState(st=>({...st,registrationRequests:(st.registrationRequests||[]).map(r=>r.id===id?{...r,status}:r)}));
  // Состояние формы создания группы (хуки должны быть на верхнем уровне компонента)
  const [gName,setGName]=useState("");
  const [gPoint,setGPoint]=useState("Все точки");
  const [gBind,setGBind]=useState(false);
  // Состояние формы создания/редактирования темы
  const [tpName,setTpName]=useState("");
  const [tpEmoji,setTpEmoji]=useState("#️⃣");
  const [tpColor,setTpColor]=useState("#5b8def");
  const onStub=onStubProp||null;
  const Row=({Icon,label,val,chev,danger,onClick,right})=>(
    <div className={"s-row"+(danger?" danger":"")} onClick={onClick}>
      <span className="s-ic"><Icon size={20}/></span>
      <span className="s-label">{label}</span>
      {val!=null && <span className="s-val">{val}</span>}
      {right}{chev && <ChevronRight size={18} color="var(--sub)"/>}
    </div>
  );

  let body=null, title="", back=()=>(onClose?onClose():setPanel(null));
  if(panel?.kind==="profile"){
    const c=state.chats.find(x=>x.id===panel.id);
    if(c){
    const isGroup=c.type==="groups"||c.type==="point";
    const roster=c.roster||[];
    const memberCount=roster.length||c.members||0;
    const allMsgs=(c.msgs||[]).concat((c.topics||[]).flatMap(tp=>tp.msgs||[]));
    const photos=allMsgs.filter(m=>m.photo).length;
    const voices=allMsgs.filter(m=>m.voice).length;
    const myRole=roster.find(r=>r.isMe)?.role;
    const canManage=myRole==="owner"||myRole==="admin";
    const contactHandle = !isGroup ? (state.contacts||[]).find(x=>x.name===c.name)?.handle : null;
    title=isGroup?"Группа":"Профиль";
    body=<>
      {/* Герой */}
      <div className="p-hero">
        {isGroup && canManage
          ? <PhotoAvatar me={{name:c.name, photo:c.photo||null}} onPhoto={(d)=>patchChat(c.id,x=>({...x,photo:d}))} onRemove={()=>patchChat(c.id,x=>({...x,photo:null}))} size={108}/>
          : <Avatar name={c.name} size={108} photo={c.photo} online={!isGroup&&c.online}/>}
        {isGroup && canManage
          ? <div className="p-name"><input className="grp-name-edit" defaultValue={c.name}
              onBlur={e=>{
                const newName=e.target.value.trim();
                if(newName && newName!==c.name){
                  patchChat(c.id,x=>({...x,name:newName}));
                  setState(st=>({...st, pointGroups:(st.pointGroups||[]).map(pg=>pg.chatId===c.id?{...pg,name:newName}:pg)}));
                }
              }}/>{c.verified&&<BadgeCheck size={20} color="var(--accent)"/>}</div>
          : <div className="p-name">{c.name}{c.verified&&<BadgeCheck size={20} color="var(--accent)"/>}</div>}
        {!isGroup && (contactHandle || c.phone) &&
          <div className="p-id-row">
            {contactHandle && <span className="p-id-handle">@{contactHandle}</span>}
            {contactHandle && c.phone && <span className="p-id-dot">·</span>}
            {c.phone && <span className="p-id-phone">{c.phone}</span>}
          </div>}
        {isGroup && <div className="p-status">{`${memberCount} участник${memberCount%10===1&&memberCount!==11?"":"ов"}`}</div>}
      </div>

      {/* Описание группы — редактируемое для владельца/админа */}
      {isGroup &&
        <div className="s-card grp-desc">
          {canManage
            ? <textarea className="grp-desc-edit" defaultValue={c.description||""} placeholder="Добавить описание группы…"
                rows={Math.max(2, (c.description||"").split("\n").length + Math.floor((c.description||"").length / 35))}
                onInput={e=>{ e.target.style.height="0"; e.target.style.height=e.target.scrollHeight+"px"; }}
                onBlur={e=>patchChat(c.id,x=>({...x,description:e.target.value}))}/>
            : <div className="grp-desc-text">{c.description||"Нет описания"}</div>}
          <div className="grp-desc-link">Информация</div>
        </div>}

      {/* Управление — для владельца/админа */}
      {isGroup && canManage &&
        <div className="s-card">
          <Row Icon={Users} label="Участники" chev onClick={()=>setPanel({kind:"members",id:c.id})}/>
          {(c.type==="point" || c.id==="g-mgmt") &&
            <Row Icon={Camera} label={c.id==="g-mgmt"?"Стандарты кураторов":"Стандарты сотрудников"} chev onClick={()=>setPanel({kind:"standards",id:c.id})}/>}
          <Row Icon={Settings2} label="Управление" chev onClick={()=>setPanel({kind:"members",id:c.id})}/>
          <Row Icon={UserPlus} label="Добавить участника" chev onClick={()=>setPanel({kind:"invite",id:c.id})}/>
        </div>}

      {/* Телефон и действия — для личных чатов */}
      {!isGroup && c.phone &&
        <div className="s-card">
          <Row Icon={Phone} label={c.phone} chev onClick={()=>onStub(true)}/>
          <Row Icon={Copy} label="Скопировать номер" onClick={()=>{ navigator.clipboard?.writeText(c.phone); }}/>
        </div>}

      {/* Настройки для личных чатов */}
      {!isGroup &&
        <div className="s-card">
          <Row Icon={c.pinned?PinOff:Pin} label={c.pinned?"Открепить чат":"Закрепить чат"} chev onClick={()=>patchChat(c.id,x=>({...x,pinned:!x.pinned}))}/>
        </div>}

      {/* Медиа-статистика */}
      <div className="s-card grp-media-stats">
        <Row Icon={Bookmark} label="Сообщений в Избранном" val={allMsgs.filter(m=>m.pinned).length||0}/>
        <Row Icon={ImageIcon} label="Фотографий" val={photos}/>
        <Row Icon={Film} label="Видео" val={0}/>
        <Row Icon={File} label="Файлов" val={0}/>
        <Row Icon={Link} label="Ссылок" val={0}/>
        <Row Icon={Mic} label="Голосовых сообщений" val={voices}/>
      </div>

      {/* Темы (топики) группы */}
      {isGroup && (c.topics||[]).length>0 &&
        <div className="s-card">
          <div className="s-card-title s-card-title-row">Темы<span className="s-card-count">{c.topics.length}</span></div>
          {c.topics.map(tp=>
            <div key={tp.id} className="topic-row" onClick={()=>setPanel({kind:"topicView",id:c.id,topicId:tp.id})}>
              <span className="topic-emoji" style={{background:tp.color||"var(--accent)"}}>{tp.emoji||"#"}</span>
              <div className="topic-info">
                <div className="topic-name">{tp.name}</div>
                <div className="topic-preview">{(tp.msgs||[]).length} сообщ.</div>
              </div>
              <ChevronRight size={16} color="var(--sub)"/>
            </div>)}
          {canManage && <Row Icon={Plus} label="Создать тему" chev onClick={()=>setPanel({kind:"topicCreate",id:c.id})}/>}
        </div>}
      {isGroup && !(c.topics||[]).length && canManage &&
        <div className="s-card">
          <Row Icon={Hash} label="Создать тему" chev onClick={()=>setPanel({kind:"topicCreate",id:c.id})}/>
          <div className="s-note" style={{margin:"0 16px 12px",fontSize:12}}>Темы помогают организовать общение — как топики в Telegram.</div>
        </div>}

      {/* Участники */}
      {isGroup && roster.length>0 &&
        <div className="s-card">
          <div className="s-card-title s-card-title-row" style={{cursor:"pointer"}} onClick={()=>setPanel({kind:"members",id:c.id})}>
            {memberCount} участник{memberCount%10===1&&memberCount!==11?"":"ов"}
            <span className="s-card-add" onClick={e=>{e.stopPropagation();setPanel({kind:"invite",id:c.id});}}><UserPlus size={18}/></span>
          </div>
          {roster.slice(0,8).map(r=>(
            <div key={r.name} className="pmember-row" onClick={()=>canManage&&!r.isMe&&r.role!=="owner"?setPanel({kind:"member",id:c.id,name:r.name}):null}
              style={{cursor:canManage&&!r.isMe&&r.role!=="owner"?"pointer":"default"}}>
              <Avatar name={r.name} size={44} online={r.online}/>
              <div className="pmember-main">
                <div className="pmember-name">{r.name}{r.isMe&&" (вы)"}{(r.role==="owner"||r.role==="admin")&&<span className="star-badge"><Crown size={13}/></span>}</div>
                <div className="pmember-sub">
                  {r.tag && <span className="member-tag">{r.tag}</span>}
                  {(()=>{ const acc=(state.accounts||[]).find(a=>a.name===r.name);
                    return acc?.point ? <span className="point-flag" title={"Точка: "+acc.point}><MapPin size={10}/>{acc.point}</span> : null; })()}
                  {!r.tag && !(state.accounts||[]).find(a=>a.name===r.name)?.point && (r.online?"в сети":"был(а) недавно")}
                </div>
              </div>
              {r.role!=="member" && <span className={"role-chip "+r.role}>{ROLE_LABEL[r.role]}</span>}
            </div>
          ))}
          {roster.length>8 &&
            <Row Icon={Users} label="Показать всех" val={roster.length} chev onClick={()=>setPanel({kind:"members",id:c.id})}/>}
        </div>}

      {!isGroup &&
        <div className="s-card">
          <Row Icon={Trash2} label="Удалить чат" danger onClick={()=>{ askConfirm("Удалить чат?",()=>{
            setState(st=>({...st,chats:st.chats.filter(x=>x.id!==c.id)})); if(activeId===c.id) closeChat(); setPanel(null);},"Удалить"); }}/>
        </div>}
    </>;
    }
  } else if(panel?.kind==="settings"){
    title="Настройки";
    body=<>
      <div className="p-hero">
        <Avatar name={me.name} size={108} emoji={me.emoji} color={me.avatarColor} photo={me.photo} online={true}/>
        <div className="p-name">{me.name}</div>
        {(me.handle || me.phone) && <div className="p-id-row">
          {me.handle && <span className="p-id-handle">@{me.handle}</span>}
          {me.handle && me.phone && <span className="p-id-dot">·</span>}
          {me.phone && <span className="p-id-phone">{me.phone}</span>}
        </div>}
      </div>
      <div className="s-card">
        <Row Icon={Bell} label="Уведомления" chev onClick={()=>setPanel({kind:"notifications"})}/>
        <Row Icon={MessageCircle} label="Сообщения" chev onClick={()=>setPanel({kind:"messages"})}/>
        <Row Icon={Folder} label="Папки" chev onClick={()=>setPanel({kind:"folders"})}/>
      </div>
      <div className="s-card">
        <Row Icon={ImageIcon} label="Медиа" chev onClick={()=>setPanel({kind:"media"})}/>
        <Row Icon={Database} label="Память" chev onClick={()=>setPanel({kind:"storage"})}/>
      </div>
      <div className="s-card"><Row Icon={Palette} label="Оформление" chev onClick={()=>setPanel({kind:"appearance"})}/></div>
      <div className="s-card"><Row Icon={HelpCircle} label="Помощь" chev onClick={()=>setPanel({kind:"about"})}/><Row Icon={Target} label="О Калибри" val="Версия 3.1" onClick={()=>setPanel({kind:"about"})}/></div>
      <div className="s-card">
        <Row Icon={UserPlus} label="Заявки на регистрацию" chev
          val={pendingRequests.length||null} onClick={()=>setPanel({kind:"requests"})}/>
        <Row Icon={Inbox} label="Обращения" chev
          val={(state.formSubmissions||[]).filter(f=>f.status==="pending").length||null}
          onClick={()=>setPanel({kind:"submissions"})}/>
        <Row Icon={Users} label="Аккаунты" chev
          val={(state.accounts||[]).filter(a=>a.status==="active").length||null} onClick={()=>setPanel({kind:"accounts"})}/>
        <Row Icon={Building2} label="Группы и отделы" chev
          val={(state.pointGroups||[]).length||null} onClick={()=>setPanel({kind:"groupManager"})}/>
      </div>
      <div className="s-card"><Row Icon={LogOut} label="Выйти из аккаунта" danger onClick={()=>{ askConfirm("Выйти из аккаунта? Ваши чаты сохранятся.",()=>{ setPanel(null); onLogout&&onLogout(); },"Выйти"); }}/></div>
    </>;
  } else if(panel?.kind==="notifications"){
    title="Уведомления"; back=()=>setPanel(null);
    const set=(k)=>setState(st=>({...st,settings:{...st.settings,[k]:!st.settings[k]}}));
    body=<>
      <div className="s-group-title">Оповещения</div>
      <div className="s-card">
        <Row Icon={Bell} label="Показывать уведомления" right={<Toggle on={s.notifications} onClick={()=>set("notifications")}/>}/>
        <Row Icon={Smile} label="Звук сообщений" right={<Toggle on={s.sounds} onClick={()=>set("sounds")}/>}/>
      </div>
      <div className="s-note">Управляйте тем, как Калибри сообщает о новых сообщениях.</div>
    </>;
  } else if(panel?.kind==="messages"){
    title="Сообщения"; back=()=>setPanel(null);
    const set=(k)=>setState(st=>({...st,settings:{...st.settings,[k]:!st.settings[k]}}));
    body=<>
      <div className="s-group-title">Отправка</div>
      <div className="s-card">
        <Row Icon={Smile} label="Звук при отправке" right={<Toggle on={s.sounds} onClick={()=>set("sounds")}/>}/>
      </div>
      <div className="s-group-title">Размер текста</div>
      <div className="s-card" style={{ padding:"18px 24px", display:"flex", alignItems:"center", gap:14 }}>
        <span style={{ fontSize:14, color:"var(--sub)" }}>A</span>
        <input className="range" type="range" min="0.85" max="1.3" step="0.05" value={s.textScale||1}
          onChange={e=>setState(st=>({...st,settings:{...st.settings,textScale:parseFloat(e.target.value)}}))}/>
        <span style={{ fontSize:22, color:"var(--sub)" }}>A</span>
      </div>
    </>;
  } else if(panel?.kind==="folders"){
    title="Папки"; back=()=>setPanel(null);
    const folders = state.settings.customFolders || [];
    const allCount = state.chats.length;
    const unreadCount = state.chats.filter(c=>(c.unread||0)>0).length;
    body=<>
      <div className="folders-hero">
        <div className="folders-hero-icon"><FolderOpen size={48}/></div>
        <div className="folders-hero-text">Создавайте папки для чатов и легко переключайтесь между ними</div>
        <button className="folders-create-btn" onClick={()=>{
          const name = "Моя папка "+((state.settings.customFolders||[]).length+1);
          setState(st=>({...st, settings:{...st.settings,
            customFolders:[...(st.settings.customFolders||[]),
              {id:uid(), name, types:["personal","groups","channels"]}]}}));
        }}><Plus size={18}/> Создать папку</button>
      </div>
      <div className="s-group-title">Системные</div>
      <div className="s-card">
        <Row Icon={MessageCircle} label="Все" val={allCount}/>
        <Row Icon={Bell} label="Новые" val={unreadCount}/>
      </div>
      {folders.length>0 && <div className="s-group-title">Ваши папки</div>}
      {folders.length>0 && <div className="s-card">
        {folders.map(f=>
          <div key={f.id} className="s-row">
            <span className="s-ic"><Folder size={20}/></span>
            <span className="s-label">{f.name}</span>
            <button className="folder-del-btn" onClick={(ev)=>{
              ev.stopPropagation();
              askConfirm(`Удалить папку «${f.name}»?`,()=>{
                setState(st=>({...st, settings:{...st.settings,
                  customFolders:(st.settings.customFolders||[]).filter(x=>x.id!==f.id)}}));
              },"Удалить");
            }}><Trash2 size={18}/></button>
          </div>)}
      </div>}
      <div className="s-group-title">Рекомендованные папки</div>
      <div className="s-card">
        {[{name:"Непрочитанные",types:["unread"]},{name:"Личные",types:["personal"]},{name:"Работа",types:["groups","point"]}]
          .filter(rec=>!folders.find(f=>f.name===rec.name))
          .map(rec=>
            <div key={rec.name} className="s-row folder-row">
              <div className="s-row-left"><FolderOpen size={20} className="s-row-ic"/><span>{rec.name}</span></div>
              <button className="folder-add-btn" onClick={()=>{
                setState(st=>({...st, settings:{...st.settings,
                  customFolders:[...(st.settings.customFolders||[]),
                    {id:uid(), name:rec.name, types:rec.types}]}}));
              }}><Plus size={18}/></button>
            </div>)}
      </div>
      <div className="s-note">Нажмите на корзину справа, чтобы удалить папку.</div>
    </>;
  } else if(panel?.kind==="media"){
    title="Медиа"; back=()=>setPanel(null);
    const photos=state.chats.reduce((a,c)=>a+(c.msgs||[]).filter(m=>m.photo).length,0);
    const voices=state.chats.reduce((a,c)=>a+(c.msgs||[]).filter(m=>m.voice).length,0);
    body=<>
      <div className="s-group-title">Всего отправлено</div>
      <div className="s-card">
        <Row Icon={ImageIcon} label="Фотографии" val={photos}/>
        <Row Icon={Play} label="Голосовые" val={voices}/>
      </div>
      <div className="s-note">Здесь собирается вся медиатека из ваших чатов.</div>
    </>;
  } else if(panel?.kind==="storage"){
    title="Память"; back=()=>setPanel(null);
    const msgs=state.chats.reduce((a,c)=>a+(c.msgs||[]).length,0);
    body=<>
      <div className="s-group-title">Использование</div>
      <div className="s-card">
        <Row Icon={MessageCircle} label="Всего сообщений" val={msgs}/>
        <Row Icon={MessagesSquare} label="Чатов" val={state.chats.length}/>
      </div>
      <div className="s-card">
        <Row Icon={Trash2} label="Очистить все чаты" danger onClick={()=>{ askConfirm("Удалить все сообщения во всех чатах?",()=>{
          setState(st=>({...st,chats:st.chats.map(c=>({...c,msgs:[],unread:0}))})); },"Удалить"); }}/>
      </div>
    </>;
  } else if(panel?.kind==="submissions"){
    title="Обращения"; back=()=>setPanel(null);
    const subs=[...(state.formSubmissions||[])].sort((a,b)=>(a.status==="pending"?0:1)-(b.status==="pending"?0:1));
    const KIND={ curator:{t:"Хочу стать куратором",e:"🎓",c:"#25d10a"},
                 complaint:{t:"Жалоба",e:"⚠️",c:"#f0b429"},
                 wish:{t:"Пожелание",e:"💡",c:"#5b8def"} };
    const setStatus=(id,st)=>setState(x=>({...x,
      formSubmissions:(x.formSubmissions||[]).map(f=>f.id===id?{...f,status:st}:f)}));
    body=<>
      {subs.length===0 && <div className="s-note">Обращений пока нет.</div>}
      {subs.map(f=>{
        const k=KIND[f.kind]||{t:f.kind,e:"📄",c:"var(--sub)"};
        return (
          <div key={f.id} className="sub-card" style={{borderLeft:`3px solid ${k.c}`}}>
            <div className="sub-head">
              <span className="sub-emoji">{k.e}</span>
              <span className="sub-title">{k.t}</span>
              <span className={"sub-status "+f.status}>
                {f.status==="pending"?"Новое":f.status==="done"?"Обработано":"Отклонено"}</span>
            </div>
            <div className="sub-meta">
              {f.anon ? <span className="sub-anon">Анонимно</span> : <span>{f.author}</span>}
              <span>·</span><span>{f.time}</span>
            </div>
            <div className="sub-body">
              {Object.entries(f.data||{}).map(([k2,v])=>
                v ? <div key={k2} className="sub-row"><span>{k2}</span><b>{String(v)}</b></div> : null)}
            </div>
            {f.status==="pending" &&
              <div className="sub-acts">
                <button className="sub-act done" onClick={()=>setStatus(f.id,"done")}>Обработано</button>
                <button className="sub-act rej" onClick={()=>setStatus(f.id,"rejected")}>Отклонить</button>
              </div>}
          </div>
        );
      })}
    </>;
  } else if(panel?.kind==="requests"){
    title="Заявки на регистрацию"; back=()=>setPanel(null);
    const STATUS_LBL={pending:"Ожидает",approved:"Одобрена",declined:"Отклонена"};
    const sorted=[...requests].sort((a,b)=>(a.status==="pending"?0:1)-(b.status==="pending"?0:1));
    body=<>
      <div className="s-group-title">Ожидают решения · {pendingRequests.length}</div>
      {sorted.length
        ? <div className="s-card req-list">
            {sorted.map(r=>
              <div key={r.id} className="req-row">
                <Avatar name={r.name} size={44}/>
                <div className="req-info">
                  <div className="req-name">{r.name}</div>
                  <div className="req-meta">{r.phone} · {r.point}</div>
                  <div className="req-meta req-time">Заявка от {r.time}</div>
                </div>
                {r.status==="pending"
                  ? <div className="req-actions">
                      <button className="req-btn approve" title="Одобрить" onClick={()=>setReqStatus(r.id,"approved")}><Check size={16}/></button>
                      <button className="req-btn reject" title="Отклонить" onClick={()=>setReqStatus(r.id,"declined")}><X size={16}/></button>
                    </div>
                  : <span className={"req-status "+r.status}>{STATUS_LBL[r.status]}</span>}
              </div>)}
          </div>
        : <div className="s-note" style={{margin:16}}>Пока нет заявок на регистрацию.</div>}
      <div className="s-note">Заявки приходят с экрана входа, когда новый человек регистрируется и указывает свою точку. Одобрите заявку, чтобы дать доступ к аккаунту.</div>
    </>;
  } else if(panel?.kind==="accounts"){
    title="Аккаунты"; back=()=>setPanel(null);
    const accounts=state.accounts||[];
    const [accTab,setAccTab]=[panel.accTab||"active",v=>setPanel({...panel,accTab:v})];
    const ROLE_NAMES={owner:"Создатель",admin:"Администратор",member:"Сотрудник"};
    const filtered=accounts.filter(a=> accTab==="active"?a.status==="active":accTab==="frozen"?a.status==="frozen":a.status==="archived");
    const toggleFreeze=(accId)=>{
      setState(st=>({...st, accounts:(st.accounts||[]).map(a=>{
        if(a.id!==accId) return a;
        return a.status==="frozen" ? {...a, status:"active", frozenReason:undefined} : {...a, status:"frozen", frozenReason:"Заморожен вручную"};
      })}));
    };
    const archiveAcc=(accId)=>{
      setState(st=>({...st, accounts:(st.accounts||[]).map(a=>
        a.id===accId ? {...a, status:"archived", archivedReason:"Перемещён в архив"} : a
      )}));
    };
    const restoreAcc=(accId)=>{
      setState(st=>({...st, accounts:(st.accounts||[]).map(a=>
        a.id===accId ? {...a, status:"active", archivedReason:undefined} : a
      )}));
    };
    body=<>
      <div className="acc-tabs">
        {[["active","Активные"],["frozen","Замороженные"],["archived","Архив"]].map(([k,l])=>
          <button key={k} className={"acc-tab"+(accTab===k?" on":"")} onClick={()=>setAccTab(k)}>
            {l} <span className="acc-tab-count">{accounts.filter(a=>a.status===k).length}</span>
          </button>)}
      </div>

      {filtered.length
        ? <div className="s-card acc-list">
            {filtered.map(a=>
              <div key={a.id} className={"acc-row"+(a.status==="frozen"?" frozen":"")+(a.status==="archived"?" archived":"")}>
                <Avatar name={a.name} size={44}/>
                <div className="acc-info">
                  <div className="acc-name">{a.name} {a.role==="owner"&&<Crown size={13} color="#f0b429"/>}</div>
                  <div className="acc-meta">@{a.handle} · {ROLE_NAMES[a.role]||a.role}</div>
                  <div className="acc-meta">{a.phone} · {a.point}</div>
                  <div className="acc-meta acc-login-info">
                    Вход: {a.lastLogin||"—"} · Код: <b>{a.loginCode}</b>
                  </div>
                  {a.frozenReason && <div className="acc-meta acc-frozen-reason"><Snowflake size={12}/> {a.frozenReason}</div>}
                  {a.archivedReason && <div className="acc-meta acc-frozen-reason"><Package size={12}/> {a.archivedReason}</div>}
                </div>
                <div className="acc-actions">
                  {a.status==="active" && a.role!=="owner" && <>
                    <button className="acc-act-btn freeze" title="Заморозить" onClick={()=>toggleFreeze(a.id)}><Snowflake size={16}/></button>
                    <button className="acc-act-btn archive" title="В архив" onClick={()=>archiveAcc(a.id)}><Archive size={16}/></button>
                  </>}
                  {a.status==="frozen" && <>
                    <button className="acc-act-btn restore" title="Разморозить" onClick={()=>toggleFreeze(a.id)}><LockOpen size={16}/></button>
                    <button className="acc-act-btn archive" title="В архив" onClick={()=>archiveAcc(a.id)}><Archive size={16}/></button>
                  </>}
                  {a.status==="archived" &&
                    <button className="acc-act-btn restore" title="Восстановить" onClick={()=>restoreAcc(a.id)}><Recycle size={16}/></button>}
                </div>
              </div>)}
          </div>
        : <div className="s-note" style={{margin:16,textAlign:"center"}}>
            {accTab==="active"?"Нет активных аккаунтов":accTab==="frozen"?"Нет замороженных аккаунтов":"Архив пуст"}
          </div>}

      <div className="s-note">
        {accTab==="active"?"Активные аккаунты имеют доступ к приложению. Заморозьте аккаунт, чтобы временно ограничить вход."
          :accTab==="frozen"?"Замороженные аккаунты не могут войти в приложение. Разморозьте для восстановления доступа."
          :"Архивные аккаунты сохранены для истории. Их можно восстановить."}
      </div>
    </>;
  } else if(panel?.kind==="groupManager"){
    title="Группы и отделы"; back=()=>setPanel(null);
    const groups=state.pointGroups||[];
    const toggleAutoBind=(gid)=>setState(st=>({...st,
      pointGroups:(st.pointGroups||[]).map(g=>g.id===gid?{...g,autoBind:!g.autoBind}:g)
    }));
    const deleteGroup=(gid)=>{
      const g=groups.find(x=>x.id===gid);
      askConfirm(`Удалить группу «${g?.name}»? Чат группы тоже будет удалён.`,()=>{
        setState(st=>({
          ...st,
          pointGroups:(st.pointGroups||[]).filter(x=>x.id!==gid),
          chats:st.chats.filter(c=>c.id!==g?.chatId),
        }));
      },"Удалить");
    };
    body=<>
      <div className="s-group-title">Группы точек · {groups.length}</div>
      <div className="s-note" style={{margin:"0 16px 12px"}}>Создавайте группы — они автоматически появляются в списке чатов. Включите автопривязку, чтобы все новые пользователи попадали в группу.</div>
      {groups.length
        ? <div className="s-card gm-list">
            {groups.map(g=>{
              const chat=state.chats.find(c=>c.id===g.chatId);
              const memberCount=chat?.members||chat?.roster?.length||0;
              return <div key={g.id} className="gm-row">
                <div className="gm-icon"><Users size={20}/></div>
                <div className="gm-info">
                  <div className="gm-name">{g.name}</div>
                  <div className="gm-meta">{g.point} · {memberCount} уч. · создана {g.created}</div>
                </div>
                <div className="gm-actions">
                  <button className={"gm-bind"+(g.autoBind?" on":"")} title={g.autoBind?"Автопривязка включена":"Автопривязка выключена"}
                    onClick={()=>toggleAutoBind(g.id)}>
                    <Link2 size={14}/><span>{g.autoBind?"Авто":"Выкл"}</span>
                  </button>
                  <button className="gm-del" title="Удалить группу" onClick={()=>deleteGroup(g.id)}><Trash2 size={14}/></button>
                </div>
                <div className="gm-forms">
                  <div className="gm-forms-title">Формы на странице группы</div>
                  {[["curator","🎓 Хочу стать куратором"],["complaint","⚠️ Подать жалобу"],["wish","💡 Пожелания"]].map(([fid,lbl])=>{
                    const on=state.groupForms?.[g.chatId]?.[fid]!==false && !!state.groupForms?.[g.chatId]?.[fid];
                    return (
                      <label key={fid} className="gm-form-row">
                        <span>{lbl}</span>
                        <span className={"std-toggle"+(on?" on":"")}
                          onClick={()=>setState(x=>({...x, groupForms:{...(x.groupForms||{}),
                            [g.chatId]:{...((x.groupForms||{})[g.chatId]||{}), [fid]: !on }}}))}>
                          <span className="std-toggle-dot"/>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>;
            })}
          </div>
        : <div className="s-note" style={{margin:16,textAlign:"center"}}>Пока нет созданных групп.</div>}
      <div className="s-card">
        <Row Icon={Plus} label="Создать группу" chev onClick={()=>{setGName("");setGPoint("Все точки");setGBind(false);setPanel({kind:"createGroup"});}}/>
        <Row Icon={MapPin} label="Создать точку" chev onClick={()=>setPanel({kind:"createPoint"})}/>
      </div>

      {/* Список точек */}
      <div className="s-group-title">Точки сети · {(state.points||[]).length}</div>
      {(state.points||[]).length
        ? <div className="s-card gm-list">
            {(state.points||[]).map(pt=>
              <div key={pt.id} className="gm-row">
                <div className="gm-icon"><MapPin size={20}/></div>
                <div className="gm-info">
                  <div className="gm-name">{pt.name}{pt.isTemplate&&<span style={{color:"var(--sub)",fontSize:12,marginLeft:6}}>шаблон</span>}</div>
                  <div className="gm-meta">{pt.address} · {pt.timezone} · {pt.created}</div>
                </div>
              </div>)}
          </div>
        : <div className="s-note" style={{margin:16,textAlign:"center"}}>Нет точек.</div>}
    </>;
  } else if(panel?.kind==="createPoint"){
    title="Новая точка"; back=()=>setPanel({kind:"groupManager"});
    const [ptName,setPtName]=[panel.ptName||"",v=>setPanel({...panel,ptName:v})];
    const [ptAddr,setPtAddr]=[panel.ptAddr||"",v=>setPanel({...panel,ptAddr:v})];
    const [ptTz,setPtTz]=[panel.ptTz||"МСК",v=>setPanel({...panel,ptTz:v})];
    const canCreate=ptName.trim().length>=2;
    const doCreatePoint=()=>{
      if(!canCreate) return;
      const ptId="pt-"+uid();
      const chatId="grp-"+uid();
      const groupId="pg-"+uid();
      const tpl = state.pointGroupTemplate;
      // Создаём темы из шаблона
      const topics = tpl?.topics ? tpl.topics.map(tp=>({
        ...tp, id:"tp-"+uid(), sender:"", preview:"", time:"", msgs:[]
      })) : [];
      const newPoint={ id:ptId, name:ptName.trim(), address:ptAddr.trim()||ptName.trim(), timezone:ptTz, created:new Date().toLocaleDateString("ru",{day:"2-digit",month:"2-digit"}), isTemplate:false };
      const newChat={ id:chatId, type:"point",
        name:ptName.trim(), members:1, muted:false, unread:0,
        roster:[{ name:state.me.name, role:"owner", online:true, isMe:true }],
        topics: topics.length > 0 ? topics : undefined,
        description: ptAddr.trim() || "",
        msgs:[{id:uid(),t:"Точка «"+ptName.trim()+"» создана. Все настройки из шаблона применены.",out:false,sender:"Система",time:new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"}),status:"read"}] };
      const newGroup={ id:groupId, name:ptName.trim(), chatId, autoBind:false, point:ptName.trim(),
        created:newPoint.created, fromTemplate:!!tpl };
      const newSettings = tpl?.settings ? { ...tpl.settings } : {};
      setState(st=>({
        ...st,
        points:[...(st.points||[]),newPoint],
        chats:[newChat,...st.chats],
        pointGroups:[...(st.pointGroups||[]),newGroup],
        photoReportSettings:{...st.photoReportSettings, [chatId]: newSettings },
      }));
      setPanel({kind:"groupManager"});
    };
    body=<>
      <div className="s-group-title">Информация о точке</div>
      <div className="s-card" style={{padding:"16px"}}>
        <div className="field"><label>Название точки</label>
          <input value={ptName} onChange={e=>setPtName(e.target.value)} placeholder="Например: ТРЦ «Аура» | Сургут"/></div>
        <div className="field"><label>Адрес</label>
          <input value={ptAddr} onChange={e=>setPtAddr(e.target.value)} placeholder="ул. Профсоюзов, 11"/></div>
        <div className="field"><label>Часовой пояс</label>
          <select className="login-select" value={ptTz} onChange={e=>setPtTz(e.target.value)}>
            {["МСК","МСК+1","МСК+2","МСК+3","МСК+4","МСК+5","МСК-1"].map(tz=>
              <option key={tz} value={tz}>{tz}</option>)}
          </select></div>
      </div>
      <div className="s-note">При создании точки автоматически создаётся группа-чат со всеми темами и настройками из шаблона.</div>
      <button className="promote-btn" style={{margin:"16px",borderRadius:"var(--radius-md)",opacity:canCreate?1:.5}}
        disabled={!canCreate} onClick={doCreatePoint}>
        <MapPin size={18}/> Создать точку</button>
    </>;
  } else if(panel?.kind==="createGroup"){
    title="Новая группа"; back=()=>setPanel({kind:"groupManager"});
    const dynPoints = (state.points||[]).map(p=>p.name);
    const POINT_OPTS=["Все точки",...dynPoints];
    const canCreate=gName.trim().length>=2;
    const doCreate=()=>{
      if(!canCreate) return;
      const chatId="grp-"+uid();
      const groupId="pg-"+uid();
      const tpl = state.pointGroupTemplate;
      // Создаём темы из шаблона если есть
      const topics = tpl?.topics ? tpl.topics.map(tp=>({
        ...tp, id:"tp-"+uid(), sender:"", preview:"", time:"", msgs:[]
      })) : [];
      const newChat={ id:chatId, type: gPoint!=="Все точки" ? "point" : "groups",
        name:gName.trim(), members:1, muted:false, unread:0,
        autoBind:gBind,
        roster:[{ name:state.me.name, role:"owner", online:true, isMe:true }],
        topics: topics.length > 0 ? topics : undefined,
        msgs:[{id:uid(),t:"Группа «"+gName.trim()+"» создана. Добро пожаловать!",out:false,sender:"Система",time:new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"}),status:"read"}] };
      const newGroup={ id:groupId, name:gName.trim(), chatId, autoBind:gBind, point:gPoint,
        created:new Date().toLocaleDateString("ru",{day:"2-digit",month:"2-digit"}), fromTemplate:!!tpl };
      // Копируем настройки стандартов из шаблона
      const newSettings = tpl?.settings ? { ...tpl.settings } : {};
      setState(st=>({
        ...st,
        chats:[newChat,...st.chats],
        pointGroups:[...(st.pointGroups||[]),newGroup],
        photoReportSettings:{...st.photoReportSettings, [chatId]: newSettings },
      }));
      setPanel({kind:"groupManager"});
    };
    body=<>
      <div className="s-group-title">Информация</div>
      <div className="s-card" style={{padding:"16px"}}>
        <div className="field"><label>Название группы</label>
          <input value={gName} onChange={e=>setGName(e.target.value)} placeholder="Например: Я стажёр"/></div>
        <div className="field"><label>Точка / привязка</label>
          <select className="login-select" value={gPoint} onChange={e=>setGPoint(e.target.value)}>
            {POINT_OPTS.map(p=><option key={p} value={p}>{p}</option>)}
          </select></div>
      </div>
      <div className="s-group-title">Автопривязка</div>
      <div className="s-card">
        <Row Icon={Link2} label="Добавлять всех автоматически"
          right={<Toggle on={gBind} onClick={()=>setGBind(b=>!b)}/>}/>
      </div>
      <div className="s-note">Если включено — все новые пользователи точки автоматически попадут в эту группу при регистрации.</div>
      <button className="promote-btn" style={{margin:"16px",borderRadius:"var(--radius-md)",opacity:canCreate?1:.5}}
        disabled={!canCreate} onClick={doCreate}>
        <Plus size={18}/> Создать группу</button>
    </>;
  } else if(panel?.kind==="about"){
    title="О Калибри"; back=()=>setPanel(null);
    body=<>
      <div className="p-hero">
        <div style={{ width:96, height:96, borderRadius:"50%", overflow:"hidden", background:"transparent" }}>
          <img src={LOGO} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
        <div className="p-name">Калибри</div>
        <div className="p-status">Версия 3.1</div>
      </div>
      <div className="s-card">
        <Row Icon={Target} label="Мессенджер Калибри"/>
        <Row Icon={HelpCircle} label="Помощь и поддержка" chev onClick={()=>alert("Поддержка станет доступна после запуска сервера")}/>
      </div>
      <div className="s-note">Демонстрационная версия. Реальный обмен сообщениями между людьми появится после подключения серверной части.</div>
    </>;
  } else if(panel?.kind==="appearance"){
    title="Оформление"; back=()=>setPanel(null);
    const setTheme=(t)=>setState(st=>({...st,settings:{...st.settings,theme:t}}));
    const setScale=(v)=>setState(st=>({...st,settings:{...st.settings,textScale:parseFloat(v)}}));
    const setWall=(id)=>setState(st=>({...st,settings:{...st.settings,wallpaper:id}}));
    const curWall = s.wallpaper||"default";
    const previewCss = (WALLPAPERS.find(w=>w.id===s.wallpaper)?.css)
      || (s.wallpaper&&s.wallpaper.startsWith("#")?s.wallpaper:null);
    body=<>
      <div className="appear-preview" style={previewCss?{background:previewCss}:undefined}>
        <div className="pv-in">Привет, как дела?</div>
        <div className="pv-out">Хорошо, а у тебя? ✓✓</div>
      </div>
      <div className="s-group-title">Тема</div>
      <div className="s-card">
        <div className="s-row" onClick={()=>setTheme("light")}>
          <span className="s-ic">{s.theme==="light"?<Check size={18}/>:<Sun size={18} color="var(--sub)"/>}</span>
          <span className="s-label">Светлая</span></div>
        <div className="s-row" onClick={()=>setTheme("dark")}>
          <span className="s-ic">{s.theme==="dark"?<Check size={18}/>:<Moon size={18} color="var(--sub)"/>}</span>
          <span className="s-label">Тёмная</span></div>
      </div>
      <div className="s-group-title">Обои чата</div>
      <div className="s-card" style={{padding:"14px"}}>
        <div className="wall-grid">
          {WALLPAPERS.map(w=>
            <button key={w.id} className={"wall-cell"+(curWall===w.id?" on":"")}
              style={{ background: w.css || "var(--soft)" }} onClick={()=>setWall(w.id)} title={w.name}>
              {!w.css && <span className="wall-none">Нет</span>}
              {curWall===w.id && <span className="wall-check"><Check size={16}/></span>}
            </button>)}
        </div>
        <label className="wall-custom">
          <span className="wall-custom-sw" style={{ background: (s.wallpaper&&s.wallpaper.startsWith("#"))?s.wallpaper:"conic-gradient(from 0deg,#f66,#fb0,#5d5,#4bf,#a6f,#f66)" }}/>
          <span className="wall-custom-txt">Свой цвет</span>
          <input type="color" value={(s.wallpaper&&s.wallpaper.startsWith("#"))?s.wallpaper:"#d9f5e3"}
            onChange={e=>setWall(e.target.value)} style={{ marginLeft:"auto" }}/>
        </label>
        <label className="wall-custom">
          <span className="wall-custom-sw wall-photo-sw"
            style={ (s.wallpaper&&s.wallpaper.startsWith("url("))
              ? { backgroundImage:s.wallpaper, backgroundSize:"cover", backgroundPosition:"center" }
              : undefined }>
            {!(s.wallpaper&&s.wallpaper.startsWith("url(")) && <ImageIcon size={15}/>}
          </span>
          <span className="wall-custom-txt">Своё фото</span>
          <input type="file" accept="image/*" style={{ display:"none" }}
            onChange={e=>{
              const f=e.target.files?.[0]; if(!f) return;
              const r=new FileReader();
              r.onload=()=>setWall(`url(${r.result})`);
              r.readAsDataURL(f); e.target.value="";
            }}/>
          <span className="wall-photo-btn">Выбрать</span>
        </label>
        {s.wallpaper && s.wallpaper.startsWith("url(") &&
          <button className="wall-photo-reset" onClick={()=>setWall("default")}>Убрать фото</button>}
      </div>
      <div className="s-group-title">Размер текста</div>
      <div className="s-card" style={{ padding:"18px 24px", display:"flex", alignItems:"center", gap:14 }}>
        <span style={{ fontSize:14, color:"var(--sub)" }}>A</span>
        <input className="range" type="range" min="0.85" max="1.3" step="0.05" value={s.textScale||1}
          onChange={e=>setScale(e.target.value)}/>
        <span style={{ fontSize:22, color:"var(--sub)" }}>A</span>
      </div>
    </>;
  } else if(panel?.kind==="editProfile"){
    title="Изменить профиль"; back=()=>setPanel(null);
    const upd=(k,v)=>setState(st=>({...st,me:{...st.me,[k]:v}}));
    const AV_EMOJI=["","😀","😎","🚀","🐦","🔥","⭐","🎯","☕","🎮","🌙","💡"];
    body=<>
      <div className="p-hero">
        <PhotoAvatar me={me} onPhoto={(d)=>upd("photo",d)} onRemove={()=>upd("photo",null)}/>
      </div>
      <div className="s-group-title">Эмодзи-аватар</div>
      <div className="s-card" style={{padding:"12px"}}>
        <div className="emoji-grid">
          {AV_EMOJI.map((e,i)=>
            <button key={i} className={"emoji-cell"+((me.emoji||"")===e?" on":"")}
              onClick={()=>upd("emoji",e)}>{e||<Camera size={18}/>}</button>)}
        </div>
      </div>
      <div className="s-group-title">Цвет фона</div>
      <div className="s-card" style={{padding:"12px"}}>
        <div className="color-grid">
          <button className={"color-cell"+(!me.avatarColor?" on":"")} style={{background:avatarColor(me.name)}} onClick={()=>upd("avatarColor",null)}/>
          {AV.map(col=>
            <button key={col} className={"color-cell"+(me.avatarColor===col?" on":"")}
              style={{background:col}} onClick={()=>upd("avatarColor",col)}/>)}
        </div>
      </div>
      <div className="field"><label>Имя</label><input defaultValue={me.name?.split(" ")[0]||""} onBlur={e=>{
        const surname=me.name?.split(" ").slice(1).join(" ")||"";
        upd("name",(e.target.value.trim()+(surname?" "+surname:"")).trim());
      }}/></div>
      <div className="field"><label>Фамилия</label><input defaultValue={me.name?.split(" ").slice(1).join(" ")||""} onBlur={e=>{
        const first=me.name?.split(" ")[0]||"";
        upd("name",(first+" "+e.target.value.trim()).trim());
      }}/></div>
      <div className="field"><label>@ID</label>
        <div className="handle-field-wrap">
          <span className="handle-at">@</span>
          <input defaultValue={me.handle||""} placeholder="username" onBlur={e=>upd("handle",e.target.value.toLowerCase().replace(/[^a-zа-яё0-9_]/g,""))}/>
        </div>
      </div>
      <div className="field"><label>Телефон</label><input type="tel" defaultValue={me.phone||""} placeholder="+7 999 123-45-67"
        onChange={e=>{e.target.value=formatPhone(e.target.value)}} onBlur={e=>upd("phone",e.target.value)}/></div>
      <div className="field"><label>О себе</label><input defaultValue={me.bio} onBlur={e=>upd("bio",e.target.value)}/></div>
      <div className="field"><label>День рождения 🎂</label><input type="date" defaultValue={me.birthday||""} onBlur={e=>upd("birthday",e.target.value)} onChange={e=>upd("birthday",e.target.value)}/></div>
    </>;
  } else if(panel?.kind==="members"){
    const c=state.chats.find(x=>x.id===panel.id); back=()=>setPanel({kind:"profile",id:panel.id});
    if(c){ title="Участники";
    const roster=c.roster||[];
    const myRole=roster.find(r=>r.isMe)?.role;
    const canManage = myRole==="owner"||myRole==="admin";
    const patchRoster=(fn)=>patchChat(c.id,x=>({...x,roster:fn(x.roster||[])}));
    const RoleIc={owner:Crown,admin:Shield,member:User};
    const owners=roster.filter(r=>r.role==="owner");
    const admins=roster.filter(r=>r.role==="admin");
    const members=roster.filter(r=>r.role==="member");
    const MemberRow=(r)=>{ const RIc=RoleIc[r.role]||User;
      return <div key={r.name} className="member-row" onClick={()=>canManage&&!r.isMe&&r.role!=="owner"?setPanel({kind:"member",id:c.id,name:r.name}):null}
        style={{cursor:canManage&&!r.isMe&&r.role!=="owner"?"pointer":"default"}}>
        <Avatar name={r.name} size={44} online={r.online}/>
        <div className="member-info">
          <div className="member-name">{r.name}{r.isMe&&<span className="you-tag">вы</span>}{r.handle&&<span className="member-handle">@{r.handle}</span>}</div>
          <div className={"member-role role-"+r.role}><RIc size={12}/>{ROLE_LABEL[r.role]}{r.tag&&<span className="member-tag-sm"> · {r.tag}</span>}</div>
        </div>
        {canManage && !r.isMe && r.role!=="owner" && <ChevronRight size={18} color="var(--sub)"/>}
      </div>; };
    body=<>
      <div className="s-group-title">Всего · {roster.length}</div>
      {owners.length>0 && <>
        <div className="s-group-title">Владелец</div>
        <div className="s-card">{owners.map(MemberRow)}</div></>}
      {admins.length>0 && <>
        <div className="s-group-title">Администраторы · {admins.length}</div>
        <div className="s-card">{admins.map(MemberRow)}</div></>}
      <div className="s-group-title">Участники · {members.length}</div>
      <div className="s-card">{members.length?members.map(MemberRow):<div className="s-note" style={{margin:16}}>Пока только администрация.</div>}</div>
      {canManage &&
        <div className="s-card"><Row Icon={UserPlus} label="Добавить участника" chev onClick={()=>setPanel({kind:"invite",id:c.id})}/></div>}
      <div className="s-note">Нажмите на участника, чтобы изменить роль и права. Владелец и администраторы управляют составом группы.</div>
    </>;
    }
  } else if(panel?.kind==="member"){
    const c=state.chats.find(x=>x.id===panel.id); back=()=>setPanel({kind:"members",id:panel.id});
    const r=c?.roster?.find(x=>x.name===panel.name);
    if(c&&r){ title="Права участника";
    const myRole=c.roster.find(x=>x.isMe)?.role;
    const patchRoster=(fn)=>patchChat(c.id,x=>({...x,roster:fn(x.roster||[])}));
    const upd=(fn)=>patchRoster(rs=>rs.map(x=>x.name===r.name?fn(x):x));
    const DEFAULT_RIGHTS={del:true,ban:true,invite:true,pin:true,promote:false};
    const demote=()=>upd(x=>{ const{rights,...rest}=x; return {...rest,role:"member"}; });
    const toggleRight=(k)=>upd(x=>({...x,rights:{...(x.rights||DEFAULT_RIGHTS),[k]:!(x.rights||DEFAULT_RIGHTS)[k]}}));
    const rights=r.rights||DEFAULT_RIGHTS;
    const RIGHTS=[
      {k:"del",Icon:Trash2,label:"Удалять сообщения"},
      {k:"ban",Icon:LogOut,label:"Блокировать участников"},
      {k:"invite",Icon:UserPlus,label:"Добавлять участников"},
      {k:"pin",Icon:Pin,label:"Закреплять сообщения"},
      {k:"promote",Icon:Shield,label:"Назначать администраторов"},
    ];
    body=<>
      <div className="p-hero">
        <Avatar name={r.name} size={92} online={r.online}/>
        <div className="p-name">{r.name}</div>
        <div className={"member-role role-"+r.role} style={{justifyContent:"center",marginTop:4}}>
          {r.role==="admin"?<Shield size={13}/>:<User size={13}/>}{ROLE_LABEL[r.role]}</div>
      </div>
      <div className="s-group-title">Метка (флажок)</div>
      <div className="s-card" style={{padding:16}}>
        <div className="field"><label>Кто этот участник</label>
          <input defaultValue={r.tag||""} placeholder="Например: Кассир, Стажёр, HR…"
            onBlur={e=>upd(x=>({...x,tag:e.target.value.trim()||undefined}))}/></div>
        <div className="s-note" style={{fontSize:12,marginTop:4}}>Флажок виден всем участникам группы, но не меняет права.</div>
      </div>
      <div className="s-card">
        {r.role==="member"
          ? <Row Icon={Shield} label="Назначить администратором" chev onClick={()=>setPanel({kind:"promote",id:c.id,name:r.name})}/>
          : <Row Icon={User} label="Снять администратора" danger onClick={demote}/>}
      </div>
      {r.role==="admin" &&
        <>
          <div className="s-group-title">Права администратора</div>
          <div className="s-card">
            {RIGHTS.map(rt=>
              <Row key={rt.k} Icon={rt.Icon} label={rt.label}
                right={<Toggle on={!!rights[rt.k]} onClick={()=>toggleRight(rt.k)}/>}/>)}
          </div>
          <div className="s-note">Включённые права расширяют возможности администратора в этой группе.</div>
        </>}
      <div className="s-card">
        <Row Icon={LogOut} label="Исключить из группы" danger onClick={()=>{ askConfirm(`Удалить ${r.name} из группы?`,()=>{
          patchRoster(rs=>rs.filter(x=>x.name!==r.name)); setPanel({kind:"members",id:c.id}); },"Удалить"); }}/>
      </div>
    </>;
    }
  } else if(panel?.kind==="promote"){
    const c=state.chats.find(x=>x.id===panel.id); back=()=>setPanel({kind:"member",id:panel.id,name:panel.name});
    const r=c?.roster?.find(x=>x.name===panel.name);
    if(c&&r){ title="Назначение админом";
    const patchRoster=(fn)=>patchChat(c.id,x=>({...x,roster:fn(x.roster||[])}));
    const apply=(rights)=>{ patchRoster(rs=>rs.map(x=>x.name===r.name?{...x,role:"admin",rights}:x));
      setPanel({kind:"member",id:c.id,name:r.name}); };
    body=<PromotePanel member={r} onApply={apply}/>;
    }
  } else if(panel?.kind==="topicView"){
    const c=state.chats.find(x=>x.id===panel.id);
    const tp=c?.topics?.find(x=>x.id===panel.topicId);
    back=()=>setPanel({kind:"profile",id:panel.id});
    if(c&&tp){
    title=tp.name;
    const myRole=(c.roster||[]).find(r=>r.isMe)?.role;
    const canManage=myRole==="owner"||myRole==="admin";
    const deleteTopic=()=>{
      askConfirm(`Удалить тему «${tp.name}» и все сообщения в ней?`,()=>{
        patchChat(c.id,x=>({...x,topics:(x.topics||[]).filter(t=>t.id!==tp.id)}));
        setPanel({kind:"profile",id:c.id});
      },"Удалить");
    };
    body=<>
      <div className="p-hero">
        <span className="topic-emoji-big" style={{background:tp.color||"var(--accent)"}}>{tp.emoji||"#"}</span>
        <div className="p-name">{tp.name}</div>
        <div className="p-status">{(tp.msgs||[]).length} сообщений</div>
      </div>
      <div className="s-card">
        <div className="s-group-title">Последние сообщения</div>
        {(tp.msgs||[]).slice(-5).map(m=>
          <div key={m.id} className="topic-msg-row">
            <div className="topic-msg-sender">{m.out?"Вы":m.sender||"—"}</div>
            <div className="topic-msg-text">{m.t}</div>
            <div className="topic-msg-time">{m.time}</div>
          </div>)}
        {!(tp.msgs||[]).length && <div className="s-note" style={{margin:16}}>В этой теме пока нет сообщений.</div>}
      </div>
      {canManage &&
        <div className="s-card">
          <Row Icon={Pencil} label="Редактировать тему" chev onClick={()=>{
            setTpName(tp.name); setTpEmoji(tp.emoji||"#️⃣"); setTpColor(tp.color||"#5b8def");
            setPanel({kind:"topicEdit",id:c.id,topicId:tp.id});
          }}/>
          <Row Icon={Trash2} label="Удалить тему" danger onClick={deleteTopic}/>
        </div>}
    </>;
    }
  } else if(panel?.kind==="topicCreate"){
    const c=state.chats.find(x=>x.id===panel.id);
    back=()=>setPanel({kind:"profile",id:panel.id});
    title="Новая тема";
    const TOPIC_EMOJIS=["#️⃣","📢","💬","📋","📅","📊","❓","🏆","📘","💻","📝","🗣️","📣","🛒","💸","🤖","📚","🎯"];
    const TOPIC_COLORS=["#5b8def","#42c9b0","#25d10a","#f0b429","#f4844c","#ef6ba8","#a878f0","#6ec9cb","#f0616d"];
    const canCreate=tpName.trim().length>=1;
    const doCreate=()=>{
      if(!canCreate||!c) return;
      const newTopic={ id:"tp-"+uid(), emoji:tpEmoji, color:tpColor, name:tpName.trim(), msgs:[] };
      patchChat(c.id,x=>({...x,topics:[...(x.topics||[]),newTopic]}));
      setTpName(""); setTpEmoji("#️⃣"); setTpColor("#5b8def");
      setPanel({kind:"profile",id:c.id});
    };
    body=<>
      <div className="s-group-title">Настройки темы</div>
      <div className="s-card" style={{padding:16}}>
        <div className="field"><label>Название темы</label>
          <input value={tpName} onChange={e=>setTpName(e.target.value)} placeholder="Например: Объявления"/></div>
      </div>
      <div className="s-group-title">Иконка</div>
      <div className="s-card" style={{padding:12}}>
        <div className="emoji-grid">{TOPIC_EMOJIS.map((e,i)=>
          <button key={i} className={"emoji-cell"+(tpEmoji===e?" on":"")} onClick={()=>setTpEmoji(e)}>{e}</button>)}
        </div>
      </div>
      <div className="s-group-title">Цвет</div>
      <div className="s-card" style={{padding:12}}>
        <div className="color-grid">{TOPIC_COLORS.map(col=>
          <button key={col} className={"color-cell"+(tpColor===col?" on":"")} style={{background:col}} onClick={()=>setTpColor(col)}/>)}
        </div>
      </div>
      <div className="topic-preview-card">
        <span className="topic-emoji" style={{background:tpColor}}>{tpEmoji}</span>
        <span className="topic-preview-name">{tpName||"Название"}</span>
      </div>
      <button className="promote-btn" style={{margin:16,borderRadius:"var(--radius-md)",opacity:canCreate?1:.5}}
        disabled={!canCreate} onClick={doCreate}>
        <Plus size={18}/> Создать тему</button>
    </>;
  } else if(panel?.kind==="topicEdit"){
    const c=state.chats.find(x=>x.id===panel.id);
    const tp=c?.topics?.find(x=>x.id===panel.topicId);
    back=()=>setPanel({kind:"topicView",id:panel.id,topicId:panel.topicId});
    title="Редактировать тему";
    const TOPIC_EMOJIS=["#️⃣","📢","💬","📋","📅","📊","❓","🏆","📘","💻","📝","🗣️","📣","🛒","💸","🤖","📚","🎯"];
    const TOPIC_COLORS=["#5b8def","#42c9b0","#25d10a","#f0b429","#f4844c","#ef6ba8","#a878f0","#6ec9cb","#f0616d"];
    const canSave=tpName.trim().length>=1;
    const doSave=()=>{
      if(!canSave||!c||!tp) return;
      patchChat(c.id,x=>({...x,topics:(x.topics||[]).map(t=>t.id===tp.id?{...t,name:tpName.trim(),emoji:tpEmoji,color:tpColor}:t)}));
      setPanel({kind:"topicView",id:c.id,topicId:tp.id});
    };
    body=<>
      <div className="s-group-title">Настройки темы</div>
      <div className="s-card" style={{padding:16}}>
        <div className="field"><label>Название</label>
          <input value={tpName} onChange={e=>setTpName(e.target.value)} placeholder="Название темы"/></div>
      </div>
      <div className="s-group-title">Иконка</div>
      <div className="s-card" style={{padding:12}}>
        <div className="emoji-grid">{TOPIC_EMOJIS.map((e,i)=>
          <button key={i} className={"emoji-cell"+(tpEmoji===e?" on":"")} onClick={()=>setTpEmoji(e)}>{e}</button>)}
        </div>
      </div>
      <div className="s-group-title">Цвет</div>
      <div className="s-card" style={{padding:12}}>
        <div className="color-grid">{TOPIC_COLORS.map(col=>
          <button key={col} className={"color-cell"+(tpColor===col?" on":"")} style={{background:col}} onClick={()=>setTpColor(col)}/>)}
        </div>
      </div>
      <div className="topic-preview-card">
        <span className="topic-emoji" style={{background:tpColor}}>{tpEmoji}</span>
        <span className="topic-preview-name">{tpName||"Название"}</span>
      </div>
      <button className="promote-btn" style={{margin:16,borderRadius:"var(--radius-md)",opacity:canSave?1:.5}}
        disabled={!canSave} onClick={doSave}>
        <Check size={18}/> Сохранить</button>
    </>;
  } else if(panel?.kind==="invite"){
    const c=state.chats.find(x=>x.id===panel.id); back=()=>setPanel({kind:"members",id:panel.id});
    if(c){ title="Добавить участника";
    const inGroup=new Set((c.roster||[]).map(r=>r.name));
    const available=state.contacts.filter(ct=>!inGroup.has(ct.name));
    const add=(name,online)=>{ patchChat(c.id,x=>({...x,roster:[...(x.roster||[]),{name,role:"member",online:!!online}]}));
      setPanel({kind:"members",id:c.id}); };
    body=<>
      <div className="s-group-title">Из ваших контактов</div>
      <div className="s-card">
        {available.length ? available.map(ct=>
          <div key={ct.name} className="member-row invite" onClick={()=>add(ct.name,ct.online)}>
            <Avatar name={ct.name} size={44} online={ct.online}/>
            <div className="member-info"><div className="member-name">{ct.name}</div>
              <div className="member-role">{ct.online?"в сети":"не в сети"}</div></div>
            <button className="mini-btn accent"><UserPlus size={16}/></button>
          </div>)
          : <div className="s-note" style={{margin:"16px"}}>Все контакты уже в группе.</div>}
      </div>
    </>;
    }
  } else if(panel?.kind==="topicSettings"){
    // Настройки конкретной темы — открывается по клику на шапку темы
    const c=state.chats.find(x=>x.id===panel.chatId);
    const tp=c?.topics?.find(x=>x.id===panel.topicId);
    back=()=>setPanel(null);
    if(c&&tp){
    title=tp.name;
    const myRole=(c.roster||[]).find(r=>r.isMe)?.role;
    const canManage=myRole==="owner"||myRole==="admin";
    const tmCfg = state.topicTimeMgmt?.[tp.id] || { enabled:false, rules:[] };
    const DAYS_SHORT=["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];

    const setTmCfg=(fn)=>setState(st=>({...st,
      topicTimeMgmt:{...st.topicTimeMgmt, [tp.id]: fn(st.topicTimeMgmt?.[tp.id]||{enabled:false,rules:[]})}}));
    const toggleTm=()=>setTmCfg(cfg=>({...cfg, enabled:!cfg.enabled}));
    const toggleRule=(rid)=>setTmCfg(cfg=>({...cfg,
      rules:(cfg.rules||[]).map(r=>r.id===rid?{...r,enabled:!r.enabled}:r)}));
    const deleteRule=(rid)=>{
      askConfirm("Удалить это автосообщение?",()=>{
        setTmCfg(cfg=>({...cfg, rules:(cfg.rules||[]).filter(r=>r.id!==rid)}));
      },"Удалить");
    };
    const addRule=()=>{
      setTmCfg(cfg=>({...cfg, rules:[...(cfg.rules||[]),
        {id:"tm-"+uid(), name:"Новое сообщение", message:"", time:"12:00", days:[1,2,3,4,5], enabled:true}]}));
    };
    const updateRule=(rid,patch)=>setTmCfg(cfg=>({...cfg,
      rules:(cfg.rules||[]).map(r=>r.id===rid?{...r,...patch}:r)}));
    const toggleDay=(rid,day)=>setTmCfg(cfg=>({...cfg,
      rules:(cfg.rules||[]).map(r=>{
        if(r.id!==rid) return r;
        const d=r.days||[];
        return {...r, days:d.includes(day)?d.filter(x=>x!==day):[...d,day].sort()};
      })}));

    body=<>
      <div className="p-hero">
        <span className="topic-emoji-big" style={{background:tp.color||"var(--accent)"}}>{tp.emoji||"#"}</span>
        <div className="p-name">{tp.name}</div>
        <div className="p-status">{(tp.msgs||[]).length} сообщений · {c.name}</div>
      </div>

      {/* Описание темы — редактируемое для владельца/админа */}
      <div className="s-card grp-desc">
        {canManage
          ? <textarea className="grp-desc-edit" defaultValue={tp.description||""} placeholder="Добавить описание темы…"
              rows={Math.max(2, (tp.description||"").split("\n").length + Math.floor((tp.description||"").length / 35))}
              onInput={e=>{ e.target.style.height="0"; e.target.style.height=e.target.scrollHeight+"px"; }}
              onBlur={e=>patchChat(c.id,x=>({...x,topics:(x.topics||[]).map(t=>t.id===tp.id?{...t,description:e.target.value}:t)}))}/>
          : <div className="grp-desc-text">{tp.description||"Нет описания"}</div>}
        <div className="grp-desc-link">Информация</div>
      </div>

      {/* Общие настройки темы */}
      <div className="s-card">
        {canManage && <Row Icon={Bell} label={tp.muted?"Включить уведомления":"Выключить уведомления"} chev
          onClick={()=>patchChat(c.id,x=>({...x,topics:(x.topics||[]).map(t=>t.id===tp.id?{...t,muted:!t.muted}:t)}))}/>}
        <Row Icon={Pin} label={tp.pinned?"Открепить тему":"Закрепить тему"} chev
          onClick={()=>patchChat(c.id,x=>({...x,topics:(x.topics||[]).map(t=>t.id===tp.id?{...t,pinned:!t.pinned}:t)}))}/>
      </div>

      {canManage && <>
        <div className="s-group-title">Кто может писать</div>
        <div className="s-card">
          {WRITE_ACCESS.map(w=>{
            const cur = tp.writeAccess || "all";
            return (
              <div key={w.id} className="s-row wa-row" onClick={()=>patchChat(c.id,x=>({...x,
                topics:(x.topics||[]).map(t=>t.id===tp.id?{...t,writeAccess:w.id}:t)}))}>
                <span className="s-ic">{cur===w.id ? <Check size={18} color="var(--accent)"/> : <Circle size={18} color="var(--sub)"/>}</span>
                <span className="s-label wa-label">
                  <span className="wa-title">{w.label}</span>
                  <span className="wa-hint">{w.hint}</span>
                </span>
              </div>
            );
          })}
        </div>
      </>}

      {canManage && <>
        <div className="s-card">
          <Row Icon={Pencil} label="Редактировать тему" chev onClick={()=>{
            setTpName(tp.name); setTpEmoji(tp.emoji||"#️⃣"); setTpColor(tp.color||"#5b8def");
            setPanel({kind:"topicEdit",id:c.id,topicId:tp.id});
          }}/>
        </div>

        {/* ═══ Тайм-менеджмент ═══ */}
        <div className="s-group-title tm-section-title">
          <Timer size={16}/> Тайм-менеджмент
        </div>
        <div className="s-card">
          <Row Icon={Zap} label="Автосообщения" right={<Toggle on={tmCfg.enabled} onClick={toggleTm}/>}/>
        </div>
        {tmCfg.enabled && <>
          <div className="s-note tm-note">
            Автоматическая отправка сообщений по расписанию в эту тему. Сообщения будут отправлены от имени бота.
          </div>

          {(tmCfg.rules||[]).map(rule=>(
            <div key={rule.id} className="s-card tm-rule-card">
              <div className="tm-rule-head">
                <div className="tm-rule-title-row">
                  <BellRing size={16} color={rule.enabled?"var(--accent)":"var(--sub)"}/>
                  <input className="tm-rule-name" value={rule.name}
                    onChange={e=>updateRule(rule.id,{name:e.target.value})}
                    placeholder="Название"/>
                  <Toggle on={rule.enabled} onClick={()=>toggleRule(rule.id)}/>
                </div>
              </div>
              <div className="tm-rule-body">
                <div className="tm-field">
                  <label><User size={14}/> От кого</label>
                  <div className="tm-sender">Куратор точки</div>
                </div>
                <div className="tm-field">
                  <label><Clock size={14}/> Время отправки</label>
                  <input type="time" value={rule.time}
                    onChange={e=>updateRule(rule.id,{time:e.target.value})}/>
                </div>
                <div className="tm-field">
                  <label><Send size={14}/> Текст сообщения</label>
                  <textarea value={rule.message} rows={2}
                    onChange={e=>updateRule(rule.id,{message:e.target.value})}
                    placeholder="Текст автосообщения…"/>
                </div>
                <div className="tm-field">
                  <label><CalendarDays size={14}/> Дни недели</label>
                  <div className="tm-days">
                    {DAYS_SHORT.map((d,i)=>(
                      <button key={i} className={"tm-day"+((rule.days||[]).includes(i)?" on":"")}
                        onClick={()=>toggleDay(rule.id,i)}>{d}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="tm-rule-footer">
                <button className="tm-del" onClick={()=>deleteRule(rule.id)}>
                  <Trash2 size={14}/> Удалить</button>
              </div>
            </div>))}

          <div className="s-card">
            <Row Icon={Plus} label="Добавить автосообщение" chev onClick={addRule}/>
          </div>
        </>}

        <div className="s-card">
          <Row Icon={Trash2} label="Удалить тему" danger onClick={()=>{
            askConfirm(`Удалить тему «${tp.name}» и все сообщения?`,()=>{
              patchChat(c.id,x=>({...x,topics:(x.topics||[]).filter(t=>t.id!==tp.id)}));
              setPanel(null);
            },"Удалить");
          }}/>
        </div>
      </>}
    </>;
    }
  } else if(panel?.kind==="standards"){
    const c=state.chats.find(x=>x.id===panel.id);
    back=()=>setPanel({kind:"profile",id:panel.id});
    const isMgmt = c?.id==="g-mgmt";
    if(c){ title=isMgmt ? "Стандарты кураторов" : "Стандарты сотрудников";
    body=<>
      <div className="std-hero">
        <div className="std-hero-icon"><Camera size={28}/></div>
        <div className="std-hero-title">{c.name}</div>
        <div className="std-hero-sub">{isMgmt ? "Настройте правила проверок и реагирования для кураторов" : "Настройте правила отчётов, перерывов и привлечений для этого отдела"}</div>
      </div>
      <div className="s-card">
        {isMgmt ?
          <CuratorStandards
            settings={state.curatorStandards}
            onChange={(ns)=>setState(st=>({...st, curatorStandards:ns}))}/>
        :
          <ReportScheduleSettings
            settings={state.photoReportSettings?.[c.id]}
            roster={c.roster}
            topics={c.topics||[]}
            openChecklist={state.photoReportOpenChecklist}
            closeChecklist={state.photoReportCloseChecklist}
            onChange={(ns)=>setState(st=>({...st,
              photoReportSettings:{...st.photoReportSettings, [c.id]:ns}}))}
            onOpenChecklistChange={(nl)=>setState(st=>({...st,photoReportOpenChecklist:nl}))}
            onCloseChecklistChange={(nl)=>setState(st=>({...st,photoReportCloseChecklist:nl}))}/>
        }
      </div>
      <div className="s-note" style={{margin:"0 16px 12px"}}>
        {isMgmt ? "Настройки применяются ко всем кураторам сети." : "Настройки применяются только к этому отделу. Для других отделов настройте стандарты отдельно."}
      </div>
    </>;
    }
  }

  return (
    <div className={"rpanel"+(open?" open":"")}>
      <div className="rpanel-inner">
        <div className="rpanel-head">
          <IconBtn soft onClick={back||(()=>(onClose?onClose():setPanel(null)))}>{back?<ChevronLeft size={20}/>:<X size={20}/>}</IconBtn>
          <div className="rpanel-title">{title}</div>
          {panel?.kind==="settings" && <IconBtn soft onClick={()=>setPanel({kind:"editProfile"})}><PencilLine size={19}/></IconBtn>}
        </div>
        <div className="list">{body}</div>
      </div>
    </div>
  );
}

