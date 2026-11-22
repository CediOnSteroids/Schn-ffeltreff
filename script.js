(() => {
  "use strict";

  const seiten = [
    ["index.html", "Home"],
    ["aktuelles.html", "Aktuelles"],
    ["angebot.html", "Angebot"],
    ["ueber-uns.html", "Über uns"],
    ["kontakt.html", "Kontakt"]
  ];

  let aktuell = location.pathname.split("/").pop() || "index.html";
  if (!aktuell.includes(".")) aktuell += ".html";

  // Name des Abschnitts kommt aus dem Seitentitel ("Angebot – Name des Treffs")
  const abschnittName = document.title.split(" – ")[0];

  const el = (tag, klasse, attrs = {}) => {
    const e = document.createElement(tag);
    if (klasse) e.className = klasse;
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  };

  /* ---------- Kopfleiste: Abschnitt links, Menü rechts ---------- */
  const kopf = el("header", "kopf");

  const abschnitt = el("div", "abschnitt", { "aria-hidden": "true" });
  abschnitt.textContent = abschnittName;

  const wrapper = el("div", "menu-wrapper");

  const btn = el("button", "menu-btn", {
    type: "button",
    "aria-label": "Menü öffnen",
    "aria-expanded": "false",
    "aria-controls": "menu"
  });
  btn.innerHTML = "<span></span><span></span><span></span>";

  const nav = el("nav", "", { id: "menu", "aria-label": "Hauptmenü" });
  nav.innerHTML = seiten
    .map(
      ([url, text], i) =>
        `<a href="${url}" style="--i:${i}"${url === aktuell ? ' aria-current="page"' : ""}>${text}</a>`
    )
    .join("");

  wrapper.append(btn, nav);
  kopf.append(abschnitt, wrapper);
  document.body.prepend(kopf);

  const istOffen = () => nav.classList.contains("offen");

  function schalte(an, fokusZurueck = false) {
    nav.classList.toggle("offen", an);
    btn.setAttribute("aria-expanded", String(an));
    btn.setAttribute("aria-label", an ? "Menü schliessen" : "Menü öffnen");
    if (!an && fokusZurueck) btn.focus();
  }

  btn.addEventListener("click", () => schalte(!istOffen()));

  document.addEventListener("click", (e) => {
    if (istOffen() && !wrapper.contains(e.target)) schalte(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && istOffen()) schalte(false, true);
  });

  // Hairline unter der Kopfleiste erst, wenn gescrollt wurde
  let wartet = false;
  const pruefeScroll = () => {
    kopf.classList.toggle("gescrollt", window.scrollY > 8);
    wartet = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!wartet) {
        wartet = true;
        requestAnimationFrame(pruefeScroll);
      }
    },
    { passive: true }
  );
  pruefeScroll();

  /* ---------- Einblenden beim Laden und Scrollen ---------- */
  const ziele = document.querySelectorAll(
    "main > :not(.hero):not(.grid), .hero > *, .grid > *"
  );

  function starteEinblenden() {
    if (!("IntersectionObserver" in window)) {
      ziele.forEach((z) => z.classList.add("sichtbar"));
      return;
    }
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        // Elemente, die gleichzeitig erscheinen, leicht versetzt einblenden
        let n = 0;
        eintraege
          .filter((e) => e.isIntersecting)
          .forEach((e) => {
            e.target.style.setProperty("--d", Math.min(n++, 6) * 80 + "ms");
            e.target.classList.add("sichtbar");
            beobachter.unobserve(e.target);
          });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
    );
    ziele.forEach((z) => beobachter.observe(z));
  }

  /* ---------- Start-Animation nur einmal pro Sitzung ---------- */
  const splash = document.getElementById("splash");
  const splashLaeuft =
    splash &&
    !document.documentElement.classList.contains("kein-splash") &&
    getComputedStyle(splash).display !== "none";

  try {
    sessionStorage.setItem("splash", "1");
  } catch (_) {}

  if (splashLaeuft) {
    let gestartet = false;
    const los = () => {
      if (gestartet) return;
      gestartet = true;
      splash.remove();
      starteEinblenden();
    };
    splash.addEventListener("animationend", (e) => {
      if (e.target === splash && e.animationName === "weg") los();
    });
    setTimeout(los, 3500); // Sicherheitsnetz
  } else {
    splash?.remove();
    starteEinblenden();
  }

  /* ---------- Kontaktdaten erst nach Klick zusammensetzen (Schutz vor Bots) ---------- */
  document.querySelectorAll(".zeige").forEach((b) =>
    b.addEventListener("click", () => {
      const mail = b.dataset.u + "@" + b.dataset.d;
      const tel = b.dataset.t.split("|").join(" ");

      const p = el("p", "kontakt-daten");
      const a = el("a", "", { href: "mailto:" + mail });
      a.textContent = mail;
      const c = el("a", "", { href: "tel:" + tel.replace(/ /g, "") });
      c.textContent = tel;
      p.append(a, document.createElement("br"), c);

      b.replaceWith(p);
      a.focus({ preventScroll: true });
    })
  );
})();