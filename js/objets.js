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

// Object3D.add() renvoie le parent : on oriente la pièce avant de l'ajouter.
function tourne(o, axe, v) {
  o.rotation[axe] = v;
  return o;
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


/* ---------- Objets des salles tirées des notes ---------- */

const ellipsoide = (rx, ry, rz, mt, x = 0, y = 0, z = 0, d = 1) => {
  const o = m(new THREE.IcosahedronGeometry(1, d), mt, x, y, z);
  o.scale.set(rx, ry, rz);
  return o;
};

function nid() {
  const g = new THREE.Group();
  const paille = mat(0x8b6236);
  const anneau = m(new THREE.TorusGeometry(0.55, 0.2, 5, 12), paille, 0, 0.2, 0);
  anneau.rotation.x = PI / 2;
  anneau.scale.z = 0.8;
  g.add(anneau);
  g.add(m(new THREE.CylinderGeometry(0.5, 0.42, 0.14, 10), mat(0x6e4a28), 0, 0.1, 0));
  for (const [x, z, c] of [[-0.2, 0.1, 0x9fd3e0], [0.14, -0.16, 0x9fd3e0], [0.18, 0.18, 0x9fd3e0]]) g.add(ellipsoide(0.13, 0.17, 0.13, mat(c), x, 0.32, z));
  g.add(ellipsoide(0.19, 0.25, 0.19, mat(0xd9cbb0), -0.08, 0.38, -0.12)); // l'œuf du coucou, plus gros
  g.scale.setScalar(1.25);
  return g;
}

function hibou() {
  const g = new THREE.Group();
  const plume = mat(0x8a6a48), clair = mat(0xd8c3a0), serre = mat(0x3a2e24);
  g.add(tourne(m(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 6), mat(0x5a3b22), 0, 0.12, 0), "z", PI / 2));
  for (const x of [-0.13, 0.13]) {
    g.add(m(new THREE.CylinderGeometry(0.035, 0.045, 0.62, 5), mat(0xc9b08a), x, 0.48, 0));
    g.add(tourne(m(new THREE.ConeGeometry(0.07, 0.12, 4), serre, x, 0.17, 0.05), "x", PI));
  }
  g.add(ellipsoide(0.36, 0.46, 0.32, plume, 0, 1.12, 0));
  g.add(ellipsoide(0.24, 0.3, 0.12, clair, 0, 1.05, 0.22));
  g.add(ellipsoide(0.32, 0.27, 0.28, plume, 0, 1.62, 0.02));
  g.add(ellipsoide(0.26, 0.2, 0.08, clair, 0, 1.6, 0.24));
  for (const x of [-0.1, 0.1]) {
    g.add(ellipsoide(0.07, 0.07, 0.04, mat(0xf2b632), x, 1.63, 0.31, 1));
    g.add(ellipsoide(0.035, 0.035, 0.02, mat(0x111111), x, 1.63, 0.34, 0));
    const aigrette = m(new THREE.ConeGeometry(0.06, 0.2, 4), plume, x * 1.9, 1.86, 0);
    aigrette.rotation.z = -x * 2.5;
    g.add(aigrette);
  }
  g.add(tourne(m(new THREE.ConeGeometry(0.04, 0.1, 4), mat(0x3a2e24), 0, 1.53, 0.32), "x", PI * 0.6));
  return g;
}

function ours() {
  const g = new THREE.Group();
  const poil = mat(0xe0cfae), brun = mat(0x9c7650), nez = mat(0x241c16);
  g.add(ellipsoide(0.62, 0.42, 0.38, poil, 0, 0.62, 0));
  for (const [x, z] of [[-0.38, 0.2], [0.38, 0.2], [-0.38, -0.2], [0.38, -0.2]]) g.add(m(new THREE.CylinderGeometry(0.11, 0.12, 0.42, 6), brun, x, 0.21, z));
  g.add(ellipsoide(0.26, 0.24, 0.24, poil, 0.66, 0.86, 0));
  g.add(ellipsoide(0.14, 0.1, 0.1, brun, 0.9, 0.8, 0));
  g.add(ellipsoide(0.04, 0.035, 0.04, nez, 1.02, 0.83, 0, 0));
  for (const z of [-0.14, 0.14]) {
    g.add(ellipsoide(0.07, 0.07, 0.04, brun, 0.6, 1.07, z, 0));
    g.add(ellipsoide(0.025, 0.025, 0.025, nez, 0.84, 0.92, z * 0.6, 0));
  }
  g.position.x = -0.18;
  const h = new THREE.Group();
  h.add(g);
  return h;
}

