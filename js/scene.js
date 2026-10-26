// Vitrine 3D : socle, cloche de verre, drap et objet. Plus un rendu de miniatures pour le cabinet.
import * as THREE from "three";
import { construire, liberer, mat, laiton } from "./objets.js";

let dispo = null;
export function webglDispo() {
  if (dispo !== null) return dispo;
  try {
    const c = document.createElement("canvas");
    dispo = !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    dispo = false;
  }
  return dispo;
}

const mouvementReduit = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function eclairer(scene) {
  scene.add(new THREE.HemisphereLight(0xfff1d6, 0x22504c, 2.2));
  const cle = new THREE.DirectionalLight(0xffe2b4, 2.6);
  cle.position.set(-3, 5, 4);
  scene.add(cle);
  const contre = new THREE.DirectionalLight(0x9fe6dd, 1.4);
  contre.position.set(3.5, 2, -4);
  scene.add(contre);
}

function socle() {
  const g = new THREE.Group();
  const bois = mat(0x5a321e, { shininess: 30, specular: 0x2a1a10 });
  const add = (geo, mt, y) => {
    const o = new THREE.Mesh(geo, mt);
    o.position.y = y;
    g.add(o);
  };
  add(new THREE.CylinderGeometry(1.3, 1.44, 0.44, 12), bois, -0.22);
  add(new THREE.CylinderGeometry(1.47, 1.47, 0.07, 12), laiton(), -0.47);
  add(new THREE.CylinderGeometry(1.16, 1.18, 0.05, 12), mat(0xa8204f, { shininess: 4 }), 0.015);
  return g;
}

function cloche() {
  const g = new THREE.Group();
  const verre = new THREE.MeshPhongMaterial({
    color: 0xeafcf8, transparent: true, opacity: 0.1, shininess: 150, specular: 0xffffff,
    flatShading: true, depthWrite: false, side: THREE.DoubleSide,
  });
  const h = 1.5, r = 1.12;
  const corps = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16, 1, true), verre);
  corps.position.y = h / 2;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), verre);
  dome.position.y = h;
  const bouton = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), laiton());
  bouton.position.y = h + r + 0.04;
  const anneau = new THREE.Mesh(new THREE.TorusGeometry(r + 0.02, 0.045, 6, 24), laiton());
  anneau.rotation.x = Math.PI / 2;
  anneau.position.y = 0.03;
  g.add(corps, dome, bouton, anneau);
  return g;
}

