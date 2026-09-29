// itens.js — nome, imagem e descrição dos itens do jogo (a torta e os ingredientes dos baús).
// As chaves dos ingredientes são as mesmas usadas em `baus.js` (campo `ingrediente`).

var ITENS = {
  torta: {
    nome: "Torta Surpresa da Applejack",
    descricao: "Receita secreta da família Apple, com cobertura de canela. Feita pela Pinkie a manhã inteira.",
    imagem: "assets/itens/torta.png",
  },
  farinha: { nome: "Farinha", descricao: "Um saquinho de farinha fininha.", imagem: "assets/itens/farinha.png" },
  "maçã": { nome: "Maçã", descricao: "Uma maçã bem vermelha, do pomar da Applejack.", imagem: "assets/itens/maca.png" },
  canela: { nome: "Canela", descricao: "Paus de canela amarrados com uma fita.", imagem: "assets/itens/canela.png" },
  mel: { nome: "Mel", descricao: "Um pote de mel docinho.", imagem: "assets/itens/mel.png" },
};

// ordem dos espaços no contador da tela
var ORDEM_INGREDIENTES = ["farinha", "maçã", "canela", "mel"];
