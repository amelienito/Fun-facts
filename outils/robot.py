"""Robot joueur : python3 outils/robot.py GRAINE NB_JOUEURS sortie.json (site servi sur localhost:8200).
Chaque joueur a un niveau (30 à 90 % de bonnes réponses) et enchaîne 3 à 8 parties de longueurs variées."""
import asyncio, os, sys, json, random
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.async_api import async_playwright

SEED, NJOUEURS, OUT = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
random.seed(SEED)
FAST = "const st=window.setTimeout.bind(window);window.setTimeout=(f,d,...a)=>st(f,Math.min(d||0,15),...a);"

STEP_JS = r"""
async ({skill, ctl}) => {
  const M = await import('/js/questions.js');
  const Q = M.QUESTIONS;
  if (!window.__idx) { window.__idx = {}; for (const id in Q) Q[id].forEach((q, qi) => window.__idx[q.texte.replace(/[\s\u202F\u00A0]/g,'')] = {id, qi, q}); }
  const fil = document.getElementById('fil');
  const last = fil.lastElementChild;
  const out = {};
  const ann = document.querySelector('#annonce .gros-bouton'); if (ann && ann.offsetParent) ann.click();
  out.overflowX = document.documentElement.scrollWidth > window.innerWidth + 1;
  const hud = document.querySelector('.hud'); out.hudOver = hud ? hud.scrollWidth > hud.clientWidth + 1 : false;
  if (!last) return {k:'vide'};
  if (last.classList.contains('fin-partie')) {
    const n = (s) => (last.querySelector(s) || {}).textContent;
    return {k:'fin', titre: n('.titre-fin'), score: n('.score-ligne'), stats: [...last.querySelectorAll('.stats li')].map(l => l.textContent), prono: n('.prono-bilan'), ...out};
  }
  const pass = last.querySelector('.passer-intermede');
  if (pass) {
    const t = last.classList.contains('inter-pom') ? 'pom' : last.classList.contains('inter-paires') ? 'paires' : 'eclair';
    pass.click(); return {k:'inter', t, ...out};
  }
  const prono = [...last.querySelectorAll('.prono-n')].filter(b => b.offsetParent);
  if (prono.length && !last.dataset.pronoFait) {
    last.dataset.pronoFait = 1;
    if (Math.random() < 0.7) { const v = Math.max(5, Math.min(10, Math.round(skill*10))); const b = prono.find(b => Number(b.textContent) === v) || prono[0]; b.click(); return {k:'prono', v, ...out}; }
    last.querySelector('.prono-passer')?.click(); return {k:'prono', v: 0, ...out};
  }
  // question en cours ?
  const h1 = last.querySelector('h1.question');
  const ouverte = last.querySelector('.reponses:not(.fini) .rep, .multi:not(.fini), .placer:not(.fini), .estimer:not(.fini)');
  if (h1 && ouverte && !last.querySelector('.suite:not([hidden]) .verdict')) {
    const info = window.__idx[h1.textContent.replace(/[\s\u202F\u00A0]/g,'')];
    if (!info) return {k:'inconnue', texte: h1.textContent, ...out};
    const {q, id, qi} = info; const ok = Math.random() < skill;
    out.q = {id, qi, type: q.type, voulu: ok, longue: h1.classList.contains('longue'), nchoix: (q.choix||[]).length, len: q.texte.length};
    if (q.type === 'vf' || q.type === 'qcm') {
      const reps = [...last.querySelectorAll('.reponses:not(.fini) .rep')];
      const val = (b) => b.dataset.v === 'true' ? true : b.dataset.v === 'false' ? false : Number(b.dataset.v);
      const bonnes = reps.filter(b => val(b) === q.reponse), faux = reps.filter(b => val(b) !== q.reponse);
      const b = ok ? bonnes[0] : (faux[Math.floor(Math.random()*faux.length)] || bonnes[0]);
      b.click(); out.k = 'rep'; return out;
    }
    if (q.type === 'multi') {
      const t = [...last.querySelectorAll('.tuile')];
      const want = new Set(ok ? q.bonnes : [t.map(x => Number(x.dataset.i)).find(i => !q.bonnes.includes(i))]);
      t.forEach(x => { if (want.has(Number(x.dataset.i))) x.click(); });
      [...last.querySelectorAll('.gros-bouton')].find(b => b.textContent.includes('Valider')).click(); out.k = 'rep'; return out;
    }
    if (q.type === 'estimer') {
      const c = last.querySelector('.lb-range');
      const cible = ok ? q.val + Math.round((Math.random()*2-1) * q.tol * 0.9) : q.val + (Math.random()<.5?-1:1) * Math.round(q.tol * (2.2 + Math.random()*3));
      c.value = Math.max(q.min, Math.min(q.max, cible)); c.dispatchEvent(new Event('input', {bubbles:true}));
      last.querySelector('.estimer .gros-bouton').click(); out.k = 'rep'; return out;
    }
    if (q.type === 'placer') {
      const p = last.querySelector('.lb-piste').getBoundingClientRect();
      const v = ok ? q.val + (Math.random()*2-1) * q.tol * 0.9 : q.val + (Math.random()<.5?-1:1) * q.tol * (2.2 + Math.random()*3);
      const f = Math.max(0.01, Math.min(0.99, (v - q.min) / (q.max - q.min)));
      return {k:'placer', x: p.left + p.width*f, y: p.top + p.height/2, ...out};
    }
  }
  // sinon : suite
  const gros = [...last.querySelectorAll('.suite:not([hidden]) .gros-bouton')];
  const v = last.querySelector('.suite:not([hidden]) .verdict');
  if (v && !last.dataset['lu'+ (last.querySelector('.suite').children.length)]) {
    out.verdict = v.querySelector('b').textContent; out.gain = (v.querySelector('.gain')||{}).textContent;
    out.deja = !!last.querySelector('.etiquettes')?.textContent.includes('Déjà');
    out.pepite = !!last.querySelector('.etiq.pepite');
  }
  const suiv = gros.find(b => b.textContent.includes('suivante')); if (suiv) { suiv.click(); out.k = 'suite'; return out; }
  const res = gros.find(b => b.textContent.includes('résultat')); if (res) { res.click(); out.k = 'res'; return out; }
  const portes = [...last.querySelectorAll('.porte:not([disabled])')];
  if (portes.length) { const p = portes[Math.floor(Math.random()*portes.length)]; out.porteType = p.querySelector('.p-type')?.textContent; out.portes = portes.map(x => x.querySelector('.p-type')?.textContent); p.click(); out.k = 'porte'; return out; }
  return {k:'attente', ...out};
}
"""

