// Labo des formats : on enchaîne plusieurs façons de poser une question, et on vote pour chacune.
// Tous les chiffres et réponses viennent des explications déjà vérifiées (questions.js, notes.js).
import { QUESTIONS } from "./questions.js";

/* ---------- Outils ---------- */

const $ = (id) => document.getElementById(id);
const fr = (t) => t.replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« ");
function h(tag, props, ...enfants) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style") el.setAttribute("style", v);
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const e of enfants.flat(Infinity)) {
    if (e == null || e === false) continue;
    el.append(e instanceof Node ? e : document.createTextNode(fr(String(e))));
  }
  return el;
}
const vider = (el, ...e) => el.replaceChildren(...e.flat(Infinity).filter((x) => x != null && x !== false));
const melanger = (a) => { const t = a.slice(); for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; } return t; };
const nb = (n) => Math.round(n).toLocaleString("fr-FR");
const annee = (a) => (a < 0 ? `${nb(-a)} av. J.-C.` : String(Math.round(a)));

/* ---------- Sons, points, couleurs ---------- */

let audio = null;
function note(f, d = 0, duree = 0.15, type = "triangle", vol = 0.25) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
    const t = audio.currentTime + d, o = audio.createOscillator(), g = audio.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    o.connect(g).connect(audio.destination); o.start(t); o.stop(t + duree + 0.05);
  } catch (_) {}
}
addEventListener("pointerdown", () => { try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (_) {} }, { once: true, capture: true });
const bien = () => { note(784); note(1175, 0.08, 0.25); };
const rate = () => { note(196, 0, 0.22, "square", 0.1); note(147, 0.09, 0.3, "square", 0.1); };

let score = 0;
function gagner(pts, el) {
  score += pts;
  $("lb-score").textContent = `${nb(score)} pts`;
  if (!pts || !el) return;
  const r = el.getBoundingClientRect();
  const f = h("span", { class: "flotteur", style: `left:${r.left + r.width / 2}px;top:${r.top + 20}px` }, `+${nb(pts)}`);
  document.body.append(f);
  setTimeout(() => f.remove(), 1200);
}

const PALETTE = [["#FF5A36", "#15131A"], ["#B9A6FF", "#15131A"], ["#FFD23F", "#15131A"], ["#7FD8BE", "#15131A"], ["#FF9EC7", "#15131A"], ["#3D5AFE", "#FBF5E9"]];
let nBandes = 0;
function bande() {
  const [fond, texte] = PALETTE[nBandes++ % PALETTE.length];
  const b = h("section", { class: "bande lb", style: `--fond:${fond};--texte:${texte}` });
  $("fil").append(b);
  return b;
}
const allerA = (el) => requestAnimationFrame(() => el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));

// Verdict commun : titre, points, explication, puis bouton « suivant ».
function verdict(zone, juste, pts, texte, suite) {
  if (juste) bien(); else rate();
  gagner(pts, zone);
  const bouton = h("button", { class: "gros-bouton", type: "button", onclick: () => { bouton.disabled = true; suite(); } }, "Suivant");
  zone.append(
    h("p", { class: "verdict" }, h("b", null, juste ? "Bien vu." : "Raté."), h("span", { class: "gain" }, pts ? `+${nb(pts)} points` : "0 point")),
    h("p", null, texte),
    bouton);
  allerA(zone.querySelector(".verdict"));
}

/* ---------- Format 1 : la frise à placer ---------- */

