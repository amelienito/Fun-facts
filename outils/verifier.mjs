import { SALLES } from "../js/data.js";
import { QUESTIONS, SERIES, PEPITES } from "../js/questions.js";
const ids = SALLES.map((s) => s.id);
const manque = ids.filter((id) => !QUESTIONS[id]);
const enTrop = Object.keys(QUESTIONS).filter((id) => !ids.includes(id));
const enSerie = SERIES.flatMap((s) => s.ids);
const horsSerie = ids.filter((id) => !enSerie.includes(id));
const doublons = enSerie.filter((x, i, a) => a.indexOf(x) !== i);
let vf = 0, qcm = 0, casse = [];
for (const [id, qs] of Object.entries(QUESTIONS)) for (const q of qs) {
  if (q.type === "vf") vf++; else if (q.type === "multi") { if (!q.bonnes.every((i) => i in q.choix)) casse.push(id); } else if (q.type === "placer" || q.type === "estimer") { if (!(q.val >= q.min && q.val <= q.max)) casse.push(id); } else { qcm++; if (!(q.reponse in q.choix)) casse.push(id); }
}
console.log({ salles: ids.length, manque, enTrop, horsSerie, doublons, pepitesInconnues: PEPITES.filter((p) => !ids.includes(p)), vf, qcm, casse });