async def jouer_partie(pg, skill, longueur, log):
    # lancer
    if await pg.query_selector(".bande:last-child .durees"):
        await pg.click(f".bande:last-child .duree[data-n='{longueur}']")
        await pg.click(".bande:last-child .jouer")
        await pg.wait_for_timeout(60)
    ev = []; stuck = 0; steps = 0; t_inter = 0
    while steps < 700:
        steps += 1
        r = await pg.evaluate(STEP_JS, {"skill": skill, "ctl": 0})
        k = r.get("k")
        if k == "placer":
            await pg.mouse.click(r["x"], r["y"]); await pg.wait_for_timeout(15)
            ok = await pg.evaluate("() => { const b=document.querySelector('#fil').lastElementChild.querySelector('.placer .gros-bouton'); if(b && !b.disabled){b.click();return true} return false }")
            r["k"] = "rep"
        ev.append(r)
        if k == "fin": return {"ev": ev, "steps": steps}
        if k in ("attente", "vide"):
            stuck += 1
            if stuck > 25:
                html = await pg.evaluate("() => document.getElementById('fil').lastElementChild.outerHTML.slice(0,2500) + ' || ' + document.getElementById('progression-partie').textContent")
                ev.append({"k": "BLOQUE", "html": html}); return {"ev": ev, "steps": steps}
        else: stuck = 0
        if k == "inconnue": ev.append({"k": "BLOQUE"}); return {"ev": ev, "steps": steps}
        await pg.wait_for_timeout(18)
    ev.append({"k": "BLOQUE"}); return {"ev": ev, "steps": steps}

async def main():
    res = []
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-angle=swiftshader","--enable-unsafe-swiftshader"])
        for j in range(NJOUEURS):
            skill = random.choice([0.3, 0.5, 0.7, 0.9])
            nparties = random.choice([3, 4, 6, 8])
            ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1, reduced_motion="reduce")
            await ctx.route("**/js/scene.js", lambda r: r.abort())
            await ctx.route("**/sons/**", lambda r: r.abort())
            pg = await ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "ERR_FAILED" not in m.text and "Failed to load resource" not in m.text else None)
            await pg.add_init_script(FAST)
            await pg.goto("http://localhost:8200/", wait_until="load"); await pg.wait_for_timeout(500)
            for n in range(nparties):
                lg = random.choice([10, 10, 15, 20, 30, 40, 49])
                if n == 0 and not await pg.query_selector(".bande:last-child .durees"):
                    # la première partie démarre toute seule : lire sa longueur
                    pass
                part = await jouer_partie(pg, skill, lg, None)
                part.update({"joueur": j, "seed": SEED, "skill": skill, "n": n, "longueur_demandee": lg, "errs": list(errs)})
                res.append(part)
                errs.clear()
                with open(OUT, "w") as f: json.dump(res, f)
                if part["ev"][-1].get("k") != "fin": break
            await ctx.close()
        await b.close()
asyncio.run(main())
