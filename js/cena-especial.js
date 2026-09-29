// cena-especial.js — mostra a animação especial (o GIF da chuva de estrelas) em tela cheia.
// Onde ela aparece e qual arquivo usa ficam em `CONFIG.cenaEspecial` (dados/config.js).
// Se `usarEm` não bater com o momento pedido, ou se o arquivo ainda não existir, ela é pulada
// sem erro — o jogo segue normalmente.

var CenaEspecial = (function () {
  "use strict";

  var VIDEO = /\.(mp4|webm)$/i;

  // momento: "carregamento" | "final" | "antes-dos-creditos"
  function mostrar(momento, aoTerminar) {
    var cfg = typeof CONFIG !== "undefined" ? CONFIG.cenaEspecial : null;
    if (!cfg || !cfg.arquivo || cfg.usarEm !== momento) {
      aoTerminar();
      return;
    }

    var tela = document.getElementById("tela-especial");
    var midia = document.getElementById("especial-midia");
    var terminou = false;
    var timer = null;

    function fechar() {
      if (terminou) return;
      terminou = true;
      clearTimeout(timer);
      document.removeEventListener("keydown", aoTecla);
      tela.onclick = null;
      Interface.transicao(function () {
        tela.hidden = true;
        midia.innerHTML = "";
        aoTerminar();
      });
    }

    function aoTecla(e) {
      e.preventDefault();
      fechar();
    }

    function exibir(elemento) {
      midia.innerHTML = "";
      midia.appendChild(elemento);
      document.getElementById("especial-titulo").textContent = cfg.titulo || "";
      document.getElementById("especial-texto").textContent = cfg.texto || "";
      Interface.transicao(function () {
        tela.hidden = false;
      });
      // só aceita fechar depois de um instante, pra não pular sem querer
      setTimeout(function () {
        tela.onclick = fechar;
        document.addEventListener("keydown", aoTecla);
      }, 600);
      if (cfg.duracao > 0) timer = setTimeout(fechar, cfg.duracao * 1000);
    }

    // testa se o arquivo existe/carrega antes de mostrar qualquer coisa
    if (VIDEO.test(cfg.arquivo)) {
      var video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.onloadeddata = function () {
        video.onloadeddata = video.onerror = null;
        exibir(video);
        video.play().catch(function () {});
      };
      // se o navegador não tocar .mp4 (H.264), tenta uma versão .webm com o mesmo nome
      var alternativa = /\.mp4$/i.test(cfg.arquivo) ? cfg.arquivo.replace(/\.mp4$/i, ".webm") : null;
      video.onerror = function () {
        if (alternativa) {
          video.src = alternativa;
          alternativa = null;
          return;
        }
        aoTerminar();
      };
      video.src = cfg.arquivo;
    } else {
      var img = new Image();
      img.alt = cfg.titulo || "";
      img.onload = function () {
        img.onload = img.onerror = null;
        exibir(img);
      };
      img.onerror = function () {
        aoTerminar();
      };
      img.src = cfg.arquivo;
    }
  }

  return { mostrar: mostrar };
})();
