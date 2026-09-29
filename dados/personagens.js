// personagens.js — nome, cor, lado padrão e sprite de cada pônei
// `sprite` vem de assets/sprites/ (gerado por ferramentas/preparar-assets.py a partir das
// fotos do autor). Sem `sprite`, o motor desenha o placeholder CSS com `cor`.
// A protagonista usa um sprite gerado (Fluttershy recolorida em creme e castanho) até o autor
// mandar um próprio — basta substituir assets/sprites/protagonista.png (mesmo nome).
// `grupo: true` = fala coletiva (todas as pôneis presentes no palco falam juntas).

var PERSONAGENS = {
  protagonista: { nome: "Protagonista", cor: "#e9c39a", ladoPadrao: "direita", sprite: "assets/sprites/protagonista.png" },
  narrador: { nome: "", cor: "", ladoPadrao: null },
  todas: { nome: "Todas", cor: "#ffd479", ladoPadrao: null, grupo: true },
  pinkie: { nome: "Pinkie Pie", cor: "#ff6fb0", ladoPadrao: "esquerda", sprite: "assets/sprites/pinkie.png" },
  twilight: { nome: "Twilight Sparkle", cor: "#b89cff", ladoPadrao: "esquerda", sprite: "assets/sprites/twilight.png" },
  rarity: { nome: "Rarity", cor: "#e6d6f7", ladoPadrao: "esquerda", sprite: "assets/sprites/rarity.png" },
  "rainbow-dash": { nome: "Rainbow Dash", cor: "#5bc8f2", ladoPadrao: "esquerda", sprite: "assets/sprites/rainbow-dash.png" },
  fluttershy: { nome: "Fluttershy", cor: "#f5e26b", ladoPadrao: "esquerda", sprite: "assets/sprites/fluttershy.png" },
  applejack: { nome: "Applejack", cor: "#f2a65a", ladoPadrao: "esquerda", sprite: "assets/sprites/applejack.png" },
};
