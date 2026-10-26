import { SALLES, VERIFIE_LE } from "./data.js";
import { QUESTIONS, SERIES, PEPITES, NIVEAUX } from "./questions.js";
import { REACTIONS } from "./reactions.js";
import * as nuage from "./nuage.js";

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
    xp: (e.echelle === 50 ? 1 : 50) * (e.xp || 0),
    record: e.record || 0,
    son: e.son !== false,
    typo: e.typo || "fraunces",
    pepiteGarantie: !!e.pepiteGarantie,
    longueur: e.longueur || 10,
    proposerDuree: !!e.proposerDuree,
    meilleurs: Object.fromEntries(Object.entries(e.meilleurs || {}).map(([k, v]) => [k, (e.echelle === 50 ? 1 : 50) * v])),
    echelle: 50,
    code: e.code || "",
  };
})();
let minuterieNuage = 0;
const progression = () => ({ trouves: etat.trouves, pistes: etat.pistes, xp: etat.xp, record: etat.record, meilleurs: etat.meilleurs });
const sauver = () => {
  try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (_) { /* navigation privée : la partie reste valable pour cette visite */ }
  // Avec un code de sauvegarde, la progression part aussi en ligne (regroupée toutes les 2 secondes).
  if (nuage.actif && etat.code) {
    clearTimeout(minuterieNuage);
    minuterieNuage = setTimeout(() => nuage.ecrireSauvegarde(etat.code, progression()).catch(() => {}), 2000);
  }
};
// Fusionne une progression venue d'un autre appareil : on garde le meilleur des deux.
function fusionner(d) {
  if (!d || typeof d !== "object") return false;
  for (const [id, v] of Object.entries(d.trouves || {})) if (!etat.trouves[id]) etat.trouves[id] = v;
  for (const id of d.pistes || []) if (!etat.pistes.includes(id)) etat.pistes.push(id);
  etat.xp = Math.max(etat.xp, d.xp || 0);
  etat.record = Math.max(etat.record, d.record || 0);
  for (const [k, v] of Object.entries(d.meilleurs || {})) etat.meilleurs[k] = Math.max(etat.meilleurs[k] || 0, v);
  return true;
}
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
  if (partie) $("progression-partie").textContent = `${Math.min(partie.n, partie.total)}/${partie.total}`;
  $("progression-partie").hidden = !partie;
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

// Faits jouables : d'abord ceux pas encore trouvés, puis (pour rejouer) ceux déjà trouvés.
const dejaJoue = (id) => partie && partie.joues.has(id);
function candidats(sauf) {
  const neufs = SALLES.filter((x) => x.id !== sauf && !etat.trouves[x.id] && !dejaJoue(x.id));
  const revus = melanger(SALLES.filter((x) => x.id !== sauf && etat.trouves[x.id] && !dejaJoue(x.id)));
  return { neufs, revus };
}
function choisirDepart() {
  const pistes = etat.pistes.filter((id) => !etat.trouves[id] && salleParId[id] && !dejaJoue(id));
  if (pistes.length) return pistes[pistes.length - 1];
  const { neufs, revus } = candidats();
  if (neufs.length) {
    const sansPepite = neufs.filter((x) => !estPepite(x.id));
    return melanger(sansPepite.length ? sansPepite : neufs)[0].id;
  }
  return revus.length ? revus[0].id : null;
}

