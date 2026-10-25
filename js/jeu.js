import { SALLES, FRISE, VERIFIE_LE } from "./data.js";
import { QUESTIONS, SERIES, PEPITES, NIVEAUX } from "./questions.js";

/* ---------- Outils ---------- */

const $ = (id) => document.getElementById(id);
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
// Espaces insécables à la française : jamais de « ? » ou de « » » seul en début de ligne.
const fr = (t) => t.replace(/ ([?!:;»])/g, "\u202F$1").replace(/« /g, "«\u202F");
const vider = (el, ...enfants) => el.replaceChildren(...enfants.flat(Infinity).filter((e) => e != null && e !== false));
const melanger = (a) => {
  const t = a.slice();
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
};
const pluriel = (n, mot, mots = mot + "s") => `${n} ${n > 1 ? mots : mot}`;
const reduit = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const aujourdhui = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const salleParId = Object.fromEntries(SALLES.map((s) => [s.id, s]));
const serieDe = Object.fromEntries(SERIES.flatMap((s) => s.ids.map((id) => [id, s])));
const estPepite = (id) => PEPITES.includes(id);
const TOTAL = SALLES.length;

/* ---------- Sauvegarde (navigateur) ---------- */

const CLE = "funfacts:v4";
const etat = (() => {
  let e = {};
  try { e = JSON.parse(localStorage.getItem(CLE)) || {}; } catch (_) { e = {}; }
  return {
    trouves: e.trouves || {},
    pistes: Array.isArray(e.pistes) ? e.pistes : [],
    xp: e.xp || 0,
    record: e.record || 0,
    son: e.son !== false,
    typo: e.typo || "fraunces",
    pepiteGarantie: !!e.pepiteGarantie,
    depuisArchives: e.depuisArchives || 0,
  };
})();
const sauver = () => {
  try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (_) { /* navigation privée : la partie reste valable pour cette visite */ }
};
const nbTrouves = () => Object.keys(etat.trouves).filter((id) => salleParId[id]).length;

/* ---------- Miniatures 3D (chargées à la demande) ---------- */

let module3D = null;
const cacheImg = new Map();
async function charger3D() {
  if (module3D !== null) return module3D;
  try {
    const m = await import("./scene.js");
    module3D = m.webglDispo() ? m : false;
  } catch (e) {
    module3D = false;
  }
  return module3D;
}
async function urlObjet(objet) {
  if (cacheImg.has(objet)) return cacheImg.get(objet);
  const m = await charger3D();
  const url = m ? m.miniature(objet) : null;
  cacheImg.set(objet, url);
  return url;
}
function imageObjet(objet, cls) {
  const img = h("img", { class: cls || "", alt: "", decoding: "async" });
  urlObjet(objet).then((u) => {
    if (u) img.src = u;
    else img.replaceWith(h("span", { class: "objet-repli", "aria-hidden": "true" }, "?"));
  });
  return img;
}

/* ---------- Sons ---------- */

let audio = null;
function note(freq, debut, duree, type = "sine", vol = 0.16) {
  if (!etat.son) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const t = audio.currentTime + debut;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    o.connect(g).connect(audio.destination);
    o.start(t);
    o.stop(t + duree + 0.05);
  } catch (_) { /* pas de son, tant pis */ }
}
const SONS = {
  juste: (combo) => { const b = 660 * Math.pow(1.06, Math.min(combo, 8)); note(b, 0, 0.18, "triangle"); note(b * 1.5, 0.08, 0.28, "triangle"); },
  faux: () => { note(196, 0, 0.22, "square", 0.07); note(147, 0.09, 0.3, "square", 0.06); },
  porte: () => note(880, 0, 0.08, "sine", 0.08),
  niveau: () => [523, 659, 784, 1047, 1319].forEach((f, i) => note(f, i * 0.09, 0.32, "triangle", 0.14)),
  serie: () => [784, 988, 1175, 1568].forEach((f, i) => note(f, i * 0.07, 0.3, "sine", 0.12)),
  pepite: () => [1319, 1568, 2093].forEach((f, i) => note(f, i * 0.06, 0.22, "sine", 0.1)),
};

/* ---------- Niveaux, combo, HUD ---------- */

