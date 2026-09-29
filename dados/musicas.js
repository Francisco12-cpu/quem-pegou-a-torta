// musicas.js — trilhas do jogo, tocadas por js/musica.js com síntese Web Audio (nenhum arquivo
// de áudio). Cada canal é uma sequência de passos de colcheia separados por espaço:
//   C5, F#4, Bb3  -> nota (nome + oitava)
//   .             -> pausa
//   -             -> segura a nota anterior por mais um passo
// Bateria: k = bumbo, s = caixa, h = chimbal, . = pausa.
// Cada canal repete sozinho no próprio tamanho (bateria de 1 compasso, melodia de 8 etc.).

var MUSICAS = {
  // menu, créditos — alegre, em Dó maior
  tema: {
    bpm: 118,
    canais: {
      melodia: {
        instrumento: "quadrada",
        volume: 0.13,
        notas:
          "E5 . G5 . C6 . G5 . A5 . G5 E5 . . C5 . F5 . A5 . C6 . A5 G5 G5 - - . D5 . B4 . " +
          "E5 . G5 . C6 . E6 . D6 . C6 A5 . . G5 . A5 . F5 . G5 . E5 . D5 . . B4 C5 - - .",
      },
      harmonia: {
        instrumento: "triangular",
        volume: 0.1,
        notas:
          "C4 E4 G4 E4 C4 E4 G4 E4 A3 C4 E4 C4 A3 C4 E4 C4 F3 A3 C4 A3 F3 A3 C4 A3 G3 B3 D4 B3 G3 B3 D4 B3",
      },
      baixo: {
        instrumento: "baixo",
        volume: 0.2,
        notas: "C3 . C3 . G2 . C3 . A2 . A2 . E2 . A2 . F2 . F2 . C3 . F2 . G2 . G2 . D3 . G2 .",
      },
      bateria: { volume: 0.45, notas: "k . h . s . h . k . h . s . h h" },
    },
  },

  // andando pelo mapa e conversando nas casas — tranquila, em Sol maior
  passeio: {
    bpm: 100,
    canais: {
      melodia: {
        instrumento: "quadrada",
        volume: 0.1,
        notas:
          "B4 . D5 . G5 . . D5 E5 . G5 . B5 . . G5 A5 . G5 . E5 . C5 . D5 . . . F#5 . A5 . " +
          "B5 . A5 G5 . D5 . . E5 . D5 B4 . G4 . . C5 . E5 . A5 . G5 . F#5 . . D5 G5 - - .",
      },
      harmonia: {
        instrumento: "triangular",
        volume: 0.08,
        notas:
          "G3 B3 D4 B3 G3 B3 D4 B3 E3 G3 B3 G3 E3 G3 B3 G3 C4 E4 G4 E4 C4 E4 G4 E4 D4 F#4 A4 F#4 D4 F#4 A4 F#4",
      },
      baixo: {
        instrumento: "baixo",
        volume: 0.18,
        notas: "G2 . . D3 G2 . . D3 E2 . . B2 E2 . . B2 C3 . . G2 C3 . . G2 D3 . . A2 D3 . . A2",
      },
      bateria: { volume: 0.3, notas: "k . h . . . h . k . h . s . h ." },
    },
  },

  // confronto e revelação — tensa, em Lá menor
  suspense: {
    bpm: 88,
    canais: {
      melodia: {
        instrumento: "quadrada",
        volume: 0.1,
        notas:
          "A4 . . C5 . . B4 . A4 . . . E4 . . . F4 . . A4 . . G#4 . E4 - - - . . . . " +
          "A5 . . C6 . . B5 . A5 . G5 . F5 . E5 . D5 . F5 . E5 . D5 . E5 - - - G#4 - - -",
      },
      harmonia: {
        instrumento: "triangular",
        volume: 0.09,
        notas: "A3 . E4 . A3 . E4 . F3 . C4 . F3 . C4 . D3 . A3 . D3 . A3 . E3 . B3 . E3 . G#3 .",
      },
      baixo: {
        instrumento: "baixo",
        volume: 0.2,
        notas: "A2 . A2 . A2 . A2 . F2 . F2 . F2 . F2 . D2 . D2 . D2 . D2 . E2 . E2 . E2 . G#2 .",
      },
      bateria: { volume: 0.35, notas: "k . . h k . h ." },
    },
  },

  // minigame do baú — tique-taque de fechadura, em Ré menor
  cofre: {
    bpm: 124,
    canais: {
      melodia: {
        instrumento: "quadrada",
        volume: 0.08,
        notas: "D5 . . . F5 . . . E5 . . . C#5 . . . D5 . . . A5 . . . G5 . F5 . E5 . C#5 .",
      },
      baixo: {
        instrumento: "baixo",
        volume: 0.2,
        notas: "D2 . D3 . D2 . D3 . A1 . A2 . A1 . A2 . Bb1 . Bb2 . Bb1 . Bb2 . A1 . A2 . A1 . A2 .",
      },
      bateria: { volume: 0.3, notas: "k h h h s h h h" },
    },
  },

  // final e cena bônus — festa, em Dó maior
  festa: {
    bpm: 132,
    canais: {
      melodia: {
        instrumento: "quadrada",
        volume: 0.12,
        notas:
          "C5 E5 G5 C6 . G5 E5 G5 A5 . A5 G5 F5 . A5 . G5 . B5 . D6 . B5 G5 C6 . . G5 C6 . . . " +
          "A5 C6 E6 C6 A5 . E5 . F5 A5 C6 A5 F5 . C5 . D5 . G5 . B5 . D6 . C6 . G5 E5 C5 - - .",
      },
      harmonia: {
        instrumento: "triangular",
        volume: 0.09,
        notas:
          "C4 E4 G4 E4 C4 E4 G4 E4 F3 A3 C4 A3 F3 A3 C4 A3 G3 B3 D4 B3 G3 B3 D4 B3 C4 E4 G4 E4 C4 E4 G4 E4 " +
          "A3 C4 E4 C4 A3 C4 E4 C4 F3 A3 C4 A3 F3 A3 C4 A3 G3 B3 D4 B3 G3 B3 D4 B3 C4 E4 G4 E4 C4 . . .",
      },
      baixo: {
        instrumento: "baixo",
        volume: 0.2,
        notas:
          "C3 . C3 G2 C3 . C3 G2 F2 . F2 C3 F2 . F2 C3 G2 . G2 D3 G2 . G2 D3 C3 . C3 G2 C3 . C3 G2 " +
          "A2 . A2 E3 A2 . A2 E3 F2 . F2 C3 F2 . F2 C3 G2 . G2 D3 G2 . G2 D3 C3 . G2 . C3 . . .",
      },
      bateria: { volume: 0.45, notas: "k . h k s . h . k . h k s . s s" },
    },
  },
};