function afficherFait(id, premier) {
  const s = salleParId[id];
  etat.pistes = etat.pistes.filter((x) => x !== id);
  sauver();
  if (partie) { partie.n++; partie.joues.add(id); }
  majHud();
  const b = nouvelleBande();
  const serie = serieDe[id];
  const zoneObjet = h("button", { class: "objet-zone", type: "button", tabindex: "-1", "aria-label": "Contempler l'objet", onclick: () => { if (b.classList.contains("revele")) ouvrirObjet(id); } }, imageObjet(s.objet, "objet"));
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

const LOUANGES = ["Bien vu.", "Exact. Bravo !", "Magistral.", "Impressionnant.", "Légendaire.", "Du jamais vu.", "Hors catégorie."];
const CHUTES = ["Raté.", "Perdu, mais tu sais maintenant.", "Pas cette fois.", "Aïe."];
const EXCES = [
  "Plus personne sur Terre ne répond aussi bien que toi en ce moment. (Phrase non vérifiée.)",
  "Les historiens ont été prévenus. (Phrase non vérifiée.)",
  "Un comité d'experts t'applaudit à l'instant. (Phrase non vérifiée.)",
  "Tu viens de battre un record du monde. (Phrase non vérifiée.)",
];

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
    gain = 500 * multiplicateur() * (estPepite(s.id) ? 2 : 1);
    combo++;
    etat.record = Math.max(etat.record, combo);
    SONS.juste(combo);
    if (estPepite(s.id)) setTimeout(SONS.pepite, 160);
    confettis(r.left + r.width / 2, r.top + r.height / 2, estPepite(s.id) ? ["#FFC93C", "#FFE08A", "#FFF4D0"] : ["#15131A", "#FBF5E9", "#FFC93C", "#3D5AFE"]);
  } else {
    gain = 100;
    combo = 0;
    SONS.faux();
    reps.classList.add("secoue");
  }
  gagner(gain, r.left + r.width / 2, r.top);
  if (partie) {
    partie.score += gain;
    partie.questions++;
    if (juste) partie.bonnes++;
    partie.comboMax = Math.max(partie.comboMax, combo);
  }

  const statJoueurs = h("span", { class: "stat-joueurs" });
  if (nuage.actif) {
    const cleQ = `${s.id}:${qi}`;
    nuage.statsDe(cleQ).then((st) => {
      if (st && st.total >= 5) statJoueurs.textContent = `${Math.round((st.justes / st.total) * 100)} % des joueurs ont trouvé`;
      else if (st) statJoueurs.textContent = "Tu fais partie des premiers à répondre";
      nuage.compterReponse(cleQ, juste);
    });
  }
  const react = REACTIONS[`${s.id}:${qi}`];
  const titre = juste ? LOUANGES[Math.min(LOUANGES.length - 1, Math.max(0, combo - 1))] : CHUTES[Math.floor(Math.random() * CHUTES.length)];
  const hyper = juste && combo >= 3 ? EXCES[Math.floor(Math.random() * EXCES.length)] : "";
  const lignes = [
    h("p", { class: "verdict" }, h("b", null, titre), statJoueurs, h("span", { class: "gain" }, juste ? `+${gain.toLocaleString("fr-FR")} points${multiplicateur() > 1 && combo > 1 ? ` · combo de ${combo}` : ""}` : `+${gain} points pour avoir appris quelque chose`)),
    hyper ? h("p", { class: "hyper" }, hyper) : null,
    react ? h("p", { class: "reaction" }, juste ? react.bravo : react.rate) : null,
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
  if (nouveau && partie) partie.gagnes.push(s.id);
  sauver();
  majHud(nouveau ? ["btn-collection"] : null);

  const serie = serieDe[s.id];
  const nSerie = serie.ids.filter((id) => etat.trouves[id]).length;
  if (s.saviezVous) lignes.push(h("p", { class: "saviez" }, h("b", null, "Le saviez-vous ?"), s.saviezVous));
  if (s.note) lignes.push(h("p", { class: "note" }, h("b", null, "Note de vérification : "), s.note));
  lignes.push(blocSources(s.sources));
  const jauge = h("i", { style: "width:0%" });
  lignes.push(h("button", { class: "acquis", type: "button", onclick: () => ouvrirObjet(s.id), "aria-label": `Contempler : ${s.nom}` },
    imageObjet(s.objet),
    h("div", null, nouveau ? "Ajouté à ta collection" : "Déjà dans ta collection", h("br"), h("b", null, `${serie.nom} : ${nSerie}/${serie.ids.length}`), h("span", { class: "jauge" }, jauge)),
    h("span", { class: "contempler" }, "Contempler")));
  requestAnimationFrame(() => requestAnimationFrame(() => (jauge.style.width = `${(nSerie / serie.ids.length) * 100}%`)));
  if (partie && partie.n >= partie.total) {
    lignes.push(h("div", { class: "pistes-zone" }, h("button", { class: "gros-bouton", type: "button", onclick: (e) => { e.currentTarget.disabled = true; finPartie(); } }, "Voir le résultat")));
  } else lignes.push(blocPortes(s, z.b));
  vider(z.suite, lignes);
  z.suite.hidden = false;

  if (nouveau && nSerie === serie.ids.length) {
    setTimeout(() => {
      SONS.serie();
      gagner(2500);
      if (partie) partie.score += 50;
      annoncer("Série complète", serie.nom, `Tu as trouvé les ${serie.ids.length} faits de la série. +2 500 points.`);
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
  const { neufs, revus } = candidats(s.id);
  const libres = neufs.length >= 2 ? neufs : [...neufs, ...revus];
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
      h("span", { class: "p-type" }, etat.trouves[c.id] ? "À revoir" : pep ? "Pépite" : etat.pistes.includes(c.id) ? "Piste en attente" : "Nouvelle piste"));
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
  // Un intermède toutes les 4 questions, si on a déjà assez de faits trouvés pour le nourrir.
  if (partie && partie.n > 0 && partie.n % 4 === 0 && partie.n < partie.total && new Set(affirmationsPossibles().map((a) => a.id)).size >= 4) {
    const jeu = partie.intermedes++ % 2 === 0 ? afficherMenteur : afficherEclair;
    jeu(() => afficherFait(id));
  } else afficherFait(id);
}

/* ---------- Intermèdes : Le menteur et Éclair ---------- */

// Une affirmation = une question déjà trouvée + une réponse proposée (la bonne ou une fausse).
const affirmationsPossibles = () => Object.keys(etat.trouves).filter((id) => salleParId[id]).flatMap((id) => QUESTIONS[id].filter((q) => q.type === "qcm").map((q) => ({ id, q })));
function affirmation({ id, q }, vraie) {
  const fausses = q.choix.filter((_, i) => i !== q.reponse);
  return { id, question: q.texte, prop: vraie ? q.choix[q.reponse] : melanger(fausses)[0], bonne: q.choix[q.reponse], vraie };
}
function carteAffirmation(a) {
  return [h("span", { class: "a-q" }, a.question), h("span", { class: "a-p" }, a.prop)];
}

function afficherMenteur(ensuite) {
  const tirage = melanger(affirmationsPossibles()).filter((x, i, t) => t.findIndex((y) => y.id === x.id) === i).slice(0, 3);
  const faux = Math.floor(Math.random() * 3);
  const items = tirage.map((t, i) => affirmation(t, i !== faux));
  const b = nouvelleBande("intermede");
  const zone = h("div", { class: "affirmations" });
  const fin = h("div");
  items.forEach((a, i) => {
    zone.append(h("button", { class: "affirmation", type: "button", onclick: () => {
      if (zone.classList.contains("fini")) return;
      zone.classList.add("fini");
      const juste = !a.vraie;
      [...zone.children].forEach((c, k) => {
        c.disabled = true;
        c.classList.add(items[k].vraie ? "vraie" : "fausse");
        if (!items[k].vraie) c.append(h("span", { class: "a-corr" }, `Mensonge. La bonne réponse : ${items[k].bonne}`));
      });
      const r = zone.getBoundingClientRect();
      if (juste) { combo++; SONS.juste(combo); confettis(innerWidth / 2, r.top + 40, ["#15131A", "#FBF5E9", "#FFC93C"]); gagner(1250, innerWidth / 2, r.top); if (partie) { partie.score += 1250; partie.bonnes++; } }
      else { combo = 0; SONS.faux(); zone.classList.add("secoue"); gagner(100); if (partie) partie.score += 100; }
      if (partie) partie.questions++;
      vider(fin, h("p", { class: "verdict" }, h("b", null, juste ? "Démasqué." : "Il t'a eu."), h("span", { class: "gain" }, juste ? "+1 250 points" : "+100 points")),
        h("button", { class: "gros-bouton", type: "button", onclick: ensuite }, "Reprendre le terrier"));
    } }, carteAffirmation(a)));
  });
  vider(b,
    h("div", { class: "etiquettes" }, h("span", { class: "etiq" }, "Intermède"), h("span", { class: "etiq pepite" }, "+1 250")),
    h("h1", { class: "question", tabindex: "-1" }, "Le menteur"),
    h("p", { class: "consigne" }, "Ces trois réponses viennent de faits que tu as trouvés. Une seule est fausse : touche-la."),
    zone, fin);
  allerA(b);
}

function afficherEclair(ensuite) {
  const DUREE = 25;
  const items = melanger(affirmationsPossibles()).slice(0, 8).map((t) => affirmation(t, Math.random() < 0.5));
  const b = nouvelleBande("intermede eclair");
  let i = 0, bons = 0, fini = false, debut = 0, raf = 0;
  const barre = h("i");
  const chrono = h("div", { class: "chrono" }, barre);
  const carte = h("div", { class: "eclair-carte", "aria-live": "polite" });
  const boutons = h("div", { class: "eclair-boutons" });
  const compteur = h("p", { class: "consigne" });
  const fin = h("div");
  const montrer = () => { vider(carte, carteAffirmation(items[i])); compteur.textContent = `${i + 1} / ${items.length} · ${pluriel(bons, "bonne réponse", "bonnes réponses")}`; };
  const terminer = () => {
    if (fini) return;
    fini = true;
    cancelAnimationFrame(raf);
    boutons.remove();
    const pts = bons * 250 + (bons === items.length ? 1000 : 0);
    if (bons) { SONS.juste(bons); gagner(pts, innerWidth / 2, carte.getBoundingClientRect().top); } else SONS.faux();
    if (partie) { partie.score += pts; partie.questions++; if (bons >= items.length / 2) partie.bonnes++; }
    vider(carte, h("span", { class: "a-p" }, bons === items.length ? "Sans faute." : `${bons} sur ${items.length}.`));
    vider(fin, h("p", { class: "verdict" }, h("b", null, pts ? `+${pts} points` : "Raté."), h("span", { class: "gain" }, `${pluriel(bons, "bonne réponse", "bonnes réponses")} en ${DUREE} secondes max`)),
      h("button", { class: "gros-bouton", type: "button", onclick: ensuite }, "Reprendre le terrier"));
  };
  const choisir = (v) => {
    if (fini || !debut) return;
    const ok = v === items[i].vraie;
    if (ok) { bons++; note(880 + bons * 40, 0, 0.1, "triangle", 0.12); } else { note(180, 0, 0.15, "square", 0.06); carte.classList.remove("secoue"); void carte.offsetWidth; carte.classList.add("secoue"); }
    carte.classList.toggle("flash-ok", ok);
    i++;
    if (i >= items.length) terminer(); else montrer();
  };
  const go = h("button", { class: "gros-bouton", type: "button", onclick: () => {
    go.remove();
    vider(boutons,
      h("button", { class: "gros-bouton", type: "button", "data-touche": "v", onclick: () => choisir(true) }, "Vrai"),
      h("button", { class: "gros-bouton", type: "button", "data-touche": "f", onclick: () => choisir(false) }, "Faux"));
    debut = performance.now();
    montrer();
    const tic = (t) => {
      const reste = Math.max(0, 1 - (t - debut) / (DUREE * 1000));
      barre.style.width = `${reste * 100}%`;
      if (reste <= 0) terminer(); else raf = requestAnimationFrame(tic);
    };
    raf = requestAnimationFrame(tic);
  } }, "C'est parti");
  vider(b,
    h("div", { class: "etiquettes" }, h("span", { class: "etiq" }, "Intermède"), h("span", { class: "etiq pepite" }, "Chrono")),
    h("h1", { class: "question", tabindex: "-1" }, "Éclair"),
    h("p", { class: "consigne" }, `${items.length} réponses de tes faits trouvés, ${DUREE} secondes. Vrai ou faux, le plus vite possible.`),
    chrono, carte, boutons, go, compteur, fin);
  allerA(b);
}

/* ---------- Parties ---------- */

let partie = null;
const DUREES = [10, 15, 20, 30, 40, 47];
const estimation = (n) => { const min = Math.max(1, Math.round((n * 25) / 60)); return `≈ ${min} min`; };

function nouvellePartie(total) {
  etat.longueur = total;
  sauver();
  partie = { total: Math.min(total, TOTAL), n: 0, score: 0, bonnes: 0, questions: 0, comboMax: 0, gagnes: [], joues: new Set(), intermedes: 0,
    seriesAvant: Object.fromEntries(SERIES.map((x) => [x.id, x.ids.filter((id) => etat.trouves[id]).length])) };
  combo = 0;
  const depart = choisirDepart();
  if (depart) afficherFait(depart, $("fil").children.length === 0);
}

function choixDuree(apres) {
  const zone = h("div", { class: "durees", role: "radiogroup", "aria-label": "Nombre de questions" });
  let choisi = etat.longueur;
  const majChoix = () => zone.querySelectorAll(".duree").forEach((d) => d.setAttribute("aria-checked", String(Number(d.dataset.n) === choisi)));
  for (const n of DUREES) {
    zone.append(h("button", { class: "duree", type: "button", role: "radio", "data-n": String(n), onclick: () => { choisi = n; majChoix(); SONS.porte(); } },
      h("b", null, n === TOTAL ? "Tout" : n), h("span", null, n === TOTAL ? `les ${TOTAL} · ${estimation(n)}` : `questions · ${estimation(n)}`)));
  }
  majChoix();
  const toggle = h("input", { type: "checkbox", id: "proposer" });
  toggle.checked = etat.proposerDuree;
  toggle.addEventListener("change", () => { etat.proposerDuree = toggle.checked; sauver(); });
  return h("div", { class: "choix-duree" }, zone,
    h("button", { class: "gros-bouton jouer", type: "button", onclick: (e) => { e.currentTarget.disabled = true; apres(choisi); } }, apres.libelle || "Jouer"),
    h("label", { class: "case-cocher", for: "proposer" }, toggle, " Me proposer la durée au début de chaque visite"));
}

function finPartie() {
  const p = partie;
  const ratio = p.questions ? p.bonnes / p.questions : 0;
  const cle = String(p.total);
  const ancien = etat.meilleurs[cle] || 0;
  const record = p.score > ancien;
  if (record) { etat.meilleurs[cle] = p.score; sauver(); }
  const titre = ratio >= 0.9 ? "Légendaire" : ratio >= 0.7 ? "Énorme" : ratio >= 0.5 ? "Bien joué" : "Partie terminée";
  const b = nouvelleBande("fin-partie");
  const score = h("span", { class: "score-geant" }, "0");
  const series = SERIES.map((x) => ({ x, avant: p.seriesAvant[x.id], apres: x.ids.filter((id) => etat.trouves[id]).length })).filter((o) => o.apres > o.avant);
  const rejouer = (n) => nouvellePartie(n);
  rejouer.libelle = "Rejouer";
  vider(b,
    h("div", { class: "etiquettes" }, h("span", { class: "etiq" }, `Partie de ${p.total}`), record ? h("span", { class: "etiq pepite" }, ancien ? "Nouveau record" : "Premier record") : null),
    h("h1", { class: "question titre-fin", tabindex: "-1" }, titre),
    h("p", { class: "score-ligne" }, score, h("span", null, "points")),
    h("ul", { class: "stats" },
      h("li", null, h("b", null, `${p.bonnes}/${p.questions}`), "bonnes réponses"),
      h("li", null, h("b", null, p.comboMax), "meilleur combo"),
      h("li", null, h("b", null, p.gagnes.length), p.gagnes.length > 1 ? "objets gagnés" : "objet gagné"),
      h("li", null, h("b", null, `${nbTrouves()}/${TOTAL}`), "dans ta collection")),
    p.gagnes.length ? h("div", { class: "gagnes" }, p.gagnes.map((id) => h("button", { class: "gagne", type: "button", onclick: () => ouvrirObjet(id), "aria-label": `Contempler : ${salleParId[id].nom}` }, imageObjet(salleParId[id].objet)))) : null,
    series.length ? h("p", { class: "series-avance" }, "Séries qui avancent : ", series.map((o, i) => [h("b", null, `${o.x.nom} ${o.apres}/${o.x.ids.length}`), i < series.length - 1 ? ", " : "."])) : null,
    ancien && !record ? h("p", { class: "consigne" }, `Ton record sur ${p.total} questions : ${ancien} points.`) : null,
    h("h2", { class: "sous-titre" }, "On remet ça ?"),
    choixDuree(rejouer));
  partie = null;
  majHud();
  allerA(b);
  setTimeout(() => celebrer(ratio, record), reduit() ? 0 : 500);
  // Le score monte comme dans une borne d'arcade.
  const t0 = performance.now(), duree = reduit() ? 1 : 1800;
  const monte = (t) => { const k = Math.min(1, (t - t0) / duree); score.textContent = Math.round(p.score * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(monte); };
  requestAnimationFrame(monte);
}

/* ---------- La célébration : air horn et canon à confettis ---------- */

function airHorn(debut = 0) {
  if (!etat.son) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const coups = [[0, 0.42], [0.5, 0.12], [0.66, 0.12], [0.82, 0.95]];
    for (const [t0, d] of coups) {
      const t = audio.currentTime + debut + t0;
      const filtre = audio.createBiquadFilter();
      filtre.type = "lowpass"; filtre.frequency.value = 2600; filtre.Q.value = 6;
      const g = audio.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.11, t + 0.02);
      g.gain.setValueAtTime(0.11, t + d - 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      filtre.connect(g).connect(audio.destination);
      for (const f of [233, 294, 349, 466]) {
        for (const det of [-9, 9]) {
          const o = audio.createOscillator();
          o.type = "sawtooth";
          o.frequency.setValueAtTime(f * 1.06, t);
          o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
          o.detune.value = det;
          o.connect(filtre);
          o.start(t);
          o.stop(t + d + 0.02);
        }
      }
    }
    // Grosse caisse sous la fanfare.
    for (const t0 of [0, 0.5, 0.66, 0.82, 1.3, 1.45]) {
      const t = audio.currentTime + debut + t0;
      const o = audio.createOscillator(), g = audio.createGain();
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.18);
      g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g).connect(audio.destination); o.start(t); o.stop(t + 0.25);
    }
  } catch (_) { /* pas de son */ }
}

