// cena-02-twilight.js — conteúdo adaptado do ROTEIRO.md v2.
// O baú NÃO fica mais embutido no diálogo (isso mudou quando a camada de exploração entrou):
// agora ele é um ponto na sala (dados/casas.js) que o jogador anda até e encosta — ver
// main.js. O minigame obrigatório que existia aqui na v1 também foi removido.

var CENA_02_TWILIGHT = {
  id: "cena-02-twilight",
  fundo: "biblioteca-twilight",
  falas: [
    { quemFala: "twilight", lado: "esquerda", texto: "Pinkie? O que vocês estão fazendo aqui?" },
    { quemFala: "pinkie", lado: "direita", texto: "Twilight! Precisamos fazer algumas perguntas!" },
    { quemFala: "protagonista", texto: "A torta especial da festa da Applejack desapareceu." },
    { quemFala: "twilight", lado: "esquerda", texto: "A torta desapareceu?!" },
    { quemFala: "pinkie", lado: "direita", texto: "E encontramos uma lista sua na confeitaria!" },
    {
      quemFala: "twilight",
      lado: "esquerda",
      texto:
        "Ah, então é isso. Passei lá pra ver se a Pinkie tinha terminado os doces da festa.",
    },
    // [EXPANDIR — ROTEIRO.md]: personalidade da Twilight (organização excessiva, quase
    // estragou o segredo de nervosa).
    {
      quemFala: "twilight",
      lado: "esquerda",
      texto:
        "Ando meio nervosa, pra falar a verdade — passei a semana toda com uma lista de checklist pra não deixar escapar nenhum detalhe da festa. E quase estraguei o segredo falando sobre isso em voz alta outro dia!",
    },
    {
      quemFala: "protagonista",
      texto: "Uma lista de checklist pra uma festa surpresa? Isso não é meio contraditório?",
    },
    { quemFala: "twilight", lado: "esquerda", texto: "Eu sei, eu sei! Mas alguém precisava organizar tudo direito!" },
    {
      escolha: true,
      decorativa: true,
      tempoLimite: 15,
      opcoes: [
        { texto: "Mas você pegou a torta?", proximaFala: "twilight-explica" },
        { texto: "Você viu mais alguma coisa estranha?", proximaFala: "twilight-explica" },
      ],
    },
    {
      id: "twilight-explica",
      quemFala: "twilight",
      lado: "esquerda",
      texto:
        "Não, eu jamais faria isso! Mas... vi Rarity passando correndo pela confeitaria, carregando uma cesta cheia de tecidos e fitas.",
    },
    { pista: { suspeita: "rarity", chave: "vista-com-cesta-de-tecidos" } },
    { quemFala: "protagonista", texto: "Uma cesta grande o suficiente pra esconder uma torta?" },
    { quemFala: "twilight", lado: "esquerda", texto: "Talvez." },
    // [EXPANDIR — ROTEIRO.md]: mais 1-2 trocas antes da despedida.
    {
      quemFala: "protagonista",
      texto: "Tem certeza do que viu? Podia ter sido outra pônei com uma cesta parecida.",
    },
    {
      quemFala: "twilight",
      lado: "esquerda",
      texto:
        "Tenho, sim. Foi logo de manhã, bem na frente da porta da confeitaria — não dava pra confundir com ninguém.",
    },
  ],
};
