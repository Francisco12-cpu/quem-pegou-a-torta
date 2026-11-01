// festa-efeitos.js — a festa dos créditos: balões caindo, globo girando e fachos de luz colorida.

import * as THREE from "../vendor/three.min.js";

const CORES_BALAO = ["#ff6fb0", "#ffd479", "#8fc7ff", "#c8a2f0", "#8fd8c8", "#ff9ccd"];
const CORES_LUZ = ["#ff6fb0", "#ffd479", "#8fc7ff", "#8fd8c8"];
const ALTURA_TOPO = 9;

function chuvaDeBaloes(cena, sala, quantidade) {
  const geometria = new THREE.SphereGeometry(0.42, 10, 8);
  geometria.scale(1, 1.2, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const malha = new THREE.InstancedMesh(geometria, material, quantidade);
  malha.frustumCulled = false;

  const cor = new THREE.Color();
  const baloes = [];
  for (let i = 0; i < quantidade; i++) {
    baloes.push({
      x: (Math.random() - 0.5) * sala.largura,
      y: Math.random() * ALTURA_TOPO,
      z: sala.fundoZ + 1 + Math.random() * 9,
      velocidade: 0.8 + Math.random() * 1.1,
      fase: Math.random() * 6,
    });
    malha.setColorAt(i, cor.set(CORES_BALAO[i % CORES_BALAO.length]));
  }
  cena.add(malha);

  const m = new THREE.Matrix4();
  return function atualizar(dt, t) {
    baloes.forEach((b, i) => {
      b.y -= b.velocidade * dt;
      if (b.y < 0.3) b.y = ALTURA_TOPO;
      m.makeTranslation(b.x + Math.sin(t * 1.4 + b.fase) * 0.5, b.y, b.z);
      malha.setMatrixAt(i, m);
    });
    malha.instanceMatrix.needsUpdate = true;
  };
}

function fachosDeLuz(cena, sala) {
  const geometria = new THREE.CylinderGeometry(0.15, 2.4, 9, 16, 1, true);
  geometria.translate(0, -4.5, 0); // gira a partir do teto
  const fachos = CORES_LUZ.map((cor, i) => {
    const material = new THREE.MeshBasicMaterial({
      color: cor,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const facho = new THREE.Mesh(geometria, material);
    facho.position.set(-7.5 + i * 5, sala.altura + 0.5, sala.fundoZ + 5);
    cena.add(facho);
    return facho;
  });

  const globo = new THREE.Group();
  const bola = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), new THREE.MeshBasicMaterial({ color: "#e6f4ff" }));
  const arame = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 1), new THREE.MeshBasicMaterial({ color: "#8fa8d8", wireframe: true }));
  globo.add(bola, arame);
  globo.position.set(0, 6.2, sala.fundoZ + 5);
  cena.add(globo);

  return function atualizar(dt, t) {
    fachos.forEach((f, i) => {
      f.rotation.z = Math.sin(t * 1.3 + i * 1.6) * 0.5;
      f.rotation.x = Math.cos(t * 1.1 + i) * 0.28;
    });
    globo.rotation.y = t * 1.5;
  };
}

// devolve { atualizar(dt, t), remover() }; só existe enquanto os créditos passam
export function criarEfeitosDaFesta(cena, sala) {
  const antes = cena.children.length;
  const chuva = chuvaDeBaloes(cena, sala, 46);
  const luzes = fachosDeLuz(cena, sala);
  const novos = cena.children.slice(antes);
  return {
    atualizar(dt, t) {
      chuva(dt, t);
      luzes(dt, t);
    },
    remover() {
      novos.forEach((o) => cena.remove(o));
    },
  };
}