function arbre() {
  const g = new THREE.Group();
  const ecorce = mat(0x9a8a76), feuille = mat(0x4f7d3a), sang = mat(0xb3121f, { shininess: 60, specular: 0x552222 });
  g.add(m(new THREE.CylinderGeometry(0.16, 0.24, 0.9, 7), ecorce, 0, 0.45, 0));
  for (let i = 0; i < 5; i++) {
    const b = m(new THREE.CylinderGeometry(0.06, 0.1, 0.55, 5), ecorce, 0, 1.05, 0);
    b.rotation.set(0.55, (i * 2 * PI) / 5, 0, "YXZ");
    b.position.set(Math.sin((i * 2 * PI) / 5) * 0.16, 1.1, Math.cos((i * 2 * PI) / 5) * 0.16);
    g.add(b);
  }
  const canope = m(new THREE.SphereGeometry(0.95, 10, 5, 0, PI * 2, 0, PI / 2), feuille, 0, 1.22, 0);
  canope.scale.y = 0.42;
  g.add(canope);
  g.add(tourne(m(new THREE.CircleGeometry(0.95, 10), mat(0x3b5e2b, { side: THREE.DoubleSide }), 0, 1.22, 0), "x", PI / 2));
  for (const [y, z] of [[0.62, 0.2], [0.42, 0.22]]) g.add(ellipsoide(0.04, 0.07, 0.04, sang, 0.05, y, z, 0));
  g.add(m(new THREE.CylinderGeometry(0.02, 0.06, 0.3, 5), sang, 0.04, 0.76, 0.19));
  return g;
}

function cachalot() {
  const g = new THREE.Group();
  const peau = mat(0x4d5a66), ventre = mat(0x7d8994);
  const corps = new THREE.Group();
  corps.add(m(new THREE.BoxGeometry(0.85, 0.5, 0.48), peau, 0.35, 0, 0));
  const queue = m(new THREE.CylinderGeometry(0.24, 0.06, 1.0, 7), peau, -0.55, 0, 0);
  queue.rotation.z = PI / 2;
  corps.add(queue);
  const nageoire = m(new THREE.BoxGeometry(0.16, 0.04, 0.56), peau, -1.08, 0.02, 0);
  corps.add(nageoire);
  corps.add(m(new THREE.BoxGeometry(0.62, 0.08, 0.2), ventre, 0.38, -0.26, 0));
  corps.position.y = 1.0;
  corps.rotation.z = 0.08;
  g.add(corps);
  g.add(m(new THREE.CylinderGeometry(0.025, 0.025, 0.75, 5), laiton(), 0, 0.42, 0));
  g.add(m(new THREE.CylinderGeometry(0.3, 0.34, 0.06, 8), laiton(), 0, 0.03, 0));
  return g;
}

function os() {
  const g = new THREE.Group();
  const ivoire = mat(0xeee3c8, { shininess: 40, specular: 0x444444 });
  const arc = m(new THREE.TorusGeometry(0.4, 0.06, 5, 12, PI), ivoire, 0, 0.62, 0);
  g.add(arc);
  g.add(m(new THREE.BoxGeometry(0.98, 0.08, 0.32), ivoire, 0, 0.6, 0));
  g.add(m(new THREE.CylinderGeometry(0.08, 0.1, 0.32, 6), ivoire, 0, 1.15, 0));
  g.add(ellipsoide(0.12, 0.08, 0.12, ivoire, 0, 1.33, 0, 1));
  g.add(m(new THREE.CylinderGeometry(0.02, 0.02, 0.56, 5), laiton(), 0, 0.28, 0));
  g.add(m(new THREE.CylinderGeometry(0.28, 0.32, 0.06, 8), laiton(), 0, 0.03, 0));
  return g;
}

