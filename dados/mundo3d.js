// mundo3d.js — configuração do mundo 3D "pop-up book" (js/mundo3d/ só lê estes números).
// Unidades: 1 = mais ou menos um casco. A protagonista tem `alturaPonei` de altura.

var MUNDO3D = {
  nome: "Ponyville",
  tamanho: 120, // largura e profundidade da área andável (centro em 0, 0)
  inicio: { x: 0, z: 0 },
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

  raioInteracao: 3.4, // distância pra poder falar com uma pônei
  raioColisao: 1.1, // a protagonista não atravessa as pôneis

  raioColisaoCasa: 0.9, // folga entre a protagonista e as paredes

  raioColisaoBau: 1.3,

  // Áreas com nome: ao entrar a pé aparece a plaquinha do lugar. `chao` (opcional) desenha um
  // círculo de cartolina no chão, com a borda em `corBorda`.
  areas: [{ nome: "Praça de Ponyville", x: -24, z: -12, raio: 11, chao: "#efe2c6", corBorda: "#d8c39c" }],

  // o que fica solto no mundo:
  //   tipo "ponei" — `tela` = id em dados/casas.js de onde vêm o diálogo e a fala repetida
  //   tipo "bau"   — `bau` = chave em dados/baus.js
  // O baú da Twilight fica na praça só até a biblioteca existir (etapa 5).
  pontos: [{ id: "bau-twilight", tipo: "bau", bau: "twilight", x: -24, z: -13 }],

  // As casas: mude `x`, `z` e `giro` para colocá-las onde quiser, sem mexer no motor.
  //   tipo     — desenho da casa (funções em js/mundo3d/casas-papel.js)
  //   giro     — graus; 0 = porta virada para a câmera. Use de -90 a 90: a câmera não gira,
  //              então uma porta virada para o fundo ficaria escondida.
  //   interior — a sala: `fundo` é o cenário pintado, `pontos` são as pôneis lá dentro
  casas: [
    {
      id: "confeitaria",
      tipo: "confeitaria",
      placa: "Confeitaria",
      x: 6,
      z: -25,
      giro: 0,
      interior: {
        nome: "Confeitaria da Pinkie",
        fundo: "assets/cenarios/cozinha-pinkie.png",
        corChao: "#aa6433",
        corParede: "#e8d3bd",
        pontos: [{ id: "pinkie", tipo: "ponei", tela: "confeitaria", x: 3, z: -1.6 }],
      },
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
