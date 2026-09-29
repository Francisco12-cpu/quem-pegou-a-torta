// main.js — fluxo do jogo. O mapa é uma sequência linear de telas (dados/casas.js): a
// protagonista anda pra direita até a borda pra ir pra próxima, ou pra esquerda pra voltar.
// Encostar numa pônei abre o diálogo; num baú, o minigame. Depois da última tela vêm o
// confronto, a revelação, a tela "Caso resolvido", a cena bônus (com os 4 ingredientes), o
// final e os créditos. Os motores (diálogo, exploração, minigame) não sabem de nada disso.

var TRILHA_EXPLORACAO = "passeio";

document.addEventListener("DOMContentLoaded", function () {
  Interface.iniciar();
  Telas.abrirMenu(comecarJogo); // o menu já fica pronto por baixo da tela de abertura
  Telas.abrirAbertura(function () {
    CenaEspecial.mostrar("carregamento", function () {});
  });
});

function comecarJogo() {
  estado.inicio = Date.now();
  Musica.trilha(TRILHA_EXPLORACAO);
  entrarNaTela(0, "esquerda");
}

// ---- telas do mapa ----

function idDoBau(ponto) {
  return ponto.bau;
}

function pontosOcultos(tela) {
  var ocultos = {};
  (tela.pontos || []).forEach(function (p) {
    // baú já aberto some do mapa (ARQUITETURA.md)
    if (p.tipo === "bau" && estado.ingredientes.indexOf(BAUS[idDoBau(p)].ingrediente) !== -1) ocultos[p.id] = true;
  });
  return ocultos;
}

function acompanhanteNaTela(indice) {
  var inicio = -1;
  TELAS.forEach(function (t, i) {
    if (t.id === ACOMPANHANTE.aPartirDe) inicio = i;
  });
  return inicio !== -1 && indice >= inicio ? ACOMPANHANTE.id : null;
}

// indice: posição em TELAS; entrarPor: "esquerda"|"direita"; xInicial: opcional (voltando
// de um diálogo/baú, a protagonista continua onde estava)
function entrarNaTela(indice, entrarPor, xInicial) {
  var tela = TELAS[indice];
  estado.telaAtual = indice;

  var direitaTrancada = tela.exige && !estado.conversou[tela.exige] ? tela.trancada : null;
  var esquerdaTrancada = indice === 0 ? true : null; // a primeira tela não tem pra onde voltar

  Interface.mostrarHud(true);
  MotorExploracao.iniciarTela(tela, {
    entrarPor: entrarPor,
    xInicial: xInicial,
    direitaTrancada: direitaTrancada,
    esquerdaTrancada: esquerdaTrancada,
    pontosOcultos: pontosOcultos(tela),
    acompanhante: acompanhanteNaTela(indice),
    aoInteragir: function (ponto) {
      interagirNaTela(indice, ponto);
    },
    aoSair: function (lado) {
      sairDaTela(indice, lado);
    },
  });
  if (xInicial == null) Interface.mostrarPlaca(tela.nome);
}

function sairDaTela(indice, lado) {
  var proxima = lado === "direita" ? indice + 1 : indice - 1;
  Interface.transicao(function () {
    if (proxima >= TELAS.length) {
      MotorExploracao.esconder();
      comecarConfronto();
      return;
    }
    entrarNaTela(proxima, lado === "direita" ? "esquerda" : "direita");
  });
}

function interagirNaTela(indice, ponto) {
  var tela = TELAS[indice];
  var x = MotorExploracao.posicaoJogador();

  function voltarPraTela() {
    Interface.transicao(function () {
      Musica.trilha(TRILHA_EXPLORACAO);
      entrarNaTela(indice, "esquerda", x);
    });
  }

  if (ponto.tipo === "ponei") {
    var cena;
    if (!estado.conversou[ponto.id] && tela.dialogo) {
      cena = tela.dialogo();
    } else {
      // já conversaram: só uma fala curta, sem repetir tudo
      var r = tela.repetida || { quemFala: ponto.id, texto: "..." };
      cena = {
        id: "repetida-" + ponto.id,
        fundo: tela.fundo,
        falas: [{ quemFala: r.quemFala, lado: "esquerda", texto: r.texto }],
      };
    }
    Interface.transicao(function () {
      MotorExploracao.esconder();
      MotorDialogo.iniciarCena(cena, function () {
        estado.conversou[ponto.id] = true;
        voltarPraTela();
      });
    });
  } else if (ponto.tipo === "bau") {
    var config = Object.assign({}, BAUS[idDoBau(ponto)], { fundo: tela.fundo });
    Interface.transicao(function () {
      MotorExploracao.esconder();
      MotorMinigame.iniciar(config, function () {
        voltarPraTela();
      });
    });
  }
}

// ---- final da história ----

function comecarConfronto() {
  Musica.trilha("suspense");
  MotorDialogo.iniciarCena(CENA_06_CONFRONTO, function () {
    Interface.transicao(function () {
      MotorDialogo.iniciarCena(CENA_07_REVELACAO, function () {
        Telas.abrirCaso(depoisDoCaso);
      });
    });
  });
}

function depoisDoCaso() {
  var completo = estado.ingredientes.length === ORDEM_INGREDIENTES.length;
  if (completo) {
    Musica.trilha("festa");
    Interface.mostrarHud(true);
    MotorDialogo.iniciarCena(CENA_08_BONUS_TORTA_NOVA, function () {
      Telas.abrirFim(true);
    });
    return;
  }
  Telas.abrirFim(false);
}