function canonConfettis(intensite) {
  if (reduit()) return;
  const c = h("canvas", { class: "canon", "aria-hidden": "true" });
  document.body.append(c);
  const ctx = c.getContext("2d");
  const dpr = Math.min(2, devicePixelRatio || 1);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const couleurs = ["#FF5A36", "#B9A6FF", "#FFD23F", "#7FD8BE", "#FF9EC7", "#3D5AFE", "#FBF5E9", "#FFC93C"];
  const parts = [];
  const salve = (n) => {
    for (let i = 0; i < n; i++) {
      const gauche = i % 2 === 0;
      const echelle = Math.max(0.7, Math.min(1.3, innerHeight / 800));
      parts.push({ x: gauche ? -10 : innerWidth + 10, y: innerHeight * 0.85, vx: (gauche ? 1 : -1) * (3 + Math.random() * (innerWidth / 70)), vy: -(13 + Math.random() * 11) * echelle, r: Math.random() * 6, vr: Math.random() * 0.4 - 0.2, w: 7 + Math.random() * 7, hh: 10 + Math.random() * 8, c: couleurs[i % couleurs.length] });
    }
  };
  salve(Math.round(160 * intensite));
  setTimeout(() => salve(Math.round(120 * intensite)), 500);
  setTimeout(() => salve(Math.round(180 * intensite)), 820);
  const t0 = performance.now();
  const boucle = (t) => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.32; p.vx *= 0.99; p.vy *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.hh / 2 * Math.abs(Math.cos(p.r * 2)), p.w, p.hh * Math.abs(Math.cos(p.r * 2)) + 1);
      ctx.restore();
    }
    if (t - t0 < 4200) requestAnimationFrame(boucle); else c.remove();
  };
  requestAnimationFrame(boucle);
}

