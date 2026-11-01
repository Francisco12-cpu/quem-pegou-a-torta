// decoracao.js — o que enfeita o mundo aberto: caminhos, árvores, morros, nuvens e a fonte.
// Tudo gerado por código a partir de dados/mundo3d.js.

import * as THREE from "../vendor/three.min.js";
import { Folha, sorteador } from "./papel.js";

// distância de (x, z) até o segmento a-b
function distanciaAoSegmento(x, z, a, b) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(x - (a[0] + dx * t), z - (a[1] + dz * t));
}

export function pertoDeCaminho(x, z, caminhos, folga) {
  return caminhos.lista.some((linha) =>
    linha.some((p, i) => i > 0 && distanciaAoSegmento(x, z, linha[i - 1], p) < caminhos.largura / 2 + folga)
  );
}

// tiras de cartolina com um círculo em cada curva
export function criarCaminhos(c) {
  const f = new Folha();
  const material = f.material(c.cor, 1, true);
  const grupo = new THREE.Group();
  const circulo = new THREE.CircleGeometry(c.largura / 2, 24);

  c.lista.forEach((linha) => {
    linha.forEach((p, i) => {
      const junta = new THREE.Mesh(circulo, material);
      junta.rotation.x = -Math.PI / 2;
      junta.position.set(p[0], 0.02, p[1]);
      grupo.add(junta);
      if (i === 0) return;
      const a = linha[i - 1];
      const comprimento = Math.hypot(p[0] - a[0], p[1] - a[1]);
      const tira = new THREE.Mesh(new THREE.PlaneGeometry(c.largura, comprimento), material);
      tira.rotation.order = "YXZ";
      tira.rotation.set(-Math.PI / 2, Math.atan2(p[0] - a[0], p[1] - a[1]), 0);
      tira.position.set((p[0] + a[0]) / 2, 0.02, (p[1] + a[1]) / 2);
      grupo.add(tira);
    });
  });
  return grupo;
}

// árvore de papel: dois recortes iguais cruzados, pra ter volume de qualquer ângulo
function texturaArvore() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 320;
  const g = canvas.getContext("2d");
  g.fillStyle = "#8f6134";
  g.fillRect(112, 190, 32, 130);

  const bolas = [
    [128, 110, 96, "#5da84c"],
    [72, 140, 58, "#5da84c"],
    [186, 140, 58, "#5da84c"],
    [120, 92, 66, "#6fbf5a"],
    [168, 122, 44, "#6fbf5a"],
    [106, 72, 34, "#86d06c"],
  ];
  // contorno: as mesmas bolas um pouco maiores, atrás
  g.fillStyle = "#3f7a38";
  bolas.slice(0, 3).forEach(([x, y, r]) => {
    g.beginPath();
    g.arc(x, y, r + 5, 0, Math.PI * 2);
    g.fill();
  });
  bolas.forEach(([x, y, r, cor]) => {
    g.fillStyle = cor;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  });

  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 4;
  return textura;
}

// Árvore entre a câmera e a pônei não pode tapar a tela: perto da câmera ela se dissolve em
// pontinhos (no material, sem precisar ordenar nada, leve no celular).
function dissolverPertoDaCamera(material, cfg) {
  material.onBeforeCompile = (shader) => {
    const declarar = `#include <common>
varying float vDistanciaCamera;`;
    shader.vertexShader = shader.vertexShader.replace("#include <common>", declarar).replace(
      "#include <project_vertex>",
      `#include <project_vertex>
vDistanciaCamera = -mvPosition.z;`
    );
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", declarar).replace(
        "#include <alphatest_fragment>",
        `#include <alphatest_fragment>
        float cheio = smoothstep(${cfg.dissolvePerto.toFixed(1)}, ${cfg.dissolveLonge.toFixed(1)}, vDistanciaCamera);
        float ruido = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
        if (cheio < ruido) discard;`
      );
  };
}

// lista: [{ x, z, escala }]
export function criarArvores(lista, cfg) {
  const material = new THREE.MeshBasicMaterial({ map: texturaArvore(), alphaTest: 0.5, side: THREE.DoubleSide });
  dissolverPertoDaCamera(material, cfg);
  const geometria = new THREE.PlaneGeometry(5, 6.25);
  geometria.translate(0, 3.125, 0);

  const malha = new THREE.InstancedMesh(geometria, material, lista.length * 2);
  const m = new THREE.Matrix4();
  const giro = new THREE.Quaternion();
  const eixo = new THREE.Vector3(0, 1, 0);
  const pos = new THREE.Vector3();
  const escala = new THREE.Vector3();
  lista.forEach((a, i) => {
    pos.set(a.x, 0, a.z);
    escala.setScalar(a.escala);
    [0.45, 0.45 + Math.PI / 2].forEach((angulo, n) => {
      giro.setFromAxisAngle(eixo, angulo);
      malha.setMatrixAt(i * 2 + n, m.compose(pos, giro, escala));
    });
  });
  malha.frustumCulled = false;
  return malha;
}

