// casas.js — o "mapa" do jogo: a sequência de telas andáveis, na ordem em que a protagonista
// passa por elas. Movimento de plataforma 2D: ela só anda na horizontal, sobre a linha do
// chão de cada cenário; chegar na borda direita leva pra próxima tela, na esquerda volta.
// engine-exploracao.js só lê estes números — nunca inventa posição nenhuma.
//
// Campos de cada tela:
//   nome      — plaquinha que aparece ao entrar
//   fundo     — classe `fundo-<id>` de css/cenarios.css (imagens em 16:9)
//   chao      — altura dos cascos, em % da altura da imagem (0 = topo, 100 = base)
//   escala    — altura das pôneis, em % da altura da imagem
//   pontos    — pônei (`ponei`) ou baú (`bau`), só com posição x em % da largura.
//               `camada: "fundo"` desenha atrás da protagonista (ela passa na frente);
//               `camada: "frente"` desenha na frente (ela passa por trás).
//   dialogo   — cena de diálogo aberta ao interagir com a pônei
//   repetida  — fala curta se a protagonista voltar a falar com ela depois
//   exige     — id da pônei com quem é preciso conversar antes de seguir pela direita
//   trancada  — mensagem quando tenta seguir sem ter conversado

var TELAS = [
  {
    id: "confeitaria",
    nome: "Confeitaria da Pinkie",
    fundo: "cozinha-pinkie",
    chao: 94,
    escala: 30,
    pontos: [{ id: "pinkie", tipo: "ponei", x: 64, camada: "fundo" }],
    dialogo: function () {
      return CENA_01_CONFEITARIA;
    },
    repetida: { quemFala: "pinkie", texto: "O que está esperando? A torta não vai se achar sozinha!" },
    exige: "pinkie",
    trancada: "A Pinkie parece desesperada... melhor falar com ela primeiro.",
  },
  {
    id: "rua-1",
    nome: "Ruas de Ponyville",
    fundo: "rua-ponyville",
    chao: 91,
    escala: 30,
    pontos: [],
  },
  {
    id: "twilight",
    nome: "Biblioteca da Twilight",
    fundo: "biblioteca-twilight",
    chao: 90,
    escala: 30,
    pontos: [
      { id: "bau-twilight", tipo: "bau", bau: "twilight", x: 22, camada: "fundo" },
      { id: "twilight", tipo: "ponei", x: 62, camada: "fundo" },
    ],
    dialogo: function () {
      return CENA_02_TWILIGHT;
    },
    repetida: { quemFala: "twilight", texto: "Se quiser, eu faço uma lista organizada de todas as pistas pra você!" },
    exige: "twilight",
    trancada: "Ainda preciso conversar com a Twilight antes de ir embora.",
  },
  {
    id: "praca-1",
    nome: "Praça de Ponyville",
    fundo: "praca-ponyville",
    chao: 92,
    escala: 28,
    pontos: [],
  },
  {
    id: "rarity",
    nome: "Boutique Carrossel da Rarity",
    fundo: "atelie-rarity",
    chao: 90,
    escala: 30,
    pontos: [
      { id: "rarity", tipo: "ponei", x: 50, camada: "fundo" },
      { id: "bau-rarity", tipo: "bau", bau: "rarity", x: 82, camada: "fundo" },
    ],
    dialogo: function () {
      return CENA_03_RARITY;
    },
    repetida: { quemFala: "rarity", texto: "Querida, cuidado com os tecidos ao sair. São seda pura!" },
    exige: "rarity",
    trancada: "Ainda preciso conversar com a Rarity antes de ir embora.",
  },
  {
    id: "rua-2",
    nome: "Ruas de Ponyville",
    fundo: "rua-ponyville",
    chao: 91,
    escala: 30,
    pontos: [],
  },
  {
    id: "rainbow-dash",
    nome: "Casa nas Nuvens da Rainbow Dash",
    fundo: "casa-rainbow-dash",
    chao: 90,
    escala: 30,
    pontos: [
      { id: "bau-rainbow-dash", tipo: "bau", bau: "rainbow-dash", x: 26, camada: "fundo" },
      { id: "rainbow-dash", tipo: "ponei", x: 64, camada: "fundo" },
    ],
    dialogo: function () {
      return CENA_04_RAINBOW_DASH;
    },
    repetida: { quemFala: "rainbow-dash", texto: "Ainda aqui? Vai logo, antes que eu resolva o caso em dez segundos cravados!" },
    exige: "rainbow-dash",
    trancada: "Ainda preciso conversar com a Rainbow Dash antes de ir embora.",
  },
  {
    id: "praca-2",
    nome: "Praça de Ponyville",
    fundo: "praca-ponyville",
    chao: 92,
    escala: 28,
    pontos: [],
  },
  {
    id: "fluttershy",
    nome: "Chalé da Fluttershy",
    fundo: "casa-fluttershy",
    chao: 91,
    escala: 30,
    pontos: [
      { id: "fluttershy", tipo: "ponei", x: 46, camada: "fundo" },
      { id: "bau-fluttershy", tipo: "bau", bau: "fluttershy", x: 80, camada: "fundo" },
    ],
    dialogo: function () {
      return CENA_05_FLUTTERSHY;
    },
    repetida: { quemFala: "fluttershy", texto: "Boa sorte... e, hã, se não for incômodo, fechem a porta devagar, os coelhinhos estão dormindo." },
    exige: "fluttershy",
    trancada: "Ainda preciso conversar com a Fluttershy antes de ir embora.",
  },
  {
    id: "rua-3",
    nome: "A caminho da festa",
    fundo: "rua-ponyville",
    chao: 91,
    escala: 30,
    pontos: [],
  },
];

// Quem acompanha a protagonista andando pelo mapa depois da confeitaria (ela investiga junto
// com a Pinkie — ROTEIRO.md). Só efeito visual, não interage.
var ACOMPANHANTE = { id: "pinkie", aPartirDe: "rua-1" };
