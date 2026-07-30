/* Всё содержимое берётся из js/config.js — правьте данные там */

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  fillTexts();
  initHandwriting();
  initRsvpForm();
  renderProgram();
  renderPalette();
  renderGallery();
  renderContacts();
  startCountdown();
  initReveal();
  initNav();
  initLightbox();
  initParallax();
});

/* ---------- Загрузочный экран ---------- */

function initLoader() {
  const loader = document.getElementById("loader");

  // держим экран минимум секунду, чтобы на быстром
  // интернете он не мелькал, а анимация успела показаться.
  // Класс loaded на body запускает анимации обложки — до этого
  // они ждут, иначе проиграются за загрузочным экраном
  const hide = () =>
    setTimeout(() => {
      loader.classList.add("loader--done");
      document.body.classList.add("loaded");
    }, 1000);

  if (document.readyState === "complete") hide();
  else window.addEventListener("load", hide);
}

/* ---------- Тексты и ссылки ---------- */

function fillTexts() {
  const d = WEDDING.date;

  const longDate = d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).replace(" г.", "");

  const shortDate = d.toLocaleDateString("ru-RU");

  document.getElementById("brideName").textContent = WEDDING.bride;
  document.getElementById("groomName").textContent = WEDDING.groom;
  document.getElementById("heroDate").textContent = longDate;
  document.getElementById("inviteDate").textContent = longDate;
  document.getElementById("footerDate").textContent = shortDate;

  document.getElementById("venueName").textContent = WEDDING.venue.name;
  document.getElementById("venueAddress").textContent = WEDDING.venue.address;
  document.getElementById("venueMapLink").href = WEDDING.venue.routeUrl;

  document.getElementById("rsvpDeadline").textContent = WEDDING.rsvpDeadline;
  document.getElementById("spotifyLink").href = WEDDING.spotifyPlaylist;

  // Кнопки магазинов показываем только если ссылка указана в конфиге
  const appStoreBtn = document.getElementById("oursAppStore");
  const googlePlayBtn = document.getElementById("oursGooglePlay");

  if (WEDDING.oursApp.appStore) appStoreBtn.href = WEDDING.oursApp.appStore;
  else appStoreBtn.style.display = "none";

  if (WEDDING.oursApp.googlePlay) googlePlayBtn.href = WEDDING.oursApp.googlePlay;
  else googlePlayBtn.style.display = "none";

  const oursNote = document.getElementById("oursNote");
  if (WEDDING.oursApp.note) oursNote.textContent = WEDDING.oursApp.note;
  else oursNote.style.display = "none";
}

/* ---------- Программа дня ---------- */

function renderProgram() {
  const timeline = document.getElementById("timeline");

  timeline.innerHTML = WEDDING.program
    .map(
      (item, i) => `
      <div class="timeline__item reveal" style="transition-delay: ${i * 0.12}s">
        <div class="timeline__time">${item.time}</div>
        <div class="timeline__body">
          <div class="timeline__title">${item.title}</div>
          ${item.text ? `<div class="timeline__text">${item.text}</div>` : ""}
        </div>
      </div>`
    )
    .join("");
}

/* ---------- Галерея усадьбы ---------- */

function renderGallery() {
  const track = document.getElementById("galleryTrack");

  // дублируем набор фото, чтобы лента бежала бесшовно.
  // loading="lazy" здесь не годится: вторая половина ленты стоит далеко
  // за правым краем экрана, браузер не считает её нужной и не грузит —
  // на телефоне в ленте появлялись пустые места
  const imgs = [...WEDDING.gallery, ...WEDDING.gallery]
    .map(
      (src) =>
        `<img class="gallery__img" src="${src}" alt="Усадьба Light Home" decoding="async" />`
    )
    .join("");

  track.innerHTML = imgs;
}

/* ---------- Палитра дресс-кода ---------- */

function renderPalette() {
  const palette = document.getElementById("palette");

  palette.innerHTML = WEDDING.dressCode
    .map(
      ([photo, name], i) => `
      <div class="palette__item reveal" style="transition-delay: ${i * 0.08}s">
        <img class="palette__swatch" src="${photo}" alt="${name}"
             title="${name}" loading="lazy" />
        <span class="palette__name">${name}</span>
      </div>`
    )
    .join("");
}

