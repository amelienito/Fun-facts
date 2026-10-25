import { CATEGORIES, SALLES, FRISE, VERIFIE_LE } from "./data.js";

/* ---------- Outils ---------- */

const ecran = document.getElementById("ecran");
const barre = document.getElementById("barre");
const dlgCabinet = document.getElementById("cabinet");
const dlgFiche = document.getElementById("fiche");

function h(tag, props, ...enfants) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const e of enfants.flat(Infinity)) {
    if (e == null || e === false) continue;
    el.append(e instanceof Node ? e : document.createTextNode(String(e)));
  }
  return el;
}

const melanger = (liste) => {
  const a = liste.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const majuscule = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const pluriel = (n, mot, mots = mot + "s") => `${n} ${n > 1 ? mots : mot}`;
const enumerer = (l) => (l.length < 2 ? l.join("") : l.slice(0, -1).join(", ") + " et " + l[l.length - 1]);
const reduit = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmtDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const dateFr = (iso) => fmtDate.format(new Date(iso + "T12:00:00"));
const aujourdhui = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const focaliser = (el) => el && el.focus({ preventScroll: true });
// replaceChildren natif transforme null en texte « null » : on filtre d'abord.
const remplacer = (el, ...enfants) =>
  el.replaceChildren(...enfants.flat(Infinity).filter((e) => e != null && e !== false));

const salleParId = Object.fromEntries(SALLES.map((s) => [s.id, s]));
const catParId = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const catsOuvertes = CATEGORIES.filter((c) => !c.bientot && SALLES.some((s) => s.cat === c.id));
const catsBientot = CATEGORIES.filter((c) => c.bientot);

/* ---------- Mémoire du cabinet (dans le navigateur) ---------- */

const CLE = "funfacts:v1";
const memo = (() => {
  try {
    const m = JSON.parse(localStorage.getItem(CLE));
    return m && typeof m === "object" ? m : {};
  } catch (e) {
    return {};
  }
})();
memo.acquis = memo.acquis || {};
const sauver = () => {
  try {
    localStorage.setItem(CLE, JSON.stringify(memo));
  } catch (e) {
    /* stockage indisponible : le cabinet reste valable pour cette visite */
  }
};
const nbAcquis = () => SALLES.filter((s) => memo.acquis[s.id]).length;

/* ---------- 3D (chargée à la demande) ---------- */

let Scene3D = null;
let vitrine = null;
let vitrineFiche = null;
let etatVitrine = { id: null, mystere: true, nom: "" };

async function charger3D() {
  if (Scene3D !== null) return Scene3D;
  try {
    const mod = await import("./scene.js");
    Scene3D = mod.webglDispo() ? mod : false;
  } catch (e) {
    console.warn("3D indisponible", e);
    Scene3D = false;
  }
  return Scene3D;
}

async function placerVitrine(conteneur) {
  const S = await charger3D();
  if (!conteneur.isConnected) return;
  if (!S) {
    remplacer(conteneur, h("div", { class: "vitrine-repli" }, etatVitrine.mystere ? "?" : etatVitrine.nom));
    return;
  }
  try {
    if (!vitrine) vitrine = new S.Vitrine();
    vitrine.monter(conteneur);
    vitrine.montrer(etatVitrine.id, { mystere: etatVitrine.mystere });
  } catch (e) {
    console.warn(e);
    Scene3D = false;
    remplacer(conteneur, h("div", { class: "vitrine-repli" }, etatVitrine.mystere ? "?" : etatVitrine.nom));
  }
}

function devoilerVitrine(conteneur) {
  etatVitrine.mystere = false;
  conteneur.setAttribute("aria-label", `Vitrine : ${etatVitrine.nom}`);
  if (vitrine && vitrine.canvas.parentElement === conteneur) vitrine.devoiler();
  const repli = conteneur.querySelector(".vitrine-repli");
  if (repli) repli.textContent = etatVitrine.nom;
}

/* ---------- Barre du haut ---------- */

function majBarre(texte) {
  barre.hidden = false;
  document.getElementById("ou").textContent = texte;
  majCompteur(false);
}

function majCompteur(animer) {
  const n = nbAcquis();
  const btn = document.getElementById("btn-cabinet");
  document.getElementById("compte").textContent = `${n}/${SALLES.length}`;
  btn.setAttribute("aria-label", `Ouvrir mon cabinet : ${pluriel(n, "objet")} sur ${SALLES.length}`);
  if (animer && !reduit()) {
    btn.classList.remove("bump");
    void btn.offsetWidth;
    btn.classList.add("bump");
  }
}

document.getElementById("btn-accueil").addEventListener("click", afficherAccueil);
document.getElementById("btn-cabinet").addEventListener("click", ouvrirCabinet);

/* ---------- Accueil ---------- */

let choixCats = new Set(catsOuvertes.map((c) => c.id));
let visite = null;

function afficherAccueil() {
  visite = null;
  barre.hidden = true;
  const vit = h("div", { class: "vitrine", role: "img", "aria-label": "Une vitrine dont l'objet est couvert d'un drap" });
  const aide = h("p", { class: "aide", "aria-live": "polite" });
  const entrer = h("button", { class: "plaque", type: "button", onclick: commencer }, "Entrer dans le cabinet");

  const maj = () => {
    entrer.disabled = choixCats.size === 0;
    aide.textContent = choixCats.size === 0 ? "Ouvre au moins un tiroir pour entrer." : "";
  };

  const tiroirs = catsOuvertes.map((c) => {
    const n = SALLES.filter((s) => s.cat === c.id).length;
    const b = h(
      "button",
      {
        class: "tiroir",
        type: "button",
        "aria-pressed": String(choixCats.has(c.id)),
        onclick: () => {
          if (choixCats.has(c.id)) choixCats.delete(c.id);
          else choixCats.add(c.id);
          b.setAttribute("aria-pressed", String(choixCats.has(c.id)));
          maj();
        },
      },
      h("span", { class: "porte-etiquette" }, c.nom),
      h("span", { class: "compte" }, pluriel(n, "salle")),
      h("span", { class: "poignee", "aria-hidden": "true" })
    );
    return b;
  });

  const bientot = catsBientot.map((c) =>
    h(
      "div",
      { class: "tiroir tiroir-bientot" },
      h("span", { class: "porte-etiquette" }, c.nom),
      h("span", { class: "compte" }, "Bientôt")
    )
  );

  const n = nbAcquis();
  remplacer(ecran, h(
      "section",
      { class: "accueil" },
      h(
        "div",
        { class: "accueil-titre" },
        h("p", { class: "presente" }, "OSB Corporation présente :"),
        h("h1", { class: "titre", tabindex: "-1" }, "Fun facts"),
        h("p", { class: "intro" }, "Chaque fait découvert rejoint ton cabinet de curiosités, avec ses sources.")
      ),
      vit,
      h(
        "div",
        { class: "accueil-tiroirs" },
        h("p", { class: "consigne", id: "consigne-tiroirs" }, "Ouvre les tiroirs qui t'intéressent."),
        h("div", { class: "tiroirs", role: "group", "aria-labelledby": "consigne-tiroirs" }, tiroirs),
        bientot.length ? h("div", { class: "tiroirs tiroirs-bientot" }, bientot) : null,
        h(
          "div",
          { class: "actions" },
          entrer,
          h("button", { class: "lien", type: "button", onclick: ouvrirCabinet }, `Voir mon cabinet (${n}/${SALLES.length})`)
        ),
        aide
      )
    )
  );
  maj();
  etatVitrine = { id: null, mystere: true, nom: "" };
  placerVitrine(vit);
  window.scrollTo(0, 0);
}

/* ---------- Visite ---------- */

function commencer() {
  if (!choixCats.size) return;
  visite = { cats: new Set(choixCats), vues: [], bonnes: 0, total: 0, archives: false, archivesVues: 0, momentsVus: new Set() };
  const dispo = SALLES.filter((s) => visite.cats.has(s.cat));
  afficherSalle(melanger(dispo)[0].id, null);
}

function afficherSalle(id, lien) {
  const s = salleParId[id];
  visite.vues.push(id);
  majBarre(`Salle ${visite.vues.length}`);

  const vit = h("div", { class: "vitrine", role: "img", "aria-label": "Vitrine : l'objet est encore couvert d'un drap" });
  const etiquette = h("article", { class: "etiquette", "aria-labelledby": "question" });
  const apres = h("div", { class: "apres" });

  remplacer(ecran, h(
      "section",
      { class: "salle" },
      lien && lien.transition ? h("p", { class: "transition" }, lien.transition) : null,
      h("div", { class: "scene-salle" }, vit, h("p", { class: "plaque-cat" }, catParId[s.cat].nom)),
      h("div", { class: "etiquette-fil" }, etiquette),
      apres
    )
  );
  etatVitrine = { id: s.objet, mystere: true, nom: s.nom };
  placerVitrine(vit);
  poserQuestion(s, 0, { etiquette, apres, vit });
  window.scrollTo(0, 0);
}

function poserQuestion(s, qi, zones) {
  const { etiquette, apres, vit } = zones;
  const q = s.questions[qi];
  const total = s.questions.length;
  const resultat = h("div", { class: "resultat", "aria-live": "polite" });

  const reponses =
    q.type === "vf"
      ? h(
          "div",
          { class: "reponses-vf" },
          h("button", { class: "plaque", type: "button", "data-v": "true" }, "Vrai"),
          h("button", { class: "plaque", type: "button", "data-v": "false" }, "Faux")
        )
      : h(
          "div",
          { class: "reponses-qcm" },
          q.choix.map((c, i) => h("button", { class: "choix", type: "button", "data-i": String(i) }, c))
        );

  remplacer(etiquette, total > 1 ? h("p", { class: "q-num" }, `Question ${qi + 1} sur ${total}`) : null,
    h("h2", { class: "question", id: "question", tabindex: "-1" }, q.texte),
    reponses,
    resultat
  );
  focaliser(etiquette.querySelector("h2"));

  reponses.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || reponses.dataset.fini) return;
    reponses.dataset.fini = "1";
    const boutons = [...reponses.querySelectorAll("button")];
    let juste;
    if (q.type === "vf") {
      juste = (b.dataset.v === "true") === q.reponse;
      boutons.forEach((x) => x.classList.toggle("eteinte", x !== b));
    } else {
      juste = Number(b.dataset.i) === q.reponse;
      const bonne = reponses.querySelector(`[data-i="${q.reponse}"]`);
      b.classList.add(juste ? "juste" : "fausse");
      bonne.classList.add("bonne");
      boutons.forEach((x) => x.classList.toggle("eteinte", x !== b && x !== bonne));
    }
    boutons.forEach((x) => (x.disabled = true));
    visite.total++;
    if (juste) visite.bonnes++;

    const ligne = h(
      "div",
      { class: "verdict-ligne" },
      q.type === "vf" ? h("span", { class: `tampon ${q.reponse ? "vrai" : "faux"}` }, q.reponse ? "Vrai" : "Faux") : null,
      h(
        "span",
        { class: `verdict ${juste ? "ok" : "ko"}` },
        juste ? "Bonne réponse." : q.type === "qcm" ? `Mauvaise réponse. C'était : ${q.choix[q.reponse].toLowerCase()}.` : "Mauvaise réponse."
      )
    );
    remplacer(resultat, ligne, h("p", { class: "explication" }, q.explication));

    if (qi === 0) {
      const deja = !!memo.acquis[s.id];
      if (!deja) {
        memo.acquis[s.id] = { date: aujourdhui(), trouve: juste };
        sauver();
      }
      majCompteur(!deja);
      devoilerVitrine(vit);
      resultat.append(
        h(
          "p",
          { class: "acquis" },
          deja ? "Déjà dans ton cabinet : " : "Ajouté à ton cabinet : ",
          h("strong", null, s.nom),
          `, n° ${s.inventaire}.`
        )
      );
    }

    if (qi < total - 1) {
      resultat.append(
        h("button", { class: "plaque suivant", type: "button", onclick: () => poserQuestion(s, qi + 1, zones) }, "Question suivante")
      );
    } else {
      afficherSuite(s, apres);
    }
  });
}