const FRISE_ITEMS = [
  { sujet: "Cléopâtre", consigne: "Place la naissance de Cléopâtre sur la frise.", min: -2500, max: 2007,
    gauche: "Grande pyramide", gaucheDate: "vers 2500 av. J.-C.", droite: "Premier iPhone", droiteDate: "2007",
    val: -69, valTexte: "70 ou 69 av. J.-C.", juge: (v) => v > (-2500 + 2007) / 2,
    texte: "Plus près de l'iPhone que de la pyramide : environ 2 075 ans d'un côté, 2 400 à 2 500 de l'autre. Il suffisait de la placer dans la moitié droite." },
  { sujet: "La FIFA", consigne: "Place la fondation de la FIFA, à Paris.", min: 1666, max: 2011,
    gauche: "Grand Incendie de Londres", gaucheDate: "1666", droite: "Naissance de Twitch", droiteDate: "2011",
    val: 1904, valTexte: "1904", juge: (v) => Math.abs(v - 1904) <= 20,
    texte: "En 1904, le 21 mai, au 229 rue Saint-Honoré. Il fallait tomber à 20 ans près." },
  { sujet: "Beksiński", consigne: "Place la naissance du peintre Zdzisław Beksiński.", min: 1880, max: 1991,
    gauche: "Première Île des morts de Böcklin", gaucheDate: "1880", droite: "La Zoubida de Lagaf'", droiteDate: "1991",
    val: 1929, valTexte: "1929", juge: (v) => Math.abs(v - 1929) <= 10,
    texte: "En 1929. Il fallait tomber à 10 ans près." },
];
function formatFrise(item, b, suite) {
  const ratio = (v) => (v - item.min) / (item.max - item.min);
  let pos = null;
  const repere = h("div", { class: "lb-repere pose" }, h("i"), h("span", null, item.sujet));
  const vrai = h("div", { class: "lb-repere vrai" }, h("i"), h("span", null, item.valTexte));
  const lecture = h("p", { class: "lb-lecture" }, "Touche la ligne, ajuste, puis valide.");
  const piste = h("div", { class: "lb-piste" }, repere, vrai);
  const valider = h("button", { class: "gros-bouton", type: "button", disabled: true }, "Valider");
  const placer = (x) => {
    const r = piste.getBoundingClientRect();
    pos = Math.min(1, Math.max(0, (x - r.left) / r.width));
    repere.style.left = `${pos * 100}%`; repere.classList.add("visible");
    lecture.textContent = `${item.sujet} : ${annee(item.min + pos * (item.max - item.min))}`;
    valider.disabled = false;
  };
  let tient = false;
  piste.addEventListener("pointerdown", (e) => { if (b.classList.contains("fini")) return; tient = true; piste.setPointerCapture(e.pointerId); placer(e.clientX); });
  piste.addEventListener("pointermove", (e) => { if (tient) placer(e.clientX); });
  piste.addEventListener("pointerup", () => { tient = false; });
  const zone = h("div");
  valider.addEventListener("click", () => {
    b.classList.add("fini"); valider.remove();
    const v = item.min + pos * (item.max - item.min);
    vrai.style.left = `${ratio(item.val) * 100}%`; vrai.classList.add("visible");
    const juste = item.juge(v);
    const ecart = Math.abs(v - item.val);
    const pts = juste ? Math.max(200, Math.round(1000 * (1 - ecart / (item.max - item.min)))) : 0;
    lecture.textContent = `Tu as placé : ${annee(v)}. Réponse : ${item.valTexte}${item.valTexte.endsWith(".") ? "" : "."}`;
    verdict(zone, juste, pts, item.texte, suite);
  });
  vider(b, h("h1", { class: "question" }, item.consigne),
    h("div", { class: "lb-frise" }, piste,
      h("div", { class: "frise-bouts" },
        h("span", null, h("b", null, item.gauche), h("small", null, item.gaucheDate)),
        h("span", null, h("b", null, item.droite), h("small", null, item.droiteDate)))),
    lecture, valider, zone);
}

/* ---------- Format 2 : le curseur d'estimation ---------- */

