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
    fov: 38, // em tela deitada; em tela em pé abre até `fovMaximo`
    fovMaximo: 60,
    altura: 5.2, // acima do chão
    distancia: 12.5, // atrás da protagonista
    olharAltura: 1.5, // altura do ponto para onde a câmera olha
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

  tufos: { quantidade: 220, semente: 7 }, // tufinhos de grama e flores espalhados
};
