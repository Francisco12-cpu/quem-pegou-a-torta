// estado.js — estado do jogo, em memória, sem persistência entre sessões
// (formato de ARQUITETURA.md v2 — `pistas` é usado pela acusação e pela tela "Caso resolvido";
// `telaAtual`/`conversou`/`inicio` são da camada de exploração em plataforma)

var estado = {
  telaAtual: 0, // índice em TELAS (dados/casas.js)
  conversou: {}, // id da pônei -> true depois da conversa principal
  cenaDialogoAtual: null,
  historicoDialogo: [],
  pistas: { twilight: [], rarity: [], rainbowDash: [], fluttershy: [] },
  ordemPistas: [], // chaves na ordem em que foram achadas (tela "Caso resolvido")
  ingredientes: [],
  acusacaoEscolhida: null,
  inicio: null, // Date.now() ao apertar "Jogar"
  nomeJogador: null, // nome escolhido na tela "Escolha seu nome" (vale a sessão toda)
};
