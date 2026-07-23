// Компонент: PhotoAvatar
import { useRef } from "react";
import {
  X,
  Camera
} from "lucide-react";
import { avatarColor } from "../utils/helpers";
import { Avatar } from "./index";

export function PhotoAvatar({ me, onPhoto, onRemove }) {
  const ref=useRef(null);
  const pick=(e)=>{ const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>onPhoto(r.result); r.readAsDataURL(f); e.target.value=""; };
  return (
    <div className="photo-avatar">
      <Avatar name={me.name} size={108} emoji={me.emoji} color={me.avatarColor} photo={me.photo}/>
      <button className="photo-cam" onClick={()=>ref.current.click()} title="Загрузить фото">
        <Camera size={18}/></button>
      {me.photo &&
        <button className="photo-remove" onClick={onRemove} title="Убрать фото"><X size={14}/></button>}
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={pick}/>
    </div>
  );
}

