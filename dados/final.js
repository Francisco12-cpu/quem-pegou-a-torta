// final.js — textos das telas de fechamento: "Caso resolvido" (depois da revelação) e a
// tela de conclusão. As pistas aparecem com o texto abaixo, na ordem em que foram achadas.

var CASO_RESOLVIDO = {
  culpada: "applejack",
  titulo: "Caso resolvido",
  frase: "Desculpa! Eu tava morrendo de fome...",
  motivo:
    "Depois de descarregar as cestas de maçã da fazenda, passou pela confeitaria, sentiu o cheiro da torta e comeu tudo — sem saber que era para a própria festa surpresa.",
};

// suspeita (chave de estado.pistas) -> id em PERSONAGENS
var SUSPEITAS = {
  twilight: "twilight",
  rarity: "rarity",
  rainbowDash: "rainbow-dash",
  fluttershy: "fluttershy",
};

// chave da pista -> o que ela parecia, e o que era de verdade
var TEXTO_PISTAS = {
  "lista-com-a-letra-dela-na-confeitaria": "A lista da Twilight na confeitaria era só a organização da festa.",
  "vista-com-cesta-de-tecidos": "A cesta enorme da Rarity estava cheia de tecidos e fitas.",
  "vulto-colorido-saindo-pelos-fundos": "O vulto colorido nos fundos era a Rainbow Dash de passagem.",
  "admitiu-ter-voado-perto-da-confeitaria": "A Rainbow Dash voou perto da confeitaria para comprar discos.",
  "dando-migalhas-pros-bichinhos": "As migalhas da Fluttershy eram de cookies, não de torta.",
};

var TEXTOS_FIM = {
  titulo: "Missão cumprida!",
  subtitulo: "O mistério da torta foi resolvido — e a amizade saiu mais forte.",
  subtitulo100: "Com os quatro ingredientes, a festa ganhou uma torta nova, feita por todas juntas.",
  selo100: "100% completo",
};
