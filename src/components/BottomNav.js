// Компонент: BottomNav
import {
  Phone,
  MessageCircle,
  Users,
  Settings
} from "lucide-react";

export function BottomNav({ tab, folder, totalUnread, groupsUnread, onTab, onGroups }) {
  const Item=({id,Icon,l,b})=>(
    <div className={"bnav-item"+(tab===id?" active":"")} onClick={()=>onTab(id)}>
      {b>0 && <span className="badge">{b}</span>}<Icon size={22}/><span>{l}</span>
    </div>
  );
  const groupsActive = tab==="chats" && folder==="groups";
  return (
    <div className="bnav">
      <Item id="chats" Icon={MessageCircle} l="Чаты" b={totalUnread}/>
      <Item id="calls" Icon={Phone} l="Звонки"/>
      <div className="bnav-center">
        <button className={"bnav-fab"+(groupsActive?" on":"")} onClick={onGroups} title="Рабочие группы">
          {groupsUnread>0 && <span className="badge bnav-fab-badge">{groupsUnread}</span>}
          <Users size={24}/></button>
        <span className="bnav-fab-label">Группы</span>
      </div>
      <Item id="contacts" Icon={Users} l="Контакты"/>
      <Item id="settings" Icon={Settings} l="Опции"/>
    </div>
  );
}

