// cena.js — renderer, câmera e o seguir da câmera. Não sabe nada do jogo.

import * as THREE from "../vendor/three.min.js";

const DPR_MAXIMO = 2;

export function criarCena(canvas, dados) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_MAXIMO));

  const cena = new THREE.Scene();
  cena.background = new THREE.Color(dados.ceu);
  cena.fog = new THREE.Fog(dados.ceu, dados.neblina.perto, dados.neblina.longe);

  const cfg = dados.camera;
  const camera = new THREE.PerspectiveCamera(cfg.fov, 16 / 9, 0.5, 300);
  const olhar = new THREE.Vector3();

  function ajustar() {
    const largura = canvas.parentElement.clientWidth;
    const altura = canvas.parentElement.clientHeight;
    if (!largura || !altura) return;
    const proporcao = largura / altura;
    renderer.setSize(largura, altura, false);
    camera.aspect = proporcao;
    // tela em pé mostra pouco dos lados: abre o campo de visão
    camera.fov = proporcao >= 1.2 ? cfg.fov : Math.min(cfg.fovMaximo, (cfg.fov * 1.2) / proporcao);
    camera.updateProjectionMatrix();
  }

  // dt = null cola a câmera no alvo de uma vez (ao entrar numa área)
  function seguir(alvo, dt) {
    const t = dt == null ? 1 : 1 - Math.exp(-cfg.suavidade * dt);
    olhar.x += (alvo.x - olhar.x) * t;
    olhar.y = cfg.olharAltura;
    olhar.z += (alvo.z - olhar.z) * t;
    camera.position.set(olhar.x, cfg.altura, olhar.z + cfg.distancia);
    camera.lookAt(olhar);
  }

  function desenhar() {
    renderer.render(cena, camera);
  }

  const observador = new ResizeObserver(ajustar);
  observador.observe(canvas.parentElement);
  ajustar();

  return { cena, camera, ajustar, seguir, desenhar };
}