function pain() {
  const g = new THREE.Group();
  g.add(m(new THREE.BoxGeometry(1.2, 0.08, 0.7), mat(0x7a4a28), 0, 0.04, 0));
  g.add(ellipsoide(0.5, 0.3, 0.33, mat(0xc98a3e, { shininess: 25 }), 0, 0.33, 0));
  for (const x of [-0.22, 0, 0.22]) {
    const e = m(new THREE.BoxGeometry(0.05, 0.04, 0.4), mat(0xefd39a), x, 0.6, 0);
    e.rotation.y = 0.5;
    g.add(e);
  }
  const flammes = [[0x8f1d10, 0.2, 0.62], [0xe0561b, 0.15, 0.5], [0xf6b23c, 0.09, 0.34]];
  for (const [c, r, hh] of flammes) {
    const f = m(new THREE.ConeGeometry(r, hh, 5), new THREE.MeshBasicMaterial({ color: c }), -0.48, 0.3 + hh / 2, -0.15);
    g.add(f);
  }
  return g;
}

function colonne() {
  const g = new THREE.Group();
  const marbre = mat(0xece6da, { shininess: 30 });
  g.add(m(new THREE.BoxGeometry(0.9, 0.14, 0.9), marbre, 0, 0.07, 0));
  g.add(m(new THREE.CylinderGeometry(0.38, 0.4, 0.1, 12), marbre, 0, 0.19, 0));
  const fut = m(new THREE.CylinderGeometry(0.28, 0.32, 1.25, 12), marbre, 0, 0.86, 0);
  g.add(fut);
  const chap = m(new THREE.CylinderGeometry(0.42, 0.3, 0.14, 12), marbre, 0.02, 1.56, 0);
  chap.rotation.z = 0.18;
  g.add(chap);
  const bloc = m(new THREE.BoxGeometry(0.4, 0.22, 0.4), mat(0xd8d0c0), 0.5, 0.25, 0.3);
  bloc.rotation.set(0.2, 0.6, 0.3);
  g.add(bloc);
  return g;
}

function boulefeu() {
  const g = new THREE.Group();
  const feu = new THREE.MeshBasicMaterial({ color: 0xff6a1f });
  const geo = bosseler(new THREE.IcosahedronGeometry(0.6, 1), (n) => 0.06 * Math.sin(7 * n.x + 5 * n.z) + 0.05 * Math.sin(9 * n.y));
  g.add(m(geo, feu, 0, 1.22, 0));
  g.add(m(new THREE.IcosahedronGeometry(0.5, 1), new THREE.MeshBasicMaterial({ color: 0xffd36b }), 0.05, 1.28, 0.1));
  for (const [x, z] of [[-0.35, 0.1], [0.1, 0.3], [0.32, -0.12], [-0.1, -0.3]]) {
    const pointe = m(new THREE.ConeGeometry(0.06, 0.45, 5), new THREE.MeshBasicMaterial({ color: 0xffb04a }), x, 0.6, z);
    pointe.rotation.x = PI;
    g.add(pointe);
    g.add(m(new THREE.CylinderGeometry(0.008, 0.008, 0.38, 3), mat(0x222222), x * 1.4, 0.19, z * 1.4));
  }
  g.add(m(new THREE.CylinderGeometry(0.9, 0.95, 0.04, 10), mat(0xc9b48a), 0, 0.02, 0));
  return g;
}

function texDroste() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 384;
  const x = c.getContext("2d");
  let w = 256, hh = 384, ox = 0, oy = 0;
  const couleurs = ["#b8262f", "#f3e8d0"];
  for (let i = 0; i < 7; i++) {
    x.fillStyle = couleurs[i % 2];
    x.fillRect(ox, oy, w, hh);
    const nw = w * 0.56, nh = hh * 0.56;
    ox += w * 0.3;
    oy += hh * 0.36;
    w = nw;
    hh = nh;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function boite() {
  const g = new THREE.Group();
  const face = new THREE.MeshPhongMaterial({ map: texDroste(), shininess: 40, specular: 0x333333 });
  const cote = mat(0xb8262f, { shininess: 40 });
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.42), [cote, cote, mat(0xc9952f), cote, face, cote]);
  b.position.y = 0.6;
  b.rotation.y = -0.15;
  g.add(b);
  return g;
}

