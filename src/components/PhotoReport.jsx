// Компонент: PhotoReport — карточка фотоотчёта + галерея проверки + Стандарты точки
import { useState, useRef } from "react";
import {
  Camera,
  Check,
  CheckCheck,
  X,
  ChevronLeft,
  AlertCircle,
  Upload,
  Send,
  RotateCcw,
  Eye,
  Clock,
  Settings2,
  Plus,
  Coffee,
  Bell,
  Users,
  ChevronDown,
  MapPin,
  Activity,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Timer
} from "lucide-react";
import { Avatar } from "./index";

const STATUS_CFG = {
  pending:   { label:"Ожидает проверки", color:"#f0b429", bg:"#fef9ec" },
  rejected:  { label:"Требует исправления", color:"#f0616d", bg:"#fef0f1" },
  accepted:  { label:"Принят куратором", color:"#25d10a", bg:"#eefbe9" },
};

const REPORT_TYPE_CFG = {
  open:  { label:"Фотоотчёт: открытие", color:"#25d10a", sub:"Загрузите фото по каждому пункту перед открытием" },
  close: { label:"Фотоотчёт: закрытие", color:"#e8a838", sub:"Загрузите фото по каждому пункту перед закрытием" },
};

/* ── Карточка отчёта в группе «Руководство» ── */
export function ReportCard({ report, onOpen }) {
  const sc = STATUS_CFG[report.status] || STATUS_CFG.pending;
  const rt = REPORT_TYPE_CFG[report.reportType] || REPORT_TYPE_CFG.open;
  return (
    <div className="rpt-card" style={{borderLeft:`3px solid ${rt.color}`}} onClick={()=>onOpen(report)}>
      <div className="rpt-card-head">
        <Camera size={18} color={sc.color}/>
        <span className="rpt-card-title">{rt.label}</span>
        <span className="rpt-card-badge" style={{ background:sc.bg, color:sc.color }}>{sc.label}</span>
      </div>
      <div className="rpt-card-body">
        <div className="rpt-card-row"><b>📍 {report.pointName}</b></div>
        <div className="rpt-card-row">👤 {report.sender} · {report.time}
          {report.late && <span className="rpt-late-badge"><Clock size={11}/> Опоздание</span>}
        </div>
        <div className="rpt-card-row rpt-card-photos">
          {report.items.slice(0,4).map((it,i)=>
            <img key={i} src={it.photo} alt={it.label} className="rpt-thumb"/>)}
          {report.items.length>4 && <span className="rpt-thumb-more">+{report.items.length-4}</span>}
        </div>
      </div>
      <button className="rpt-card-btn"><Eye size={15}/> Посмотреть фотоотчёт</button>
    </div>
  );
}

/* ── Галерея фотоотчёта (полноэкранная панель) ── */
export function ReportGallery({ report, isCurator, onBack, onUpdate }) {
  const [comment, setComment] = useState({});
  const [lightbox, setLightbox] = useState(null);
  const replaceRef = useRef(null);
  const [replacingId, setReplacingId] = useState(null);

  const sc = STATUS_CFG[report.status] || STATUS_CFG.pending;
  const rt = REPORT_TYPE_CFG[report.reportType] || REPORT_TYPE_CFG.open;
  const allOk = report.items.every(it=>it.status==="ok");

  const setItemStatus = (checkId, status, commentText) => {
    const items = report.items.map(it=>
      it.checkId===checkId ? {...it, status, comment: commentText||it.comment } : it);
    const hasRejected = items.some(it=>it.status==="rejected");
    onUpdate({ ...report, items, status: hasRejected?"rejected":"pending" });
  };
  const acceptAll = () => {
    const items = report.items.map(it=>({...it, status:"ok", comment:undefined}));
    onUpdate({ ...report, items, status:"accepted" });
  };
  const rejectItem = (checkId) => {
    const text = (comment[checkId]||"").trim();
    if(!text) return;
    setItemStatus(checkId, "rejected", text);
    setComment(c=>({...c,[checkId]:""}));
  };
  const handleReplace = (e) => {
    const f = e.target.files[0]; if(!f || !replacingId) return;
    const r = new FileReader();
    r.onload = () => {
      const items = report.items.map(it=>
        it.checkId===replacingId ? {...it, photo:r.result, status:"ok", comment:undefined} : it);
      const hasRejected = items.some(it=>it.status==="rejected");
      onUpdate({ ...report, items, status: hasRejected?"rejected":"pending" });
      setReplacingId(null);
    };
    r.readAsDataURL(f); e.target.value = "";
  };

  return (
    <div className="rpt-gallery">
      <div className="rpt-gallery-head">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={24}/></button>
        <div className="rpt-gallery-title">
          <div>{rt.label} · {report.pointName}</div>
          <div className="rpt-gallery-sub">{report.sender} · {report.date} {report.time}
            {report.late && <span className="rpt-late-badge"><Clock size={11}/> Опоздание</span>}
          </div>
        </div>
      </div>
      <div className="rpt-gallery-status" style={{background:sc.bg, color:sc.color}}>
        {report.status==="accepted" ? <CheckCheck size={16}/> :
         report.status==="rejected" ? <AlertCircle size={16}/> :
         <Camera size={16}/>}
        <span>{sc.label}</span>
      </div>
      <div className="rpt-gallery-list">
        {report.items.map((it, i) => (
          <div key={it.checkId} className={"rpt-item"+(it.status==="rejected"?" rejected":"")+(it.status==="ok"&&report.status==="accepted"?" accepted":"")}>
            <div className="rpt-item-label">
              <span className="rpt-item-num">{i+1}</span>
              <span>{it.label}</span>
              {it.status==="ok" && report.status==="accepted" && <Check size={14} color="#25d10a"/>}
              {it.status==="rejected" && <AlertCircle size={14} color="#f0616d"/>}
            </div>
            <div className="rpt-item-photo" onClick={()=>setLightbox(it.photo)}>
              <img src={it.photo} alt={it.label}/>
            </div>
            {it.status==="rejected" && it.comment &&
              <div className="rpt-item-comment"><AlertCircle size={13}/> {it.comment}</div>}
            {isCurator && report.status!=="accepted" && it.status!=="rejected" &&
              <div className="rpt-item-actions">
                <div className="rpt-comment-row">
                  <input placeholder="Комментарий для возврата…"
                    value={comment[it.checkId]||""} onChange={e=>setComment(c=>({...c,[it.checkId]:e.target.value}))}
                    onKeyDown={e=>{if(e.key==="Enter") rejectItem(it.checkId);}}/>
                  <button className="rpt-reject-btn" disabled={!(comment[it.checkId]||"").trim()}
                    onClick={()=>rejectItem(it.checkId)} title="Вернуть">
                    <RotateCcw size={14}/></button>
                </div>
              </div>}
            {!isCurator && it.status==="rejected" &&
              <button className="rpt-replace-btn"
                onClick={()=>{setReplacingId(it.checkId); replaceRef.current?.click();}}>
                <Upload size={14}/> Заменить фото
              </button>}
          </div>
        ))}
      </div>
      {isCurator && report.status!=="accepted" && allOk &&
        <div className="rpt-gallery-footer">
          <button className="rpt-accept-all" onClick={acceptAll}>
            <CheckCheck size={18}/> Принять отчёт</button>
        </div>}
      <input ref={replaceRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleReplace}/>
      {lightbox &&
        <div className="rpt-lightbox" onClick={()=>setLightbox(null)}>
          <img src={lightbox} alt=""/>
        </div>}
    </div>
  );
}