const CURSEUR_ITEMS = [
  { q: "Combien de matchs chaque équipe de baseball joue-t-elle pendant la saison régulière de la MLB ?", min: 0, max: 300, val: 162, tol: 15, unite: "matchs",
    texte: "162, à peu près un par jour pendant six mois." },
  { q: "Combien de fois entend-on « Around the world » dans le morceau de Daft Punk ?", min: 0, max: 300, val: 144, tol: 15, unite: "fois",
    texte: "144 fois, selon le décompte le plus souvent cité pour la version de l'album Homework (1997). Ce sont les seules paroles du morceau." },
  { q: "Combien mesure la statue de l'Unité, en Inde, sans son socle ?", min: 0, max: 400, val: 182, tol: 20, unite: "mètres",
    texte: "182 mètres, 240 avec son socle. C'est la plus grande statue du monde." },
];
function formatCurseur(item, b, suite) {
  const milieu = Math.round((item.min + item.max) / 2);
  const affiche = h("p", { class: "lb-valeur" }, h("b", null, nb(milieu)), ` ${item.unite}`);
  const curseur = h("input", { type: "range", class: "lb-range", min: item.min, max: item.max, step: 1, value: milieu, "aria-label": item.q });
  let bouge = false;
  curseur.addEventListener("input", () => { bouge = true; affiche.firstChild.textContent = nb(curseur.value); valider.disabled = false; });
  const valider = h("button", { class: "gros-bouton", type: "button", disabled: true }, "Valider");
  const vrai = h("div", { class: "lb-range-vrai", style: `left:${((item.val - item.min) / (item.max - item.min)) * 100}%` }, h("span", null, nb(item.val)));
  const zone = h("div");
  valider.addEventListener("click", () => {
    if (!bouge) return;
    curseur.disabled = true; valider.remove(); vrai.classList.add("visible");
    const v = Number(curseur.value), ecart = Math.abs(v - item.val);
    const juste = ecart <= item.tol;
    const pts = ecart === 0 ? 2000 : juste ? Math.round(1000 * (1 - ecart / (item.tol * 2))) : 0;
    verdict(zone, juste, pts, `${ecart === 0 ? "Pile poil ! " : `Écart : ${nb(ecart)}. `}${item.texte}`, suite);
  });
  vider(b, h("h1", { class: "question" }, item.q), affiche, h("div", { class: "lb-range-zone" }, curseur, vrai,
    h("div", { class: "lb-range-bornes" }, h("span", null, nb(item.min)), h("span", null, nb(item.max)))), valider, zone);
}

/* ---------- Format 3 : glisser vrai / faux ---------- */

function cartesSwipe() {
  const qcm = Object.values(QUESTIONS).flat().filter((q) => q.type === "qcm" && q.texte.length < 90);
  const tirees = melanger(qcm).slice(0, 6);
  return melanger(tirees.map((q, k) => {
    const vraie = k < 3;
    const fausses = q.choix.filter((_, i) => i !== q.reponse);
    return { q: q.texte, prop: vraie ? q.choix[q.reponse] : melanger(fausses)[0], bonne: q.choix[q.reponse], vraie };
  }));
}
function formatSwipe(cartes, b, suite) {
  let i = 0, bons = 0;
  const pile = h("div", { class: "lb-pile" });
  const retour = h("p", { class: "lb-retour", "aria-live": "polite" });
  const compteur = h("p", { class: "consigne" });
  const boutons = h("div", { class: "eclair-boutons" },
    h("button", { class: "gros-bouton", type: "button", onclick: () => juger(false) }, "← Faux"),
    h("button", { class: "gros-bouton", type: "button", onclick: () => juger(true) }, "Vrai →"));
  const zone = h("div");
  let carte = null, x0 = 0, dx = 0, occupe = false;
  const montrer = () => {
    compteur.textContent = `Carte ${i + 1} sur ${cartes.length}`;
    const c = cartes[i];
    carte = h("div", { class: "lb-carte" }, h("span", { class: "a-q" }, c.q), h("span", { class: "a-p" }, c.prop));
    carte.addEventListener("pointerdown", (e) => { if (occupe) return; x0 = e.clientX; dx = 0; carte.setPointerCapture(e.pointerId); carte.classList.add("tenue"); });
    carte.addEventListener("pointermove", (e) => { if (!carte.classList.contains("tenue")) return; dx = e.clientX - x0; carte.style.transform = `translateX(${dx}px) rotate(${dx / 14}deg)`; carte.dataset.penche = dx > 30 ? "vrai" : dx < -30 ? "faux" : ""; });
    carte.addEventListener("pointerup", () => { carte.classList.remove("tenue"); if (Math.abs(dx) > 90) juger(dx > 0); else { carte.style.transform = ""; carte.dataset.penche = ""; } });
    vider(pile, carte);
  };
  const juger = (dit) => {
    if (occupe || i >= cartes.length) return;
    occupe = true;
    const c = cartes[i], ok = dit === c.vraie;
    if (ok) { bons++; bien(); } else rate();
    carte.style.transform = `translateX(${dit ? 140 : -140}%) rotate(${dit ? 20 : -20}deg)`; carte.style.opacity = "0";
    retour.textContent = ok ? "✓ " + (c.vraie ? "Vrai." : `Faux : c'était ${c.bonne}.`) : "✗ " + (c.vraie ? "C'était vrai." : `Faux : c'était ${c.bonne}.`);
    retour.className = `lb-retour ${ok ? "ok" : "ko"}`;
    setTimeout(() => {
      i++; occupe = false;
      if (i < cartes.length) montrer();
      else { boutons.remove(); pile.remove(); compteur.remove(); verdict(zone, bons >= 4, bons * 300, `${bons} sur ${cartes.length}.`, suite); }
    }, 650);
  };
  vider(b, h("h1", { class: "question" }, "Glisse à droite si c'est vrai, à gauche si c'est faux."), compteur, pile, retour, boutons, zone);
  montrer();
}

