// decoracao.js — o que enfeita o mundo aberto: caminhos, árvores, morros, nuvens e a fonte.
// Tudo gerado por código a partir de dados/mundo3d.js.

import * as THREE from "../vendor/three.min.js";
import { Folha, Quadros, fundirPecas, sorteador } from "./papel.js";

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
  fundirPecas(grupo);
  return grupo;
}

// desenho de uma árvore de papel, numa área de 256x320 a partir de (ox, oy)
function desenharArvore(g, ox, oy, escala) {
  g.save();
  g.translate(ox, oy);
  g.scale(escala, escala);
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
  g.restore();
}

function texturaArvore() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 320;
  desenharArvore(canvas.getContext("2d"), 0, 0, 1);
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

// Divide o que está espalhado em setores: cada um é uma malha só, e o que estiver fora de
// vista nem é desenhado. Devolve [{ malha, x, z }] (o motor esconde os setores muito longe).
export function emSetores(itens, tamanhoSetor, somar, material) {
  const setores = new Map();
  itens.forEach((item) => {
    const chave = Math.floor(item.x / tamanhoSetor) + "," + Math.floor(item.z / tamanhoSetor);
    if (!setores.has(chave)) setores.set(chave, { quadros: new Quadros(), somaX: 0, somaZ: 0, n: 0 });
    const s = setores.get(chave);
    somar(s.quadros, item);
    s.somaX += item.x;
    s.somaZ += item.z;
    s.n++;
  });
  return [...setores.values()].map((s) => ({
    malha: s.quadros.malha(material),
    x: s.somaX / s.n,
    z: s.somaZ / s.n,
  }));
}

// lista: [{ x, z, escala }]; devolve os setores de árvores
export function criarArvores(lista, cfg) {
  const material = new THREE.MeshBasicMaterial({ map: texturaArvore(), alphaTest: 0.5, side: THREE.DoubleSide });
  dissolverPertoDaCamera(material, cfg);
  return emSetores(
    lista,
    cfg.tamanhoSetor,
    (quadros, a) => {
      // dois recortes cruzados, pra ter volume
      quadros.somar(a.x, a.z, 5 * a.escala, 6.25 * a.escala, 0.45);
      quadros.somar(a.x, a.z, 5 * a.escala, 6.25 * a.escala, 0.45 + Math.PI / 2);
    },
    material
  );
}

// sorteia as árvores do meio do mapa, em lugares livres
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
  return lista;
}

// O fundo do mapa: em vez de centenas de árvores, uma faixa de papel com várias desenhadas
// numa textura só. Fica nos três lados que a câmera enxerga (ela nunca olha para trás).
export function criarFaixaDeArvores(dados) {
  const cfg = dados.arvores;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const g = canvas.getContext("2d");
  const r = sorteador(cfg.semente + 1);
  for (let i = 0; i < 6; i++) {
    const escala = 0.62 + r() * 0.16;
    desenharArvore(g, i * 170 + (r() - 0.5) * 16 - 10, 256 - 320 * escala, escala);
  }
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.wrapS = THREE.RepeatWrapping;
  textura.anisotropy = 4;
  const material = new THREE.MeshBasicMaterial({ map: textura, alphaTest: 0.5, side: THREE.DoubleSide });

  const metade = dados.tamanho / 2 + 5;
  const comprimento = metade * 2 + 30;
  const repeticoes = comprimento / cfg.larguraFaixa;
  const quadros = new Quadros();
  quadros.somar(0, -metade, comprimento, cfg.alturaFaixa, 0, 0, repeticoes);
  quadros.somar(-metade, 0, comprimento, cfg.alturaFaixa, Math.PI / 2, 0, repeticoes);
  quadros.somar(metade, 0, comprimento, cfg.alturaFaixa, Math.PI / 2, 0, repeticoes);
  const malha = quadros.malha(material);
  malha.frustumCulled = false;
  return malha;
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
  fundirPecas(grupo);
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
  fundirPecas(grupo);
  grupo.position.set(fonte.x, 0, fonte.z);
  return grupo;
}
