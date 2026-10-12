// protagonistas.js — quem o jogador pode escolher na tela "Escolha seu personagem".
// O escolhido vira PERSONAGENS.protagonista (sprite + cor do nome no diálogo); o NOME continua
// sendo o que o jogador digita na tela seguinte.
//
//   id         — identificador (salvo na sessão)
//   nome       — nome do personagem, mostrado no card da escolha
//   categoria  — "masculino" ou "feminino" (a escolha filtra por ela, ver CATEGORIAS_PROTAGONISTA)
//   sprite     — gerado por ferramentas/preparar-assets.py em assets/sprites/protagonistas/
//                (pra trocar a arte, basta substituir o PNG com o mesmo nome)
//   cor        — cor do nome dele na caixa de diálogo
//   tracos     — 3 frases curtas mostradas na ficha (vêm da ficha de personagens do autor)
//   disponivel — false = aparece apagado, com "Em breve", e não pode ser escolhido
//
// Pra adicionar alguém: coloque o PNG em assets/sprites/protagonistas/ e acrescente uma linha.
// Falas que mudam com o gênero usam {feminino|masculino} — ex.: "fizemos {juntas|juntos}".

var CATEGORIAS_PROTAGONISTA = [
  { id: "masculino", rotulo: "Masculino" },
  { id: "feminino", rotulo: "Feminino" },
];

var PROTAGONISTAS = [
  {
    id: "kael",
    nome: "Kael",
    categoria: "masculino",
    sprite: "assets/sprites/protagonistas/kael.png",
    cor: "#7fdcf0",
    tracos: ["Inventor e curioso", "Calmo e observador", "Gosta de tecnologia"],
  },
  {
    id: "riven",
    nome: "Riven",
    categoria: "masculino",
    sprite: "assets/sprites/protagonistas/riven.png",
    cor: "#f08a6c",
    tracos: ["Aventureiro e livre", "Animado e prestativo", "Ama explorar"],
  },
  {
    id: "caramelo",
    nome: "Caramelo",
    categoria: "masculino",
    sprite: "assets/sprites/protagonistas/caramelo.png",
    cor: "#e9b77a",
    tracos: ["Rápido como um raio", "Sempre de bom humor", "Adora um desafio"],
  },
  {
    id: "liria",
    nome: "Líria",
    categoria: "feminino",
    sprite: "assets/sprites/protagonistas/liria.png",
    cor: "#ff9a6b",
    tracos: ["Sonhadora e criativa", "Gentil e determinada", "Ama a natureza"],
  },
  {
    id: "nyx",
    nome: "Nyx",
    categoria: "feminino",
    sprite: "assets/sprites/protagonistas/nyx.png",
    cor: "#c9bfe6",
    tracos: ["Misteriosa e reservada", "Inteligente e observadora", "Prefere a noite"],
  },
  {
    id: "lavanda",
    nome: "Lavanda",
    categoria: "feminino",
    sprite: "assets/sprites/protagonistas/lavanda.png",
    cor: "#e7a6f0",
    tracos: ["Doce e brincalhona", "Coleciona estrelas", "Não perde uma festa"],
  },
  // PERSONAGEM SECRETO: aparece como card "???" trancado. Destrava tocando `toques` vezes na
  // estrelinha ciano escondida no fundo da tela de escolha. Só vale até recarregar a página:
  // recarregou, some de novo e tem que descobrir outra vez.
  //   dica          — aparece ao tocar no card trancado
  //   aviso         — texto do efeito de "hackeado" ao destravar
  //   nomeSugerido  — já vem escrito na tela do nome (e libera usar o nome do criador)
  //   modoCriador   — mostra os botões "Forçar vitória/falha" no baú, até no site publicado
  {
    id: "audir",
    nome: "Audir",
    categoria: "masculino",
    sprite: "assets/sprites/protagonistas/audir.png",
    cor: "#5fe3f0",
    tracos: ["Nautilus", "Rei amarelo", "Zedin"],
    secreto: {
      dica: "Siga o coelho branco...",
      toques: 5,
      aviso: "Acesso liberado",
      nomeSugerido: "Audir",
      modoCriador: true,
    },
  },
];

// quem vem marcado da primeira vez (e quem é usado se o jogo pular a escolha)
var PROTAGONISTA_PADRAO = "liria";
