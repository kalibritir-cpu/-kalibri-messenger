// Компонент: LoginScreen
import { useState } from "react";
import { Check } from "lucide-react";

import { LOGO } from "../assets/logo";
import { POINTS } from "../constants";
import { formatPhone } from "../utils/helpers";

export function LoginScreen({ theme, me, onLogin, onRegister }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "sent"
  const [login,setLogin]=useState(me?.phone || "");
  const [pass,setPass]=useState("");
  const [asRole,setAsRole]=useState("owner"); // owner | member — под кем входим
  const submit=()=>{ if(login.trim()) onLogin(asRole); };

  const [rName,setRName]=useState("");
  const [rSurname,setRSurname]=useState("");
  const [rHandle,setRHandle]=useState("");
  const [rPhone,setRPhone]=useState("");
  const [rPoint,setRPoint]=useState(POINTS[0]);
  const canSubmitReg = rName.trim() && rSurname.trim() && rHandle.trim() && rPhone.trim() && rPoint;
  const handleChange=(v)=>setRHandle(v.toLowerCase().replace(/[^a-zа-яё0-9_]/g,""));
  const submitReg=()=>{
    if(!canSubmitReg) return;
    onRegister && onRegister({ name:(rName.trim()+" "+rSurname.trim()).trim(), handle:rHandle.trim(), phone:rPhone.trim(), point:rPoint });
    setMode("sent");
  };

  return (
    <div className="login-root" data-theme={theme}>
      <div className="login-card">
        <div className="login-logo"><img src={LOGO} alt="Калибри"/></div>
        <div className="login-title">Калибри</div>

        {mode!=="sent" &&
          <div className="login-tabs">
            <button className={"login-tab"+(mode==="login"?" active":"")} onClick={()=>setMode("login")}>Войти</button>
            <button className={"login-tab"+(mode==="register"?" active":"")} onClick={()=>setMode("register")}>Регистрация</button>
          </div>}

        {mode==="login" && <>
          <div className="login-sub">Войдите в свой аккаунт</div>
          <div className="login-field">
            <label>Логин или телефон</label>
            <input value={login} onChange={e=>setLogin(e.target.value)} placeholder="+7 999 123-45-67"
              onKeyDown={e=>{ if(e.key==="Enter") submit(); }}/>
          </div>
          <div className="login-field">
            <label>Пароль</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••"
              onKeyDown={e=>{ if(e.key==="Enter") submit(); }}/>
          </div>
          <div className="login-field">
            <label>Войти как</label>
            <div className="login-roles">
              <button className={"login-role"+(asRole==="owner"?" on":"")} onClick={()=>setAsRole("owner")}>
                <b>Руководитель</b><i>Полный доступ, анкеты сотрудников</i></button>
              <button className={"login-role"+(asRole==="member"?" on":"")} onClick={()=>setAsRole("member")}>
                <b>Сотрудник</b><i>Обычный доступ, подача обращений</i></button>
            </div>
          </div>
          <button className="login-btn" disabled={!login.trim()} onClick={submit}>Войти</button>
          <div className="login-note">Демо-режим: пароль можно не вводить.</div>
        </>}

        {mode==="register" && <>
          <div className="login-sub">Заявка на доступ рассматривается администратором вашей точки</div>
          <div className="login-field">
            <label>Имя</label>
            <input value={rName} onChange={e=>setRName(e.target.value)} placeholder="Анна"/>
          </div>
          <div className="login-field">
            <label>Фамилия</label>
            <input value={rSurname} onChange={e=>setRSurname(e.target.value)} placeholder="Ковалёва"/>
          </div>
          <div className="login-field">
            <label>@ID (имя пользователя)</label>
            <div className="login-handle-wrap">
              <span className="login-handle-at">@</span>
              <input value={rHandle} onChange={e=>handleChange(e.target.value)} placeholder="anna_kovaleva"/>
            </div>
            <div className="login-hint">Латиница, цифры и _ — ваш уникальный ID для упоминаний</div>
          </div>
          <div className="login-field">
            <label>Телефон</label>
            <input value={rPhone} onChange={e=>setRPhone(formatPhone(e.target.value))} placeholder="+7 900 000-00-00"
              onKeyDown={e=>{ if(e.key==="Enter") submitReg(); }}/>
          </div>
          <div className="login-field">
            <label>Точка / филиал</label>
            <select className="login-select" value={rPoint} onChange={e=>setRPoint(e.target.value)}>
              {POINTS.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button className="login-btn" disabled={!canSubmitReg} onClick={submitReg}>Отправить заявку</button>
          <div className="login-note">После одобрения администратором вы получите доступ к аккаунту.</div>
        </>}

        {mode==="sent" && <>
          <div className="login-success">
            <div className="login-success-ic"><Check size={28}/></div>
            <div className="login-success-title">Заявка отправлена</div>
            <div className="login-success-text">
              Мы передали заявку администратору{rPoint?` точки «${rPoint.replace(/^Точка\s*/,"").replace(/[«»]/g,"")}»`:""}.
              Как только её одобрят, вы сможете войти.
            </div>
          </div>
          <button className="login-btn" onClick={()=>{ setMode("login"); setRName(""); setRSurname(""); setRPhone(""); }}>Понятно</button>
        </>}
      </div>
    </div>
  );
}
