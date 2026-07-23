// Компонент: AttractionCheck — проверка привлечения (адаптация для мессенджера)
import { useState } from "react";
import {
  ChevronLeft, ChevronDown, Clock, CheckCircle2, AlertTriangle,
  Target, Send, Copy, Camera, X, Check
} from "lucide-react";

const CHECKLIST = [
  { id:"ac-1", label:"Сотрудник встречает клиентов", required:true },
  { id:"ac-2", label:"Предлагает игру первым", required:true },
  { id:"ac-3", label:"Говорит уверенно", required:true },
  { id:"ac-4", label:"Показывает призы", required:true },
  { id:"ac-5", label:"Предлагает популярный тариф", required:true },
  { id:"ac-6", label:"Использует дополнительные аттракционы", required:true },
  { id:"ac-7", label:"Делает допродажу", required:true },
  { id:"ac-8", label:"Не сидит в телефоне", required:true },
  { id:"ac-9", label:"Не молчит", required:true },
  { id:"ac-10", label:"Создаёт эмоцию", required:true },
];

const GRADES = [
  { id:"excellent", label:"Отлично", color:"#25d10a", bg:"#eefbe9" },
  { id:"normal",    label:"Нормально", color:"#25d10a", bg:"#eef4ff" },
  { id:"remarks",   label:"Есть замечания", color:"#e8a838", bg:"#fef9ec" },
  { id:"critical",  label:"Критично", color:"#f0616d", bg:"#fef0f1" },
];

const HOURS = Array.from({length:13},(_,i)=>{ const h=10+i; return String(h).padStart(2,"0")+":00"; });