function blocSources(sources) {
  const cle = (src) => src.url || src.nom + src.titre;
  const uniques = sources.filter((src, i) => sources.findIndex((x) => cle(x) === cle(src)) === i);
  return h(
    "section",
    { class: "sources" },
    h("h3", null, uniques.length > 1 ? "Sources" : "Source"),
    h(
      "ul",
      null,
      uniques.map((src) =>
        h(
          "li",
          null,
          src.url ? h("a", { href: src.url, target: "_blank", rel: "noopener" }, src.nom) : h("strong", null, src.nom),
          h("span", { class: "titre-src" }, src.titre)
        )
      )
    ),
    h("p", { class: "verifie" }, `Vérifié le ${dateFr(VERIFIE_LE)}`)
  );
}

function afficherSuite(s, apres) {
  remplacer(apres, s.saviezVous ? h("details", { class: "saviez" }, h("summary", null, "Le saviez-vous ?"), h("p", null, s.saviezVous)) : null,
    s.note ? h("div", { class: "note" }, h("strong", null, "Note de vérification"), h("p", null, s.note)) : null,
    blocSources(s.sources),
    blocPortes(s)
  );
}

function candidats(s) {
  const dispo = SALLES.filter((x) => visite.cats.has(x.cat) && !visite.vues.includes(x.id));
  const res = [];
  for (const l of s.liens || []) {
    const cible = dispo.find((d) => d.id === l.vers);
    if (cible && res.length < 2) res.push({ salle: cible, porte: l.porte, lien: l });
  }
  for (const cible of melanger(dispo)) {
    if (res.length >= 2) break;
    if (!res.some((r) => r.salle.id === cible.id)) res.push({ salle: cible, porte: cible.porte, lien: null });
  }
  return melanger(res);
}

