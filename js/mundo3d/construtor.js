// construtor.js — monta o cenário a partir de dados/mundo3d.js, todo gerado por código.

import * as THREE from "../vendor/three.min.js";
import { criarCasa } from "./casas-papel.js";
import { dentroDaCaixa } from "./colisao.js";

const FOLGA_FLORES = 1.8; // nenhum tufo nasce colado na casa nem na frente da porta

// números "aleatórios" sempre iguais, pro mundo não mudar a cada visita
function sorteador(semente) {
  let s = semente >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// papel de grama: retalhos recortados de tons próximos, com fibras finas por cima
function texturaChao(cfg) {
  const lado = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = lado;
  const g = canvas.getContext("2d");
  const r = sorteador(3);
  g.fillStyle = cfg.cor;
  g.fillRect(0, 0, lado, lado);

  // cada retalho é desenhado também nos lados opostos, pra emenda não aparecer
  function retalho(cx, cy, raio, cor) {
    const pontas = 6 + Math.floor(r() * 4);
    const raios = [];
    for (let i = 0; i < pontas; i++) raios.push(raio * (0.65 + r() * 0.5));
    g.fillStyle = cor;
    for (let dx = -lado; dx <= lado; dx += lado) {
      for (let dy = -lado; dy <= lado; dy += lado) {
        g.beginPath();
        raios.forEach((d, i) => {
          const a = (i / pontas) * Math.PI * 2;
          g.lineTo(cx + dx + Math.cos(a) * d, cy + dy + Math.sin(a) * d);
        });
        g.closePath();
        g.fill();
      }
    }
  }
  for (let i = 0; i < 26; i++) {
    retalho(r() * lado, r() * lado, 22 + r() * 58, r() < 0.5 ? cfg.corClara : cfg.corEscura);
  }

  g.strokeStyle = "rgba(255, 255, 255, 0.1)";
  g.lineWidth = 1;
  for (let i = 0; i < 900; i++) {
    const x = r() * lado;
    const y = r() * lado;
    const a = r() * Math.PI;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7);
    g.stroke();
  }

  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.anisotropy = 4;
  return textura;
}

function criarChao(dados) {
  // bem maior que a área andável: a borda some na neblina
  const lado = dados.tamanho * 5;
  const textura = texturaChao(dados.chao);
  textura.repeat.set(lado / dados.chao.ladrilho, lado / dados.chao.ladrilho);
  const malha = new THREE.Mesh(new THREE.PlaneGeometry(lado, lado), new THREE.MeshBasicMaterial({ map: textura }));
  malha.rotation.x = -Math.PI / 2;
  return malha;
}

// folha com os desenhos: tufo de capim seguido das flores
const CORES_FLOR = ["#ff9ccd", "#ffd479", "#c8a2f0", "#fff6e8", "#8fc7ff"];
const TIPOS_TUFO = 1 + CORES_FLOR.length;

function texturaTufos() {
  const q = 64;
  const canvas = document.createElement("canvas");
  canvas.width = q * TIPOS_TUFO;
  canvas.height = q;
  const g = canvas.getContext("2d");

  function capim(ox) {
    g.fillStyle = "#5fae45";
    [-16, -5, 6, 17].forEach((d, i) => {
      g.beginPath();
      g.moveTo(ox + 32 + d - 7, q);
      g.lineTo(ox + 32 + d * 1.5, 18 + (i % 2) * 12);
      g.lineTo(ox + 32 + d + 7, q);
      g.fill();
    });
  }
  function flor(ox, cor) {
    g.fillStyle = "#5fae45";
    g.fillRect(ox + 30, 30, 4, q - 30);
    g.fillStyle = cor;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      g.beginPath();
      g.arc(ox + 32 + Math.cos(a) * 9, 24 + Math.sin(a) * 9, 7, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "#ffe08a";
    g.beginPath();
    g.arc(ox + 32, 24, 5, 0, Math.PI * 2);
    g.fill();
  }
  capim(0);
  CORES_FLOR.forEach((cor, i) => flor(q * (i + 1), cor));

  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

function criarTufos(dados, casas) {
  const r = sorteador(dados.tufos.semente);
  const material = new THREE.MeshBasicMaterial({ map: texturaTufos(), alphaTest: 0.5, side: THREE.DoubleSide });
  const grupo = new THREE.Group();
  const porTipo = [];
  const geometrias = [];
  for (let i = 0; i < TIPOS_TUFO; i++) {
    const g = new THREE.PlaneGeometry(1, 1);
    g.translate(0, 0.5, 0);
    const uv = g.attributes.uv;
    for (let n = 0; n < uv.count; n++) uv.setX(n, (i + uv.getX(n)) / TIPOS_TUFO);
    geometrias.push(g);
    porTipo.push([]);
  }

  const florAoAcaso = () => 1 + Math.floor(r() * CORES_FLOR.length);
  const metade = dados.tamanho / 2;

  for (let i = 0; i < dados.tufos.quantidade; i++) {
    const tipo = r() < dados.tufos.flores ? florAoAcaso() : 0;
    porTipo[tipo].push({ x: (r() * 2 - 1) * metade, z: (r() * 2 - 1) * metade, s: 0.7 + r() * 0.6 });
  }

  const c = dados.canteiros;
  for (let i = 0; i < c.quantidade; i++) {
    const cx = (r() * 2 - 1) * metade;
    const cz = (r() * 2 - 1) * metade;
    const cores = [florAoAcaso(), florAoAcaso()];
    for (let n = 0; n < c.flores; n++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * c.raio;
      porTipo[cores[n % 2]].push({ x: cx + Math.cos(a) * d, z: cz + Math.sin(a) * d, s: 0.65 + r() * 0.5 });
    }
  }

  const m = new THREE.Matrix4();
  porTipo.forEach((todos, tipo) => {
    const lista = todos.filter((t) => !casas.some((c) => dentroDaCaixa(t.x, t.z, c, FOLGA_FLORES)));
    if (!lista.length) return;
    const malha = new THREE.InstancedMesh(geometrias[tipo], material, lista.length);
    lista.forEach((t, i) => {
      m.makeScale(t.s, t.s, t.s).setPosition(t.x, 0, t.z);
      malha.setMatrixAt(i, m);
    });
    malha.frustumCulled = false;
    grupo.add(malha);
  });
  return grupo;
}

// devolve as casas criadas (motor usa pra colisão e portas)
export function construirMundo(cena, dados) {
  const casas = dados.casas.map(criarCasa);
  cena.add(criarChao(dados), criarTufos(dados, casas));
  casas.forEach((c) => cena.add(c.grupo));
  return casas;
}
