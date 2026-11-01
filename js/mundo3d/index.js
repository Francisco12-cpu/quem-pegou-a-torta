// index.js — o mundo 3D. Carregado por js/main.js só no modo 3D; o resto do jogo (diálogo, baú,
// HUD, música) continua igual, em HTML por cima do canvas. Quem decide o que acontece ao
// falar com uma pônei é main.js (`aoInteragir`); entrar e sair das casas se resolve aqui.
//
// Um "lugar" é o mundo aberto ou o interior de uma casa:
//   { nome, cena, camera, limites, pontos: [{ dados, ponei? }], casas: [] }

import * as THREE from "../vendor/three.min.js";
import { atualizarOpacidade } from "./casas-papel.js";
import { criarCenaAberta, criarPalco } from "./cena.js";
import { empurrarDeCaixa, empurrarDeCirculo } from "./colisao.js";
import { construirMundo } from "./construtor.js";
import { Controles } from "./controles.js";
import { criarInterior } from "./interiores.js";
import { PoneiPapel, carregarImagem } from "./ponei-papel.js";

const dados = MUNDO3D;
const DT_MAXIMO = 0.05; // aba parada não faz a pônei teleportar
const ESPERA_INICIAL_MS = 250; // a tecla/clique que fechou o diálogo não reabre nada aqui
const TEXTOS = { ponei: "Conversar", porta: "Entrar", saida: "Sair" };

let el = null;
let palco = null;
let controles = null;
let protagonista = null;
let spriteAtual = null;
let mundoAberto = null;
let lugar = null;
let pontoPerto = null;
let aoInteragir = null;
let ativo = false;
let inicioTela = 0;
let rafId = null;
let ultimoT = 0;
const jogador = { x: 0, z: 0, vx: 0, vz: 0 };
const naTela = new THREE.Vector3();

// ---- montagem ----

function montar() {
  el = {
    overlay: document.getElementById("mundo3d-overlay"),
    canvas: document.getElementById("mundo3d-canvas"),
    joystick: document.getElementById("mundo3d-joystick"),
    pino: document.getElementById("mundo3d-joystick-pino"),
    balao: document.getElementById("mundo3d-balao"),
    acao: document.getElementById("mundo3d-acao"),
  };
  palco = criarPalco(el.canvas);
  controles = new Controles(el.canvas, el.joystick, el.pino, interagir);
  el.acao.addEventListener("click", interagir);
  el.balao.addEventListener("click", interagir);
}

async function criarPonei(dadosPonto, cena) {
  const imagem = await carregarImagem(PERSONAGENS[dadosPonto.id].sprite);
  const ponei = new PoneiPapel(imagem, dados.alturaPonei);
  ponei.grupo.position.set(dadosPonto.x, 0, dadosPonto.z);
  cena.add(ponei.grupo);
  return { dados: dadosPonto, ponei };
}

async function criarLugarInterior(casa, mundo) {
  const interior = casa.dados.interior;
  const sala = dados.interior;
  const cena = criarInterior(await carregarImagem(interior.fundo), sala, interior);
  const poneis = await Promise.all(interior.pontos.map((p) => criarPonei(p, cena)));
  const lugarInterno = {
    nome: interior.nome,
    cena,
    camera: sala.camera,
    limites: sala.limites,
    casas: [],
    entrada: sala.entrada,
    pontos: poneis,
  };
  lugarInterno.pontos.push({
    dados: { tipo: "saida", x: sala.saida.x, z: sala.saida.z, raio: sala.saida.raio, destino: mundo, chegada: casa.saida },
  });
  return lugarInterno;
}

async function criarMundo() {
  const cena = criarCenaAberta(dados);
  const casas = construirMundo(cena, dados);
  const metade = dados.tamanho / 2;
  const mundo = {
    nome: dados.nome,
    cena,
    camera: dados.camera,
    limites: { minX: -metade, maxX: metade, minZ: -metade, maxZ: metade },
    casas,
    entrada: dados.inicio,
    pontos: await Promise.all(dados.pontos.map((p) => criarPonei(p, cena))),
  };
  const portas = await Promise.all(
    casas.map(async (casa) => ({
      dados: {
        tipo: "porta",
        x: casa.porta.x,
        z: casa.porta.z,
        altura: casa.porta.altura,
        destino: await criarLugarInterior(casa, mundo),
      },
    }))
  );
  mundo.pontos.push(...portas);
  return mundo;
}

async function colocarProtagonista(sprite) {
  if (protagonista && spriteAtual === sprite) return;
  const imagem = await carregarImagem(sprite);
  if (protagonista) protagonista.grupo.removeFromParent();
  protagonista = new PoneiPapel(imagem, dados.alturaPonei, { olhandoDireita: true });
  spriteAtual = sprite;
}

// ---- lugares ----

