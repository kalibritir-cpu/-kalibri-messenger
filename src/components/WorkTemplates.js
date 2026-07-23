// Компонент: WorkTemplates — система рабочих шаблонов
import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft, ChevronDown, ChevronRight, Check, CheckCircle2,
  Send, Copy, X, Plus, Camera, Film, Image as ImageIcon,
  Trash2, ArrowUp, ArrowDown, Settings2, Gift, Wrench,
  Clock, AlertTriangle, FileText, Paperclip
} from "lucide-react";

/* ─── Типы полей конструктора ─── */
const FIELD_TYPES = [
  { type:"photo",     label:"Фото",                      emoji:"📷" },
  { type:"photos",    label:"Несколько фотографий",       emoji:"🖼" },
  { type:"video",     label:"Видео",                      emoji:"🎬" },
  { type:"videos",    label:"Несколько видео",             emoji:"📹" },
  { type:"text",      label:"Текст",                      emoji:"✏️" },
  { type:"textarea",  label:"Большой комментарий",        emoji:"📝" },
  { type:"dropdown",  label:"Выпадающий список",          emoji:"📋" },
  { type:"toggle",    label:"Переключатель Да/Нет",       emoji:"🔘" },
  { type:"number",    label:"Число",                      emoji:"🔢" },
  { type:"money",     label:"Денежная сумма",              emoji:"💰" },
  { type:"toy",       label:"Выбор игрушки из каталога",  emoji:"🧸" },
  { type:"employee",  label:"Выбор сотрудника",           emoji:"👤" },
  { type:"datetime",  label:"Дата и время",               emoji:"📅" },
  { type:"geo",       label:"Геолокация",                 emoji:"📍" },
  { type:"signature", label:"Подпись",                    emoji:"✍️" },
  { type:"qr",        label:"QR-код",                     emoji:"🔳" },
  { type:"barcode",   label:"Сканирование штрихкода",     emoji:"📊" },
  { type:"file",      label:"Файл",                       emoji:"📎" },
];