function blocPortes(s) {
  const cands = candidats(s);
  if (!cands.length) {
    return h(
      "div",
      { class: "portes-bloc" },
      h("p", { class: "portes-intro" }, "Tu as visité toutes les salles ouvertes."),
      h("button", { class: "plaque", type: "button", onclick: afficherFin }, "Terminer la visite")
    );
  }
  return h(
    "div",
    { class: "portes-bloc" },
    h("p", { class: "portes-intro" }, cands.length === 2 ? "Deux portes s'ouvrent devant toi." : "Une dernière porte reste ouverte."),
    h(
      "div",
      { class: "portes" },
      cands.map((c) =>
        h(
          "div",
          { class: "porte-cadre" },
          h(
            "button",
            { class: "porte", type: "button", onclick: (e) => ouvrirPorte(e.currentTarget, c) },
            h("span", { class: "cat-porte" }, catParId[c.salle.cat].nom),
            h("span", { class: "plaque-porte" }, c.porte)
          )
        )
      )
    )
  );
}

function ouvrirPorte(btn, c) {
  if (btn.dataset.ouverte) return;
  btn.dataset.ouverte = "1";
  btn.classList.add("ouverte");
  const suite = () => {
    if (visite.vues.length % 5 === 3 && visite.archivesVues < Math.ceil(visite.vues.length / 5)) afficherArchives(() => afficherSalle(c.salle.id, c.lien));
    else afficherSalle(c.salle.id, c.lien);
  };
  setTimeout(suite, reduit() ? 0 : 560);
}

