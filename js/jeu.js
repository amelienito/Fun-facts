import { SALLES, VERIFIE_LE } from "./data.js";
import { QUESTIONS, SERIES, PEPITES, NIVEAUX, MYSTERES, FRISES, NOMBRES, PAIRES } from "./questions.js";
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

// Tout le son passe par un volume général et un compresseur : plus fort, sans saturer.
// Son : un seul contexte audio, sans compresseur (un compresseur peut rester bloqué en silence pour de bon sur iPhone).
// Dès que le contexte n'est plus « running » (écran verrouillé, appel, écouteurs branchés…), on le jette
// et on en recrée un neuf au toucher suivant.
let audio = null, sortie = null, aRecreer = false;
let hornBuffer = null, hornCharge = null;
function creerContexte() {
  try { if (audio && audio.state !== "closed") audio.close(); } catch (_) {}
  audio = new (window.AudioContext || window.webkitAudioContext)();
  sortie = audio.createGain();
  sortie.gain.value = 0.9;
  sortie.connect(audio.destination);
  aRecreer = false;
  audio.onstatechange = () => { if (audio.state !== "running") aRecreer = true; };
  hornBuffer = null; hornCharge = null;
}
function ctx() {
  if (!audio || audio.state === "closed") creerContexte();
  if (audio.state !== "running") audio.resume().catch(() => {});
  return audio;
}
function reveillerSon() {
  try { if (navigator.audioSession && navigator.audioSession.type !== "playback") navigator.audioSession.type = "playback"; } catch (_) {}
  if (!etat.son) return;
  try {
    if (!audio || aRecreer || audio.state === "interrupted" || audio.state === "closed") creerContexte();
    const a = audio;
    a.resume().catch(() => {});
    const b = a.createBuffer(1, 1, 22050); const src = a.createBufferSource(); src.buffer = b; src.connect(a.destination); src.start(0);
    chargerHorn();
  } catch (_) {}
}
addEventListener("pointerdown", reveillerSon, { capture: true });
addEventListener("keydown", reveillerSon, { capture: true });
document.addEventListener("visibilitychange", () => { if (document.hidden) aRecreer = true; });

