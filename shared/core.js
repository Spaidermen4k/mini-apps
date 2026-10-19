// Общие функции для всех демо-приложений.
// Подключается обычным <script>, поэтому всё ниже доступно из app.js каждого приложения.

// ===== Подключение к Telegram =====
const tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
  tg.ready();   // сообщаем Telegram, что приложение загрузилось
  tg.expand();  // разворачиваем на весь экран
}

const $ = (id) => document.getElementById(id);

// Лёгкая вибрация (работает только внутри Telegram)
const haptic = (kind) => {
  try { tg.HapticFeedback.notificationOccurred(kind); } catch (e) {}
};

const rub = (n) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
const digits = (s) => s.replace(/\D/g, "");

// ===== Экраны и ошибки =====
function showScreen(name) {
  document.querySelectorAll("[data-screen]").forEach((s) => { s.hidden = s.dataset.screen !== name; });
  window.scrollTo(0, 0);
}

function showError(text) {
  $("error").hidden = !text;
  $("error").textContent = text;
  if (text) haptic("error");
}

// Проверка имени и телефона. Возвращает текст ошибки или пустую строку.
function checkContacts() {
  const badName = !$("name").value.trim();
  const badPhone = digits($("phone").value).length < 10;
  $("name").classList.toggle("is-bad", badName);
  $("phone").classList.toggle("is-bad", badPhone);
  if (badName) return "Укажите имя";
  if (badPhone) return "Проверьте номер телефона";
  return "";
}

// ===== Кнопки-«чипы» =====
// options: [{ value, label, disabled? }]. Возвращает { get, set }.
function chips(box, options, initial, onChange) {
  let value = initial;
  const draw = () => {
    box.replaceChildren();
    options.forEach((o) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (o.value === value ? " is-active" : "");
      btn.textContent = o.label;
      btn.disabled = !!o.disabled;
      btn.addEventListener("click", () => {
        value = o.value;
        draw();
        if (onChange) onChange(value);
      });
      box.append(btn);
    });
  };
  draw();
  return { get: () => value, set: (v) => { value = v; draw(); } };
}

// ===== Выбор даты и времени =====
// Показывает 7 ближайших дней. Часть времени «занята»: так выглядит живой календарь.
const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

const dateKey = (d) => d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

function hashStr(s) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function dateTimePicker({ daysBox, timesBox, times }) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const label = (d, i) => (i === 0 ? "Сегодня" : i === 1 ? "Завтра" : WEEKDAYS[d.getDay()] + " " + d.getDate());
  let time = null;

  // Время недоступно, если оно «занято» (считаем по дате) или уже прошло сегодня
  const isBusy = (d, t) => {
    const startHour = parseInt(t, 10);
    if (dateKey(d) === dateKey(new Date()) && startHour <= new Date().getHours()) return true;
    return hashStr(dateKey(d) + t) % 4 === 0;
  };

  // Открываемся на первом дне, где есть свободное время (поздним вечером «сегодня» уже пусто)
  const firstFreeDay = Math.max(0, days.findIndex((d) => times.some((t) => !isBusy(d, t))));
  let dayIndex = firstFreeDay;

  let timeChips;
  const drawTimes = () => {
    const d = days[dayIndex];
    if (time && isBusy(d, time)) time = null;
    timeChips = chips(timesBox, times.map((t) => ({ value: t, label: t, disabled: isBusy(d, t) })), time, (v) => { time = v; });
  };

  const drawDays = () => chips(daysBox, days.map((d, i) => ({ value: i, label: label(d, i) })), dayIndex, (i) => {
    dayIndex = i;
    drawTimes();
  });
  drawDays();
  drawTimes();

  return {
    // text: «завтра, 14:00» или null, если время не выбрано
    get: () => {
      if (!time) return null;
      const d = days[dayIndex];
      const when = dayIndex === 0 ? "сегодня" : dayIndex === 1 ? "завтра" : d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
      return when + ", " + time;
    },
    reset: () => { dayIndex = firstFreeDay; time = null; drawDays(); drawTimes(); },
  };
}

// ===== Сообщение владельцу бизнеса =====
// Данные клиента вставляются через textContent, чтобы чужой текст не превратился в код.
function ownerCard(box, { title, rows, footer }) {
  box.replaceChildren();

  const head = document.createElement("div");
  head.className = "message__head";
  const bot = document.createElement("span");
  bot.className = "message__bot";
  bot.textContent = "🤖 Lead Bot";
  const time = document.createElement("span");
  time.textContent = "сейчас";
  head.append(bot, time);

  const h = document.createElement("p");
  h.className = "message__title";
  h.textContent = title;

  const list = document.createElement("ul");
  list.className = "message__list";
  rows.forEach(([name, value]) => {
    if (!value) return;
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = name + ": ";
    li.append(span, document.createTextNode(value));
    list.append(li);
  });

  const done = document.createElement("p");
  done.className = "message__done";
  done.textContent = footer;

  box.append(head, h, list, done);
}
