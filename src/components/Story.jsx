// Компонент: Story
import {
  Plus
} from "lucide-react";
import { avatarColor, initials } from "../utils/helpers";

export function Story({ s, add, onClick }) {
  return (
    <div className="story" onClick={onClick}>
      <div className={"story-ring"+(add?" add":s.seen?"":" unseen")}>
        <div className="story-face" style={{ background:add?"var(--soft)":avatarColor(s?.name),
          color:add?"var(--accent)":"#fff" }}>
          {add ? <Plus size={24}/> : initials(s.name)}
          {add && <span className="story-add-plus"><Plus size={13}/></span>}
        </div>
      </div>
      <span className="story-name">{add?"Ваша":s.name}</span>
    </div>
  );
}