/* ─── Встроенные шаблоны ─── */
const BUILT_IN = [
  { id:"prizes", emoji:"🎁", name:"Выдача призов", color:"#a878f0", targetTopic:"ВЫДАЧА ПРИЗОВ",
    children:[
      { id:"wheel", name:"Колесо фортуны", emoji:"🟣", fields:[
        { id:"f1",type:"video",label:"Видео вращения колеса",required:true },
        { id:"f2",type:"photos",label:"Фото клиента и игрушки",required:true },
        { id:"f3",type:"textarea",label:"Комментарий",required:false },
      ]},
      { id:"shooting", name:"Тир", emoji:"🎯", fields:[
        { id:"f1",type:"photo",label:"Фото мишени",required:true },
        { id:"f2",type:"photos",label:"Фото клиента и игрушки",required:true },
        { id:"f3",type:"dropdown",label:"Прицел",options:["Коллиматор","Механический"],required:true,hint:"Укажите при выигрыше большой игрушки" },
        { id:"f4",type:"dropdown",label:"Упор",options:["С упором","Без упора"],required:true },
        { id:"f5",type:"textarea",label:"Комментарий",required:false },
      ]},
      { id:"balloon", name:"Лопни шар", emoji:"🎈", fields:[
        { id:"f1",type:"photo",label:"Фото лопнувших шаров",required:true },
        { id:"f2",type:"photos",label:"Фото клиента и игрушки",required:true },
        { id:"f3",type:"textarea",label:"Комментарий",required:false },
      ]},
      { id:"bow", name:"Лук", emoji:"🏹", fields:[
        { id:"f1",type:"photo",label:"Фото мишени",required:true },
        { id:"f2",type:"photos",label:"Фото клиента и игрушки",required:true },
        { id:"f3",type:"textarea",label:"Комментарий",required:false },
      ]},
      { id:"lottery", name:"Лототрон", emoji:"🎲", fields:[
        { id:"f1",type:"photo",label:"Фото выигрышного билета",required:true },
        { id:"f2",type:"photos",label:"Фото клиента и игрушки",required:true },
        { id:"f3",type:"textarea",label:"Комментарий",required:false },
      ]},
      { id:"angry-birds", name:"Энгри бердс", emoji:"🐦", fields:[
        { id:"f1",type:"photos",label:"Фото клиента и игрушки",required:true },
        { id:"f2",type:"textarea",label:"Комментарий",required:false },
      ]},
    ]},
  { id:"tech-issue", emoji:"🔧", name:"Техническая неисправность", color:"#e8a838",
    fields:[
      { id:"f1",type:"photos",label:"Фото",required:true },
      { id:"f2",type:"video",label:"Видео",required:false },
      { id:"f3",type:"dropdown",label:"Категория",options:["Аттракцион","Освещение","Электрика","Мебель","Другое"],required:true },
      { id:"f4",type:"textarea",label:"Комментарий",required:true },
      { id:"f5",type:"dropdown",label:"Срочность",options:["Обычная","Срочная","Критическая"],required:true },
    ]},
  { id:"cleaning", emoji:"🧹", name:"Уборка", color:"#25d10a",
    fields:[
      { id:"f1",type:"photo",label:"Фото до",required:true },
      { id:"f2",type:"photo",label:"Фото после",required:true },
      { id:"f3",type:"textarea",label:"Комментарий",required:false },
    ]},
  { id:"explanation", emoji:"📝", name:"Объяснительная", color:"#25d10a", targetTopic:"КОНТРОЛЬ",
    fields:[
      { id:"f1",type:"dropdown",label:"Тип нарушения",required:true,
        options:["Опоздание на смену","Отсутствие на рабочем месте","Не отправлен фотоотчёт",
                 "Нарушение стандартов","Конфликт с клиентом","Недостача / касса",
                 "Порча имущества","Невыполнение задачи","Другое"],
        hint:"Выберите, к чему относится объяснение" },
      { id:"f2",type:"employee",label:"Сотрудник",required:true },
      { id:"f3",type:"datetime",label:"Дата и время происшествия",required:true },
      { id:"f5",type:"textarea",label:"Что произошло",required:true,
        hint:"Опишите ситуацию подробно: где, когда, при каких обстоятельствах" },
      { id:"f6",type:"textarea",label:"Причина",required:true,
        hint:"Почему это произошло — объясните причину своими словами" },
      { id:"f7",type:"textarea",label:"Меры и что сделано",required:false,
        hint:"Что вы предприняли, чтобы исправить ситуацию" },
      { id:"f8",type:"textarea",label:"Как не допустить повторения",required:false,
        hint:"Какие меры примете, чтобы это не повторилось" },
      { id:"f9",type:"dropdown",label:"Признаёте нарушение?",required:true,
        options:["Да, признаю","Частично признаю","Не признаю"] },
      { id:"f10",type:"dropdown",label:"Были ли уведомлены",required:false,
        options:["Куратор уведомлён сразу","Уведомлён позже","Не уведомлялся"] },
      { id:"f11",type:"photos",label:"Фото-подтверждение",required:false,
        hint:"Скриншоты, фото места, переписка" },
      { id:"f12",type:"file",label:"Документы",required:false,
        hint:"Справка, чек, акт — если есть" },
      { id:"f13",type:"signature",label:"Подпись сотрудника",required:true,
        hint:"Подтвердите, что написали объяснительную лично" },
    ]},
];

const DEMO_EMPLOYEES = ["Лезина Когалым","Милана","Зухра Когалым новый","Ясмина","Анна Петрова"];
const DEMO_TOYS = ["Большой Стич","Микки Маус","Единорог","Панда","Кот","Мишка","Собака","Дракон"];

let _uid=1;
const uid=()=>"wt-"+(Date.now().toString(36))+(++_uid);

