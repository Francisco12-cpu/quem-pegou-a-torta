// interface.js — peças visuais compartilhadas entre os motores: HUD (ingredientes, histórico,
// som, tela cheia), transição entre telas, plaquinha com o nome do lugar, cartão de item e a
// animação do ingrediente voando até o contador.

var Interface = (function () {
  "use strict";

  var TEMPO_INGREDIENTES_MS = 1800; // o último ingrediente chegou no meio da tela
  var TEMPO_TORTA_MS = 2600; // quanto a torta fica sozinha na tela

  var el = {};
  var timerPlaca = null;

  function $(id) {
    return document.getElementById(id);
  }

  function iniciar() {
    el.hud = $("hud");
    el.contador = $("contador-ingredientes");
    el.transicao = $("transicao");
    el.placa = $("placa-local");
    el.cartao = $("cartao-item");
    el.cartaoImagem = $("cartao-item-imagem");
    el.cartaoNome = $("cartao-item-nome");
    el.cartaoDescricao = $("cartao-item-descricao");
    el.voo = $("voo-camada");
    el.log = $("painel-log");
    el.logLista = $("painel-log-lista");
    el.botaoSom = $("botao-som");
    el.botaoTelaCheia = $("botao-tela-cheia");

    $("botao-log").addEventListener("click", function (e) {
      e.stopPropagation();
      alternarLog();
    });
    $("painel-log-fechar").addEventListener("click", function (e) {
      e.stopPropagation();
      el.log.hidden = true;
    });
    el.log.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    el.botaoSom.addEventListener("click", function (e) {
      e.stopPropagation();
      Musica.liberar();
      atualizarBotaoSom(Musica.alternarMudo());
    });
    atualizarBotaoSom(Musica.estaMudo());

    if (!suportaTelaCheia()) {
      el.botaoTelaCheia.hidden = true;
    }
    el.botaoTelaCheia.addEventListener("click", function (e) {
      e.stopPropagation();
      alternarTelaCheia();
    });

    atualizarIngredientes();
  }

  // ---- HUD ----

  function mostrarHud(mostrar) {
    el.hud.hidden = !mostrar;
    if (!mostrar) el.log.hidden = true;
  }

  function atualizarBotaoSom(mudo) {
    el.botaoSom.classList.toggle("mudo", mudo);
    el.botaoSom.setAttribute("aria-pressed", mudo ? "true" : "false");
    el.botaoSom.title = mudo ? "Som desligado" : "Som ligado";
  }

  function htmlSlotIngrediente(chave, coletado) {
    var item = ITENS[chave];
    return (
      '<span class="slot-ingrediente' +
      (coletado ? " coletado" : "") +
      '" data-ingrediente="' +
      chave +
      '" title="' +
      (coletado ? item.nome : "Ingrediente escondido") +
      '"><img src="' +
      item.imagem +
      '" alt="' +
      (coletado ? item.nome : "") +
      '" /></span>'
    );
  }

  function atualizarIngredientes() {
    var html = ORDEM_INGREDIENTES.map(function (chave) {
      return htmlSlotIngrediente(chave, estado.ingredientes.indexOf(chave) !== -1);
    }).join("");
    el.contador.innerHTML = html;
  }

  // o ícone do ingrediente sai de `origem` (DOMRect) e voa até o espaço dele no contador
  function voarIngrediente(chave, origem, aoTerminar) {
    var destinoEl = el.contador.querySelector('[data-ingrediente="' + chave + '"]');
    if (!destinoEl || !origem) {
      atualizarIngredientes();
      if (aoTerminar) aoTerminar();
      return;
    }
    var destino = destinoEl.getBoundingClientRect();
    var jogoRect = $("jogo").getBoundingClientRect();
    var img = document.createElement("img");
    img.src = ITENS[chave].imagem;
    img.className = "item-voando";
    var tamanho = Math.min(origem.width, origem.height);
    img.style.left = origem.left - jogoRect.left + (origem.width - tamanho) / 2 + "px";
    img.style.top = origem.top - jogoRect.top + (origem.height - tamanho) / 2 + "px";
    img.style.width = tamanho + "px";
    img.style.height = tamanho + "px";
    el.voo.appendChild(img);

    var dx = destino.left + destino.width / 2 - (origem.left + origem.width / 2);
    var dy = destino.top + destino.height / 2 - (origem.top + origem.height / 2);
    var escala = destino.width / tamanho;

    requestAnimationFrame(function () {
      img.style.transform = "translate(" + dx + "px, " + dy + "px) scale(" + escala + ")";
    });
    setTimeout(function () {
      img.remove();
      atualizarIngredientes();
      var novo = el.contador.querySelector('[data-ingrediente="' + chave + '"]');
      if (novo) novo.classList.add("acabou-de-chegar");
      Musica.efeito("item");
      if (aoTerminar) aoTerminar();
    }, 750);
  }

  // ---- transição (escurece, troca, clareia) ----

  function transicao(meio, depois) {
    el.transicao.classList.add("ativa");
    setTimeout(function () {
      if (meio) meio();
      requestAnimationFrame(function () {
        el.transicao.classList.remove("ativa");
        if (depois) setTimeout(depois, 280);
      });
    }, 280);
  }

  // ---- a torta nova: os ingredientes voam do contador pro meio da tela ----

  function juntarIngredientes(aoTerminar) {
    var jogoRect = $("jogo").getBoundingClientRect();
    var centroX = jogoRect.width / 2;
    var centroY = jogoRect.height * 0.44;
    var imagens = ORDEM_INGREDIENTES.map(function (chave, i) {
      var slot = el.contador.querySelector('[data-ingrediente="' + chave + '"]').getBoundingClientRect();
      var img = document.createElement("img");
      img.src = ITENS[chave].imagem;
      img.className = "item-juntando";
      img.style.left = slot.left - jogoRect.left + "px";
      img.style.top = slot.top - jogoRect.top + "px";
      img.style.width = slot.width + "px";
      img.style.height = slot.height + "px";
      img.style.transitionDelay = i * 0.22 + "s";
      el.voo.appendChild(img);
      var dx = centroX - (slot.left - jogoRect.left + slot.width / 2);
      var dy = centroY - (slot.top - jogoRect.top + slot.height / 2);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          img.style.transform = "translate(" + dx + "px, " + dy + "px) scale(2.4) rotate(360deg)";
        });
      });
      return img;
    });

    setTimeout(function () {
      imagens.forEach(function (img) {
        img.remove();
      });
      Musica.efeito("interagir");
      var torta = document.createElement("div");
      torta.id = "torta-nova";
      torta.innerHTML = '<img src="' + ITENS.torta.imagem + '" alt="' + ITENS.torta.nome + '" draggable="false" />';
      el.voo.appendChild(torta);
      setTimeout(aoTerminar, TEMPO_TORTA_MS);
    }, TEMPO_INGREDIENTES_MS);
  }

  function esconderTortaNova() {
    var torta = $("torta-nova");
    if (torta) torta.remove();
  }

  // ---- plaquinha com o nome do lugar ----

  function mostrarPlaca(texto) {
    if (!texto) return;
    clearTimeout(timerPlaca);
    el.placa.textContent = texto;
    el.placa.hidden = false;
    el.placa.classList.remove("saindo");
    el.placa.classList.remove("entrando");
    void el.placa.offsetWidth;
    el.placa.classList.add("entrando");
    timerPlaca = setTimeout(function () {
      el.placa.classList.add("saindo");
      timerPlaca = setTimeout(function () {
        el.placa.hidden = true;
      }, 400);
    }, 2000);
  }

  // ---- cartão de item (ex.: a torta, quando a Pinkie conta o segredo) ----

  function mostrarCartao(chave) {
    var item = ITENS[chave];
    if (!item) return;
    el.cartaoImagem.src = item.imagem;
    el.cartaoImagem.alt = item.nome;
    el.cartaoNome.textContent = item.nome;
    el.cartaoDescricao.textContent = item.descricao;
    el.cartao.hidden = false;
    el.cartao.classList.remove("aparecendo");
    void el.cartao.offsetWidth;
    el.cartao.classList.add("aparecendo");
    Musica.efeito("item");
  }

  function esconderCartao() {
    el.cartao.hidden = true;
  }

  // ---- histórico ----

  function alternarLog() {
    var mostrar = el.log.hidden;
    el.log.hidden = !mostrar;
    if (!mostrar) return;
    var html = "";
    estado.historicoDialogo.forEach(function (item) {
      if (item.falante) {
        html += '<p><strong style="color:' + (item.cor || "") + '">' + item.falante + "</strong>" + item.texto + "</p>";
      } else {
        html += '<p class="narracao">' + item.texto + "</p>";
      }
    });
    el.logLista.innerHTML = html || '<p class="narracao">Nada no histórico ainda.</p>';
    el.logLista.scrollTop = el.logLista.scrollHeight;
  }

  // ---- tela cheia ----

  function suportaTelaCheia() {
    var d = document.documentElement;
    return !!(d.requestFullscreen || d.webkitRequestFullscreen);
  }

  function estaEmTelaCheia() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function entrarTelaCheia() {
    var d = document.documentElement;
    try {
      var p = d.requestFullscreen ? d.requestFullscreen({ navigationUI: "hide" }) : d.webkitRequestFullscreen();
      if (p && p.then) {
        p.then(function () {
          // no celular, tenta travar deitado (se o navegador deixar; se não, tudo bem)
          if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(function () {});
        }).catch(function () {});
      }
    } catch (e) {}
  }

  function alternarTelaCheia() {
    if (estaEmTelaCheia()) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } else {
      entrarTelaCheia();
    }
  }

  return {
    iniciar: iniciar,
    mostrarHud: mostrarHud,
    atualizarIngredientes: atualizarIngredientes,
    voarIngrediente: voarIngrediente,
    juntarIngredientes: juntarIngredientes,
    esconderTortaNova: esconderTortaNova,
    transicao: transicao,
    mostrarPlaca: mostrarPlaca,
    mostrarCartao: mostrarCartao,
    esconderCartao: esconderCartao,
    entrarTelaCheia: entrarTelaCheia,
    suportaTelaCheia: suportaTelaCheia,
  };
})();