/* ---------- Контакты ---------- */

function renderContacts() {
  const list = document.getElementById("contactsList");

  list.innerHTML = WEDDING.contacts
    .map(
      (c, i) => `
      <div class="contact-card reveal" style="transition-delay: ${i * 0.12}s">
        <p class="contact-card__name">${c.name}</p>
        <p class="contact-card__role">${c.role || ""}</p>
        ${c.telegram ? `<a href="https://t.me/${c.telegram}" target="_blank" rel="noopener">Telegram: @${c.telegram}</a>` : ""}
        ${c.phone ? `<a href="tel:${c.phone.replace(/[^+\d]/g, "")}">${c.phone}</a>` : ""}
      </div>`
    )
    .join("");
}

/* ---------- Обратный отсчёт ---------- */

function startCountdown() {
  const els = {
    days: document.getElementById("cdDays"),
    hours: document.getElementById("cdHours"),
    mins: document.getElementById("cdMins"),
    secs: document.getElementById("cdSecs"),
    daysCap: document.getElementById("cdDaysCap"),
    hoursCap: document.getElementById("cdHoursCap"),
    minsCap: document.getElementById("cdMinsCap"),
    secsCap: document.getElementById("cdSecsCap"),
  };

  function plural(n, [one, few, many]) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  function tick() {
    const diff = WEDDING.date - new Date();

    if (diff <= 0) {
      document.querySelector(".countdown__label").textContent =
        "Этот день настал!";
      els.days.textContent = els.hours.textContent = "0";
      els.mins.textContent = els.secs.textContent = "0";
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000) % 24;
    const mins = Math.floor(diff / 60000) % 60;
    const secs = Math.floor(diff / 1000) % 60;

    els.days.textContent = days;
    els.hours.textContent = hours;
    els.mins.textContent = mins;
    els.secs.textContent = secs;

    els.daysCap.textContent = plural(days, ["день", "дня", "дней"]);
    els.hoursCap.textContent = plural(hours, ["час", "часа", "часов"]);
    els.minsCap.textContent = plural(mins, ["минута", "минуты", "минут"]);
    els.secsCap.textContent = plural(secs, ["секунда", "секунды", "секунд"]);

    setTimeout(tick, 1000);
  }

  tick();
}

/* ---------- Анкета: отправка ответа в гугл-форму ---------- */

function initRsvpForm() {
  const form = document.getElementById("rsvpForm");
  const status = document.getElementById("rsvpStatus");
  const submitBtn = form.querySelector(".rsvp__submit");

  // Гостю, который не сможет прийти, пожелания и плейлист не нужны
  const extra = document.getElementById("rsvpExtra");
  const music = document.getElementById("rsvpMusic");

  form.querySelectorAll('input[name="attend"]').forEach((radio) =>
    radio.addEventListener("change", () => {
      const declined = form.attend.value === "Нет";
      extra.hidden = declined;
      music.hidden = declined;
    })
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const attend = form.attend.value;

    if (!name || !attend) {
      status.textContent = "Пожалуйста, заполните имя и отметьте ответ";
      return;
    }

    const cfg = WEDDING.rsvpForm;
    const data = new FormData();
    data.append(cfg.nameEntry, name);
    data.append(cfg.attendEntry, attend);

    const wishes = extra.hidden ? "" : form.wishes.value.trim();
    if (wishes && cfg.wishesEntry) data.append(cfg.wishesEntry, wishes);

    submitBtn.disabled = true;
    status.textContent = "Отправляем…";

    try {
      // no-cors: гугл-форма принимает ответ, но не отдаёт CORS-заголовки
      await fetch(cfg.action, { method: "POST", mode: "no-cors", body: data });
      form.classList.add("rsvp__form--sent");
      status.textContent =
        attend === "Да"
          // ︎ — сердечко как обычный символ, а не цветной эмодзи
          ? "Спасибо! Будем очень ждать вас ♥︎"
          : "Спасибо за ответ! Нам будет вас не хватать ♥︎";
    } catch {
      submitBtn.disabled = false;
      status.textContent = "Не получилось отправить — попробуйте ещё раз";
    }
  });
}

