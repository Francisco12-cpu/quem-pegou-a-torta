// mundo3d.js — configuração do mundo 3D "pop-up book" (js/mundo3d/ só lê estes números).
// Unidades: 1 = mais ou menos um casco. A protagonista tem `alturaPonei` de altura.

var MUNDO3D = {
  nome: "Ponyville",
  tamanho: 120, // largura e profundidade da área andável (centro em 0, 0)
  inicio: { x: 0, z: 46 },
  velocidade: 8, // unidades por segundo
  aceleracao: 10, // quão rápido chega na velocidade (maior = mais seco)
  alturaPonei: 2.7,

  camera: {
    fov: 42, // em tela deitada; em tela em pé abre até `fovMaximo`
    fovMaximo: 60,
    altura: 5.2, // acima do chão
    distancia: 12.5, // atrás da protagonista
    olharAltura: 2.5, // altura do ponto para onde a câmera olha
    suavidade: 5, // maior = segue mais colada
  },

  ceu: "#bfe8ff",
  neblina: { perto: 45, longe: 95 },

  chao: {
    cor: "#8fd468",
    corClara: "#a4e07a",
    corEscura: "#7cc45a",
    ladrilho: 18, // tamanho, em unidades, de cada repetição da textura
  },

  // tufinhos de grama e flores soltas; `flores` = fração que é flor (o resto é capim)
  tufos: { quantidade: 900, flores: 0.55, semente: 7 },
  // grupinhos de flores (cada um com uma ou duas cores)
  canteiros: { quantidade: 110, flores: 11, raio: 2.6, semente: 11 },

  // `folga`: distância mínima das casas (das trilhas é metade); `passoBorda`: distância entre
  // as árvores do anel que fecha o mapa; `dissolve...`: perto da câmera a árvore some em
  // pontinhos, pra nunca tapar a pônei (a câmera fica a uns 13 de distância dela)
  arvores: {
    quantidade: 55,
    semente: 21,
    folga: 7,
    passoBorda: 5,
    raioColisao: 0.8,
    dissolvePerto: 8,
    dissolveLonge: 13,
  },
  nuvens: { quantidade: 12, altura: 24 },
  morros: { quantidade: 12, raio: 118, cores: ["#a8d8a0", "#b9e2c8"] },
  fonte: { x: 0, z: -2, raio: 2.4 },

  raioInteracao: 3.4, // distância pra poder interagir
  raioColisao: 1.1, // a protagonista não atravessa as pôneis
  raioColisaoCasa: 0.9, // folga entre a protagonista e as paredes
  raioColisaoBau: 1.3,

  acompanhante: { distancia: 2.6 }, // quão atrás a Pinkie anda (ACOMPANHANTE em dados/casas.js)

  // A seta do chão aponta para o próximo destino e some ao chegar perto.
  guia: { raio: 2.3, somePerto: 7 },

  // Áreas com nome: ao entrar a pé aparece a plaquinha do lugar. `chao` (opcional) desenha um
  // círculo de cartolina no chão, com a borda em `corBorda`.
  areas: [{ nome: "Praça de Ponyville", x: 0, z: -2, raio: 11, chao: "#efe2c6", corBorda: "#d8c39c" }],

  // Trilhas de terra: cada linha é uma lista de pontos [x, z]. Se mudar uma casa de lugar,
  // ajuste aqui a trilha até a porta dela.
  caminhos: {
    cor: "#e6cd9c",
    largura: 3,
    lista: [
      [[0, 46], [8, 34], [10, 30], [22, 30], [22, 12], [7, 2]],
      [[-28, 14.5], [-18, 8], [-7, 2]],
      [[-39, -16], [-24, -9], [-8, -3]],
      [[-4, -24], [-2, -8]],
      [[42, -30], [24, -16], [7, -5]],
      [[16.7, -44], [14, -28], [4, -9]],
    ],
  },

  // o que fica solto no mundo:
  //   tipo "ponei" — `tela` = id em dados/casas.js de onde vêm o diálogo e a fala repetida
  //   tipo "bau"   — `bau` = chave em dados/baus.js
  pontos: [],

  // As casas, NA ORDEM da investigação: o jogo sempre aponta a primeira que falta visitar.
  // Mude `x`, `z` e `giro` para colocá-las onde quiser, sem mexer no motor.
  //   tipo     — desenho da casa (funções em js/mundo3d/casas-papel.js)
  //   tela     — id em dados/casas.js: de lá vêm o nome, a pônei e a fala de porta trancada
  //   exige    — id da pônei com quem é preciso ter conversado para a porta abrir
  //   giro     — graus; 0 = porta virada para a câmera. Use de -90 a 90: a câmera não gira,
  //              então uma porta virada para o fundo ficaria escondida.
  //   interior — a sala: `fundo` é o cenário pintado (sem ele, desenha o céu de nuvens),
  //              `pontos` são as pôneis e os baús lá dentro
  //   fim      — sem interior: passar pela porta encerra a exploração (vai para o confronto)
  casas: [
    {
      id: "confeitaria",
      tipo: "confeitaria",
      placa: "Confeitaria",
      tela: "confeitaria",
      x: 10,
      z: 24,
      giro: 0,
      interior: {
        fundo: "assets/cenarios/cozinha-pinkie.png",
        corChao: "#aa6433",
        corParede: "#e8d3bd",
        pontos: [{ id: "pinkie", tipo: "ponei", tela: "confeitaria", x: 3, z: -1.6 }],
      },
    },
    {
      id: "twilight",
      tipo: "biblioteca",
      placa: "Biblioteca",
      tela: "twilight",
      exige: "pinkie",
      x: -30,
      z: 8,
      giro: 20,
      interior: {
        fundo: "assets/cenarios/biblioteca-twilight.png",
        corChao: "#b13044",
        corParede: "#8b4044",
        pontos: [
          { id: "twilight", tipo: "ponei", tela: "twilight", x: 3, z: -1.6 },
          { id: "bau-twilight", tipo: "bau", bau: "twilight", x: -4.6, z: -1.8 },
        ],
      },
    },
    {
      id: "rarity",
      tipo: "boutique",
      placa: "Boutique",
      tela: "rarity",
      exige: "twilight",
      x: -42,
      z: -22,
      giro: 30,
      interior: {
        fundo: "assets/cenarios/atelie-rarity.png",
        corChao: "#ebdfeb",
        corParede: "#91b0c5",
        pontos: [
          { id: "bau-rarity", tipo: "bau", bau: "rarity", x: -4.6, z: -1.8 },
          { id: "rarity", tipo: "ponei", tela: "rarity", x: 3, z: -1.6 },
        ],
      },
    },
    {
      id: "rainbow-dash",
      tipo: "nuvem",
      placa: "Casa nas Nuvens",
      tela: "rainbow-dash",
      exige: "rarity",
      x: -4,
      z: -30,
      giro: 0,
      interior: {
        corChao: "#eef8ff",
        corParede: "#8fd0ef",
        pontos: [
          { id: "bau-rainbow-dash", tipo: "bau", bau: "rainbow-dash", x: -4.6, z: -1.8 },
          { id: "rainbow-dash", tipo: "ponei", tela: "rainbow-dash", x: 3, z: -1.6 },
        ],
      },
    },
    {
      id: "fluttershy",
      tipo: "chale",
      placa: "Chalé",
      tela: "fluttershy",
      exige: "rainbow-dash",
      x: 44,
      z: -36,
      giro: -25,
      interior: {
        fundo: "assets/cenarios/casa-fluttershy.png",
        corChao: "#97ba66",
        corParede: "#6f573b",
        pontos: [
          { id: "bau-fluttershy", tipo: "bau", bau: "fluttershy", x: -4.6, z: -1.8 },
          { id: "fluttershy", tipo: "ponei", tela: "fluttershy", x: 3, z: -1.6 },
        ],
      },
    },
    {
      id: "celeiro",
      tipo: "celeiro",
      placa: "Festa",
      nome: "Celeiro da Applejack",
      exige: "fluttershy",
      fim: true,
      x: 18,
      z: -50,
      giro: -15,
    },
  ],

  // medidas iguais em todas as salas
  interior: {
    largura: 18, // da parede do fundo (o cenário pintado)
    fundoZ: -4.5,
    frenteZ: 7,
    limites: { minX: -7.6, maxX: 7.6, minZ: -3.2, maxZ: 4 },
    entrada: { x: 0, z: 1.8 }, // onde a protagonista aparece ao entrar
    saida: { x: 0, z: 3.9, raio: 1.7 }, // o tapete da porta
    camera: {
      fov: 44,
      fovMaximo: 62,
      altura: 4.4,
      distancia: 10.5,
      olharAltura: 2.6,
      suavidade: 5,
      zFixo: 1.5,
      meiaLargura: 9,
    },
  },
};
