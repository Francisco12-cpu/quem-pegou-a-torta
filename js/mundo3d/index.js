// index.js — o mundo 3D. Carregado por js/main.js só no modo 3D; o resto do jogo (diálogo, baú,
// HUD, música) continua igual, em HTML por cima do canvas. Quem decide o que acontece ao
// interagir é main.js: aqui só se avisa com `aoInteragir(ponto)`.

import * as THREE from "../vendor/three.min.js";
import { criarCena } from "./cena.js";
import { empurrarDeCirculo } from "./colisao.js";
import { construirMundo } from "./construtor.js";
import { Controles } from "./controles.js";
import { PoneiPapel, carregarImagem } from "./ponei-papel.js";

const dados = MUNDO3D;
const DT_MAXIMO = 0.05; // aba parada não faz a pônei teleportar
const ESPERA_INICIAL_MS = 250; // a tecla/clique que fechou o diálogo não reabre nada aqui
const ALTURA_BALAO = 0.5; // acima da cabeça

let el = null;
let palco = null; // { cena, camera, ajustar, seguir, desenhar }
let controles = null;
let protagonista = null;
let spriteAtual = null;
let pontos = []; // [{ dados, ponei }]
let pontoPerto = null;
let aoInteragir = null;
let ativo = false;
let inicioTela = 0;
let rafId = null;
let ultimoT = 0;
const jogador = { x: 0, z: 0, vx: 0, vz: 0 };
const naTela = new THREE.Vector3();

function montar() {
  el = {
    overlay: document.getElementById("mundo3d-overlay"),
    canvas: document.getElementById("mundo3d-canvas"),
    joystick: document.getElementById("mundo3d-joystick"),
    pino: document.getElementById("mundo3d-joystick-pino"),
    balao: document.getElementById("mundo3d-balao"),
    acao: document.getElementById("mundo3d-acao"),
  };
  el.overlay.hidden = false; // o canvas precisa ter tamanho ao criar a cena
  palco = criarCena(el.canvas, dados);
  construirMundo(palco.cena, dados);
  controles = new Controles(el.canvas, el.joystick, el.pino, interagir);
  el.acao.addEventListener("click", interagir);
  el.balao.addEventListener("click", interagir);
}

async function colocarProtagonista(sprite) {
  if (protagonista && spriteAtual === sprite) return;
  const imagem = await carregarImagem(sprite);
  if (protagonista) palco.cena.remove(protagonista.grupo);
  protagonista = new PoneiPapel(imagem, dados.alturaPonei, { olhandoDireita: true });
  spriteAtual = sprite;
  palco.cena.add(protagonista.grupo);
}

async function colocarPontos() {
  if (pontos.length) return;
  pontos = await Promise.all(
    dados.pontos.map(async (p) => {
      const imagem = await carregarImagem(PERSONAGENS[p.id].sprite);
      const ponei = new PoneiPapel(imagem, dados.alturaPonei);
      ponei.grupo.position.set(p.x, 0, p.z);
      palco.cena.add(ponei.grupo);
      return { dados: p, ponei };
    })
  );
}

function moverJogador(dt) {
  const direcao = controles.ler();
  const suave = 1 - Math.exp(-dados.aceleracao * dt);
  jogador.vx += (direcao.x * dados.velocidade - jogador.vx) * suave;
  jogador.vz += (direcao.z * dados.velocidade - jogador.vz) * suave;

  jogador.x += jogador.vx * dt;
  jogador.z += jogador.vz * dt;
  pontos.forEach((p) => empurrarDeCirculo(jogador, p.dados.x, p.dados.z, dados.raioColisao));

  const limite = dados.tamanho / 2;
  jogador.x = Math.max(-limite, Math.min(limite, jogador.x));
  jogador.z = Math.max(-limite, Math.min(limite, jogador.z));
}

function atualizarPontoPerto() {
  let melhor = null;
  let melhorD = dados.raioInteracao;
  pontos.forEach((p) => {
    const d = Math.hypot(p.dados.x - jogador.x, p.dados.z - jogador.z);
    if (d <= melhorD) {
      melhor = p;
      melhorD = d;
    }
  });
  if (melhor === pontoPerto) return;
  pontoPerto = melhor;

  el.balao.hidden = !pontoPerto;
  el.acao.hidden = !pontoPerto;
  if (!pontoPerto) return;
  el.balao.classList.remove("aparecendo");
  void el.balao.offsetWidth; // recomeça a animação de aparecer
  el.balao.classList.add("aparecendo");
}

function posicionarBalao() {
  if (!pontoPerto) return;
  naTela.set(pontoPerto.dados.x, dados.alturaPonei + ALTURA_BALAO, pontoPerto.dados.z).project(palco.camera);
  el.balao.style.left = ((naTela.x + 1) / 2) * el.overlay.clientWidth + "px";
  el.balao.style.top = ((1 - naTela.y) / 2) * el.overlay.clientHeight + "px";
}

function atualizar(dt) {
  moverJogador(dt);
  protagonista.grupo.position.set(jogador.x, 0, jogador.z);
  palco.seguir(jogador, dt);
  protagonista.atualizar(dt, jogador.vx, jogador.vz, dados.velocidade, palco.camera);

  atualizarPontoPerto();
  pontos.forEach((p) => {
    if (p === pontoPerto) p.ponei.olharPara(jogador.x);
    p.ponei.atualizar(dt, 0, 0, dados.velocidade, palco.camera);
  });
  posicionarBalao();
}

function quadro(t) {
  rafId = requestAnimationFrame(quadro);
  const dt = Math.max(0, Math.min(DT_MAXIMO, (t - ultimoT) / 1000));
  ultimoT = t;
  atualizar(dt);
  palco.desenhar();
}

function interagir() {
  if (!ativo || !pontoPerto) return;
  if (performance.now() - inicioTela < ESPERA_INICIAL_MS) return;
  const ponto = pontoPerto.dados;
  Musica.efeito("interagir");
  parar();
  if (aoInteragir) aoInteragir(ponto);
}

function ligar() {
  el.overlay.hidden = false;
  palco.ajustar();
  jogador.vx = jogador.vz = 0;
  controles.ligar();
  ativo = true;
  inicioTela = ultimoT = performance.now();
  if (rafId == null) rafId = requestAnimationFrame(quadro);
}

// sprite: imagem da protagonista escolhida; opcoes.aoInteragir(ponto): falou com alguém
export async function iniciar(opcoes) {
  if (!palco) montar();
  await Promise.all([colocarProtagonista(opcoes.sprite), colocarPontos()]);
  aoInteragir = opcoes.aoInteragir;

  jogador.x = dados.inicio.x;
  jogador.z = dados.inicio.z;
  palco.seguir(jogador, null);
  ligar();
}

// volta de um diálogo: a protagonista continua onde estava
export function retomar() {
  ligar();
}

export function parar() {
  ativo = false;
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
