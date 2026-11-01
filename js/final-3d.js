// final-3d.js — a sequência final na versão 3D (o 2D segue em main.js, com as cenas inteiras).
// Falar com todas na festa -> andar até a suspeita e acusar -> a Applejack entra -> revelação
// -> "Caso resolvido" -> com os 4 ingredientes, a torta nova no mundo aberto -> tela final ->
// créditos com a festa dançando. Textos em dados/final-3d.js; `mundo` é o módulo js/mundo3d/.

var Final3D = (function () {
  "use strict";

  var ESPERA_ANTES_DA_CHEGADA_MS = 2600; // o jogador ainda anda um pouco pela sala
  var EXCLAMACAO_APPLEJACK_MS = 1000;
  var EXCLAMACAO_TODAS_MS = 1300;
  var PAUSA_NO_MUNDO_MS = 1300;

  var mundo = null;
  var fase = "conversa"; // "conversa" | "acusar" | "encerrada"
  var conversou = {};

  function cenaDe(falas, base) {
    return Object.assign({ id: "final-3d", fundo: "festa-decorada" }, base, { falas: falas, transicoes: true });
  }

  // Toca uma cena com a foto do lugar de fundo. depois(): já com a transição terminada; sem
  // `depois`, volta o jogador pro mundo.
  function tocar(cena, depois) {
    var comFoto = comFundo(cena, mundo.fotoDoLugar());
    Interface.transicao(function () {
      mundo.esconder();
      MotorDialogo.iniciarCena(comFoto, function () {
        Interface.transicao(function () {
          if (depois) depois();
          else mundo.retomar();
        });
      });
    });
  }

  function falaUnica(id, texto) {
    return cenaDe([{ quemFala: id, lado: "esquerda", texto: texto }]);
  }

  function poneisDaConversa() {
    return Object.keys(FINAL_3D.conversas);
  }

  function atualizarObjetivo() {
    var total = poneisDaConversa().length;
    var feitas = Object.keys(conversou).length;
    mundo.definirObjetivo(FINAL_3D.objetivos.conversar + " (" + feitas + "/" + total + ")");
  }

  function comecar(moduloMundo) {
    mundo = moduloMundo;
    Musica.trilha("suspense");
    atualizarObjetivo();
  }

  // ---- conversas e acusação ----

  function aoInteragir(ponto) {
    if (fase === "acusar") {
      acusar(ponto);
      return;
    }
    if (conversou[ponto.id]) {
      tocar(falaUnica(ponto.id, FINAL_3D.repetidas[ponto.id]));
      return;
    }
    conversou[ponto.id] = true;
    atualizarObjetivo();
    var acabou = Object.keys(conversou).length === poneisDaConversa().length;
    tocar(cenaDe(FINAL_3D.conversas[ponto.id]), acabou ? horaDeAcusar : null);
  }

  function horaDeAcusar() {
    MotorDialogo.iniciarCena(comFundo(cenaDe(FINAL_3D.horaDeAcusar), mundo.fotoDoLugar()), function () {
      Interface.transicao(function () {
        mundo.retomar();
        fase = "acusar";
        mundo.definirObjetivo(FINAL_3D.objetivos.acusar);
        var marcas = poneisDaConversa().map(function (id) {
          var rotulo = suspeitaDaPonei(id) ? FINAL_3D.rotuloAcusar : FINAL_3D.rotuloNenhuma;
          mundo.definirRotulo(id, rotulo);
          return { id: id, texto: rotulo };
        });
        mundo.marcarPoneis(marcas);
      });
    });
  }

  function acusar(ponto) {
    fase = "encerrada";
    estado.acusacaoEscolhida = suspeitaDaPonei(ponto.id);
    mundo.limparMarcas();
    mundo.definirObjetivo("");
    poneisDaConversa().forEach(function (id) {
      mundo.definirRotulo(id, null);
      mundo.definirConversa(id, false);
    });
    tocar(cenaDe(falasDeAcusacao(estado.acusacaoEscolhida)), function () {
      mundo.retomar();
      setTimeout(chegadaDaApplejack, ESPERA_ANTES_DA_CHEGADA_MS);
    });
  }

  // ---- a Applejack entra ----

  function chegadaDaApplejack() {
    mundo.travarControles();
    mundo.chegarApplejack().then(function () {
      Musica.efeito("interagir");
      mundo.marcarPoneis([{ id: "applejack", exclamacao: true }]);
      setTimeout(function () {
        var todas = poneisDaConversa().concat("applejack", "protagonista");
        mundo.marcarPoneis(
          todas.map(function (id) {
            return { id: id, exclamacao: true };
          })
        );
        Musica.efeito("interagir");
        setTimeout(function () {
          mundo.limparMarcas();
          tocar(Object.assign({}, CENA_07_REVELACAO, { transicoes: true }), function () {
            Telas.abrirCaso(depoisDoCaso);
          });
        }, EXCLAMACAO_TODAS_MS);
      }, EXCLAMACAO_APPLEJACK_MS);
    });
  }

  // ---- com ou sem os ingredientes ----

  function depoisDoCaso() {
    var completo = estado.ingredientes.length === ORDEM_INGREDIENTES.length;
    if (!completo) {
      irPraTelaFinal(false);
      return;
    }
    Musica.trilha("festa");
    Interface.transicao(function () {
      Interface.mostrarHud(true);
      mundo.levarTodasProMundo();
      setTimeout(function () {
        tocar(cenaDe(FINAL_3D.consegui), juntarOsIngredientes);
      }, PAUSA_NO_MUNDO_MS);
    });
  }

  function juntarOsIngredientes() {
    mundo.retomarSemControle();
    Interface.mostrarHud(true);
    Interface.juntarIngredientes(function () {
      var cena = comFundo(cenaDe(FINAL_3D.tortaPronta), mundo.fotoDoLugar());
      Interface.transicao(function () {
        Interface.esconderTortaNova();
        mundo.esconder();
        MotorDialogo.iniciarCena(cena, function () {
          irPraTelaFinal(true);
        });
      });
    });
  }

  function irPraTelaFinal(completo) {
    Telas.abrirFim(completo, comecarDanca, pararDanca);
  }

  // ---- os créditos, com a festa de fundo ----

  function comecarDanca() {
    document.body.classList.add("creditos-festa");
    Interface.mostrarHud(false);
    mundo.comecarDanca();
    Musica.trilha("danca");
  }

  function pararDanca() {
    document.body.classList.remove("creditos-festa");
    mundo.pararDanca();
  }

  return { comecar: comecar, aoInteragir: aoInteragir };
})();
