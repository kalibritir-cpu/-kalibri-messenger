// Компонент: GroupForms — анкеты на странице группы
// «Хочу стать куратором», «Подать жалобу», «Пожелания»
import { useState } from "react";
import { UserPlus, AlertTriangle, Lightbulb, X, Check, EyeOff } from "lucide-react";

// ─── Описание форм: заголовок, поля, настройки анонимности ───
export const FORM_DEFS = {
  curator: {
    id:"curator", title:"Хочу стать куратором", emoji:"🎓", color:"#25d10a",
    Icon: UserPlus,
    sub:"Заявка на позицию куратора точки",
    anonymous:false,
    fields:[
      { id:"point", type:"text", label:"Точка, где работаете", required:true,
        placeholder:"Например: Шаблон" },
      { id:"experience", type:"select", label:"Опыт работы в компании", required:true,
        options:["Менее 3 месяцев","3–12 месяцев","1–3 года","Более 3 лет"] },
      { id:"position", type:"text", label:"Текущая должность", required:true,
        placeholder:"Продавец, мастер, старший продавец…" },
      { id:"motivation", type:"textarea", label:"Почему хотите стать куратором", required:true,
        hint:"Что вас мотивирует, каким видите себя в этой роли" },
      { id:"strengths", type:"textarea", label:"Ваши сильные стороны", required:true,
        hint:"Что умеете лучше всего: работа с людьми, отчётность, обучение новичков" },
      { id:"cases", type:"textarea", label:"Опыт решения сложных ситуаций", required:false,
        hint:"Приведите пример конфликта или проблемы, которую вы решили" },
      { id:"ready", type:"select", label:"Готовность к разъездам", required:true,
        options:["Да, готов(а) к выездам","Только своя точка","Обсуждается"] },
      { id:"schedule", type:"select", label:"Возможный график", required:true,
        options:["Полный день","Сменный","Гибкий","Обсуждается"] },
      { id:"contact", type:"text", label:"Контакт для связи", required:false,
        placeholder:"Телефон или @юзернейм" },
    ],
  },
  complaint: {
    id:"complaint", title:"Подать жалобу", emoji:"⚠️", color:"#f0b429",
    Icon: AlertTriangle,
    sub:"Обращение рассмотрит руководство",
    anonymous:true,
    fields:[
      { id:"target", type:"select", label:"На кого жалоба", required:true,
        options:["На сотрудника","На руководство / куратора","На условия работы","Другое"],
        hint:"Выберите, к кому относится обращение" },
      { id:"subject", type:"text", label:"Кто именно / что именно", required:false,
        placeholder:"Имя сотрудника, должность или предмет жалобы",
        hint:"Можно не указывать, если жалоба общая" },
      { id:"when", type:"text", label:"Когда произошло", required:false,
        placeholder:"Дата или период" },
      { id:"text", type:"textarea", label:"Суть жалобы", required:true,
        hint:"Опишите ситуацию подробно: что произошло, кто участвовал" },
      { id:"repeat", type:"select", label:"Повторяется ли ситуация", required:false,
        options:["Впервые","Повторяется иногда","Происходит регулярно"] },
      { id:"witnesses", type:"text", label:"Свидетели", required:false,
        placeholder:"Кто может подтвердить" },
      { id:"expect", type:"textarea", label:"Чего вы ожидаете", required:false,
        hint:"Какое решение считаете справедливым" },
      { id:"wantAnswer", type:"select", label:"Нужен ли ответ", required:true,
        options:["Да","Нет, просто сообщаю"] },
    ],
  },
  wish: {
    id:"wish", title:"Пожелания", emoji:"💡", color:"#5b8def",
    Icon: Lightbulb,
    sub:"Идеи и предложения по улучшению",
    anonymous:true,
    fields:[
      { id:"area", type:"select", label:"Область", required:true,
        options:["Оборудование","Рабочий процесс","График и смены","Обучение",
                 "Атмосфера в коллективе","Клиентский сервис","Другое"] },
      { id:"text", type:"textarea", label:"Ваше предложение", required:true,
        hint:"Опишите идею — что улучшить и как" },
      { id:"benefit", type:"textarea", label:"Что это даст", required:false,
        hint:"Как это поможет команде или клиентам" },
      { id:"priority", type:"select", label:"Насколько срочно", required:false,
        options:["Низкий","Средний","Высокий"] },
    ],
  },
};

