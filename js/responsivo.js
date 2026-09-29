// responsivo.js — detecção automática de layout mobile/desktop, sem tela de pergunta.
// Aplica classes no <body> conforme o tipo de dispositivo e orientação, pra CSS reagir sozinho.

(function () {
  "use strict";

  var consultaMobile = window.matchMedia("(max-width: 768px)");
  var consultaRetrato = window.matchMedia("(orientation: portrait)");
  var avisoRotacao = null;

  function atualizarClasseDispositivo() {
    var ehMobile = consultaMobile.matches;
    document.body.classList.toggle("modo-mobile", ehMobile);
    document.body.classList.toggle("modo-desktop", !ehMobile);
  }

  function atualizarClasseOrientacao() {
    var ehRetrato = consultaRetrato.matches;
    document.body.classList.toggle("modo-retrato", ehRetrato);
    document.body.classList.toggle("modo-paisagem", !ehRetrato);
    atualizarAvisoRotacao();
  }

  // Aviso leve sugerindo girar a tela quando é celular em retrato.
  // Não bloqueia o jogo — é só um toast que some sozinho quando a orientação muda.
  function atualizarAvisoRotacao() {
    if (!avisoRotacao) {
      avisoRotacao = document.getElementById("aviso-rotacao");
    }
    if (!avisoRotacao) return;

    var deveMostrar = consultaMobile.matches && consultaRetrato.matches;
    avisoRotacao.hidden = !deveMostrar;
    clearTimeout(atualizarAvisoRotacao._timer);
    if (deveMostrar) {
      // o jogo também funciona em pé — o aviso é só uma sugestão, some sozinho
      atualizarAvisoRotacao._timer = setTimeout(function () {
        avisoRotacao.hidden = true;
      }, 5000);
    }
  }

  // Tela de toque: mostra os botões na tela (setas e ação) em vez das dicas de teclado.
  // Liga se o aparelho só tem toque, ou no primeiro toque de verdade (tablet com teclado etc.).
  var consultaToque = window.matchMedia("(hover: none) and (pointer: coarse)");

  function marcarToque(ehToque) {
    document.body.classList.toggle("toque", ehToque);
  }

  function inicializar() {
    atualizarClasseDispositivo();
    atualizarClasseOrientacao();
    marcarToque(consultaToque.matches);
    window.addEventListener(
      "touchstart",
      function () {
        marcarToque(true);
      },
      { passive: true }
    );
    window.addEventListener("keydown", function (e) {
      // usou teclado de verdade (setas/letras): volta pro modo teclado
      if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return; // digitando o nome
      if (/^(Arrow|Key)/.test(e.code)) marcarToque(false);
    });
  }

  // addEventListener em MediaQueryList tem suporte amplo; fallback pra addListener em navegadores antigos.
  function ouvir(consulta, manipulador) {
    if (typeof consulta.addEventListener === "function") {
      consulta.addEventListener("change", manipulador);
    } else if (typeof consulta.addListener === "function") {
      consulta.addListener(manipulador);
    }
  }

  ouvir(consultaMobile, atualizarClasseDispositivo);
  ouvir(consultaRetrato, atualizarClasseOrientacao);
  window.addEventListener("resize", atualizarClasseOrientacao);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
  } else {
    inicializar();
  }
})();