let combo = 0;
const multiplicateur = () => Math.min(4, 1 + Math.floor(combo / 3));
const niveauDe = (xp) => {
  let i = 0;
  NIVEAUX.forEach((n, k) => { if (xp >= n.xp) i = k; });
  return i;
};

function majHud(anime) {
  const i = niveauDe(etat.xp);
  const n = NIVEAUX[i], suiv = NIVEAUX[i + 1];
  $("niv").textContent = `Niv. ${i + 1}`;
  $("niv-nom").textContent = n.nom;
  const p = suiv ? (etat.xp - n.xp) / (suiv.xp - n.xp) : 1;
  $("xp-barre").style.width = `${Math.round(p * 100)}%`;
  $("btn-niveau").setAttribute("aria-label", `Niveau ${i + 1}, ${n.nom} : ${etat.xp} points${suiv ? `, prochain niveau à ${suiv.xp}` : ""}`);
  $("nb-trouves").textContent = `${nbTrouves()}/${TOTAL}`;
  $("btn-collection").setAttribute("aria-label", `Ma collection : ${nbTrouves()} faits sur ${TOTAL}`);
  const np = etat.pistes.filter((id) => !etat.trouves[id]).length;
  $("nb-pistes").textContent = np;
  $("btn-pistes").setAttribute("aria-label", `${pluriel(np, "piste")} en attente`);
  const m = multiplicateur();
  const s = $("serie");
  s.hidden = m < 2;
  s.textContent = `Combo ×${m}`;
  if (anime) for (const id of anime) { const el = $(id); el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
}

function gagner(points, x, y) {
  const avant = niveauDe(etat.xp);
  etat.xp += points;
  if (x != null) {
    const f = h("span", { class: "flotteur", style: `left:${x}px;top:${y}px` }, `+${points}`);
    document.body.append(f);
    setTimeout(() => f.remove(), 1200);
  }
  const apres = niveauDe(etat.xp);
  sauver();
  majHud(["btn-niveau"]);
  if (apres > avant) {
    etat.pepiteGarantie = true;
    sauver();
    setTimeout(() => {
      SONS.niveau();
      annoncer(`Niveau ${apres + 1}`, NIVEAUX[apres].nom, "Récompense : une pépite t'attend dans tes prochaines pistes.");
    }, 700);
  }
}

function annoncer(sur, titre, texte) {
  const a = $("annonce");
  const btn = h("button", { class: "gros-bouton", type: "button", onclick: () => (a.hidden = true) }, "Continuer");
  vider(a, h("div", { class: "carte", role: "dialog", "aria-modal": "true", "aria-label": titre }, h("small", null, sur), h("h2", null, titre), h("p", null, texte), btn));
  a.hidden = false;
  btn.focus({ preventScroll: true });
}
$("annonce").addEventListener("click", (e) => { if (e.target.id === "annonce") e.currentTarget.hidden = true; });
addEventListener("keydown", (e) => { if (e.key === "Escape") $("annonce").hidden = true; });

function toast(...contenu) {
  const t = h("div", { class: "toast" }, contenu);
  $("toasts").append(t);
  setTimeout(() => t.remove(), 2900);
}

function confettis(x, y, couleurs, nb = 22) {
  if (reduit()) return;
  const c = h("div", { class: "confettis", style: `left:${x}px;top:${y}px;position:fixed;z-index:30` });
  for (let i = 0; i < nb; i++) {
    const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 120;
    c.append(h("i", { style: `--c:${couleurs[i % couleurs.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 40}px;--rot:${Math.random() * 720 - 360}deg` }));
  }
  document.body.append(c);
  setTimeout(() => c.remove(), 1000);
}

/* ---------- Couleurs des bandes ---------- */

const PALETTE = [
  ["#FF5A36", "#15131A"], ["#B9A6FF", "#15131A"], ["#FFD23F", "#15131A"], ["#7FD8BE", "#15131A"],
  ["#FF9EC7", "#15131A"], ["#3D5AFE", "#FBF5E9", true], ["#2B2533", "#FFD23F", true],
];
let nBandes = 0;
function nouvelleBande(cls) {
  const [fond, texte, clair] = PALETTE[nBandes++ % PALETTE.length];
  const b = h("section", { class: `bande ${clair ? "clair" : ""} ${cls || ""}`, style: `--fond:${fond};--texte:${texte}`, tabindex: "-1" });
  $("fil").append(b);
  return b;
}
function allerA(b) {
  b.scrollIntoView({ behavior: reduit() ? "auto" : "smooth", block: "start" });
  setTimeout(() => (b.querySelector("h1, h2") || b).focus({ preventScroll: true }), reduit() ? 0 : 450);
}

/* ---------- Un fait ---------- */

function choisirDepart() {
  const pistes = etat.pistes.filter((id) => !etat.trouves[id] && salleParId[id]);
  if (pistes.length) return pistes[pistes.length - 1];
  const restants = SALLES.filter((s) => !etat.trouves[s.id]);
  if (!restants.length) return null;
  const sansPepite = restants.filter((s) => !estPepite(s.id));
  return melanger(sansPepite.length ? sansPepite : restants)[0].id;
}

function afficherFait(id, premier) {
  const s = salleParId[id];
  etat.pistes = etat.pistes.filter((x) => x !== id);
  sauver();
  majHud();
  const b = nouvelleBande();
  const serie = serieDe[id];
  const zoneObjet = h("div", { class: "objet-zone" }, imageObjet(s.objet, "objet"));
  const tete = h("div", { class: "tete" });
  const suite = h("div", { class: "suite", hidden: true });
  vider(b,
    h("div", { class: "etiquettes" },
      h("span", { class: "etiq" }, serie.nom),
      estPepite(id) ? h("span", { class: "etiq pepite" }, "Pépite ×2") : null,
      etat.trouves[id] ? h("span", { class: "etiq" }, "Déjà dans ta collection") : null),
    tete, suite);
  poser(s, 0, { b, tete, suite, zoneObjet });
  if (!premier) allerA(b);
  else setTimeout(() => b.querySelector("h1")?.focus({ preventScroll: true }), 50);
}

function poser(s, qi, z) {
  const q = QUESTIONS[s.id][qi];
  const total = QUESTIONS[s.id].length;
  const opts = q.type === "vf"
    ? [["Vrai", true], ["Faux", false]]
    : (q.ordre ? q.choix.map((c, i) => [c, i]) : melanger(q.choix.map((c, i) => [c, i])));
  const reps = h("p", { class: "reponses" });
  opts.forEach(([lib, val], i) => {
    reps.append(h("button", { class: "rep", type: "button", "data-v": String(val), onclick: (e) => repondre(s, qi, z, reps, e.currentTarget, val) }, lib));
    if (i < opts.length - 1) reps.append(h("span", { class: "liant" }, i === opts.length - 2 ? " ou " : ", "));
  });
  if (q.type === "qcm") reps.append(h("span", { class: "liant" }, " ?"));
  vider(z.tete,
    z.zoneObjet,
    total > 1 ? h("p", { class: "q-num" }, `Question ${qi + 1} sur ${total}`) : null,
    h("h1", { class: `question ${q.texte.length > 72 ? "longue" : ""}`, tabindex: "-1" }, q.texte),
    reps);
  if (qi > 0) z.tete.querySelector("h1").focus({ preventScroll: true });
}

function repondre(s, qi, z, reps, bouton, val) {
  if (reps.classList.contains("fini")) return;
  reps.classList.add("fini");
  const q = QUESTIONS[s.id][qi];
  const juste = val === q.reponse;
  for (const x of reps.querySelectorAll(".rep")) {
    const v = x.dataset.v === "true" ? true : x.dataset.v === "false" ? false : Number(x.dataset.v);
    x.classList.add(v === q.reponse ? "bon" : "barre");
    if (x === bouton) x.classList.add("choisi");
    x.disabled = true;
  }
  const r = bouton.getBoundingClientRect();
  let gain;
  if (juste) {
    gain = 10 * multiplicateur() * (estPepite(s.id) ? 2 : 1);
    combo++;
    etat.record = Math.max(etat.record, combo);
    SONS.juste(combo);
    if (estPepite(s.id)) setTimeout(SONS.pepite, 160);
    confettis(r.left + r.width / 2, r.top + r.height / 2, estPepite(s.id) ? ["#FFC93C", "#FFE08A", "#FFF4D0"] : ["#15131A", "#FBF5E9", "#FFC93C", "#3D5AFE"]);
  } else {
    gain = 2;
    combo = 0;
    SONS.faux();
    reps.classList.add("secoue");
  }
  gagner(gain, r.left + r.width / 2, r.top);

  const lignes = [
    h("p", { class: "verdict" }, h("b", null, juste ? "Bien vu." : "Raté."), h("span", { class: "gain" }, juste ? `+${gain} points${multiplicateur() > 1 && combo > 1 ? ` · combo de ${combo}` : ""}` : `+${gain} points pour avoir appris quelque chose`)),
    h("p", null, q.explication),
  ];
  const total = QUESTIONS[s.id].length;
  if (qi < total - 1) {
    vider(z.suite, lignes, h("button", { class: "gros-bouton", type: "button", onclick: () => { z.suite.hidden = true; poser(s, qi + 1, z); } }, "Question suivante"));
    z.suite.hidden = false;
    return;
  }
  // Dernière question : l'objet se révèle et rejoint la collection.
  z.b.classList.add("revele");
  const nouveau = !etat.trouves[s.id];
  if (nouveau) etat.trouves[s.id] = { date: aujourdhui(), juste };
  etat.depuisArchives++;
  sauver();
  majHud(nouveau ? ["btn-collection"] : null);

  const serie = serieDe[s.id];
  const nSerie = serie.ids.filter((id) => etat.trouves[id]).length;
  if (s.saviezVous) lignes.push(h("p", { class: "saviez" }, h("b", null, "Le saviez-vous ?"), s.saviezVous));
  if (s.note) lignes.push(h("p", { class: "note" }, h("b", null, "Note de vérification : "), s.note));
  lignes.push(blocSources(s.sources));
  const jauge = h("i", { style: "width:0%" });
  lignes.push(h("div", { class: "acquis" },
    imageObjet(s.objet),
    h("div", null, nouveau ? "Ajouté à ta collection" : "Déjà dans ta collection", h("br"), h("b", null, `${serie.nom} : ${nSerie}/${serie.ids.length}`), h("span", { class: "jauge" }, jauge))));
  requestAnimationFrame(() => requestAnimationFrame(() => (jauge.style.width = `${(nSerie / serie.ids.length) * 100}%`)));
  lignes.push(blocPortes(s, z.b));
  vider(z.suite, lignes);
  z.suite.hidden = false;

  if (nouveau && nSerie === serie.ids.length) {
    setTimeout(() => {
      SONS.serie();
      gagner(50);
      annoncer("Série complète", serie.nom, `Tu as trouvé les ${serie.ids.length} faits de la série. +50 points.`);
    }, 900);
  } else if (nouveau && serie.ids.length - nSerie === 1) {
    setTimeout(() => toast("Plus qu'un fait pour compléter ", h("b", null, serie.nom)), 800);
  }
}

function blocSources(sources) {
  const p = h("p", { class: "sources" }, sources.length > 1 ? "Sources : " : "Source : ");
  sources.forEach((x, i) => {
    p.append(x.url ? h("a", { href: x.url, target: "_blank", rel: "noopener" }, x.nom) : h("b", null, x.nom), ` (${x.titre})${i < sources.length - 1 ? ", " : "."}`);
  });
  p.append(h("br"), `Vérifié le ${new Date(VERIFIE_LE + "T12:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.`);
  return p;
}

/* ---------- Les pistes (terrier de lapin) ---------- */

function choisirPortes(s) {
  const libres = SALLES.filter((x) => x.id !== s.id && !etat.trouves[x.id]);
  const res = [];
  for (const l of s.liens || []) {
    const c = libres.find((x) => x.id === l.vers);
    if (c && res.length < 2 && !res.includes(c)) res.push(c);
  }
  const enAttente = libres.filter((x) => etat.pistes.includes(x.id));
  for (const c of melanger(libres.filter((x) => !enAttente.includes(x)))) {
    if (res.length >= 2) break;
    if (!res.includes(c) && (!estPepite(c.id) || Math.random() < 0.35)) res.push(c);
  }
  for (const c of melanger(libres)) { if (res.length >= 2) break; if (!res.includes(c)) res.push(c); }
  if (etat.pepiteGarantie && !res.some((c) => estPepite(c.id))) {
    const p = melanger(libres.filter((c) => estPepite(c.id)))[0];
    if (p) res[res.length >= 2 ? 1 : res.length] = p;
  }
  // Deux pistes = deux directions : jamais deux fois la même série si on peut l'éviter.
  if (res.length === 2 && serieDe[res[0].id] === serieDe[res[1].id]) {
    const garder = estPepite(res[1].id) ? 1 : 0;
    const autre = melanger(libres).find((c) => serieDe[c.id] !== serieDe[res[garder].id] && (!estPepite(c.id) || !etat.pepiteGarantie || garder === 0));
    if (autre) res[1 - garder] = autre;
  }
  return res.slice(0, 2);
}

function blocPortes(s, bande) {
  const portes = choisirPortes(s);
  if (!portes.length) {
    const reste = etat.pistes.filter((id) => !etat.trouves[id]);
    return h("div", { class: "pistes-zone" },
      h("p", null, reste.length ? "Ce terrier-là est épuisé." : "Tu as tout trouvé."),
      reste.length ? h("button", { class: "lien-texte", type: "button", onclick: ouvrirPistes }, `Reprendre une de tes ${pluriel(reste.length, "piste")} en attente`) : h("button", { class: "lien-texte", type: "button", onclick: ouvrirCollection }, "Voir ma collection complète"));
  }
  const zone = h("div", { class: "portes" });
  const boutons = portes.map((c) => {
    const pep = estPepite(c.id);
    const b = h("button", { class: `porte ${pep ? "pepite" : ""}`, type: "button", "aria-label": `Suivre la piste ${serieDe[c.id].nom}${pep ? ", pépite" : ""}` },
      imageObjet(c.objet),
      h("span", { class: "p-serie" }, serieDe[c.id].nom),
      h("span", { class: "p-type" }, pep ? "Pépite" : etat.pistes.includes(c.id) ? "Piste en attente" : "Nouvelle piste"));
    b.addEventListener("click", () => {
      if (b.disabled) return;
      SONS.porte();
      boutons.forEach((o) => (o.disabled = true));
      b.classList.add("choisie");
      // L'autre piste n'est pas perdue : elle part dans les pistes en attente.
      for (const o of portes) if (o !== c && !etat.pistes.includes(o.id)) etat.pistes.push(o.id);
      if (estPepite(c.id)) etat.pepiteGarantie = false;
      sauver();
      majHud(portes.length > 1 ? ["btn-pistes"] : null);
      if (portes.length > 1) toast("L'autre piste est gardée dans tes ", h("b", null, "pistes en attente"));
      suivant(c.id);
    });
    zone.append(b);
    return b;
  });
  return h("div", { class: "pistes-zone" },
    h("p", null, portes.length > 1 ? "Deux pistes s'ouvrent. Laquelle tu suis ?" : "Une piste s'ouvre."),
    portes.length > 1 ? h("p", { class: "aide" }, "L'autre ne sera pas perdue : elle t'attendra dans tes pistes.") : null,
    zone);
}

function suivant(id) {
  if (etat.depuisArchives >= 5 && archivesPossibles().length >= 4) afficherArchives(() => afficherFait(id));
  else afficherFait(id);
}

/* ---------- Salle des archives : remettre dans l'ordre ---------- */

// Un seul moment par année, pour que l'ordre ne soit jamais ambigu.
const archivesPossibles = () => {
  const vus = new Set();
  return melanger(FRISE.filter((m) => etat.trouves[m.salle])).filter((m) => {
    const an = Math.floor(m.date);
    if (vus.has(an)) return false;
    vus.add(an);
    return true;
  });
};

function afficherArchives(ensuite) {
  etat.depuisArchives = 0;
  sauver();
  const pris = archivesPossibles().slice(0, 4);
  const ordre = pris.slice().sort((a, b) => a.date - b.date);
  let places = pris.map(() => null);
  let reserve = melanger(pris);
  const b = nouvelleBande("archives");
  const zoneRes = h("div", { class: "fragments", role: "group", "aria-label": "Moments à placer" });
  const liste = h("ol", { class: "frise", "aria-label": "Du plus ancien au plus récent" });
  const valider = h("button", { class: "gros-bouton valider", type: "button", disabled: true }, "Valider l'ordre");
  const fin = h("div");
  const rendre = () => {
    vider(zoneRes, reserve.map((m) => h("button", { class: "fragment", type: "button", onclick: () => {
      const k = places.indexOf(null);
      if (k < 0) return;
      places[k] = m;
      reserve = reserve.filter((x) => x !== m);
      SONS.porte();
      rendre();
    } }, m.texte)));
    vider(liste, places.map((m, k) => h("li", null,
      h("span", { class: "num", "aria-hidden": "true" }, k + 1),
      m ? h("button", { class: "fragment pose", type: "button", "aria-label": `Position ${k + 1} : ${m.texte}. Toucher pour retirer.`, onclick: () => { places[k] = null; reserve.push(m); rendre(); } }, m.texte)
        : h("span", { class: "vide" }, k === 0 ? "Le plus ancien" : k === places.length - 1 ? "Le plus récent" : "…"))));
    valider.disabled = places.includes(null);
  };
  valider.addEventListener("click", () => {
    valider.remove();
    zoneRes.remove();
    let bons = 0;
    vider(liste, places.map((m, k) => {
      const ok = m.id === ordre[k].id;
      if (ok) bons++;
      return h("li", { class: ok ? "ok" : "ko" }, h("span", { class: "num", "aria-hidden": "true" }, k + 1),
        h("div", { class: "fragment pose fige" }, m.texte, h("small", null, `${m.affichage}${ok ? "" : ` · à la place ${ordre.findIndex((o) => o.id === m.id) + 1}`}`)));
    }));
    const pts = bons * 15 + (bons === pris.length ? 20 : 0);
    const r = liste.getBoundingClientRect();
    if (bons) { SONS.juste(bons); gagner(pts, innerWidth / 2, Math.max(80, r.top)); } else SONS.faux();
    vider(fin,
      h("p", { class: "verdict" }, h("b", null, bons === pris.length ? "Sans faute." : `${bons} sur ${pris.length}.`), h("span", { class: "gain" }, pts ? `+${pts} points` : "")),
      h("button", { class: "gros-bouton", type: "button", onclick: ensuite }, "Reprendre le terrier"));
  });
  vider(b,
    h("div", { class: "etiquettes" }, h("span", { class: "etiq" }, "Salle des archives")),
    h("h1", { class: "question", tabindex: "-1" }, "Remets ces moments dans l'ordre."),
    h("p", null, "Ils viennent des faits que tu as trouvés. Touche-les du plus ancien au plus récent."),
    zoneRes, liste, valider, fin);
  rendre();
  allerA(b);
}

/* ---------- Tiroirs ---------- */

function tete(titre, sousTitre, dlg) {
  return h("div", { class: "t-tete" }, h("div", null, h("h2", null, titre), sousTitre ? h("p", null, sousTitre) : null),
    h("button", { class: "fermer", type: "button", onclick: () => dlg.close() }, "Fermer"));
}

function ouvrirCollection() {
  const dlg = $("dlg-collection");
  const n = nbTrouves();
  vider(dlg,
    tete("Ta collection", `${n} sur ${TOTAL} · ${Math.round((n / TOTAL) * 100)} % du terrier · record de combo : ${etat.record}`, dlg),
    h("div", { class: "progression" }, h("i", { style: `width:${(n / TOTAL) * 100}%` })),
    h("div", { class: "t-corps" }, SERIES.map((serie) => {
      const nS = serie.ids.filter((id) => etat.trouves[id]).length;
      return h("section", { class: `serie-bloc ${nS === serie.ids.length ? "complete" : ""}` },
        h("h3", null, serie.nom, h("span", null, `${nS}/${serie.ids.length}`)),
        h("div", { class: "grille" }, serie.ids.map((id) => {
          const s = salleParId[id];
          if (etat.trouves[id]) return h("button", { class: "case", type: "button", onclick: () => ouvrirFiche(id) }, imageObjet(s.objet), s.nom);
          const attente = etat.pistes.includes(id);
          if (attente) return h("button", { class: "case cachee en-attente", type: "button", onclick: () => { dlg.close(); afficherFait(id); } }, imageObjet(s.objet), "En attente");
          return h("div", { class: "case cachee", "aria-label": "Pas encore trouvé" }, imageObjet(s.objet), "?");
        })));
    })));
  if (!dlg.open) dlg.showModal();
}

function ouvrirPistes() {
  const dlg = $("dlg-pistes");
  const ids = etat.pistes.filter((id) => !etat.trouves[id]).reverse();
  vider(dlg,
    tete("Pistes en attente", ids.length ? `${pluriel(ids.length, "piste")} que tu n'as pas suivies` : null, dlg),
    h("div", { class: "t-corps" },
      ids.length
        ? ids.map((id) => h("button", { class: "piste-ligne", type: "button", onclick: () => { dlg.close(); afficherFait(id); } },
          imageObjet(salleParId[id].objet), h("div", null, h("b", null, serieDe[id].nom), h("span", null, estPepite(id) ? "★ Pépite" : "Toucher pour la suivre"))))
        : h("p", { class: "vide-texte" }, "Aucune piste en attente. Chaque fois que tu choisis une piste, l'autre arrive ici.")));
  if (!dlg.open) dlg.showModal();
}

function ouvrirFiche(id) {
  const dlg = $("dlg-fiche");
  const s = salleParId[id];
  vider(dlg,
    tete(s.nom, `${serieDe[id].nom} · trouvé le ${new Date(etat.trouves[id].date + "T12:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`, dlg),
    h("div", { class: "t-corps fiche" },
      imageObjet(s.objet, "fiche-img"),
      QUESTIONS[id].map((q) => [
        h("p", { class: "fiche-q" }, q.texte),
        h("p", { class: "fiche-r" }, `Réponse : ${q.type === "vf" ? (q.reponse ? "vrai" : "faux") : q.choix[q.reponse]}`),
        h("p", null, q.explication)]),
      s.saviezVous ? h("p", { class: "saviez" }, h("b", null, "Le saviez-vous ?"), s.saviezVous) : null,
      s.note ? h("p", { class: "note" }, h("b", null, "Note de vérification : "), s.note) : null,
      blocSources(s.sources)));
  dlg.showModal();
}

for (const d of ["dlg-collection", "dlg-pistes", "dlg-fiche"]) {
  $(d).addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
}
$("btn-collection").addEventListener("click", ouvrirCollection);
$("btn-pistes").addEventListener("click", ouvrirPistes);
$("btn-niveau").addEventListener("click", () => {
  const i = niveauDe(etat.xp), suiv = NIVEAUX[i + 1];
  toast(`${etat.xp} points · `, h("b", null, NIVEAUX[i].nom), suiv ? ` · ${suiv.nom} à ${suiv.xp}` : " · niveau maximum");
});

/* ---------- Réglages : son et typo ---------- */

const TYPOS = ["fraunces", "instrument", "unbounded"];
function appliquerTypo() { document.documentElement.dataset.typo = etat.typo; }
$("btn-typo").addEventListener("click", () => {
  etat.typo = TYPOS[(TYPOS.indexOf(etat.typo) + 1) % TYPOS.length];
  appliquerTypo();
  sauver();
  toast("Typo : ", h("b", null, { unbounded: "Unbounded", fraunces: "Fraunces", instrument: "Instrument Serif" }[etat.typo]));
});
function appliquerSon() {
  const b = $("btn-son");
  b.setAttribute("aria-pressed", String(etat.son));
  b.setAttribute("aria-label", etat.son ? "Couper le son" : "Remettre le son");
}
$("btn-son").addEventListener("click", () => { etat.son = !etat.son; sauver(); appliquerSon(); if (etat.son) SONS.porte(); });

/* ---------- Départ : directement dans un fait ---------- */

appliquerTypo();
appliquerSon();
majHud();
const depart = choisirDepart();
if (depart) afficherFait(depart, true);
else {
  const b = nouvelleBande();
  vider(b, h("h1", { class: "question", tabindex: "-1" }, "Tu as tout trouvé."), h("p", null, "De nouveaux faits arrivent bientôt."),
    h("button", { class: "gros-bouton", type: "button", onclick: ouvrirCollection }, "Voir ma collection"));
}
charger3D();
