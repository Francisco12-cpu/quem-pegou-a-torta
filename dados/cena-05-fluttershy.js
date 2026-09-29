// cena-05-fluttershy.js — conteúdo adaptado do ROTEIRO.md v2.

var CENA_05_FLUTTERSHY = {
  id: "cena-05-fluttershy",
  fundo: "casa-fluttershy",
  falas: [
    {
      quemFala: "narrador",
      texto: "Fluttershy está no quintal, rodeada de bichinhos que ciscam ao redor dela.",
    },
    { quemFala: "fluttershy", lado: "esquerda", texto: "Olá, Pinkie... olá. Aconteceu alguma coisa?" },
    { quemFala: "protagonista", texto: "Estamos procurando uma torta que desapareceu da confeitaria." },
    {
      quemFala: "pinkie",
      lado: "direita",
      texto: "Rainbow Dash disse que viu você alimentando os bichinhos com migalhas.",
    },
    { quemFala: "fluttershy", lado: "esquerda", texto: "Eu... eu não peguei a torta." },
    // [EXPANDIR — ROTEIRO.md]: Fluttershy na defensiva, quase chorando, sendo tranquilizada.
    {
      quemFala: "fluttershy",
      lado: "esquerda",
      texto: "Eu juro que não fiz nada de errado! Por favor, não fiquem bravos comigo...",
    },
    { quemFala: "pinkie", lado: "direita", texto: "Fluttershy, ninguém tá bravo! A gente só quer entender o que aconteceu." },
    { quemFala: "protagonista", texto: "Isso mesmo. Respira fundo, tá tudo bem." },
    {
      escolha: true,
      decorativa: true,
      tempoLimite: 15,
      opcoes: [
        { texto: "Calma, ninguém tá te acusando.", proximaFala: "fluttershy-aliviada" },
        { texto: "Só queremos entender o que aconteceu.", proximaFala: "fluttershy-aliviada" },
      ],
    },
    {
      id: "fluttershy-aliviada",
      quemFala: "fluttershy",
      lado: "esquerda",
      texto:
        "Ah... que bom. Eu passei o dia treinando os animais pra uma apresentação especial na festa. As migalhas eram só cookies que eu dava pra eles.",
    },
    // [EXPANDIR — ROTEIRO.md]: mais uma troca sobre os animais dela ou a apresentação.
    {
      quemFala: "fluttershy",
      lado: "esquerda",
      texto:
        "O coelhinho Anjo já aprendeu a fazer uma reverência perfeita, e os passarinhos vão cantar juntos na hora do parabéns. Espero que a Applejack goste.",
    },
    { quemFala: "protagonista", texto: "Aposto que ela vai amar." },
  ],
};