/* ─── Рендер одного поля формы ─── */
function TemplateField({ field, value, onChange, employees }){
  const ref = useRef(null);
  const t = field.type;

  const pickFile=(accept,multi)=>{
    const inp=document.createElement("input");
    inp.type="file"; inp.accept=accept||""; inp.multiple=!!multi;
    inp.onchange=(e)=>{
      const files=Array.from(e.target.files);
      if(!files.length) return;
      const readers=files.map(f=>new Promise(res=>{
        const r=new FileReader(); r.onload=()=>res({name:f.name,data:r.result,size:f.size}); r.readAsDataURL(f);
      }));
      Promise.all(readers).then(results=>{
        if(multi) onChange([...(value||[]),...results]);
        else onChange(results[0]);
      });
    };
    inp.click();
  };

  const removeMedia=(idx)=>{
    if(Array.isArray(value)) onChange(value.filter((_,i)=>i!==idx));
    else onChange(null);
  };

  // Фото (одно)
  if(t==="photo") return (
    <div className="wt-field">
      <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
      {value ? <div className="wt-media-preview">
        <img src={value.data} alt=""/>
        <button className="wt-media-rm" onClick={()=>onChange(null)}><X size={14}/></button>
      </div>
      : <button className="wt-media-btn" onClick={()=>pickFile("image/*",false)}>
          <Camera size={20}/> Добавить фото
        </button>}
    </div>
  );

  // Несколько фото
  if(t==="photos") return (
    <div className="wt-field">
      <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}
        {value?.length>0 && <span className="wt-cnt">{value.length}</span>}</div>
      <div className="wt-media-grid">
        {(value||[]).map((v,i)=><div key={i} className="wt-media-thumb">
          <img src={v.data} alt=""/>
          <button className="wt-media-rm" onClick={()=>removeMedia(i)}><X size={12}/></button>
        </div>)}
        <button className="wt-media-add" onClick={()=>pickFile("image/*",true)}>
          <Plus size={20}/>
        </button>
      </div>
    </div>
  );

  // Видео (одно)
  if(t==="video") return (
    <div className="wt-field">
      <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
      {value ? <div className="wt-media-preview video">
        <Film size={28} color="var(--accent)"/>
        <span className="wt-video-name">{value.name||"Видео"}</span>
        <button className="wt-media-rm" onClick={()=>onChange(null)}><X size={14}/></button>
      </div>
      : <button className="wt-media-btn" onClick={()=>pickFile("video/*",false)}>
          <Film size={20}/> Добавить видео
        </button>}
    </div>
  );

  // Несколько видео
  if(t==="videos") return (
    <div className="wt-field">
      <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}
        {value?.length>0 && <span className="wt-cnt">{value.length}</span>}</div>
      <div className="wt-media-grid">
        {(value||[]).map((v,i)=><div key={i} className="wt-media-thumb video-thumb">
          <Film size={20}/>
          <button className="wt-media-rm" onClick={()=>removeMedia(i)}><X size={12}/></button>
        </div>)}
        <button className="wt-media-add" onClick={()=>pickFile("video/*",true)}>
          <Plus size={20}/>
        </button>
      </div>
    </div>
  );

  // Текст (однострочный)
  if(t==="text") return (
    <div className="wt-field">
      <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
      <input className="wt-input" value={value||""} onChange={e=>onChange(e.target.value)}
        placeholder={field.placeholder||field.label}/>
    </div>
  );

  // Текстовое поле
  if(t==="textarea") return (
    <div className="wt-field">
      <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
      <textarea className="wt-textarea" rows={3} value={value||""} onChange={e=>onChange(e.target.value)}
        placeholder={field.placeholder||"Введите текст…"}/>
    </div>
  );

  // Выпадающий список
  if(t==="dropdown"){
    const [open,setOpen]=useState(false);
    const opts=field.options||[];
    return (
      <div className="wt-field">
        <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
        {field.hint && <div className="wt-field-hint">{field.hint}</div>}
        <div className="wt-dropdown" onClick={()=>setOpen(!open)}>
          <span className={value?"":"wt-placeholder"}>{value||"Выберите…"}</span>
          <ChevronDown size={18}/>
        </div>
        {open && <div className="wt-options">
          {opts.map(o=><div key={o} className={"wt-option"+(o===value?" sel":"")}
            onClick={()=>{onChange(o);setOpen(false);}}>
            {o}{o===value && <Check size={14} color="var(--accent)"/>}
          </div>)}
        </div>}
      </div>
    );
  }

  // Переключатель Да/Нет
  if(t==="toggle") return (
    <div className="wt-field">
      <div className="wt-toggle-row">
        <span className="wt-field-label" style={{margin:0}}>{field.label}{field.required && <span className="wt-req">*</span>}</span>
        <div className={"wt-switch"+(value?" on":"")} onClick={()=>onChange(!value)}>
          <div className="wt-switch-thumb"/>
        </div>
      </div>
    </div>
  );

  // Число
  if(t==="number") return (
    <div className="wt-field">
      <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
      <input className="wt-input" type="number" value={value||""} onChange={e=>onChange(e.target.value)}
        placeholder="0"/>
    </div>
  );

  // Денежная сумма
  if(t==="money") return (
    <div className="wt-field">
      <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
      <div className="wt-money-wrap">
        <input className="wt-input" type="number" value={value||""} onChange={e=>onChange(e.target.value)}
          placeholder="0.00"/>
        <span className="wt-money-cur">₽</span>
      </div>
    </div>
  );

  // Выбор игрушки
  if(t==="toy"){
    const [open,setOpen]=useState(false);
    return (
      <div className="wt-field">
        <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
        <div className="wt-dropdown" onClick={()=>setOpen(!open)}>
          <span className={value?"":"wt-placeholder"}>{value||"Выберите игрушку…"}</span>
          <ChevronDown size={18}/>
        </div>
        {open && <div className="wt-options">
          {DEMO_TOYS.map(o=><div key={o} className={"wt-option"+(o===value?" sel":"")}
            onClick={()=>{onChange(o);setOpen(false);}}>
            🧸 {o}{o===value && <Check size={14} color="var(--accent)"/>}
          </div>)}
        </div>}
      </div>
    );
  }

  // Выбор сотрудника
  if(t==="employee"){
    const [open,setOpen]=useState(false);
    const list = employees || DEMO_EMPLOYEES;
    return (
      <div className="wt-field">
        <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
        <div className="wt-dropdown" onClick={()=>setOpen(!open)}>
          <span className={value?"":"wt-placeholder"}>{value||"Выберите сотрудника…"}</span>
          <ChevronDown size={18}/>
        </div>
        {open && <div className="wt-options">
          {list.map(o=><div key={o} className={"wt-option"+(o===value?" sel":"")}
            onClick={()=>{onChange(o);setOpen(false);}}>
            {o}{o===value && <Check size={14} color="var(--accent)"/>}
          </div>)}
        </div>}
      </div>
    );
  }

  // Дата и время
  if(t==="datetime") return (
    <div className="wt-field">
      <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
      <input className="wt-input" type="datetime-local" value={value||""} onChange={e=>onChange(e.target.value)}/>
    </div>
  );

  // Геолокация
  if(t==="geo") return (
    <div className="wt-field">
      <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
      {value ? <div className="wt-geo-result">
        <span>📍 {value}</span>
        <button className="wt-geo-rm" onClick={()=>onChange(null)}><X size={14}/></button>
      </div>
      : <button className="wt-media-btn" onClick={()=>onChange("55.7558° N, 37.6173° E")}>
          📍 Определить местоположение
        </button>}
    </div>
  );

  // Подпись
  if(t==="signature") return (
    <div className="wt-field">
      <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
      {value ? <div className="wt-sig-done">
        <span>✍️ Подпись добавлена</span>
        <button className="wt-geo-rm" onClick={()=>onChange(null)}><X size={14}/></button>
      </div>
      : <div className="wt-sig-pad" onClick={()=>onChange("signed")}>
          <span>Нажмите, чтобы поставить подпись</span>
        </div>}
    </div>
  );

  // QR-код
  if(t==="qr") return (
    <div className="wt-field">
      <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
      {value ? <div className="wt-geo-result">
        <span>🔳 {value}</span>
        <button className="wt-geo-rm" onClick={()=>onChange(null)}><X size={14}/></button>
      </div>
      : <button className="wt-media-btn" onClick={()=>onChange("QR-2024-DEMO-1234")}>
          🔳 Сканировать QR-код
        </button>}
    </div>
  );

  // Штрихкод
  if(t==="barcode") return (
    <div className="wt-field">
      <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
      {value ? <div className="wt-geo-result">
        <span>📊 {value}</span>
        <button className="wt-geo-rm" onClick={()=>onChange(null)}><X size={14}/></button>
      </div>
      : <button className="wt-media-btn" onClick={()=>onChange("4607089510012")}>
          📊 Сканировать штрихкод
        </button>}
    </div>
  );

  // Файл
  if(t==="file") return (
    <div className="wt-field">
      <div className="wt-field-label">{field.label}{field.required && <span className="wt-req">*</span>}</div>
      {value ? <div className="wt-file-result">
        <Paperclip size={16}/>
        <span>{value.name}</span>
        <button className="wt-geo-rm" onClick={()=>onChange(null)}><X size={14}/></button>
      </div>
      : <button className="wt-media-btn" onClick={()=>pickFile("*/*",false)}>
          <Paperclip size={20}/> Прикрепить файл
        </button>}
    </div>
  );

  return null;
}

