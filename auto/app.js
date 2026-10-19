// Демо: запись в автосервис
const SERVICES = [
  { value: "diag", label: "Диагностика · 1 500 ₽", name: "Диагностика", price: "1 500 ₽" },
  { value: "to", label: "Плановое ТО · от 5 500 ₽", name: "Плановое ТО", price: "от 5 500 ₽" },
  { value: "oil", label: "Замена масла · от 2 500 ₽", name: "Замена масла", price: "от 2 500 ₽" },
  { value: "tyre", label: "Шиномонтаж · от 2 000 ₽", name: "Шиномонтаж", price: "от 2 000 ₽" },
  { value: "brake", label: "Тормоза · от 3 000 ₽", name: "Ремонт тормозов", price: "от 3 000 ₽" },
];
const TIMES = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

const service = chips($("service"), SERVICES, SERVICES[0].value);
const when = dateTimePicker({ daysBox: $("days"), timesBox: $("times"), times: TIMES });

$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const chosenTime = when.get();
  const noCar = !$("car").value.trim();
  $("car").classList.toggle("is-bad", noCar);

  const problem = noCar ? "Укажите марку автомобиля" : !chosenTime ? "Выберите время" : checkContacts();
  showError(problem);
  if (problem) return;

  const s = SERVICES.find((x) => x.value === service.get());
  ownerCard($("message"), {
    title: "🔧 Новая запись",
    rows: [
      ["Клиент", $("name").value.trim()],
      ["Телефон", $("phone").value.trim()],
      ["Автомобиль", $("car").value.trim()],
      ["Работы", s.name],
      ["Ориентир по цене", s.price],
      ["Когда", chosenTime],
      ["Жалоба", $("comment").value.trim()],
    ],
    footer: "✓ Пост забронирован · клиенту придёт напоминание за 2 часа",
  });
  haptic("success");
  showScreen("done");
});

$("again").addEventListener("click", () => {
  $("form").reset();
  service.set(SERVICES[0].value);
  when.reset();
  showError("");
  showScreen("form");
});