function chrono() {
  const g = new THREE.Group();
  const corps = new THREE.Group();
  corps.add(m(new THREE.CylinderGeometry(0.62, 0.62, 0.16, 16), laiton()));
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  x.fillStyle = "#f6f0e1";
  x.beginPath();
  x.arc(128, 128, 128, 0, 7);
  x.fill();
  x.strokeStyle = "#252a2c";
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * PI * 2, r1 = i % 5 ? 112 : 96;
    x.lineWidth = i % 5 ? 2 : 5;
    x.beginPath();
    x.moveTo(128 + Math.cos(a) * r1, 128 + Math.sin(a) * r1);
    x.lineTo(128 + Math.cos(a) * 122, 128 + Math.sin(a) * 122);
    x.stroke();
  }
  x.strokeStyle = "#a8204f";
  x.lineWidth = 6;
  x.beginPath();
  x.moveTo(128, 128);
  x.lineTo(128 + 90 * Math.cos(-1.2), 128 + 90 * Math.sin(-1.2));
  x.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const cadran = m(new THREE.CircleGeometry(0.55, 24), new THREE.MeshPhongMaterial({ map: t }), 0, 0.085, 0);
  cadran.rotation.x = -PI / 2;
  corps.add(cadran);
  corps.add(tourne(m(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 8), laiton(), 0, 0, -0.7), "x", PI / 2));
  corps.add(tourne(m(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), laiton(), 0, 0, -0.84), "x", PI / 2));
  corps.rotation.x = PI / 2 - 0.25;
  corps.position.y = 0.9;
  g.add(corps);
  g.add(m(new THREE.BoxGeometry(0.5, 0.25, 0.3), mat(0x5a321e), 0, 0.12, 0));
  return g;
}

function ballon(variante) {
  const g = new THREE.Group();
  const r = 0.55;
  g.add(m(new THREE.IcosahedronGeometry(r, 1), mat(0xf4f0e6, { shininess: 30 }), 0, 0.62, 0));
  const ico = new THREE.IcosahedronGeometry(1, 0);
  const p = ico.attributes.position;
  const vus = [];
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    if (vus.some((u) => u.distanceTo(v) < 0.01)) continue;
    vus.push(v.clone());
    const pent = m(new THREE.CircleGeometry(0.17, 5), variante === "or" ? laiton() : mat(0x1d1d1d, { side: THREE.DoubleSide }));
    pent.material.side = THREE.DoubleSide;
    pent.position.copy(v).multiplyScalar(r * 0.97).add(new THREE.Vector3(0, 0.62, 0));
    pent.lookAt(v.clone().multiplyScalar(5).add(new THREE.Vector3(0, 0.62, 0)));
    g.add(pent);
  }
  g.add(tourne(m(new THREE.TorusGeometry(0.28, 0.04, 5, 12), laiton(), 0, 0.06, 0), "x", PI / 2));
  return g;
}

function balle() {
  const g = new THREE.Group();
  g.add(m(new THREE.IcosahedronGeometry(0.5, 2), mat(0xf3eee2, { shininess: 25 }), 0, 0.6, 0));
  const pts = [];
  for (let i = 0; i < 64; i++) {
    const t = (i / 64) * PI * 2;
    const v = new THREE.Vector3(Math.cos(t) + 0.45 * Math.cos(3 * t), Math.sin(t) - 0.45 * Math.sin(3 * t), 1.15 * Math.sin(2 * t));
    pts.push(v.normalize().multiplyScalar(0.515));
  }
  const couture = m(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 96, 0.022, 4, true), mat(0xc0282f), 0, 0.6, 0);
  couture.rotation.set(0.5, 0.3, 0);
  g.add(couture);
  g.add(tourne(m(new THREE.TorusGeometry(0.25, 0.04, 5, 12), laiton(), 0, 0.06, 0), "x", PI / 2));
  return g;
}

function bobine(variante) {
  const g = new THREE.Group();
  const metal = mat(0x9aa3a8, { shininess: 70, specular: 0x888888 });
  const r = new THREE.Group();
  for (const y of [0.075, -0.075]) r.add(tourne(m(new THREE.TorusGeometry(0.62, 0.045, 5, 24), metal, 0, y, 0), "x", PI / 2));
  r.add(m(new THREE.CylinderGeometry(0.16, 0.16, 0.2, 10), metal, 0, 0, 0));
  r.add(m(new THREE.CylinderGeometry(0.5, 0.5, 0.11, 18), mat(0x2a2422), 0, 0, 0));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * PI * 2;
    r.add(m(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 8), mat(variante === "rose" ? 0xe58fb0 : 0x0f4d50), Math.cos(a) * 0.38, 0, Math.sin(a) * 0.38));
  }
  r.rotation.x = PI / 2;
  r.position.y = 0.95;
  g.add(r);
  const film = m(new THREE.BoxGeometry(0.16, 0.9, 0.012), mat(0x3a2f2a), 0.55, 0.5, 0.05);
  film.rotation.z = 0.15;
  g.add(film);
  g.add(m(new THREE.BoxGeometry(0.7, 0.1, 0.36), laiton(), 0, 0.05, 0));
  g.add(m(new THREE.BoxGeometry(0.08, 0.4, 0.08), laiton(), 0, 0.3, 0));
  return g;
}

