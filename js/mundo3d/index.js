// index.js — o mundo 3D. Carregado por js/main.js só no modo 3D; o resto do jogo (diálogo, baú,
// HUD, música) continua igual, em HTML por cima do canvas. Quem decide o que acontece ao
// falar com uma pônei ou abrir um baú é main.js (`aoInteragir`); entrar e sair das casas,
// portas trancadas e o guia se resolvem aqui, lendo `estado.conversou`.
//
// Um "lugar" é o mundo aberto ou o interior de uma casa:
//   { nome, cena, camera, limites, pontos: [{ dados, ponei?, bau? }], casas, solidos, entrada }

import * as THREE from "../vendor/three.min.js";
import { BauPapel } from "./bau-papel.js";
import { atualizarOpacidade } from "./casas-papel.js";
import { criarCenaAberta, criarPalco } from "./cena.js";
import { empurrarDeCaixa, empurrarDeCirculo } from "./colisao.js";
import { construirMundo } from "./construtor.js";
import { Controles } from "./controles.js";
import { criarInterior } from "./interiores.js";
import { Folha } from "./papel.js";
import { PoneiPapel, carregarImagem } from "./ponei-papel.js";

const dados = MUNDO3D;
const DT_MAXIMO = 0.05; // aba parada não faz a pônei teleportar
const ESPERA_INICIAL_MS = 250; // a tecla/clique que fechou o diálogo não reabre nada aqui
const TEXTOS = { ponei: "Conversar", bau: "Abrir baú", porta: "Entrar", saida: "Sair" };
const ALTURA_BALAO_BAU = 2.6;
const MARGEM_SAIDA_AREA = 1.2; // só vale sair da área um pouco além da borda (evita piscar)
const TEMPO_AVISO_MS = 2600;

let el = null;
let palco = null;
let controles = null;
let protagonista = null;
let spriteAtual = null;
let mundoAberto = null;
let portas = []; // um ponto de porta por casa, na mesma ordem de dados.casas
let nuvens = [];
let setaGuia = null;
let lugar = null;
let pontoPerto = null;
let areaAtual = null;
let destino = null; // { texto, ponto? } para onde o guia aponta
let acompanhante = null; // { ponei, x, z, vx, vz }
let aoInteragir = null;
let aoChegarNoFim = null;
let ativo = false;
let inicioTela = 0;
let rafId = null;
let ultimoT = 0;
let timerAviso = null;
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
    objetivo: document.getElementById("mundo3d-objetivo"),
    aviso: document.getElementById("mundo3d-aviso"),
  };
  palco = criarPalco(el.canvas);
  controles = new Controles(el.canvas, el.joystick, el.pino, interagir);
  el.acao.addEventListener("click", interagir);
  el.balao.addEventListener("click", interagir);
}

// pônei ou baú, conforme `tipo`
async function criarPonto(dadosPonto, cena) {
  if (dadosPonto.tipo === "bau") {
    const bau = new BauPapel(dadosPonto.x, dadosPonto.z, dadosPonto.giro);
    cena.add(bau.grupo);
    return { dados: dadosPonto, bau };
  }
  const imagem = await carregarImagem(PERSONAGENS[dadosPonto.id].sprite);
  const ponei = new PoneiPapel(imagem, dados.alturaPonei);
  ponei.grupo.position.set(dadosPonto.x, 0, dadosPonto.z);
  cena.add(ponei.grupo);
  return { dados: dadosPonto, ponei };
}

function telaDaCasa(casaDados) {
  return TELAS.find((t) => t.id === casaDados.tela);
}

async function criarLugarInterior(casa, mundo) {
  const interior = casa.dados.interior;
  const tela = telaDaCasa(casa.dados);
  const sala = dados.interior;
  const imagem = interior.fundo ? await carregarImagem(interior.fundo) : null;
  const cena = criarInterior(imagem, sala, interior);
  const pontos = await Promise.all(interior.pontos.map((p) => criarPonto(p, cena)));
  pontos.push({
    dados: {
      tipo: "saida",
      x: sala.saida.x,
      z: sala.saida.z,
      raio: sala.saida.raio,
      destino: mundo,
      chegada: casa.saida,
      // igual ao 2D: só sai depois de conversar com a dona da casa
      exige: tela.exige,
      trancada: tela.trancada,
    },
  });
  return {
    nome: tela.nome,
    cena,
    camera: sala.camera,
    limites: sala.limites,
    casas: [],
    solidos: [],
    entrada: sala.entrada,
    pontos,
    donaDaCasa: tela.exige,
  };
}

