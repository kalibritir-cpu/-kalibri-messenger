// Общие константы приложения: эмодзи, обои, цвета аватаров, папки, иконки разделов
import {
  MessagesSquare,
  Users,
  Megaphone,
  User,
  BookOpen,
  Code,
  ClipboardList,
  MapPin
} from "lucide-react";

export const EMOJIS = "😀 😃 😄 😁 😆 😊 🙂 😉 😍 🥰 😘 😗 😚 🤗 🤩 🥳 😎 🤓 🧐 🤔 🤭 🫡 🙃 😇 🤠 🥲 😌 😴 🥱 😋 😛 😜 🤪 🤤 🫠 🥹 👍 👌 🤝 👏 🙌 💪 🫶 🤙 ✌️ 🤞 👋 🙏 ✍️ 🫰 🤟 🔥 ✨ ⭐ 🌟 💫 💯 ✅ ☑️ 🎯 🚀 ⚡ 💡 🏆 🥇 🎖️ 🔝 🆗 🔔 ❤️ 🧡 💛 💚 💙 💜 🤎 🤍 💗 💖 💝 💞 🎉 🎊 🎁 🎂 🍰 🥂 🍾 🎈 🪅 ☕ 🍕 🍔 🍟 🌮 🍜 🍩 🍪 🧁 🍫 🍎 🥑 🥤 🧃 📌 📎 📝 📋 📊 📈 💼 🗓️ ⏰ ⌛ 📍 🔍 💬 📞 📷 🎵 🎧 🌙 ☀️ 🌈 ⛅ ❄️ 🌸 🌺 🌻 🍀 🌊 🐦 🐱 🐶 🦊".split(" ");

export const REACTIONS = ["👍","❤️","🔥","🎉","👏","💯","✅","🙏"];

export const WALLPAPERS = [
  { id:"default", name:"По умолчанию", css:null },
  { id:"mint", name:"Мятный", css:"linear-gradient(160deg,#d9f5e3,#eef7f0)" },
  { id:"sky", name:"Небо", css:"linear-gradient(160deg,#dbeafe,#eef4ff)" },
  { id:"peach", name:"Персик", css:"linear-gradient(160deg,#ffe4d6,#fff1ea)" },
  { id:"lavender", name:"Лаванда", css:"linear-gradient(160deg,#ece4ff,#f5f1ff)" },
  { id:"sunset", name:"Закат", css:"linear-gradient(160deg,#ffd8b0,#ffc1c1 60%,#e9b7ff)" },
  { id:"ocean", name:"Океан", css:"linear-gradient(160deg,#a0e9d8,#8fd0ff 70%,#b6b6ff)" },
  { id:"forest", name:"Лес", css:"linear-gradient(160deg,#bde6c1,#7fd3a8 60%,#57b894)" },
  { id:"grape", name:"Виноград", css:"linear-gradient(160deg,#e0b3ff,#b39dff 60%,#8fa8ff)" },
  { id:"graphite", name:"Графит", css:"linear-gradient(160deg,#2a3138,#1a1f24)" },
  { id:"coral", name:"Коралл", css:"#ffd9d0" },
  { id:"lemon", name:"Лимон", css:"#fbf3c7" },
];

export const AV = ["#5b8def","#25d10a","#f4844c","#a878f0","#ef6ba8","#42c9b0","#f0b429","#6ec9cb"];

export const ROLE_LABEL = { owner:"Владелец", admin:"Администратор", member:"Участник" };

// Кто может писать в теме. Уровень = минимальная роль (иерархия: member < admin < owner)
export const WRITE_ACCESS = [
  { id:"all",    label:"Все участники",  hint:"Писать могут сотрудники, кураторы и администраторы" },
  { id:"admin",  label:"Кураторы и админы", hint:"Сотрудники читают, писать могут кураторы и администраторы" },
  { id:"owner",  label:"Только владелец",  hint:"Писать может только владелец группы" },
];

// Может ли роль писать при заданном уровне доступа
export const canWriteInTopic = (accessLevel, role) => {
  const lvl = accessLevel || "all";
  if(lvl === "all") return true;
  if(lvl === "admin") return role === "owner" || role === "admin";
  return role === "owner";
};

export const FOLDERS = [
  { id:"all", name:"Все", Icon:MessagesSquare },
  { id:"personal", name:"Личные", Icon:User },
  { id:"groups", name:"Группы", Icon:Users },
  { id:"channels", name:"Каналы", Icon:Megaphone },
];

export const SEC_ICON = { megaphone:Megaphone, book:BookOpen, code:Code, clipboard:ClipboardList, pin:MapPin };

export const SEC_COLOR = { megaphone:"#f4844c", book:"#25d10a", code:"#5b8def", clipboard:"#a878f0", pin:"#42c9b0" };

// Список точек/филиалов для выбора при регистрации
export const POINTS = [
  "Когалым | Галактика",
  "Точка «Москва-Центр»",
  "Точка «Санкт-Петербург»",
  "Точка «Екатеринбург»",
  "Точка «Казань»",
  "Другое / не знаю",
];

