// cena-04-rainbow-dash.js — conteúdo adaptado do ROTEIRO.md v2.

var CENA_04_RAINBOW_DASH = {
  id: "cena-04-rainbow-dash",
  fundo: "casa-rainbow-dash",
  falas: [
    {
      quemFala: "narrador",
      texto: "Uma música alta ecoa antes da porta se abrir — e diminui assim que {nome} entra.",
    },
    { quemFala: "rainbow-dash", lado: "esquerda", texto: "Hã? Pinkie? O que vocês estão fazendo aqui?" },
    { quemFala: "pinkie", lado: "direita", texto: "A TORTA SUMIU!" },
    { quemFala: "rainbow-dash", lado: "esquerda", texto: "Ah... essa torta. Não, eu não peguei!" },
    { quemFala: "protagonista", texto: "Rarity disse que viu um vulto colorido saindo da confeitaria." },
    {
      quemFala: "rainbow-dash",
      lado: "esquerda",
      texto:
        "Isso provavelmente fui eu — passei voando por lá pra comprar discos de música country pra festa da Applejack. Não peguei torta nenhuma!",
    },
    { pista: { suspeita: "rainbowDash", chave: "admitiu-ter-voado-perto-da-confeitaria" } },
    // [EXPANDIR — ROTEIRO.md]: Rainbow Dash se ofende, provoca a protagonista ou conta uma proeza de voo.
    {
      quemFala: "rainbow-dash",
      lado: "esquerda",
      texto:
        "Ei, só porque eu voo rápido não quer dizer que eu roubo tortas no caminho! Aliás, você viu o rolo que eu dei hoje de manhã? Nem o vento me alcançou.",
    },
    { quemFala: "protagonista", texto: "Impressionante. Mas ainda precisamos saber sobre a torta." },
    { quemFala: "rainbow-dash", lado: "esquerda", texto: "Tá, tá, sem graça vocês. Voltando ao assunto..." },
    {
      escolha: true,
      decorativa: true,
      tempoLimite: 15,
      opcoes: [
        { texto: "Você viu alguém suspeito?", proximaFala: "rainbowdash-viu-fluttershy" },
        { texto: "Tá, mas alguma pista?", proximaFala: "rainbowdash-viu-fluttershy" },
      ],
    },
    {
      id: "rainbowdash-viu-fluttershy",
      quemFala: "rainbow-dash",
      lado: "esquerda",
      texto:
        "Não vi quem pegou a torta, mas vi a Fluttershy alimentando uns bichinhos com umas migalhas... pareciam migalhas de torta.",
    },
    { pista: { suspeita: "fluttershy", chave: "dando-migalhas-pros-bichinhos" } },
    { quemFala: "pinkie", lado: "direita", texto: "Fluttershy?!" },
  ],
};
