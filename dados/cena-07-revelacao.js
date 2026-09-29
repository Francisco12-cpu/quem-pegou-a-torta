// cena-07-revelacao.js — conteúdo adaptado do ROTEIRO.md v2.
// O recap pra Applejack agora é diálogo de verdade entre as personagens (era um parêntese
// resumindo a história na v1 — o próprio ROTEIRO.md v2 dá o exemplo exato de como reescrever).
// A checagem de `estado.ingredientes.length` continua em main.js, depois que essa cena termina.

var CENA_07_REVELACAO = {
  id: "cena-07-revelacao",
  fundo: "festa-decorada",
  falas: [
    { quemFala: "applejack", lado: "esquerda", texto: "Ué... o que está acontecendo aqui? E por que está tudo decorado?" },
    { quemFala: "pinkie", lado: "direita", texto: "Applejack... eu não consegui fazer a torta." },
    {
      quemFala: "protagonista",
      texto: "Applejack, antes de mais nada... a torta sumiu hoje mais cedo, da confeitaria da Pinkie.",
    },
    { quemFala: "pinkie", lado: "direita", texto: "E a gente passou o dia inteiro perguntando pra todo mundo se sabia de alguma coisa!" },
    { quemFala: "twilight", lado: "esquerda", texto: "Eu contei que passei por lá de manhã..." },
    { quemFala: "rarity", lado: "direita", texto: "E fui vista com uma cesta cheia de tecidos, o que não ajudou nada." },
    { quemFala: "rainbow-dash", lado: "esquerda", texto: "E eu tive que admitir que passei voando por perto." },
    { quemFala: "fluttershy", lado: "direita", texto: "E eu fui quem apareceu por último na lista, por causa das migalhas..." },
    { quemFala: "protagonista", texto: "Mas no fim, ninguém confessou. E é aí que a gente está." },
    // [EXPANDIR — ROTEIRO.md]: piadas internas do grupo, olhando a situação com humor.
    { quemFala: "twilight", lado: "esquerda", texto: "Em minha defesa, eu só estava tentando ajudar com uma lista de tarefas." },
    { quemFala: "rarity", lado: "direita", texto: "E eu só queria terminar a decoração a tempo — não tinha nada a ver com cestas suspeitas de verdade!" },
    { quemFala: "rainbow-dash", lado: "esquerda", texto: "Ei, pelo menos ninguém me acusou de roubar biscoito nenhum dessa vez." },
    {
      quemFala: "applejack",
      lado: "esquerda",
      texto: "Espera... HAHAHAHA! Vocês passaram o dia inteiro procurando a torta e ficaram desconfiando umas das outras?",
    },
    { quemFala: "rainbow-dash", lado: "direita", texto: "Basicamente..." },
    {
      quemFala: "applejack",
      lado: "esquerda",
      texto:
        "Ah, minhas amigas... acho que vocês estão esquecendo uma coisa: a torta não é a parte mais importante dessa festa. O que importa é todo o esforço que vocês fizeram pra me fazer feliz — organizaram a festa, decoraram, prepararam a música, treinaram os bichinhos. Tudo isso só pra mim. Uma festa pode não ser perfeita, mas se estamos juntas, já é especial.",
    },
    { quemFala: "fluttershy", lado: "direita", texto: "Isso é muito bonito..." },
    { quemFala: "rarity", lado: "esquerda", texto: "Concordo completamente." },
    { quemFala: "twilight", lado: "direita", texto: "Eu também." },
    { quemFala: "rainbow-dash", lado: "esquerda", texto: "Então... abraço em grupo?" },
    { quemFala: "pinkie", lado: "direita", texto: "ABRAÇO EM GRUPO!" },
    { quemFala: "narrador", texto: "O grupo inteiro se junta num abraço só." },
    { quemFala: "twilight", lado: "esquerda", texto: "Espera. Se nenhuma de nós pegou a torta..." },
    { quemFala: "rainbow-dash", lado: "direita", texto: "Então quem pegou?" },
    { quemFala: "narrador", texto: "Todos os olhares se viram pra Applejack." },
    {
      quemFala: "applejack",
      lado: "esquerda",
      texto:
        "Ah... bem... hoje cedo eu passei pela confeitaria da Pinkie. Tinha acabado de descarregar várias cestas de maçãs da fazenda, tava morrendo de fome, e vi aquela torta... tão cheirosa... eu comi.",
    },
    { quemFala: "pinkie", lado: "direita", texto: "A TORTA INTEIRA?!" },
    { quemFala: "applejack", lado: "esquerda", texto: "...Inteirinha." },
    { quemFala: "todas", texto: "APPLEJACK!!!" },
    { quemFala: "applejack", lado: "esquerda", texto: "Desculpa!" },
    {
      escolha: true,
      decorativa: true,
      tempoLimite: 15,
      opcoes: [
        { texto: "Rir junto com todo mundo", proximaFala: "revelacao-final" },
        { texto: "Balançar a cabeça, mas rindo também", proximaFala: "revelacao-final" },
      ],
    },
    {
      id: "revelacao-final",
      quemFala: "narrador",
      texto:
        "E assim, depois de uma longa investigação, muitas suspeitas e várias confusões, o mistério da torta finalmente foi resolvido. No fim, elas descobriram que uma amizade verdadeira vale muito mais do que qualquer torta.",
    },
  ],
};