function irPara(destino, chegada) {
  lugar = destino;
  lugar.cena.add(protagonista.grupo);
  jogador.x = chegada.x;
  jogador.z = chegada.z;
  jogador.vx = jogador.vz = 0;
  pontoPerto = null;
  el.balao.hidden = true;
  el.acao.hidden = true;
  palco.usarCamera(lugar.camera);
  palco.seguir(jogador, null);
}

function atravessar(ponto) {
  Musica.efeito("passagem");
  parar();
  Interface.transicao(function () {
    irPara(ponto.destino, ponto.chegada || ponto.destino.entrada);
    ligar();
    Interface.mostrarPlaca(lugar.nome);
  });
}

// ---- a cada quadro ----

function moverJogador(dt) {
  const direcao = controles.ler();
  const suave = 1 - Math.exp(-dados.aceleracao * dt);
  jogador.vx += (direcao.x * dados.velocidade - jogador.vx) * suave;
  jogador.vz += (direcao.z * dados.velocidade - jogador.vz) * suave;

  jogador.x += jogador.vx * dt;
  jogador.z += jogador.vz * dt;
  lugar.casas.forEach((c) => empurrarDeCaixa(jogador, c, dados.raioColisaoCasa));
  lugar.pontos.forEach((p) => {
    if (p.ponei) empurrarDeCirculo(jogador, p.dados.x, p.dados.z, dados.raioColisao);
  });

  const l = lugar.limites;
  jogador.x = Math.max(l.minX, Math.min(l.maxX, jogador.x));
  jogador.z = Math.max(l.minZ, Math.min(l.maxZ, jogador.z));
}

function atualizarPontoPerto() {
  let melhor = null;
  let melhorD = Infinity;
  lugar.pontos.forEach((p) => {
    const d = Math.hypot(p.dados.x - jogador.x, p.dados.z - jogador.z);
    if (d <= (p.dados.raio || dados.raioInteracao) && d < melhorD) {
      melhor = p;
      melhorD = d;
    }
  });
  if (melhor === pontoPerto) return;
  pontoPerto = melhor;

  el.balao.hidden = !pontoPerto;
  el.acao.hidden = !pontoPerto;
  if (!pontoPerto) return;
  const texto = TEXTOS[pontoPerto.dados.tipo];
  el.balao.innerHTML = '<kbd class="so-teclado">E</kbd>' + texto;
  el.acao.textContent = texto;
  el.balao.classList.remove("aparecendo");
  void el.balao.offsetWidth; // recomeça a animação de aparecer
  el.balao.classList.add("aparecendo");
}

function posicionarBalao() {
  if (!pontoPerto) return;
  const d = pontoPerto.dados;
  const altura = d.altura || (pontoPerto.ponei ? dados.alturaPonei + 0.5 : 1.6);
  naTela.set(d.x, altura, d.z).project(palco.camera);
  el.balao.style.left = ((naTela.x + 1) / 2) * el.overlay.clientWidth + "px";
  el.balao.style.top = ((1 - naTela.y) / 2) * el.overlay.clientHeight + "px";
}

function atualizar(dt) {
  moverJogador(dt);
  protagonista.grupo.position.set(jogador.x, 0, jogador.z);
  palco.seguir(jogador, dt);
  protagonista.atualizar(dt, jogador.vx, jogador.vz, dados.velocidade, palco.camera);

  atualizarPontoPerto();
  lugar.pontos.forEach((p) => {
    if (!p.ponei) return;
    if (p === pontoPerto) p.ponei.olharPara(jogador.x);
    p.ponei.atualizar(dt, 0, 0, dados.velocidade, palco.camera);
  });
  lugar.casas.forEach((c) => atualizarOpacidade(c, jogador, dt));
  posicionarBalao();
}

function quadro(t) {
  rafId = requestAnimationFrame(quadro);
  const dt = Math.max(0, Math.min(DT_MAXIMO, (t - ultimoT) / 1000));
  ultimoT = t;
  atualizar(dt);
  palco.desenhar(lugar.cena);
}

// ---- ações ----

function interagir() {
  if (!ativo || !pontoPerto) return;
  if (performance.now() - inicioTela < ESPERA_INICIAL_MS) return;
  const ponto = pontoPerto.dados;
  if (ponto.tipo !== "ponei") {
    atravessar(ponto);
    return;
  }
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

// ---- API usada por main.js ----

// sprite: imagem da protagonista escolhida; opcoes.aoInteragir(ponto): falou com uma pônei
export async function iniciar(opcoes) {
  if (!palco) montar();
  el.overlay.hidden = false; // o canvas precisa ter tamanho
  if (!mundoAberto) mundoAberto = await criarMundo();
  await colocarProtagonista(opcoes.sprite);
  aoInteragir = opcoes.aoInteragir;
  irPara(mundoAberto, mundoAberto.entrada);
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

export function lugarAtual() {
  return lugar ? lugar.nome : null;
}