const easeOutBack = (t) => {
  const c1 = 1.5, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export class Vitrine {
  constructor({ avecCloche = true } = {}) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.canvas = this.renderer.domElement;
    this.canvas.className = "vitrine-canvas";
    this.canvas.setAttribute("aria-hidden", "true");
    this.scene = new THREE.Scene();
    eclairer(this.scene);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    this.scene.add(socle());
    if (avecCloche) this.scene.add(cloche());
    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);
    this.drap = construire("drap");
    this.scene.add(this.drap);
    this.objet = null;
    this.angle = -0.4;
    this.vitesse = 0.45;
    this.glisse = null;
    this.anim = null;
    this.vivant = true;
    this.derniere = performance.now();
    this._cadrer(1);
    this.ro = new ResizeObserver(() => this._taille());
    this._pointeur();
    this._boucle = this._boucle.bind(this);
    requestAnimationFrame(this._boucle);
  }

  monter(conteneur) {
    conteneur.appendChild(this.canvas);
    this.ro.disconnect();
    this.ro.observe(conteneur);
    this._taille();
  }

  _taille() {
    const p = this.canvas.parentElement;
    if (!p) return;
    const w = p.clientWidth, h = p.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this._cadrer(w / h);
  }

  _cadrer(ratio) {
    // Garde la cloche entière dans le cadre, quel que soit le format.
    const cam = this.camera;
    cam.aspect = ratio;
    const hauteurVisible = 4.15;
    const largeurVisible = 3.95;
    const fov = 30;
    const dH = hauteurVisible / 2 / Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const dW = largeurVisible / 2 / (Math.tan(THREE.MathUtils.degToRad(fov / 2)) * ratio);
    const d = Math.max(dH, dW);
    cam.fov = fov;
    cam.position.set(0, 1.1 + d * 0.16, d);
    cam.lookAt(0, 1.08, 0);
    cam.updateProjectionMatrix();
  }

  _pointeur() {
    const c = this.canvas;
    c.addEventListener("pointerdown", (e) => {
      this.glisse = { x: e.clientX, angle: this.angle };
      c.setPointerCapture(e.pointerId);
    });
    c.addEventListener("pointermove", (e) => {
      if (!this.glisse) return;
      this.angle = this.glisse.angle + (e.clientX - this.glisse.x) * 0.012;
    });
    const fin = () => (this.glisse = null);
    c.addEventListener("pointerup", fin);
    c.addEventListener("pointercancel", fin);
  }

  montrer(id, { mystere = false } = {}) {
    if (this.objet) {
      this.pivot.remove(this.objet);
      liberer(this.objet);
      this.objet = null;
    }
    if (id) {
      this.objet = construire(id);
      this.pivot.add(this.objet);
    }
    this.anim = null;
    this.drap.visible = mystere || !id;
    this.drap.position.y = 0;
    this.drap.scale.setScalar(1);
    this._opaciteDrap(1);
    this.pivot.visible = !this.drap.visible;
    this.pivot.scale.setScalar(1);
  }

  _opaciteDrap(o) {
    this.drap.traverse((x) => {
      if (x.material) x.material.opacity = o;
    });
  }

  devoiler() {
    if (!this.objet) return;
    if (mouvementReduit()) {
      this.drap.visible = false;
      this.pivot.visible = true;
      return;
    }
    this.anim = { debut: performance.now(), duree: 1100 };
    this.pivot.visible = true;
    this.pivot.scale.setScalar(0.001);
  }

  _boucle(t) {
    if (!this.vivant) return;
    requestAnimationFrame(this._boucle);
    const dt = Math.min(0.05, (t - this.derniere) / 1000);
    this.derniere = t;
    if (!this.canvas.isConnected || document.hidden) return;
    if (!this.glisse && !mouvementReduit()) this.angle += this.vitesse * dt;
    this.pivot.rotation.y = this.angle;
    this.drap.rotation.y = this.angle * 0.15;
    if (this.anim) {
      const p = Math.min(1, (t - this.anim.debut) / this.anim.duree);
      const pd = Math.min(1, p / 0.55);
      this.drap.position.y = easeInOut(pd) * 1.9;
      this.drap.scale.setScalar(1 - 0.25 * pd);
      this._opaciteDrap(1 - pd);
      if (pd >= 1) this.drap.visible = false;
      const po = Math.max(0, (p - 0.25) / 0.75);
      this.pivot.scale.setScalar(Math.max(0.001, easeOutBack(po)));
      if (p >= 1) this.anim = null;
    }
    this.renderer.render(this.scene, this.camera);
  }

  detruire() {
    this.vivant = false;
    this.ro.disconnect();
    if (this.objet) liberer(this.objet);
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((x) => x.dispose());
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }
}

// Miniatures des objets pour les étagères du cabinet (rendues une fois, puis gardées en mémoire).
let mini = null;
const cache = new Map();

export function miniature(id) {
  if (cache.has(id)) return cache.get(id);
  if (!webglDispo()) return null;
  try {
    if (!mini) {
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(1);
      renderer.setSize(420, 420, false);
      const scene = new THREE.Scene();
      eclairer(scene);
      mini = { renderer, scene, camera: new THREE.PerspectiveCamera(26, 1, 0.1, 60) };
    }
    const obj = construire(id);
    obj.rotation.y = -0.55;
    mini.scene.add(obj);
    const boite = new THREE.Box3().setFromObject(obj);
    const centre = boite.getCenter(new THREE.Vector3());
    const taille = boite.getSize(new THREE.Vector3());
    const rayon = Math.max(taille.x, taille.y, taille.z) * 0.58;
    const d = rayon / Math.tan(THREE.MathUtils.degToRad(13));
    const dir = new THREE.Vector3(0.1, 0.32, 1).normalize();
    mini.camera.position.copy(centre).addScaledVector(dir, d);
    mini.camera.lookAt(centre);
    mini.renderer.render(mini.scene, mini.camera);
    const url = mini.renderer.domElement.toDataURL("image/png");
    mini.scene.remove(obj);
    liberer(obj);
    cache.set(id, url);
    return url;
  } catch (e) {
    return null;
  }
}