// sorteia árvores em lugares livres, mais um anel fechando a borda do mapa
export function sortearArvores(dados, livre) {
  const cfg = dados.arvores;
  const r = sorteador(cfg.semente);
  const metade = dados.tamanho / 2;
  const lista = [];
  for (let i = 0; i < cfg.quantidade * 6 && lista.length < cfg.quantidade; i++) {
    const x = (r() * 2 - 1) * (metade - 4);
    const z = (r() * 2 - 1) * (metade - 4);
    if (livre(x, z, cfg.folga)) lista.push({ x, z, escala: 0.9 + r() * 0.5 });
  }
  const borda = metade + 3;
  for (let p = -borda; p < borda; p += cfg.passoBorda) {
    const variacao = () => (r() - 0.5) * 3;
    [
      [p, -borda],
      [p, borda],
      [-borda, p],
      [borda, p],
    ].forEach(([x, z]) => lista.push({ x: x + variacao(), z: z + variacao(), escala: 1.1 + r() * 0.5 }));
  }
  return lista;
}

function recorteMorro(cor) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const g = canvas.getContext("2d");
  g.fillStyle = cor;
  g.beginPath();
  g.moveTo(0, 128);
  g.bezierCurveTo(90, -60, 420, -60, 512, 128);
  g.fill();
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

// morros bem longe, no horizonte, fechando a paisagem
export function criarMorros(cfg) {
  const grupo = new THREE.Group();
  const r = sorteador(5);
  cfg.cores.forEach((cor, camada) => {
    const material = new THREE.MeshBasicMaterial({ map: recorteMorro(cor), alphaTest: 0.5, fog: false });
    const raio = cfg.raio + camada * 16;
    for (let i = 0; i < cfg.quantidade; i++) {
      const a = (i / cfg.quantidade) * Math.PI * 2 + camada * 0.3;
      const largura = 75 + r() * 45;
      const altura = 14 + r() * 12 + camada * 5;
      const morro = new THREE.Mesh(new THREE.PlaneGeometry(largura, altura), material);
      morro.position.set(Math.cos(a) * raio, altura / 2 - 1, Math.sin(a) * raio);
      morro.lookAt(0, altura / 2, 0);
      grupo.add(morro);
    }
  });
  return grupo;
}

function texturaNuvem() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const g = canvas.getContext("2d");
  const bolas = [
    [70, 84, 42],
    [128, 66, 56],
    [188, 86, 40],
    [100, 92, 34],
    [156, 94, 34],
  ];
  [
    ["#d6e8f5", 5],
    ["#ffffff", 0],
  ].forEach(([cor, sobra]) => {
    g.fillStyle = cor;
    bolas.forEach(([x, y, r]) => {
      g.beginPath();
      g.arc(x, y + (sobra ? 3 : 0), r + sobra, 0, Math.PI * 2);
      g.fill();
    });
  });
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

// devolve as malhas: o motor empurra cada uma devagar a cada quadro
export function criarNuvens(cfg, cena, tamanho) {
  const r = sorteador(9);
  const material = new THREE.MeshBasicMaterial({ map: texturaNuvem(), alphaTest: 0.5, side: THREE.DoubleSide, fog: false });
  const nuvens = [];
  for (let i = 0; i < cfg.quantidade; i++) {
    const escala = 10 + r() * 12;
    const nuvem = new THREE.Mesh(new THREE.PlaneGeometry(escala, escala / 2), material);
    nuvem.position.set((r() - 0.5) * tamanho * 1.6, cfg.altura + r() * 12, -35 - r() * tamanho * 0.7);
    nuvem.userData.velocidade = 0.5 + r() * 0.9;
    cena.add(nuvem);
    nuvens.push(nuvem);
  }
  return nuvens;
}

// a fonte no meio da praça
export function criarFonte(fonte) {
  const f = new Folha();
  const grupo = new THREE.Group();
  grupo.add(
    f.cilindro(fonte.raio, fonte.raio + 0.2, 0.8, "#d8c39c", 0, 0.4, 0),
    f.cilindro(fonte.raio - 0.3, fonte.raio - 0.3, 0.1, "#8fd8f2", 0, 0.82, 0),
    f.cilindro(0.4, 0.55, 2, "#efe2c6", 0, 1.6, 0),
    f.cilindro(1.1, 0.5, 0.35, "#d8c39c", 0, 2.7, 0),
    f.cilindro(0.85, 0.85, 0.05, "#8fd8f2", 0, 2.88, 0),
    f.esfera(0.32, "#ffb7d9", 0, 3.25, 0)
  );
  grupo.position.set(fonte.x, 0, fonte.z);
  return grupo;
}
