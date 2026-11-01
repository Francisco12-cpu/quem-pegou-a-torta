// interiores.js — a sala 3D de uma casa: como um diorama de papel, com o cenário pintado do
// jogo 2D na parede do fundo, chão e paredes laterais. O motor só precisa da cena pronta.

import * as THREE from "../vendor/three.min.js";
import { Folha } from "./papel.js";

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
