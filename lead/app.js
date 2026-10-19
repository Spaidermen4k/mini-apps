// ===== Подключение к Telegram =====
const tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const haptic = (kind) => {
  try { tg.HapticFeedback.notificationOccurred(kind); } catch (e) {}
};

const $ = (id) => document.getElementById(id);

// ===== Выбор цели (кнопки-«чипы») =====
const GOALS = ["Купить", "Снять", "Продать"];
let goal = GOALS[0];

function renderGoals() {
  const box = $("goal");
  box.replaceChildren();
  GOALS.forEach((g) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (g === goal ? " is-active" : "");
    btn.textContent = g;
    btn.addEventListener("click", () => { goal = g; renderGoals(); });
    box.append(btn);
  });
}

// ===== Проверка формы =====
// Телефон считаем верным, если в нём не меньше 10 цифр
const digits = (s) => s.replace(/\D/g, "");

function validate() {
  const name = $("name").value.trim();
  const phone = $("phone").value.trim();
  $("name").classList.toggle("is-bad", !name);
  $("phone").classList.toggle("is-bad", digits(phone).length < 10);

  if (!name) return "Укажите имя";
  if (digits(phone).length < 10) return "Проверьте номер телефона";
  return "";
}

// ===== Сообщение владельцу =====
// Все данные клиента вставляются через textContent, чтобы чужой текст не превратился в код
function row(list, label, value) {
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.textContent = label + ": ";
  li.append(span, document.createTextNode(value));
  list.append(li);
}

function renderMessage(data) {
  const box = $("message");
  box.replaceChildren();

  const head = document.createElement("div");
  head.className = "message__head";
  const bot = document.createElement("span");
  bot.className = "message__bot";
  bot.textContent = "🤖 Lead Bot";
  const time = document.createElement("span");
  time.textContent = "сейчас";
  head.append(bot, time);

  const title = document.createElement("p");
  title.className = "message__title";
  title.textContent = "🔔 Новая заявка";

  const list = document.createElement("ul");
  list.className = "message__list";
  row(list, "Имя", data.name);
  row(list, "Телефон", data.phone);
  row(list, "Запрос", data.goal + " квартиру");
  row(list, "Бюджет", data.budget || "не указан");
  if (data.comment) row(list, "Комментарий", data.comment);
  row(list, "Источник", "мини-приложение Telegram");

  const done = document.createElement("p");
  done.className = "message__done";
  done.textContent = "✓ Добавлено в таблицу заявок";

  box.append(head, title, list, done);
}

// ===== События =====
function show(screen) {
  $("screenForm").hidden = screen !== "form";
  $("screenDone").hidden = screen !== "done";
  window.scrollTo(0, 0);
}

$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const problem = validate();
  $("error").hidden = !problem;
  $("error").textContent = problem;
  if (problem) {
    haptic("error");
    return;
  }

  renderMessage({
    name: $("name").value.trim(),
    phone: $("phone").value.trim(),
    goal,
    budget: $("budget").value,
    comment: $("comment").value.trim(),
  });
  haptic("success");
  show("done");
});

$("again").addEventListener("click", () => {
  $("form").reset();
  goal = GOALS[0];
  renderGoals();
  $("error").hidden = true;
  show("form");
});

renderGoals();
