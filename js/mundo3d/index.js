// index.js — o mundo 3D. Carregado por js/main.js só no modo 3D; o resto do jogo (diálogo, baú,
// HUD, música) continua igual, em HTML por cima do canvas.

import { criarCena } from "./cena.js";
import { construirMundo } from "./construtor.js";
import { Controles } from "./controles.js";
import { PoneiPapel, carregarImagem } from "./ponei-papel.js";

const dados = MUNDO3D;
const DT_MAXIMO = 0.05; // aba parada não faz a pônei teleportar

let el = null;
let palco = null; // { cena, camera, ajustar, seguir, desenhar }
let controles = null;
let protagonista = null;
let spriteAtual = null;
let rafId = null;
let ultimoT = 0;
const jogador = { x: 0, z: 0, vx: 0, vz: 0 };

function montar() {
  el = {
    overlay: document.getElementById("mundo3d-overlay"),
    canvas: document.getElementById("mundo3d-canvas"),
    joystick: document.getElementById("mundo3d-joystick"),
    pino: document.getElementById("mundo3d-joystick-pino"),
  };
  el.overlay.hidden = false; // o canvas precisa ter tamanho ao criar a cena
  palco = criarCena(el.canvas, dados);
  construirMundo(palco.cena, dados);
  controles = new Controles(el.canvas, el.joystick, el.pino, null);
}

async function colocarProtagonista(sprite) {
  if (protagonista && spriteAtual === sprite) return;
  const imagem = await carregarImagem(sprite);
  if (protagonista) palco.cena.remove(protagonista.grupo);
  protagonista = new PoneiPapel(imagem, dados.alturaPonei, { olhandoDireita: true });
  spriteAtual = sprite;
  palco.cena.add(protagonista.grupo);
}

function atualizar(dt) {
  const direcao = controles.ler();
  const suave = 1 - Math.exp(-dados.aceleracao * dt);
  jogador.vx += (direcao.x * dados.velocidade - jogador.vx) * suave;
  jogador.vz += (direcao.z * dados.velocidade - jogador.vz) * suave;

  const limite = dados.tamanho / 2;
  jogador.x = Math.max(-limite, Math.min(limite, jogador.x + jogador.vx * dt));
  jogador.z = Math.max(-limite, Math.min(limite, jogador.z + jogador.vz * dt));

  protagonista.grupo.position.set(jogador.x, 0, jogador.z);
  palco.seguir(jogador, dt);
  protagonista.atualizar(dt, jogador.vx, jogador.vz, dados.velocidade, palco.camera);
}

function quadro(t) {
  rafId = requestAnimationFrame(quadro);
  const dt = Math.min(DT_MAXIMO, (t - ultimoT) / 1000);
  ultimoT = t;
  atualizar(dt);
  palco.desenhar();
}

// sprite: imagem da protagonista escolhida
export async function iniciar({ sprite }) {
  if (!palco) montar();
  await colocarProtagonista(sprite);

  el.overlay.hidden = false;
  palco.ajustar();
  jogador.x = dados.inicio.x;
  jogador.z = dados.inicio.z;
  jogador.vx = jogador.vz = 0;
  palco.seguir(jogador, null);

  controles.ligar();
  ultimoT = performance.now();
  if (rafId == null) rafId = requestAnimationFrame(quadro);
}

export function parar() {
  if (rafId != null) cancelAnimationFrame(rafId);
  rafId = null;
  if (controles) controles.desligar();
}

export function esconder() {
  parar();
  if (el) el.overlay.hidden = true;
}

export function posicaoJogador() {
  return { x: jogador.x, z: jogador.z };
}