/* ---------- Format 4 : les lettres à remettre ---------- */

const LETTRES_ITEMS = [
  { q: "Astronaute pour les Américains, cosmonaute pour les Russes… et pour les Français ?", mot: "SPATIONAUTE", texte: "Spationaute : ni astro, ni cosmo, on a notre propre mot." },
  { q: "Comment s'appelle la petite main à l'index tendu ☞ ?", mot: "MANICULE", texte: "Une manicule, dessinée dans les marges depuis des siècles pour dire « regarde ici »." },
  { q: "Pour ses proches, Zinédine Zidane s'appelle…", mot: "YAZID", texte: "Yazid." },
];
function formatLettres(item, b, suite) {
  const lettres = melanger([...item.mot].map((l, k) => ({ l, k })));
  const cases = [...item.mot].map(() => h("span", { class: "lb-case" }));
  const pris = [];
  const zone = h("div");
  const tuiles = lettres.map((x) => h("button", { class: "lb-lettre", type: "button", onclick: (e) => poser(e.currentTarget, x) }, x.l));
  const effacer = h("button", { class: "lien-texte", type: "button", onclick: () => { const t = pris.pop(); if (!t) return; t.disabled = false; cases[pris.length].textContent = ""; } }, "Effacer");
  const poser = (t, x) => {
    if (b.classList.contains("fini") || pris.length >= cases.length) return;
    cases[pris.length].textContent = x.l; pris.push(t); t.disabled = true; note(660 + pris.length * 30, 0, 0.06);
    if (pris.length === cases.length) {
      const mot = cases.map((c) => c.textContent).join("");
      const juste = mot === item.mot;
      if (!juste && !b.dataset.essai) {
        b.dataset.essai = "1"; rate();
        cases.forEach((c) => { c.classList.remove("secoue"); void c.offsetWidth; c.classList.add("secoue"); });
        return;
      }
      b.classList.add("fini"); effacer.remove();
      cases.forEach((c, k) => { c.textContent = item.mot[k]; c.classList.add(juste ? "ok" : "ko"); });
      verdict(zone, juste, juste ? (b.dataset.essai ? 500 : 1000) : 0, item.texte, suite);
    }
  };
  vider(b, h("h1", { class: "question" }, item.q), h("p", { class: "consigne" }, "Remets les lettres dans l'ordre. Deux essais."),
    h("div", { class: "lb-cases", style: `grid-template-columns:repeat(${cases.length}, minmax(0, 1fr));max-width:${cases.length * 40}px` }, cases), h("div", { class: "lb-lettres" }, tuiles), effacer, zone);
}

/* ---------- Format 5 : la citation à trous ---------- */

