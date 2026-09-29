// cena-01-confeitaria.js — conteúdo adaptado do ROTEIRO.md v2.
// Correções desta rodada: parênteses de narrador viraram falas de verdade (ou foram
// cortados quando redundantes), o ponto [EXPANDIR] do roteiro ganhou 3 falas novas, e a
// pista da Twilight agora fica registrada em estado.pistas (ver engine-dialogo.js).

var CENA_01_CONFEITARIA = {
  id: "cena-01-confeitaria",
  fundo: "cozinha-pinkie",
  falas: [
    {
      quemFala: "narrador",
      texto:
        "Era uma tarde tranquila em Ponyville. A protagonista tinha uma missão bem simples: comprar alguns doces para o lanche da tarde.",
    },
    {
      quemFala: "pinkie",
      lado: "esquerda",
      texto: "Ai, ai, ai! Não, não, não! Isso não pode estar acontecendo!",
    },
    { quemFala: "protagonista", texto: "Pinkie? O que aconteceu?" },
    { quemFala: "pinkie", lado: "esquerda", texto: "A torta! A torta desapareceu!" },
    { quemFala: "protagonista", texto: "Que torta?" },
    {
      quemFala: "pinkie",
      lado: "esquerda",
      texto: "A torta de maçã! A torta surpresa da festa da Applejack!",
      mostrarItem: "torta",
    },
    {
      quemFala: "narrador",
      texto: "Pinkie parece perceber, tarde demais, que acabou de revelar um segredo.",
    },
    { quemFala: "pinkie", lado: "esquerda", texto: "...Ops." },
    { quemFala: "protagonista", texto: "Festa surpresa?" },
    {
      quemFala: "pinkie",
      lado: "esquerda",
      texto:
        "Era pra ser segredo! Enfim, sim! E não era uma torta qualquer — era uma receita especial da tataratatara-avó da Applejack!",
    },
    // [EXPANDIR — ROTEIRO.md]: tamanho do desastre, tempo que Pinkie levou pra fazer a
    // torta, protagonista tentando entender a festa surpresa.
    {
      quemFala: "pinkie",
      lado: "esquerda",
      texto:
        "Eu passei a manhã inteira trabalhando nela! Quatro camadas, cobertura de canela, tudo do jeitinho que a Applejack ia amar!",
    },
    {
      quemFala: "protagonista",
      texto: "Calma aí — desde quando a Applejack tem uma festa surpresa? Isso é surpresa pra mim também?",
    },
    {
      quemFala: "pinkie",
      lado: "esquerda",
      texto: "Bom... tecnicamente também é! Só que agora é surpresa que não tem torta nenhuma!",
    },
    {
      escolha: true,
      decorativa: true,
      tempoLimite: 15,
      opcoes: [
        { texto: "Calma, Pinkie. Vamos encontrar essa torta.", proximaFala: "pinkie-aceita" },
        { texto: "Respira fundo. A gente resolve isso.", proximaFala: "pinkie-aceita" },
      ],
    },
    {
      id: "pinkie-aceita",
      quemFala: "pinkie",
      lado: "esquerda",
      texto: "Você faria isso?! Então temos uma missão!",
    },
    {
      quemFala: "narrador",
      texto: 'E assim começa a missão: "O Mistério da Torta Desaparecida".',
    },
    {
      quemFala: "pinkie",
      lado: "esquerda",
      texto:
        "Procure em todos os lugares! Atrás do balcão, embaixo das mesas, dentro dos armários!",
    },
    {
      quemFala: "narrador",
      texto: "Depois de vasculhar o balcão e as mesas, a protagonista encontra migalhas... e uma lista.",
    },
    {
      quemFala: "protagonista",
      texto: "Pinkie, encontrei uma lista de organização da festa aqui perto das migalhas.",
    },
    { quemFala: "pinkie", lado: "esquerda", texto: "Espera... essa letra é da Twilight!" },
    { pista: { suspeita: "twilight", chave: "lista-com-a-letra-dela-na-confeitaria" } },
    { quemFala: "pinkie", lado: "esquerda", texto: "Vamos até a casa dela!" },
  ],
};