function note(freq, debut, duree, type = "sine", vol = 0.16) {
  if (!etat.son) return;
  try {
    ctx();
    vol = Math.min(0.45, vol * 1.6);
    const t = audio.currentTime + debut;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    o.connect(g).connect(sortie);
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
  if (partie) $("progression-partie").textContent = `${Math.min(partie.n, partie.total)}/${partie.total}`;
  $("progression-partie").hidden = !partie;
  const m = multiplicateur();
  const s = $("serie");
  s.hidden = m < 2;
  s.replaceChildren(h("span", { class: "combo-mot" }, "Combo "), `×${m}`);
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
      annoncer(`Niveau ${apres + 1}`, NIVEAUX[apres].nom, "Récompense : une pépite t'attend dans tes prochains choix.");
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
  setTimeout(() => c.remove(), 900);
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
  // On évite d'abord les faits déjà joués et ceux déjà vus dans un intermède ;
  // s'il n'en reste pas assez (longues parties), seuls les faits réellement joués sont exclus.
  const tirer = (exclure) => ({
    neufs: SALLES.filter((x) => x.id !== sauf && !etat.trouves[x.id] && !exclure(x.id)),
    revus: melanger(SALLES.filter((x) => x.id !== sauf && etat.trouves[x.id] && !exclure(x.id))),
  });
  const strict = tirer((id) => dejaJoue(id) || (partie && partie.inter.has(id)));
  return strict.neufs.length + strict.revus.length >= 2 ? strict : tirer(dejaJoue);
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

// Pronostic de début de partie : un bonus si on le tient, rien à perdre sinon.
function blocPronostic() {
  const bloc = h("div", { class: "prono" }, h("span", null, "Tu te mets combien sur 10 ?"));
  const fermer = () => { bloc.classList.add("parti"); setTimeout(() => bloc.remove(), 300); };
  for (const n of [5, 6, 7, 8, 9, 10]) bloc.append(h("button", { class: "prono-n", type: "button", onclick: () => {
    if (!partie) return;
    partie.prono = n; SONS.porte();
    vider(bloc, h("span", null, `Pronostic : ${n}/10. Tiens-le pour un bonus.`));
    setTimeout(fermer, 1600);
  } }, n));
  bloc.append(h("button", { class: "prono-passer", type: "button", onclick: () => { if (partie) partie.prono = 0; fermer(); } }, "Passer"));
  return bloc;
}

function afficherFait(id, premier) {
  const s = salleParId[id];
  etat.pistes = etat.pistes.filter((x) => x !== id);
  sauver();
  if (partie) { partie.n++; partie.joues.add(id); }
  majHud();
  const b = nouvelleBande();
  const serie = serieDe[id];
  const mystere = MYSTERES.has(id);
  const zoneObjet = h("button", { class: mystere ? "objet-zone mystere" : "objet-zone", type: "button", tabindex: "-1", "aria-label": "Contempler l'objet", onclick: () => { if (b.classList.contains("revele")) ouvrirObjet(id); } }, imageObjet(s.objet, "objet"));
  const tete = h("div", { class: "tete" });
  const suite = h("div", { class: "suite", hidden: true });
  vider(b,
    h("div", { class: "etiquettes" },
      mystere ? h("span", { class: "etiq" }, h("span", { class: "nom-cache" }, "Thème mystère"), h("span", { class: "nom-vrai" }, serie.nom)) : h("span", { class: "etiq" }, serie.nom),
      estPepite(id) ? h("span", { class: "etiq pepite" }, "Pépite ×2") : null,
      etat.trouves[id] ? h("span", { class: "etiq" }, "Déjà dans ta collection") : null),
    tete, suite);
  if (partie && partie.n === 1 && partie.prono == null) b.querySelector(".etiquettes").after(blocPronostic());
  poser(s, 0, { b, tete, suite, zoneObjet });
  if (!premier) allerA(b);
  else setTimeout(() => b.querySelector("h1")?.focus({ preventScroll: true }), 50);
}

function poser(s, qi, z) {
  const q = QUESTIONS[s.id][qi];
  const total = QUESTIONS[s.id].length;
  if (q.type === "multi") return poserMulti(s, qi, z, q, total);
  if (q.type === "placer") return poserPlacer(s, qi, z, q, total);
  if (q.type === "estimer") return poserEstimer(s, qi, z, q, total);
  const frise = FRISES[`${s.id}:${qi}`];
  const opts = q.type === "vf"
    ? [["Vrai", true], ["Faux", false]]
    : frise?.ordreChoix ? frise.ordreChoix.map((i) => [q.choix[i], i])
    : (q.ordre || frise ? q.choix.map((c, i) => [c, i]) : melanger(q.choix.map((c, i) => [c, i])));
  z.frise = frise ? blocFrise(frise) : null;
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
    z.frise,
    reps);
  if (qi > 0) z.tete.querySelector("h1").focus({ preventScroll: true });
}

// Une ligne du temps : les bouts sont fixes, les points glissent à leur vraie place après la réponse.
function blocFrise(f) {
  const pos = (v) => `${((v - f.min) / (f.max - f.min)) * 100}%`;
  const ligne = h("div", { class: "frise-ligne" });
  f.points.forEach((p, k) => {
    ligne.append(h("div", { class: `frise-point ${p.cache ? "cache" : ""} ${p.mystere ? "mystere" : ""} rang-${k % 2}`, style: `--pos:${pos(p.val)};--align:${(p.val - f.min) / (f.max - f.min) < 0.33 ? "left" : (p.val - f.min) / (f.max - f.min) > 0.67 ? "right" : "center"}` },
      h("i"), h("span", { class: "fp-txt" }, h("span", { class: "fp-nom" }, p.nom, h("em", null, p.mystere ? " ?" : "")), h("span", { class: "fp-date" }, p.date))));
  });
  return h("div", { class: "frise", "aria-hidden": "true" },
    ligne,
    h("div", { class: "frise-bouts" },
      h("span", null, h("b", null, f.gauche.nom), f.gauche.date ? h("small", null, f.gauche.date) : null),
      h("span", null, h("b", null, f.droite.nom), f.droite.date ? h("small", null, f.droite.date) : null)));
}


// Sélection multiple : on touche toutes les bonnes réponses, puis on valide.
function poserMulti(s, qi, z, q, total) {
  z.frise = null;
  const grille = h("div", { class: "multi" });
  const valider = h("button", { class: "gros-bouton", type: "button", disabled: true }, "Valider");
  const tuiles = melanger(q.choix.map((c, i) => [c, i])).map(([c, i]) => {
    const t = h("button", { class: "tuile", type: "button", "aria-pressed": "false", "data-i": i }, c);
    t.addEventListener("click", () => {
      if (grille.classList.contains("fini")) return;
      t.setAttribute("aria-pressed", String(t.getAttribute("aria-pressed") !== "true"));
      SONS.porte();
      valider.disabled = !grille.querySelector('[aria-pressed="true"]');
    });
    grille.append(t);
    return t;
  });
  valider.addEventListener("click", () => {
    if (grille.classList.contains("fini")) return;
    let fautes = 0;
    for (const t of tuiles) {
      const bonne = q.bonnes.includes(Number(t.dataset.i)), prise = t.getAttribute("aria-pressed") === "true";
      t.classList.add(bonne ? "bon" : "barre");
      if (bonne !== prise) { fautes++; t.classList.add(bonne ? "oubli" : "erreur"); }
      t.disabled = true;
    }
    valider.remove();
    repondre(s, qi, z, grille, grille, fautes === 0);
  });
  vider(z.tete,
    z.zoneObjet,
    total > 1 ? h("p", { class: "q-num" }, `Question ${qi + 1} sur ${total}`) : null,
    h("h1", { class: `question ${q.texte.length > 72 ? "longue" : ""}`, tabindex: "-1" }, q.texte),
    grille, valider);
  if (qi > 0) z.tete.querySelector("h1").focus({ preventScroll: true });
}

// Sur les frises et les curseurs : dans la tolérance, c'est juste ; jusqu'au double, c'est « presque » (moitié des points, le combo continue).
const juger = (ecart, tol) => (ecart <= tol ? true : ecart <= tol * 2 ? "presque" : false);
const entete = (z, q, qi, total) => [z.zoneObjet,
  total > 1 ? h("p", { class: "q-num" }, `Question ${qi + 1} sur ${total}`) : null,
  h("h1", { class: `question ${q.texte.length > 72 ? "longue" : ""}`, tabindex: "-1" }, q.texte)];
const anneeTxt = (a) => (a < 0 ? `${Math.round(-a).toLocaleString("fr-FR")} av. J.-C.` : String(Math.round(a)));

// Placer un événement sur la frise : on touche la ligne, on ajuste, on valide.
function poserPlacer(s, qi, z, q, total) {
  z.frise = null;
  const zone = h("div", { class: "placer" });
  let pos = null, tient = false;
  const repere = h("div", { class: "lb-repere pose" }, h("i"), h("span", null, q.sujet));
  const vrai = h("div", { class: "lb-repere vrai" }, h("i"), h("span", null, q.valTexte));
  const lecture = h("p", { class: "lb-lecture" }, "Touche la ligne, ajuste, puis valide.");
  const piste = h("div", { class: "lb-piste" }, repere, vrai);
  const valider = h("button", { class: "gros-bouton", type: "button", disabled: true }, "Valider");
  const placer = (x) => {
    const r = piste.getBoundingClientRect();
    pos = Math.min(1, Math.max(0, (x - r.left) / r.width));
    repere.style.left = `${pos * 100}%`; repere.classList.add("visible");
    lecture.textContent = `${q.sujet} : ${anneeTxt(q.min + pos * (q.max - q.min))}`;
    valider.disabled = false;
  };
  piste.addEventListener("pointerdown", (e) => { if (zone.classList.contains("fini")) return; tient = true; piste.setPointerCapture(e.pointerId); placer(e.clientX); });
  piste.addEventListener("pointermove", (e) => { if (tient) placer(e.clientX); });
  piste.addEventListener("pointerup", () => { tient = false; });
  valider.addEventListener("click", () => {
    if (zone.classList.contains("fini") || pos == null) return;
    const v = q.min + pos * (q.max - q.min);
    vrai.style.left = `${((q.val - q.min) / (q.max - q.min)) * 100}%`; vrai.classList.add("visible");
    lecture.textContent = `Tu as placé : ${anneeTxt(v)}. Réponse : ${q.valTexte}.`;
    valider.remove();
    repondre(s, qi, z, zone, piste, juger(Math.abs(v - q.val), q.tol));
  });
  vider(zone, h("div", { class: "lb-frise" }, piste,
    h("div", { class: "frise-bouts" },
      h("span", null, h("b", null, q.gauche), h("small", null, q.gaucheDate)),
      h("span", null, h("b", null, q.droite), h("small", null, q.droiteDate)))), lecture, valider);
  vider(z.tete, entete(z, q, qi, total), zone);
  if (qi > 0) z.tete.querySelector("h1").focus({ preventScroll: true });
}

// Estimer un chiffre au curseur, avec − et + pour viser juste.
function poserEstimer(s, qi, z, q, total) {
  z.frise = null;
  const zone = h("div", { class: "estimer" });
  const milieu = Math.round((q.min + q.max) / 2);
  const chiffre = h("b", null, milieu.toLocaleString("fr-FR"));
  const curseur = h("input", { type: "range", class: "lb-range", min: q.min, max: q.max, step: 1, value: milieu, "aria-label": q.texte });
  const valider = h("button", { class: "gros-bouton", type: "button", disabled: true }, "Valider");
  const maj = () => { chiffre.textContent = Number(curseur.value).toLocaleString("fr-FR"); valider.disabled = false; };
  curseur.addEventListener("input", maj);
  const pas = (d) => h("button", { class: "pas", type: "button", "aria-label": d > 0 ? "Plus un" : "Moins un", onclick: () => { if (zone.classList.contains("fini")) return; curseur.value = Number(curseur.value) + d; maj(); SONS.porte(); } }, d > 0 ? "+" : "−");
  const vrai = h("div", { class: "lb-range-vrai", style: `left:${((q.val - q.min) / (q.max - q.min)) * 100}%` }, h("span", null, q.val.toLocaleString("fr-FR")));
  valider.addEventListener("click", () => {
    if (zone.classList.contains("fini")) return;
    curseur.disabled = true; valider.remove(); vrai.classList.add("visible");
    zone.querySelectorAll(".pas").forEach((b) => (b.disabled = true));
    const ecart = Math.abs(Number(curseur.value) - q.val);
    lecture.textContent = ecart === 0 ? "Pile poil !" : `Écart : ${ecart.toLocaleString("fr-FR")}.`;
    repondre(s, qi, z, zone, curseur, juger(ecart, q.tol));
  });
  const lecture = h("p", { class: "lb-lecture" });
  vider(zone,
    h("div", { class: "estimer-ligne" }, pas(-1), h("p", { class: "lb-valeur" }, chiffre, ` ${q.unite}`), pas(1)),
    h("div", { class: "lb-range-zone" }, curseur, vrai, h("div", { class: "lb-range-bornes" }, h("span", null, q.min.toLocaleString("fr-FR")), h("span", null, q.max.toLocaleString("fr-FR")))),
    lecture, valider);
  vider(z.tete, entete(z, q, qi, total), zone);
  if (qi > 0) z.tete.querySelector("h1").focus({ preventScroll: true });
}

function repondre(s, qi, z, reps, bouton, val) {
  if (reps.classList.contains("fini")) return;
  reps.classList.add("fini");
  if (z.frise) setTimeout(() => z.frise.classList.add("revelee"), 250);
  const q = QUESTIONS[s.id][qi];
  const special = ["multi", "placer", "estimer"].includes(q.type);
  const presque = val === "presque";
  const juste = special ? val === true || presque : val === q.reponse;
  if (!special) for (const x of reps.querySelectorAll(".rep")) {
    const v = x.dataset.v === "true" ? true : x.dataset.v === "false" ? false : Number(x.dataset.v);
    x.classList.add(v === q.reponse ? "bon" : "barre");
    if (x === bouton) x.classList.add("choisi");
    x.disabled = true;
  }
  const r = bouton.getBoundingClientRect();
  let gain;
  if (juste) {
    gain = 500 * multiplicateur() * (estPepite(s.id) ? 2 : 1) * (presque ? 0.5 : 1);
    combo++;
    etat.record = Math.max(etat.record, combo);
    SONS.juste(combo);
    if (combo % 3 === 0) {
      setTimeout(SONS.niveau, 80);
      if (!reduit()) banniere(multiplicateur() < 4 || combo === 9 ? `COMBO ×${multiplicateur()}` : `${combo} D'AFFILÉE`, multiplicateur() < 4 || combo === 9 ? `${combo} bonnes réponses d'affilée` : "Rien ne t'arrête");
    }
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
  const titre = presque ? "Presque !" : juste ? "Bien vu." : "Raté.";
  const lignes = [
    h("p", { class: "verdict" }, h("b", null, titre), statJoueurs, h("span", { class: "gain" }, juste ? `+${gain.toLocaleString("fr-FR")} points${multiplicateur() > 1 && combo > 1 ? ` · combo de ${combo}` : ""}` : `+${gain} points pour avoir appris quelque chose`)),
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
  lignes.push(blocSources(s.sources));
  const jauge = h("i", { style: "width:0%" });
  lignes.push(h("button", { class: "acquis", type: "button", onclick: () => ouvrirObjet(s.id), "aria-label": `Contempler : ${s.nom}` },
    imageObjet(s.objet),
    h("b", null, `${nouveau ? "+1 " : ""}${serie.nom} ${nSerie}/${serie.ids.length}`), h("span", { class: "jauge" }, jauge),
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
      if (partie) partie.score += 2500;
      annoncer("Thème complet", serie.nom, `Tu as trouvé les ${serie.ids.length} faits de ce thème. +2 500 points.`);
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
    return h("div", { class: "pistes-zone" },
      h("p", null, "Tu as tout trouvé."),
      h("button", { class: "lien-texte", type: "button", onclick: ouvrirCollection }, "Voir ma collection"));
  }
  const zone = h("div", { class: "portes" });
  const boutons = portes.map((c) => {
    const pep = estPepite(c.id);
    const b = h("button", { class: `porte ${pep ? "pepite" : ""}`, type: "button", "aria-label": `Thème ${serieDe[c.id].nom}${pep ? ", pépite" : ""}` },
      imageObjet(c.objet),
      h("span", { class: "p-serie" }, serieDe[c.id].nom),
      h("span", { class: "p-type" }, etat.trouves[c.id] ? "À revoir" : pep ? "Pépite ×2" : "Nouveau"));
    b.addEventListener("click", () => {
      if (b.disabled) return;
      SONS.porte();
      boutons.forEach((o) => (o.disabled = true));
      b.classList.add("choisie");
      if (estPepite(c.id)) etat.pepiteGarantie = false;
      sauver();
      suivant(c.id);
    });
    zone.append(b);
    return b;
  });
  return h("div", { class: "pistes-zone" },
    h("p", null, "Et maintenant ?"),
    zone);
}

function suivant(id) {
  // Un intermède toutes les 4 questions, si on a déjà assez de faits trouvés pour le nourrir.
  // Les intermèdes ne piochent que dans les faits déjà trouvés, jamais dans celui qui arrive juste après.
  if (partie && partie.n > 0 && partie.n % 4 === 0 && partie.n < partie.total) {
    const tous = [
      [afficherEclair, new Set(affirmationsPossibles(id).map((a) => a.id)).size >= 4],
      [afficherPlusOuMoins, nombresVus(id).length >= 4],
      [afficherPaires, pairesVues(id).length >= 3],
    ];
    const dispo = tous.filter(([, ok]) => ok).map(([f]) => f);
    if (dispo.length) {
      const jeu = dispo[(partie.decalage + partie.intermedes++) % dispo.length];
      let fait = false;
      const ensuite = () => { if (fait) return; fait = true; afficherFait(id); };
      jeu(ensuite, id);
      // Chaque intermède peut se passer d'un geste.
      const b = $("fil").lastElementChild;
      const passer = h("button", { class: "passer-intermede", type: "button", onclick: () => {
        b.classList.add("passe");
        vider(b, h("p", { class: "consigne" }, "Intermède passé."));
        ensuite();
      } }, "Passer l'intermède");
      b.querySelector("h1")?.after(passer);
      return;
    }
  }
  afficherFait(id);
}

/* ---------- Intermèdes : Éclair, Plus ou moins, Les paires ---------- */

const marquerJoues = (ids) => { if (partie) for (const i of ids) partie.inter.add(i); };
const nombresVus = (exclu) => NOMBRES.filter((n) => etat.trouves[n.id] && n.id !== exclu);
const pairesVues = (exclu) => PAIRES.filter((p) => etat.trouves[p.id] && p.id !== exclu);

// Une affirmation = une question déjà trouvée + une réponse proposée (la bonne ou une fausse).
const affirmationsPossibles = (exclu) => Object.keys(etat.trouves).filter((id) => salleParId[id] && id !== exclu).flatMap((id) => QUESTIONS[id].filter((q) => q.type === "qcm" && q.choix.length > 2).map((q) => ({ id, q })));
function affirmation({ id, q }, vraie) {
  const fausses = q.choix.filter((_, i) => i !== q.reponse);
  return { id, question: q.texte, prop: vraie ? q.choix[q.reponse] : melanger(fausses)[0], bonne: q.choix[q.reponse], vraie };
}
function carteAffirmation(a) {
  return [h("span", { class: "a-q" }, a.question), h("span", { class: "a-p" }, a.prop)];
}


// Plus ou moins : un chiffre connu, un chiffre caché. Le caché est-il plus grand ou plus petit ?
function afficherPlusOuMoins(ensuite, exclu) {
  const pool = melanger(nombresVus(exclu));
  const chaine = pool.slice(0, Math.min(6, pool.length));
  marquerJoues(chaine.map((n) => n.id));
  const MANCHES = chaine.length - 1;
  const b = nouvelleBande("intermede inter-pom");
  let k = 0, bons = 0;
  const scene = h("div", { class: "pom" });
  const fin = h("div");
  const fmt = (n) => n.val.toLocaleString("fr-FR");
  const carteN = (n, cache) => h("div", { class: `pom-carte ${cache ? "cachee" : ""}` },
    h("span", { class: "pom-val" }, cache ? "?" : fmt(n)), h("span", { class: "pom-lib" }, n.libelle));
  const manche = () => {
    const a = chaine[k], c = chaine[k + 1];
    const droite = carteN(c, true);
    const choix = h("div", { class: "eclair-boutons" });
    const juger = (plus) => {
      choix.remove();
      const ok = plus ? c.val > a.val : c.val < a.val;
      if (ok) { bons++; SONS.juste(bons); } else { SONS.faux(); droite.classList.add("secoue"); }
      const v = droite.querySelector(".pom-val");
      const t0 = performance.now();
      const anim = (t) => { const p = Math.min(1, (t - t0) / 700); v.textContent = Math.round(c.val * (1 - Math.pow(1 - p, 3))).toLocaleString("fr-FR"); if (p < 1) requestAnimationFrame(anim); };
      requestAnimationFrame(anim);
      droite.classList.remove("cachee"); droite.classList.add(ok ? "pom-ok" : "pom-ko");
      k++;
      setTimeout(() => (k < MANCHES ? manche() : terminer()), 1500);
    };
    vider(choix,
      h("button", { class: "gros-bouton", type: "button", "data-touche": "v", onclick: () => juger(true) }, "Plus"),
      h("button", { class: "gros-bouton", type: "button", "data-touche": "f", onclick: () => juger(false) }, "Moins"));
    vider(scene, h("p", { class: "consigne" }, `Manche ${k + 1} sur ${MANCHES}`), carteN(a), h("p", { class: "pom-vs" }, "contre"), droite, choix);
  };
  const terminer = () => {
    const pts = Math.max(100, bons * 500 + (bons === MANCHES ? 2500 : 0));
    gagner(pts, innerWidth / 2, scene.getBoundingClientRect().top + 60);
    if (partie) { partie.score += pts; partie.questions++; if (bons >= MANCHES / 2) partie.bonnes++; }
    if (bons === MANCHES) { combo++; confettis(innerWidth / 2, innerHeight / 2, ["#FFC93C", "#FBF5E9", "#15131A"]); }
    vider(fin, h("p", { class: "verdict" }, h("b", null, bons === MANCHES ? "Sans faute." : `${bons} sur ${MANCHES}.`), h("span", { class: "gain" }, `+${pts.toLocaleString("fr-FR")} points`)),
      h("button", { class: "gros-bouton", type: "button", onclick: ensuite }, "Reprendre le terrier"));
  };
  vider(b,
    h("div", { class: "etiquettes" }, h("span", { class: "etiq" }, "Intermède"), h("span", { class: "etiq pepite" }, "Sans faute : +2 500")),
    h("h1", { class: "question", tabindex: "-1" }, "Plus ou moins"),
    h("p", { class: "consigne" }, "Le chiffre caché est-il plus grand ou plus petit que celui d'au-dessus ?"),
    scene, fin);
  manche();
  allerA(b);
}

// Les paires : relier chaque mot à sa définition.
function afficherPaires(ensuite, exclu) {
  const lot = melanger(pairesVues(exclu)).slice(0, 4);
  marquerJoues(lot.map((p) => p.id));
  const b = nouvelleBande("intermede inter-paires");
  let choisi = null, erreurs = 0, faites = 0;
  const fin = h("div");
  const mots = h("div", { class: "paires-col" });
  const defs = h("div", { class: "paires-col" });
  const clic = (el) => {
    if (el.classList.contains("fait")) return;
    if (!choisi || choisi.dataset.cote === el.dataset.cote) {
      choisi?.classList.remove("choisi"); choisi = el; el.classList.add("choisi"); note(660, 0, 0.06, "triangle", 0.08); return;
    }
    const a = choisi; choisi = null; a.classList.remove("choisi");
    if (a.dataset.k === el.dataset.k) {
      faites++; a.classList.add("fait"); el.classList.add("fait"); a.disabled = el.disabled = true;
      SONS.juste(faites);
      const r = el.getBoundingClientRect(); confettis(r.left + r.width / 2, r.top, ["#FFC93C", "#FBF5E9"]);
      if (faites === lot.length) terminer();
    } else {
      erreurs++; SONS.faux();
      for (const x of [a, el]) { x.classList.remove("secoue"); void x.offsetWidth; x.classList.add("secoue"); }
    }
  };
  lot.forEach((p, k) => mots.append(h("button", { class: "paire mot", type: "button", "data-k": k, "data-cote": "m", onclick: (e) => clic(e.currentTarget) }, p.mot)));
  melanger(lot.map((p, k) => [p, k])).forEach(([p, k]) => defs.append(h("button", { class: "paire def", type: "button", "data-k": k, "data-cote": "d", onclick: (e) => clic(e.currentTarget) }, p.def)));
  const terminer = () => {
    const pts = Math.max(500, 3000 - erreurs * 500);
    gagner(pts, innerWidth / 2, mots.getBoundingClientRect().top);
    if (partie) { partie.score += pts; partie.questions++; if (erreurs <= 2) partie.bonnes++; }
    vider(fin, h("p", { class: "verdict" }, h("b", null, erreurs ? pluriel(erreurs, "erreur", "erreurs") + "." : "Sans faute."), h("span", { class: "gain" }, `+${pts.toLocaleString("fr-FR")} points`)),
      h("button", { class: "gros-bouton", type: "button", onclick: ensuite }, "Reprendre le terrier"));
  };
  vider(b,
    h("div", { class: "etiquettes" }, h("span", { class: "etiq" }, "Intermède"), h("span", { class: "etiq pepite" }, "Jusqu'à +3 000")),
    h("h1", { class: "question", tabindex: "-1" }, "Les paires"),
    h("p", { class: "consigne" }, "Touche un mot, puis sa définition."),
    h("div", { class: "paires" }, mots, defs), fin);
  allerA(b);
}

function afficherEclair(ensuite, exclu) {
  const DUREE = 32;
  const tirees = melanger(affirmationsPossibles(exclu)).slice(0, 8);
  marquerJoues(tirees.map((t) => t.id));
  // Vrai et faux bien alternés au hasard : jamais trois fois de suite la même réponse.
  let items = [];
  for (let essai = 0; essai < 60; essai++) {
    items = melanger(tirees.map((t, k) => affirmation(t, k < Math.ceil(tirees.length / 2))));
    if (!items.some((x, k) => k >= 2 && x.vraie === items[k - 1].vraie && x.vraie === items[k - 2].vraie)) break;
  }
  const reponses = [];
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
    const pts = Math.max(100, bons * 250 + (bons === items.length ? 1000 : 0));
    if (bons) SONS.juste(bons); else SONS.faux();
    gagner(pts, innerWidth / 2, carte.getBoundingClientRect().top);
    if (partie) { partie.score += pts; partie.questions++; if (bons >= items.length / 2) partie.bonnes++; }
    vider(carte, h("span", { class: "a-p" }, bons === items.length ? "Sans faute." : `${bons} sur ${items.length}.`));
    carte.after(h("ol", { class: "recap" }, items.slice(0, reponses.length).map((a, k) => h("li", { class: reponses[k] ? "ok" : "ko" },
      h("span", { class: "a-q" }, a.question), h("span", null, `Réponse : ${a.bonne}`)))));
    vider(fin, h("p", { class: "verdict" }, h("b", null, bons ? `+${pts.toLocaleString("fr-FR")} points` : `+${pts} points`), h("span", { class: "gain" }, `${pluriel(bons, "bonne réponse", "bonnes réponses")} en ${DUREE} secondes max`)),
      h("button", { class: "gros-bouton", type: "button", onclick: ensuite }, "Reprendre le terrier"));
  };
  const choisir = (v) => {
    if (fini || !debut) return;
    const ok = v === items[i].vraie;
    reponses.push(ok);
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
      if (b.classList.contains("passe")) return;
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
const DUREES = [10, 15, 20, 30, 40, TOTAL];
const estimation = (n) => { const min = Math.max(1, Math.round((n * 25) / 60)); return `≈ ${min} min`; };

function nouvellePartie(total) {
  etat.longueur = total;
  sauver();
  partie = { total: Math.min(total, TOTAL), n: 0, score: 0, bonnes: 0, questions: 0, comboMax: 0, gagnes: [], joues: new Set(), inter: new Set(), intermedes: 0, decalage: Math.floor(Math.random() * 4),
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
  const note = Math.round(ratio * 10);
  let bonusProno = 0;
  if (p.prono) {
    bonusProno = note >= p.prono ? p.prono * 300 * (note === p.prono ? 2 : 1) : 0;
    if (bonusProno) { p.score += bonusProno; gagner(bonusProno); }
  }
  const lignePronostic = p.prono ? h("p", { class: "prono-bilan" }, note >= p.prono
    ? [h("b", null, note === p.prono ? "Pronostic pile tenu !" : "Pronostic tenu !"), ` Tu visais ${p.prono}/10, tu fais ${note}/10 : +${bonusProno.toLocaleString("fr-FR")} points.`]
    : [h("b", null, "Pronostic raté."), ` Tu visais ${p.prono}/10, tu fais ${note}/10. Aucun point perdu.`]) : null;
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
    lignePronostic,
    h("ul", { class: "stats" },
      h("li", null, h("b", null, `${p.bonnes}/${p.questions}`), "bonnes réponses"),
      h("li", null, h("b", null, p.comboMax), "meilleur combo"),
      h("li", null, h("b", null, p.gagnes.length), p.gagnes.length > 1 ? "objets gagnés" : "objet gagné"),
      h("li", null, h("b", null, `${nbTrouves()}/${TOTAL}`), "dans ta collection")),
    p.gagnes.length ? h("div", { class: "gagnes" }, p.gagnes.map((id) => h("button", { class: "gagne", type: "button", onclick: () => ouvrirObjet(id), "aria-label": `Contempler : ${salleParId[id].nom}` }, imageObjet(salleParId[id].objet)))) : null,
    series.length ? h("p", { class: "series-avance" }, "Thèmes qui avancent : ", series.map((o, i) => [h("b", null, `${o.x.nom} ${o.apres}/${o.x.ids.length}`), i < series.length - 1 ? ", " : "."])) : null,
    ancien && !record ? h("p", { class: "consigne" }, `Ton record sur ${p.total} questions : ${ancien} points.`) : null,
    h("h2", { class: "sous-titre" }, "On remet ça ?"),
    choixDuree(rejouer));
  partie = null;
  majHud();
  allerA(b);
  setTimeout(() => celebrer(ratio, record), reduit() ? 0 : 500);
  // Le score monte comme dans une borne d'arcade.
  const t0 = performance.now(), duree = reduit() ? 1 : 1800;
  const monte = (t) => { const k = Math.min(1, Math.max(0, (t - t0) / duree)); score.textContent = Math.round(p.score * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(monte); };
  requestAnimationFrame(monte);
}

/* ---------- La célébration : air horn et canon à confettis ---------- */

// Air horn : le vrai son (sons/air-horn.mp3), décodé une fois puis joué via le volume général.
function chargerHorn() {
  if (hornCharge) return hornCharge;
  hornCharge = fetch("sons/air-horn.mp3").then((r) => r.arrayBuffer())
    .then((b) => new Promise((ok, ko) => ctx().decodeAudioData(b, ok, ko)))
    .then((buf) => (hornBuffer = buf)).catch(() => { hornCharge = null; });
  return hornCharge;
}
function airHorn(debut = 0, duree = 0, volume = 0.9) {
  if (!etat.son) return;
  const jouer = () => {
    try {
      const a = ctx();
      const src = a.createBufferSource(), g = a.createGain();
      src.buffer = hornBuffer;
      const t = a.currentTime + debut;
      g.gain.setValueAtTime(volume, t);
      if (duree) { g.gain.setValueAtTime(volume, t + duree - 0.05); g.gain.linearRampToValueAtTime(0, t + duree); }
      src.connect(g).connect(sortie);
      src.start(t, 0, duree || undefined);
    } catch (_) { /* pas de son */ }
  };
  if (hornBuffer) jouer(); else chargerHorn()?.then(() => hornBuffer && jouer());
}
// En fin de partie, façon meme : BWAP, BWAP, BWAAAAP.
const tripleHorn = () => { airHorn(0, 0.32); airHorn(0.4, 0.32); airHorn(0.8); };

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
  setTimeout(() => salve(Math.round(120 * intensite)), 400);
  setTimeout(() => salve(Math.round(180 * intensite)), 800);
  const t0 = performance.now();
  const boucle = (t) => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.32; p.vx *= 0.99; p.vy *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.hh / 2 * Math.abs(Math.cos(p.r * 2)), p.w, p.hh * Math.abs(Math.cos(p.r * 2)) + 1);
      ctx.restore();
    }
    if (t - t0 < 3780) requestAnimationFrame(boucle); else c.remove();
  };
  requestAnimationFrame(boucle);
}

// Un énorme texte qui traverse l'écran.
function banniere(texte, sous = "", duree = 1100) {
  const el = h("div", { class: "banniere", "aria-hidden": "true", style: `animation-duration:${duree}ms` }, h("b", null, texte), sous ? h("span", null, sous) : null);
  document.body.append(el);
  setTimeout(() => el.remove(), duree);
}

function celebrer(ratio, record) {
  const intensite = 0.9 + ratio * 1.2 + (record ? 0.5 : 0);
  tripleHorn();
  canonConfettis(intensite);
  if (ratio >= 0.5 || record) setTimeout(() => canonConfettis(intensite * 0.8), 1170);
  if (!reduit()) {
    const secouer = () => { document.body.classList.remove("seisme"); void document.body.offsetWidth; document.body.classList.add("seisme"); };
    const flasher = () => { const f = h("div", { class: "flash" }); document.body.append(f); setTimeout(() => f.remove(), 700); };
    secouer(); flasher();
    setTimeout(() => { secouer(); flasher(); }, 400);
    setTimeout(() => { secouer(); flasher(); }, 800);
    banniere(record ? "NOUVEAU RECORD" : ratio >= 0.9 ? "LÉGENDAIRE" : ratio >= 0.7 ? "ÉNORME" : ratio >= 0.5 ? "BIEN JOUÉ" : "TERMINÉ", "", 1800);
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


function ouvrirFiche(id) {
  const dlg = $("dlg-fiche");
  const s = salleParId[id];
  vider(dlg,
    tete(s.nom, `${serieDe[id].nom} · trouvé le ${new Date(etat.trouves[id].date + "T12:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`, dlg),
    h("div", { class: "t-corps fiche" },
      h("button", { class: "fiche-objet", type: "button", onclick: () => { dlg.close(); ouvrirObjet(id); }, "aria-label": "Contempler l'objet" }, imageObjet(s.objet, "fiche-img"), h("span", { class: "contempler" }, "Contempler")),
      QUESTIONS[id].map((q) => [
        h("p", { class: "fiche-q" }, q.texte),
        h("p", { class: "fiche-r" }, `Réponse : ${q.type === "vf" ? (q.reponse ? "vrai" : "faux") : q.type === "multi" ? q.bonnes.map((i) => q.choix[i]).join(", ") : q.type === "placer" ? q.valTexte : q.type === "estimer" ? `${q.val} ${q.unite}` : q.choix[q.reponse]}`),
        h("p", null, q.explication)]),
      s.saviezVous ? h("p", { class: "saviez" }, h("b", null, "Le saviez-vous ?"), s.saviezVous) : null,
      blocSources(s.sources)));
  dlg.showModal();
}

for (const d of ["dlg-collection", "dlg-fiche", "dlg-objet"]) {
  $(d).addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
}
$("dlg-objet").addEventListener("close", () => { if (visionneuse) { visionneuse.detruire(); visionneuse = null; } });
$("btn-collection").addEventListener("click", ouvrirCollection);
$("btn-niveau").addEventListener("click", () => {
  const i = niveauDe(etat.xp), suiv = NIVEAUX[i + 1];
  toast(`${etat.xp} points · `, h("b", null, NIVEAUX[i].nom), suiv ? ` · ${suiv.nom} à ${suiv.xp}` : " · niveau maximum");
});

/* ---------- Réglages : son et typo ---------- */

function appliquerSon() {
  const b = $("btn-son");
  b.setAttribute("aria-pressed", String(etat.son));
  b.setAttribute("aria-label", etat.son ? "Couper le son" : "Remettre le son");
}
$("btn-son").addEventListener("click", () => { etat.son = !etat.son; sauver(); appliquerSon(); if (etat.son) { creerContexte(); audio.resume().catch(() => {}); SONS.porte(); } });

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