/* ---------- Salle des archives (frise) ---------- */

function choisirFrise() {
  const vues = new Set(visite ? visite.vues : []);
  const dejaVus = visite ? visite.momentsVus : new Set();
  const pool = FRISE.filter((it) => !dejaVus.has(it.id));
  const tri = melanger(pool.length >= 4 ? pool : FRISE).sort((a, b) => (vues.has(b.salle) ? 1 : 0) - (vues.has(a.salle) ? 1 : 0));
  const pris = [];
  const annees = new Set();
  for (const it of tri) {
    const an = Math.floor(it.date);
    if (annees.has(an)) continue;
    pris.push(it);
    annees.add(an);
    if (pris.length === 4) break;
  }
  if (visite) pris.forEach((it) => visite.momentsVus.add(it.id));
  return pris;
}

function afficherArchives(suite) {
  visite.archives = true;
  visite.archivesVues++;
  majBarre("Salle des archives");
  const items = choisirFrise();
  const ordre = items.slice().sort((a, b) => a.date - b.date);
  let places = items.map(() => null);
  let reserve = melanger(items);
  const angles = [-1.4, 0.9, -0.6, 1.2];

  const zoneReserve = h("div", { class: "fragments", role: "group", "aria-label": "Moments à placer" });
  const liste = h("ol", { class: "frise", "aria-label": "Frise, du plus ancien au plus récent" });
  const valider = h("button", { class: "plaque", type: "button", disabled: true }, "Valider l'ordre");
  const resultat = h("div", { class: "resultat-frise", "aria-live": "polite" });

  const rendre = () => {
    remplacer(zoneReserve, ...reserve.map((it, i) =>
        h(
          "button",
          {
            class: "fragment",
            type: "button",
            style: `--r:${angles[i % 4]}deg`,
            onclick: () => {
              const k = places.indexOf(null);
              if (k < 0) return;
              places[k] = it;
              reserve = reserve.filter((x) => x !== it);
              rendre();
            },
          },
          it.texte
        )
      )
    );
    remplacer(liste, ...places.map((it, k) =>
        h(
          "li",
          null,
          h("span", { class: "numero", "aria-hidden": "true" }, String(k + 1)),
          it
            ? h(
                "button",
                {
                  class: "fragment pose",
                  type: "button",
                  "aria-label": `Position ${k + 1} : ${it.texte}. Toucher pour retirer.`,
                  onclick: () => {
                    places[k] = null;
                    reserve.push(it);
                    rendre();
                  },
                },
                it.texte
              )
            : h("span", { class: "emplacement" }, k === 0 ? "Le plus ancien" : k === places.length - 1 ? "Le plus récent" : "Emplacement libre")
        )
      )
    );
    valider.disabled = places.includes(null);
  };

  valider.addEventListener("click", () => {
    valider.remove();
    zoneReserve.remove();
    let bons = 0;
    remplacer(liste, ...places.map((it, k) => {
        const ok = it.id === ordre[k].id;
        if (ok) bons++;
        return h(
          "li",
          { class: ok ? "ok" : "ko" },
          h("span", { class: "numero", "aria-hidden": "true" }, String(k + 1)),
          h(
            "div",
            { class: "fragment pose fige" },
            h("span", null, it.texte),
            h("span", { class: "date" }, majuscule(it.affichage)),
            h("span", { class: "statut" }, ok ? "Bien placé" : "Mal placé")
          )
        );
      })
    );
    visite.total++;
    if (bons === items.length) visite.bonnes++;
    remplacer(resultat, h(
        "p",
        { class: "score-frise" },
        bons === items.length ? "Tous les moments sont bien placés." : `${pluriel(bons, "moment")} bien placé${bons > 1 ? "s" : ""} sur ${items.length}.`
      ),
      bons < items.length
        ? [
            h("h3", null, "Le bon ordre"),
            h(
              "ol",
              { class: "ordre-correct" },
              ordre.map((it) => h("li", null, it.texte, h("span", { class: "date" }, majuscule(it.affichage))))
            ),
          ]
        : null,
      blocSources(items.map((i) => i.source)),
      h("button", { class: "plaque", type: "button", onclick: suite }, "Continuer la visite")
    );
  });

  remplacer(ecran, h(
      "section",
      { class: "archives" },
      h("h2", { tabindex: "-1" }, "Salle des archives"),
      h("p", null, "Range ces moments du plus ancien au plus récent. Touche-les dans l'ordre ; touche un moment déjà placé pour le retirer."),
      zoneReserve,
      liste,
      valider,
      resultat
    )
  );
  rendre();
  window.scrollTo(0, 0);
  focaliser(ecran.querySelector("h2"));
}