/* ── Карточка-чеклист для сотрудника (в рабочей группе точки) ── */
export function ReportChecklist({ checklist, deadline, reportType, onSubmit }) {
  const [photos, setPhotos] = useState({});
  const fileRef = useRef(null);
  const [pickingId, setPickingId] = useState(null);
  const filled = checklist.filter(c=>photos[c.id]).length;
  const allFilled = filled===checklist.length;
  const rt = REPORT_TYPE_CFG[reportType] || REPORT_TYPE_CFG.open;

  const handleFile = (e) => {
    const f = e.target.files[0]; if(!f||!pickingId) return;
    const r = new FileReader();
    r.onload = () => { setPhotos(p=>({...p,[pickingId]:r.result})); setPickingId(null); };
    r.readAsDataURL(f); e.target.value = "";
  };
  const submit = () => {
    if(!allFilled) return;
    const items = checklist.map(c=>({
      checkId:c.id, label:c.label, photo:photos[c.id], status:"ok"
    }));
    onSubmit(items, reportType||"open");
  };

  return (
    <div className="rpt-checklist-card" style={{borderLeft:`3px solid ${rt.color}`}}>
      <div className="rpt-checklist-head">
        <Camera size={20} color={rt.color}/>
        <div>
          <div className="rpt-checklist-title">{rt.label}</div>
          <div className="rpt-checklist-sub">{rt.sub}</div>
          {deadline && <div className="rpt-checklist-deadline"><Clock size={12}/> Отправить до {deadline}</div>}
        </div>
      </div>
      <div className="rpt-checklist-items">
        {checklist.map((c,i)=>
          <div key={c.id} className={"rpt-check-item"+(photos[c.id]?" done":"")}>
            <span className="rpt-check-num">{i+1}</span>
            <span className="rpt-check-label">{c.label}</span>
            {photos[c.id]
              ? <img src={photos[c.id]} className="rpt-check-thumb" alt=""
                  onClick={()=>{setPickingId(c.id); fileRef.current?.click();}}/>
              : <button className="rpt-check-btn"
                  onClick={()=>{setPickingId(c.id); fileRef.current?.click();}}>
                  <Camera size={14}/>
                </button>}
          </div>)}
      </div>
      <div className="rpt-checklist-footer">
        <span className="rpt-checklist-count">{filled}/{checklist.length}</span>
        <button className="rpt-checklist-submit" style={{background:rt.color}} disabled={!allFilled} onClick={submit}>
          <Send size={15}/> Отправить отчёт</button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFile}/>
    </div>
  );
}

/* ── Карточка отчёта привлечения (без фото, только цифры) ── */
export function AttractionReportCard({ slot, onSubmit }) {
  const [couponsGiven, setCouponsGiven] = useState("");
  const [couponsUsed, setCouponsUsed] = useState("");
  const [boughtAfter, setBoughtAfter] = useState("");
  const [sent, setSent] = useState(false);

  const period = `${slot.start}–${slot.end}`;
  const canSend = couponsGiven !== "" && couponsUsed !== "" && boughtAfter !== "";

  const handleSend = () => {
    if (!canSend) return;
    onSubmit && onSubmit({
      period, slotId: slot.id,
      couponsGiven: +couponsGiven,
      couponsUsed: +couponsUsed,
      boughtAfter: +boughtAfter,
    });
    setSent(true);
  };

  if (sent) return (
    <div className="rpt-checklist-card" style={{borderLeft:"3px solid #a878f0"}}>
      <div className="rpt-checklist-head">
        <Users size={20} color="#a878f0"/>
        <div>
          <div className="rpt-checklist-title">Отчёт привлечения отправлен</div>
          <div className="rpt-checklist-sub">{period}</div>
        </div>
      </div>
      <div style={{padding:"14px 16px", textAlign:"center", color:"var(--accent)"}}>
        <CheckCheck size={32}/><div style={{marginTop:6, fontWeight:600}}>Спасибо!</div>
      </div>
    </div>
  );

  return (
    <div className="rpt-checklist-card" style={{borderLeft:"3px solid #a878f0"}}>
      <div className="rpt-checklist-head">
        <Users size={20} color="#a878f0"/>
        <div>
          <div className="rpt-checklist-title">Привлечение</div>
          <div className="rpt-checklist-sub">Заполните отчёт за период</div>
        </div>
      </div>
      <div className="attract-report-body">
        <div className="attract-report-period">
          <Clock size={14} color="#a878f0"/>
          <span>{period}</span>
        </div>
        <label className="attract-report-field">
          <span className="attract-report-label">Выдано купонов</span>
          <input type="number" min="0" className="attract-report-input" placeholder="0"
            value={couponsGiven} onChange={e=>setCouponsGiven(e.target.value)}/>
        </label>
        <label className="attract-report-field">
          <span className="attract-report-label">Подошли с купоном</span>
          <input type="number" min="0" className="attract-report-input" placeholder="0"
            value={couponsUsed} onChange={e=>setCouponsUsed(e.target.value)}/>
        </label>
        <label className="attract-report-field">
          <span className="attract-report-label">Купили после купона</span>
          <input type="number" min="0" className="attract-report-input" placeholder="0"
            value={boughtAfter} onChange={e=>setBoughtAfter(e.target.value)}/>
        </label>
      </div>
      <div className="rpt-checklist-footer">
        <span className="rpt-checklist-count">{[couponsGiven,couponsUsed,boughtAfter].filter(v=>v!=="").length}/3</span>
        <button className="rpt-checklist-submit" style={{background:"#a878f0"}} disabled={!canSend} onClick={handleSend}>
          <Send size={15}/> Отправить отчёт</button>
      </div>
    </div>
  );
}

