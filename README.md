# Калибри — мессенджер

Корпоративный мессенджер: чаты по точкам, фотоотчёты, перерывы, анкеты, роли и права.

Приложение на React + Vite, данные — в Supabase (PostgreSQL).

---

## Быстрый старт

Нужен Node.js версии 18 или новее — скачать на [nodejs.org](https://nodejs.org).

```bash
npm install       # установить зависимости (один раз)
npm run dev       # запустить локально → http://localhost:5173
npm run build     # собрать для публикации → папка dist/
npm run preview   # посмотреть собранную версию перед публикацией
```

Ключи Supabase уже прописаны в `.env` — приложение заработает сразу после `npm install`.

---

## Публикация

### Vercel (рекомендую)

1. Загрузите проект в репозиторий GitHub
2. На [vercel.com](https://vercel.com) → Add New → Project → выберите репозиторий
3. Vercel сам определит Vite. Проверьте: Build Command `npm run build`, Output Directory `dist`
4. В разделе Environment Variables добавьте две переменные из `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

Дальше каждый push в репозиторий автоматически пересобирает и обновляет сайт.

### Netlify

То же самое: Build command `npm run build`, Publish directory `dist`, переменные окружения из `.env`.

### GitHub Pages

Требует одной правки: в `vite.config.js` замените `base: "/"` на имя репозитория:

```js
base: "/kalibri-messenger/",
```

Затем `npm run build` и опубликуйте содержимое папки `dist`.

---

## Структура

```
src/
  entry.jsx           точка входа
  App.jsx             главный компонент, состояние приложения
  styles.css          все стили (импортируется как текст)
  constants.js        роли, права на запись, обои, эмодзи
  components/         33 компонента интерфейса
  data/seedState.js   демо-данные
  utils/helpers.js    вспомогательные функции
  assets/logo.js      логотип (base64)

index.html            страница + клиент Supabase (window.KB)
vite.config.js        конфигурация сборки
.env                  ключи Supabase (в репозиторий не попадает)
```

---

## Как устроена работа с сервером

Клиент Supabase лежит в `index.html` как `window.KB` — обычный fetch, без библиотек.

```js
KB.signIn(email, password)     // вход
KB.signUp({ name, email, password, phone, position, point })
KB.me()                        // профиль текущего пользователя
KB.logout()

KB.from("messages").select("*", "chat_id=eq." + id)
KB.from("messages").insert([{ chat_id, body, author_id }])
KB.rpc("pending_users")        // вызов функции базы
```

### Роли

| Роль | Права |
|---|---|
| `owner` | всё, включая одобрение заявок |
| `curator` | видит анкеты и отчёты, проверяет их |
| `member` | свои чаты, подача отчётов и обращений |

Пока администратор не одобрит регистрацию, у пользователя статус `pending` — правила базы не отдают ему никаких данных. Это проверяется на сервере, а не в интерфейсе.

### Таблицы

`points` `profiles` `chats` `chat_members` `topics` `messages` `reactions` `message_reads` `reports` `breaks` `form_submissions` `point_forms` `point_standards` `stories` `story_views` `calls` `user_settings`

Все с включённой защитой на уровне строк (RLS).

---

## Что стоит доделать

Сейчас на сервер переведён только вход. Остальное приложение работает на локальных демо-данных из `seedState.js`. Чтобы мессенджер заработал по-настоящему, нужно связать с базой:

1. **Загрузку чатов** — `KB.from("chats").select(...)` вместо `state.chats`
2. **Сообщения** — отправка через `insert`, получение новых через Realtime-подписку
3. **Отчёты и анкеты** — сохранение в `reports` и `form_submissions`
4. **Файлы** — загрузка фото и голосовых в Supabase Storage

Realtime уже включён для таблиц `messages`, `reactions`, `chat_members`, `reports`, `form_submissions`.

---

## Возможные сложности при первой сборке

**Не находится иконка из lucide-react.** Названия могли измениться между версиями. Проверьте на [lucide.dev/icons](https://lucide.dev/icons) и поправьте импорт.

**Пустая страница после сборки.** Обычно это неверный `base` в `vite.config.js` — он должен совпадать с путём публикации.

**Вход не работает.** Проверьте, что переменные окружения проставлены на хостинге, и что в Supabase выключено подтверждение почты: Authentication → Sign In / Providers → Email → Confirm email.
