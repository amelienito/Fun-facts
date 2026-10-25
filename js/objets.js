// Objets low poly du cabinet, construits en code (aucun fichier 3D à charger).
import * as THREE from "three";

const PI = Math.PI;

export const mat = (color, o = {}) =>
  new THREE.MeshPhongMaterial({ color, flatShading: true, shininess: 18, specular: 0x1a1a1a, ...o });

export const laiton = () => mat(0xc9952f, { shininess: 70, specular: 0xffe2a0 });

const verre = (o = {}) =>
  new THREE.MeshPhongMaterial({
    color: 0xe4f7f4,
    transparent: true,
    opacity: 0.16,
    shininess: 140,
    specular: 0xffffff,
    flatShading: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    ...o,
  });

function m(geo, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  return mesh;
}

// Déforme une géométrie selon la direction de chaque sommet (même résultat pour les sommets dupliqués).
function bosseler(geo, fn) {
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    n.copy(v).normalize();
    v.multiplyScalar(1 + fn(n, v));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function cerveau() {
  const g = new THREE.Group();
  const geo = bosseler(new THREE.IcosahedronGeometry(0.42, 2), (n) => {
    let d = 0.075 * Math.sin(9 * n.x + 4 * n.y) + 0.06 * Math.sin(11 * n.z + 3 * n.x) + 0.05 * Math.sin(14 * n.y + 5 * n.z);
    if (Math.abs(n.x) < 0.13 && n.y > -0.25) d -= 0.13; // scissure entre les hémisphères
    return d;
  });
  const c = m(geo, mat(0xf08aa3, { shininess: 35, specular: 0x553333 }), 0, 0.66, 0);
  c.scale.set(1, 0.8, 1.2);
  g.add(c);
  g.add(m(new THREE.CylinderGeometry(0.07, 0.1, 0.32, 6), mat(0xcf7f92), 0, 0.34, 0.08));
  // liquide et bocal
  g.add(
    m(
      new THREE.CylinderGeometry(0.6, 0.6, 1.08, 12),
      new THREE.MeshPhongMaterial({ color: 0xd2efb4, transparent: true, opacity: 0.16, flatShading: true, depthWrite: false }),
      0, 0.57, 0
    )
  );
  g.add(m(new THREE.CylinderGeometry(0.64, 0.64, 1.32, 12, 1, true), verre(), 0, 0.66, 0));
  g.add(m(new THREE.CylinderGeometry(0.64, 0.64, 0.04, 12), verre({ opacity: 0.28 }), 0, 0.02, 0));
  g.add(m(new THREE.CylinderGeometry(0.69, 0.69, 0.15, 12), laiton(), 0, 1.39, 0));
  g.add(m(new THREE.CylinderGeometry(0.11, 0.15, 0.1, 8), laiton(), 0, 1.51, 0));
  return g;
}

function pyramide() {
  const g = new THREE.Group();
  const pyr = m(new THREE.ConeGeometry(0.92, 1.18, 4, 1), mat(0xe2b663), 0, 0.59, 0);
  pyr.rotation.y = PI / 4;
  g.add(pyr);
  const cap = m(new THREE.ConeGeometry(0.16, 0.2, 4, 1), laiton(), 0, 1.09, 0);
  cap.rotation.y = PI / 4;
  g.add(cap);
  // lignes d'assises
  for (const y of [0.3, 0.6, 0.88]) {
    const r = 0.92 * (1 - y / 1.18) + 0.012;
    const anneau = m(new THREE.CylinderGeometry(r, r, 0.022, 4, 1, true), mat(0xc39448), 0, y, 0);
    anneau.rotation.y = PI / 4;
    g.add(anneau);
  }
  const tel = new THREE.Group();
  tel.add(m(new THREE.BoxGeometry(0.36, 0.7, 0.05), mat(0x1f2427, { shininess: 70, specular: 0x777777 })));
  tel.add(m(new THREE.PlaneGeometry(0.3, 0.6), new THREE.MeshBasicMaterial({ color: 0x5bc2b6 }), 0, 0, 0.027));
  tel.position.set(0.52, 0.36, 0.86);
  tel.rotation.set(-0.22, -0.45, 0.06);
  g.add(tel);
  g.scale.setScalar(1.12);
  return g;
}

function dent() {
  const g = new THREE.Group();
  const roche = m(new THREE.DodecahedronGeometry(0.52, 0), mat(0x6e807b), 0, 0.17, 0);
  roche.scale.set(1.25, 0.42, 1);
  g.add(roche);
  const d = new THREE.Group();
  const lameGeo = new THREE.ConeGeometry(0.44, 1.02, 4, 1);
  lameGeo.rotateY(PI / 4);
  const lame = m(lameGeo, mat(0xede3cc, { shininess: 45, specular: 0x444444 }), 0, 0.97, 0);
  lame.scale.z = 0.3;
  d.add(lame);
  const racine = m(new THREE.CylinderGeometry(0.42, 0.48, 0.24, 6), mat(0x9a7049), 0, 0.42, 0);
  racine.scale.z = 0.42;
  d.add(racine);
  d.rotation.z = -0.1;
  g.add(d);
  g.scale.setScalar(1.28);
  return g;
}

function texHanafuda(variante) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 400;
  const x = c.getContext("2d");
  x.fillStyle = "#1c1a18";
  x.fillRect(0, 0, 256, 400);
  x.fillStyle = "#f3e8d0";
  x.fillRect(12, 12, 232, 376);
  if (variante === 0) {
    x.fillStyle = "#c8302c";
    x.fillRect(12, 12, 232, 130);
    x.strokeStyle = "#3b2a22";
    x.lineCap = "round";
    x.lineWidth = 15;
    x.beginPath();
    x.moveTo(26, 388);
    x.quadraticCurveTo(95, 262, 150, 222);
    x.quadraticCurveTo(204, 186, 232, 118);
    x.stroke();
    x.lineWidth = 9;
    x.beginPath();
    x.moveTo(118, 246);
    x.quadraticCurveTo(78, 196, 58, 150);
    x.stroke();
    const fleur = (cx, cy, r, col) => {
      x.fillStyle = col;
      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * PI) / 5 - PI / 2;
        x.beginPath();
        x.arc(cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 0.62, r * 0.5, 0, 7);
        x.fill();
      }
      x.fillStyle = "#f2c14e";
      x.beginPath();
      x.arc(cx, cy, r * 0.24, 0, 7);
      x.fill();
    };
    fleur(150, 214, 28, "#d8364b");
    fleur(58, 146, 23, "#f7f1e2");
    fleur(206, 162, 21, "#d8364b");
    fleur(96, 302, 19, "#f7f1e2");
    fleur(226, 112, 17, "#f7f1e2");
  } else {
    x.fillStyle = "#b8262f";
    x.fillRect(12, 12, 232, 250);
    x.fillStyle = "#f7f1e2";
    x.beginPath();
    x.arc(128, 128, 70, 0, 7);
    x.fill();
    x.fillStyle = "#1f1d1b";
    x.beginPath();
    x.moveTo(12, 388);
    x.lineTo(12, 250);
    x.quadraticCurveTo(128, 170, 244, 250);
    x.lineTo(244, 388);
    x.fill();
    x.strokeStyle = "#f3e8d0";
    x.lineWidth = 3;
    for (let i = 0; i < 9; i++) {
      x.beginPath();
      x.moveTo(30 + i * 24, 388);
      x.quadraticCurveTo(36 + i * 24, 300, 50 + i * 22, 236);
      x.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function carte(variante) {
  const dos = mat(0x1c1a18, { flatShading: false });
  const face = new THREE.MeshPhongMaterial({ map: texHanafuda(variante), shininess: 25, specular: 0x222222 });
  return new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.98, 0.028), [dos, dos, dos, dos, face, dos]);
}