function celebrer(ratio, record) {
  const intensite = 0.6 + ratio * 0.9 + (record ? 0.3 : 0);
  airHorn();
  if (ratio >= 0.7 || record) airHorn(1.6);
  canonConfettis(intensite);
  if (!reduit()) {
    document.body.classList.remove("seisme"); void document.body.offsetWidth; document.body.classList.add("seisme");
    const flash = h("div", { class: "flash" });
    document.body.append(flash);
    setTimeout(() => flash.remove(), 700);
  }
}

/* ---------- Contempler un objet ---------- */

let visionneuse = null;
async function ouvrirObjet(id) {
  const dlg = $("dlg-objet");
  const s = salleParId[id];
  const scene = h("div", { class: "scene-objet" });
  vider(dlg,
    h("div", { class: "t-tete" }, h("div", null, h("h2", null, s.nom), h("p", null, `${serieDe[id].nom} · fais-le tourner, pince ou molette pour zoomer`)),
      h("button", { class: "fermer", type: "button", onclick: () => dlg.close() }, "Fermer")),
    scene,
    etat.trouves[id] ? h("div", { class: "t-corps" }, h("button", { class: "lien-texte", type: "button", onclick: () => { dlg.close(); ouvrirFiche(id); } }, "Relire la fiche")) : null);
  dlg.showModal();
  const m = await charger3D();
  if (!dlg.open) return;
  if (!m) { scene.append(imageObjet(s.objet, "fiche-img")); return; }
  if (visionneuse) visionneuse.detruire();
  visionneuse = new m.Visionneuse(scene, s.objet);
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
    nuage.actif ? blocSauvegarde(dlg) : null,
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

function blocSauvegarde(dlg) {
  if (etat.code) {
    const copier = h("button", { class: "lien-texte", type: "button", onclick: async () => {
      try { await navigator.clipboard.writeText(nuage.afficherCode(etat.code)); toast("Code ", h("b", null, "copié")); } catch (_) { toast("Note ton code : ", h("b", null, nuage.afficherCode(etat.code))); }
    } }, "Copier");
    return h("section", { class: "sauvegarde" },
      h("p", null, "Ton code de sauvegarde : ", h("b", { class: "code" }, nuage.afficherCode(etat.code)), " ", copier),
      h("p", { class: "aide-sauvegarde" }, "Tape-le sur ton autre appareil pour y retrouver ta collection. Ta progression est enregistrée en ligne à chaque réponse."));
  }
  const champ = h("input", { class: "champ-code", type: "text", inputmode: "text", autocomplete: "off", autocapitalize: "characters", placeholder: "XXXX-XXXX", "aria-label": "Code de sauvegarde", maxlength: "9" });
  const message = h("p", { class: "aide-sauvegarde", "aria-live": "polite" });
  const recuperer = h("button", { class: "lien-texte", type: "button", onclick: async () => {
    const code = nuage.normaliserCode(champ.value);
    if (code.length !== 8) { message.textContent = "Un code fait 8 caractères, par exemple K7PM-3QXA."; return; }
    message.textContent = "Recherche…";
    try {
      const d = await nuage.lireSauvegarde(code);
      if (!d) { message.textContent = "Aucune sauvegarde avec ce code. Vérifie les lettres."; return; }
      fusionner(d);
      etat.code = code;
      sauver();
      majHud(["btn-collection"]);
      toast("Collection récupérée : ", h("b", null, `${nbTrouves()}/${TOTAL}`));
      ouvrirCollection();
    } catch (_) { message.textContent = "Connexion impossible pour l'instant. Réessaie dans un moment."; }
  } }, "Récupérer");
  const creer = h("button", { class: "gros-bouton", type: "button", onclick: async () => {
    etat.code = nuage.nouveauCode();
    try { await nuage.ecrireSauvegarde(etat.code, progression()); } catch (_) { etat.code = ""; message.textContent = "Connexion impossible pour l'instant. Réessaie dans un moment."; return; }
    sauver();
    ouvrirCollection();
  } }, "Créer mon code de sauvegarde");
  return h("section", { class: "sauvegarde" },
    h("p", null, h("b", null, "Retrouve ta collection sur tous tes appareils.")),
    creer,
    h("p", { class: "aide-sauvegarde" }, "Tu as déjà un code ? "),
    h("div", { class: "ligne-code" }, champ, recuperer),
    message);
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
      h("button", { class: "fiche-objet", type: "button", onclick: () => { dlg.close(); ouvrirObjet(id); }, "aria-label": "Contempler l'objet" }, imageObjet(s.objet, "fiche-img"), h("span", { class: "contempler" }, "Contempler")),
      QUESTIONS[id].map((q) => [
        h("p", { class: "fiche-q" }, q.texte),
        h("p", { class: "fiche-r" }, `Réponse : ${q.type === "vf" ? (q.reponse ? "vrai" : "faux") : q.choix[q.reponse]}`),
        h("p", null, q.explication)]),
      s.saviezVous ? h("p", { class: "saviez" }, h("b", null, "Le saviez-vous ?"), s.saviezVous) : null,
      s.note ? h("p", { class: "note" }, h("b", null, "Note de vérification : "), s.note) : null,
      blocSources(s.sources)));
  dlg.showModal();
}

