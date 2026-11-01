// final-3d.js — falas do final na versão 3D. O 2D continua usando as cenas 06, 07 e 08 inteiras;
// aqui a discussão vira conversas soltas (o jogador anda até cada pônei) e a acusação é montada
// a partir das falas da cena 06. Quem conduz a sequência é js/final-3d.js.

var FINAL_3D = {
  objetivos: {
    conversar: "Converse com todas na festa",
    acusar: "Ande até quem você acha que pegou a torta",
  },
  rotuloAcusar: "Acusar",
  rotuloNenhuma: "Nenhuma delas",

  // uma conversa por pônei, na primeira vez que o jogador fala com ela
  conversas: {
    pinkie: [
      { quemFala: "pinkie", lado: "direita", texto: "Estamos sem tempo! E a torta continua desaparecida!" },
      { quemFala: "pinkie", lado: "direita", texto: "Vocês estão começando a me deixar nervosa!" },
    ],
    twilight: [
      { quemFala: "twilight", lado: "esquerda", texto: "Talvez tenha sido Rainbow Dash!" },
      {
        quemFala: "twilight",
        lado: "esquerda",
        texto: "Só estou dizendo que ela é rápida o bastante pra sumir com qualquer coisa antes que alguém percebesse!",
      },
    ],
    rarity: [
      { quemFala: "rarity", lado: "esquerda", texto: "Ou talvez alguém tenha escondido a torta!" },
      { quemFala: "rarity", lado: "esquerda", texto: "Meninas, por favor, isso não está ajudando em nada!" },
    ],
    "rainbow-dash": [
      { quemFala: "rainbow-dash", lado: "direita", texto: "O quê?! Eu já expliquei!" },
      { quemFala: "rainbow-dash", lado: "direita", texto: "E a Twilight, hein? Rápida pra inventar uma desculpa ela é!" },
    ],
    fluttershy: [
      { quemFala: "fluttershy", lado: "direita", texto: "Gente... será que dava pra parar de gritar?" },
      { quemFala: "rainbow-dash", lado: "esquerda", texto: "Ninguém tá gritando, Fluttershy, só estamos... discutindo. Alto." },
    ],
  },

  // se falar de novo com alguém, antes da hora de acusar
  repetidas: {
    pinkie: "Rápido, rápido, rápido! A festa já vai começar!",
    twilight: "Eu fiz uma lista de suspeitas. Mas ela está ficando grande demais...",
    rarity: "Que situação mais deselegante, querida.",
    "rainbow-dash": "Fala com as outras, eu não tenho nada a esconder!",
    fluttershy: "Desculpa... eu só queria que todo mundo ficasse bem.",
  },

  // depois de falar com todas
  horaDeAcusar: [
    { quemFala: "narrador", texto: "A discussão só aumenta, e ninguém mais se escuta." },
    { quemFala: "protagonista", texto: "Assim não dá. Tá na hora de dizer em voz alta quem eu acho que foi." },
  ],

  // com os 4 ingredientes, de volta ao mundo aberto
  consegui: [
    { quemFala: "protagonista", texto: "Ah... eu consegui! Guardei tudo isso pelo caminho, na casa de cada uma!" },
    { quemFala: "protagonista", texto: "Farinha, maçã, canela e mel. Dá pra fazer outra torta!" },
  ],

  // depois que a torta aparece no meio da tela
  tortaPronta: [
    { quemFala: "pinkie", lado: "esquerda", texto: "Você guardou tudo isso?!" },
    { quemFala: "applejack", lado: "direita", texto: "Vocês... fizeram outra torta?" },
    { quemFala: "pinkie", lado: "esquerda", texto: "Melhor: fizemos {JUNTAS|JUNTOS}!" },
    { quemFala: "fluttershy", lado: "direita", texto: "E ainda está quentinha..." },
    { quemFala: "applejack", lado: "direita", texto: "Agora sim essa festa tá completa. Vamos comemorar!" },
    {
      quemFala: "narrador",
      texto:
        "E assim, além da amizade, a festa da Applejack ganhou uma torta novinha em folha — feita com um pouquinho de cada {amiga|amigo}.",
    },
  ],
};

// id da pônei -> chave da suspeita (a Pinkie não é suspeita: falar com ela é "nenhuma delas")
function suspeitaDaPonei(idPonei) {
  var chave = null;
  Object.keys(SUSPEITAS).forEach(function (k) {
    if (SUSPEITAS[k] === idPonei) chave = k;
  });
  return chave;
}

// A acusação usa as falas da cena 06: a reação, a negativa e o "CHEGA!" até os pedidos de
// desculpa (a última fala, dos passos chegando, vira a cena da Applejack entrando).
function falasDeAcusacao(suspeita) {
  var todas = CENA_06_CONFRONTO.falas;
  function porId(id) {
    return todas.filter(function (f) {
      return f.id === id;
    })[0];
  }
  var falas = suspeita ? [porId("reacao-" + suspeita), porId("nega-" + suspeita)] : [porId("reacao-nenhuma")];
  var inicio = todas.indexOf(porId("confronto-chega"));
  return falas.concat(todas.slice(inicio, todas.length - 1));
}
