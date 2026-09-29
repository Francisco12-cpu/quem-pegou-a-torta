// cena-06-confronto.js — conteúdo adaptado do ROTEIRO.md v2.
//
// Acusação (item 6 da correção): as opções usam `suspeita` (não mais `reacao`/texto fixo).
// O motor (engine-dialogo.js) monta a reação pulando pra `reacao-<suspeita>` e depois
// `nega-<suspeita>` — os textos abaixo já citam as pistas reais registradas em
// estado.pistas ao longo do jogo (lista da Twilight, cesta da Rarity, voo da Rainbow Dash,
// migalhas da Fluttershy), como pede a ARQUITETURA.md.
//
// Aviso de arquitetura (confirmado com o autor): 5 pôneis discutem ao mesmo tempo aqui, mas
// o palco só tem 2 posições pra pôneis (a protagonista tem a dela própria, sempre visível).
// Cada fala nova ocupa um lado e substitui quem estava lá — só os 2 mais recentes ficam
// visíveis por vez.

var CENA_06_CONFRONTO = {
  id: "cena-06-confronto",
  fundo: "festa-decorada",
  falas: [
    { quemFala: "pinkie", lado: "direita", texto: "Estamos sem tempo! E a torta continua desaparecida!" },
    { quemFala: "twilight", lado: "esquerda", texto: "Talvez tenha sido Rainbow Dash!" },
    { quemFala: "rainbow-dash", lado: "direita", texto: "O quê?! Eu já expliquei!" },
    { quemFala: "rarity", lado: "esquerda", texto: "Ou talvez alguém tenha escondido a torta!" },
    { quemFala: "pinkie", lado: "direita", texto: "Vocês estão começando a me deixar nervosa!" },
    // [EXPANDIR — ROTEIRO.md]: a discussão cresce, bagunça de vozes, antes da acusação.
    {
      quemFala: "twilight",
      lado: "esquerda",
      texto: "Só estou dizendo que ela é rápida o bastante pra sumir com qualquer coisa antes que alguém percebesse!",
    },
    { quemFala: "rainbow-dash", lado: "direita", texto: "Ah, é? E você não é rápida o bastante pra inventar uma desculpa?" },
    { quemFala: "rarity", lado: "esquerda", texto: "Meninas, por favor, isso não está ajudando em nada!" },
    { quemFala: "fluttershy", lado: "direita", texto: "Gente... será que dava pra parar de gritar?" },
    { quemFala: "rainbow-dash", lado: "esquerda", texto: "Ninguém tá gritando, Fluttershy, só estamos... discutindo. Alto." },
    {
      escolha: true,
      decorativa: false,
      tempoLimite: 18,
      opcoes: [
        { texto: "Acusar Twilight", suspeita: "twilight" },
        { texto: "Acusar Rarity", suspeita: "rarity" },
        { texto: "Acusar Rainbow Dash", suspeita: "rainbowDash" },
        { texto: "Acusar Fluttershy", suspeita: "fluttershy" },
        { texto: "Acho que nenhuma delas...", suspeita: null },
      ],
      proximaFalaComum: "confronto-chega",
    },
    {
      id: "reacao-twilight",
      quemFala: "protagonista",
      texto: "Acho que foi você, Twilight... achamos uma lista com a sua letra bem onde a torta sumiu.",
    },
    {
      id: "nega-twilight",
      quemFala: "twilight",
      lado: "esquerda",
      texto: "O quê?! Eu só passei lá pra conferir os doces, eu já expliquei isso!",
    },
    {
      id: "reacao-rarity",
      quemFala: "protagonista",
      texto: "Rarity, alguém te viu saindo correndo da confeitaria com uma cesta enorme...",
    },
    {
      id: "nega-rarity",
      quemFala: "rarity",
      lado: "esquerda",
      texto: "Aquilo era só tecido e fita, eu juro!",
    },
    {
      id: "reacao-rainbowDash",
      quemFala: "protagonista",
      texto: "Rainbow Dash, você mesma admitiu que voou bem perto da confeitaria...",
    },
    {
      id: "nega-rainbowDash",
      quemFala: "rainbow-dash",
      lado: "direita",
      texto: "Eu só fui comprar uns discos! Eu nem gosto tanto assim de torta de maçã!",
    },
    {
      id: "reacao-fluttershy",
      quemFala: "protagonista",
      texto: "Fluttershy, a Rainbow te viu dando migalhas de torta pros bichinhos...",
    },
    {
      id: "nega-fluttershy",
      quemFala: "fluttershy",
      lado: "direita",
      texto: "Eram cookies! Eu juro que eram só cookies!",
    },
    {
      id: "reacao-nenhuma",
      quemFala: "protagonista",
      texto: "Na verdade... acho que nenhuma de vocês pegou. Tem alguma coisa que ainda não bate.",
    },
    {
      id: "confronto-chega",
      quemFala: "protagonista",
      texto:
        "CHEGA! Nós passamos o dia inteiro procurando a torta e, em vez de tentar resolver o problema juntas, estamos começando a culpar umas às outras. Não temos provas de que qualquer uma de vocês pegou a torta. Se continuarmos brigando, não vamos encontrar solução nenhuma.",
    },
    { quemFala: "twilight", lado: "esquerda", texto: "Você tem razão." },
    { quemFala: "rarity", lado: "direita", texto: "Eu me deixei levar." },
    { quemFala: "rainbow-dash", lado: "esquerda", texto: "Eu também." },
    { quemFala: "fluttershy", lado: "direita", texto: "Desculpem..." },
    { quemFala: "pinkie", lado: "esquerda", texto: "Eu só queria que tudo saísse perfeito..." },
    { quemFala: "narrador", texto: "Passos se aproximam — é Applejack, finalmente chegando à festa." },
  ],
};