function hanafuda() {
  const g = new THREE.Group();
  g.add(m(new THREE.BoxGeometry(1.15, 0.08, 0.46), laiton(), 0, 0.04, 0));
  g.add(m(new THREE.BoxGeometry(1.15, 0.06, 0.06), laiton(), 0, 0.11, 0.2));
  const a = carte(1);
  a.position.set(-0.2, 0.6, -0.04);
  a.rotation.set(-0.16, 0.08, 0.13);
  const b = carte(0);
  b.position.set(0.2, 0.58, 0.08);
  b.rotation.set(-0.14, -0.08, -0.12);
  g.add(a, b);
  g.scale.setScalar(1.3);
  return g;
}

function eiffel() {
  const g = new THREE.Group();
  const fer = mat(0x7d5036, { shininess: 28, specular: 0x332211 });
  const haut = new THREE.Vector3(0, 1, 0);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const a = new THREE.Vector3(sx * 0.56, 0, sz * 0.56);
    const b = new THREE.Vector3(sx * 0.25, 0.53, sz * 0.25);
    const jambe = m(new THREE.CylinderGeometry(0.055, 0.11, a.distanceTo(b), 4), fer);
    jambe.position.copy(a).add(b).multiplyScalar(0.5);
    jambe.quaternion.setFromUnitVectors(haut, b.clone().sub(a).normalize());
    g.add(jambe);
  }
  for (let i = 0; i < 4; i++) {
    const pivot = new THREE.Group();
    pivot.rotation.y = (i * PI) / 2;
    pivot.add(m(new THREE.TorusGeometry(0.33, 0.022, 4, 10, PI), fer, 0, 0.08, 0.4));
    g.add(pivot);
  }
  g.add(m(new THREE.BoxGeometry(0.74, 0.07, 0.74), fer, 0, 0.55, 0));
  const t2 = m(new THREE.CylinderGeometry(0.15, 0.31, 0.5, 4, 1), fer, 0, 0.83, 0);
  t2.rotation.y = PI / 4;
  g.add(t2);
  g.add(m(new THREE.BoxGeometry(0.4, 0.05, 0.4), fer, 0, 1.09, 0));
  const t3 = m(new THREE.CylinderGeometry(0.04, 0.155, 0.74, 4, 1), fer, 0, 1.48, 0);
  t3.rotation.y = PI / 4;
  g.add(t3);
  g.add(m(new THREE.BoxGeometry(0.12, 0.07, 0.12), fer, 0, 1.88, 0));
  g.add(m(new THREE.CylinderGeometry(0.008, 0.022, 0.2, 4), laiton(), 0, 2.0, 0));
  return g;
}

