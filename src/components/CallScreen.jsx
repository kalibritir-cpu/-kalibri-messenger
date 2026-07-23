// Компонент: CallScreen — экран звонка с возможностью добавлять участников
import { useState, useEffect, useRef } from "react";
import {
  Video,
  Mic,
  PhoneOff,
  VideoOff,
  MicOff,
  Volume2,
  SwitchCamera,
  UserPlus,
  X,
  Search,
  Phone
} from "lucide-react";
import { avatarColor, initials } from "../utils/helpers";

export function CallScreen({ call, onEnd, contacts }) {
  const [sec,setSec]=useState(0);
  const [state,setState]=useState("calling"); // calling -> active
  const [muted,setMuted]=useState(false);
  const [videoOff,setVideoOff]=useState(call.kind!=="video");
  const [speaker,setSpeaker]=useState(false);
  const [facingMode,setFacingMode]=useState("user");
  const [streamError,setStreamError]=useState(null);

  // Участники звонка
  const [participants,setParticipants]=useState([
    { name:call.name, joined:true, muted:false, videoOff:call.kind!=="video" }
  ]);
  const [addOpen,setAddOpen]=useState(false);
  const [addSearch,setAddSearch]=useState("");

  const videoRef=useRef(null);
  const streamRef=useRef(null);

  // Запрос камеры/микрофона
  useEffect(()=>{
    let cancelled=false;
    async function startMedia(){
      try {
        if(streamRef.current){
          streamRef.current.getTracks().forEach(t=>t.stop());
        }
        const constraints = call.kind==="video"
          ? { video:{ facingMode }, audio:true }
          : { audio:true, video:false };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if(cancelled) { stream.getTracks().forEach(t=>t.stop()); return; }
        streamRef.current=stream;
        setStreamError(null);
        if(videoRef.current && call.kind==="video"){
          videoRef.current.srcObject=stream;
        }
      } catch(err) {
        if(!cancelled) setStreamError(err.name==="NotAllowedError"
          ? (call.kind==="video"?"Доступ к камере запрещён":"Доступ к микрофону запрещён")
          : "Нет доступа к устройствам");
      }
    }
    startMedia();
    return ()=>{ cancelled=true; };
  },[call.kind, facingMode]);

  useEffect(()=>{
    return ()=>{
      if(streamRef.current){
        streamRef.current.getTracks().forEach(t=>t.stop());
        streamRef.current=null;
      }
    };
  },[]);

  useEffect(()=>{
    if(streamRef.current){
      streamRef.current.getAudioTracks().forEach(t=>{ t.enabled=!muted; });
    }
  },[muted]);

  useEffect(()=>{
    if(streamRef.current){
      streamRef.current.getVideoTracks().forEach(t=>{ t.enabled=!videoOff; });
    }
    if(videoRef.current && !videoOff && streamRef.current){
      videoRef.current.srcObject=streamRef.current;
    }
  },[videoOff]);

  // Имитация «дозвона»
  useEffect(()=>{
    const t1=setTimeout(()=>setState("active"), 1800);
    return ()=>clearTimeout(t1);
  },[]);

  // Таймер звонка
  useEffect(()=>{
    if(state!=="active") return;
    const iv=setInterval(()=>setSec(s=>s+1),1000);
    return ()=>clearInterval(iv);
  },[state]);

  const dur=`${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;
  const isVideo = call.kind==="video" && !videoOff;
  const isGroup = participants.length > 1;

  const flipCamera=()=>{
    setFacingMode(f => f==="user" ? "environment" : "user");
  };

  const handleEnd=()=>{
    if(streamRef.current){
      streamRef.current.getTracks().forEach(t=>t.stop());
      streamRef.current=null;
    }
    onEnd(state==="active"?{dur}:null);
  };

  // Добавить участника
  const addPerson=(name)=>{
    if(participants.find(p=>p.name===name)) return;
    setParticipants(prev=>[...prev, { name, joined:false, muted:false, videoOff:true }]);
    // Имитация «присоединения» через 2 секунды
    setTimeout(()=>{
      setParticipants(prev=>prev.map(p=>p.name===name?{...p,joined:true,videoOff:call.kind!=="video"}:p));
    }, 2000);
    setAddOpen(false);
    setAddSearch("");
  };

  // Удалить участника
  const removePerson=(name)=>{
    setParticipants(prev=>prev.filter(p=>p.name!==name));
  };

  // Список контактов для приглашения
  const allContacts = contacts || [];
  const inviteList = allContacts.filter(c=>
    !participants.find(p=>p.name===c.name) &&
    c.name.toLowerCase().includes(addSearch.toLowerCase())
  );

  return (
    <div className="call-screen">
      <div className={"call-bg"+(isVideo?" video":"")} style={{ background: isVideo?undefined:avatarColor(call.name) }}>
        {isVideo && !isGroup &&
          <video ref={videoRef} className="call-video-full" autoPlay playsInline muted
            style={{ transform: facingMode==="user"?"scaleX(-1)":"none" }}/>}
      </div>

      <div className="call-top">
        <div className="call-name">
          {isGroup ? `Групповой ${call.kind==="video"?"видеозвонок":"звонок"}` : call.name}
        </div>
        <div className="call-status">
          {state==="calling" ? (call.kind==="video"?"Видеовызов…":"Вызов…") : dur}
          {isGroup && state==="active" && ` · ${participants.filter(p=>p.joined).length+1} участн.`}
        </div>
        {streamError && <div className="call-hint" style={{color:"var(--danger)"}}>{streamError}</div>}
      </div>

      {/* Сетка участников */}
      {isGroup ? (
        <div className="call-grid-wrap">
          <div className={"call-grid call-grid-"+Math.min(participants.length+1, 6)}>
            {/* Мой тайл */}
            <div className="call-tile me">
              {isVideo ? (
                <video ref={videoRef} className="call-tile-video" autoPlay playsInline muted
                  style={{ transform: facingMode==="user"?"scaleX(-1)":"none" }}/>
              ) : (
                <div className="call-tile-av" style={{background:avatarColor("Вы")}}>Вы</div>
              )}
              <div className="call-tile-name">Вы {muted && <MicOff size={12}/>}</div>
            </div>
            {/* Участники */}
            {participants.map(p=>(
              <div key={p.name} className={"call-tile"+(p.joined?"":" joining")}>
                <div className="call-tile-av" style={{background:avatarColor(p.name)}}>
                  {initials(p.name)}
                </div>
                {!p.joined && <div className="call-tile-ring">Вызов…</div>}
                <div className="call-tile-name">
                  {p.name.split(" ")[0]} {p.muted && <MicOff size={12}/>}
                </div>
                <button className="call-tile-remove" onClick={()=>removePerson(p.name)}
                  title="Удалить из звонка"><X size={14}/></button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        !isVideo &&
        <div className="call-avatar-wrap">
          <div className={"call-avatar"+(state==="calling"?" pulsing":"")} style={{ background:avatarColor(call.name) }}>
            {initials(call.name)}
          </div>
        </div>
      )}

      {/* Кнопка добавить участника — плавающая */}
      {state==="active" && !addOpen &&
        <button className="call-add-fab" onClick={()=>setAddOpen(true)} title="Добавить участника">
          <UserPlus size={22}/>
        </button>}

      {/* Панель добавления участника */}
      {addOpen &&
        <div className="call-add-panel">
          <div className="call-add-head">
            <span className="call-add-title">Добавить в звонок</span>
            <button className="call-add-close" onClick={()=>{setAddOpen(false);setAddSearch("");}}>
              <X size={22}/></button>
          </div>
          <div className="call-add-search">
            <Search size={16}/>
            <input value={addSearch} onChange={e=>setAddSearch(e.target.value)}
              placeholder="Поиск контактов" autoFocus/>
          </div>
          <div className="call-add-list">
            {inviteList.length ? inviteList.map(c=>(
              <div key={c.name} className="call-add-row" onClick={()=>addPerson(c.name)}>
                <div className="call-add-av" style={{background:avatarColor(c.name)}}>
                  {initials(c.name)}
                </div>
                <div className="call-add-info">
                  <div className="call-add-name">{c.name}</div>
                  <div className="call-add-sub">{c.online?"в сети":"не в сети"}</div>
                </div>
                <div className="call-add-action">
                  <Phone size={16}/>
                </div>
              </div>
            )) : (
              <div className="call-add-empty">Нет доступных контактов</div>
            )}
          </div>
        </div>}

      <div className="call-controls">
        <button className={"call-btn"+(muted?" on":"")} onClick={()=>setMuted(m=>!m)}>
          {muted?<MicOff size={24}/>:<Mic size={24}/>}<span>{muted?"Вкл. звук":"Микрофон"}</span></button>
        {call.kind==="video" &&
          <button className={"call-btn"+(videoOff?" on":"")} onClick={()=>setVideoOff(v=>!v)}>
            {videoOff?<VideoOff size={24}/>:<Video size={24}/>}<span>Камера</span></button>}
        {call.kind==="video" && !videoOff &&
          <button className="call-btn" onClick={flipCamera}>
            <SwitchCamera size={24}/><span>Повернуть</span></button>}
        <button className={"call-btn"+(speaker?" on":"")} onClick={()=>setSpeaker(s=>!s)}>
          <Volume2 size={24}/><span>Динамик</span></button>
        <button className="call-btn add-btn" onClick={()=>setAddOpen(true)}>
          <UserPlus size={22}/><span>Добавить</span></button>
        <button className="call-btn end" onClick={handleEnd}>
          <PhoneOff size={26}/><span>Завершить</span></button>
      </div>
    </div>
  );
}
