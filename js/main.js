// main.js — fluxo do jogo. O mapa é uma sequência linear de telas (dados/casas.js): a
// protagonista anda pra direita até a borda pra ir pra próxima, ou pra esquerda pra voltar.
// Encostar numa pônei abre o diálogo; num baú, o minigame. Depois da última tela vêm o
// confronto, a revelação, a tela "Caso resolvido", a cena bônus (com os 4 ingredientes), o
// final e os créditos. Os motores (diálogo, exploração, minigame) não sabem de nada disso.

var TRILHA_EXPLORACAO = "passeio";

var carregandoMundo3D = null; // Promise do módulo js/mundo3d/ (só no modo 3D)

document.addEventListener("DOMContentLoaded", function () {
  // começa a baixar já no menu: ao apertar "Jogar" o mundo costuma estar pronto
  if (modoDeJogo() === "3d") carregandoMundo3D = import("./mundo3d/index.js");
  Interface.iniciar();
  Telas.abrirMenu(comecarJogo); // o menu já fica pronto por baixo da tela de abertura
  Telas.abrirAbertura(escolherPersonagem);
});

// abertura -> escolha do personagem -> nome (dá pra voltar e trocar o personagem) -> menu
function escolherPersonagem() {
  EscolhaPersonagem.abrir(function () {
    Telas.atualizarProtagonista();
    Telas.abrirNome(function () {
      CenaEspecial.mostrar("carregamento", function () {});
    }, escolherPersonagem);
  });
}

function comecarJogo() {
  estado.inicio = Date.now();
  Musica.trilha(TRILHA_EXPLORACAO);
  if (carregandoMundo3D) {
    comecarMundo3D();
    return;
  }
  entrarNaTela(0, "esquerda");
}

// Se o 3D não puder rodar (sem WebGL, ou abrindo o arquivo direto sem servidor), segue no 2D.
function comecarMundo3D() {
  carregandoMundo3D
    .then(function (mundo) {
      return mundo.iniciar({
        sprite: PERSONAGENS.protagonista.sprite,
        aoInteragir: function (ponto) {
          interagirNoMundo(mundo, ponto);
        },
        aoChegarNoFim: function () {
          Interface.transicao(function () {
            mundo.esconder();
            comecarConfronto();
          });
        },
      });
    })
    .then(function () {
      Interface.mostrarHud(true);
      Interface.mostrarPlaca(MUNDO3D.nome);
    })
    .catch(function (erro) {
      console.warn("Mundo 3D indisponível, seguindo no 2D:", erro);
      document.getElementById("mundo3d-overlay").hidden = true;
      entrarNaTela(0, "esquerda");
    });
}

function telaPorId(id) {
  return TELAS.filter(function (t) {
    return t.id === id;
  })[0];
}

function interagirNoMundo(mundo, ponto) {
  function voltarProMundo() {
    Interface.transicao(function () {
      Musica.trilha(TRILHA_EXPLORACAO);
      mundo.retomar();
    });
  }

  if (ponto.tipo === "bau") {
    var bau = BAUS[idDoBau(ponto)];
    var config = Object.assign({}, bau, { fundo: telaPorId(bau.casa).fundo });
    Interface.transicao(function () {
      mundo.esconder();
      MotorMinigame.iniciar(config, function () {
        if (estado.ingredientes.indexOf(bau.ingrediente) !== -1) mundo.removerPonto(ponto.id);
        voltarProMundo();
      });
    });
    return;
  }

  var cena = cenaDaPonei(telaPorId(ponto.tela), ponto);
  Interface.transicao(function () {
    mundo.esconder();
    MotorDialogo.iniciarCena(cena, function () {
      estado.conversou[ponto.id] = true;
      if (ponto.id === ACOMPANHANTE.id) {
        // a Pinkie sai da cozinha e vai investigar junto
        mundo.removerPonto(ponto.id);
        mundo.acompanhar(ponto.id);
      }
      voltarProMundo();
    });
  });
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

// a conversa principal, ou só uma fala curta se já conversaram (2D e 3D usam a mesma)
function cenaDaPonei(tela, ponto) {
  if (!estado.conversou[ponto.id] && tela.dialogo) return tela.dialogo();
  var r = tela.repetida || { quemFala: ponto.id, texto: "..." };
  return {
    id: "repetida-" + ponto.id,
    fundo: tela.fundo,
    falas: [{ quemFala: r.quemFala, lado: "esquerda", texto: r.texto }],
  };
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
    var cena = cenaDaPonei(tela, ponto);
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
