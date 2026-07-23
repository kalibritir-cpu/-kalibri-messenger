// Компонент: CuratorSchedule — полноэкранный календарь смен кураторов
import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Plus, X, Trash2 } from "lucide-react";

const DAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const MONTHS_GEN = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function firstDow(y,m){ const d=new Date(y,m,1).getDay(); return d===0?6:d-1; }

const CUR_COLORS = ["#5b8def","#ef6ba8","#42c9b0","#e8a838","#a878f0","#f0616d"];
function curColor(name, list){
  const idx = list.indexOf(name);
  return idx>=0 ? CUR_COLORS[idx % CUR_COLORS.length] : CUR_COLORS[0];
}

export function CuratorSchedule({ schedule, onBack, onUpdate }){
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selDay, setSelDay] = useState(today.getDate());
  const [adding, setAdding] = useState(false);
  const [fName, setFName] = useState("");
  const [fStart, setFStart] = useState("10:00");
  const [fEnd, setFEnd] = useState("22:00");

  if(!schedule) return null;
  const { curators=[], shifts={} } = schedule;

  const dim = daysInMonth(year, month);
  const fDow = firstDow(year, month);

  const pad = d => String(d).padStart(2,"0");
  const dateKey = d => `${year}-${pad(month+1)}-${pad(d)}`;

  const prevMonth = () => { if(month===0){ setMonth(11); setYear(y=>y-1); } else setMonth(m=>m-1); setSelDay(1); };
  const nextMonth = () => { if(month===11){ setMonth(0); setYear(y=>y+1); } else setMonth(m=>m+1); setSelDay(1); };

  const selKey = dateKey(selDay);
  const selShifts = shifts[selKey] || [];
  const isToday = (d) => d===today.getDate() && month===today.getMonth() && year===today.getFullYear();

  const cells = [];
  for(let i=0; i<fDow; i++) cells.push(null);
  for(let d=1; d<=dim; d++) cells.push(d);

  const openAdd = () => {
    setFName(curators[0] || "");
    setFStart("10:00");
    setFEnd("22:00");
    setAdding(true);
  };

  const saveShift = () => {
    if(!fName) return;
    const newShift = { name:fName, start:fStart, end:fEnd };
    const updated = { ...shifts };
    updated[selKey] = [...(updated[selKey]||[]), newShift];
    onUpdate && onUpdate({ ...schedule, shifts:updated });
    setAdding(false);
  };

  const deleteShift = (idx) => {
    const updated = { ...shifts };
    updated[selKey] = (updated[selKey]||[]).filter((_,i)=>i!==idx);
    if(updated[selKey].length===0) delete updated[selKey];
    onUpdate && onUpdate({ ...schedule, shifts:updated });
  };

  return (
    <div className="sched-page">
      <div className="chat-head">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={26}/></button>
        <div className="chat-head-info">
          <div className="chat-head-name">График кураторов</div>
        </div>
      </div>

      <div className="sched-scroll">
        <div className="sched-header">
          <button className="sched-nav" onClick={prevMonth}><ChevronLeft size={18}/></button>
          <span className="sched-title">{MONTHS[month]} {year}</span>
          <button className="sched-nav" onClick={nextMonth}><ChevronRight size={18}/></button>
        </div>

        <div className="sched-cal">
          <div className="sched-dow">
            {DAYS.map(d=><span key={d}>{d}</span>)}
          </div>
          <div className="sched-grid">
            {cells.map((d, i)=>{
              if(d===null) return <span key={"e"+i} className="sched-cell empty"/>;
              const ds = shifts[dateKey(d)] || [];
              const cnt = ds.length;
              const sel = d===selDay;
              const td = isToday(d);
              return (
                <span key={d}
                  className={"sched-cell"+(sel?" sel":"")+(td?" today":"")}
                  onClick={()=>setSelDay(d)}>
                  {d}
                  {cnt>0 && <i className="sched-badge"/>}
                </span>
              );
            })}
          </div>
        </div>

        <div className="sched-day">
          <div className="sched-day-title">Смены на {selDay} {MONTHS_GEN[month]}</div>
          {selShifts.length===0 && !adding && <div className="sched-empty">Нет смен на этот день</div>}
          {selShifts.map((s,i)=>{
            const clr = curColor(s.name, curators);
            return (
              <div key={i} className="sched-shift" style={{borderLeft:`3px solid ${clr}`}}>
                <div className="sched-shift-head">
                  <div className="sched-shift-ava" style={{background:clr}}>{s.name.charAt(0)}</div>
                  <span className="sched-shift-name">{s.name}</span>
                  <button className="sched-del" onClick={()=>deleteShift(i)}><Trash2 size={14}/></button>
                </div>
                <div className="sched-shift-meta">
                  <Clock size={13}/><span>{s.start} – {s.end}</span>
                </div>
              </div>
            );
          })}

          {adding ? (
            <div className="sched-form">
              <div className="sched-form-head">
                <span className="sched-form-title">Новая смена</span>
                <button className="sched-form-close" onClick={()=>setAdding(false)}><X size={18}/></button>
              </div>
              <label className="sched-label">Куратор</label>
              <select className="sched-select" value={fName} onChange={e=>setFName(e.target.value)}>
                {curators.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <div className="sched-time-row">
                <div className="sched-time-col">
                  <label className="sched-label">Начало</label>
                  <input type="time" className="sched-input" value={fStart} onChange={e=>setFStart(e.target.value)}/>
                </div>
                <div className="sched-time-col">
                  <label className="sched-label">Конец</label>
                  <input type="time" className="sched-input" value={fEnd} onChange={e=>setFEnd(e.target.value)}/>
                </div>
              </div>
              <button className="sched-save" onClick={saveShift}>Добавить смену</button>
            </div>
          ) : (
            <button className="sched-add" onClick={openAdd}>
              <Plus size={16}/> Добавить смену
            </button>
          )}
        </div>

        {/* ── Сводка: количество смен за месяц ── */}
        <div className="sched-summary">
          <div className="sched-summary-title">Сводка за {MONTHS[month].toLowerCase()}</div>
          {(()=>{
            const counts = {};
            let totalShifts = 0;
            for(let d=1; d<=dim; d++){
              const key = dateKey(d);
              (shifts[key]||[]).forEach(s=>{
                counts[s.name] = (counts[s.name]||0) + 1;
                totalShifts++;
              });
            }
            const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
            if(!sorted.length) return <div className="sched-empty">Нет смен</div>;
            // Считаем часы
            const hours = {};
            for(let d=1; d<=dim; d++){
              const key = dateKey(d);
              (shifts[key]||[]).forEach(s=>{
                const [sh,sm] = (s.start||"10:00").split(":").map(Number);
                const [eh,em] = (s.end||"22:00").split(":").map(Number);
                const h = (eh + em/60) - (sh + sm/60);
                hours[s.name] = (hours[s.name]||0) + (h>0?h:0);
              });
            }
            return <>
              {sorted.map(([name, cnt])=>{
                const clr = curColor(name, curators);
                const h = Math.round(hours[name]||0);
                const pct = totalShifts>0 ? Math.round(cnt/totalShifts*100) : 0;
                return (
                  <div key={name} className="sched-summary-row">
                    <div className="sched-summary-ava" style={{background:clr}}>{name.charAt(0)}</div>
                    <div className="sched-summary-info">
                      <div className="sched-summary-name">{name}</div>
                      <div className="sched-summary-bar-wrap">
                        <div className="sched-summary-bar" style={{width:`${pct}%`, background:clr}}/>
                      </div>
                    </div>
                    <div className="sched-summary-nums">
                      <span className="sched-summary-cnt">{cnt} <small>смен</small></span>
                      <span className="sched-summary-hrs">{h} <small>ч</small></span>
                    </div>
                  </div>
                );
              })}
              <div className="sched-summary-total">Итого: {totalShifts} смен за месяц</div>
            </>;
          })()}
        </div>
      </div>
    </div>
  );
}
