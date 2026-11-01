// interiores.js — as salas das casas, como dioramas de papel: paredes, piso e móveis gerados
// por código (o kit de móveis fica em moveis-papel.js; cada sala escolhe os seus em dados/mundo3d.js).

import * as THREE from "../vendor/three.min.js";
import { criarMovel } from "./moveis-papel.js";
import { Folha, fundirPecas } from "./papel.js";

// papel de parede: listras por cima, lambri de tábuas por baixo. Uma repetição = 4 de largura.
function texturaParede(parede, alturaSala) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const g = canvas.getContext("2d");
  const listra = 32;
  for (let x = 0; x < 256; x += listra) {
    g.fillStyle = x % (listra * 2) === 0 ? parede.corA : parede.corB;
    g.fillRect(x, 0, listra, 512);
  }

  // bolinhas nas listras claras, deslocadas de linha em linha
  g.fillStyle = parede.corDetalhe;
  for (let y = 24, linha = 0; y < 512; y += 48, linha++) {
    for (let x = 16 + (linha % 2) * listra * 2; x < 256; x += listra * 4) {
      g.beginPath();
      g.arc(x, y, 5, 0, Math.PI * 2);
      g.fill();
    }
  }

  const alturaLambri = Math.round((parede.lambri / alturaSala) * 512);
  const topoLambri = 512 - alturaLambri;
  g.fillStyle = parede.corLambri;
  g.fillRect(0, topoLambri, 256, alturaLambri);
  g.fillStyle = "rgba(60, 40, 40, 0.18)";
  for (let x = 0; x < 256; x += 64) g.fillRect(x, topoLambri, 3, alturaLambri);
  g.fillStyle = parede.corMoldura;
  g.fillRect(0, topoLambri - 10, 256, 14);

  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.wrapS = THREE.RepeatWrapping;
  textura.anisotropy = 4;
  return textura;
}

function texturaPiso(piso) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const g = canvas.getContext("2d");
  if (piso.tipo === "tabuas") desenharTabuas(g, piso);
  else if (piso.tipo === "nuvens") desenharNuvens(g, piso);
  else desenharXadrez(g, piso);
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.anisotropy = 8;
  return textura;
}

function desenharTabuas(g, piso) {
  [0, 32, 64, 96].forEach((y, i) => {
    g.fillStyle = i % 2 ? piso.corA : piso.corB;
    g.fillRect(0, y, 128, 32);
    g.fillStyle = "rgba(60, 30, 20, 0.28)";
    g.fillRect(0, y, 128, 2);
    g.fillRect((i * 47 + 20) % 128, y, 2, 32);
  });
}

function desenharNuvens(g, piso) {
  g.fillStyle = piso.corA;
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = piso.corB;
  [[30, 34, 20], [52, 30, 15], [96, 92, 22], [72, 96, 14], [120, 40, 12], [8, 110, 13]].forEach(([x, y, r]) => {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  });
}

function desenharXadrez(g, piso) {
  [
    [0, 0, piso.corA],
    [64, 0, piso.corB],
    [0, 64, piso.corB],
    [64, 64, piso.corA],
  ].forEach(([x, y, cor]) => {
    g.fillStyle = cor;
    g.fillRect(x, y, 64, 64);
  });
  g.strokeStyle = "rgba(90, 60, 60, 0.22)";
  g.lineWidth = 2;
  g.strokeRect(0, 0, 64, 64);
  g.strokeRect(64, 64, 64, 64);
}

// parede de papel, de a a b (pontos [x, z] no chão)
function criarParede(sala, textura, a, b) {
  const comprimento = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const material = new THREE.MeshBasicMaterial({ map: textura.clone(), side: THREE.DoubleSide });
  material.map.repeat.set(comprimento / 4, 1);
  material.map.needsUpdate = true;
  const parede = new THREE.Mesh(new THREE.PlaneGeometry(comprimento, sala.altura), material);
  parede.position.set((a[0] + b[0]) / 2, sala.altura / 2, (a[1] + b[1]) / 2);
  parede.rotation.y = Math.atan2(a[1] - b[1], b[0] - a[0]);
  return parede;
}

// Sala de verdade, toda de papel: paredes, piso e móveis, sem imagem.
// sala: MUNDO3D.salaPapel; interior: `interior` da casa. Devolve { cena, caixas }.
export function criarSalaDePapel(sala, interior) {
  const cena = new THREE.Scene();
  cena.background = new THREE.Color(interior.parede.corLambri);

  const metade = sala.largura / 2;
  const fundo = sala.fundoZ;
  const frente = sala.frenteZ;

  const texturaDasParedes = texturaParede(interior.parede, sala.altura);
  cena.add(
    criarParede(sala, texturaDasParedes, [-metade, fundo], [metade, fundo]),
    criarParede(sala, texturaDasParedes, [-metade, frente], [-metade, fundo]),
    criarParede(sala, texturaDasParedes, [metade, fundo], [metade, frente])
  );

  const profundidade = frente - fundo;
  const textura = texturaPiso(interior.piso);
  textura.repeat.set(sala.largura / interior.piso.ladrilho, profundidade / interior.piso.ladrilho);
  const piso = new THREE.Mesh(
    new THREE.PlaneGeometry(sala.largura, profundidade),
    new THREE.MeshBasicMaterial({ map: textura })
  );
  piso.rotation.x = -Math.PI / 2;
  piso.position.set(0, 0, fundo + profundidade / 2);
  cena.add(piso);

  // a sombra de cada móvel é um recorte mais escuro no chão, levemente deslocado
  const f = new Folha();
  const pecas = new THREE.Group();
  const caixas = [];
  interior.moveis.forEach((item) => {
    const { grupo, caixa, redondo } = criarMovel(f, item);
    pecas.add(grupo);
    if (!caixa) return;
    caixas.push(caixa);
    const cor = interior.piso.corSombra;
    const x = item.x + 0.22;
    const z = item.z + 0.26;
    const sombra = redondo
      ? f.disco(caixa.meiaLargura * 1.05, cor, x, 0.012, z)
      : f.caixa(caixa.meiaLargura * 2 + 0.1, 0.01, caixa.meiaProfundidade * 2 + 0.1, cor, x, 0.012, z);
    if (redondo) sombra.rotation.x = -Math.PI / 2;
    else sombra.rotation.y = caixa.giro;
    pecas.add(sombra);
  });

  const corTapete = interior.corTapete || "#ff9ccd";
  const tapete = f.caixa(3.2, 0.06, 1.3, corTapete, sala.saida.x, 0.03, sala.saida.z);
  const miolo = f.caixa(2.6, 0.08, 0.8, "#fff3dc", sala.saida.x, 0.04, sala.saida.z);
  pecas.add(tapete, miolo);

  fundirPecas(pecas);
  cena.add(pecas);
  return { cena, caixas };
}
