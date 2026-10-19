// Демо: онлайн-запись в салон красоты (меню из трёх входов)
const MASTERS = [
  { id: "any", name: "Любой специалист", role: "Ближайшее свободное время", icon: "✨" },
  { id: "anna", name: "Анна", role: "Стилист-парикмахер", rating: "4.9", icon: "💇‍♀️" },
  { id: "maria", name: "Мария", role: "Мастер маникюра", rating: "5.0", icon: "💅" },
  { id: "olga", name: "Ольга", role: "Бровист", rating: "4.8", icon: "👁️" },
];

const SERVICES = [
  { id: "cut", name: "Женская стрижка", price: 2500, min: 60 },
  { id: "color", name: "Окрашивание", price: 6000, min: 150 },
  { id: "style", name: "Укладка", price: 1800, min: 45 },
  { id: "mani", name: "Маникюр", price: 1800, min: 60 },
  { id: "pedi", name: "Педикюр", price: 2500, min: 75 },
  { id: "brow", name: "Коррекция бровей", price: 1200, min: 30 },
];

const TIMES = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

let master = MASTERS[0];
const picked = new Set();   // выбранные услуги
const when = dateTimePicker({ daysBox: $("days"), timesBox: $("times"), times: TIMES });

const duration = (min) => (min >= 60 ? Math.floor(min / 60) + " ч" + (min % 60 ? " " + (min % 60) + " мин" : "") : min + " мин");
const chosen = () => SERVICES.filter((s) => picked.has(s.id));
const totals = () => chosen().reduce((t, s) => ({ price: t.price + s.price, min: t.min + s.min }), { price: 0, min: 0 });

// ===== Строки главного меню =====
function setValue(id, text) {
  $(id).textContent = text || "Не выбрано";
  $(id).classList.toggle("is-set", !!text);
}

function updateMenu() {
  setValue("vMaster", master.name);
  setValue("vWhen", when.get());
  const list = chosen();
  setValue("vServices", list.length ? list.map((s) => s.name).join(", ") + " · " + rub(totals().price) : "");
}

// ===== Списки выбора =====
function pickRow({ icon, name, sub, side, active, onClick, check }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "pick" + (active ? " is-active" : "");

  const ic = document.createElement("span");
  ic.className = "pick__icon";
  ic.textContent = icon || "";

  const main = document.createElement("span");
  main.className = "pick__main";
  const n = document.createElement("span");
  n.className = "pick__name";
  n.textContent = name;
  const s = document.createElement("span");
  s.className = "pick__sub";
  s.style.display = "block";
  s.textContent = sub;
  main.append(n, s);

  btn.append(...(icon ? [ic] : []), main);

  if (side) {
    const p = document.createElement("span");
    p.className = "pick__side";
    p.textContent = side;
    btn.append(p);
  }
  if (check) {
    const c = document.createElement("span");
    c.className = "pick__check";
    c.textContent = active ? "✓" : "";
    btn.append(c);
  }
  btn.addEventListener("click", onClick);
  return btn;
}

function renderMasters() {
  const box = $("masters");
  box.replaceChildren();
  MASTERS.forEach((m) => {
    box.append(pickRow({
      icon: m.icon,
      name: m.name,
      sub: m.role + (m.rating ? " · ★ " + m.rating : ""),
      active: m.id === master.id,
      onClick: () => { master = m; renderMasters(); updateMenu(); showScreen("menu"); },
    }));
  });
}

function renderServices() {
  const box = $("services");
  box.replaceChildren();
  SERVICES.forEach((s) => {
    box.append(pickRow({
      name: s.name,
      sub: duration(s.min),
      side: rub(s.price),
      active: picked.has(s.id),
      check: true,
      onClick: () => { picked.has(s.id) ? picked.delete(s.id) : picked.add(s.id); renderServices(); updateMenu(); },
    }));
  });
  const t = totals();
  $("servicesSum").replaceChildren();
  if (picked.size) {
    const b = document.createElement("b");
    b.textContent = rub(t.price);
    $("servicesSum").append("Выбрано: " + picked.size + " · " + duration(t.min), b);
  } else {
    $("servicesSum").textContent = "Ничего не выбрано";
  }
}

// ===== Навигация =====
document.querySelectorAll("[data-go]").forEach((el) => {
  el.addEventListener("click", () => {
    if (el.dataset.go === "menu") updateMenu();
    showScreen(el.dataset.go);
  });
});

// ===== Отправка =====
$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const slot = when.get();
  const problem = !picked.size ? "Выберите услуги" : !slot ? "Выберите дату и время" : checkContacts();
  showError(problem);
  if (problem) return;

  const t = totals();
  ownerCard($("message"), {
    title: "💅 Новая запись",
    rows: [
      ["Клиент", $("name").value.trim()],
      ["Телефон", $("phone").value.trim()],
      ["Специалист", master.name],
      ["Услуги", chosen().map((s) => s.name).join(", ")],
      ["Когда", slot],
      ["Длительность", duration(t.min)],
      ["Стоимость", rub(t.price)],
    ],
    footer: "✓ Время занято в календаре · клиенту придёт напоминание за 2 часа",
  });
  haptic("success");
  showScreen("done");
});

$("again").addEventListener("click", () => {
  $("form").reset();
  master = MASTERS[0];
  picked.clear();
  when.reset();
  renderMasters();
  renderServices();
  updateMenu();
  showError("");
  showScreen("menu");
});

renderMasters();
renderServices();
updateMenu();
