// cena.js — renderer, câmera e o seguir da câmera. Não sabe nada do jogo. Cada lugar (o mundo,
// cada interior) tem a sua própria THREE.Scene; aqui só se desenha a que estiver valendo.

import * as THREE from "../vendor/three.min.js";

const LONGE = 175; // nada do mundo fica além disso (os morros mais distantes)

export function ehCelular() {
  return window.matchMedia("(pointer: coarse)").matches;
}

export function criarPalco(canvas) {
  // serrilhado suave pesa bastante no celular, e a densidade de pixels já disfarça
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !ehCelular(), powerPreference: "high-performance" });

  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.5, LONGE);
  const olhar = new THREE.Vector3();
  let cfg = null;

  function ajustar() {
    const largura = canvas.parentElement.clientWidth;
    const altura = canvas.parentElement.clientHeight;
    if (!largura || !altura || !cfg) return;
    const proporcao = largura / altura;
    renderer.setSize(largura, altura, false);
    camera.aspect = proporcao;
    // tela em pé mostra pouco dos lados: abre o campo de visão
    camera.fov = proporcao >= 1.2 ? cfg.fov : Math.min(cfg.fovMaximo, (cfg.fov * 1.2) / proporcao);
    camera.updateProjectionMatrix();
  }

  // cfg: { fov, fovMaximo, altura, distancia, olharAltura, suavidade }, e nos interiores
  // zFixo (a câmera não anda em z) e meiaLargura (não mostra além das paredes laterais)
  function usarCamera(novaCfg) {
    cfg = novaCfg;
    ajustar();
  }

  function alvoX(x) {
    if (!cfg.meiaLargura) return x;
    const meiaVisao = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect * cfg.distancia;
    const limite = Math.max(0, cfg.meiaLargura - meiaVisao);
    return Math.max(-limite, Math.min(limite, x));
  }

  // dt = null cola a câmera no alvo de uma vez (ao entrar num lugar)
  function seguir(alvo, dt) {
    const t = dt == null ? 1 : 1 - Math.exp(-cfg.suavidade * dt);
    olhar.x += (alvoX(alvo.x) - olhar.x) * t;
    olhar.y = cfg.olharAltura;
    olhar.z += ((cfg.zFixo != null ? cfg.zFixo : alvo.z) - olhar.z) * t;
    camera.position.set(olhar.x, cfg.altura, olhar.z + cfg.distancia);
    camera.lookAt(olhar);
  }

  // escala: quantos pixels de verdade por pixel da tela (menos = mais leve, menos nítido)
  function definirEscala(escala) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, escala));
    ajustar();
  }

  function desenhar(cena) {
    renderer.render(cena, camera);
  }

  new ResizeObserver(ajustar).observe(canvas.parentElement);

  function info() {
    return { ...renderer.info.render, geometrias: renderer.info.memory.geometries, texturas: renderer.info.memory.textures };
  }

  return { camera, ajustar, usarCamera, seguir, definirEscala, desenhar, info };
}

export function criarCenaAberta(dados) {
  const cena = new THREE.Scene();
  cena.background = new THREE.Color(dados.ceu);
  cena.fog = new THREE.Fog(dados.ceu, dados.neblina.perto, dados.neblina.longe);
  return cena;
}
