// pwa.js — liga o modo aplicativo: registra o sw.js (jogar sem internet) e mostra o botão
// "Instalar" no menu quando o navegador oferece. Sem suporte, o jogo segue normal.

(function () {
  "use strict";

  var pedidoInstalacao = null;

  // o que carregou antes do sw.js assumir também precisa ficar guardado
  function guardarOQueJaCarregou() {
    var nomes = performance
      .getEntriesByType("resource")
      .map(function (r) {
        return r.name;
      })
      .filter(function (url) {
        return url.indexOf(location.origin) === 0 && !/\.(mp4|webm)(\?|$)/.test(url);
      });
    nomes.push(location.pathname);
    caches.open("torta-v1").then(function (cache) {
      nomes.forEach(function (url) {
        cache.add(url).catch(function () {}); // um arquivo que falhe não atrapalha os outros
      });
    });
  }

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("sw.js")
        .then(function () {
          return navigator.serviceWorker.ready;
        })
        .then(guardarOQueJaCarregou)
        .catch(function () {});
    });
  }

  window.addEventListener("beforeinstallprompt", function (evento) {
    evento.preventDefault();
    pedidoInstalacao = evento;
    var botao = document.getElementById("menu-instalar");
    if (botao) botao.hidden = false;
  });

  document.addEventListener("DOMContentLoaded", function () {
    var botao = document.getElementById("menu-instalar");
    if (!botao) return;
    botao.onclick = function () {
      if (!pedidoInstalacao) return;
      pedidoInstalacao.prompt();
      pedidoInstalacao = null;
      botao.hidden = true;
    };
  });

  window.addEventListener("appinstalled", function () {
    var botao = document.getElementById("menu-instalar");
    if (botao) botao.hidden = true;
  });
})();