const TROUS_ITEMS = [
  { intro: "Dans le dialogue mélien, les Athéniens répondent aux habitants de Mélos :", morceaux: ["« Les forts font ce qu'ils ", 0, ", les faibles subissent ce qu'ils ", 1, ". »"],
    bonnes: ["peuvent", "doivent"], leurres: ["veulent", "méritent", "savent"], texte: "Les forts font ce qu'ils peuvent, les faibles subissent ce qu'ils doivent : la justice ne vaut qu'entre égaux. Thucydide reconstitue cette négociation de 416 av. J.-C." },
  { intro: "Le cri des chevaliers normands :", morceaux: ["« Dex aïe ! », c'est-à-dire « Dieu, notre ", 0, " ! »"],
    bonnes: ["aide"], leurres: ["roi", "force", "gloire"], texte: "« Dieu, notre aide ! », lancé sur les champs de bataille d'Europe et du Proche-Orient." },
  { intro: "Dans le noir total, l'œil voit un gris très foncé, l'eigengrau. En allemand, ça veut dire :", morceaux: ["« gris ", 0, " »"],
    bonnes: ["intrinsèque"], leurres: ["éternel", "intérieur", "invisible"], texte: "« Gris intrinsèque » : même sans lumière, le nerf optique continue d'envoyer des signaux." },
];
function formatTrous(item, b, suite) {
  const trous = item.bonnes.map(() => h("span", { class: "lb-trou" }, "……"));
  const remplis = [];
  const zone = h("div");
  const phrase = h("p", { class: "lb-phrase" }, item.morceaux.map((m) => (typeof m === "number" ? trous[m] : m)));
  const tuiles = melanger([...item.bonnes, ...item.leurres]).map((mot) => h("button", { class: "lb-mot", type: "button", onclick: (e) => choisir(e.currentTarget, mot) }, mot));
  const choisir = (t, mot) => {
    if (b.classList.contains("fini")) return;
    const k = remplis.length;
    trous[k].textContent = mot; trous[k].classList.add("rempli"); remplis.push(mot); t.disabled = true; note(700, 0, 0.06);
    if (remplis.length === trous.length) {
      b.classList.add("fini");
      const juste = remplis.every((m, i) => m === item.bonnes[i]);
      trous.forEach((tr, i) => { tr.classList.add(remplis[i] === item.bonnes[i] ? "ok" : "ko"); tr.textContent = item.bonnes[i]; });
      verdict(zone, juste, juste ? 1000 : 0, item.texte, suite);
    }
  };
  vider(b, h("p", { class: "consigne" }, item.intro), phrase, h("div", { class: "lb-mots" }, tuiles), zone);
}

/* ---------- Format 6 : le mot inventé ---------- */

const INVENTE_ITEMS = [
  { mots: ["Glabre", "Noosphère", "Pétrumière", "Laudatif"], faux: "Pétrumière",
    texte: "Pétrumière n'existe pas. Glabre : sans poils. Noosphère : la sphère de la pensée humaine. Laudatif : qui fait l'éloge de quelqu'un." },
  { mots: ["Poioumenon", "Zinglorphe", "Manicule", "Eigengrau"], faux: "Zinglorphe",
    texte: "Zinglorphe n'existe pas. Poioumenon : une œuvre qui raconte sa propre création. Manicule : la petite main ☞. Eigengrau : le gris que l'œil voit dans le noir total." },
  { mots: ["Bérézina", "Vorbalise", "Spationaute", "Charolais"], faux: "Vorbalise",
    texte: "Vorbalise n'existe pas. Bérézina : un désastre complet. Spationaute : l'astronaute à la française. Charolais : une race de vache et un fromage." },
];
function formatInvente(item, b, suite) {
  const zone = h("div");
  const grille = h("div", { class: "multi" }, melanger(item.mots).map((m) => h("button", { class: "tuile", type: "button", onclick: (e) => {
    if (b.classList.contains("fini")) return;
    b.classList.add("fini");
    const juste = m === item.faux;
    for (const t of grille.children) { t.disabled = true; t.classList.add(t.textContent === item.faux ? "bon" : "barre"); }
    if (!juste) e.currentTarget.classList.add("erreur");
    verdict(zone, juste, juste ? 800 : 0, item.texte, suite);
  } }, m)));
  vider(b, h("h1", { class: "question" }, "Un de ces mots n'existe pas. Lequel ?"), grille, zone);
}

/* ---------- Format 7 : le pari ---------- */