/* ---------- Fin de visite ---------- */

function afficherFin() {
  majBarre("Fin de la visite");
  remplacer(ecran, h(
      "section",
      { class: "fin" },
      h("h2", { tabindex: "-1" }, "Visite terminée"),
      h("p", null, `Tu as visité toutes les salles ouvertes, avec ${pluriel(visite.bonnes, "bonne réponse", "bonnes réponses")} sur ${visite.total}.`),
      catsBientot.length
        ? h("p", null, `D'autres salles arrivent : les tiroirs ${enumerer(catsBientot.map((c) => c.nom))} ouvriront bientôt.`)
        : null,
      h(
        "div",
        { class: "actions" },
        h("button", { class: "plaque", type: "button", onclick: ouvrirCabinet }, "Voir mon cabinet"),
        !visite.archives && visite.vues.length >= 2
          ? h("button", { class: "lien", type: "button", onclick: () => afficherArchives(afficherFin) }, "Passer par la salle des archives")
          : null,
        h("button", { class: "lien", type: "button", onclick: afficherAccueil }, "Recommencer la visite")
      )
    )
  );
  window.scrollTo(0, 0);
  focaliser(ecran.querySelector("h2"));
}

/* ---------- Cabinet ---------- */

function miniature(id, alt) {
  return h("img", { class: "mini", "data-objet": id, alt: alt || "", width: "160", height: "160", decoding: "async" });
}

async function remplirMiniatures(racine) {
  const S = await charger3D();
  for (const el of racine.querySelectorAll("img.mini[data-objet]")) {
    const url = S ? S.miniature(el.dataset.objet) : null;
    if (url) el.src = url;
    else el.replaceWith(h("span", { class: "mini-repli", "aria-hidden": "true" }, el.dataset.objet === "caisse" ? "" : "?"));
  }
}

function niche(s) {
  const a = memo.acquis[s.id];
  if (!a) {
    return h(
      "div",
      { class: "niche verrouillee", role: "img", "aria-label": `Objet n° ${s.inventaire}, pas encore découvert` },
      miniature("drap"),
      h("span", { class: "etiq", "aria-hidden": "true" }, h("span", { class: "num" }, `n° ${s.inventaire}`), "?")
    );
  }
  return h(
    "button",
    { class: "niche", type: "button", onclick: () => ouvrirFiche(s) },
    miniature(s.objet),
    h("span", { class: "etiq" }, h("span", { class: "num" }, `n° ${s.inventaire}`), s.nom)
  );
}