function criarSetaGuia(cena) {
  const f = new Folha();
  const forma = new THREE.Shape();
  forma.moveTo(0, 0.75);
  forma.lineTo(0.6, -0.1);
  forma.lineTo(0.2, -0.1);
  forma.lineTo(0.2, -0.6);
  forma.lineTo(-0.2, -0.6);
  forma.lineTo(-0.2, -0.1);
  forma.lineTo(-0.6, -0.1);
  forma.closePath();
  const malha = new THREE.Mesh(new THREE.ShapeGeometry(forma), f.material("#ffd479", 1, true));
  malha.rotation.x = -Math.PI / 2;
  malha.position.y = 0.09;
  const seta = new THREE.Group();
  seta.add(malha);
  seta.visible = false;
  cena.add(seta);
  return seta;
}

function nomeDaCasa(casaDados) {
  return casaDados.nome || telaDaCasa(casaDados).nome;
}

async function criarMundo() {
  const cena = criarCenaAberta(dados);
  const construido = construirMundo(cena, dados);
  nuvens = construido.nuvens;
  setaGuia = criarSetaGuia(cena);

  const metade = dados.tamanho / 2;
  const mundo = {
    nome: dados.nome,
    cena,
    camera: dados.camera,
    limites: { minX: -metade, maxX: metade, minZ: -metade, maxZ: metade },
    casas: construido.casas,
    solidos: construido.solidos,
    entrada: dados.inicio,
    pontos: await Promise.all(dados.pontos.map((p) => criarPonto(p, cena))),
  };

  portas = await Promise.all(
    construido.casas.map(async (casa, i) => {
      const anterior = dados.casas[i - 1];
      return {
        dados: {
          tipo: "porta",
          x: casa.porta.x,
          z: casa.porta.z,
          altura: casa.porta.altura,
          exige: casa.dados.exige,
          trancada: anterior ? "Ainda não. Melhor ir antes: " + nomeDaCasa(anterior) + "." : null,
          fim: casa.dados.fim,
          destino: casa.dados.interior ? await criarLugarInterior(casa, mundo) : null,
        },
      };
    })
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

function colocarAcompanhante() {
  if (!acompanhante) return;
  acompanhante.x = jogador.x - dados.acompanhante.distancia * 0.6;
  acompanhante.z = jogador.z + 0.8;
  acompanhante.vx = acompanhante.vz = 0;
  acompanhante.ponei.grupo.position.set(acompanhante.x, 0, acompanhante.z);
  lugar.cena.add(acompanhante.ponei.grupo);
}

function irPara(novoLugar, chegada) {
  lugar = novoLugar;
  lugar.cena.add(protagonista.grupo);
  jogador.x = chegada.x;
  jogador.z = chegada.z;
  jogador.vx = jogador.vz = 0;
  colocarAcompanhante();
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

// ---- guia: para onde ir agora ----

function atualizarDestino() {
  const casa = dados.casas.find((c) => c.fim || !estado.conversou[telaDaCasa(c).exige]);
  const indice = dados.casas.indexOf(casa);
  const donaAqui = lugar.donaDaCasa && !estado.conversou[lugar.donaDaCasa];
  destino = {
    texto: donaAqui ? "Converse com " + PERSONAGENS[lugar.donaDaCasa].nome : "Próximo: " + nomeDaCasa(casa),
    ponto: portas[indice].dados,
  };
  el.objetivo.textContent = destino.texto;
  el.objetivo.hidden = false;
}

function atualizarSetaGuia() {
  const dx = destino.ponto.x - jogador.x;
  const dz = destino.ponto.z - jogador.z;
  setaGuia.visible = lugar === mundoAberto && Math.hypot(dx, dz) > dados.guia.somePerto;
  if (!setaGuia.visible) return;
  const d = Math.hypot(dx, dz);
  setaGuia.position.set(
    jogador.x + (dx / d) * dados.guia.raio,
    0,
    jogador.z + (dz / d) * dados.guia.raio
  );
  setaGuia.rotation.y = Math.atan2(-dx, -dz);
}

// ---- a cada quadro ----

function resolverColisoes(corpo, comPontos) {
  lugar.casas.forEach((c) => empurrarDeCaixa(corpo, c, dados.raioColisaoCasa));
  lugar.solidos.forEach((s) => empurrarDeCirculo(corpo, s.x, s.z, s.raio));
  if (comPontos) {
    lugar.pontos.forEach((p) => {
      if (p.ponei) empurrarDeCirculo(corpo, p.dados.x, p.dados.z, dados.raioColisao);
      if (p.bau) empurrarDeCirculo(corpo, p.dados.x, p.dados.z, dados.raioColisaoBau);
    });
  }
  const l = lugar.limites;
  corpo.x = Math.max(l.minX, Math.min(l.maxX, corpo.x));
  corpo.z = Math.max(l.minZ, Math.min(l.maxZ, corpo.z));
}

function moverJogador(dt) {
  const direcao = controles.ler();
  const suave = 1 - Math.exp(-dados.aceleracao * dt);
  jogador.vx += (direcao.x * dados.velocidade - jogador.vx) * suave;
  jogador.vz += (direcao.z * dados.velocidade - jogador.vz) * suave;
  jogador.x += jogador.vx * dt;
  jogador.z += jogador.vz * dt;
  resolverColisoes(jogador, true);
}

function moverAcompanhante(dt) {
  if (!acompanhante) return;
  const a = acompanhante;
  const dx = jogador.x - a.x;
  const dz = jogador.z - a.z;
  const d = Math.hypot(dx, dz) || 1;
  const sobra = d - dados.acompanhante.distancia;
  const rapidez = sobra > 0 ? Math.min(dados.velocidade * 1.15, sobra * 5) : 0;
  const suave = 1 - Math.exp(-dados.aceleracao * dt);
  a.vx += ((dx / d) * rapidez - a.vx) * suave;
  a.vz += ((dz / d) * rapidez - a.vz) * suave;
  a.x += a.vx * dt;
  a.z += a.vz * dt;
  resolverColisoes(a, false);

  a.ponei.grupo.position.set(a.x, 0, a.z);
  a.ponei.olharPara(jogador.x);
  a.ponei.atualizar(dt, a.vx, a.vz, dados.velocidade, palco.camera);
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
  let altura = d.altura || 1.6;
  if (pontoPerto.ponei) altura = dados.alturaPonei + 0.5;
  if (pontoPerto.bau) altura = ALTURA_BALAO_BAU;
  naTela.set(d.x, altura, d.z).project(palco.camera);
  el.balao.style.left = ((naTela.x + 1) / 2) * el.overlay.clientWidth + "px";
  el.balao.style.top = ((1 - naTela.y) / 2) * el.overlay.clientHeight + "px";
}

function atualizarArea() {
  if (lugar !== mundoAberto) return;
  const distancia = (a) => Math.hypot(a.x - jogador.x, a.z - jogador.z);
  if (areaAtual) {
    if (distancia(areaAtual) > areaAtual.raio * MARGEM_SAIDA_AREA) areaAtual = null;
    return;
  }
  areaAtual = dados.areas.find((a) => distancia(a) < a.raio) || null;
  if (areaAtual) Interface.mostrarPlaca(areaAtual.nome);
}

function atualizarNuvens(dt) {
  const limite = dados.tamanho;
  nuvens.forEach((n) => {
    n.position.x += n.userData.velocidade * dt;
    if (n.position.x > limite) n.position.x = -limite;
  });
}

function atualizar(dt) {
  moverJogador(dt);
  protagonista.grupo.position.set(jogador.x, 0, jogador.z);
  palco.seguir(jogador, dt);
  protagonista.atualizar(dt, jogador.vx, jogador.vz, dados.velocidade, palco.camera);
  moverAcompanhante(dt);

  atualizarPontoPerto();
  atualizarArea();
  lugar.pontos.forEach((p) => {
    if (p.bau) p.bau.atualizar(dt, p === pontoPerto);
    if (!p.ponei) return;
    if (p === pontoPerto) p.ponei.olharPara(jogador.x);
    p.ponei.atualizar(dt, 0, 0, dados.velocidade, palco.camera);
  });
  lugar.casas.forEach((c) => atualizarOpacidade(c, jogador, palco.camera.position, dt));
  if (lugar === mundoAberto) atualizarNuvens(dt);
  atualizarSetaGuia();
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

function mostrarAviso(texto) {
  el.aviso.textContent = texto;
  el.aviso.hidden = false;
  clearTimeout(timerAviso);
  timerAviso = setTimeout(() => {
    el.aviso.hidden = true;
  }, TEMPO_AVISO_MS);
}

function interagir() {
  if (!ativo || !pontoPerto) return;
  if (performance.now() - inicioTela < ESPERA_INICIAL_MS) return;
  const ponto = pontoPerto.dados;
  if (ponto.exige && !estado.conversou[ponto.exige]) {
    Musica.efeito("trancado");
    mostrarAviso(ponto.trancada);
    return;
  }
  if (ponto.fim) {
    Musica.efeito("passagem");
    parar();
    if (aoChegarNoFim) aoChegarNoFim();
    return;
  }
  if (ponto.destino) {
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
  atualizarDestino();
  controles.ligar();
  ativo = true;
  inicioTela = ultimoT = performance.now();
  if (rafId == null) rafId = requestAnimationFrame(quadro);
}

// ---- API usada por main.js ----

// opcoes: { sprite, aoInteragir(ponto) (pônei ou baú), aoChegarNoFim() (a porta da festa) }
export async function iniciar(opcoes) {
  if (!palco) montar();
  el.overlay.hidden = false; // o canvas precisa ter tamanho
  if (!mundoAberto) mundoAberto = await criarMundo();
  await colocarProtagonista(opcoes.sprite);
  aoInteragir = opcoes.aoInteragir;
  aoChegarNoFim = opcoes.aoChegarNoFim;
  irPara(mundoAberto, mundoAberto.entrada);
  ligar();
}

// volta de um diálogo ou do baú: a protagonista continua onde estava
export function retomar() {
  ligar();
}

// tira um ponto do lugar atual (baú já aberto some do mapa, como no 2D)
export function removerPonto(id) {
  const p = lugar.pontos.find((q) => q.dados.id === id);
  if (!p) return;
  lugar.pontos.splice(lugar.pontos.indexOf(p), 1);
  (p.bau || p.ponei).grupo.removeFromParent();
  if (pontoPerto === p) {
    pontoPerto = null;
    el.balao.hidden = true;
    el.acao.hidden = true;
  }
}

// uma pônei passa a andar junto com a protagonista
export async function acompanhar(id) {
  const imagem = await carregarImagem(PERSONAGENS[id].sprite);
  acompanhante = { ponei: new PoneiPapel(imagem, dados.alturaPonei), x: 0, z: 0, vx: 0, vz: 0 };
  colocarAcompanhante();
}

export function parar() {
  ativo = false;
  if (rafId != null) cancelAnimationFrame(rafId);
  rafId = null;
  if (controles) controles.desligar();
}

export function esconder() {
  parar();
  if (el) {
    el.overlay.hidden = true;
    el.aviso.hidden = true;
  }
}

export function posicaoJogador() {
  return { x: jogador.x, z: jogador.z };
}

// leva a protagonista direto a um ponto do lugar atual (usado nos testes automáticos)
export function teleportar(x, z) {
  jogador.x = x;
  jogador.z = z;
  jogador.vx = jogador.vz = 0;
  colocarAcompanhante();
  palco.seguir(jogador, null);
}

// números do renderer (usado nos testes de desempenho)
export function infoRender() {
  return palco.info();
}

export function lugarAtual() {
  return lugar ? lugar.nome : null;
}