/* ---------- «Рукописная» строка про конверт ---------- */

function initHandwriting() {
  const el = document.querySelector(".gifts__hint");
  if (!el) return;

  const text = el.textContent.replace(/\s+/g, " ").trim();

  // текст остаётся доступным для скринридеров целиком
  el.setAttribute("aria-label", text);
  el.textContent = "";

  // буквы собраны в слова (.ink-word), чтобы строка
  // не переносилась посреди слова
  let i = 0;
  text.split(" ").forEach((word, w, words) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "ink-word";
    wordSpan.setAttribute("aria-hidden", "true");

    [...word].forEach((ch) => {
      const span = document.createElement("span");
      span.className = "ink";
      span.style.setProperty("--i", i++);
      span.textContent = ch;
      wordSpan.appendChild(span);
    });

    el.appendChild(wordSpan);
    if (w < words.length - 1) el.appendChild(document.createTextNode(" "));
  });
}

/* ---------- Появление секций при скролле ---------- */

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  // .deco — фоновые мотивы секций, .gifts__hint — «рукописная» строка:
  // по .visible у них запускаются собственные анимации
  document
    .querySelectorAll(".reveal, .deco, .gifts__hint")
    .forEach((el) => observer.observe(el));
}

/* ---------- Лайтбокс для галереи ---------- */

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");

  document.addEventListener("click", (e) => {
    const photo = e.target.closest(".gallery__img");
    if (!photo) return;
    img.src = photo.src;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  });

  function close() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  lightbox.addEventListener("click", close);
  document.getElementById("lightboxClose").addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ---------- Лёгкий параллакс обложки ---------- */

function initParallax() {
  const content = document.querySelector(".hero__content");
  const hero = document.getElementById("hero");

  // Кому анимации мешают — обложка просто стоит на месте
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Свежие браузеры умеют привязывать анимацию к прокрутке сами
  // (см. @supports animation-timeline в css/style.css) — там обложку
  // двигает та же часть браузера, что и саму страницу, кадр в кадр.
  // Отдаём работу ей и из JS не вмешиваемся
  if (window.CSS && CSS.supports("animation-timeline: scroll()")) return;

  // Без такой поддержки остаётся считать положение вручную, а JS на
  // телефоне неизбежно отстаёт от прокрутки на кадр-другой. Пусть лучше
  // обложка стоит ровно, чем дёргается: на тач-экранах параллакс выключаем
  if (!window.matchMedia("(hover: hover)").matches) return;

  // Высоту обложки меряем заранее: если читать её на каждом событии
  // прокрутки, браузер вынужден пересчитывать раскладку прямо посреди
  // скролла — на телефоне это и даёт рывки
  let heroHeight = hero.offsetHeight;
  let pending = false;

  const update = () => {
    pending = false;

    const y = window.scrollY;
    if (y > heroHeight) return;

    // translate3d — чтобы обложку двигала видеокарта, а не перерисовка
    content.style.transform = `translate3d(0, ${y * 0.28}px, 0)`;
    content.style.opacity = 1 - y / (heroHeight * 0.9);
  };

  // На телефоне прокруткой занимается отдельный поток браузера, и события
  // scroll приходят вразнобой. Поэтому не двигаем обложку на каждом
  // событии, а откладываем до ближайшего кадра — так шаг всегда ровный
  const onScroll = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    heroHeight = hero.offsetHeight;
    onScroll();
  });

  update();
}

/* ---------- Навигация ---------- */

function initNav() {
  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const links = document.getElementById("navLinks");

  // passive: true — обещаем браузеру, что не отменяем прокрутку,
  // иначе он ждёт наш обработчик, прежде чем сдвинуть страницу
  let navPending = false;

  window.addEventListener(
    "scroll",
    () => {
      if (navPending) return;
      navPending = true;
      requestAnimationFrame(() => {
        navPending = false;
        nav.classList.toggle("nav--solid", window.scrollY > 40);
      });
    },
    { passive: true }
  );

  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    links.classList.toggle("open");
    document.body.classList.toggle("menu-open", links.classList.contains("open"));
  });

  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      burger.classList.remove("open");
      links.classList.remove("open");
      document.body.classList.remove("menu-open");
    })
  );
}
