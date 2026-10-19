// Демо: запись в маникюрный салон
const SERVICES = [
  { value: "classic", label: "Классический маникюр · 1 500 ₽", name: "Классический маникюр", price: 1500 },
  { value: "gel", label: "Маникюр + гель-лак · 2 200 ₽", name: "Маникюр + гель-лак", price: 2200 },
  { value: "design", label: "Дизайн · 2 700 ₽", name: "Маникюр + дизайн", price: 2700 },
  { value: "pedi", label: "Педикюр · 2 500 ₽", name: "Педикюр", price: 2500 },
];
const MASTERS = ["Любой мастер", "Анна", "Мария", "Ольга"];
const TIMES = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const service = chips($("service"), SERVICES, SERVICES[0].value);
const master = chips($("master"), MASTERS.map((m) => ({ value: m, label: m })), MASTERS[0]);
const when = dateTimePicker({ daysBox: $("days"), timesBox: $("times"), times: TIMES });

$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const chosenTime = when.get();
  const problem = !chosenTime ? "Выберите время" : checkContacts();
  showError(problem);
  if (problem) return;

  const s = SERVICES.find((x) => x.value === service.get());
  ownerCard($("message"), {
    title: "💅 Новая запись",
    rows: [
      ["Клиент", $("name").value.trim()],
      ["Телефон", $("phone").value.trim()],
      ["Услуга", s.name],
      ["Мастер", master.get()],
      ["Когда", chosenTime],
      ["Стоимость", rub(s.price)],
    ],
    footer: "✓ Время занято в календаре · клиенту придёт напоминание за 2 часа",
  });
  haptic("success");
  showScreen("done");
});

$("again").addEventListener("click", () => {
  $("form").reset();
  service.set(SERVICES[0].value);
  master.set(MASTERS[0]);
  when.reset();
  showError("");
  showScreen("form");
});
