// Компонент: PromotePanel
import { useState } from "react";
import {
  Trash2,
  Pin,
  UserPlus,
  Shield,
  LogOut
} from "lucide-react";
import { Avatar, Toggle } from "./index";

const ADMIN_RIGHTS = [
  {k:"del",Icon:Trash2,label:"Удалять сообщения"},
  {k:"ban",Icon:LogOut,label:"Блокировать участников"},
  {k:"invite",Icon:UserPlus,label:"Добавлять участников"},
  {k:"pin",Icon:Pin,label:"Закреплять сообщения"},
  {k:"promote",Icon:Shield,label:"Назначать администраторов"},
];
export function PromotePanel({ member, onApply }) {
  const [rights,setRights]=useState({del:true,ban:true,invite:true,pin:true,promote:false});
  const toggle=(k)=>setRights(r=>({...r,[k]:!r[k]}));
  return (
    <>
      <div className="p-hero">
        <Avatar name={member.name} size={92} online={member.online}/>
        <div className="p-name">{member.name}</div>
        <div className="p-status">Выберите права нового администратора</div>
      </div>
      <div className="s-group-title">Права администратора</div>
      <div className="s-card">
        {ADMIN_RIGHTS.map(rt=>
          <div key={rt.k} className="s-row">
            <span className="s-ic"><rt.Icon size={20}/></span>
            <span className="s-label">{rt.label}</span>
            <Toggle on={!!rights[rt.k]} onClick={()=>toggle(rt.k)}/>
          </div>)}
      </div>
      <div className="s-card" style={{padding:0,overflow:"hidden"}}>
        <button className="promote-btn" onClick={()=>onApply(rights)}>
          <Shield size={18}/> Назначить администратором</button>
      </div>
      <div className="s-note">Права можно изменить позже на экране участника.</div>
    </>
  );
}