function vhs(variante) {
  const g = new THREE.Group();
  const k7 = new THREE.Group();
  k7.add(m(new THREE.BoxGeometry(1.0, 0.6, 0.13), mat(0x1c1c1e, { shininess: 50, specular: 0x444444 })));
  k7.add(m(new THREE.BoxGeometry(0.62, 0.24, 0.02), mat(0x55595c, { transparent: true, opacity: 0.85 }), 0, 0.04, 0.07));
  for (const x of [-0.18, 0.18]) k7.add(tourne(m(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 10), mat(0xeeeeee), x, 0.04, 0.08), "x", PI / 2));
  k7.add(m(new THREE.BoxGeometry(0.7, 0.14, 0.02), mat(0xf3e8d0), 0, -0.18, 0.07));
  k7.rotation.x = -0.3;
  k7.position.set(0, 0.42, 0.12);
  g.add(k7);
  const etui = m(new THREE.BoxGeometry(1.05, 0.68, 0.22), mat(variante === "bleu" ? 0x2c4f8e : 0xa8204f), 0, 0.5, -0.22);
  etui.rotation.x = -0.12;
  g.add(etui);
  return g;
}

function micro(variante) {
  const g = new THREE.Group();
  if (variante === "cam") {
    g.add(m(new THREE.BoxGeometry(0.7, 0.45, 0.4), mat(0xd8d2c4, { shininess: 50 }), 0, 1.0, 0));
    g.add(tourne(m(new THREE.CylinderGeometry(0.16, 0.18, 0.2, 12), mat(0x111111), 0, 1.0, 0.28), "x", PI / 2));
    g.add(tourne(m(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 12), mat(0x5bc2b6), 0, 1.0, 0.39), "x", PI / 2));
    g.add(m(new THREE.SphereGeometry(0.04, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff3b3b }), 0.26, 1.15, 0.2));
  } else {
    g.add(m(new THREE.IcosahedronGeometry(0.22, 1), mat(0x9aa3a8, { shininess: 80, specular: 0x999999 }), 0, 1.45, 0));
    g.add(m(new THREE.CylinderGeometry(0.11, 0.08, 0.5, 8), mat(0x2d3134), 0, 1.12, 0));
  }
  g.add(m(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 6), mat(0x2d3134), 0, 0.45, 0));
  g.add(m(new THREE.CylinderGeometry(0.34, 0.38, 0.06, 10), mat(0x2d3134), 0, 0.03, 0));
  return g;
}

function manette(variante) {
  const couleurs = { noir: 0x2a2d30, acier: 0x8b939a, roux: 0xc0662b };
  const g = new THREE.Group();
  const c = new THREE.Group();
  const coque = mat(couleurs[variante] || 0x2a2d30, { shininess: 45, specular: 0x333333 });
  c.add(m(new THREE.BoxGeometry(0.9, 0.18, 0.42), coque));
  for (const x of [-0.42, 0.42]) {
    const poignee = ellipsoide(0.2, 0.12, 0.3, coque, x, -0.02, 0.18);
    c.add(poignee);
  }
  c.add(m(new THREE.BoxGeometry(0.22, 0.05, 0.07), mat(0x111111), -0.3, 0.1, -0.02));
  c.add(m(new THREE.BoxGeometry(0.07, 0.05, 0.22), mat(0x111111), -0.3, 0.1, -0.02));
  const boutons = [[0.3, -0.1, 0x5bc2b6], [0.3, 0.06, 0xe9c062], [0.22, -0.02, 0xc8336a], [0.38, -0.02, 0x7fb25a]];
  for (const [x, z, col] of boutons) c.add(m(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 8), mat(col), x, 0.11, z));
  for (const x of [-0.12, 0.12]) c.add(m(new THREE.CylinderGeometry(0.05, 0.06, 0.07, 8), mat(0x111111), x, 0.12, 0.1));
  c.rotation.x = 0.85;
  c.position.y = 0.75;
  g.add(c);
  g.add(m(new THREE.BoxGeometry(0.5, 0.36, 0.26), mat(0x5a321e), 0, 0.18, -0.06));
  return g;
}