// ─── Кнопки форм на странице группы ───
export function GroupFormsBlock({ enabled, onOpen }) {
  const list = Object.values(FORM_DEFS).filter(f => enabled?.[f.id]);
  if (!list.length) return null;
  return (
    <div className="gforms">
      <div className="gforms-title">Обращения</div>
      <div className="gforms-list">
        {list.map(f => {
          const Ic = f.Icon;
          return (
            <button key={f.id} className="gform-btn" onClick={() => onOpen(f.id)}>
              <span className="gform-ic" style={{ background:`color-mix(in srgb, ${f.color} 15%, transparent)`, color:f.color }}>
                <Ic size={20}/>
              </span>
              <span className="gform-main">
                <span className="gform-name">{f.title}</span>
                <span className="gform-sub">{f.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Модальная форма заполнения ───
export function GroupFormModal({ formId, meName, onClose, onSubmit }) {
  const def = FORM_DEFS[formId];
  const [data, setData] = useState({});
  const [anon, setAnon] = useState(false);
  const [err, setErr] = useState(null);
  if (!def) return null;

  const set = (id, v) => { setData(d => ({ ...d, [id]: v })); setErr(null); };
  const submit = () => {
    const miss = def.fields.filter(f => f.required && !String(data[f.id] || "").trim());
    if (miss.length) { setErr(`Заполните: ${miss.map(f => f.label).join(", ")}`); return; }
    onSubmit({ kind:def.id, anon: def.anonymous ? anon : false,
      author: (def.anonymous && anon) ? null : meName, data });
  };

  return (
    <div className="gform-ovl" onClick={onClose}>
      <div className="gform-modal" onClick={e => e.stopPropagation()}>
        <div className="gform-head">
          <span className="gform-head-emoji">{def.emoji}</span>
          <div className="gform-head-main">
            <div className="gform-head-title">{def.title}</div>
            <div className="gform-head-sub">{def.sub}</div>
          </div>
          <button className="gform-close" onClick={onClose}><X size={20}/></button>
        </div>

        <div className="gform-body">
          {def.anonymous &&
            <label className="gform-anon">
              <span className="gform-anon-ic"><EyeOff size={16}/></span>
              <span className="gform-anon-txt">
                <b>Отправить анонимно</b>
                <i>{anon ? "Ваше имя не будет видно" : `Будет указано: ${meName}`}</i>
              </span>
              <span className={"gform-toggle"+(anon?" on":"")} onClick={()=>setAnon(a=>!a)}>
                <span className="gform-toggle-dot"/>
              </span>
            </label>}

          {def.fields.map(f => (
            <div key={f.id} className="gform-field">
              <label className="gform-label">{f.label}{f.required && <b>*</b>}</label>
              {f.type === "textarea"
                ? <textarea className="gform-input" rows={3} value={data[f.id]||""}
                    placeholder={f.placeholder||""} onChange={e=>set(f.id, e.target.value)}/>
                : f.type === "select"
                ? <select className="gform-input gform-select" value={data[f.id]||""}
                    onChange={e=>set(f.id, e.target.value)}>
                    <option value="">Выберите…</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                : <input className="gform-input" value={data[f.id]||""}
                    placeholder={f.placeholder||""} onChange={e=>set(f.id, e.target.value)}/>}
              {f.hint && <div className="gform-hint">{f.hint}</div>}
            </div>
          ))}

          {err && <div className="gform-err">{err}</div>}
        </div>

        <div className="gform-foot">
          <button className="gform-cancel" onClick={onClose}>Отмена</button>
          <button className="gform-send" onClick={submit}><Check size={17}/> Отправить</button>
        </div>
      </div>
    </div>
  );
}