/* ─── Конструктор шаблонов ─── */
function TemplateConstructor({ initial, onSave, onBack }){
  const [name,setName]=useState(initial?.name||"");
  const [emoji,setEmoji]=useState(initial?.emoji||"📋");
  const [color,setColor]=useState(initial?.color||"#25d10a");
  const [fields,setFields]=useState(initial?.fields||[]);
  const [targetTopic,setTargetTopic]=useState(initial?.targetTopic||"");
  const [needConfirm,setNeedConfirm]=useState(initial?.needConfirm||false);
  const [showPalette,setShowPalette]=useState(false);
  const [editOpts,setEditOpts]=useState(null); // field id for editing dropdown options
  const [optText,setOptText]=useState("");

  const COLORS=["#5b8def","#a878f0","#25d10a","#e8a838","#f0616d","#00bcd4","#ff9800","#607d8b"];
  const EMOJIS=["📋","📸","🎁","🔧","📦","🧹","⚠️","⭐","🎥","📝","💡","🔍","📊","🎯","🏆","💼","🛒","📌"];

  const addField=(ft)=>{
    const f={id:uid(),type:ft.type,label:ft.label,required:false};
    if(ft.type==="dropdown") f.options=["Вариант 1","Вариант 2"];
    setFields(prev=>[...prev,f]);
    setShowPalette(false);
  };
  const removeField=(id)=>setFields(prev=>prev.filter(f=>f.id!==id));
  const moveField=(id,dir)=>setFields(prev=>{
    const i=prev.findIndex(f=>f.id===id);
    if(i<0||(dir===-1&&i===0)||(dir===1&&i===prev.length-1)) return prev;
    const a=[...prev]; [a[i],a[i+dir]]=[a[i+dir],a[i]]; return a;
  });
  const toggleReq=(id)=>setFields(prev=>prev.map(f=>f.id===id?{...f,required:!f.required}:f));
  const updateLabel=(id,label)=>setFields(prev=>prev.map(f=>f.id===id?{...f,label}:f));
  const addOption=(fid)=>{
    if(!optText.trim()) return;
    setFields(prev=>prev.map(f=>f.id===fid?{...f,options:[...(f.options||[]),optText.trim()]}:f));
    setOptText("");
  };
  const removeOption=(fid,idx)=>setFields(prev=>prev.map(f=>f.id===fid?{...f,options:(f.options||[]).filter((_,i)=>i!==idx)}:f));

  const canSave=name.trim()&&fields.length>0;

  return (
    <div className="wt-page">
      <div className="chat-head">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={26}/></button>
        <div className="chat-head-info"><div className="chat-head-name">{initial?"Редактировать шаблон":"Новый шаблон"}</div></div>
      </div>
      <div className="wt-scroll">
        {/* Название и эмодзи */}
        <div className="wt-section">
          <div className="wt-section-title">Название шаблона</div>
          <div className="wt-constructor-name-row">
            <div className="wt-emoji-pick">
              <span className="wt-emoji-current" onClick={e=>{
                const el=e.currentTarget.nextSibling;
                if(el) el.style.display=el.style.display==="none"?"flex":"none";
              }}>{emoji}</span>
              <div className="wt-emoji-palette" style={{display:"none"}}>
                {EMOJIS.map(e=><span key={e} onClick={ev=>{setEmoji(e);ev.currentTarget.parentElement.style.display="none";}}>{e}</span>)}
              </div>
            </div>
            <input className="wt-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Например: Проверка рекламы"/>
          </div>
        </div>

        {/* Цвет */}
        <div className="wt-section">
          <div className="wt-section-title">Цвет</div>
          <div className="wt-color-row">
            {COLORS.map(c=><div key={c} className={"wt-color-dot"+(c===color?" sel":"")}
              style={{background:c}} onClick={()=>setColor(c)}/>)}
          </div>
        </div>

        {/* Поля */}
        <div className="wt-section">
          <div className="wt-section-title">Поля шаблона <span className="wt-cnt">{fields.length}</span></div>
          {fields.map((f,i)=>{
            const ft=FIELD_TYPES.find(x=>x.type===f.type);
            return (
              <div key={f.id} className="wt-constructor-field">
                <div className="wt-cf-head">
                  <span className="wt-cf-emoji">{ft?.emoji||"📋"}</span>
                  <input className="wt-cf-label-input" value={f.label} onChange={e=>updateLabel(f.id,e.target.value)}/>
                  <div className="wt-cf-actions">
                    <button onClick={()=>moveField(f.id,-1)} disabled={i===0}><ArrowUp size={14}/></button>
                    <button onClick={()=>moveField(f.id,1)} disabled={i===fields.length-1}><ArrowDown size={14}/></button>
                    <button className="danger" onClick={()=>removeField(f.id)}><Trash2 size={14}/></button>
                  </div>
                </div>
                <div className="wt-cf-meta">
                  <span className="wt-cf-type">{ft?.label||f.type}</span>
                  <label className="wt-cf-req-label">
                    <input type="checkbox" checked={f.required} onChange={()=>toggleReq(f.id)}/> Обязательное
                  </label>
                </div>
                {f.type==="dropdown" && <div className="wt-cf-opts">
                  <div className="wt-cf-opts-title">Варианты:</div>
                  {(f.options||[]).map((o,oi)=><div key={oi} className="wt-cf-opt-item">
                    <span>{o}</span>
                    <button onClick={()=>removeOption(f.id,oi)}><X size={12}/></button>
                  </div>)}
                  <div className="wt-cf-opt-add">
                    <input value={editOpts===f.id?optText:""} onFocus={()=>setEditOpts(f.id)}
                      onChange={e=>{setEditOpts(f.id);setOptText(e.target.value);}}
                      placeholder="Новый вариант…"
                      onKeyDown={e=>{if(e.key==="Enter"){addOption(f.id);}}}/>
                    <button onClick={()=>addOption(f.id)}><Plus size={14}/></button>
                  </div>
                </div>}
              </div>
            );
          })}

          {/* Добавить поле */}
          <button className="wt-add-field-btn" onClick={()=>setShowPalette(!showPalette)}>
            <Plus size={18}/> Добавить поле
          </button>
          {showPalette && <div className="wt-field-palette">
            {FIELD_TYPES.map(ft=>(
              <div key={ft.type} className="wt-palette-item" onClick={()=>addField(ft)}>
                <span className="wt-palette-emoji">{ft.emoji}</span>
                <span>{ft.label}</span>
              </div>
            ))}
          </div>}
        </div>

        {/* Настройки */}
        <div className="wt-section">
          <div className="wt-section-title">Настройки</div>
          <div className="wt-field">
            <div className="wt-field-label">В какую тему попадёт отчёт</div>
            <input className="wt-input" value={targetTopic} onChange={e=>setTargetTopic(e.target.value)}
              placeholder="Например: Выдача призов"/>
          </div>
          <div className="wt-toggle-row" style={{marginTop:12}}>
            <span className="wt-field-label" style={{margin:0}}>Требуется подтверждение куратора</span>
            <div className={"wt-switch"+(needConfirm?" on":"")} onClick={()=>setNeedConfirm(!needConfirm)}>
              <div className="wt-switch-thumb"/>
            </div>
          </div>
        </div>

        {/* Сохранить */}
        <div className="wt-actions">
          <button className={"wt-btn accent"+(canSave?"":" disabled")}
            onClick={()=>{if(!canSave) return; onSave({
              id:initial?.id||uid(), name:name.trim(), emoji, color, fields,
              targetTopic, needConfirm, custom:true
            });}}>
            <Check size={16}/> Сохранить шаблон
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Главный компонент WorkTemplates
   ═══════════════════════════════════════ */
export function WorkTemplates({ config, onBack, onSend, startTemplate }){
  const [view,setView]=useState("menu");       // menu | children | form | sent | constructor
  const [category,setCategory]=useState(null);  // выбранная категория
  const [template,setTemplate]=useState(null);  // выбранный шаблон (с fields)
  const [formData,setFormData]=useState({});
  const [sentReport,setSentReport]=useState(null);
  const [customTemplates,setCustomTemplates]=useState(config?.customTemplates||[]);
  const [editTpl,setEditTpl]=useState(null);    // шаблон для редактирования в конструкторе

  // Автооткрытие конкретного шаблона (например «Объяснительная» из меню «+»)
  useEffect(()=>{
    if(!startTemplate) return;
    const all=[...BUILT_IN, ...(config?.customTemplates||[])];
    const tpl=all.find(t=>t.id===startTemplate);
    if(tpl && !tpl.children){ setTemplate(tpl); setFormData({}); setView("form"); }
  },[startTemplate]);

  const allTemplates = [...BUILT_IN, ...customTemplates];

  const openCategory=(cat)=>{
    if(cat.children){
      setCategory(cat); setView("children");
    } else {
      setTemplate(cat); setFormData({}); setView("form");
    }
  };
  const openTemplate=(tpl)=>{
    setTemplate(tpl); setFormData({}); setView("form");
  };

  // Проверка обязательных полей
  const isValid=()=>{
    if(!template?.fields) return false;
    return template.fields.filter(f=>f.required).every(f=>{
      const v=formData[f.id];
      if(v===null||v===undefined||v==="") return false;
      if(Array.isArray(v)&&v.length===0) return false;
      return true;
    });
  };

  const handleSend=()=>{
    if(!isValid()) return;
    const photoCount = (template.fields||[]).reduce((n,f)=>{
      if(f.type==="photo"&&formData[f.id]) return n+1;
      if(f.type==="photos"&&formData[f.id]) return n+(formData[f.id].length||0);
      return n;
    },0);
    const videoCount = (template.fields||[]).reduce((n,f)=>{
      if(f.type==="video"&&formData[f.id]) return n+1;
      if(f.type==="videos"&&formData[f.id]) return n+(formData[f.id].length||0);
      return n;
    },0);
    const time=new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"});
    const report={
      templateName: template.name,
      categoryEmoji: category?.emoji||template.emoji||"📋",
      categoryName: category?.name||"",
      fields: template.fields.map(f=>({...f,value:formData[f.id]})),
      photoCount, videoCount, time,
      employee: formData[template.fields.find(f=>f.type==="employee")?.id] || config?.employeeName || "",
      targetTopic: category?.targetTopic||template.targetTopic||"",
    };
    setSentReport(report);
    setView("sent");
    onSend&&onSend(report);
  };

  const copyReport=()=>{
    if(!sentReport) return;
    const lines=[
      `${sentReport.categoryEmoji} ${sentReport.categoryName?sentReport.categoryName+" — ":""}${sentReport.templateName}`,
      sentReport.employee?`Сотрудник: ${sentReport.employee}`:"",
      sentReport.photoCount?`Фото: ${sentReport.photoCount}`:"",
      sentReport.videoCount?`Видео: ${sentReport.videoCount}`:"",
      `Время: ${sentReport.time}`,
      "Статус: Отправлено",
      "",
      ...sentReport.fields.filter(f=>f.value&&f.type!=="photo"&&f.type!=="photos"&&f.type!=="video"&&f.type!=="videos")
        .map(f=>`${f.label}: ${typeof f.value==="object"?JSON.stringify(f.value):f.value}`),
    ].filter(Boolean);
    navigator.clipboard?.writeText(lines.join("\n"));
  };

  const saveCustom=(tpl)=>{
    setCustomTemplates(prev=>{
      const idx=prev.findIndex(t=>t.id===tpl.id);
      if(idx>=0){ const a=[...prev]; a[idx]=tpl; return a; }
      return [...prev,tpl];
    });
    setView("menu"); setEditTpl(null);
  };
  const deleteCustom=(id)=>{
    setCustomTemplates(prev=>prev.filter(t=>t.id!==id));
  };

  /* ─── Sent view ─── */
  if(view==="sent"&&sentReport) return (
    <div className="wt-page">
      <div className="chat-head">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={26}/></button>
        <div className="chat-head-info"><div className="chat-head-name">Отчёт отправлен</div></div>
      </div>
      <div className="wt-scroll">
        <div className="wt-sent-card">
          <div className="wt-sent-icon"><CheckCircle2 size={52} color="#25d10a"/></div>
          <div className="wt-sent-title">Отчёт отправлен</div>

          <div className="wt-report-card">
            <div className="wt-rc-head">
              <span className="wt-rc-emoji">{sentReport.categoryEmoji}</span>
              <span className="wt-rc-name">
                {sentReport.categoryName?sentReport.categoryName+" — ":""}
                {sentReport.templateName}
              </span>
            </div>
            {config?.pointName && <div className="wt-rc-row">{config.pointName}</div>}
            {sentReport.employee && <div className="wt-rc-row">Сотрудник: {sentReport.employee}</div>}
            {/* Отображаем текстовые значения */}
            {sentReport.fields.filter(f=>f.value&&(f.type==="text"||f.type==="number"||f.type==="money"||f.type==="dropdown"||f.type==="toy"))
              .map(f=><div key={f.id} className="wt-rc-row">{f.label}: {f.value}{f.type==="money"?" ₽":""}</div>)}
            {sentReport.videoCount>0 && <div className="wt-rc-row">Видео: {sentReport.videoCount}</div>}
            {sentReport.photoCount>0 && <div className="wt-rc-row">Фото: {sentReport.photoCount}</div>}
            <div className="wt-rc-row">Время: {sentReport.time}</div>
            <div className="wt-rc-status"><CheckCircle2 size={14} color="#25d10a"/> Отправлено</div>
            {sentReport.targetTopic && <div className="wt-rc-topic">→ {sentReport.targetTopic}</div>}
          </div>

          <div className="wt-sent-actions">
            <button className="wt-btn accent" onClick={()=>{setView("menu");setTemplate(null);setCategory(null);setFormData({});setSentReport(null);}}>
              Новый отчёт
            </button>
            <button className="wt-btn outline" onClick={copyReport}>
              <Copy size={16}/> Скопировать
            </button>
            <button className="wt-btn outline" onClick={onBack}>
              Назад к чату
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── Constructor ─── */
  if(view==="constructor") return (
    <TemplateConstructor initial={editTpl}
      onBack={()=>{setView("menu");setEditTpl(null);}}
      onSave={saveCustom}/>
  );

  /* ─── Form view ─── */
  if(view==="form"&&template) return (
    <div className="wt-page">
      <div className="chat-head">
        <button className="back-btn" onClick={()=>{
          if(category?.children) setView("children");
          else setView("menu");
        }}><ChevronLeft size={26}/></button>
        <div className="chat-head-info">
          <div className="chat-head-name">{template.emoji||category?.emoji||"📋"} {template.name}</div>
        </div>
      </div>
      <div className="wt-scroll">
        <div className="wt-form-info">
          <div className="wt-form-info-title">{template.emoji||category?.emoji||"📋"} {template.name}</div>
          <div className="wt-form-info-sub">Заполните обязательные поля и отправьте отчёт</div>
        </div>

        {(template.fields||[]).map(f=>
          <TemplateField key={f.id} field={f}
            value={formData[f.id]}
            onChange={v=>setFormData(prev=>({...prev,[f.id]:v}))}
            employees={config?.employees}/>
        )}

        <div className="wt-actions">
          <button className={"wt-btn accent"+(isValid()?"":" disabled")} onClick={handleSend}>
            <Send size={16}/> Отправить отчёт
          </button>
        </div>

        {!isValid() && Object.keys(formData).length>0 && <div className="wt-warn">
          <AlertTriangle size={14}/> Заполните все обязательные поля
        </div>}
      </div>
    </div>
  );

  /* ─── Children view (подкатегории) ─── */
  if(view==="children"&&category) return (
    <div className="wt-page">
      <div className="chat-head">
        <button className="back-btn" onClick={()=>setView("menu")}><ChevronLeft size={26}/></button>
        <div className="chat-head-info">
          <div className="chat-head-name">{category.emoji} {category.name}</div>
        </div>
      </div>
      <div className="wt-scroll">
        <div className="wt-cat-list">
          {category.children.map(ch=>(
            <div key={ch.id} className="wt-cat-item" onClick={()=>openTemplate(ch)}>
              <span className="wt-cat-emoji">{ch.emoji||category.emoji}</span>
              <div className="wt-cat-info">
                <div className="wt-cat-name">{ch.name}</div>
                <div className="wt-cat-sub">{ch.fields?.length||0} полей</div>
              </div>
              <ChevronRight size={18} color="var(--sub)"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ─── Menu view (главное меню) ─── */
  return (
    <div className="wt-page">
      <div className="chat-head">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={26}/></button>
        <div className="chat-head-info"><div className="chat-head-name">Создать</div></div>
        <button className="wt-constructor-btn" onClick={()=>{setEditTpl(null);setView("constructor");}}
          title="Конструктор шаблонов"><Settings2 size={20}/></button>
      </div>
      <div className="wt-scroll">
        {/* Встроенные */}
        <div className="wt-menu-section-title">Шаблоны</div>
        <div className="wt-cat-list">
          {BUILT_IN.map(cat=>(
            <div key={cat.id} className="wt-cat-item" onClick={()=>openCategory(cat)}>
              <span className="wt-cat-emoji" style={{background:cat.color+"22",color:cat.color}}>{cat.emoji}</span>
              <div className="wt-cat-info">
                <div className="wt-cat-name">{cat.name}</div>
                <div className="wt-cat-sub">{cat.children?cat.children.length+" шаблонов":(cat.fields?.length||0)+" полей"}</div>
              </div>
              <ChevronRight size={18} color="var(--sub)"/>
            </div>
          ))}
        </div>

        {/* Пользовательские */}
        {customTemplates.length>0 && <>
          <div className="wt-menu-section-title">Мои шаблоны</div>
          <div className="wt-cat-list">
            {customTemplates.map(ct=>(
              <div key={ct.id} className="wt-cat-item">
                <span className="wt-cat-emoji" style={{background:(ct.color||"#25d10a")+"22",color:ct.color||"#25d10a"}}
                  onClick={()=>openCategory(ct)}>{ct.emoji||"📋"}</span>
                <div className="wt-cat-info" onClick={()=>openCategory(ct)}>
                  <div className="wt-cat-name">{ct.name}</div>
                  <div className="wt-cat-sub">{ct.fields?.length||0} полей</div>
                </div>
                <button className="wt-cat-edit" onClick={()=>{setEditTpl(ct);setView("constructor");}}>
                  <Settings2 size={16}/>
                </button>
                <button className="wt-cat-del" onClick={()=>deleteCustom(ct.id)}>
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}
          </div>
        </>}

        {/* Конструктор */}
        <div className="wt-constructor-card" onClick={()=>{setEditTpl(null);setView("constructor");}}>
          <Plus size={22} color="var(--accent)"/>
          <div>
            <div className="wt-constructor-card-title">Конструктор шаблонов</div>
            <div className="wt-constructor-card-sub">Создайте свой шаблон с любыми полями</div>
          </div>
        </div>
      </div>
    </div>
  );
}
