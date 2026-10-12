// escolha-personagem.js — tela "Escolha seu personagem" (entre a abertura e o nome).
// Passo 1: masculino ou feminino (só filtra). Passo 2: os personagens daquela categoria; o
// jogador marca um e confirma. O escolhido vira PERSONAGENS.protagonista — sprite e cor —,
// então diálogo, exploração, baú e desfiles mostram sempre o mesmo personagem.
// Personagens e categorias ficam em dados/protagonistas.js; o fundo animado, em
// CONFIG.escolhaPersonagem (dados/config.js).

var EscolhaPersonagem = (function () {
  "use strict";

  var ESPERA_INICIAL_MS = 250; // o toque/tecla que abriu a tela (ou trocou de passo) não conta
  var CHAVE_SESSAO = "torta-protagonista";
  var VIDEO = /\.(mp4|webm)$/i;

  var categoria = null; // categoria aberta no passo 2
  var selecionado = null; // id marcado no passo 2
  var passo = 0; // 0 = fechada, 1 = categoria, 2 = personagem
  var prontoEm = 0;
  var aoConfirmar = null;
  var fundoMontado = false;

  function $(id) {
    return document.getElementById(id);
  }

  function buscar(id) {
    for (var i = 0; i < PROTAGONISTAS.length; i++) if (PROTAGONISTAS[i].id === id) return PROTAGONISTAS[i];
    return null;
  }

  function daCategoria(cat) {
    return PROTAGONISTAS.filter(function (p) {
      return p.categoria === cat;
    });
  }

  function disponiveis(cat) {
    return daCategoria(cat).filter(function (p) {
      return p.disponivel !== false && !trancado(p);
    });
  }

  // ---- personagem secreto (campo `secreto` em dados/protagonistas.js) ----

  var toquesEstrela = 0;
  var ultimoToque = 0;
  var timerDica = null;
  var liberados = {}; // só na memória: recarregou a página, o segredo tranca de novo

  function liberado(id) {
    return !!liberados[id];
  }

  function trancado(p) {
    return !!p.secreto && !liberado(p.id);
  }

  function proximoSecreto() {
    for (var i = 0; i < PROTAGONISTAS.length; i++) if (trancado(PROTAGONISTAS[i])) return PROTAGONISTAS[i];
    return null;
  }

  function mostrarDica(cartao, texto) {
    var antiga = document.querySelector(".escolha-cartao-dica");
    if (antiga) antiga.remove();
    clearTimeout(timerDica);
    var dica = document.createElement("span");
    dica.className = "escolha-cartao-dica";
    dica.textContent = texto;
    cartao.appendChild(dica);
    timerDica = setTimeout(function () {
      dica.remove();
    }, 3500);
  }

  // a estrelinha ciano do fundo: cada toque brilha um pouco mais; N toques seguidos destravam
  function tocarEstrela() {
    var p = proximoSecreto();
    if (!p || !passo) return;
    var agora = performance.now();
    toquesEstrela = agora - ultimoToque > 4000 ? 1 : toquesEstrela + 1;
    ultimoToque = agora;
    var estrela = $("escolha-estrela");
    estrela.style.setProperty("--carga", Math.min(1, toquesEstrela / p.secreto.toques));
    estrela.classList.remove("pulso");
    void estrela.offsetWidth;
    estrela.classList.add("pulso");
    if (toquesEstrela < p.secreto.toques) {
      Musica.efeito("avancar");
      return;
    }
    toquesEstrela = 0;
    liberar(p);
  }

  function liberar(p) {
    liberados[p.id] = true;
    var tela = $("tela-escolha");
    var hack = $("escolha-hack");
    hack.textContent = p.secreto.aviso || "";
    hack.setAttribute("data-texto", hack.textContent);
    tela.classList.add("hackeando");
    Musica.efeito("decifrar");
    passo = 0; // sem cliques durante o efeito
    setTimeout(function () {
      tela.classList.remove("hackeando");
      atualizarEstrela();
      montarCategorias();
      selecionado = p.id;
      abrirCategoria(p.categoria, true);
      var cartao = document.querySelector('.escolha-cartao[data-id="' + p.id + '"]');
      if (cartao) cartao.classList.add("revelado");
    }, 1500);
  }

  function atualizarEstrela() {
    var estrela = $("escolha-estrela");
    estrela.hidden = !proximoSecreto();
    estrela.style.setProperty("--carga", 0);
  }

  // ---- o personagem escolhido vale pro jogo todo ----

  function aplicar(id) {
    var p = buscar(id);
    if (!p || p.disponivel === false || trancado(p)) p = buscar(PROTAGONISTA_PADRAO);
    var prot = PERSONAGENS.protagonista;
    prot.visual = p.id;
    prot.genero = p.categoria;
    prot.sprite = p.sprite;
    prot.cor = p.cor;
    prot.nomeSugerido = (p.secreto && p.secreto.nomeSugerido) || null;
    prot.modoCriador = !!(p.secreto && p.secreto.modoCriador);
    estado.protagonista = p.id;
    try {
      window.sessionStorage.setItem(CHAVE_SESSAO, p.id);
    } catch (e) {}
    return p;
  }

  function salvo() {
    try {
      return window.sessionStorage.getItem(CHAVE_SESSAO);
    } catch (e) {
      return null;
    }
  }

  // ---- fundo animado (o mesmo GIF/vídeo da chuva de estrelas) ----

  function montarFundo() {
    var cfg = typeof CONFIG !== "undefined" && CONFIG.escolhaPersonagem;
    var caixa = $("escolha-fundo");
    if (fundoMontado || !cfg || !cfg.fundo) return;
    fundoMontado = true;

    function semMidia() {
      caixa.innerHTML = "";
      caixa.classList.add("sem-midia"); // fica o céu desenhado em CSS
    }

    if (VIDEO.test(cfg.fundo)) {
      var video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("aria-hidden", "true");
      var alternativa = /\.mp4$/i.test(cfg.fundo) ? cfg.fundo.replace(/\.mp4$/i, ".webm") : null;
      video.onerror = function () {
        if (alternativa) {
          video.src = alternativa;
          alternativa = null;
          return;
        }
        semMidia();
      };
      video.onloadeddata = function () {
        caixa.classList.add("carregado");
      };
      video.src = cfg.fundo;
      caixa.appendChild(video);
    } else {
      var img = new Image();
      img.alt = "";
      img.onload = function () {
        caixa.classList.add("carregado");
      };
      img.onerror = semMidia;
      img.src = cfg.fundo;
      caixa.appendChild(img);
    }
  }

  function tocarFundo(tocar) {
    var video = $("escolha-fundo").querySelector("video");
    if (!video) return;
    if (tocar) video.play().catch(function () {});
    else video.pause(); // fora da tela não gasta processamento
  }

  // ---- passo 1: categoria ----

  function montarCategorias() {
    var caixa = $("escolha-categorias");
    caixa.innerHTML = "";
    CATEGORIAS_PROTAGONISTA.forEach(function (cat) {
      var lista = daCategoria(cat.id).filter(function (p) {
        return !trancado(p); // o secreto não aparece na prévia
      });
      if (!lista.length) return;
      var botao = document.createElement("button");
      botao.type = "button";
      botao.className = "escolha-categoria";
      botao.dataset.categoria = cat.id;
      botao.innerHTML =
        '<span class="escolha-categoria-poneis" aria-hidden="true">' +
        lista
          .map(function (p) {
            return '<img src="' + p.sprite + '" alt="" draggable="false" />';
          })
          .join("") +
        "</span>" +
        '<span class="escolha-categoria-rotulo">' +
        cat.rotulo +
        "</span>" +
        '<span class="escolha-categoria-quantos">' +
        lista.length +
        (lista.length === 1 ? " personagem" : " personagens") +
        "</span>";
      botao.onclick = function () {
        if (!pronto()) return;
        Musica.efeito("interagir");
        abrirCategoria(cat.id, true);
      };
      caixa.appendChild(botao);
    });
  }

  function mostrarPasso(n) {
    passo = n;
    prontoEm = performance.now() + ESPERA_INICIAL_MS;
    $("escolha-passo-categoria").hidden = n !== 1;
    $("escolha-passo-personagem").hidden = n !== 2;
    $("escolha-subtitulo").textContent =
      n === 1 ? "Primeiro, escolha uma categoria" : "Toque em um personagem e confirme";
  }

  function abrirPassoCategoria() {
    mostrarPasso(1);
    var atual = buscar(selecionado);
    var alvo = document.querySelector(
      '.escolha-categoria[data-categoria="' + (atual ? atual.categoria : CATEGORIAS_PROTAGONISTA[0].id) + '"]'
    );
    focar(alvo);
  }

  // ---- passo 2: personagens ----

  function montarAbas() {
    var caixa = $("escolha-abas");
    caixa.innerHTML = "";
    CATEGORIAS_PROTAGONISTA.forEach(function (cat) {
      if (!daCategoria(cat.id).length) return;
      var aba = document.createElement("button");
      aba.type = "button";
      aba.className = "escolha-aba";
      aba.setAttribute("role", "tab");
      aba.dataset.categoria = cat.id;
      aba.textContent = cat.rotulo;
      aba.onclick = function () {
        if (!pronto() || cat.id === categoria) return;
        Musica.efeito("interagir");
        abrirCategoria(cat.id, false);
      };
      caixa.appendChild(aba);
    });
  }

  function abrirCategoria(cat, novoPasso) {
    categoria = cat;
    var atual = buscar(selecionado);
    if (!atual || atual.categoria !== cat || atual.disponivel === false) {
      var lista = disponiveis(cat);
      selecionado = lista.length ? lista[0].id : null;
    }

    Array.prototype.forEach.call(document.querySelectorAll(".escolha-aba"), function (aba) {
      var ativa = aba.dataset.categoria === cat;
      aba.classList.toggle("ativa", ativa);
      aba.setAttribute("aria-selected", ativa ? "true" : "false");
    });

    var caixa = $("escolha-cartoes");
    caixa.innerHTML = "";
    daCategoria(cat).forEach(function (p, i) {
      var cartao = document.createElement("button");
      cartao.type = "button";
      cartao.className = "escolha-cartao";
      cartao.style.animationDelay = i * 0.06 + "s";
      cartao.setAttribute("role", "radio");
      cartao.dataset.id = p.id;
      var indisponivel = p.disponivel === false;
      var secreto = trancado(p);
      if (indisponivel) cartao.classList.add("indisponivel");
      if (secreto) cartao.classList.add("secreto");
      if (indisponivel || secreto) cartao.setAttribute("aria-disabled", "true");
      cartao.innerHTML =
        '<span class="escolha-cartao-palco"><img src="' +
        p.sprite +
        '" alt="" draggable="false" />' +
        (secreto ? '<span class="escolha-cartao-cadeado" aria-hidden="true"></span>' : "") +
        "</span>" +
        '<span class="escolha-cartao-nome">' +
        (secreto ? "???" : p.nome) +
        "</span>" +
        (indisponivel ? '<span class="escolha-cartao-selo">Em breve</span>' : "") +
        '<span class="escolha-cartao-marca" aria-hidden="true"></span>';
      cartao.onclick = function () {
        if (!pronto()) return;
        if (secreto) {
          Musica.efeito("trancado");
          mostrarDica(cartao, p.secreto.dica);
          return;
        }
        if (indisponivel) {
          Musica.efeito("trancado");
          return;
        }
        if (selecionado !== p.id) Musica.efeito("avancar");
        marcar(p.id);
      };
      caixa.appendChild(cartao);
    });

    if (novoPasso) mostrarPasso(2);
    marcar(selecionado, true);
  }

  // destaca o card escolhido e atualiza a ficha
  function marcar(id, semFoco) {
    selecionado = id;
    Array.prototype.forEach.call(document.querySelectorAll(".escolha-cartao"), function (c) {
      var sim = c.dataset.id === id;
      c.classList.toggle("selecionado", sim);
      c.setAttribute("aria-checked", sim ? "true" : "false");
      c.tabIndex = sim ? 0 : -1; // setas trocam dentro do grupo; Tab vai pros botões
    });
    var p = buscar(id);
    var ficha = $("escolha-ficha");
    ficha.classList.remove("trocou");
    void ficha.offsetWidth; // reinicia a animação da ficha
    ficha.classList.add("trocou");
    $("escolha-nome").textContent = p ? p.nome : "";
    $("escolha-nome").style.color = p ? p.cor : "";
    $("escolha-tracos").innerHTML = p
      ? p.tracos
          .map(function (t) {
            return "<li>" + t + "</li>";
          })
          .join("")
      : "";
    $("escolha-confirmar").disabled = !p;
    if (!semFoco) focar(document.querySelector('.escolha-cartao[data-id="' + id + '"]'));
  }

  function moverSelecao(direcao) {
    var lista = disponiveis(categoria);
    if (!lista.length) return;
    var i = 0;
    lista.forEach(function (p, k) {
      if (p.id === selecionado) i = k;
    });
    var novo = lista[(i + direcao + lista.length) % lista.length];
    if (novo.id !== selecionado) Musica.efeito("avancar");
    marcar(novo.id);
  }

  // ---- entrada ----

  function pronto() {
    return passo !== 0 && performance.now() >= prontoEm;
  }

  // no celular não puxa foco (evita o contorno de foco aparecendo sem teclado)
  function focar(elemento) {
    if (elemento && !document.body.classList.contains("toque")) elemento.focus({ preventScroll: true });
  }

  function aoTecla(e) {
    if (!passo) return;
    var tecla = e.key;
    if (passo === 1) {
      if (tecla === "ArrowLeft" || tecla === "ArrowRight" || tecla === "a" || tecla === "d") {
        e.preventDefault();
        var botoes = Array.prototype.slice.call(document.querySelectorAll(".escolha-categoria"));
        var i = botoes.indexOf(document.activeElement);
        var d = tecla === "ArrowLeft" || tecla === "a" ? -1 : 1;
        focar(botoes[(i + d + botoes.length) % botoes.length] || botoes[0]);
      }
      return; // Enter/Espaço no botão focado já "clica" sozinho
    }
    if (!pronto()) return;
    if (tecla === "ArrowLeft" || tecla === "a") {
      e.preventDefault();
      moverSelecao(-1);
    } else if (tecla === "ArrowRight" || tecla === "d") {
      e.preventDefault();
      moverSelecao(1);
    } else if (tecla === "Escape" || tecla === "Backspace") {
      e.preventDefault();
      voltar();
    } else if (tecla === "Enter") {
      var alvo = document.activeElement;
      // Enter num botão que não seja card (Voltar, abas) faz o que o botão faz
      if (alvo && alvo.tagName === "BUTTON" && !alvo.classList.contains("escolha-cartao")) return;
      e.preventDefault();
      confirmar();
    }
  }

  function voltar() {
    if (!pronto()) return;
    Musica.efeito("interagir");
    abrirPassoCategoria();
  }

  function confirmar() {
    if (!pronto() || !selecionado) return;
    var p = aplicar(selecionado);
    passo = 0;
    document.removeEventListener("keydown", aoTecla);
    var cartao = document.querySelector('.escolha-cartao[data-id="' + p.id + '"]');
    if (cartao) cartao.classList.add("confirmado");
    Musica.efeito("item");
    setTimeout(function () {
      Interface.transicao(function () {
        $("tela-escolha").hidden = true;
        tocarFundo(false);
        if (aoConfirmar) aoConfirmar(p);
      });
    }, 380);
  }

  // ---- abrir ----
  // aoFim(personagem) é chamado depois da confirmação. Se já houver uma escolha (jogador
  // voltou da tela do nome pra trocar), abre direto nos personagens dela, já marcada.

  function abrir(aoFim) {
    aoConfirmar = aoFim;
    montarFundo();
    montarCategorias();
    montarAbas();
    $("escolha-voltar").onclick = voltar;
    $("escolha-confirmar").onclick = confirmar;
    $("escolha-estrela").onclick = tocarEstrela;
    atualizarEstrela();
    document.removeEventListener("keydown", aoTecla);
    document.addEventListener("keydown", aoTecla);

    var anterior = buscar(estado.protagonista && estado.escolheuProtagonista ? estado.protagonista : salvo());
    selecionado = anterior && anterior.disponivel !== false ? anterior.id : null;

    $("tela-escolha").hidden = false;
    tocarFundo(true);
    if (estado.escolheuProtagonista && selecionado) abrirCategoria(buscar(selecionado).categoria, true);
    else abrirPassoCategoria();
    estado.escolheuProtagonista = true;
  }

  // já deixa um protagonista válido desde o início (menu e desfiles são montados antes)
  aplicar(salvo() || PROTAGONISTA_PADRAO);

  return { abrir: abrir, aplicar: aplicar };
})();
