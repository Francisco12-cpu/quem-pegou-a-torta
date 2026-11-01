// interiores.js — a sala 3D de uma casa: como um diorama de papel, com o cenário pintado do
// jogo 2D na parede do fundo, chão e paredes laterais. O motor só precisa da cena pronta.

import * as THREE from "../vendor/three.min.js";
import { criarMovel } from "./moveis-papel.js";
import { Folha, fundirPecas } from "./papel.js";

function tabuas(cor) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const g = canvas.getContext("2d");
  g.fillStyle = cor;
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(60, 30, 30, 0.16)";
  for (let y = 0; y < 256; y += 64) g.fillRect(0, y, 256, 3);
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  return textura;
}

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
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.anisotropy = 8;
  return textura;
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

  const tapete = f.caixa(3.2, 0.06, 1.3, "#ff9ccd", sala.saida.x, 0.03, sala.saida.z);
  const miolo = f.caixa(2.6, 0.08, 0.8, "#fff3dc", sala.saida.x, 0.04, sala.saida.z);
  pecas.add(tapete, miolo);

  fundirPecas(pecas);
  cena.add(pecas);
  return { cena, caixas };
}

// a casa da Rainbow Dash não tem cenário pintado: um céu com nuvens e arco-íris, feito aqui
function ceuDeNuvens() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 576;
  const g = canvas.getContext("2d");
  const ceu = g.createLinearGradient(0, 0, 0, 576);
  ceu.addColorStop(0, "#3f9bdc");
  ceu.addColorStop(0.7, "#8fd0ef");
  ceu.addColorStop(1, "#d8f2fb");
  g.fillStyle = ceu;
  g.fillRect(0, 0, 1024, 576);

  ["#e8473f", "#f28c38", "#f6d344", "#5bc85a", "#4a9be8", "#8a5bd6"].forEach((cor, i) => {
    g.strokeStyle = cor;
    g.lineWidth = 26;
    g.beginPath();
    g.arc(512, 620, 470 - i * 26, Math.PI, 0);
    g.stroke();
  });

  g.fillStyle = "#ffffff";
  [
    [60, 500, 110],
    [230, 540, 130],
    [420, 560, 120],
    [620, 550, 130],
    [810, 535, 125],
    [980, 500, 110],
    [190, 170, 50],
    [250, 180, 62],
    [320, 175, 46],
    [730, 120, 44],
    [790, 125, 58],
    [850, 130, 42],
  ].forEach(([x, y, r]) => {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  });
  return canvas;
}

// imagem: <img> do cenário (null = céu de nuvens); sala: MUNDO3D.interior;
// dadosInterior: `interior` da casa
export function criarInterior(imagem, sala, dadosInterior) {
  const cena = new THREE.Scene();
  cena.background = new THREE.Color(dadosInterior.corParede);

  const f = new Folha();
  const largura = sala.largura;
  const altura = (largura * 9) / 16; // os cenários são todos 16:9
  const fundo = sala.fundoZ;
  const frente = sala.frenteZ;

  const textura = new THREE.Texture(imagem || ceuDeNuvens());
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 4;
  textura.needsUpdate = true;

  const parede = new THREE.Mesh(new THREE.PlaneGeometry(largura, altura), new THREE.MeshBasicMaterial({ map: textura }));
  parede.position.set(0, altura / 2, fundo);

  const profundidade = frente - fundo;
  const texturaChao = tabuas(dadosInterior.corChao);
  texturaChao.repeat.set(1, profundidade / 2);
  const chao = new THREE.Mesh(
    new THREE.PlaneGeometry(largura + 12, profundidade),
    new THREE.MeshBasicMaterial({ map: texturaChao })
  );
  chao.rotation.x = -Math.PI / 2;
  chao.position.set(0, 0, fundo + profundidade / 2);

  [-1, 1].forEach((lado) => {
    const lateral = f.caixa(0.3, altura, profundidade, dadosInterior.corParede, (lado * largura) / 2, altura / 2, fundo + profundidade / 2);
    cena.add(lateral);
  });

  // tapetinho da saída
  const tapete = f.caixa(3.2, 0.06, 1.3, "#ff9ccd", sala.saida.x, 0.03, sala.saida.z);
  const miolo = f.caixa(2.6, 0.08, 0.8, "#fff3dc", sala.saida.x, 0.04, sala.saida.z);

  cena.add(parede, chao, tapete, miolo);
  return cena;
}
