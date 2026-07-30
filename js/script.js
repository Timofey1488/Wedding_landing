/* Всё содержимое берётся из js/config.js — правьте данные там */

document.addEventListener("DOMContentLoaded", () => {
  initHeroHeight();
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

/* ---------- Высота обложки ---------- */

function initHeroHeight() {
  const root = document.documentElement;
  const vv = window.visualViewport;

  // Обложка меряется от высоты окна. В обычном браузере для этого хватило
  // бы единицы svh, но когда страницу открывают внутри приложения
  // (Telegram и подобные), окно меняет высоту прямо во время прокрутки —
  // и вместе с ним пересчитываются любые svh/dvh/vh, отчего фото прыгает.
  // Поэтому держим высоту в пикселях и сами решаем, когда её менять.

  // Спрашиваем окно тремя способами и берём самый скромный ответ
  const current = () => {
    const values = [window.innerHeight, root.clientHeight];
    if (vv) values.push(vv.height);
    return Math.round(Math.min(...values.filter((v) => v > 0)));
  };

  let smallest = current();
  const apply = () => root.style.setProperty("--hero-h", smallest + "px");

  apply();

  // Высоту только уменьшаем. Когда сверху выезжает шапка приложения или
  // браузера, видимая область становится меньше — обложка должна помещаться
  // именно в неё, с учётом шапки. Обратно, когда шапка уходит, не растём:
  // иначе кадр прыгал бы туда-сюда при каждой прокрутке
  const shrink = () => {
    // при увеличении пальцами видимая область тоже уменьшается,
    // но это не повод пересобирать обложку
    if (vv && vv.scale > 1) return;

    const h = current();

    if (h > 0 && h < smallest - 8) {
      smallest = h;
      apply();
    }
  };

  window.addEventListener("resize", shrink);
  if (vv) vv.addEventListener("resize", shrink);

  // Поворот экрана — единственный случай, когда меряем заново с нуля.
  // Сразу после поворота размеры ещё не устаканились, поэтому с задержкой
  let lastWidth = window.innerWidth;

  const reset = () =>
    setTimeout(() => {
      smallest = current();
      apply();
    }, 250);

  window.addEventListener("orientationchange", reset);
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    reset();
  });
}

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
  // Если это работает, из JS не вмешиваемся.
  //
  // Спрашиваем не «знает ли браузер такое свойство», а «крутится ли
  // анимация на самом деле»: Safari свойство знает, но прокрутку к нему
  // не привязывает, и по одному CSS.supports обложка застыла бы совсем.
  // Ждём кадр — до первой отрисовки анимация ещё не ожила
  requestAnimationFrame(() => {
    const cssDriven = content.getAnimations().some(
      (a) =>
        a.timeline &&
        a.timeline !== document.timeline &&
        a.effect &&
        a.effect.getComputedTiming().progress !== null
    );

    if (!cssDriven) startJsParallax();
  });

  // Дальше — запасной путь для Safari и других браузеров без такой
  // поддержки: положение обложки считает сам JS.
  //
  // Раньше мы обновляли её по событию scroll — в этом и была причина
  // рывков: телефон присылает эти события реже, чем обновляет экран, и
  // обложка прыгала через десяток пикселей. Поэтому пока идёт прокрутка,
  // крутим свой цикл по кадрам и каждый кадр сами спрашиваем позицию —
  // она всегда свежая, пропусков не остаётся.

  // Высоту обложки меряем заранее: читать её в цикле — значит заставлять
  // браузер пересчитывать раскладку посреди прокрутки
  let heroHeight = hero.offsetHeight;
  let lastY = -1;
  let idleFrames = 0;
  let running = false;

  function startJsParallax() {
    // На тач-экранах этот путь не включаем. Прокруткой там занимается
    // отдельный поток браузера, а мы считаем сдвиг на основном — он
    // неизбежно отстаёт, и обложка дёргается (проверено на iOS Safari:
    // ни покадровый цикл, ни поправка на адресную строку не спасают).
    // Пусть лучше обложка стоит ровно. Там, где параллакс ведёт сам
    // браузер (Chrome, Android), он работает и на тач-экране — см. выше
    if (!window.matchMedia("(hover: hover)").matches) return;

    window.addEventListener("scroll", start, { passive: true });
    window.addEventListener("resize", () => {
      heroHeight = hero.offsetHeight;
      lastY = -1;
      start();
    });

    // Появление и исчезновение адресной строки — это отдельные события,
    // события scroll при этом может и не быть. Иначе цикл спал бы ровно
    // в тот момент, когда обложку и надо поправить
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", start);
      window.visualViewport.addEventListener("scroll", start);
    }

    start();
  }

  const frame = () => {
    // Когда на телефоне при прокрутке вниз прячется адресная строка,
    // видимая область съезжает относительно страницы: scrollY меняется
    // не так, как то, что человек видит на экране, — и обложка дёргается.
    // visualViewport.offsetTop как раз показывает этот разъезд, поэтому
    // считаем сдвиг по тому, где обложка на самом деле оказалась
    const vv = window.visualViewport;
    const y = window.scrollY + (vv ? vv.offsetTop : 0);

    if (y !== lastY) {
      lastY = y;
      idleFrames = 0;

      if (y <= heroHeight) {
        // translate3d — чтобы обложку двигала видеокарта, а не перерисовка
        content.style.transform = `translate3d(0, ${y * 0.28}px, 0)`;
        content.style.opacity = 1 - y / (heroHeight * 0.9);
      }
    } else {
      idleFrames++;
    }

    // прокрутка замерла — гасим цикл, чтобы не жечь батарею впустую.
    // Следующее событие scroll заведёт его снова
    if (idleFrames > 30) {
      running = false;
      return;
    }

    requestAnimationFrame(frame);
  };

  const start = () => {
    if (running) return;
    running = true;
    idleFrames = 0;
    requestAnimationFrame(frame);
  };

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
