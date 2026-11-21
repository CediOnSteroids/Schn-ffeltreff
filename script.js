// Menü-Button und Menü auf jeder Seite einfügen
const seiten = [["index.html","Home"],["aktuelles.html","Aktuelles"],["angebot.html","Angebot"],["ueber-uns.html","Über uns"],["kontakt.html","Kontakt"]];
let aktuell = location.pathname.split("/").pop() || "index.html";
if (!aktuell.includes(".")) aktuell += ".html";

const btn = document.createElement("button");
btn.className = "menu-btn";
btn.setAttribute("aria-label", "Menü öffnen");
btn.setAttribute("aria-expanded", "false");
btn.setAttribute("aria-controls", "menu");
btn.innerHTML = "<span></span><span></span><span></span>";

const nav = document.createElement("nav");
nav.id = "menu";
nav.setAttribute("aria-label", "Hauptmenü");
nav.innerHTML = seiten.map(([u, t]) => `<a href="${u}"${u === aktuell ? ' aria-current="page"' : ""}>${t}</a>`).join("");

document.body.prepend(nav);
document.body.prepend(btn);

function schalte(an) {
  nav.classList.toggle("offen", an);
  btn.setAttribute("aria-expanded", an);
  btn.setAttribute("aria-label", an ? "Menü schliessen" : "Menü öffnen");
  document.body.style.overflow = an ? "hidden" : "";
}
btn.addEventListener("click", () => schalte(!nav.classList.contains("offen")));
nav.addEventListener("click", e => { if (e.target.tagName === "A") schalte(false); });
document.addEventListener("keydown", e => { if (e.key === "Escape") schalte(false); });

// Kontaktdaten erst nach Klick zusammensetzen (Schutz vor Bots)
document.querySelectorAll(".zeige").forEach(b => b.addEventListener("click", () => {
  const mail = b.dataset.u + "@" + b.dataset.d;
  const tel = b.dataset.t.split("|").join(" ");
  const p = document.createElement("p");
  const a = document.createElement("a");
  a.href = "mailto:" + mail; a.textContent = mail;
  const c = document.createElement("a");
  c.href = "tel:" + tel.replace(/ /g, ""); c.textContent = tel;
  p.append(a, document.createElement("br"), c);
  b.replaceWith(p);
}));