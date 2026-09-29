// cena-08-bonus-torta-nova.js — conteúdo adaptado do ROTEIRO.md v2.
// Só toca se os 4 ingredientes foram coletados (checagem em main.js). Sem minigame aqui —
// o roteiro pede só uma sequência curta e animada, sem interação.

var CENA_08_BONUS_TORTA_NOVA = {
  id: "cena-08-bonus-torta-nova",
  fundo: "festa-decorada",
  falas: [
    { quemFala: "protagonista", texto: "Na verdade, Applejack... espera um pouco." },
    {
      quemFala: "narrador",
      texto: "{nome} mostra farinha, maçã, canela e mel, juntados durante toda a investigação.",
    },
    { quemFala: "pinkie", lado: "esquerda", texto: "Você guardou tudo isso?!" },
    {
      quemFala: "protagonista",
      texto: "Fui recolhendo pelo caminho, na casa de cada uma. Achei que podia dar jeito.",
    },
    { quemFala: "pinkie", lado: "esquerda", texto: "Então ainda dá tempo! Bora, gente, mãos à obra!" },
    // [EXPANDIR — ROTEIRO.md]: sequência curta e animada, sem virar minigame.
    {
      quemFala: "narrador",
      texto:
        "Pinkie mistura a farinha às pressas, Twilight cronometra o forno como se fosse um experimento científico, Rarity decora a cobertura com capricho, e Rainbow Dash \"ajuda\" comendo pedacinhos de massa crua sempre que ninguém está olhando.",
    },
    { quemFala: "fluttershy", lado: "direita", texto: "Cuidado com o forno, ele está bem quente!" },
    { quemFala: "pinkie", lado: "esquerda", texto: "Relaxa, Fluttershy, eu nasci pronta pra isso!" },
    { quemFala: "applejack", lado: "direita", texto: "Vocês... fizeram outra torta?" },
    { quemFala: "pinkie", lado: "esquerda", texto: "Melhor: fizemos JUNTAS!" },
    {
      quemFala: "narrador",
      texto:
        "E assim, além da amizade, a festa da Applejack ganhou uma torta novinha em folha — feita com um pouquinho de cada amiga.",
    },
  ],
};
