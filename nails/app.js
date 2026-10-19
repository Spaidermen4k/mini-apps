// Демо: запись в студию маникюра и педикюра (меню из трёх входов, услуги на двух вкладках)
try { tg.setHeaderColor("#faf6f0"); tg.setBackgroundColor("#faf6f0"); } catch (e) {}
const MASTERS = [
  { id: "any", name: "Любой специалист", role: "Ближайшее свободное время", icon: "✨" },
  { id: "mani", name: "Мастер маникюра", role: "Маникюр, наращивание, дизайн", icon: "💅" },
  { id: "pedi", name: "Мастер педикюра", role: "Педикюр, обработка стоп", icon: "🦶" },
];

// [название, минут, цена]
const GROUPS = [
  {
    name: "Маникюр",
    items: [
      ["Маникюр с покрытием гель-лак", 120, 2500],
      ["Снятие + маникюр с гель-лаком", 120, 2700],
      ["Маникюр без покрытия", 60, 1500],
      ["Японский маникюр", 60, 2000],
      ["Маникюр с покрытием лаком", 70, 1800],
      ["Снятие + маникюр с покрытием лаком", 90, 2200],
      ["Маникюр с гель-лаком и укреплением", 120, 2800],
      ["Снятие + маникюр с гель-лаком и укреплением", 120, 3000],
      ["Наращивание ногтей на верхние формы", 180, 4000],
      ["Наращивание ногтей на гелевые типсы", 180, 4000],
      ["Коррекция наращенных ногтей", 120, 3000],
      ["Снятие наращенных ногтей", 30, 500],
      ["Снятие гель-лака без покрытия", 30, 400],
      ["Парафинотерапия", 30, 600],
      ["Дизайн (1 ноготь)", 10, 100],
      ["Дизайн втирка", 10, 500],
      ["Дизайн френч", 30, 500],
      ["Ремонт 1 ногтя", 10, 100],
      ["Наращивание 1 ногтя", 30, 200],
      ["Снятие лака", 5, 100],
    ],
  },
  {
    name: "Педикюр",
    items: [
      ["Педикюр (пальчики) без покрытия", 60, 1800],
      ["Педикюр (пальчики) с гель-лаком", 120, 2500],
      ["Снятие + педикюр (пальчики) с гель-лаком", 120, 2700],
      ["Педикюр без покрытия", 60, 2500],
      ["Снятие + педикюр без покрытия", 60, 2700],
      ["Педикюр с гель-лаком", 120, 2900],
      ["Снятие + педикюр с гель-лаком", 120, 3100],
      ["SMART-педикюр без покрытия", 60, 2900],
      ["SMART-педикюр с гель-лаком", 120, 3300],
      ["Снятие + SMART-педикюр с гель-лаком", 120, 3500],
      ["Сложный педикюр", 120, 3000],
      ["Сложный педикюр + гель-лак", 150, 3700],
      ["Обработка вросшего ногтя", 30, 1000],
      ["Зачистка онихолизиса", 30, 1000],
      ["Удаление стержневых мозолей", 30, 1000],
      ["Обработка натоптышей и мозолей", 30, 1500],
      ["Массаж стоп", 20, 600],
      ["Покрытие лаком", 20, 300],
      ["Укрепление", 10, 400],
      ["Дизайн", 10, 100],
    ],
  },
];

// Плоский список с уникальными номерами
const SERVICES = [];
GROUPS.forEach((g) => g.items.forEach(([name, min, price]) => {
  SERVICES.push({ id: SERVICES.length, group: g.name, name, min, price });
}));

const TIMES = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

let master = MASTERS[0];
let tab = GROUPS[0].name;   // открытая вкладка: маникюр или педикюр
const picked = new Set();
const when = dateTimePicker({ daysBox: $("days"), timesBox: $("times"), times: TIMES });

const duration = (min) => (min >= 60 ? Math.floor(min / 60) + " ч" + (min % 60 ? " " + (min % 60) + " мин" : "") : min + " мин");
const chosen = () => SERVICES.filter((s) => picked.has(s.id));
const totals = () => chosen().reduce((t, s) => ({ price: t.price + s.price, min: t.min + s.min }), { price: 0, min: 0 });

function setValue(id, text) {
  $(id).textContent = text || "Не выбрано";
  $(id).classList.toggle("is-set", !!text);
}

function updateMenu() {
  setValue("vMaster", master.name);
  setValue("vWhen", when.get());
  const list = chosen();
  const t = totals();
  setValue("vServices", list.length ? (list.length === 1 ? list[0].name : "Выбрано: " + list.length) + " · " + rub(t.price) : "");
}

function pickRow({ icon, name, sub, side, active, onClick, check }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "pick" + (active ? " is-active" : "");

  if (icon) {
    const ic = document.createElement("span");
    ic.className = "pick__icon";
    ic.textContent = icon;
    btn.append(ic);
  }

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
  btn.append(main);

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
      sub: m.role,
      active: m.id === master.id,
      onClick: () => { master = m; renderMasters(); updateMenu(); showScreen("menu"); },
    }));
  });
}

function renderTabs() {
  const box = $("tabs");
  box.replaceChildren();
  GROUPS.forEach((g) => {
    const count = SERVICES.filter((s) => s.group === g.name && picked.has(s.id)).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tab" + (g.name === tab ? " is-active" : "");
    btn.textContent = g.name + (count ? " · " + count : "");
    btn.addEventListener("click", () => { tab = g.name; renderServices(); window.scrollTo(0, 0); });
    box.append(btn);
  });
}

function renderServices() {
  renderTabs();
  const box = $("services");
  box.replaceChildren();
  SERVICES.filter((s) => s.group === tab).forEach((s) => {
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

document.querySelectorAll("[data-go]").forEach((el) => {
  el.addEventListener("click", () => {
    if (el.dataset.go === "menu") updateMenu();
    showScreen(el.dataset.go);
  });
});

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
  tab = GROUPS[0].name;
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