const PARI_IDS = [["femto", 0], ["charolais", 0], ["cachalot", 0]];
function formatPari([id, qi], b, suite) {
  const q = QUESTIONS[id][qi];
  const zone = h("div");
  const mises = h("div", { class: "lb-mises" }, [250, 500, 1000].map((m) => h("button", { class: "lb-mise", type: "button", onclick: () => miser(m) }, `${nb(m)}`)));
  const reps = h("p", { class: "reponses" });
  const miser = (m) => {
    mises.remove();
    consigne.textContent = `Tu mises ${nb(m)} points. Bonne réponse : tu les doubles. Mauvaise : tu les perds.`;
    const opts = q.ordre ? q.choix.map((c, i) => [c, i]) : melanger(q.choix.map((c, i) => [c, i]));
    opts.forEach(([lib, i], k) => {
      reps.append(h("button", { class: "rep", type: "button", onclick: (e) => {
        if (reps.classList.contains("fini")) return;
        reps.classList.add("fini");
        for (const x of reps.querySelectorAll(".rep")) { x.disabled = true; x.classList.add(Number(x.dataset.v) === q.reponse ? "bon" : "barre"); }
        e.currentTarget.classList.add("choisi");
        const juste = i === q.reponse;
        if (!juste) { score -= m; gagner(0); }
        verdict(zone, juste, juste ? m * 2 : 0, `${juste ? "" : `−${nb(m)} points. `}${q.explication}`, suite);
      }, "data-v": i }, lib));
      if (k < opts.length - 1) reps.append(h("span", { class: "liant" }, k === opts.length - 2 ? " ou " : ", "));
    });
    reps.append(h("span", { class: "liant" }, " ?"));
  };
  const consigne = h("p", { class: "consigne" }, "Avant de voir les réponses, combien tu mises ?");
  vider(b, h("h1", { class: "question" }, q.texte), consigne, mises, reps, zone);
}

/* ---------- Format 8 : le chrono ---------- */

const CHRONO_IDS = [["nintendo", 0], ["statue", 0], ["justin", 0]];
function formatChrono([id, qi], b, suite) {
  const q = QUESTIONS[id][qi];
  const DUREE = 8;
  const barre = h("i");
  const chrono = h("div", { class: "chrono" }, barre);
  const zone = h("div");
  const reps = h("p", { class: "reponses" });
  let debut = 0, raf = 0, fini = false;
  const finir = (juste, restant, bouton) => {
    if (fini) return;
    fini = true; cancelAnimationFrame(raf); reps.classList.add("fini");
    for (const x of reps.querySelectorAll(".rep")) { x.disabled = true; x.classList.add(Number(x.dataset.v) === q.reponse ? "bon" : "barre"); }
    bouton?.classList.add("choisi");
    verdict(zone, juste, juste ? Math.round(300 + 1700 * restant) : 0, `${bouton ? "" : "Temps écoulé. "}${q.explication}`, suite);
  };
  const opts = q.ordre ? q.choix.map((c, i) => [c, i]) : melanger(q.choix.map((c, i) => [c, i]));
  const go = h("button", { class: "gros-bouton", type: "button", onclick: () => {
    go.remove();
    opts.forEach(([lib, i], k) => {
      reps.append(h("button", { class: "rep", type: "button", "data-v": i, onclick: (e) => finir(i === q.reponse, Math.max(0, 1 - (performance.now() - debut) / (DUREE * 1000)), e.currentTarget) }, lib));
      if (k < opts.length - 1) reps.append(h("span", { class: "liant" }, k === opts.length - 2 ? " ou " : ", "));
    });
    reps.append(h("span", { class: "liant" }, " ?"));
    debut = performance.now();
    const tic = (t) => { const reste = Math.max(0, 1 - (t - debut) / (DUREE * 1000)); barre.style.width = `${reste * 100}%`; if (reste <= 0) finir(false, 0, null); else raf = requestAnimationFrame(tic); };
    raf = requestAnimationFrame(tic);
  } }, "Lancer le chrono");
  vider(b, h("p", { class: "consigne" }, `${DUREE} secondes. Plus tu réponds vite, plus tu gagnes.`), h("h1", { class: "question" }, q.texte), chrono, go, reps, zone);
}

/* ---------- Déroulé et votes ---------- */