function vinyle(variante) {
  const couleurs = { bleu: 0x2c5f9e, or: 0xc9952f, rouge: 0xb3262e, rose: 0xe58fb0, vert: 0x3f8a5a };
  const g = new THREE.Group();
  const poch = m(new THREE.BoxGeometry(1.1, 1.1, 0.04), mat(couleurs[variante] || 0x2c5f9e), -0.12, 0.62, -0.1);
  poch.rotation.z = 0.04;
  g.add(poch);
  const disque = new THREE.Group();
  disque.add(m(new THREE.CylinderGeometry(0.5, 0.5, 0.025, 24), mat(0x141414, { shininess: 90, specular: 0x555555 })));
  disque.add(m(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 16), mat(0xf3e8d0)));
  disque.rotation.x = PI / 2;
  disque.position.set(0.26, 0.6, 0.0);
  g.add(disque);
  g.add(m(new THREE.BoxGeometry(1.2, 0.08, 0.34), mat(0x5a321e), 0, 0.04, -0.02));
  return g;
}

function texTableau(variante) {
  const c = document.createElement("canvas");
  c.width = 320;
  c.height = 240;
  const x = c.getContext("2d");
  if (variante === "beksinski") {
    const ciel = x.createLinearGradient(0, 0, 0, 240);
    ciel.addColorStop(0, "#5a2c16");
    ciel.addColorStop(0.55, "#c47a2c");
    ciel.addColorStop(1, "#e9c27a");
    x.fillStyle = ciel;
    x.fillRect(0, 0, 320, 240);
    x.fillStyle = "#3b1d10";
    for (const [cx, w, hh] of [[40, 26, 120], [78, 18, 90], [236, 30, 140], [282, 20, 100], [140, 14, 70]]) {
      x.fillRect(cx - w / 2, 200 - hh, w, hh);
      x.fillRect(cx - w / 2 - 4, 200 - hh, w + 8, 6);
    }
    x.fillStyle = "#8a4a1f";
    x.fillRect(0, 196, 320, 44);
    x.strokeStyle = "#eadfc8";
    x.lineWidth = 5;
    x.lineCap = "round";
    x.beginPath();
    x.moveTo(150, 204);
    x.lineTo(166, 168);
    x.lineTo(190, 164);
    x.lineTo(206, 204);
    x.moveTo(166, 168);
    x.lineTo(156, 140);
    x.moveTo(190, 164);
    x.lineTo(198, 186);
    x.stroke();
    x.fillStyle = "#eadfc8";
    x.beginPath();
    x.arc(154, 134, 9, 0, 7);
    x.fill();
  } else if (variante === "ile") {
    const ciel = x.createLinearGradient(0, 0, 0, 240);
    ciel.addColorStop(0, "#2b3036");
    ciel.addColorStop(1, "#5d6466");
    x.fillStyle = ciel;
    x.fillRect(0, 0, 320, 240);
    x.fillStyle = "#1d2a2e";
    x.fillRect(0, 180, 320, 60);
    x.fillStyle = "#b9a17a";
    x.beginPath();
    x.moveTo(70, 182);
    x.lineTo(90, 110);
    x.lineTo(130, 96);
    x.lineTo(150, 182);
    x.moveTo(180, 182);
    x.lineTo(196, 100);
    x.lineTo(240, 112);
    x.lineTo(256, 182);
    x.fill();
    x.fillStyle = "#121a16";
    for (const [cx, hh] of [[150, 120], [160, 140], [170, 130], [178, 112]]) {
      x.beginPath();
      x.ellipse(cx, 182 - hh / 2, 8, hh / 2, 0, 0, 7);
      x.fill();
    }
    x.fillStyle = "#f3efe6";
    x.fillRect(156, 196, 6, 12);
  } else {
    x.fillStyle = "#93b07a";
    x.fillRect(0, 0, 320, 240);
    x.fillStyle = "#c8d9e6";
    x.fillRect(0, 0, 320, 60);
    const formes = [["#e8a8b4", 60, 120, 26], ["#f2e6cf", 140, 150, 18], ["#d8364b", 230, 110, 22], ["#5b8fb0", 270, 170, 16], ["#f2e6cf", 100, 190, 14], ["#e8a8b4", 190, 190, 20]];
    for (const [col, cx, cy, r] of formes) {
      x.fillStyle = col;
      x.beginPath();
      x.arc(cx, cy, r, 0, 7);
      x.fill();
    }
    x.fillStyle = "#7d5a8c";
    x.beginPath();
    x.moveTo(150, 60);
    x.lineTo(170, 20);
    x.lineTo(190, 60);
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function tableau(variante) {
  const g = new THREE.Group();
  const bois = mat(0x6b3d22);
  for (const [x, z, rz] of [[-0.42, 0.18, 0.12], [0.42, 0.18, -0.12]]) {
    const pied = m(new THREE.BoxGeometry(0.06, 1.7, 0.06), bois, x, 0.82, z);
    pied.rotation.z = rz;
    g.add(pied);
  }
  const arriere = m(new THREE.BoxGeometry(0.06, 1.6, 0.06), bois, 0, 0.78, -0.3);
  arriere.rotation.x = -0.3;
  g.add(arriere);
  g.add(m(new THREE.BoxGeometry(1.1, 0.06, 0.16), bois, 0, 0.62, 0.2));
  const cadre = new THREE.Group();
  const dore = laiton();
  cadre.add(m(new THREE.BoxGeometry(1.2, 0.1, 0.07), dore, 0, 0.45, 0));
  cadre.add(m(new THREE.BoxGeometry(1.2, 0.1, 0.07), dore, 0, -0.45, 0));
  cadre.add(m(new THREE.BoxGeometry(0.1, 0.9, 0.07), dore, -0.55, 0, 0));
  cadre.add(m(new THREE.BoxGeometry(0.1, 0.9, 0.07), dore, 0.55, 0, 0));
  cadre.add(m(new THREE.PlaneGeometry(1.02, 0.8), new THREE.MeshPhongMaterial({ map: texTableau(variante), shininess: 10 }), 0, 0, 0.01));
  cadre.position.set(0, 1.12, 0.17);
  cadre.rotation.x = -0.12;
  g.add(cadre);
  return g;
}

function statue() {
  const g = new THREE.Group();
  const bronze = mat(0x8a6a48, { shininess: 45, specular: 0x554433 });
  g.add(m(new THREE.BoxGeometry(0.7, 0.42, 0.7), mat(0xbfb6a6), 0, 0.21, 0));
  g.add(m(new THREE.CylinderGeometry(0.16, 0.34, 1.0, 7), bronze, 0, 0.92, 0));
  g.add(m(new THREE.CylinderGeometry(0.2, 0.18, 0.3, 7), bronze, 0, 1.52, 0));
  g.add(ellipsoide(0.12, 0.14, 0.12, bronze, 0, 1.8, 0, 1));
  const chale = m(new THREE.BoxGeometry(0.46, 0.5, 0.06), bronze, 0.04, 1.45, 0.17);
  chale.rotation.z = -0.35;
  g.add(chale);
  for (const x of [-0.24, 0.24]) {
    const bras = m(new THREE.CylinderGeometry(0.05, 0.06, 0.6, 5), bronze, x, 1.28, 0);
    bras.rotation.z = x > 0 ? -0.08 : 0.08;
    g.add(bras);
  }
  return g;
}

function livre(variante) {
  const couleurs = { vert: 0x2f6b4f, rouge: 0xa8204f, bleu: 0x2c4f8e, violet: 0x5d3a7a, noir: 0x26292c, ocre: 0xb8862b, gris: 0x55595c, rouge2: 0x8a2a1e };
  const g = new THREE.Group();
  const couv = mat(couleurs[variante] || 0x2f6b4f, { shininess: 25 });
  const pages = mat(0xf3e8d0);
  const lire = (y, rot, c) => {
    const l = new THREE.Group();
    l.add(m(new THREE.BoxGeometry(1.0, 0.2, 0.72), c));
    l.add(m(new THREE.BoxGeometry(0.94, 0.16, 0.68), pages, 0.04, 0, 0));
    l.position.y = y;
    l.rotation.y = rot;
    return l;
  };
  g.add(lire(0.1, 0.2, mat(0x6b3d22)));
  g.add(lire(0.3, -0.15, couv));
  const ouvert = new THREE.Group();
  for (const s of [-1, 1]) {
    const page = m(new THREE.BoxGeometry(0.42, 0.03, 0.56), pages, s * 0.22, 0, 0);
    page.rotation.z = -s * 0.18;
    ouvert.add(page);
  }
  ouvert.position.y = 0.46;
  ouvert.rotation.y = 0.3;
  g.add(ouvert);
  g.add(m(new THREE.BoxGeometry(0.02, 0.32, 0.02), mat(0xa8204f), 0.06, 0.6, 0.18));
  g.scale.setScalar(1.15);
  return g;
}

function fromage() {
  const g = new THREE.Group();
  g.add(m(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 12), mat(0x9a6236), 0, 0.04, 0));
  const f = m(new THREE.CylinderGeometry(0.3, 0.33, 0.5, 12), mat(0xf0e8d6, { shininess: 12 }), -0.08, 0.33, 0);
  g.add(f);
  const part = m(new THREE.CylinderGeometry(0.3, 0.33, 0.5, 12, 1, false, 0, PI / 3), mat(0xf6f0e1), 0.32, 0.33, 0.12);
  g.add(part);
  g.add(m(new THREE.BoxGeometry(0.5, 0.03, 0.08), mat(0x9aa3a8, { shininess: 80 }), 0.2, 0.1, 0.42));
  return g;
}

function casque() {
  const g = new THREE.Group();
  g.add(m(new THREE.IcosahedronGeometry(0.55, 2), mat(0xeeeae2, { shininess: 50 }), 0, 0.85, 0));
  const visiere = m(new THREE.SphereGeometry(0.5, 14, 8, -PI / 2.6, PI / 1.3, PI / 3.6, PI / 2.6), mat(0xd9a035, { shininess: 120, specular: 0xffffff, side: THREE.DoubleSide }), 0, 0.85, 0.08);
  g.add(visiere);
  g.add(m(new THREE.CylinderGeometry(0.42, 0.46, 0.22, 12), mat(0x9aa3a8), 0, 0.28, 0));
  g.add(m(new THREE.BoxGeometry(0.12, 0.08, 0.04), new THREE.MeshBasicMaterial({ color: 0xc8336a }), 0.32, 0.95, 0.38));
  return g;
}

function bouclier() {
  const g = new THREE.Group();
  const forme = new THREE.Shape();
  forme.moveTo(0, -0.95);
  forme.quadraticCurveTo(0.42, -0.35, 0.44, 0.38);
  forme.quadraticCurveTo(0.42, 0.62, 0, 0.66);
  forme.quadraticCurveTo(-0.42, 0.62, -0.44, 0.38);
  forme.quadraticCurveTo(-0.42, -0.35, 0, -0.95);
  const geo = new THREE.ExtrudeGeometry(forme, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1, curveSegments: 6 });
  geo.center();
  const b = new THREE.Group();
  b.add(m(geo, mat(0xa8204f, { shininess: 20 })));
  const croix = mat(0xe9c062, { shininess: 60 });
  b.add(m(new THREE.BoxGeometry(0.1, 1.2, 0.04), croix, 0, -0.02, 0.07));
  b.add(m(new THREE.BoxGeometry(0.66, 0.1, 0.04), croix, 0, 0.3, 0.07));
  b.add(tourne(m(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 8), laiton(), 0, 0.3, 0.1), "x", PI / 2));
  b.rotation.x = -0.18;
  b.position.y = 1.0;
  g.add(b);
  g.add(m(new THREE.BoxGeometry(0.62, 0.12, 0.34), mat(0x5a321e), 0, 0.06, -0.08));
  return g;
}

const FABRIQUES = {
  cerveau, pyramide, dent, hanafuda, eiffel, drap, caisse,
  nid, hibou, ours, arbre, cachalot, os, pain, colonne, boulefeu, boite, chrono,
  ballon, balle, bobine, vhs, micro, manette, vinyle, tableau, statue, livre, fromage, casque, bouclier,
};

export function construire(id) {
  const [type, variante] = String(id).split(":");
  const f = FABRIQUES[type];
  return f ? f(variante) : drap();
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