/* ── Проверка привлечения (Управление) ── */
export function AttractionCheckCard({ checkData, onSubmit }) {
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState("");
  const fileRef = useRef(null);

  const d = checkData || {};
  const point = d.point || {};
  const shift = d.shift || [];
  const plannedHour = d.plannedHour || "—";
  const tz = d.timezone || "МСК";
  const windowStart = d.windowStart || "";
  const windowEnd = d.windowEnd || "";

  const handleFile = (e) => {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = () => { setScreenshot(f); setScreenshotPreview(r.result); };
    r.readAsDataURL(f);
  };

  const handleSend = () => {
    onSubmit && onSubmit({ pointId: point.id, screenshot, note });
    setSent(true);
  };

  if (sent) return (
    <div className="rpt-card" style={{borderLeft:"3px solid #a878f0"}}>
      <div className="rpt-card-head">
        <CheckCheck size={18} color="#25d10a"/>
        <span className="rpt-card-title">Проверка отправлена</span>
      </div>
      <div style={{padding:"14px 16px", textAlign:"center", color:"var(--accent)"}}>
        <CheckCheck size={32}/><div style={{marginTop:6, fontWeight:600}}>Спасибо!</div>
      </div>
    </div>
  );

  return (
    <div className="attract-check-card">
      <div className="attract-check-head">
        <MapPin size={18} color="#a878f0"/>
        <div>
          <div className="attract-check-title">Проверка привлечения</div>
          <div className="attract-check-sub">Плановая проверка по графику</div>
        </div>
      </div>

      <div className="attract-check-body">
        {/* Рекомендуемая точка */}
        <div className="attract-check-point">
          <div className="attract-check-label">Рекомендуемая точка</div>
          <div className="attract-check-point-name">
            <MapPin size={14} color="#a878f0"/> {point.name || "—"}
          </div>
        </div>

        {/* Плановый час */}
        <div className="attract-check-row">
          <Timer size={14} color="#5b8def"/>
          <span className="attract-check-row-label">Плановый час</span>
          <span className="attract-check-row-value">{plannedHour} ({tz})</span>
        </div>

        {/* Окно отправки */}
        <div className="attract-check-row">
          <Clock size={14} color="#42c9b0"/>
          <span className="attract-check-row-label">Окно отправки</span>
          <span className="attract-check-row-value">{windowStart} – {windowEnd}</span>
        </div>

        {/* Кто на смене */}
        <div className="attract-check-shift">
          <div className="attract-check-label">На смене</div>
          {shift.map((emp,i) => (
            <div key={i} className="attract-check-emp">
              <span className="attract-check-emp-dot" style={{background:emp.online?"var(--online)":"var(--sub)"}}/>
              <span className="attract-check-emp-name">{emp.name}</span>
              <span className="attract-check-emp-role">{emp.role}</span>
            </div>
          ))}
        </div>

        {/* Загрузка скриншота */}
        <div className="attract-check-upload">
          <div className="attract-check-label">Скриншот проверки</div>
          {screenshotPreview ? (
            <div className="attract-check-preview-wrap">
              <img src={screenshotPreview} alt="скрин" className="attract-check-preview"/>
              <button className="attract-check-preview-del" onClick={()=>{setScreenshot(null);setScreenshotPreview(null);}}>
                <X size={14}/>
              </button>
            </div>
          ) : (
            <button className="attract-check-upload-btn" onClick={()=>fileRef.current?.click()}>
              <Upload size={16}/> Загрузить скриншот
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
        </div>

        {/* Заметка */}
        <textarea className="attract-check-note" placeholder="Комментарий (необязательно)..."
          value={note} onChange={e=>setNote(e.target.value)} rows={2}/>
      </div>

      <div className="attract-check-footer">
        <button className="attract-check-submit" onClick={handleSend}>
          <Send size={15}/> Отправить проверку
        </button>
      </div>
    </div>
  );
}

/* ── Отчёт тайм-менеджмента по городам (Контроль) ── */
export function TimeManagementReport({ data }) {
  const [expandedCity, setExpandedCity] = useState(null);
  const cities = data || [];

  const toggleCity = (id) => setExpandedCity(prev => prev === id ? null : id);

  return (
    <div className="tm-report-card">
      <div className="tm-report-head">
        <Activity size={18} color="#ef6ba8"/>
        <div>
          <div className="tm-report-title">Тайм-менеджмент</div>
          <div className="tm-report-sub">Реакции сотрудников по городам</div>
        </div>
      </div>

      <div className="tm-report-body">
        {cities.map(city => {
          const isOpen = expandedCity === city.id;
          const missedPct = city.total > 0 ? Math.round((city.missed / city.total) * 100) : 0;
          const okPct = 100 - missedPct;
          return (
            <div key={city.id} className={"tm-report-city" + (isOpen ? " open" : "")}>
              <div className="tm-report-city-head" onClick={() => toggleCity(city.id)}>
                <MapPin size={14} color="#a878f0"/>
                <span className="tm-report-city-name">{city.name}</span>
                <div className="tm-report-city-stats">
                  {city.missed > 0 && (
                    <span className="tm-report-missed-badge">
                      <AlertTriangle size={11}/> {city.missed}
                    </span>
                  )}
                  <span className="tm-report-ok-badge">
                    <ThumbsUp size={11}/> {city.reacted}
                  </span>
                </div>
                <span className={"std-chev" + (isOpen ? " rot" : "")}>›</span>
              </div>

              {isOpen && (
                <div className="tm-report-city-body">
                  {/* Прогресс-бар */}
                  <div className="tm-report-progress">
                    <div className="tm-report-progress-bar">
                      <div className="tm-report-progress-ok" style={{width: okPct + "%"}}/>
                      <div className="tm-report-progress-miss" style={{width: missedPct + "%"}}/>
                    </div>
                    <div className="tm-report-progress-labels">
                      <span style={{color:"var(--accent)"}}>✓ {city.reacted}/{city.total}</span>
                      <span style={{color:"var(--danger)"}}>✗ {city.missed}/{city.total}</span>
                    </div>
                  </div>

                  {/* Детали по периодам */}
                  {(city.periods || []).map((p, i) => (
                    <div key={i} className={"tm-report-period" + (p.status === "missed" ? " missed" : "")}>
                      <div className="tm-report-period-head">
                        <Clock size={13} color={p.status === "missed" ? "#f0616d" : "#25d10a"}/>
                        <span className="tm-report-period-time">{p.period}</span>
                        <span className={"tm-report-period-status " + p.status}>
                          {p.status === "missed" ? "Пропущено" : p.status === "late" ? "С опозданием" : "Вовремя"}
                        </span>
                      </div>
                      <div className="tm-report-period-detail">
                        <span>👤 {p.employee}</span>
                        {p.reactedAt && <span>⏱ Реакция: {p.reactedAt}</span>}
                        {p.status === "late" && p.delay && <span style={{color:"var(--danger)"}}>+{p.delay} мин</span>}
                      </div>
                    </div>
                  ))}

                  {/* Средние показатели */}
                  <div className="tm-report-summary">
                    <div className="tm-report-summary-row">
                      <Timer size={13} color="var(--sub)"/>
                      <span>Среднее время реакции:</span>
                      <b>{city.avgReactionTime || "—"}</b>
                    </div>
                    {city.worstPeriod && (
                      <div className="tm-report-summary-row">
                        <AlertTriangle size={13} color="var(--danger)"/>
                        <span>Слабый период:</span>
                        <b style={{color:"var(--danger)"}}>{city.worstPeriod}</b>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Секция дашборда Контроль (компактная карточка с кнопкой «Развернуть») ── */
export function ControlSection({ icon:Icon, iconColor, title, summary, onExpand }) {
  return (
    <div className="ctrl-section" onClick={onExpand}>
      <div className="ctrl-section-head">
        <Icon size={16} color={iconColor}/>
        <div className="ctrl-section-info">
          <div className="ctrl-section-title">{title}</div>
          <div className="ctrl-section-summary">{summary}</div>
        </div>
        <span className="ctrl-expand-btn">Развернуть</span>
      </div>
    </div>
  );
}

/* ── Полноэкранный просмотр секции Контроль ── */
export function ControlDetailView({ icon:Icon, iconColor, title, onBack, children }) {
  return (
    <div className="ctrl-detail-view">
      <div className="ctrl-detail-head">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={24}/></button>
        <Icon size={20} color={iconColor}/>
        <span className="ctrl-detail-title">{title}</span>
      </div>
      <div className="ctrl-detail-body">{children}</div>
    </div>
  );
}

/* ── Единая карточка секции Контроль (Фотоотчёт / Перерыв / Тайм-менеджмент) ── */
export function ControlCard({ icon:Icon, iconColor, title, badgeLabel, badgeBg, badgeColor,
  rows, thumbs, expandRows, actionLabel, actionIcon:ActIcon, onAction }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="ctrl-card" style={{borderLeft:`3px solid ${iconColor}`}}>
      <div className="ctrl-card-head">
        <Icon size={16} color={iconColor}/>
        <span className="ctrl-card-title">{title}</span>
        {badgeLabel && <span className="ctrl-card-badge" style={{background:badgeBg||"var(--soft)",color:badgeColor||iconColor}}>{badgeLabel}</span>}
      </div>
      <div className="ctrl-card-body">
        {rows.map((r,i)=>{
          const RIcon=r.icon;
          return <div key={i} className={"ctrl-card-row"+(r.warn?" warn":"")}>
            {RIcon && <RIcon size={14} color={r.color||"var(--sub)"}/>}
            <span>{r.text}</span>
          </div>;
        })}
      </div>
      {thumbs && thumbs.length>0 && <div className="ctrl-card-thumbs">
        {thumbs.slice(0,4).map((t,i)=><img key={i} src={t} alt="" className="ctrl-card-thumb"/>)}
        {thumbs.length>4 && <span className="ctrl-card-thumb-more">+{thumbs.length-4}</span>}
      </div>}
      {expandRows && expandRows.length>0 && <>
        {expanded && <div className="ctrl-card-body ctrl-card-expand">
          {expandRows.map((r,i)=>{
            const RIcon=r.icon;
            return <div key={i} className={"ctrl-card-row"+(r.warn?" warn":"")}>
              {RIcon && <RIcon size={14} color={r.color||"var(--sub)"}/>}
              <span>{r.text}</span>
            </div>;
          })}
        </div>}
        <button className="ctrl-card-toggle" onClick={e=>{e.stopPropagation();setExpanded(!expanded);}}>
          <ChevronDown size={14} style={{transform:expanded?"rotate(180deg)":"none",transition:"transform .2s"}}/>
          {expanded?"Свернуть":"Подробнее"}
        </button>
      </>}
      {onAction && <button className="ctrl-card-action" onClick={e=>{e.stopPropagation();onAction();}}>
        {ActIcon && <ActIcon size={15}/>} {actionLabel}
      </button>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Стандарты точки — полная настройка
   ══════════════════════════════════════════════════════════ */

const POSTPONE_REASONS = [
  "Обслуживаю клиента",
  "На отделе очередь",
  "Нельзя оставить отдел без сотрудника",
  "Выполняется длительная игра",
  "Другая рабочая причина",
];
export { POSTPONE_REASONS };

const AFTER_EXPIRE = [
  { id:"remind",  label:"Напомнить сотруднику" },
  { id:"notify",  label:"Уведомить куратора" },
  { id:"violate", label:"Создать нарушение" },
];


/* ── Вспомогательные UI-компоненты ── */

function ToggleRow({label, value, onChange}) {
  return (
    <div className="std-row">
      <span className="std-row-label">{label}</span>
      <span className={"std-toggle"+(value?" on":"")} onClick={()=>onChange(!value)}>
        <span className="std-toggle-dot"/>
      </span>
    </div>
  );
}

function TopicRow({label, value, onChange, topics}) {
  const list = topics || [];
  return (
    <div className="std-row">
      <span className="std-row-label">{label}</span>
      <select className="std-input std-select" value={value||""} onChange={e=>onChange(e.target.value)}>
        <option value="">По умолчанию</option>
        {list.map(t=>
          <option key={t.name} value={t.name}>{(t.emoji?t.emoji+" ":"")+t.name}</option>)}
      </select>
    </div>
  );
}

function TimeRow({label, value, onChange}) {
  return (
    <div className="std-row">
      <span className="std-row-label">{label}</span>
      <input type="time" className="std-input" value={value} onChange={e=>onChange(e.target.value)}/>
    </div>
  );
}

function DurRow({label, value, onChange, max, unit}) {
  return (
    <div className="std-row">
      <span className="std-row-label">{label}</span>
      <div className="std-dur-wrap">
        <input type="number" className="std-input std-dur" min="1" max={max||240} step="1"
          value={value} onChange={e=>onChange(e.target.value)}/>
        <span className="std-dur-unit">{unit||"мин"}</span>
      </div>
    </div>
  );
}

function NumRow({label, value, onChange, min, max}) {
  return (
    <div className="std-row">
      <span className="std-row-label">{label}</span>
      <input type="number" className="std-input std-dur" min={min||0} max={max||10}
        value={value} onChange={e=>onChange(e.target.value)}/>
    </div>
  );
}

function CheckGroup({label, options, values, onChange}) {
  return (
    <div className="std-row std-row-col">
      <span className="std-row-label">{label}</span>
      <div className="std-reasons">
        {options.map(r=>{
          const on = (values||[]).includes(r);
          return <label key={r} className={"std-reason"+(on?" on":"")}>
            <input type="checkbox" checked={on} onChange={()=>{
              const nr = on ? values.filter(x=>x!==r) : [...(values||[]),r];
              onChange(nr);
            }}/> {r}
          </label>;
        })}
      </div>
    </div>
  );
}

/* ── Раскрывающаяся секция ── */
function Section({id, icon, label, color, expanded, onToggle, enabled, onEnable, badge, children}) {
  return (
    <div className={"std-section"+(expanded?" open":"")}>
      <div className="std-section-head" onClick={onToggle}>
        <span className="std-section-icon" style={{color}}>{icon}</span>
        <span className="std-section-label">{label}</span>
        {badge!=null && <span className="std-badge">{badge}</span>}
        {onEnable && <span className={"std-toggle"+(enabled?" on":"")}
          onClick={e=>{e.stopPropagation(); onEnable(!enabled);}}>
          <span className="std-toggle-dot"/>
        </span>}
        <span className={"std-chev"+(expanded?" rot":"")}>›</span>
      </div>
      {expanded && <div className="std-section-body">{children}</div>}
    </div>
  );
}

/* ══ ГЛАВНЫЙ КОМПОНЕНТ: Стандарты точки ══ */

export function ReportScheduleSettings({ settings, onChange, roster, topics, openChecklist, closeChecklist, onOpenChecklistChange, onCloseChecklistChange }) {
  const s = settings || {
    openEnabled:true, openDeadline:"10:03", openMaxLate:"10",
    openAfterExpire:["remind"],
    closeEnabled:true, closeStart:"22:00", closeDeadline:"22:10",
    closeAfterExpire:["remind"],
    closeRemind5:true, closeRemind10:true, closeRemind15:false,
    breaks:[], attractEnabled:false, attractSlots:[],
    notifSound:true, notifVibration:true, notifRepeat:false, notifOverlay:true, notifNoClose:false,
  };
  const upd = (key,val) => onChange({ ...s, [key]:val });
  const [expanded, setExpanded] = useState({});
  const [breakExpanded, setBreakExpanded] = useState({});
  const toggle = (k) => setExpanded(e=>({...e,[k]:!e[k]}));

  // Нормализация: afterExpire теперь массив (можно выбрать несколько)
  const normalizeAE = (v) => Array.isArray(v) ? v : (v ? [v] : []);
  const toggleAE = (key, id) => {
    const cur = normalizeAE(s[key]);
    const next = cur.includes(id) ? cur.filter(x=>x!==id) : [...cur, id];
    upd(key, next);
  };

  // --- break helpers ---
  const breaks = s.breaks || [];
  const updBreak = (idx, key, val) => {
    const nb = breaks.map((b,i) => i===idx ? {...b, [key]:val} : b);
    upd("breaks", nb);
  };
  const addBreak = () => {
    const nb = [...breaks, {
      name:"Перерыв "+(breaks.length+1),
      enabled:true, start:"13:00", end:"14:00", duration:"30",
      maxPostpone:"20", maxPostponeCount:"2",
      reasons: POSTPONE_REASONS.slice(0,4),
      confirmReturn:true,
      remindBefore:["10","5","2"], remindAfterEvery:true,
      noReturnNotify:"5", noReturnViolate:"10",
    }];
    upd("breaks", nb);
    setBreakExpanded(e=>({...e,[nb.length-1]:true}));
  };
  const removeBreak = (idx) => upd("breaks", breaks.filter((_,i)=>i!==idx));

  // --- attract slots ---
  const slots = s.attractSlots || [];
  const updSlot = (idx, key, val) => {
    const ns = slots.map((sl,i) => i===idx ? {...sl, [key]:val} : sl);
    upd("attractSlots", ns);
  };
  const addSlot = () => {
    const ns = [...slots, {
      id:"as"+Date.now(), start:"13:50", end:"14:00", active:true,
      daily:true, notifyBefore:"5", showWindow:true, playSound:true, vibrate:false, confirmStart:true
    }];
    upd("attractSlots", ns);
  };
  const removeSlot = (idx) => upd("attractSlots", slots.filter((_,i)=>i!==idx));

  // Пункты фотоотчёта из чеклистов
  const openItems = openChecklist || [];
  const closeItems = closeChecklist || [];

  return (
    <div className="std-card">
      <div className="std-title">
        <Settings2 size={16}/> Стандарты сотрудников
      </div>
      <div className="std-sub">Отчёты, перерывы, привлечения, уведомления</div>

      {/* ═══ 1. Утренний фотоотчёт ═══ */}
      <Section id="open" icon={<Camera size={15}/>} label="Утренний фотоотчёт"
        color="#25d10a" expanded={!!expanded.open} onToggle={()=>toggle("open")}
        enabled={s.openEnabled!==false} onEnable={v=>upd("openEnabled",v)}>

        <ToggleRow label="Включён" value={s.openEnabled!==false} onChange={v=>upd("openEnabled",v)}/>
        <TopicRow label="Тема для отчёта" value={s.openTopic} onChange={v=>upd("openTopic",v)} topics={topics}/>
        <TimeRow label="Отправить до" value={s.openDeadline||"10:03"} onChange={v=>upd("openDeadline",v)}/>
        <DurRow label="Максимальное опоздание" value={s.openMaxLate||"10"} onChange={v=>upd("openMaxLate",v)}/>

        <CheckGroup label="После просрочки" options={AFTER_EXPIRE.map(o=>o.label)}
          values={normalizeAE(s.openAfterExpire).map(id=>AFTER_EXPIRE.find(o=>o.id===id)?.label).filter(Boolean)}
          onChange={labels=>{
            const ids=labels.map(l=>AFTER_EXPIRE.find(o=>o.label===l)?.id).filter(Boolean);
            upd("openAfterExpire",ids);
          }}/>

        <div className="std-group-label">Пункты фотоотчёта</div>
        <div className="std-photo-preview-list">
          {openItems.map((p,i)=>
            <div key={p.id} className="std-photo-preview-item">
              <span className="std-photo-preview-num">{i+1}</span>
              <input className="std-photo-preview-input" value={p.label}
                onChange={e=>{
                  const nl=openItems.map(x=>x.id===p.id?{...x,label:e.target.value}:x);
                  onOpenChecklistChange&&onOpenChecklistChange(nl);
                }}/>
              <button className="std-photo-preview-del" onClick={()=>{
                onOpenChecklistChange&&onOpenChecklistChange(openItems.filter(x=>x.id!==p.id));
              }}><X size={12}/></button>
            </div>)}
        </div>
        <button className="std-add-break" style={{marginTop:4}} onClick={()=>{
          const ni=[...openItems,{id:"chk-"+Date.now(),label:"Новый пункт"}];
          onOpenChecklistChange&&onOpenChecklistChange(ni);
        }}><Plus size={14}/> Добавить пункт</button>
      </Section>

      {/* ═══ 2. Вечерний фотоотчёт ═══ */}
      <Section id="close" icon={<Camera size={15}/>} label="Вечерний фотоотчёт"
        color="#e8a838" expanded={!!expanded.close} onToggle={()=>toggle("close")}
        enabled={s.closeEnabled!==false} onEnable={v=>upd("closeEnabled",v)}>

        <ToggleRow label="Включён" value={s.closeEnabled!==false} onChange={v=>upd("closeEnabled",v)}/>
        <TopicRow label="Тема для отчёта" value={s.closeTopic} onChange={v=>upd("closeTopic",v)} topics={topics}/>
        <TimeRow label="Открывать автоматически" value={s.closeStart||"22:00"} onChange={v=>upd("closeStart",v)}/>
        <TimeRow label="Отправить до" value={s.closeDeadline||"22:10"} onChange={v=>upd("closeDeadline",v)}/>
        <DurRow label="Максимальное опоздание" value={s.closeMaxLate||"10"} onChange={v=>upd("closeMaxLate",v)}/>

        <CheckGroup label="После просрочки" options={AFTER_EXPIRE.map(o=>o.label)}
          values={normalizeAE(s.closeAfterExpire).map(id=>AFTER_EXPIRE.find(o=>o.id===id)?.label).filter(Boolean)}
          onChange={labels=>{
            const ids=labels.map(l=>AFTER_EXPIRE.find(o=>o.label===l)?.id).filter(Boolean);
            upd("closeAfterExpire",ids);
          }}/>

        <CheckGroup label="Напомнить если не закрыли"
          options={["через 5 минут","через 10 минут","через 15 минут"]}
          values={[
            ...(s.closeRemind5!==false?["через 5 минут"]:[]),
            ...(s.closeRemind10!==false?["через 10 минут"]:[]),
            ...(s.closeRemind15?["через 15 минут"]:[]),
          ]}
          onChange={labels=>{
            onChange({...s,
              closeRemind5:labels.includes("через 5 минут"),
              closeRemind10:labels.includes("через 10 минут"),
              closeRemind15:labels.includes("через 15 минут"),
            });
          }}/>

        <div className="std-group-label">Пункты фотоотчёта</div>
        <div className="std-photo-preview-list">
          {closeItems.map((p,i)=>
            <div key={p.id} className="std-photo-preview-item">
              <span className="std-photo-preview-num">{i+1}</span>
              <input className="std-photo-preview-input" value={p.label}
                onChange={e=>{
                  const nl=closeItems.map(x=>x.id===p.id?{...x,label:e.target.value}:x);
                  onCloseChecklistChange&&onCloseChecklistChange(nl);
                }}/>
              <button className="std-photo-preview-del" onClick={()=>{
                onCloseChecklistChange&&onCloseChecklistChange(closeItems.filter(x=>x.id!==p.id));
              }}><X size={12}/></button>
            </div>)}
        </div>
        <button className="std-add-break" style={{marginTop:4}} onClick={()=>{
          const ni=[...closeItems,{id:"chk-"+Date.now(),label:"Новый пункт"}];
          onCloseChecklistChange&&onCloseChecklistChange(ni);
        }}><Plus size={14}/> Добавить пункт</button>
      </Section>

      {/* ═══ 3. Перерывы ═══ */}
      <Section id="breaks" icon={<Coffee size={15}/>} label="Перерывы"
        color="#25d10a" expanded={!!expanded.breaks} onToggle={()=>toggle("breaks")}
        badge={breaks.length||null}>
        <TopicRow label="Тема для отчёта" value={s.breaksTopic} onChange={v=>upd("breaksTopic",v)} topics={topics}/>
        {breaks.map((b,idx)=>(
          <div key={idx} className={"std-break-item"+(breakExpanded[idx]?" open":"")}>
            <div className="std-break-head" onClick={()=>setBreakExpanded(e=>({...e,[idx]:!e[idx]}))}>
              <span className={"std-break-dot"+(b.enabled?" on":"")}/>
              <span className="std-break-name">{b.name||"Перерыв"}</span>
              <span className="std-break-time">{b.start}–{b.end}</span>
              <span className={"std-chev std-chev-sm"+(breakExpanded[idx]?" rot":"")}>›</span>
            </div>
            {breakExpanded[idx] && <div className="std-break-body">
              <div className="std-row">
                <span className="std-row-label">Название</span>
                <input className="std-input std-input-wide" value={b.name}
                  onChange={e=>updBreak(idx,"name",e.target.value)}/>
              </div>
              <ToggleRow label="Включён" value={b.enabled!==false} onChange={v=>updBreak(idx,"enabled",v)}/>
              <TimeRow label="Начало интервала" value={b.start||"13:00"} onChange={v=>updBreak(idx,"start",v)}/>
              <TimeRow label="Конец интервала" value={b.end||"14:00"} onChange={v=>updBreak(idx,"end",v)}/>
              <DurRow label="Продолжительность" value={b.duration||"30"} onChange={v=>updBreak(idx,"duration",v)}/>
              <DurRow label="Максимальный перенос" value={b.maxPostpone||"20"} onChange={v=>updBreak(idx,"maxPostpone",v)} max={60}/>
              <NumRow label="Максимум переносов" value={b.maxPostponeCount||"2"} onChange={v=>updBreak(idx,"maxPostponeCount",v)} max={5}/>

              <CheckGroup label="Причины переноса" options={POSTPONE_REASONS}
                values={b.reasons||[]} onChange={v=>updBreak(idx,"reasons",v)}/>

              <div className="std-group-label">После окончания</div>
              <ToggleRow label="Требовать подтверждение возвращения" value={b.confirmReturn!==false}
                onChange={v=>updBreak(idx,"confirmReturn",v)}/>

              <div className="std-group-label">Напоминания</div>
              <ToggleRow label="за 10 минут" value={(b.remindBefore||[]).includes("10")}
                onChange={v=>updBreak(idx,"remindBefore",v?[...(b.remindBefore||[]),"10"]:(b.remindBefore||[]).filter(x=>x!=="10"))}/>
              <ToggleRow label="за 5 минут" value={(b.remindBefore||[]).includes("5")}
                onChange={v=>updBreak(idx,"remindBefore",v?[...(b.remindBefore||[]),"5"]:(b.remindBefore||[]).filter(x=>x!=="5"))}/>
              <ToggleRow label="за 2 минуты" value={(b.remindBefore||[]).includes("2")}
                onChange={v=>updBreak(idx,"remindBefore",v?[...(b.remindBefore||[]),"2"]:(b.remindBefore||[]).filter(x=>x!=="2"))}/>
              <ToggleRow label="каждую минуту после окончания" value={b.remindAfterEvery!==false}
                onChange={v=>updBreak(idx,"remindAfterEvery",v)}/>

              <div className="std-group-label">Если не вернулся</div>
              <div className="std-row">
                <span className="std-row-label">Уведомить куратора через</span>
                <div className="std-dur-wrap">
                  <input type="number" className="std-input std-dur" min="1" max="60"
                    value={b.noReturnNotify||"5"} onChange={e=>updBreak(idx,"noReturnNotify",e.target.value)}/>
                  <span className="std-dur-unit">мин</span>
                </div>
              </div>
              <div className="std-row">
                <span className="std-row-label">Создать нарушение через</span>
                <div className="std-dur-wrap">
                  <input type="number" className="std-input std-dur" min="1" max="60"
                    value={b.noReturnViolate||"10"} onChange={e=>updBreak(idx,"noReturnViolate",e.target.value)}/>
                  <span className="std-dur-unit">мин</span>
                </div>
              </div>

              <button className="std-del-break" onClick={()=>removeBreak(idx)}>
                <X size={13}/> Удалить перерыв
              </button>
            </div>}
          </div>
        ))}
        <button className="std-add-break" onClick={addBreak}>
          <Plus size={14}/> Добавить перерыв
        </button>
      </Section>

      {/* ═══ 4. Привлечения ═══ */}
      <Section id="attract" icon={<Users size={15}/>} label="Привлечения"
        color="#a878f0" expanded={!!expanded.attract} onToggle={()=>toggle("attract")}
        enabled={!!s.attractEnabled} onEnable={v=>upd("attractEnabled",v)}
        badge={slots.length||null}>
        <ToggleRow label="Требовать отчёт о привлечении" value={s.attractReportRequired!==false} onChange={v=>upd("attractReportRequired",v)}/>
        <TopicRow label="Тема для отчёта" value={s.attractTopic} onChange={v=>upd("attractTopic",v)} topics={topics}/>
        {slots.map((sl,idx)=>(
          <div key={sl.id} className="std-attract-slot">
            <div className="std-attract-slot-head">
              <span className="std-attract-slot-time">{sl.start} – {sl.end}</span>
              {sl.active && <span className="std-attract-active-tag">активно привлекать</span>}
              <button className="std-del-break" style={{marginLeft:"auto"}} onClick={()=>removeSlot(idx)}>
                <X size={12}/></button>
            </div>
            <TimeRow label="Начало" value={sl.start} onChange={v=>updSlot(idx,"start",v)}/>
            <TimeRow label="Конец" value={sl.end} onChange={v=>updSlot(idx,"end",v)}/>
            <ToggleRow label="Повторять ежедневно" value={sl.daily!==false} onChange={v=>updSlot(idx,"daily",v)}/>
            <DurRow label="Уведомить за" value={sl.notifyBefore||"5"} onChange={v=>updSlot(idx,"notifyBefore",v)} max={30}/>
            <ToggleRow label="Показать окно" value={sl.showWindow!==false} onChange={v=>updSlot(idx,"showWindow",v)}/>
            <ToggleRow label="Проиграть звук" value={sl.playSound!==false} onChange={v=>updSlot(idx,"playSound",v)}/>
            <ToggleRow label="Вибрация" value={!!sl.vibrate} onChange={v=>updSlot(idx,"vibrate",v)}/>
            <ToggleRow label="Обязательно подтвердить начало" value={sl.confirmStart!==false} onChange={v=>updSlot(idx,"confirmStart",v)}/>
          </div>
        ))}
        <button className="std-add-break" onClick={addSlot}>
          <Plus size={14}/> Добавить интервал
        </button>
      </Section>

      {/* ═══ 5. Уведомления ═══ */}
      <Section id="notif" icon={<Bell size={15}/>} label="Уведомления"
        color="#f0b429" expanded={!!expanded.notif} onToggle={()=>toggle("notif")}>
        <ToggleRow label="Звук" value={s.notifSound!==false} onChange={v=>upd("notifSound",v)}/>
        <ToggleRow label="Вибрация" value={s.notifVibration!==false} onChange={v=>upd("notifVibration",v)}/>
        <ToggleRow label="Повторять уведомления" value={!!s.notifRepeat} onChange={v=>upd("notifRepeat",v)}/>
        <ToggleRow label="Показывать поверх приложения" value={s.notifOverlay!==false} onChange={v=>upd("notifOverlay",v)}/>
        <ToggleRow label="Запретить закрытие окна" value={!!s.notifNoClose} onChange={v=>upd("notifNoClose",v)}/>
      </Section>
    </div>
  );
}

/* ══ Стандарты кураторов (Управление) ══ */
export function CuratorStandards({ settings, onChange }) {
  const s = settings || {
    checkAttractionEnabled:true,
    checkAttractionWindow:20,
    autoAssignPoints:true,
    requireScreenshot:true,
    dailyReportRequired:true,
    dailyReportDeadline:"22:00",
    violationAutoCreate:true,
    violationDelay:"15",
    notifyOwnerMissed:true,
    problemResponseTime:"30",
  };
  const upd = (key,val) => onChange({ ...s, [key]:val });
  const [expanded, setExpanded] = useState({});
  const toggle = (k) => setExpanded(e=>({...e,[k]:!e[k]}));

  return (
    <div className="std-card">
      <div className="std-title">
        <Settings2 size={16}/> Стандарты кураторов
      </div>
      <div className="std-sub">Проверки, реагирование, отчётность</div>

      <Section id="check-attract" icon={<MapPin size={15}/>} label="Проверки привлечения"
        color="#a878f0" expanded={!!expanded["check-attract"]} onToggle={()=>toggle("check-attract")}
        enabled={s.checkAttractionEnabled!==false} onEnable={v=>upd("checkAttractionEnabled",v)}>
        <ToggleRow label="Автоматически назначать точку" value={s.autoAssignPoints!==false}
          onChange={v=>upd("autoAssignPoints",v)}/>
        <ToggleRow label="Требовать скриншот" value={s.requireScreenshot!==false}
          onChange={v=>upd("requireScreenshot",v)}/>
        <DurRow label="Окно отправки (мин от :40)" value={s.checkAttractionWindow||"20"}
          onChange={v=>upd("checkAttractionWindow",v)} max={60}/>
      </Section>

      <Section id="violations" icon={<AlertCircle size={15}/>} label="Нарушения"
        color="#f0616d" expanded={!!expanded.violations} onToggle={()=>toggle("violations")}
        enabled={s.violationAutoCreate!==false} onEnable={v=>upd("violationAutoCreate",v)}>
        <ToggleRow label="Автоматически создавать нарушения" value={s.violationAutoCreate!==false}
          onChange={v=>upd("violationAutoCreate",v)}/>
        <DurRow label="Задержка перед созданием" value={s.violationDelay||"15"}
          onChange={v=>upd("violationDelay",v)} max={60}/>
        <ToggleRow label="Уведомлять владельца о пропусках" value={s.notifyOwnerMissed!==false}
          onChange={v=>upd("notifyOwnerMissed",v)}/>
      </Section>

      <Section id="daily-report" icon={<Activity size={15}/>} label="Ежедневный отчёт"
        color="#5b8def" expanded={!!expanded["daily-report"]} onToggle={()=>toggle("daily-report")}
        enabled={s.dailyReportRequired!==false} onEnable={v=>upd("dailyReportRequired",v)}>
        <ToggleRow label="Требовать ежедневный отчёт" value={s.dailyReportRequired!==false}
          onChange={v=>upd("dailyReportRequired",v)}/>
        <TimeRow label="Отправить до" value={s.dailyReportDeadline||"22:00"}
          onChange={v=>upd("dailyReportDeadline",v)}/>
      </Section>

      <Section id="response" icon={<Timer size={15}/>} label="Реагирование"
        color="#42c9b0" expanded={!!expanded.response} onToggle={()=>toggle("response")}>
        <DurRow label="Время реакции на проблему" value={s.problemResponseTime||"30"}
          onChange={v=>upd("problemResponseTime",v)} max={120}/>
      </Section>
    </div>
  );
}
