// Sauvegarde en ligne (par code) et statistiques des joueurs, via Supabase.
import { SUPABASE_URL, SUPABASE_CLE } from "./config.js";

export const actif = !!(SUPABASE_URL && SUPABASE_CLE);
const entetes = () => ({ apikey: SUPABASE_CLE, Authorization: `Bearer ${SUPABASE_CLE}`, "Content-Type": "application/json" });

async function rpc(fn, args) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, { method: "POST", headers: entetes(), body: JSON.stringify(args) });
  if (!r.ok) throw new Error(`${fn} : ${r.status}`);
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

export function compterReponse(question, juste) {
  if (!actif) return;
  rpc("compter_reponse", { p_question: question, p_juste: juste }).catch(() => {});
}

export async function statsDe(question) {
  if (!actif) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/stats_reponses?question=eq.${encodeURIComponent(question)}&select=total,justes`, { headers: entetes() });
    if (!r.ok) return null;
    const [ligne] = await r.json();
    return ligne || { total: 0, justes: 0 };
  } catch (_) {
    return null;
  }
}

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function nouveauCode() {
  const t = new Uint32Array(8);
  crypto.getRandomValues(t);
  return [...t].map((n) => ALPHABET[n % ALPHABET.length]).join("");
}
export const normaliserCode = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
export const afficherCode = (c) => `${c.slice(0, 4)}-${c.slice(4)}`;

export const ecrireSauvegarde = (code, donnees) => rpc("ecrire_sauvegarde", { p_code: code, p_donnees: donnees });
export const lireSauvegarde = (code) => rpc("lire_sauvegarde", { p_code: code });
