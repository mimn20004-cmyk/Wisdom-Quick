const searchForm = document.querySelector("#searchForm");
const cityInput = document.querySelector("#cityInput");
const statusBox = document.querySelector("#status");
const themeToggle = document.querySelector("#themeToggle");
const themeIcon = document.querySelector("#themeIcon");

const ui = {
  cityName: document.querySelector("#cityName"),
  countryName: document.querySelector("#countryName"),
  temperatureValue: document.querySelector("#temperatureValue"),
  feelsLikeValue: document.querySelector("#feelsLikeValue"),
  windValue: document.querySelector("#windValue"),
  humidityValue: document.querySelector("#humidityValue"),
  precipitationValue: document.querySelector("#precipitationValue"),
  weatherDescription: document.querySelector("#weatherDescription"),
  weatherIcon: document.querySelector("#weatherIcon"),
  currentDate: document.querySelector("#currentDate"),
};

const weatherCodeMap = {
  0: { label: "سماء صافية", icon: "☀️" },
  1: { label: "مشمس غالباً", icon: "🌤️" },
  2: { label: "غائم جزئياً", icon: "⛅" },
  3: { label: "غائم", icon: "☁️" },
  45: { label: "ضباب", icon: "🌫️" },
  48: { label: "ضباب متجمّد", icon: "🌫️" },
  51: { label: "رذاذ خفيف", icon: "🌦️" },
  53: { label: "رذاذ متوسط", icon: "🌦️" },
  55: { label: "رذاذ كثيف", icon: "🌧️" },
  56: { label: "أمطار متجمدة خفيفة", icon: "🌨️" },
  57: { label: "أمطار متجمدة كثيفة", icon: "🌨️" },
  61: { label: "مطر خفيف", icon: "🌦️" },
  63: { label: "مطر متوسط", icon: "🌧️" },
  65: { label: "مطر غزير", icon: "🌧️" },
  66: { label: "مطر متجمد خفيف", icon: "🌨️" },
  67: { label: "مطر متجمد غزير", icon: "🌨️" },
  71: { label: "ثلوج خفيفة", icon: "🌨️" },
  73: { label: "ثلوج متوسطة", icon: "❄️" },
  75: { label: "ثلوج كثيفة", icon: "❄️" },
  77: { label: "حبيبات ثلج", icon: "🌨️" },
  80: { label: "زخات مطر خفيفة", icon: "🌦️" },
  81: { label: "زخات مطر متوسطة", icon: "🌧️" },
  82: { label: "زخات مطر قوية", icon: "⛈️" },
  85: { label: "زخات ثلج خفيفة", icon: "🌨️" },
  86: { label: "زخات ثلج قوية", icon: "❄️" },
  95: { label: "عاصفة رعدية", icon: "⛈️" },
  96: { label: "عاصفة مع بَرَد خفيف", icon: "⛈️" },
  99: { label: "عاصفة مع بَرَد كثيف", icon: "⛈️" },
};

function setTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("weather-theme", theme);
  themeIcon.textContent = isDark ? "☀️" : "🌙";
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("weather-theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(savedTheme || (systemPrefersDark ? "dark" : "light"));
}

function setStatus(message, type = "neutral") {
  const styles = {
    neutral:
      "rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300",
    success:
      "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
    error:
      "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200",
    loading:
      "rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200",
  };

  statusBox.className = styles[type];
  statusBox.textContent = message;
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function updateWeatherUI(city, currentWeather) {
  const weatherDetails = weatherCodeMap[currentWeather.weather_code] || {
    label: "حالة غير معروفة",
    icon: "🌍",
  };

  ui.cityName.textContent = city.name;
  ui.countryName.textContent = `${city.country}${city.admin1 ? `، ${city.admin1}` : ""}`;
  ui.temperatureValue.textContent = `${Math.round(currentWeather.temperature_2m)}°`;
  ui.feelsLikeValue.textContent = `${Math.round(currentWeather.apparent_temperature)}°`;
  ui.windValue.textContent = `${Math.round(currentWeather.wind_speed_10m)} كم/س`;
  ui.humidityValue.textContent = `${Math.round(currentWeather.relative_humidity_2m)}%`;
  ui.precipitationValue.textContent = `${currentWeather.precipitation.toFixed(1)} مم`;
  ui.weatherDescription.textContent = weatherDetails.label;
  ui.weatherIcon.textContent = weatherDetails.icon;
  ui.currentDate.textContent = formatDate(currentWeather.time);
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("تعذر الوصول إلى الخدمة حالياً.");
  }

  return response.json();
}

async function getCityCoordinates(cityName) {
  const endpoint = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    cityName
  )}&count=1&language=ar&format=json`;

  const data = await fetchJson(endpoint);

  if (!data.results?.length) {
    throw new Error("لم يتم العثور على هذه المدينة. جرّب كتابة الاسم بالإنجليزية.");
  }

  return data.results[0];
}

async function getCurrentWeather(latitude, longitude) {
  const endpoint =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m" +
    "&timezone=auto";

  const data = await fetchJson(endpoint);

  if (!data.current) {
    throw new Error("البيانات الحالية غير متاحة لهذه المدينة.");
  }

  return data.current;
}

async function handleWeatherSearch(cityName) {
  setStatus("جاري البحث عن المدينة وتحميل بيانات الطقس...", "loading");

  try {
    const city = await getCityCoordinates(cityName);
    const currentWeather = await getCurrentWeather(city.latitude, city.longitude);

    updateWeatherUI(city, currentWeather);
    setStatus(`تم تحميل الطقس الحالي لمدينة ${city.name} بنجاح.`, "success");
  } catch (error) {
    setStatus(error.message || "حدث خطأ غير متوقع.", "error");
  }
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const cityName = cityInput.value.trim();

  if (!cityName) {
    setStatus("من فضلك اكتب اسم مدينة أولاً.", "error");
    cityInput.focus();
    return;
  }

  await handleWeatherSearch(cityName);
});

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.classList.contains("dark");
  setTheme(isDark ? "light" : "dark");
});

initializeTheme();
handleWeatherSearch("Cairo");
