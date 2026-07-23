// Компонент: BreakSystem — модалки перерывов, таймер, карточки в группе
import { useState, useEffect, useRef } from "react";
import {
  Clock,
  Coffee,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  ChevronDown,
  ChevronUp,
  User,
  Bell,
  MapPin,
  Timer,
  Pause,
  Play
} from "lucide-react";
import { Avatar } from "./index";
import { POSTPONE_REASONS } from "./PhotoReport";

/* ── Модальное окно начала перерыва ── */
export function BreakStartModal({ breakCfg, employeeName, pointName, onStart, onPostpone, postponeCount, maxPostponeCount }) {
  const [step, setStep] = useState("main"); // main | confirm | postpone
  const [reason, setReason] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const startTime = new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"});
  const dur = parseInt(breakCfg.duration)||30;
  const returnBy = (() => {
    const d = new Date(); d.setMinutes(d.getMinutes()+dur);
    return d.toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"});
  })();
  const canPostpone = (postponeCount||0) < (parseInt(maxPostponeCount)||2);
  const reasons = breakCfg.reasons || POSTPONE_REASONS.slice(0,4);

  if (step === "confirm") {
    return (
      <div className="brk-modal-overlay">
        <div className="brk-modal">
          <div className="brk-modal-icon confirm"><Coffee size={32}/></div>
          <div className="brk-modal-title">Подтвердите начало перерыва</div>
          <div className="brk-modal-info">
            <div className="brk-info-row"><span>Начало перерыва</span><b>{startTime}</b></div>
            <div className="brk-info-row"><span>Продолжительность</span><b>{dur} мин</b></div>
            <div className="brk-info-row"><span>Вернуться до</span><b>{returnBy}</b></div>
          </div>
          <button className="brk-btn primary" onClick={()=>onStart(startTime, returnBy, dur)}>
            <Coffee size={16}/> Начать перерыв
          </button>
          <button className="brk-btn secondary" onClick={()=>setStep("main")}>
            <ArrowLeft size={14}/> Назад
          </button>
        </div>
      </div>
    );
  }

  if (step === "postpone") {
    const selectedReason = reason === "Другая рабочая причина"
      ? (customReason.trim() || reason)
      : reason;
    return (
      <div className="brk-modal-overlay">
        <div className="brk-modal">
          <div className="brk-modal-icon postpone"><Clock size={32}/></div>
          <div className="brk-modal-title">Выберите причину переноса</div>
          <div className="brk-reason-list">
            {reasons.map((r,i)=>(
              <label key={i} className={"brk-reason-item"+(reason===r?" on":"")}>
                <input type="radio" name="reason" checked={reason===r} onChange={()=>setReason(r)}/>
                <span>{r}</span>
              </label>
            ))}
          </div>
          {reason === "Другая рабочая причина" &&
            <input className="brk-custom-reason" placeholder="Укажите причину…"
              value={customReason} onChange={e=>setCustomReason(e.target.value)}/>}
          <button className="brk-btn warn" disabled={!reason}
            onClick={()=>onPostpone(selectedReason)}>
            <Clock size={14}/> Подтвердить перенос
          </button>
          <button className="brk-btn secondary" onClick={()=>setStep("main")}>
            <ArrowLeft size={14}/> Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="brk-modal-overlay">
      <div className="brk-modal">
        <div className="brk-modal-icon"><Bell size={32}/></div>
        <div className="brk-modal-title">Время перерыва</div>
        <div className="brk-modal-sub">{breakCfg.name || "Перерыв"}</div>
        <div className="brk-modal-info">
          <div className="brk-info-row"><span>Доступный интервал</span><b>{breakCfg.start} – {breakCfg.end}</b></div>
          <div className="brk-info-row"><span>Продолжительность</span><b>{dur} мин</b></div>
          <div className="brk-info-row hint">Вернуться нужно будет не позднее времени, рассчитанного после начала</div>
        </div>
        <button className="brk-btn primary" onClick={()=>setStep("confirm")}>
          <Coffee size={16}/> Отойти на перерыв
        </button>
        <button className="brk-btn warn" disabled={!canPostpone}
          onClick={()=>setStep("postpone")}>
          <Clock size={14}/> Перенести из-за клиентов
          {!canPostpone && <span className="brk-btn-hint">лимит переносов</span>}
        </button>
        {(postponeCount||0) > 0 &&
          <div className="brk-postpone-count">Использовано переносов: {postponeCount}/{maxPostponeCount||2}</div>}
      </div>
    </div>
  );
}

/* ── Модальное окно возвращения ── */
export function BreakReturnModal({ startTime, returnBy, onReturn }) {
  const now = new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"});
  const isLate = now > returnBy;
  return (
    <div className="brk-modal-overlay">
      <div className="brk-modal">
        <div className={"brk-modal-icon"+(isLate?" late":"")}>
          {isLate ? <AlertTriangle size={32}/> : <CheckCircle2 size={32}/>}
        </div>
        <div className="brk-modal-title">
          {isLate ? "Время перерыва завершено" : "Перерыв скоро закончится"}
        </div>
        {isLate && <div className="brk-modal-warn">
          Вы должны были вернуться в {returnBy}. Подтвердите возвращение после выхода на отдел.
        </div>}
        <button className="brk-btn primary" onClick={()=>onReturn(now)}>
          <CheckCircle2 size={16}/> Я вернулся на рабочее место
        </button>
      </div>
    </div>
  );
}

/* ── Плавающая панель-таймер во время перерыва ── */
export function BreakTimerBar({ startTime, returnBy, duration, onExpand, minimized, onToggle }) {
  const [remaining, setRemaining] = useState("");
  const [late, setLate] = useState(false);

  useEffect(()=>{
    const tick = () => {
      const [rh,rm] = (returnBy||"00:00").split(":").map(Number);
      const now = new Date();
      const ret = new Date(); ret.setHours(rh,rm,0,0);
      const diff = Math.floor((ret - now)/1000);
      if (diff <= 0) {
        setRemaining("Время вышло!");
        setLate(true);
      } else {
        const m = Math.floor(diff/60), s = diff%60;
        setRemaining(`${m}:${String(s).padStart(2,"0")}`);
        setLate(false);
      }
    };
    tick();
    const iv = setInterval(tick, 1000);
    return ()=>clearInterval(iv);
  }, [returnBy]);

  if (minimized) {
    return (
      <div className={"brk-timer-mini"+(late?" late":"")} onClick={onToggle}>
        <Coffee size={14}/>
        <span className="brk-timer-val">{remaining}</span>
      </div>
    );
  }

  return (
    <div className={"brk-timer-bar"+(late?" late":"")}>
      <div className="brk-timer-row">
        <Coffee size={18}/>
        <div className="brk-timer-info">
          <div className="brk-timer-label">Вы на перерыве</div>
          <div className="brk-timer-detail">
            Осталось: <b>{remaining}</b> · Вернуться до <b>{returnBy}</b>
          </div>
        </div>
        <button className="brk-timer-toggle" onClick={onToggle}>
          <ChevronUp size={16}/>
        </button>
      </div>
    </div>
  );
}

/* ── Карточка перерыва в групповом чате ── */
export function BreakCard({ breakData, isCurator, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const bd = breakData;

  const statusCfg = {
    active:     { label:"На перерыве",              color:"#25d10a", bg:"#eef4ff", icon:Coffee },
    postponed:  { label:"Перерыв перенесён",        color:"#e8a838", bg:"#fef9ec", icon:Clock },
    returned:   { label:"Вернулся вовремя",         color:"#25d10a", bg:"#eefbe9", icon:CheckCircle2 },
    early:      { label:"Вернулся раньше",          color:"#25d10a", bg:"#eefbe9", icon:CheckCircle2 },
    late:       { label:"Вернулся с опозданием",    color:"#f0616d", bg:"#fef0f1", icon:AlertTriangle },
    noConfirm:  { label:"Возвращение не подтверждено", color:"#f0616d", bg:"#fef0f1", icon:XCircle },
    unused:     { label:"Перерыв не использован",   color:"#8a97a6", bg:"#f0f2f5", icon:Clock },
    cancelled:  { label:"Отменён куратором",        color:"#8a97a6", bg:"#f0f2f5", icon:XCircle },
  };
  const sc = statusCfg[bd.status] || statusCfg.active;
  const Ic = sc.icon;

  return (
    <div className="brk-card" style={{borderLeft:`3px solid ${sc.color}`}}>
      <div className="brk-card-head">
        <Ic size={16} color={sc.color}/>
        <span className="brk-card-status" style={{color:sc.color}}>{sc.label}</span>
        {bd.countdown && <span className="brk-card-countdown"><Timer size={12}/> {bd.countdown}</span>}
      </div>
      <div className="brk-card-body">
        <div className="brk-card-row"><MapPin size={13}/> {bd.pointName}</div>
        <div className="brk-card-row"><User size={13}/> {bd.employeeName}</div>
        {bd.startTime && <div className="brk-card-row"><Coffee size={13}/> Начало: {bd.startTime}</div>}
        {bd.duration && <div className="brk-card-row"><Clock size={13}/> Длительность: {bd.duration} мин</div>}
        {bd.returnBy && <div className="brk-card-row"><Bell size={13}/> Вернуться до: {bd.returnBy}</div>}
        {bd.actualReturn && <div className="brk-card-row">
          <CheckCircle2 size={13}/> Факт. возвращение: {bd.actualReturn}
          {bd.lateMinutes>0 && <span className="brk-card-late"> (+{bd.lateMinutes} мин)</span>}
        </div>}
        {bd.postponeReason && <div className="brk-card-row brk-card-reason">
          <Clock size={13}/> Причина: {bd.postponeReason}
        </div>}
      </div>
      {expanded && <div className="brk-card-details">
        {bd.curator && <div className="brk-card-row"><Users size={13}/> Куратор: {bd.curator}</div>}
        {bd.postponeCount>0 && <div className="brk-card-row">Переносов: {bd.postponeCount}</div>}
      </div>}
      <div className="brk-card-footer">
        <button className="brk-card-more" onClick={()=>setExpanded(!expanded)}>
          {expanded ? <><ChevronUp size={13}/> Свернуть</> : <><ChevronDown size={13}/> Подробнее</>}
        </button>
        {isCurator && bd.status==="late" && onAction &&
          <button className="brk-card-action" onClick={()=>onAction(bd)}>Проверить</button>}
      </div>
    </div>
  );
}

/* ── Блокировка: коллега на перерыве ── */
export function BreakBlockedNotice({ colleagueName, returnBy }) {
  return (
    <div className="brk-blocked">
      <Coffee size={18} color="#e8a838"/>
      <div className="brk-blocked-info">
        <div className="brk-blocked-title">Перерыв временно недоступен</div>
        <div className="brk-blocked-text">
          На перерыве находится <b>{colleagueName}</b> до <b>{returnBy}</b>.
          Вы сможете начать свой перерыв после возвращения.
        </div>
      </div>
    </div>
  );
}

/* ── Сводка «Перерывы сегодня» для куратора ── */
export function BreakSummary({ breaks }) {
  if (!breaks || !breaks.length) return null;
  const onBreak = breaks.filter(b=>b.status==="active");
  const late = breaks.filter(b=>b.status==="late"||b.status==="noConfirm");
  const postponed = breaks.filter(b=>b.status==="postponed");
  const done = breaks.filter(b=>b.status==="returned"||b.status==="early");
  return (
    <div className="brk-summary">
      <div className="brk-summary-title"><Coffee size={15}/> Перерывы сегодня</div>
      <div className="brk-summary-grid">
        {onBreak.length>0 && <div className="brk-sum-item active">
          <Coffee size={14}/><span>На перерыве: {onBreak.length}</span></div>}
        {late.length>0 && <div className="brk-sum-item late">
          <AlertTriangle size={14}/><span>Опоздания: {late.length}</span></div>}
        {postponed.length>0 && <div className="brk-sum-item warn">
          <Clock size={14}/><span>Переносы: {postponed.length}</span></div>}
        {done.length>0 && <div className="brk-sum-item ok">
          <CheckCircle2 size={14}/><span>Вернулись: {done.length}</span></div>}
        {!onBreak.length && !late.length && !postponed.length && !done.length &&
          <div className="brk-sum-item muted">Нет активных перерывов</div>}
      </div>
    </div>
  );
}