const FORMATS = [
  { nom: "La frise à placer", desc: "Tu poses toi-même l'événement sur la ligne du temps.", items: FRISE_ITEMS, jouer: formatFrise },
  { nom: "Le curseur", desc: "Tu estimes un chiffre. Plus tu es près, plus ça rapporte.", items: CURSEUR_ITEMS, jouer: formatCurseur },
  { nom: "Vrai ou faux à glisser", desc: "Des cartes à envoyer à droite ou à gauche.", items: [null], jouer: (_, b, s) => formatSwipe(cartesSwipe(), b, s) },
  { nom: "Les lettres", desc: "Tu reconstitues le mot toi-même.", items: LETTRES_ITEMS, jouer: formatLettres },
  { nom: "La citation à trous", desc: "Tu complètes une phrase célèbre.", items: TROUS_ITEMS, jouer: formatTrous },
  { nom: "Le mot inventé", desc: "Trois vrais mots, un faux. Trouve l'intrus.", items: INVENTE_ITEMS, jouer: formatInvente },
  { nom: "Le pari", desc: "Tu mises avant de voir les réponses.", items: PARI_IDS, jouer: formatPari },
  { nom: "Le chrono", desc: "Une question, huit secondes, des points qui fondent.", items: CHRONO_IDS, jouer: formatChrono },
];
const VOTES_CLE = "funfacts:labo";
const votes = (() => { try { return JSON.parse(localStorage.getItem(VOTES_CLE)) || {}; } catch (_) { return {}; } })();
const sauverVotes = () => { try { localStorage.setItem(VOTES_CLE, JSON.stringify(votes)); } catch (_) {} };

function lancerFormat(f) {
  $("lb-etape").textContent = `${f + 1}/${FORMATS.length}`;
  const F = FORMATS[f];
  const titre = bande();
  vider(titre, h("div", { class: "etiquettes" }, h("span", { class: "etiq" }, `Format ${f + 1} sur ${FORMATS.length}`)),
    h("h1", { class: "lb-titre" }, F.nom), h("p", { class: "consigne" }, F.desc),
    h("button", { class: "gros-bouton", type: "button", onclick: (e) => { e.currentTarget.disabled = true; item(0); } }, "Essayer"));
  allerA(titre);
  const item = (k) => {
    if (k >= F.items.length) return voter(f);
    const b = bande();
    F.jouer(F.items[k], b, () => item(k + 1));
    allerA(b);
  };
}

function voter(f) {
  const F = FORMATS[f];
  const b = bande();
  const choix = [["garde", "Je garde"], ["peut-etre", "Peut-être"], ["non", "Non"]];
  vider(b, h("h1", { class: "question" }, `Et « ${F.nom} », tu en penses quoi ?`),
    h("div", { class: "lb-votes" }, choix.map(([v, lib]) => h("button", { class: "gros-bouton", type: "button", onclick: () => {
      votes[F.nom] = lib; sauverVotes();
      b.querySelectorAll("button").forEach((x) => (x.disabled = true));
      if (f + 1 < FORMATS.length) lancerFormat(f + 1); else bilan();
    } }, lib))),
    h("button", { class: "lien-texte", type: "button", onclick: (e) => { e.currentTarget.remove(); lancerFormat(f); } }, "Rejouer ce format"));
  allerA(b);
}

function bilan() {
  $("lb-etape").textContent = "Fini";
  const b = bande();
  const texte = FORMATS.map((F) => `${F.nom} : ${votes[F.nom] || "pas voté"}`).join("\n");
  const copier = h("button", { class: "gros-bouton", type: "button", onclick: async () => {
    try { await navigator.clipboard.writeText(`Mes votes du labo des formats :\n${texte}`); copier.textContent = "Copié !"; } catch (_) { copier.textContent = "Copie impossible, fais une capture"; }
  } }, "Copier mes votes");
  vider(b, h("h1", { class: "question" }, "Tes votes"), h("p", { class: "lb-score-final" }, `${nb(score)} points au total`),
    h("ul", { class: "lb-bilan" }, FORMATS.map((F) => h("li", null, h("b", null, F.nom), ` : ${votes[F.nom] || "pas voté"}`))),
    h("p", { class: "consigne" }, "Copie-les et colle-les-moi dans la conversation."), copier,
    h("p", null, h("a", { href: "./" }, "Retour au jeu")));
  allerA(b);
}

const intro = bande();
vider(intro, h("div", { class: "etiquettes" }, h("span", { class: "etiq" }, "Banc d'essai")),
  h("h1", { class: "lb-titre" }, "Labo des formats"),
  h("p", { class: "consigne" }, `${FORMATS.length} façons de poser une question, deux ou trois essais chacune. Après chaque format, dis si tu le gardes.`),
  h("button", { class: "gros-bouton", type: "button", onclick: (e) => { e.currentTarget.disabled = true; lancerFormat(0); } }, "C'est parti"));