// Drap posé sur l'objet tant qu'il n'est pas découvert.
function drap() {
  const pts = [
    [0.0, 1.62], [0.32, 1.58], [0.58, 1.44], [0.78, 1.18], [0.88, 0.86], [0.92, 0.5], [0.98, 0.18], [1.06, 0.0],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(pts, 18);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const t = Math.atan2(z, x);
    const k = 1 + 0.09 * Math.sin(t * 7 + y * 2.2) * (1 - y / 1.7);
    p.setXYZ(i, x * k, y, z * k);
  }
  geo.computeVertexNormals();
  const g = new THREE.Group();
  const toile = new THREE.Mesh(geo, mat(0xeee4cc, { side: THREE.DoubleSide, shininess: 8, transparent: true }));
  toile.scale.setScalar(0.86);
  g.add(toile);
  return g;
}

// Caisse pour les catégories en cours d'acquisition.
function caisse() {
  const g = new THREE.Group();
  const bois = mat(0xa86c3c);
  const sombre = mat(0x6b3d22);
  g.add(m(new THREE.BoxGeometry(1.1, 0.78, 0.8), bois, 0, 0.39, 0));
  for (const y of [0.03, 0.75]) {
    g.add(m(new THREE.BoxGeometry(1.14, 0.07, 0.07), sombre, 0, y, 0.38));
    g.add(m(new THREE.BoxGeometry(1.14, 0.07, 0.07), sombre, 0, y, -0.38));
  }
  for (const x of [-0.54, 0.54]) g.add(m(new THREE.BoxGeometry(0.07, 0.78, 0.07), sombre, x, 0.39, 0.38));
  const diag = m(new THREE.BoxGeometry(1.2, 0.07, 0.03), sombre, 0, 0.39, 0.41);
  diag.rotation.z = Math.atan2(0.72, 1.06);
  g.add(diag);
  return g;
}

const FABRIQUES = { cerveau, pyramide, dent, hanafuda, eiffel, drap, caisse };

export function construire(id) {
  const f = FABRIQUES[id];
  return f ? f() : drap();
}

export function liberer(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const mt of mats) {
      if (mt.map) mt.map.dispose();
      mt.dispose();
    }
  });
}