function ouvrirCabinet() {
  const n = nbAcquis();
  remplacer(dlgCabinet, h(
      "div",
      { class: "cabinet" },
      h(
        "header",
        { class: "cabinet-tete" },
        h("div", null, h("h2", null, "Ton cabinet"), h("p", null, `${pluriel(n, "objet")} sur ${SALLES.length}`)),
        h("button", { class: "fermer", type: "button", onclick: () => dlgCabinet.close() }, "Fermer")
      ),
      n === 0 ? h("p", { class: "cabinet-vide" }, "Ton cabinet est vide pour l'instant. Chaque salle visitée y ajoute un objet.") : null,
      h(
        "div",
        { class: "etageres" },
        catsOuvertes.map((c) =>
          h(
            "section",
            { class: "etagere" },
            h("h3", null, c.nom),
            h("div", { class: "niches" }, SALLES.filter((s) => s.cat === c.id).map(niche))
          )
        ),
        catsBientot.length
          ? h(
              "section",
              { class: "etagere etagere-large" },
              h("h3", null, "En cours d'acquisition"),
              h(
                "div",
                { class: "niches" },
                catsBientot.map((c) =>
                  h("div", { class: "niche caisse-niche" }, miniature("caisse", ""), h("span", { class: "etiq" }, c.nom))
                )
              )
            )
          : null
      ),
      h("div", { class: "cabinet-fin" })
    )
  );
  if (!dlgCabinet.open) dlgCabinet.showModal();
  remplirMiniatures(dlgCabinet);
}

/* ---------- Fiche d'inventaire ---------- */

function reponseTexte(q) {
  return q.type === "vf" ? `Réponse : ${q.reponse ? "vrai" : "faux"}.` : `Réponse : ${q.choix[q.reponse].toLowerCase()}.`;
}

async function ouvrirFiche(s) {
  const a = memo.acquis[s.id];
  const vit = h("div", { class: "vitrine vitrine-fiche", role: "img", "aria-label": `Vitrine : ${s.nom}` });
  remplacer(dlgFiche, h(
      "article",
      { class: "fiche" },
      h(
        "header",
        { class: "fiche-tete" },
        h("span", { class: "inv" }, `Inventaire n° ${s.inventaire}`),
        h("button", { class: "fermer", type: "button", onclick: () => dlgFiche.close() }, "Fermer")
      ),
      vit,
      h(
        "div",
        { class: "fiche-corps" },
        h("h3", null, s.nom),
        h(
          "p",
          { class: "meta" },
          `${catParId[s.cat].nom}. Acquis le ${dateFr(a.date)}. ${a.trouve ? "Trouvé du premier coup." : "Appris en salle."}`
        ),
        s.questions.map((q) =>
          h(
            "div",
            { class: "enonce-bloc" },
            h("p", { class: "enonce" }, q.texte),
            h("p", { class: "reponse-fiche" }, reponseTexte(q)),
            h("p", null, q.explication)
          )
        ),
        s.saviezVous ? [h("h4", null, "Le saviez-vous ?"), h("p", null, s.saviezVous)] : null,
        s.note ? h("div", { class: "note" }, h("strong", null, "Note de vérification"), h("p", null, s.note)) : null,
        blocSources(s.sources)
      )
    )
  );
  dlgFiche.showModal();
  const S = await charger3D();
  if (!dlgFiche.open) return;
  if (!S) {
    vit.append(h("div", { class: "vitrine-repli" }, s.nom));
    return;
  }
  try {
    if (vitrineFiche) vitrineFiche.detruire();
    vitrineFiche = new S.Vitrine();
    vitrineFiche.monter(vit);
    vitrineFiche.montrer(s.objet, { mystere: false });
  } catch (e) {
    vit.append(h("div", { class: "vitrine-repli" }, s.nom));
  }
}

dlgFiche.addEventListener("close", () => {
  if (vitrineFiche) {
    vitrineFiche.detruire();
    vitrineFiche = null;
  }
});
for (const d of [dlgCabinet, dlgFiche]) {
  d.addEventListener("click", (e) => {
    if (e.target === d) d.close();
  });
}

/* ---------- Démarrage ---------- */

afficherAccueil();
charger3D();
