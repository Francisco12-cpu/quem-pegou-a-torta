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

  // `folga`: distância mínima das casas (das trilhas é metade); `larguraFaixa` e `alturaFaixa`:
  // a faixa de árvores que fecha o mapa (uma textura só); `dissolve...`: perto da câmera a
  // árvore some em pontinhos, pra nunca tapar a pônei (a câmera fica a uns 13 dela)
  arvores: {
    quantidade: 55,
    semente: 21,
    folga: 7,
    tamanhoSetor: 30,
    larguraFaixa: 34,
    alturaFaixa: 8.5,
    raioColisao: 0.8,
    dissolvePerto: 8,
    dissolveLonge: 13,
  },
  nuvens: { quantidade: 12, altura: 24 },
  morros: { quantidade: 12, raio: 118, cores: ["#a8d8a0", "#b9e2c8"] },
  fonte: { x: 0, z: -2, raio: 2.4 },

  // Desempenho. Flores e árvores ficam em setores: o que está fora de vista não é desenhado.
  //   visao / visaoCurta — até onde se desenha flores e árvores
  //   escalas...         — pixels por ponto da tela, do melhor pro mais leve. Abaixo de
  //                        `fpsMinimo` o jogo desce um degrau sozinho.
  //   nivelVisaoCurta    — a partir deste degrau, usa a `visaoCurta`
  qualidade: {
    automatica: true,
    tamanhoSetor: 24,
    tufosNoCelular: 0.65,
    visao: 92,
    visaoCurta: 58,
    fpsMinimo: 26,
    janelaMedida: 2.5, // segundos
    escalasCelular: [1.5, 1.25, 1, 0.8],
    escalasComputador: [2, 1.5, 1, 0.8],
    nivelVisaoCurta: 2,
  },

  raioInteracao: 3.4, // distância pra poder interagir
  raioColisao: 1.1, // a protagonista não atravessa as pôneis
  raioColisaoCasa: 0.9, // folga entre a protagonista e as paredes
  raioColisaoBau: 1.3,
  raioColisaoMovel: 0.7,

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
  //   interior — a sala de papel: `largura` e `fundoZ` (tamanho, opcionais), `parede`, `piso`,
  //              `moveis` (peças do kit em js/mundo3d/moveis-papel.js; x e z no chão da sala,
  //              z mais negativo = mais perto da parede do fundo), `pontos` (pôneis e baús)
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
        // sala de papel: paredes, piso e móveis gerados por código (kit em moveis-papel.js)
        parede: {
          corA: "#ffe3ec",
          corB: "#fff5f7",
          corDetalhe: "#ffc2d6",
          corLambri: "#9fd9c8",
          corMoldura: "#fff3dc",
          lambri: 1.7, // altura do lambri
        },
        piso: { corA: "#ffd9e6", corB: "#fff7ea", corSombra: "#d9a9b8", ladrilho: 2.4 },
        moveis: [
          // parede do fundo, da esquerda para a direita
          { tipo: "geladeira", x: -8.4, z: -5.95 },
          { tipo: "pia", x: -3.7, z: -6.05 },
          { tipo: "janela", x: -3.7, y: 2.2, z: -6.93 },
          { tipo: "forno", x: 2.4, z: -6 },
          { tipo: "vitrine", x: 7.6, z: -6.2 },
          { tipo: "bandeirinhas", x: -3.4, y: 6.5, z: -6.92, largura: 10 },
          { tipo: "quadro", x: 5.05, y: 3.9, z: -6.94, largura: 0.9, altura: 1.2 },
          { tipo: "prateleira", x: -9.55, y: 3.4, z: -1.6, giro: 90, largura: 4.4 },
          { tipo: "prateleira", x: 9.55, y: 3.4, z: -0.6, giro: -90, largura: 4.4 },
          // meio da sala
          { tipo: "ilha", x: -2.9, z: -1.8 },
          { tipo: "tapete", x: 6, z: 0.4 },
          { tipo: "mesaRedonda", x: 6, z: 0.4 },
          { tipo: "banqueta", x: 3.9, z: 0.6 },
          { tipo: "banqueta", x: 7.7, z: 2, cor: "#8fd8c8" },
          { tipo: "vaso", x: -8.9, z: 1.2, cor: "#ffd479" },
        ],
        pontos: [{ id: "pinkie", tipo: "ponei", tela: "confeitaria", x: 3.2, z: -3.3 }],
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
        // a maior sala: pé-direito de árvore e estantes até o alto
        largura: 26,
        fundoZ: -8,
        corTapete: "#c8a2f0",
        parede: {
          corA: "#d9a86c",
          corB: "#cf9a5e",
          corDetalhe: "#c28a50",
          corLambri: "#8a5a3a",
          corMoldura: "#ffd479",
          lambri: 1.5,
        },
        piso: { tipo: "tabuas", corA: "#b87a4a", corB: "#a9693f", corSombra: "#7a4a2a", ladrilho: 5 },
        moveis: [
          { tipo: "estante", x: -10.5, z: -7.4, largura: 4.6, semente: 1 },
          { tipo: "estante", x: -5.8, z: -7.4, largura: 4.6, semente: 3 },
          { tipo: "janela", x: 0, y: 2.4, z: -7.93, cor: "#c8a2f0", corForte: "#8a5bd6" },
          { tipo: "estante", x: 5.8, z: -7.4, largura: 4.6, semente: 2 },
          { tipo: "estante", x: 10.5, z: -7.4, largura: 4.6, altura: 4.8, semente: 4 },
          { tipo: "escadaria", x: 11.3, z: -2.2 },
          { tipo: "quadro", x: 12.9, y: 5.2, z: 1.8, giro: -90 },
          { tipo: "tapete", x: -4, z: -2.2, raio: 3.4, cor: "#8a5bd6", corMeio: "#ffd479", corCentro: "#c8a2f0" },
          { tipo: "mesaDeLeitura", x: -4, z: -2.2 },
          { tipo: "banqueta", x: -6.5, z: -0.4, cor: "#8a5bd6" },
          { tipo: "banqueta", x: -1.6, z: -0.4, cor: "#8a5bd6" },
          { tipo: "globo", x: 2.2, z: -5.6 },
          { tipo: "poltrona", x: -11.2, z: -2.6, giro: 90 },
          { tipo: "pilhaDeLivros", x: -8.8, z: -5.3, quantos: 7 },
          { tipo: "pilhaDeLivros", x: 8.4, z: 0.5, quantos: 5 },
          { tipo: "planta", x: 8.6, z: -5.4 },
        ],
        pontos: [
          { id: "twilight", tipo: "ponei", tela: "twilight", x: 4.4, z: -3.2 },
          { id: "bau-twilight", tipo: "bau", bau: "twilight", x: -9.4, z: 1.2 },
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
        // sala de costura elegante: lilás, dourado e muito tecido
        largura: 23,
        fundoZ: -7,
        corTapete: "#c8a2f0",
        parede: {
          corA: "#ecdcf7",
          corB: "#f7effc",
          corDetalhe: "#d6bdf0",
          corLambri: "#a884d8",
          corMoldura: "#ffd479",
          lambri: 1.5,
        },
        piso: { corA: "#e6d6f7", corB: "#fbf7ff", corSombra: "#bda6d6", ladrilho: 2.6 },
        moveis: [
          { tipo: "espelho", x: -9.2, z: -6.85 },
          { tipo: "araraDeRoupas", x: -4, z: -6, largura: 5 },
          { tipo: "janela", x: -4, y: 3.8, z: -6.93, altura: 2.2, cor: "#e6d6f7", corForte: "#a884d8" },
          { tipo: "penteadeira", x: 1.9, z: -6.2 },
          { tipo: "provador", x: 8, z: -5.8 },
          { tipo: "rolosDeTecido", x: 10.9, z: -0.8, giro: -90 },
          { tipo: "tapete", x: -5, z: -1.5, raio: 3.1, cor: "#a884d8", corMeio: "#ffd479", corCentro: "#e6d6f7" },
          { tipo: "pedestal", x: -5, z: -1.5 },
          { tipo: "manequim", x: -5, y: 0.6, z: -1.5, cor: "#ff9ccd", corBusto: "#ff6fb0" },
          { tipo: "manequim", x: -10, z: -3.4, cor: "#8fc7ff", corBusto: "#4a9be8" },
          { tipo: "manequim", x: 5.1, z: -2.6, cor: "#ffd479", corBusto: "#f2b13c" },
          { tipo: "vaso", x: -10.4, z: 1.6, cor: "#a884d8" },
        ],
        pontos: [
          { id: "rarity", tipo: "ponei", tela: "rarity", x: 1.4, z: -3.4 },
          { id: "bau-rarity", tipo: "bau", bau: "rarity", x: 7.4, z: 1.2 },
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
        // a menor e mais simples: céu, nuvens e pouca coisa, bem do jeito dela
        largura: 17,
        fundoZ: -5.5,
        corTapete: "#5bc8f2",
        parede: {
          corA: "#bfe8ff",
          corB: "#d6f1ff",
          corDetalhe: "#ffffff",
          corLambri: "#ffffff",
          corMoldura: "#ffd479",
          lambri: 1.1,
        },
        piso: { tipo: "nuvens", corA: "#a9dcf7", corB: "#c4e9fb", corSombra: "#86c3e6", ladrilho: 7 },
        moveis: [
          { tipo: "camaDeNuvem", x: -4.6, z: -3.5 },
          { tipo: "janela", x: -4.6, y: 3.2, z: -5.43, altura: 2.4, largura: 3, cor: "#5bc8f2", corForte: "#4a9be8" },
          { tipo: "posterRaio", x: 0.5, y: 3.6, z: -5.45 },
          { tipo: "trofeus", x: 5, z: -4.8 },
          { tipo: "halteres", x: 7, z: -1.2 },
          { tipo: "nuvemPuff", x: -7.2, z: 1.8 },
          { tipo: "nuvemPuff", x: 6.9, z: 2.4, escala: 0.8 },
        ],
        pontos: [
          { id: "bau-rainbow-dash", tipo: "bau", bau: "rainbow-dash", x: -3.4, z: 0.6 },
          { id: "rainbow-dash", tipo: "ponei", tela: "rainbow-dash", x: 3.6, z: -2 },
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
        // aconchegante: madeira, verde, plantas e bichinhos
        largura: 20,
        fundoZ: -6.5,
        corTapete: "#a5d884",
        parede: {
          corA: "#e6f2c8",
          corB: "#f2f7dc",
          corDetalhe: "#c9e3a0",
          corLambri: "#c9a36e",
          corMoldura: "#fff3dc",
          lambri: 1.6,
        },
        piso: { tipo: "tabuas", corA: "#d9b478", corB: "#cca467", corSombra: "#9c7a4c", ladrilho: 5 },
        moveis: [
          { tipo: "planta", x: -8.4, z: -5.2 },
          { tipo: "sofa", x: -4.1, z: -5.1 },
          { tipo: "janela", x: -4.1, y: 2.7, z: -6.43, altura: 2.8, cor: "#a5d884", corForte: "#6fb04f" },
          { tipo: "lareira", x: 3.6, z: -5.8 },
          { tipo: "quadro", x: 8.2, y: 4, z: -6.43, cor: "#e6f2c8" },
          { tipo: "prateleira", x: 9.55, y: 3.3, z: -1, giro: -90 },
          { tipo: "tapete", x: -2.6, z: -1.6, raio: 2.8, cor: "#6fb04f", corMeio: "#fff3dc", corCentro: "#a5d884" },
          { tipo: "mesinha", x: -2.6, z: -1.6 },
          { tipo: "cesta", x: 7.6, z: -3.8 },
          { tipo: "cesta", x: -8, z: 0.4 },
          { tipo: "gaiola", x: -8.5, y: 6.5, z: -2.6 },
          { tipo: "planta", x: 8.5, z: 1.6, cor: "#d9a441" },
        ],
        pontos: [
          { id: "fluttershy", tipo: "ponei", tela: "fluttershy", x: 0.2, z: -3.4 },
          { id: "bau-fluttershy", tipo: "bau", bau: "fluttershy", x: 5.4, z: 1.6 },
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

  // medidas comuns das salas (largura e fundoZ podem mudar em cada casa)
  salaPapel: {
    largura: 20,
    altura: 8,
    fundoZ: -7,
    frenteZ: 8,
    maxZ: 4.4, // até onde se anda em direção à câmera
    entrada: { x: 0, z: 2.4 },
    saida: { x: 0, z: 4.3, raio: 1.7 },
    camera: {
      fov: 44,
      fovMaximo: 62,
      altura: 6,
      distancia: 11.5,
      olharAltura: 1.9,
      suavidade: 5,
      zFixo: 0.6,
      meiaLargura: 10,
    },
  },
};