for (const d of ["dlg-collection", "dlg-pistes", "dlg-fiche", "dlg-objet"]) {
  $(d).addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
}
$("dlg-objet").addEventListener("close", () => { if (visionneuse) { visionneuse.detruire(); visionneuse = null; } });
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

/* ---------- Clavier : 1 à 4 pour répondre, V et F en Éclair ---------- */

addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector("dialog[open]") || !$("annonce").hidden) return;
  const derniere = $("fil").lastElementChild;
  if (!derniere) return;
  if (/^[1-4]$/.test(e.key)) {
    const reps = derniere.querySelectorAll(".reponses:not(.fini) .rep, .affirmations:not(.fini) .affirmation");
    const r = reps[Number(e.key) - 1];
    if (r) { e.preventDefault(); r.click(); }
  } else if (e.key === "v" || e.key === "f") {
    const b = derniere.querySelector(`[data-touche="${e.key}"]`);
    if (b) { e.preventDefault(); b.click(); }
  }
});

/* ---------- Départ ---------- */

appliquerTypo();
appliquerSon();
majHud();
if (nuage.actif && etat.code) {
  nuage.lireSauvegarde(etat.code).then((d) => { if (fusionner(d)) { sauver(); majHud(); } }).catch(() => {});
}
if (etat.proposerDuree) {
  const b = nouvelleBande("fin-partie");
  vider(b,
    h("div", { class: "etiquettes" }, h("span", { class: "etiq" }, `${nbTrouves()}/${TOTAL} dans ta collection`)),
    h("h1", { class: "question", tabindex: "-1" }, "Combien de questions ?"),
    choixDuree((n) => nouvellePartie(n)));
} else {
  nouvellePartie(etat.longueur);
}
charger3D();

