// Демо: заказ цветов
const PRODUCTS = [
  { id: "nezh", icon: "🌸", name: "Нежность", desc: "15 пионовидных роз", price: 4900 },
  { id: "klas", icon: "🌹", name: "Классика", desc: "25 красных роз", price: 6500 },
  { id: "tulp", icon: "🌷", name: "Весенний микс", desc: "19 тюльпанов", price: 3200 },
  { id: "lavn", icon: "🪻", name: "Лаванда", desc: "Ароматный букет", price: 2400 },
  { id: "podc", icon: "🌻", name: "Подсолнухи", desc: "7 крупных цветов", price: 2900 },
  { id: "mini", icon: "💐", name: "Мини «Спасибо»", desc: "Небольшой букет", price: 1500 },
];
const TIMES = ["10:00", "12:00", "14:00", "16:00", "18:00"];
const DELIVERY_PRICE = 300;
const FREE_DELIVERY_FROM = 5000;

const qty = {};                       // id товара -> количество
PRODUCTS.forEach((p) => { qty[p.id] = 0; });

// ===== Каталог со счётчиками =====
function renderProducts() {
  const box = $("products");
  box.replaceChildren();
  PRODUCTS.forEach((p) => {
    const row = document.createElement("div");
    row.className = "product";

    const icon = document.createElement("div");
    icon.className = "product__icon";
    icon.textContent = p.icon;

    const main = document.createElement("div");
    main.className = "product__main";
    const name = document.createElement("div");
    name.className = "product__name";
    name.textContent = p.name;
    const desc = document.createElement("div");
    desc.className = "product__desc";
    desc.textContent = p.desc;
    const price = document.createElement("div");
    price.className = "product__price";
    price.textContent = rub(p.price);
    main.append(name, desc, price);

    const stepper = document.createElement("div");
    stepper.className = "stepper";
    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    const out = document.createElement("output");
    out.textContent = qty[p.id];
    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    minus.addEventListener("click", () => change(p.id, -1, out));
    plus.addEventListener("click", () => change(p.id, +1, out));
    stepper.append(minus, out, plus);

    row.append(icon, main, stepper);
    box.append(row);
  });
}

function change(id, delta, out) {
  qty[id] = Math.max(0, Math.min(20, qty[id] + delta));
  out.textContent = qty[id];
  updateTotal();
}

// ===== Итоговая сумма =====
const goods = () => PRODUCTS.reduce((s, p) => s + p.price * qty[p.id], 0);
const deliveryCost = () => (delivery.get() === "pickup" || goods() === 0 || goods() >= FREE_DELIVERY_FROM ? 0 : DELIVERY_PRICE);

function updateTotal() {
  $("sum").textContent = rub(goods() + deliveryCost());
}

const delivery = chips(
  $("delivery"),
  [
    { value: "courier", label: "Доставка · 300 ₽ (от 5 000 ₽ бесплатно)" },
    { value: "pickup", label: "Самовывоз" },
  ],
  "courier",
  (v) => {
    $("addressField").hidden = v === "pickup";
    updateTotal();
  }
);
const when = dateTimePicker({ daysBox: $("days"), timesBox: $("times"), times: TIMES });

// ===== Отправка =====
$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const chosenTime = when.get();
  const items = PRODUCTS.filter((p) => qty[p.id] > 0);

  let problem = "";
  if (!items.length) problem = "Добавьте хотя бы один букет";
  else if (delivery.get() === "courier" && !$("address").value.trim()) problem = "Укажите адрес доставки";
  else if (!chosenTime) problem = "Выберите время";
  else problem = checkContacts();

  $("address").classList.toggle("is-bad", problem === "Укажите адрес доставки");
  showError(problem);
  if (problem) return;

  const courier = delivery.get() === "courier";
  ownerCard($("message"), {
    title: "💐 Новый заказ",
    rows: [
      ["Состав", items.map((p) => p.name + " ×" + qty[p.id]).join(", ")],
      ["Сумма", rub(goods() + deliveryCost())],
      ["Получение", courier ? "доставка" + (deliveryCost() === 0 ? " (бесплатно)" : "") : "самовывоз"],
      ["Адрес", courier ? $("address").value.trim() : ""],
      ["Когда", chosenTime],
      ["Открытка", $("card").value.trim()],
      ["Клиент", $("name").value.trim()],
      ["Телефон", $("phone").value.trim()],
    ],
    footer: "✓ Заказ передан флористу · клиенту отправлено подтверждение",
  });
  haptic("success");
  showScreen("done");
});

$("again").addEventListener("click", () => {
  $("form").reset();
  PRODUCTS.forEach((p) => { qty[p.id] = 0; });
  renderProducts();
  delivery.set("courier");
  $("addressField").hidden = false;
  when.reset();
  updateTotal();
  showError("");
  showScreen("form");
});

renderProducts();
updateTotal();
