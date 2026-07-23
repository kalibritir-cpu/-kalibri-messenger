// Вспомогательные функции: аватары, форматирование времени, превью чатов, подсветка поиска
import { AV } from "../constants";

export const avatarColor = (n="?") => AV[[...n].reduce((a,c)=>a+c.charCodeAt(0),0)%AV.length];

export const initials = (n="?") => n.split(" ").slice(0,2).map(w=>w[0]||"").join("").toUpperCase() || "?";

export const now = () => new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"});

export const uid = () => Date.now()+Math.random().toString(36).slice(2,7);

export const statusLine = (c) => {
  if(c.type==="point") return `${c.topics?.length||0} тем · группа`;
  if(c.isCourse) return c.subtitle || `${c.members} участников`;
  if(c.type==="groups") return `${c.members} участников`;
  if(c.type==="channels") return `${c.subscribers} подписчиков`;
  if(c.saved) return "сохранённые сообщения";
  if(c.online) return "в сети";
  if(c.lastSeen) return `был(а) в сети ${c.lastSeen}`;
  return "был(а) недавно";
};

export const lastPreview = (c) => {
  if(c.type==="point"){ const t=c.topics?.[0]; return t?`${t.name}: ${t.preview}`:"Темы точки"; }
  if(c.isCourse){ const s=c.feed?.[0]; const lm=s?.msgs?.filter(m=>!m.service).slice(-1)[0]; return lm?(lm.out?"Вы: ":(lm.sender?lm.sender+": ":""))+lm.t.split("\n")[0]:"Разделы курса"; }
  const m=c.msgs[c.msgs.length-1]; if(!m) return "Нет сообщений";
  const txt=m.photo?"📷 Фото":m.video?"🎬 Видео":m.file?("📎 "+m.file.name):m.voice?"🎤 Голосовое":m.t;
  return (m.out?"Вы: ":(c.type!=="personal"&&m.sender?m.sender+": ":""))+txt;
};

export function formatPhone(val) {
  const d = val.replace(/\D/g,"");
  if(!d) return "";
  let r = "+7";
  if(d.length>1) r += " " + d.slice(1,4);
  if(d.length>4) r += " " + d.slice(4,7);
  if(d.length>7) r += "-" + d.slice(7,9);
  if(d.length>9) r += "-" + d.slice(9,11);
  return r;
}

export function highlight(text, q){
  if(!q || !text) return text;
  const parts = String(text).split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`,"ig"));
  return parts.map((p,i)=> p.toLowerCase()===q.toLowerCase()
    ? <mark key={i} className="hl">{p}</mark> : p);
}

