// Компонент: PointSchedule — график смен в точке (чат + расписание-карточки)
import { useState } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Plus, X, Clock, Check, CheckCheck, Send, Calendar,
  Users, Edit3, AlertCircle, ArrowRightLeft, Trash2
} from "lucide-react";
import { Avatar } from "./index";

const DAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const MONTHS_GEN = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const SHIFT_COLORS = ["#5b8def","#ef6ba8","#42c9b0","#e8a838","#a878f0","#f0616d","#6ec9cb","#f0b429"];

function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function firstDow(y,m){ const d=new Date(y,m,1).getDay(); return d===0?6:d-1; }
function pad(n){ return String(n).padStart(2,"0"); }
function dateKey(y,m,d){ return `${y}-${pad(m+1)}-${pad(d)}`; }
function empColor(name, list){ const idx=list.indexOf(name); return SHIFT_COLORS[idx % SHIFT_COLORS.length]; }
function shortName(n){ const parts=n.split(" "); return parts.length>1 ? parts[0]+" "+parts[1][0]+"." : n; }

export function PointSchedule({ msgs, roster, me, onSend, onBack, onToast }){
  // Состояние чата
  const [draft, setDraft] = useState("");
  // Состояние конструктора
  const [creating, setCreating] = useState(false);
  // Список карточек-графиков (каждая — {id, weekStart, weekEnd, month, year, shifts, status, author, approver, log, expanded})
  const [schedules, setSchedules] = useState(demoSchedules());
  const [expandedId, setExpandedId] = useState(null);
  // Редактирование
  const [editId, setEditId] = useState(null);
  const [editDay, setEditDay] = useState(null); // dateKey выбранного дня
  const [addForm, setAddForm] = useState(null); // {name,start,end}
  // Предложение смены
  const [offerModal, setOfferModal] = useState(null); // {schedId, dateKey, shiftIdx, toName}
  // Полный просмотр
  const [fullView, setFullView] = useState(null); // schedId

  const employees = (roster||[]).filter(r=>!r.isMe).map(r=>r.name);
  const allNames = (roster||[]).map(r=>r.name);

  // ═══ Конструктор графика ═══
  const [tplYear, setTplYear] = useState(new Date().getFullYear());
  const [tplMonth, setTplMonth] = useState(new Date().getMonth());
  const [tplWeekIdx, setTplWeekIdx] = useState(0);
  const [tplShifts, setTplShifts] = useState({});
  const [tplAddDay, setTplAddDay] = useState(null);
  const [tplAddName, setTplAddName] = useState(employees[0]||"");
  const [tplAddStart, setTplAddStart] = useState("10:00");
  const [tplAddEnd, setTplAddEnd] = useState("22:00");

  // Недели месяца
  const getWeeks = (y,m) => {
    const dim = daysInMonth(y,m);
    const weeks = [];
    let week = [];
    const fDow = firstDow(y,m);
    for(let i=0;i<fDow;i++) week.push(null);
    for(let d=1;d<=dim;d++){
      week.push(d);
      if(week.length===7){ weeks.push(week); week=[]; }
    }
    if(week.length>0){ while(week.length<7) week.push(null); weeks.push(week); }
    return weeks;
  };
  const tplWeeks = getWeeks(tplYear, tplMonth);
  const tplWeek = tplWeeks[tplWeekIdx] || tplWeeks[0] || [];

  const tplAddShift = () => {
    if(!tplAddDay||!tplAddName) return;
    const key = dateKey(tplYear,tplMonth,tplAddDay);
    setTplShifts(prev => {
      const arr = [...(prev[key]||[]), {name:tplAddName,start:tplAddStart,end:tplAddEnd}];
      return {...prev, [key]:arr};
    });
    setTplAddDay(null);
  };

  const tplRemoveShift = (key, idx) => {
    setTplShifts(prev => {
      const arr = (prev[key]||[]).filter((_,i)=>i!==idx);
      const next = {...prev};
      if(arr.length) next[key]=arr; else delete next[key];
      return next;
    });
  };

  const publishSchedule = () => {
    const wk = tplWeek;
    const days = wk.filter(d=>d!==null);
    if(days.length===0) return;
    const weekStart = days[0];
    const weekEnd = days[days.length-1];
    const id = "sched-"+ Date.now();
    const newSched = {
      id, year:tplYear, month:tplMonth,
      weekStart, weekEnd, shifts:{...tplShifts},
      status:"draft", // draft → pending → approved
      author: me?.name||"Вы",
      approver: null,
      log:[{action:"created", by:me?.name||"Вы", time:nowTime(), text:"График создан"}],
      expanded:false,
    };
    setSchedules(prev=>[newSched,...prev]);
    setCreating(false);
    setTplShifts({});
    onToast && onToast({title:"График опубликован", sub:"Ожидает согласования"});
  };

  // ═══ Действия с графиками ═══
  const approveSchedule = (id) => {
    setSchedules(prev=>prev.map(s=>s.id===id?{...s, status:"approved", approver:me?.name||"Вы",
      log:[...s.log,{action:"approved", by:me?.name||"Вы", time:nowTime(), text:"График согласован"}]}:s));
    onToast && onToast({title:"График согласован ✅"});
  };

  const sendForApproval = (id) => {
    setSchedules(prev=>prev.map(s=>s.id===id?{...s, status:"pending",
      log:[...s.log,{action:"pending", by:me?.name||"Вы", time:nowTime(), text:"Отправлен на согласование"}]}:s));
    onToast && onToast({title:"Отправлен на согласование"});
  };

  const addShiftToSched = (schedId, key, shift) => {
    setSchedules(prev=>prev.map(s=>{
      if(s.id!==schedId) return s;
      const shifts = {...s.shifts};
      shifts[key] = [...(shifts[key]||[]), shift];
      return {...s, shifts, log:[...s.log,{action:"edit", by:me?.name||"Вы", time:nowTime(),
        text:`Добавлена смена: ${shift.name} (${key})`}]};
    }));
  };

  const removeShiftFromSched = (schedId, key, idx) => {
    setSchedules(prev=>prev.map(s=>{
      if(s.id!==schedId) return s;
      const shifts = {...s.shifts};
      const removed = shifts[key]?.[idx];
      shifts[key] = (shifts[key]||[]).filter((_,i)=>i!==idx);
      if(!shifts[key].length) delete shifts[key];
      return {...s, shifts, log:[...s.log,{action:"edit", by:me?.name||"Вы", time:nowTime(),
        text:`Удалена смена: ${removed?.name||"?"} (${key})`}]};
    }));
  };

  const offerShift = (schedId, key, shiftIdx, toName) => {
    setSchedules(prev=>prev.map(s=>{
      if(s.id!==schedId) return s;
      return {...s, log:[...s.log,{action:"offer", by:me?.name||"Вы", time:nowTime(),
        text:`Предложена смена ${key} → ${toName}`}]};
    }));
    setOfferModal(null);
    onToast && onToast({title:"Предложение отправлено", sub:`${toName} получит запрос в личку`});
  };

  // ═══ Отправка сообщения в чат ═══
  const handleSend = () => {
    if(!draft.trim()) return;
    onSend && onSend(draft.trim());
    setDraft("");
  };

  // ═══ Рендер карточки графика (в ленте чата) ═══
  const renderSchedCard = (sched) => {
    const isExpanded = expandedId === sched.id;
    const wk = getWeeksForSched(sched);
    const statusLabel = sched.status==="approved" ? "✅ Согласован" : sched.status==="pending" ? "⏳ На согласовании" : "📝 Черновик";
    const statusCls = sched.status==="approved" ? "ps-status approved" : sched.status==="pending" ? "ps-status pending" : "ps-status draft";

    return (
      <div key={sched.id} className="ps-card">
        <div className="ps-card-head" onClick={()=>setExpandedId(isExpanded?null:sched.id)}>
          <Calendar size={18} color="var(--accent)"/>
          <div className="ps-card-title">
            <span>📅 График на {sched.weekStart}–{sched.weekEnd} {MONTHS_GEN[sched.month]}</span>
            <span className={statusCls}>{statusLabel}</span>
          </div>
          <div className="ps-card-meta">
            <span className="ps-card-author">{shortName(sched.author)}</span>
            {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
          </div>
        </div>

        {isExpanded && <>
          <div className="ps-card-body">
            {/* Мини-таблица */}
            <div className="ps-table">
              <div className="ps-table-head">
                {wk.map((d,i)=>(
                  <div key={i} className={"ps-th"+(d===null?" empty":"")}>
                    {d!==null ? <>{DAYS[i]}<br/><b>{d}</b></> : ""}
                  </div>
                ))}
              </div>
              <div className="ps-table-body">
                {wk.map((d,i)=>{
                  if(d===null) return <div key={i} className="ps-td empty"/>;
                  const key = dateKey(sched.year,sched.month,d);
                  const dayShifts = sched.shifts[key]||[];
                  return (
                    <div key={i} className="ps-td">
                      {dayShifts.map((sh,si)=>(
                        <div key={si} className="ps-shift-chip" style={{background:empColor(sh.name,allNames)+"22", borderLeft:`3px solid ${empColor(sh.name,allNames)}`}}>
                          <span className="ps-shift-name">{shortName(sh.name)}</span>
                          <span className="ps-shift-time">{sh.start}–{sh.end}</span>
                          {editId===sched.id && <>
                            <button className="ps-shift-del" onClick={()=>removeShiftFromSched(sched.id,key,si)} title="Удалить"><X size={12}/></button>
                            <button className="ps-shift-offer" onClick={()=>setOfferModal({schedId:sched.id,dateKey:key,shiftIdx:si,toName:""})} title="Предложить другому"><ArrowRightLeft size={12}/></button>
                          </>}
                        </div>
                      ))}
                      {editId===sched.id && (
                        editDay===key ? (
                          <div className="ps-add-form-mini">
                            <select className="ps-mini-select" value={addForm?.name||employees[0]} onChange={e=>setAddForm(f=>({...f,name:e.target.value}))}>
                              {employees.map(n=><option key={n} value={n}>{shortName(n)}</option>)}
                            </select>
                            <div className="ps-mini-times">
                              <input type="time" value={addForm?.start||"10:00"} onChange={e=>setAddForm(f=>({...f,start:e.target.value}))}/>
                              <input type="time" value={addForm?.end||"22:00"} onChange={e=>setAddForm(f=>({...f,end:e.target.value}))}/>
                            </div>
                            <div className="ps-mini-btns">
                              <button className="ps-mini-ok" onClick={()=>{
                                addShiftToSched(sched.id, key, {name:addForm?.name||employees[0], start:addForm?.start||"10:00", end:addForm?.end||"22:00"});
                                setEditDay(null); setAddForm(null);
                              }}><Check size={14}/></button>
                              <button className="ps-mini-cancel" onClick={()=>{setEditDay(null);setAddForm(null);}}><X size={14}/></button>
                            </div>
                          </div>
                        ) : (
                          <button className="ps-add-day-btn" onClick={()=>{setEditDay(key);setAddForm({name:employees[0],start:"10:00",end:"22:00"});}}><Plus size={12}/></button>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Сводка */}
            <div className="ps-summary">
              {(() => {
                const counts={};
                Object.values(sched.shifts).flat().forEach(sh => { counts[sh.name]=(counts[sh.name]||0)+1; });
                const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
                const total = sorted.reduce((a,b)=>a+b[1],0);
                return sorted.map(([name,cnt])=>(
                  <div key={name} className="ps-sum-row">
                    <div className="ps-sum-dot" style={{background:empColor(name,allNames)}}/>
                    <span className="ps-sum-name">{shortName(name)}</span>
                    <span className="ps-sum-cnt">{cnt} смен</span>
                  </div>
                ));
              })()}
            </div>

            {/* Кнопки действий */}
            <div className="ps-actions">
              {editId===sched.id ? (
                <button className="ps-action-btn" onClick={()=>setEditId(null)}><Check size={14}/> Готово</button>
              ) : (
                <button className="ps-action-btn" onClick={()=>setEditId(sched.id)}><Edit3 size={14}/> Редактировать</button>
              )}
              {sched.status==="draft" && <button className="ps-action-btn primary" onClick={()=>sendForApproval(sched.id)}><Send size={14}/> На согласование</button>}
              {sched.status==="pending" && <button className="ps-action-btn approve" onClick={()=>approveSchedule(sched.id)}><CheckCheck size={14}/> Согласовать</button>}
            </div>

            {/* Лог изменений */}
            {sched.log.length>0 && (
              <div className="ps-log">
                <div className="ps-log-title">История изменений</div>
                {sched.log.slice(-5).reverse().map((l,i)=>(
                  <div key={i} className="ps-log-row">
                    <span className={"ps-log-icon "+(l.action==="approved"?"ok":l.action==="offer"?"offer":"edit")}>
                      {l.action==="approved"?<CheckCheck size={12}/>:l.action==="offer"?<ArrowRightLeft size={12}/>:l.action==="created"?<Calendar size={12}/>:<Edit3 size={12}/>}
                    </span>
                    <span className="ps-log-text">{l.text}</span>
                    <span className="ps-log-time">{l.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>}
      </div>
    );
  };

  // ═══ Модалка предложения смены ═══
  const renderOfferModal = () => {
    if(!offerModal) return null;
    return (
      <div className="ps-overlay" onClick={()=>setOfferModal(null)}>
        <div className="ps-modal" onClick={e=>e.stopPropagation()}>
          <div className="ps-modal-head">
            <span>Предложить смену</span>
            <button onClick={()=>setOfferModal(null)}><X size={18}/></button>
          </div>
          <div className="ps-modal-body">
            <label className="ps-label">Кому предложить</label>
            <select className="ps-select" value={offerModal.toName||employees[0]} onChange={e=>setOfferModal(prev=>({...prev,toName:e.target.value}))}>
              {employees.map(n=><option key={n} value={n}>{n}</option>)}
            </select>
            <div className="ps-modal-note">Сотрудник получит запрос в личные сообщения. При подтверждении изменение отразится в графике.</div>
          </div>
          <div className="ps-modal-foot">
            <button className="ps-action-btn primary" onClick={()=>offerShift(offerModal.schedId,offerModal.dateKey,offerModal.shiftIdx,offerModal.toName||employees[0])}>
              <Send size={14}/> Отправить предложение
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ═══ Конструктор (создание) ═══
  if(creating) return (
    <div className="ps-page">
      <div className="chat-head">
        <button className="back-btn" onClick={e=>{e.stopPropagation();setCreating(false);}}><ChevronLeft size={26}/></button>
        <Avatar name="ГРАФИК" size={44}/>
        <div className="chat-head-info">
          <div className="chat-head-name">Создать график</div>
          <div className="chat-head-status">Конструктор</div>
        </div>
      </div>
      <div className="ps-constructor">
        <div className="ps-tpl-header">
          <button className="sched-nav" onClick={()=>{
            if(tplMonth===0){setTplMonth(11);setTplYear(y=>y-1);} else setTplMonth(m=>m-1); setTplWeekIdx(0);
          }}><ChevronLeft size={18}/></button>
          <span className="ps-tpl-title">{MONTHS[tplMonth]} {tplYear}</span>
          <button className="sched-nav" onClick={()=>{
            if(tplMonth===11){setTplMonth(0);setTplYear(y=>y+1);} else setTplMonth(m=>m+1); setTplWeekIdx(0);
          }}><ChevronRight size={18}/></button>
        </div>

        <div className="ps-week-tabs">
          {tplWeeks.map((wk,i)=>{
            const days=wk.filter(d=>d!==null);
            if(!days.length) return null;
            return <button key={i} className={"ps-week-tab"+(i===tplWeekIdx?" active":"")} onClick={()=>setTplWeekIdx(i)}>
              {days[0]}–{days[days.length-1]}
            </button>;
          })}
        </div>

        <div className="ps-tpl-grid">
          {tplWeek.map((d,i)=>{
            if(d===null) return <div key={i} className="ps-tpl-col empty"/>;
            const key = dateKey(tplYear,tplMonth,d);
            const dayShifts = tplShifts[key]||[];
            return (
              <div key={i} className="ps-tpl-col">
                <div className="ps-tpl-day-head">
                  <span className="ps-tpl-dow">{DAYS[i]}</span>
                  <span className="ps-tpl-date">{d}</span>
                </div>
                {dayShifts.map((sh,si)=>(
                  <div key={si} className="ps-shift-chip" style={{background:empColor(sh.name,allNames)+"22", borderLeft:`3px solid ${empColor(sh.name,allNames)}`}}>
                    <span className="ps-shift-name">{shortName(sh.name)}</span>
                    <span className="ps-shift-time">{sh.start}–{sh.end}</span>
                    <button className="ps-shift-del" onClick={()=>tplRemoveShift(key,si)}><X size={12}/></button>
                  </div>
                ))}
                {tplAddDay===d ? (
                  <div className="ps-add-form-mini">
                    <select className="ps-mini-select" value={tplAddName} onChange={e=>setTplAddName(e.target.value)}>
                      {employees.map(n=><option key={n} value={n}>{shortName(n)}</option>)}
                    </select>
                    <div className="ps-mini-times">
                      <input type="time" value={tplAddStart} onChange={e=>setTplAddStart(e.target.value)}/>
                      <input type="time" value={tplAddEnd} onChange={e=>setTplAddEnd(e.target.value)}/>
                    </div>
                    <div className="ps-mini-btns">
                      <button className="ps-mini-ok" onClick={tplAddShift}><Check size={14}/></button>
                      <button className="ps-mini-cancel" onClick={()=>setTplAddDay(null)}><X size={14}/></button>
                    </div>
                  </div>
                ) : (
                  <button className="ps-add-day-btn" onClick={()=>setTplAddDay(d)}><Plus size={12}/></button>
                )}
              </div>
            );
          })}
        </div>

        <button className="ps-publish-btn" disabled={Object.keys(tplShifts).length===0} onClick={publishSchedule}>
          <Send size={16}/> Опубликовать график
        </button>
      </div>
    </div>
  );

  // ═══ Основной вид: чат + карточки ═══
  return (
    <div className="ps-page">
      {renderOfferModal()}

      <div className="chat-head" onClick={()=>{}}>
        <button className="back-btn" onClick={e=>{e.stopPropagation();onBack();}}><ChevronLeft size={26}/></button>
        <Avatar name="ГРАФИК" size={44}/>
        <div className="chat-head-info">
          <div className="chat-head-name">📅 ГРАФИК</div>
          <div className="chat-head-status">{(roster||[]).length} участников</div>
        </div>
      </div>

      <div className="ps-chat-scroll">
        {/* Сообщения чата */}
        {(msgs||[]).map((m,i)=>(
          <div key={m.id||i} className={"ps-msg "+(m.out?"out":"in")}>
            {!m.out && <span className="ps-msg-sender">{m.sender}</span>}
            <div className={"ps-bubble "+(m.out?"out":"in")}>
              <span>{m.t}</span>
              <span className="ps-msg-time">{m.time}</span>
            </div>
          </div>
        ))}

        {/* Карточки графиков */}
        {schedules.map(s=>renderSchedCard(s))}
      </div>

      {/* Композер */}
      <div className="ps-composer">
        <button className="ps-create-btn" onClick={()=>setCreating(true)} title="Создать график">
          <Calendar size={20}/>
        </button>
        <input className="ps-draft" value={draft} onChange={e=>setDraft(e.target.value)}
          placeholder="Сообщение..." onKeyDown={e=>{ if(e.key==="Enter") handleSend(); }}/>
        <button className="ps-send-btn" disabled={!draft.trim()} onClick={handleSend}><Send size={18}/></button>
      </div>
    </div>
  );
}

function nowTime(){ const d=new Date(); return pad(d.getHours())+":"+pad(d.getMinutes()); }

function getWeeksForSched(sched){
  const dim = daysInMonth(sched.year,sched.month);
  const fDow = firstDow(sched.year,sched.month);
  const weeks = [];
  let week = [];
  for(let i=0;i<fDow;i++) week.push(null);
  for(let d=1;d<=dim;d++){
    week.push(d);
    if(week.length===7){ weeks.push(week); week=[]; }
  }
  if(week.length>0){ while(week.length<7) week.push(null); weeks.push(week); }
  // Найти неделю содержащую weekStart
  for(const wk of weeks){
    if(wk.includes(sched.weekStart)) return wk;
  }
  return weeks[0]||[];
}

function demoSchedules(){
  const y=2026, m=6; // Июль
  return [
    {
      id:"sched-demo-1", year:y, month:m, weekStart:21, weekEnd:27,
      shifts:{
        [dateKey(y,m,21)]:[{name:"Анна Петрова",start:"10:00",end:"22:00"}],
        [dateKey(y,m,22)]:[{name:"Дарья Козлова",start:"10:00",end:"22:00"},{name:"Анна Петрова",start:"14:00",end:"22:00"}],
        [dateKey(y,m,23)]:[{name:"Максим Волков",start:"10:00",end:"22:00"}],
        [dateKey(y,m,24)]:[{name:"Анна Петрова",start:"10:00",end:"18:00"},{name:"Алина Сафина",start:"14:00",end:"22:00"}],
        [dateKey(y,m,25)]:[{name:"Дарья Козлова",start:"10:00",end:"22:00"}],
        [dateKey(y,m,26)]:[{name:"Максим Волков",start:"10:00",end:"22:00"},{name:"Алина Сафина",start:"10:00",end:"18:00"}],
        [dateKey(y,m,27)]:[{name:"Анна Петрова",start:"10:00",end:"22:00"}],
      },
      status:"approved", author:"Ник Иванов", approver:"Елена Морозова",
      log:[
        {action:"created",by:"Ник Иванов",time:"09:00",text:"График создан"},
        {action:"pending",by:"Ник Иванов",time:"09:05",text:"Отправлен на согласование"},
        {action:"approved",by:"Елена Морозова",time:"10:30",text:"График согласован"},
      ],
    },
    {
      id:"sched-demo-2", year:y, month:m, weekStart:14, weekEnd:20,
      shifts:{
        [dateKey(y,m,14)]:[{name:"Дарья Козлова",start:"10:00",end:"22:00"}],
        [dateKey(y,m,15)]:[{name:"Анна Петрова",start:"10:00",end:"22:00"}],
        [dateKey(y,m,16)]:[{name:"Максим Волков",start:"10:00",end:"22:00"},{name:"Дарья Козлова",start:"14:00",end:"22:00"}],
        [dateKey(y,m,17)]:[{name:"Алина Сафина",start:"10:00",end:"18:00"}],
        [dateKey(y,m,18)]:[{name:"Анна Петрова",start:"10:00",end:"22:00"}],
        [dateKey(y,m,19)]:[{name:"Максим Волков",start:"10:00",end:"22:00"}],
        [dateKey(y,m,20)]:[{name:"Дарья Козлова",start:"10:00",end:"18:00"},{name:"Алина Сафина",start:"14:00",end:"22:00"}],
      },
      status:"approved", author:"Елена Морозова", approver:"Элизабет",
      log:[
        {action:"created",by:"Елена Морозова",time:"18:00",text:"График создан"},
        {action:"approved",by:"Элизабет",time:"19:00",text:"График согласован"},
      ],
    }
  ];
}
