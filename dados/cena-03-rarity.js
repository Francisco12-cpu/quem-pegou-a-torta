// cena-03-rarity.js — conteúdo adaptado do ROTEIRO.md v2.

var CENA_03_RARITY = {
  id: "cena-03-rarity",
  fundo: "atelie-rarity",
  falas: [
    {
      quemFala: "rarity",
      lado: "esquerda",
      texto: "Não, não... talvez esse tecido fique melhor ali... Oh! Pinkie Pie! Que surpresa!",
    },
    {
      quemFala: "pinkie",
      lado: "direita",
      texto: "Rarity, temos um problema! A torta da festa da Applejack desapareceu.",
    },
    {
      quemFala: "rarity",
      lado: "esquerda",
      texto:
        "A torta?! Twilight disse que me viu passando pela confeitaria com uma cesta — mas eu só carregava tecidos e fitas, não havia torta nenhuma ali dentro!",
    },
    // [EXPANDIR — ROTEIRO.md]: Rarity é dramática por natureza antes de ficar séria.
    {
      quemFala: "rarity",
      lado: "esquerda",
      texto: "Suspeita?! Eu, Rarity, suspeita de um crime tão bárbaro quanto roubar uma torta?! Isso é simplesmente inconcebível!",
    },
    { quemFala: "pinkie", lado: "direita", texto: "Ninguém tá te acusando, Rarity, só queremos saber o que você viu." },
    {
      quemFala: "rarity",
      lado: "esquerda",
      texto: "Certo, certo, me desculpem o drama. É que ando tensa com os últimos ajustes da decoração.",
    },
    {
      escolha: true,
      decorativa: true,
      tempoLimite: 15,
      opcoes: [
        { texto: "Você viu alguém mais?", proximaFala: "rarity-viu-vulto" },
        { texto: "Tem certeza que não tinha nada escondido?", proximaFala: "rarity-viu-vulto" },
      ],
    },
    {
      id: "rarity-viu-vulto",
      quemFala: "rarity",
      lado: "esquerda",
      texto:
        "Agora que mencionaram... vi um vulto colorido passando pelas portas dos fundos da confeitaria. Muito rápido, quase não consegui enxergar.",
    },
    { pista: { suspeita: "rainbowDash", chave: "vulto-colorido-saindo-pelos-fundos" } },
    { quemFala: "pinkie", lado: "direita", texto: "Rainbow Dash!" },
    { quemFala: "rarity", lado: "esquerda", texto: "Foi exatamente o que pensei." },
    // [EXPANDIR — ROTEIRO.md]: mais diálogo sobre a decoração ou desculpas da Rarity.
    {
      quemFala: "rarity",
      lado: "esquerda",
      texto:
        "Ainda bem que a decoração já está quase pronta — só falta terminar os últimos detalhes antes que alguém apareça achando que eu escondi uma torta em algum lugar.",
    },
    { quemFala: "protagonista", texto: "Prometo que não vamos revistar seus tecidos." },
    { quemFala: "rarity", lado: "esquerda", texto: "Que gentileza a sua." },
  ],
};