export function AttractionCheck({ config, onBack, onSend }){
  const [employee, setEmployee] = useState("");
  const [empOpen, setEmpOpen] = useState(false);
  const [hour, setHour] = useState(HOURS[7]); // 17:00
  const [hourOpen, setHourOpen] = useState(false);
  const [grade, setGrade] = useState("");
  const [checks, setChecks] = useState({});
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  const { employees=[], points=[], stats={} } = config || {};

  const toggleCheck = (id) => setChecks(prev=>({...prev, [id]:!prev[id]}));
  const checkedCount = CHECKLIST.filter(c=>checks[c.id]).length;
  const allChecked = checkedCount === CHECKLIST.length;
  const canSend = employee && grade && allChecked;

  const handleSend = () => {
    if(!canSend) return;
    const report = { employee, hour, grade, checks, comment, checkedCount, time:new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"}) };
    onSend && onSend(report);
    setSent(true);
  };

  const copyText = () => {
    const gr = GRADES.find(g=>g.id===grade);
    const lines = [
      `Проверка привлечения`,
      `Сотрудник: ${employee}`,
      `Час: ${hour}`,
      `Оценка: ${gr?.label||"—"}`,
      `Чек-лист: ${checkedCount}/${CHECKLIST.length}`,
      ...CHECKLIST.map(c=>(checks[c.id]?"✅":"❌")+" "+c.label),
      comment ? `Комментарий: ${comment}` : "",
    ].filter(Boolean);
    navigator.clipboard?.writeText(lines.join("\n"));
  };

  if(sent) return (
    <div className="acheck-page">
      <div className="chat-head">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={26}/></button>
        <div className="chat-head-info"><div className="chat-head-name">Проверка привлечения</div></div>
      </div>
      <div className="acheck-scroll">
        <div className="acheck-sent">
          <div className="acheck-sent-icon"><CheckCircle2 size={48} color="#25d10a"/></div>
          <div className="acheck-sent-title">Отчёт отправлен</div>
          <div className="acheck-sent-sub">{employee} · {hour}</div>
          <button className="acheck-btn accent" onClick={()=>{setSent(false);setEmployee("");setGrade("");setChecks({});setComment("");}}>
            Новая проверка
          </button>
          <button className="acheck-btn outline" onClick={onBack}>Назад к теме</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="acheck-page">
      <div className="chat-head">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={26}/></button>
        <div className="chat-head-info"><div className="chat-head-name">Проверка привлечения</div></div>
      </div>

      <div className="acheck-scroll">
        {/* Инфо-блок */}
        <div className="acheck-info">
          <Target size={20} color="#a878f0"/>
          <div>
            <div className="acheck-info-title">План привлечения</div>
            <div className="acheck-info-sub">Проверки по графику точек. Отчёт за час можно прислать с 40-й минуты и до 40-й минуты следующего часа.</div>
          </div>
        </div>

        {/* Счётчики */}
        <div className="acheck-counters">
          <div className="acheck-counter">
            <span className="acheck-counter-num" style={{color:"#e8a838"}}>{stats.hourDone||0}/{stats.hourTotal||14}</span>
            <span className="acheck-counter-label">точек за час</span>
          </div>
          <div className="acheck-counter">
            <span className="acheck-counter-num">{stats.dayDone||0}/{stats.dayTotal||126}</span>
            <span className="acheck-counter-label">всего за день</span>
          </div>
        </div>

        {/* Сотрудник */}
        <div className="acheck-section">
          <div className="acheck-section-title">Сотрудник</div>
          <div className="acheck-dropdown" onClick={()=>setEmpOpen(!empOpen)}>
            <span className={employee?"":"acheck-placeholder"}>{employee||"Выберите сотрудника"}</span>
            <ChevronDown size={18}/>
          </div>
          {empOpen && <div className="acheck-options">
            {employees.map(e=>(
              <div key={e} className={"acheck-option"+(e===employee?" sel":"")} onClick={()=>{setEmployee(e);setEmpOpen(false);}}>
                {e}{e===employee && <Check size={16} color="var(--accent)"/>}
              </div>
            ))}
          </div>}
        </div>

        {/* Плановый час */}
        <div className="acheck-section">
          <div className="acheck-section-title"><Clock size={15}/> Плановый час проверки</div>
          <div className="acheck-dropdown" onClick={()=>setHourOpen(!hourOpen)}>
            <span>{hour}</span>
            <ChevronDown size={18}/>
          </div>
          {hourOpen && <div className="acheck-options time-opts">
            {HOURS.map(h=>(
              <div key={h} className={"acheck-option"+(h===hour?" sel":"")} onClick={()=>{setHour(h);setHourOpen(false);}}>
                {h}{h===hour && <Check size={16} color="var(--accent)"/>}
              </div>
            ))}
          </div>}
          <div className="acheck-hint">Отчёт за {hour} можно прислать до {
            String(Number(hour.split(":")[0])+1).padStart(2,"0")}:40</div>
        </div>

        {/* Итоговая оценка */}
        <div className="acheck-section">
          <div className="acheck-section-title">Итоговая оценка</div>
          <div className="acheck-grades">
            {GRADES.map(g=>(
              <div key={g.id}
                className={"acheck-grade"+(grade===g.id?" sel":"")}
                style={grade===g.id?{background:g.color,color:"#fff"}:{}}
                onClick={()=>setGrade(g.id)}>
                {g.label}
                {grade===g.id && <CheckCircle2 size={16}/>}
              </div>
            ))}
          </div>
        </div>

        {/* Чек-лист */}
        <div className="acheck-section">
          <div className="acheck-section-title">Чек-лист <span className="acheck-cnt">{checkedCount}/{CHECKLIST.length}</span></div>
          <div className="acheck-checklist">
            {CHECKLIST.map(c=>(
              <div key={c.id} className={"acheck-check"+(checks[c.id]?" done":"")} onClick={()=>toggleCheck(c.id)}>
                <span className={"acheck-checkbox"+(checks[c.id]?" checked":"")}>
                  {checks[c.id] && <Check size={14}/>}
                </span>
                <span className="acheck-check-label">{c.label}</span>
                {c.required && <span className="acheck-req">обяз.</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Комментарий */}
        <div className="acheck-section">
          <div className="acheck-section-title">Комментарий</div>
          <textarea className="acheck-comment" rows={3} placeholder="Опишите, что заметили…"
            value={comment} onChange={e=>setComment(e.target.value)}/>
        </div>

        {/* Кнопки */}
        <div className="acheck-actions">
          <button className={"acheck-btn accent"+(canSend?"":" disabled")} onClick={handleSend}>
            <Send size={16}/> Отправить отчёт
          </button>
          <button className="acheck-btn outline" onClick={copyText}>
            <Copy size={16}/> Скопировать текст
          </button>
        </div>

        {!allChecked && grade && <div className="acheck-warn">
          <AlertTriangle size={14}/> Заполните все пункты чек-листа
        </div>}
      </div>
    </div>
  );
}