// Visionneuse plein écran : tourner l'objet au doigt ou à la souris, zoomer, et il tourne seul au repos.
export class Visionneuse {
  constructor(conteneur, id) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.canvas = this.renderer.domElement;
    this.canvas.style.cssText = "width:100%;height:100%;display:block;touch-action:none;cursor:grab";
    conteneur.append(this.canvas);
    this.scene = new THREE.Scene();
    eclairer(this.scene);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.05, 80);
    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);
    const obj = construire(id);
    const boite = new THREE.Box3().setFromObject(obj);
    const c = boite.getCenter(new THREE.Vector3());
    obj.position.sub(c);
    this.pivot.add(obj);
    this.obj = obj;
    const t = boite.getSize(new THREE.Vector3());
    this.rayon = Math.max(t.x, t.y, t.z) * 0.62;
    this.zoom = 1;
    this.ry = -0.5; this.rx = 0.18; this.vy = 0.5;
    this.pointeurs = new Map();
    this.dernier = performance.now();
    this.repos = 0;
    const cv = this.canvas;
    cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); this.pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY }); cv.style.cursor = "grabbing"; });
    cv.addEventListener("pointermove", (e) => {
      const p = this.pointeurs.get(e.pointerId);
      if (!p) return;
      if (this.pointeurs.size === 1) {
        const dx = e.clientX - p.x, dy = e.clientY - p.y;
        this.ry += dx * 0.01; this.rx = Math.max(-1.1, Math.min(1.1, this.rx + dy * 0.008));
        this.vy = dx * 0.6;
      } else if (this.pointeurs.size === 2) {
        const autres = [...this.pointeurs.entries()].find(([k]) => k !== e.pointerId)[1];
        const avant = Math.hypot(p.x - autres.x, p.y - autres.y), apres = Math.hypot(e.clientX - autres.x, e.clientY - autres.y);
        if (avant > 0) this.zoom = Math.max(0.6, Math.min(3, this.zoom * (apres / avant)));
      }
      p.x = e.clientX; p.y = e.clientY;
      this.repos = 0;
    });
    const fin = (e) => { this.pointeurs.delete(e.pointerId); if (!this.pointeurs.size) cv.style.cursor = "grab"; };
    cv.addEventListener("pointerup", fin);
    cv.addEventListener("pointercancel", fin);
    cv.addEventListener("wheel", (e) => { e.preventDefault(); this.zoom = Math.max(0.6, Math.min(3, this.zoom * Math.exp(-e.deltaY * 0.0015))); }, { passive: false });
    this.ro = new ResizeObserver(() => this._taille());
    this.ro.observe(conteneur);
    this._taille();
    this.vivant = true;
    this._boucle = this._boucle.bind(this);
    requestAnimationFrame(this._boucle);
  }
  _taille() {
    const p = this.canvas.parentElement;
    if (!p || !p.clientWidth) return;
    this.renderer.setSize(p.clientWidth, p.clientHeight, false);
    this.camera.aspect = p.clientWidth / p.clientHeight;
    this.camera.updateProjectionMatrix();
  }
  _boucle(t) {
    if (!this.vivant) return;
    requestAnimationFrame(this._boucle);
    const dt = Math.min(0.05, (t - this.dernier) / 1000);
    this.dernier = t;
    this.repos += dt;
    if (!this.pointeurs.size) {
      this.vy += ((this.repos > 1.5 ? 0.45 : 0) - this.vy) * Math.min(1, dt * 2.5);
      this.ry += this.vy * dt;
    }
    this.pivot.rotation.set(this.rx, this.ry, 0);
    const ajust = Math.min(1, this.camera.aspect);
    const d = (this.rayon / Math.tan(THREE.MathUtils.degToRad(15))) / ajust / this.zoom;
    this.camera.position.set(0, 0, d);
    this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera);
  }
  detruire() {
    this.vivant = false;
    this.ro.disconnect();
    liberer(this.obj);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }
}
