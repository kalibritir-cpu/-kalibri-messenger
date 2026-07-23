// Начальное демо-состояние приложения
import { avatarColor, uid } from "../utils/helpers";

export const seedState = () => ({
  me:{ name:"Ник Иванов", handle:"nik_ivanov", phone:"+7 999 123-45-67", bio:"На связи через Калибри",
       emoji:"", avatarColor:null, photo:null, birthday:"", lastSeen:null, role:"owner",
       point:{ id:"pt-demo-1", name:"Шаблон", address:"ул. Профсоюзов, 11", online:true } },
  settings:{ theme:"light", notifications:true, sounds:true, readReceipts:true, textScale:1, wallpaper:null },

  // Точки сети — динамический список, создаётся администраторами
  points:[
    { id:"pt-demo-1", name:"Шаблон", address:"Шаблон точки", timezone:"МСК", created:"01.06", isTemplate:true },
  ],

  pointGroupTemplate: {
    name:"Шаблон точки",
    topics:[
      { emoji:"#️⃣", color:"#5b8def", name:"ОБЪЯВЛЕНИЯ", tag:"pdd", description:"Важные объявления и информация для всех сотрудников точки" },
      { emoji:"💬", color:"#42c9b0", name:"РАБОЧАЯ", tag:"new", description:"Рабочее общение, вопросы по текущей смене" },
      { emoji:"💸", color:"#5b8def", name:"КАССА", tag:"new", description:"Инкассация, размен, финансовые вопросы" },
      { emoji:"🏆", color:"#f0b429", name:"ВЫДАЧА ПРИЗОВ", tag:"new", description:"Фиксация выдачи призов клиентам" },
      { emoji:"📣", color:"#ef6ba8", name:"ТАЙМ-МЕНЕДЖМЕНТ", tag:"group",  requireReaction:true, description:"Автоматические задания по графику. Обязательна реакция" },
      { emoji:"📅", color:"#a878f0", name:"ГРАФИК", tag:"group", description:"Рабочие графики и распределение смен" },
      { emoji:"🤖", color:"#6ec9cb", name:"МАСТЕР", tag:"new", description:"Техническое обслуживание аттракционов" },
      { emoji:"📚", color:"#5b8def", name:"ДОКУМЕНТЫ", tag:"group", description:"Регламенты, инструкции, обучающие материалы" },
    ],
    settings: {
      openEnabled:true, openDeadline:"10:03", openMaxLate:"10", openAfterExpire:["remind"],
      closeEnabled:true, closeStart:"22:00", closeDeadline:"22:10", closeMaxLate:"10", closeAfterExpire:["remind"],
      closeRemind5:true, closeRemind10:true, closeRemind15:false,
      breaks:[
        { name:"Обеденный перерыв", enabled:true, start:"13:00", end:"14:00", duration:"30",
          maxPostpone:"20", maxPostponeCount:"2",
          reasons:["Обслуживаю клиента","На отделе очередь","Нельзя оставить отдел без сотрудника","Выполняется длительная игра"],
          confirmReturn:true, remindBefore:["10","5","2"], remindAfterEvery:true,
          noReturnNotify:"5", noReturnViolate:"10" },
        { name:"Вечерний перерыв", enabled:true, start:"18:00", end:"19:00", duration:"20",
          maxPostpone:"15", maxPostponeCount:"1",
          reasons:["Обслуживаю клиента","На отделе очередь"],
          confirmReturn:true, remindBefore:["5","2"], remindAfterEvery:true,
          noReturnNotify:"5", noReturnViolate:"10" },
      ],
      attractEnabled:true, attractReportRequired:true, attractSlots:[
        { id:"as-1", start:"00:00", end:"23:59", active:true, daily:true, notifyBefore:"5", showWindow:true, playSound:true, vibrate:false, confirmStart:true },
      ],
      notifSound:true, notifVibration:true, notifRepeat:false, notifOverlay:true, notifNoClose:false,
    },
  },

  pointGroups:[
    { id:"pg-0", name:"Шаблон", chatId:"point", autoBind:false, point:"Шаблон", created:"01.06", fromTemplate:true },
    { id:"pg-1", name:"УРОКИ ОТ КАЛИБРИ", chatId:"course", autoBind:true, point:"Все точки", created:"01.06" },
    { id:"pg-2", name:"Я СТАЖЕР В КАЛИБРИ", chatId:"g-intern", autoBind:true, point:"Все точки", created:"05.07" },
    { id:"pg-3", name:"Управление", chatId:"g-mgmt", autoBind:false, point:"Все точки", created:"01.05" },
  ],

  registrationRequests:[
    { id:uid(), name:"Виктория Смирнова", phone:"+7 900 123-45-67", point:"Шаблон", time:"вчера", status:"pending" },
  ],

  // ===== Формы обращений: анкеты на странице группы =====
  // Включение/выключение форм для конкретной группы (настраивается там же, где создаются группы)
  groupForms:{
    "point": { curator:true, complaint:true, wish:true },
    "g-mgmt": { curator:true, complaint:true, wish:true },
  },
  // Поданные обращения — видны администраторам, счётчик сбоку
  formSubmissions:[
    { id:uid(), kind:"curator", chatId:"point", author:"Дарья Козлова", anon:false,
      time:"сегодня в 11:20", status:"pending",
      data:{ experience:"1–3 года", motivation:"Хочу развиваться и помогать команде",
             strengths:"Спокойно решаю конфликты, знаю все аттракционы",
             ready:"Да, готов(а) к выездам", point:"Шаблон" } },
    { id:uid(), kind:"complaint", chatId:"point", author:null, anon:true,
      time:"вчера в 18:40", status:"pending",
      data:{ target:"На руководство / куратора", subject:"Куратор точки",
             text:"Не отвечает на сообщения в рабочее время", when:"20.07",
             wantAnswer:"Да" } },
    { id:uid(), kind:"wish", chatId:"point", author:"Максим Волков", anon:false,
      time:"вчера в 09:15", status:"done",
      data:{ area:"Оборудование", text:"Заменить сетку на батуте — провисает",
             priority:"Средний" } },
  ],

  accounts:[
    { id:"acc-1", name:"Ник Иванов", handle:"nik_ivanov", phone:"+7 999 123-45-67",
      role:"owner", point:"Шаблон", status:"active", lastLogin:"22.07 в 09:00",
      created:"01.05.2026", loginCode:"4829" },
    { id:"acc-2", name:"Елена Морозова", handle:"elena_morozova", phone:"+7 900 111-22-33",
      role:"admin", point:"Шаблон", status:"active", lastLogin:"22.07 в 08:45",
      created:"01.06.2026", loginCode:"7361" },
    { id:"acc-3", name:"Анна Петрова", handle:"anna_petrova", phone:"+7 901 333-44-55",
      role:"member", point:"Шаблон", status:"active", lastLogin:"22.07 в 10:12",
      created:"05.06.2026", loginCode:"5142" },
    { id:"acc-4", name:"Дарья Козлова", handle:"darya_kozlova", phone:"+7 902 444-55-66",
      role:"member", point:"Шаблон", status:"active", lastLogin:"21.07 в 22:10",
      created:"10.06.2026", loginCode:"8903" },
    { id:"acc-5", name:"Максим Волков", handle:"max_volkov", phone:"+7 902 555-66-77",
      role:"member", point:"Шаблон", status:"active", lastLogin:"22.07 в 15:20",
      created:"12.06.2026", loginCode:"2476" },
    { id:"acc-6", name:"Алина Сафина", handle:"alina_safina", phone:"+7 903 666-77-88",
      role:"member", point:"Шаблон", status:"frozen", lastLogin:"18.07 в 11:00",
      created:"01.07.2026", loginCode:"6735", frozenReason:"Стажировка завершена" },
    { id:"acc-7", name:"Иван Петухов", handle:"ivan_p", phone:"+7 904 777-88-99",
      role:"member", point:"Шаблон", status:"archived", lastLogin:"10.06 в 14:00",
      created:"01.03.2026", loginCode:"1298", archivedReason:"Уволен" },
  ],

  stories:[
    { id:"s1", name:"Анна", seen:false, text:"☀️ Смена началась!" },
    { id:"s2", name:"Дарья", seen:false, text:"🎯 Рекорд продаж!" },
    { id:"s3", name:"Алина", seen:true, text:"🧸 Новые игрушки" },
    { id:"s4", name:"Максим", seen:true, text:"🎮 Колесо крутится" },
  ],

  contacts:[
    { name:"Анна Петрова", handle:"anna_petrova", online:true },
    { name:"Дарья Козлова", handle:"darya_kozlova", online:false, lastSeen:"сегодня в 14:20" },
    { name:"Максим Волков", handle:"max_volkov", online:true },
    { name:"Алина Сафина", handle:"alina_safina", online:false, lastSeen:"вчера в 22:10" },
    { name:"Елена Морозова", handle:"elena_morozova", online:true },
  ],

  calls:[
    { id:uid(), name:"Елена Морозова", dir:"out", missed:false, kind:"audio", time:"14:32", date:"Сегодня", dur:"03:12" },
    { id:uid(), name:"Анна Петрова", dir:"in", missed:false, kind:"video", time:"11:15", date:"Сегодня", dur:"01:47" },
    { id:uid(), name:"Дарья Козлова", dir:"in", missed:true, kind:"audio", time:"09:50", date:"Вчера", dur:null },
  ],

  chats:[
    /* ===== Личные чаты ===== */
    { id:"c1", type:"personal", name:"Елена Морозова", phone:"+7 900 111-22-33", online:true, pinned:true, muted:false, unread:0,
      msgs:[
        {id:uid(),day:"Сегодня",t:"Доброе утро! Отчёт за вчера отправила",out:false,time:"09:05",status:"read"},
        {id:uid(),t:"Спасибо, посмотрю 👍",out:true,time:"09:07",status:"read"},
      ] },
    { id:"c4", type:"personal", name:"Анна Петрова", phone:"+7 901 333-44-55", online:true, muted:false, unread:0,
      msgs:[
        {id:uid(),day:"Сегодня",t:"Можешь подменить Дарью в пятницу?",out:false,time:"12:10",status:"read"},
        {id:uid(),t:"Да, без проблем",out:true,time:"12:12",status:"read"},
      ] },
    { id:"c6", type:"personal", name:"Максим Волков", phone:"+7 902 555-66-77", online:true, muted:false, unread:1,
      msgs:[
        {id:uid(),day:"Сегодня",t:"Колесо починил, работает нормально",out:false,time:"15:20",status:"delivered"},
      ] },
    { id:"c5", type:"personal", name:"Избранное", saved:true, muted:false, unread:0,
      msgs:[
        {id:uid(),t:"Заказать размен на понедельник",out:true,time:"08:00",status:"read"},
      ] },

    /* ===== Точка с темами ===== */
    { id:"point", type:"point", name:"Шаблон", subtitle:"группа",
      verified:false, muted:false, unread:12,
      description:"Шаблон точки — все настройки, темы и стандарты применяются при создании новых точек.",
      roster:[
        { name:"Елена Морозова", handle:"elena_morozova", role:"owner", online:true, tag:"Куратор" },
        { name:"Ник Иванов", handle:"nik_ivanov", role:"admin", online:true, isMe:true, tag:"Менеджер" },
        { name:"Анна Петрова", handle:"anna_petrova", role:"admin", online:true, tag:"Старший продавец" },
        { name:"Дарья Козлова", handle:"darya_kozlova", role:"member", online:false, tag:"Продавец" },
        { name:"Максим Волков", handle:"max_volkov", role:"member", online:true, tag:"Мастер" },
        { name:"Алина Сафина", handle:"alina_safina", role:"member", online:false, tag:"Стажёр" },
      ],
      topics:[
        { id:"tp-ann", emoji:"#️⃣", color:"#5b8def", name:"ОБЪЯВЛЕНИЯ", sender:"Ник Иванов",
          preview:"📢 График работы на следующую неделю…", time:"09:30", status:"read", pinned:true, tag:"pdd",
          description:"Важные объявления и информация для всех сотрудников точки" },
        { id:"tp-work", emoji:"💬", color:"#42c9b0", name:"РАБОЧАЯ", sender:"Анна Петрова",
          preview:"@Все сотрудники смены Аттракцион «Лук» готов к работе", time:"10:45", unread:3, mention:true, tag:"new",
          description:"Рабочее общение, вопросы по текущей смене" },
        { id:"tp-cash", emoji:"💸", color:"#5b8def", name:"КАССА", sender:"Дарья Козлова",
          preview:"Инкассация выполнена", time:"22:15", unread:1, tag:"new",
          description:"Инкассация, размен, финансовые вопросы" },
        { id:"tp-prize", emoji:"🏆", color:"#f0b429", name:"ВЫДАЧА ПРИЗОВ", sender:"Анна Петрова",
          preview:"🎁 Выдача — Колесо фортуны", time:"16:30", unread:5, tag:"new",
          description:"Фиксация выдачи призов клиентам" },
        { id:"tp-time", emoji:"📣", color:"#ef6ba8", name:"ТАЙМ-МЕНЕДЖМЕНТ", sender:"Елена Морозова",
          preview:"Привлечение 14:00 — выполнено ✅", time:"14:15", unread:2, tag:"group",
          requireReaction:true,
          description:"Автоматические задания по графику. Обязательна реакция",
          msgs:[
            {id:uid(),t:"📣 Время привлечения! Проведите обход зоны и привлеките гостей.",out:false,sender:"Куратор точки",time:"10:00",status:"read",auto:true},
            {id:uid(),t:"Выполнено ✅ Привлекли 4 гостя",out:false,sender:"Анна Петрова",time:"10:12",status:"read"},
            {id:uid(),t:"👍 Отлично!",out:true,sender:"Ник Иванов",time:"10:15",status:"read"},
            {id:uid(),t:"📣 Привлечение 14:00 — выйдите в зону и привлеките гостей!",out:false,sender:"Куратор точки",time:"14:00",status:"read",auto:true,needReaction:true},
            {id:uid(),t:"Привлечение 14:00 — выполнено ✅",out:false,sender:"Елена Морозова",time:"14:15",status:"read"},
          ]},
        { id:"tp-sched", emoji:"📅", color:"#a878f0", name:"ГРАФИК", sender:"Ник Иванов",
          preview:"График на 21–27 июля утверждён", time:"18:00", tag:"group",
          msgs:[
            {id:uid(),day:"Вчера",t:"📅 Коллеги, график на 21–27 июля утверждён. Проверьте свои смены!",out:true,sender:"Ник Иванов",time:"18:00",status:"read"},
            {id:uid(),t:"Спасибо! Всё ок 👍",out:false,sender:"Анна Петрова",time:"18:10",status:"read"},
            {id:uid(),t:"Можно поменяться сменами 23 и 25?",out:false,sender:"Дарья Козлова",time:"18:15",status:"read"},
            {id:uid(),t:"Да, давай оформим через предложение смены",out:true,sender:"Ник Иванов",time:"18:20",status:"read"},
          ]},
        { id:"tp-master", emoji:"🤖", color:"#6ec9cb", name:"МАСТЕР", sender:"Максим Волков",
          preview:"Колесо починено", time:"15:10", unread:1, tag:"new" },
        { id:"tp-docs", emoji:"📚", color:"#5b8def", name:"ДОКУМЕНТЫ", sender:"Елена Морозова",
          preview:"Новый регламент выдачи призов", time:"10.07", tag:"group" },
      ] },

    /* ===== Группа-курс ===== */
    { id:"course", type:"groups", name:"УРОКИ ОТ КАЛИБРИ", verified:true, members:248, muted:false, unread:0,
      description:"Обучающая группа сети «Калибри». Уроки, практика, задания и общение.",
      roster:[
        { name:"Куратор", handle:"curator", role:"owner", online:true },
        { name:"Ник Иванов", handle:"nik_ivanov", role:"admin", online:true, isMe:true, tag:"Менеджер" },
        { name:"Анна Петрова", handle:"anna_petrova", role:"member", online:true },
        { name:"Дарья Козлова", handle:"darya_kozlova", role:"member", online:false },
        { name:"Алина Сафина", handle:"alina_safina", role:"member", online:false, tag:"Стажёр" },
      ],
      topics:[
        { id:"tp-c-ann", emoji:"#️⃣", color:"#5b8def", name:"Объявления",
          sender:"Куратор", preview:"Новый урок по работе с аттракционами", time:"10:00", status:"read", pinned:true,
          msgs:[
            {id:uid(),day:"Сегодня",out:false,sender:"Куратор",t:"📢 @Все сотрудники Новый урок по работе с аттракционами доступен в разделе «Теория». Обязательно к изучению до пятницы!",time:"10:00",status:"read",
              comments:[
                {sender:"Анна Петрова",text:"Спасибо! Уже прохожу 👍",time:"10:15",out:false},
                {sender:"Алина Сафина",text:"А где найти раздел «Теория»?",time:"10:20",out:false},
                {sender:"Ник Иванов",text:"Алина, в главном меню курса → Теория",time:"10:22",out:true},
              ]},
          ]},
        { id:"tp-c-chat", emoji:"💬", color:"#42c9b0", name:"Поболтаем?",
          sender:"Алина Сафина", preview:"Спасибо за помощь на смене!", time:"18:40", status:"read",
          msgs:[
            {id:uid(),day:"Сегодня",out:false,sender:"Алина Сафина",t:"Всем привет! Спасибо за помощь на смене! 🙏",time:"18:40",status:"read"},
          ]},
        { id:"tp-c-theory", emoji:"📘", color:"#a878f0", name:"Теория",
          sender:"Куратор", preview:"📘 Урок: основы привлечения клиентов", time:"10:00", status:"read",
          msgs:[
            {id:uid(),day:"Сегодня",out:false,sender:"Куратор",t:"📘 Урок: основы привлечения клиентов. Разбираем 5 техник, которые увеличивают конверсию.",time:"10:00",status:"read",
              comments:[
                {sender:"Дарья Козлова",text:"Очень полезный урок! Особенно про контакт с клиентом",time:"11:30",out:false},
                {sender:"Ник Иванов",text:"Да, техника «зеркало» отлично работает",time:"11:45",out:true},
              ]},
          ]},
        { id:"tp-c-practice", emoji:"💻", color:"#f0b429", name:"Практика",
          sender:"Куратор", preview:"Разбор успешной смены Анны", time:"11:00", status:"read",
          msgs:[
            {id:uid(),day:"Вчера",out:false,sender:"Куратор",t:"💻 Разбор успешной смены Анны Петровой: 47 игр за день, конверсия 68%. Что она делала по-другому?",time:"11:00",status:"read"},
          ]},
        { id:"tp-c-tasks", emoji:"📝", color:"#ef6ba8", name:"Задания",
          sender:"Куратор", preview:"Задание: провести 10 привлечений за смену", time:"12:00", status:"read",
          msgs:[
            {id:uid(),day:"Вчера",out:false,sender:"Куратор",t:"📝 Задание: провести минимум 10 привлечений за смену и записать результаты. Дедлайн — пятница.",time:"12:00",status:"read"},
          ]},
      ],
      msgs:[] },

    /* ===== Стажёры ===== */
    { id:"g-intern", type:"groups", name:"Я СТАЖЕР В КАЛИБРИ", members:5, muted:false, unread:0,
      description:"Группа для новых сотрудников. Правила, графики, FAQ.",
      roster:[
        { name:"Куратор", handle:"curator", role:"owner", online:true },
        { name:"Ник Иванов", handle:"nik_ivanov", role:"admin", online:true, isMe:true, tag:"Наставник" },
        { name:"Алина Сафина", handle:"alina_safina", role:"member", online:false, tag:"Стажёр" },
      ],
      topics:[
        { id:"tp-int-rules", emoji:"📋", color:"#5b8def", name:"Правила",
          sender:"Куратор", preview:"1. Приходить за 15 минут до начала…", time:"09:00", status:"read",
          msgs:[
            {id:uid(),t:"1. Приходить за 15 минут до начала смены\n2. Форма одежды — чистая, опрятная\n3. Телефон — только в перерыв\n4. Все отчёты отправлять через шаблоны в мессенджере",out:false,sender:"Куратор",time:"09:00",status:"read"},
          ]},
        { id:"tp-int-faq", emoji:"❓", color:"#42c9b0", name:"FAQ",
          sender:"Куратор", preview:"Как отправить фотоотчёт? → Через «+»…", time:"09:10", status:"read",
          msgs:[
            {id:uid(),t:"Как отправить фотоотчёт? → Нажмите «+» в чате → Шаблоны → выберите нужный шаблон",out:false,sender:"Куратор",time:"09:10",status:"read"},
          ]},
      ],
      msgs:[
        {id:uid(),t:"@Все сотрудники Добро пожаловать! Здесь всё для первых дней работы.",out:false,sender:"Куратор",time:"09:00",status:"read",
          comments:[
            {sender:"Алина Сафина",text:"Спасибо! Очень удобно 🙌",time:"09:15",out:false},
          ]},
      ] },

    /* ===== Управление ===== */
    { id:"g-mgmt", type:"point", name:"Управление", subtitle:"только кураторы",
      verified:false, muted:false, unread:2,
      description:"Рабочая зона для кураторов и администраторов сети «Калибри».\nПривлечения, контроль, проблемы, график.",
      roster:[
        { name:"Элизабет", handle:"elizabet", role:"owner", online:true, isMe:false, tag:"Директор" },
        { name:"Ник Иванов", handle:"nik_ivanov", role:"admin", online:true, isMe:true, tag:"Менеджер", rights:{del:true,ban:true,invite:true,pin:true,promote:true} },
        { name:"Елена Морозова", handle:"elena_morozova", role:"admin", online:true, tag:"Куратор", rights:{del:true,ban:true,invite:true,pin:true,promote:false} },
        { name:"Куратор", handle:"curator", role:"admin", online:true, tag:"Куратор сети", rights:{del:true,ban:false,invite:true,pin:true,promote:false} },
      ],
      topics:[
        { id:"tp-mgmt-work", emoji:"💬", color:"#42c9b0", name:"Рабочая",
          sender:"Элизабет", preview:"Все точки открыты, день начался", time:"09:15", unread:0,
          msgs:[
            {id:uid(),day:"Сегодня",t:"Доброе утро! Все точки открыты вовремя",out:false,sender:"Элизабет",time:"09:05",status:"read"},
            {id:uid(),t:"Сургут — готовы, открытие в 10:00",out:false,sender:"Елена Морозова",time:"09:08",status:"read"},
            {id:uid(),t:"Все на месте, начинаем 💪",out:true,time:"09:10",status:"read"},
            {id:uid(),t:"Все точки открыты, день начался",out:false,sender:"Элизабет",time:"09:15",status:"read"},
          ]},
        { id:"tp-mgmt-attract", emoji:"🎯", color:"#a878f0", name:"Привлечение",
          sender:"Елена Морозова", preview:"Привлечение 14:00 — 5 клиентов ✅", time:"14:15", status:"read",
          msgs:[
            {id:uid(),day:"Сегодня",t:"Сургут: привлечение 13:50–14:00 — начато вовремя ✅",out:false,sender:"Елена Морозова",time:"14:00",status:"read"},
            {id:uid(),t:"Привлечение 14:00–14:15 — 5 клиентов ✅",out:false,sender:"Елена Морозова",time:"14:15",status:"read"},
            {id:uid(),t:"Отличный результат!",out:true,time:"14:20",status:"read"},
          ]},
        { id:"tp-mgmt-violations", emoji:"⚠️", color:"#f0616d", name:"Нарушения",
          sender:"Система", preview:"Опоздание на смену — Алина Сафина", time:"10:18", unread:1,
          msgs:[
            {id:uid(),day:"Сегодня",t:"🔴 Опоздание на смену на 15 минут — Алина Сафина",out:false,sender:"Система",time:"10:18",status:"delivered"},
          ]},
        { id:"tp-mgmt-ctrl", emoji:"📊", color:"#5b8def", name:"Контроль",
          sender:"Элизабет", preview:"Сургут +8% к плану за неделю", time:"18:00",
          msgs:[
            {id:uid(),day:"Вчера",t:"Итоги недели:\nСургут — +8% к плану\nОтличная работа команды!",out:false,sender:"Элизабет",time:"18:00",status:"read"},
            {id:uid(),t:"Спасибо, стараемся 🔥",out:true,time:"18:05",status:"read"},
          ]},
        { id:"tp-mgmt-problems", emoji:"🔧", color:"#e8a838", name:"Проблемы",
          sender:"Елена Морозова", preview:"Колесо починено, работает", time:"15:20", unread:0,
          msgs:[
            {id:uid(),day:"Сегодня",t:"problem_card",out:false,sender:"Елена Морозова",time:"15:20",status:"read",
              problemCard:{id:"prb-1",title:"Заедает механизм колеса фортуны",point:"Шаблон",
                status:"resolved",priority:"medium",created:"20.07",resolved:"21.07",
                assignee:"Максим Волков",description:"Колесо периодически заедает при вращении. Клиенты жалуются.",
                solution:"Смазан механизм, заменён подшипник. Работает штатно."}},
          ]},
        { id:"tp-mgmt-schedule", emoji:"📅", color:"#ef6ba8", name:"График кураторов",
          sender:"Элизабет", preview:"График на июль утверждён", time:"01.07", status:"read",
          msgs:[]},
      ] },

    /* ===== Канал ===== */
    { id:"c3", type:"channels", name:"Калибри Новости", verified:true, subscribers:"12.4K", muted:false, unread:0,
      msgs:[
        {id:uid(),t:"🎯 Обновление: теперь все отчёты можно отправлять через шаблоны — нажмите «+» в чате!",out:false,time:"Вчера",status:"read"},
      ] },
  ],

  sectionChats:{
    "sec-info":{ name:"Объявления · Уроки от Калибри", verified:true, subscribers:"248",
      msgs:[
        {id:uid(),t:"📅 Следующее занятие — в четверг в 18:00",out:false,time:"09:00",status:"read"},
      ] },
    "sec-theory":{ name:"Теория · Уроки от Калибри",
      msgs:[
        {id:uid(),t:"📘 Урок: техники привлечения клиентов на аттракцион",out:false,sender:"Куратор",time:"10:00",status:"read"},
      ] },
    "sec-practice":{ name:"Практика · Уроки от Калибри",
      msgs:[
        {id:uid(),t:"💻 Разбор: как увеличить конверсию привлечений",out:false,sender:"Куратор",time:"11:00",status:"read"},
      ] },
    "sec-tasks":{ name:"Задания · Уроки от Калибри",
      msgs:[
        {id:uid(),t:"📝 Задание: провести 10 привлечений за смену",out:false,sender:"Куратор",time:"12:00",status:"read"},
      ] },
  },

  photoReportSettings: {
    "point": {
      openEnabled:true, openDeadline:"10:03", openMaxLate:"10", openAfterExpire:["remind"],
      closeEnabled:true, closeStart:"22:00", closeDeadline:"22:10", closeMaxLate:"10", closeAfterExpire:["remind"],
      closeRemind5:true, closeRemind10:true, closeRemind15:false,
      breaks:[
        { name:"Обеденный перерыв", enabled:true, start:"13:00", end:"14:00", duration:"30",
          maxPostpone:"20", maxPostponeCount:"2",
          reasons:["Обслуживаю клиента","На отделе очередь","Нельзя оставить отдел без сотрудника","Выполняется длительная игра"],
          confirmReturn:true, remindBefore:["10","5","2"], remindAfterEvery:true,
          noReturnNotify:"5", noReturnViolate:"10" },
        { name:"Вечерний перерыв", enabled:true, start:"18:00", end:"19:00", duration:"20",
          maxPostpone:"15", maxPostponeCount:"1",
          reasons:["Обслуживаю клиента","На отделе очередь"],
          confirmReturn:true, remindBefore:["5","2"], remindAfterEvery:true,
          noReturnNotify:"5", noReturnViolate:"10" },
      ],
      attractEnabled:true, attractReportRequired:true, attractSlots:[
        { id:"as-1", start:"00:00", end:"23:59", active:true, daily:true, notifyBefore:"5", showWindow:true, playSound:true, vibrate:false, confirmStart:true },
      ],
      notifSound:true, notifVibration:true, notifRepeat:false, notifOverlay:true, notifNoClose:false,
    },
  },

  photoReportOpenChecklist:[
    { id:"pr-1", label:"Время на планшете до 10:00 / отдел открыт до 10:00" },
    { id:"pr-2", label:"Внешний вид сотрудника в порядке" },
    { id:"pr-3", label:"Бейджик на сотруднике в надлежащем состоянии" },
    { id:"pr-4", label:"Зона чистая и готова к работе" },
    { id:"pr-5", label:"Игрушки аккуратно развешаны" },
    { id:"pr-6", label:"Брелки пополнены" },
    { id:"pr-7", label:"Аттракционы включены и готовы к работе" },
    { id:"pr-8", label:"Зарядное устройство подключено, режим работы виден" },
    { id:"pr-9", label:"Размен купюр подготовлен" },
  ],
  photoReportCloseChecklist:[
    { id:"pc-1", label:"Фото внутри стола приложено" },
    { id:"pc-2", label:"Фото пола приложено" },
    { id:"pc-3", label:"Фото разряженных магазинов приложено" },
    { id:"pc-4", label:"Проверены выдачи призов на правильность" },
    { id:"pc-5", label:"Призы и рабочая зона приведены в порядок" },
    { id:"pc-6", label:"Мини-отчёт подготовлен" },
    { id:"pc-7", label:"Отчёт о закрытии смены приложен скрином" },
    { id:"pc-8", label:"Сверка итогов выполнена" },
    { id:"pc-9", label:"Перевод выполнен" },
    { id:"pc-10", label:"Выключенные рубильники сфотографированы" },
  ],

  photoReports:[
    { id:"rpt-1", pointId:"point", pointName:"Шаблон",
      sender:"Анна Петрова", curatorName:"Елена Морозова",
      date:"Сегодня", time:"09:52", late:false,
      reportType:"open", status:"accepted",
      items:[
        { checkId:"pr-1", label:"Время на планшете до 10:00 / отдел открыт до 10:00", photo:"https://placehold.co/600x400/25d10a/fff?text=Планшет", status:"ok" },
        { checkId:"pr-2", label:"Внешний вид сотрудника в порядке", photo:"https://placehold.co/600x400/5b8def/fff?text=Внешний+вид", status:"ok" },
        { checkId:"pr-3", label:"Бейджик на сотруднике в надлежащем состоянии", photo:"https://placehold.co/600x400/f0b429/fff?text=Бейджик", status:"ok" },
        { checkId:"pr-4", label:"Зона чистая и готова к работе", photo:"https://placehold.co/600x400/a878f0/fff?text=Зона", status:"ok" },
        { checkId:"pr-5", label:"Игрушки аккуратно развешаны", photo:"https://placehold.co/600x400/ef6ba8/fff?text=Игрушки", status:"ok" },
        { checkId:"pr-6", label:"Брелки пополнены", photo:"https://placehold.co/600x400/42c9b0/fff?text=Брелки", status:"ok" },
        { checkId:"pr-7", label:"Аттракционы включены и готовы к работе", photo:"https://placehold.co/600x400/7c5cbf/fff?text=Аттракционы", status:"ok" },
        { checkId:"pr-8", label:"Зарядное устройство подключено, режим работы виден", photo:"https://placehold.co/600x400/3a9efd/fff?text=Зарядка", status:"ok" },
        { checkId:"pr-9", label:"Размен купюр подготовлен", photo:"https://placehold.co/600x400/e8a838/fff?text=Размен", status:"ok" },
      ] },
  ],

  breakRecords:[
    { id:"brk-1", status:"returned", pointName:"Шаблон",
      employeeName:"Анна Петрова", startTime:"13:12", returnBy:"13:42",
      actualReturn:"13:38", duration:30, lateMinutes:0,
      curator:"Елена Морозова" },
  ],

  attractionCheck: {
    point: { id:"pt-demo-1", name:"Шаблон" },
    shift: [
      { name:"Анна Петрова", role:"Старший продавец", online:true },
      { name:"Дарья Козлова", role:"Продавец", online:false },
      { name:"Максим Волков", role:"Мастер", online:true },
    ],
    plannedHour: "14:00",
    timezone: "МСК+2",
    windowStart: "13:40",
    windowEnd: "14:40",
  },

  timeManagementData: [
    { id:"tmr-1", name:"Сургут", total:12, reacted:9, missed:3,
      avgReactionTime:"4 мин", worstPeriod:"14:00–15:00",
      periods:[
        { period:"10:00", employee:"Анна Петрова", status:"ok", reactedAt:"10:02" },
        { period:"10:00", employee:"Дарья Козлова", status:"ok", reactedAt:"10:05" },
        { period:"11:00", employee:"Анна Петрова", status:"ok", reactedAt:"11:01" },
        { period:"11:00", employee:"Максим Волков", status:"late", reactedAt:"11:14", delay:"14" },
        { period:"13:00", employee:"Анна Петрова", status:"ok", reactedAt:"13:03" },
        { period:"13:00", employee:"Дарья Козлова", status:"ok", reactedAt:"13:02" },
        { period:"14:00", employee:"Анна Петрова", status:"ok", reactedAt:"14:04" },
        { period:"14:00", employee:"Дарья Козлова", status:"missed", reactedAt:null },
        { period:"14:00", employee:"Максим Волков", status:"missed", reactedAt:null },
        { period:"18:00", employee:"Анна Петрова", status:"ok", reactedAt:"18:01" },
        { period:"18:00", employee:"Дарья Козлова", status:"ok", reactedAt:"18:06" },
        { period:"18:00", employee:"Максим Волков", status:"missed", reactedAt:null },
      ]},
    { id:"tmr-2", name:"Новосибирск", total:8, reacted:7, missed:1,
      avgReactionTime:"3 мин", worstPeriod:null,
      periods:[
        { period:"10:00", employee:"Ирина Белова", status:"ok", reactedAt:"10:01" },
        { period:"10:00", employee:"Олег Сидоров", status:"ok", reactedAt:"10:03" },
        { period:"13:00", employee:"Ирина Белова", status:"ok", reactedAt:"13:02" },
        { period:"13:00", employee:"Олег Сидоров", status:"ok", reactedAt:"13:01" },
        { period:"14:00", employee:"Ирина Белова", status:"ok", reactedAt:"14:05" },
        { period:"14:00", employee:"Олег Сидоров", status:"late", reactedAt:"14:18", delay:"18" },
        { period:"18:00", employee:"Ирина Белова", status:"ok", reactedAt:"18:02" },
        { period:"18:00", employee:"Олег Сидоров", status:"missed", reactedAt:null },
      ]},
    { id:"tmr-3", name:"Тюмень", total:6, reacted:6, missed:0,
      avgReactionTime:"2 мин", worstPeriod:null,
      periods:[
        { period:"10:00", employee:"Мария Кузнецова", status:"ok", reactedAt:"10:01" },
        { period:"13:00", employee:"Мария Кузнецова", status:"ok", reactedAt:"13:01" },
        { period:"14:00", employee:"Мария Кузнецова", status:"ok", reactedAt:"14:02" },
        { period:"10:00", employee:"Денис Попов", status:"ok", reactedAt:"10:03" },
        { period:"13:00", employee:"Денис Попов", status:"ok", reactedAt:"13:04" },
        { period:"14:00", employee:"Денис Попов", status:"ok", reactedAt:"14:01" },
      ]},
  ],

  // Тайм-менеджмент: настройки автосообщений по темам
  topicTimeMgmt: {
    "tp-ann": {
      enabled: true,
      rules: [
        { id:"tm-1", name:"Утреннее приветствие", message:"☀️ Доброе утро! Хорошего рабочего дня!", time:"09:00", days:[1,2,3,4,5], enabled:true },
        { id:"tm-2", name:"Напоминание о закрытии", message:"🔒 Не забудьте закрыть кассу и отправить фотоотчёт!", time:"21:45", days:[1,2,3,4,5,6,0], enabled:true },
      ],
    },
    "tp-time": {
      enabled: true,
      rules: [
        { id:"tm-3", name:"Привлечение 10:00", message:"📣 Время привлечения! Проведите обход зоны и привлеките гостей.", time:"10:00", days:[1,2,3,4,5,6,0], enabled:true },
        { id:"tm-4", name:"Привлечение 14:00", message:"📣 Привлечение 14:00 — выйдите в зону и привлеките гостей!", time:"14:00", days:[1,2,3,4,5,6,0], enabled:true },
        { id:"tm-5", name:"Привлечение 18:00", message:"📣 Вечернее привлечение — максимальная активность!", time:"18:00", days:[5,6,0], enabled:false },
      ],
    },
    "tp-work": {
      enabled: false,
      rules: [],
    },
  },

  curatorStandards: {
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
  },

  curatorSchedule: {
    curators: ["Елена Морозова","Куратор","Ник Иванов","Элизабет"],
    shifts: {
      "2026-07-01":[{name:"Елена Морозова",start:"10:00",end:"22:00"}],
      "2026-07-02":[{name:"Елена Морозова",start:"10:00",end:"22:00"}],
      "2026-07-03":[{name:"Елена Морозова",start:"10:00",end:"22:00"},{name:"Куратор",start:"10:00",end:"22:00"}],
      "2026-07-04":[{name:"Куратор",start:"10:00",end:"22:00"}],
      "2026-07-05":[{name:"Куратор",start:"10:00",end:"22:00"}],
      "2026-07-06":[{name:"Елена Морозова",start:"10:00",end:"22:00"}],
      "2026-07-07":[{name:"Елена Морозова",start:"10:00",end:"22:00"},{name:"Куратор",start:"12:00",end:"20:00"}],
      "2026-07-08":[{name:"Куратор",start:"10:00",end:"22:00"}],
      "2026-07-09":[{name:"Елена Морозова",start:"10:00",end:"22:00"}],
      "2026-07-10":[{name:"Куратор",start:"10:00",end:"22:00"}],
      "2026-07-12":[{name:"Елена Морозова",start:"10:00",end:"22:00"}],
      "2026-07-14":[{name:"Куратор",start:"10:00",end:"22:00"}],
      "2026-07-16":[{name:"Куратор",start:"10:00",end:"22:00"}],
      "2026-07-18":[{name:"Елена Морозова",start:"10:00",end:"22:00"},{name:"Куратор",start:"10:00",end:"22:00"}],
      "2026-07-20":[{name:"Елена Морозова",start:"10:00",end:"22:00"}],
      "2026-07-21":[{name:"Елена Морозова",start:"10:00",end:"22:00"},{name:"Ник Иванов",start:"12:00",end:"20:00"}],
      "2026-07-23":[{name:"Ник Иванов",start:"10:00",end:"22:00"}],
      "2026-07-24":[{name:"Куратор",start:"10:00",end:"22:00"}],
      "2026-07-25":[{name:"Куратор",start:"10:00",end:"22:00"},{name:"Елена Морозова",start:"10:00",end:"22:00"}],
      "2026-07-28":[{name:"Елена Морозова",start:"10:00",end:"22:00"}],
      "2026-07-29":[{name:"Куратор",start:"10:00",end:"22:00"}],
    },
  },
});

// Иконка папки по типу

