// baus.js — config dos 4 baús + dificuldade crescente (formato exato de ARQUITETURA.md v2).
// Mecânica sempre a mesma (arrombar fechadura, extraída de mine game.html via
// engine-minigame.js) — só estes números mudam por casa.

var BAUS = {
  twilight: { casa: "twilight", rounds: 3, velocidadeMs: 900, errosPermitidos: 1, ingrediente: "farinha" },
  rarity: { casa: "rarity", rounds: 4, velocidadeMs: 750, errosPermitidos: 1, ingrediente: "maçã" },
  "rainbow-dash": { casa: "rainbow-dash", rounds: 4, velocidadeMs: 600, errosPermitidos: 0, ingrediente: "canela" },
  fluttershy: { casa: "fluttershy", rounds: 5, velocidadeMs: 600, errosPermitidos: 0, ingrediente: "mel" },
};
