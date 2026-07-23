// Компонент: Avatar
import { avatarColor, initials } from "../utils/helpers";

export function Avatar({ name, size=54, online, ring, emoji, color, photo }) {
  return (
    <div className="av" style={{ width:size, height:size, background:photo?"transparent":(color||avatarColor(name)),
      fontSize:emoji?size*0.5:size*0.36 }} data-ring={ring?"1":undefined}>
      <span className={ring?"av-ring":""} style={{ width:"100%", height:"100%", borderRadius:"50%",
        overflow:"hidden", display:"grid", placeItems:"center" }}>
        {photo ? <img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (emoji||initials(name))}
      </span>
      {online && <span className="av-online" style={{ width:size*0.24, height:size*0.24 }}/>}
    </div>
  );
}

