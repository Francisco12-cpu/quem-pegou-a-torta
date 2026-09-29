// engine-exploracao.js — a protagonista andando pelo mapa, estilo plataforma 2D.
// Ela só anda na horizontal, sobre a linha do chão do cenário (sem pulo). Pônei e baú ficam
// numa camada do cenário: ela passa na frente (ou por trás) deles sem colidir, e quando está
// perto aparece a opção de interagir. Chegar na borda direita/esquerda sai da tela — quem
// decide pra onde vai é main.js. Todas as posições vêm de dados/casas.js.

var MotorExploracao = (function () {
  "use strict";

  var PROPORCAO = 16 / 9; // todos os cenários são 16:9 (ferramentas/preparar-assets.py)
  var VELOCIDADE = 24; // % da largura da cena por segundo
  var ACELERACAO = 10; // quão rápido chega na velocidade (maior = mais seco)
  var RAIO_PONEI = 8; // distância (em % da largura) pra poder interagir
  var RAIO_BAU = 6;
  var MARGEM_BORDA = 1.5; // ao passar disso, sai pela borda
  var BATIDA_BORDA = 5; // onde para quando a borda está trancada (sem cortar o sprite)

  var el = {};
  var tela = null;
  var opcoes = {};
  var ativo = false;
  var rafId = null;
  var ultimoT = 0;

  var jogador = { x: 10, v: 0, olhandoDireita: true, fase: 0 };
  var acompanhante = null; // { id, x, olhandoDireita, fase }
  var pontos = []; // [{ dados, el, x }]
  var pontoPerto = null;
  var alvo = null; // { x, ponto } quando anda sozinho até um clique/toque
  var teclas = { esquerda: false, direita: false };
  var toque = { esquerda: false, direita: false };
  var avisoAte = 0;
  var inicioTela = 0;
  var ESPERA_INICIAL_MS = 250; // a tecla/clique que fechou o diálogo não reabre nada aqui

  function $(id) {
    return document.getElementById(id);
  }

  function pegarElementos() {
    el.overlay = $("exploracao-overlay");
    el.fundoDesfocado = $("exploracao-fundo-desfocado");
    el.cena = $("exploracao-cena");
    el.chao = $("exploracao-chao");
    el.pontos = $("exploracao-pontos");
    el.protagonista = $("exploracao-protagonista");
    el.acompanhante = $("exploracao-acompanhante");
    el.balao = $("exploracao-balao");
    el.aviso = $("exploracao-aviso");
    el.setaDireita = $("exploracao-seta-direita");
    el.setaEsquerda = $("exploracao-seta-esquerda");
    el.toqueEsquerda = $("toque-esquerda");
    el.toqueDireita = $("toque-direita");
    el.toqueAcao = $("toque-acao");

    el.protagonista.innerHTML = htmlAtor(PERSONAGENS.protagonista);
    ligarEventos();
  }

  function htmlAtor(p) {
    return '<div class="ator-corpo">' + htmlVisualPersonagem(p) + "</div>";
  }

  // ---- tamanho da cena: sempre 16:9, ocupando a largura toda ----
  // Se a tela for mais "baixa" que 16:9 (monitor ultrawide, celular deitado), corta o céu e
  // mantém o chão. Se for mais "alta" (celular em pé, 4:3), centraliza e preenche o resto com
  // o próprio cenário desfocado.

  function ajustarCena() {
    if (!el.overlay || el.overlay.hidden) return;
    var largura = el.overlay.clientWidth;
    var altura = el.overlay.clientHeight;
    var alturaCena = largura / PROPORCAO;
    var topo = alturaCena > altura ? altura - alturaCena : (altura - alturaCena) / 2;
    if (document.body.classList.contains("modo-retrato") && alturaCena < altura) {
      topo = Math.max(0, (altura - alturaCena) * 0.38); // deixa espaço pros botões embaixo
    }
    el.cena.style.width = largura + "px";
    el.cena.style.height = alturaCena + "px";
    el.cena.style.top = topo + "px";
    el.cena.style.setProperty("--altura-cena", alturaCena + "px");
  }

  // ---- montagem da tela ----

  function montarPontos() {
    el.pontos.innerHTML = "";
    pontos = (tela.pontos || []).map(function (dados) {
      var marcador = document.createElement("div");
      marcador.className = "ponto ponto-" + dados.tipo + " camada-" + (dados.camada || "fundo");
      marcador.style.left = dados.x + "%";
      marcador.style.top = tela.chao + "%";
      marcador.dataset.pontoId = dados.id;

      if (dados.tipo === "ponei") {
        var p = PERSONAGENS[dados.id];
        marcador.style.height = tela.escala + "%";
        marcador.innerHTML = htmlAtor(p) + '<div class="ponto-nome">' + p.nome + "</div>";
      } else if (dados.tipo === "bau") {
        marcador.style.height = tela.escala * 0.36 + "%";
        marcador.innerHTML = '<img src="assets/itens/bau-fechado.png" alt="Baú" draggable="false" />';
      }
      el.pontos.appendChild(marcador);
      return { dados: dados, el: marcador, x: dados.x };
    });
  }

  function aplicarTela() {
    el.chao.className = "fundo-" + tela.fundo;
    el.fundoDesfocado.className = "fundo-" + tela.fundo;
    el.cena.style.setProperty("--chao", tela.chao + "%");
    el.protagonista.style.height = tela.escala + "%";
    el.protagonista.style.top = tela.chao + "%";
    el.acompanhante.style.height = tela.escala * 0.94 + "%";
    el.acompanhante.style.top = tela.chao + "%";
    montarPontos();
  }

  // ---- movimento ----

  function direcaoDesejada() {
    var esquerda = teclas.esquerda || toque.esquerda;
    var direita = teclas.direita || toque.direita;
    if (esquerda && !direita) return -1;
    if (direita && !esquerda) return 1;
    if (esquerda || direita) return 0;
    if (alvo) {
      var dx = alvo.x - jogador.x;
      if (Math.abs(dx) < 0.8) return 0;
      return dx > 0 ? 1 : -1;
    }
    return 0;
  }

  function bordaTrancada(lado) {
    return lado === "direita" ? opcoes.direitaTrancada : opcoes.esquerdaTrancada;
  }

  function atualizar(dt, t) {
    var dir = direcaoDesejada();
    if (dir !== 0 && (teclas.esquerda || teclas.direita || toque.esquerda || toque.direita)) alvo = null;

    var vAlvo = dir * VELOCIDADE;
    jogador.v += (vAlvo - jogador.v) * Math.min(1, ACELERACAO * dt);
    if (Math.abs(jogador.v) < 0.05 && dir === 0) jogador.v = 0;
    jogador.x += jogador.v * dt;
    if (dir !== 0) jogador.olhandoDireita = dir > 0;

    // bordas
    if (jogador.x > 100 - MARGEM_BORDA) {
      var msgD = bordaTrancada("direita");
      if (msgD) {
        jogador.x = 100 - BATIDA_BORDA;
        jogador.v = 0;
        alvo = null;
        mostrarAviso(msgD, t);
      } else {
        sair("direita");
        return;
      }
    } else if (jogador.x < MARGEM_BORDA) {
      var msgE = bordaTrancada("esquerda");
      if (msgE) {
        jogador.x = BATIDA_BORDA;
        jogador.v = 0;
        alvo = null;
        if (msgE !== true) mostrarAviso(msgE, t);
      } else {
        sair("esquerda");
        return;
      }
    }

    if (Math.abs(jogador.v) > 0.5) jogador.fase += dt * 11;

    // acompanhante vem atrás, com um pouco de atraso
    if (acompanhante) {
      var atras = jogador.x + (jogador.olhandoDireita ? -9 : 9);
      var dxA = atras - acompanhante.x;
      var vA = Math.max(-VELOCIDADE * 1.1, Math.min(VELOCIDADE * 1.1, dxA * 3));
      acompanhante.x += vA * dt;
      if (Math.abs(vA) > 1) {
        acompanhante.olhandoDireita = vA > 0;
        acompanhante.fase += dt * 11;
      } else {
        acompanhante.olhandoDireita = jogador.x > acompanhante.x;
      }
    }

    atualizarPontoPerto();

    // chegou no alvo de um clique em pônei/baú: interage sozinho
    if (alvo && alvo.ponto && pontoPerto === alvo.ponto && Math.abs(jogador.v) < VELOCIDADE * 0.6) {
      alvo = null;
      interagir();
    } else if (alvo && !alvo.ponto && Math.abs(alvo.x - jogador.x) < 0.8) {
      alvo = null;
    }
  }

  function atualizarPontoPerto() {
    var melhor = null;
    var melhorD = Infinity;
    pontos.forEach(function (p) {
      var raio = p.dados.tipo === "bau" ? RAIO_BAU : RAIO_PONEI;
      var d = Math.abs(p.x - jogador.x);
      if (d <= raio && d < melhorD) {
        melhor = p;
        melhorD = d;
      }
    });
    if (melhor !== pontoPerto) {
      if (pontoPerto) pontoPerto.el.classList.remove("perto");
      pontoPerto = melhor;
      if (pontoPerto) pontoPerto.el.classList.add("perto");
      atualizarBalao();
    }
  }

  function textoInteracao(p) {
    if (!p) return "";
    if (p.dados.tipo === "bau") return "Abrir baú";
    return "Conversar";
  }

  function atualizarBalao() {
    if (!pontoPerto) {
      el.balao.hidden = true;
      el.toqueAcao.hidden = true;
      return;
    }
    var texto = textoInteracao(pontoPerto);
    el.balao.innerHTML = '<kbd class="so-teclado">E</kbd>' + texto;
    // sempre acima das cabeças (o baú é baixinho e fica atrás da protagonista)
    el.balao.style.left = pontoPerto.x + "%";
    el.balao.style.top = tela.chao - tela.escala - 4 + "%";
    el.balao.hidden = false;
    el.balao.classList.remove("aparecendo");
    void el.balao.offsetWidth;
    el.balao.classList.add("aparecendo");
    el.toqueAcao.textContent = texto;
    el.toqueAcao.hidden = false;
  }

  function mostrarAviso(texto, t) {
    if (t < avisoAte) return;
    avisoAte = t + 1600;
    Musica.efeito("trancado");
    el.aviso.textContent = texto;
    el.aviso.hidden = false;
    el.aviso.classList.remove("aparecendo");
    void el.aviso.offsetWidth;
    el.aviso.classList.add("aparecendo");
    clearTimeout(mostrarAviso._timer);
    mostrarAviso._timer = setTimeout(function () {
      el.aviso.hidden = true;
    }, 2400);
  }

  // ---- desenho ----

  function desenharAtor(elemento, x, olhandoDireita, fase, andando) {
    elemento.style.left = x + "%";
    var pulo = andando ? Math.abs(Math.sin(fase)) * 4 : 0;
    var giro = andando ? Math.sin(fase) * 2.5 : 0;
    elemento.style.setProperty("--pulo", -pulo + "%");
    elemento.style.setProperty("--giro", giro + "deg");
    elemento.classList.toggle("olhando-direita", olhandoDireita);
    elemento.classList.toggle("andando", andando);
  }

  function desenhar() {
    desenharAtor(el.protagonista, jogador.x, jogador.olhandoDireita, jogador.fase, Math.abs(jogador.v) > 0.5);
    if (acompanhante) {
      var andandoA = Math.abs(jogador.x + (jogador.olhandoDireita ? -9 : 9) - acompanhante.x) > 1.2;
      desenharAtor(el.acompanhante, acompanhante.x, acompanhante.olhandoDireita, acompanhante.fase, andandoA);
    }
    // pôneis viram de frente pra protagonista; camada da frente fica translúcida por cima dela
    pontos.forEach(function (p) {
      if (p.dados.tipo === "ponei") p.el.classList.toggle("olhando-direita", jogador.x > p.x);
      if (p.dados.camada === "frente") p.el.classList.toggle("sobreposto", Math.abs(p.x - jogador.x) < 6);
    });
    el.setaDireita.hidden = !!opcoes.direitaTrancada;
    el.setaEsquerda.hidden = !!opcoes.esquerdaTrancada;
  }

  function loop(t) {
    if (!ativo) return;
    var dt = Math.min(0.05, (t - ultimoT) / 1000 || 0);
    ultimoT = t;
    atualizar(dt, t);
    if (!ativo) return; // saiu pela borda durante o atualizar
    desenhar();
    rafId = requestAnimationFrame(loop);
  }

  // ---- ações ----

  function interagir() {
    if (!ativo || !pontoPerto) return;
    if (performance.now() - inicioTela < ESPERA_INICIAL_MS) return;
    var p = pontoPerto;
    Musica.efeito("interagir");
    pararTela();
    if (opcoes.aoInteragir) opcoes.aoInteragir(p.dados);
  }

  function sair(lado) {
    Musica.efeito("passagem");
    pararTela();
    if (opcoes.aoSair) opcoes.aoSair(lado);
  }

  // ---- entrada ----

  var TECLAS_ESQUERDA = { ArrowLeft: true, KeyA: true };
  var TECLAS_DIREITA = { ArrowRight: true, KeyD: true };
  var TECLAS_ACAO = { KeyE: true, Enter: true, Space: true, ArrowUp: true, KeyW: true };

  function aoTeclaBaixo(e) {
    if (!ativo) return;
    if (TECLAS_ESQUERDA[e.code]) {
      teclas.esquerda = true;
      e.preventDefault();
    } else if (TECLAS_DIREITA[e.code]) {
      teclas.direita = true;
      e.preventDefault();
    } else if (TECLAS_ACAO[e.code] && !e.repeat) {
      e.preventDefault();
      e.stopImmediatePropagation();
      interagir();
    }
  }

  function aoTeclaCima(e) {
    if (TECLAS_ESQUERDA[e.code]) teclas.esquerda = false;
    if (TECLAS_DIREITA[e.code]) teclas.direita = false;
  }

  function segurarBotao(botao, lado) {
    function soltar() {
      toque[lado] = false;
      botao.classList.remove("pressionado");
    }
    botao.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (botao.setPointerCapture) {
        try {
          botao.setPointerCapture(e.pointerId);
        } catch (erro) {}
      }
      toque[lado] = true;
      botao.classList.add("pressionado");
    });
    botao.addEventListener("pointerup", soltar);
    botao.addEventListener("pointercancel", soltar);
    botao.addEventListener("lostpointercapture", soltar);
    botao.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });
  }

  function aoTocarCena(e) {
    if (!ativo) return;
    if (e.target.closest("button")) return;
    var r = el.cena.getBoundingClientRect();
    var x = ((e.clientX - r.left) / r.width) * 100;
    var alvoEl = e.target.closest(".ponto");
    var ponto = null;
    if (alvoEl) {
      pontos.forEach(function (p) {
        if (p.el === alvoEl) ponto = p;
      });
    }
    if (ponto) {
      if (pontoPerto === ponto) {
        interagir();
        return;
      }
      alvo = { x: ponto.x, ponto: ponto };
    } else {
      // tocar perto das bordas leva pra fora da tela
      alvo = { x: x < 4 ? -5 : x > 96 ? 105 : Math.max(0, Math.min(100, x)), ponto: null };
    }
  }

  function ligarEventos() {
    document.addEventListener("keydown", aoTeclaBaixo);
    document.addEventListener("keyup", aoTeclaCima);
    window.addEventListener("blur", function () {
      teclas.esquerda = teclas.direita = false;
      toque.esquerda = toque.direita = false;
    });
    el.overlay.addEventListener("pointerdown", aoTocarCena);
    el.overlay.addEventListener("click", function (e) {
      e.stopPropagation(); // nunca vaza pro motor de diálogo
    });
    segurarBotao(el.toqueEsquerda, "esquerda");
    segurarBotao(el.toqueDireita, "direita");
    el.toqueAcao.addEventListener("click", function (e) {
      e.stopPropagation();
      interagir();
    });
    window.addEventListener("resize", ajustarCena);
  }

  // ---- API pública ----

  // tela: item de TELAS (dados/casas.js)
  // opcoes: { entrarPor: "esquerda"|"direita", xInicial, direitaTrancada, esquerdaTrancada,
  //           pontosOcultos: {id: true}, acompanhante: id|null, aoInteragir(ponto), aoSair(lado) }
  function iniciarTela(novaTela, novasOpcoes) {
    if (!el.overlay) pegarElementos();
    tela = novaTela;
    opcoes = novasOpcoes || {};

    tela = Object.assign({}, novaTela, {
      pontos: (novaTela.pontos || []).filter(function (p) {
        return !(opcoes.pontosOcultos && opcoes.pontosOcultos[p.id]);
      }),
    });

    el.overlay.hidden = false;
    ajustarCena();
    aplicarTela();

    var entrouPelaDireita = opcoes.entrarPor === "direita";
    jogador.x = opcoes.xInicial != null ? opcoes.xInicial : entrouPelaDireita ? 100 - BATIDA_BORDA - 1 : BATIDA_BORDA + 1;
    jogador.v = 0;
    jogador.olhandoDireita = !entrouPelaDireita;
    jogador.fase = 0;
    alvo = null;
    teclas.esquerda = teclas.direita = false;
    toque.esquerda = toque.direita = false;
    pontoPerto = null;
    el.balao.hidden = true;
    el.toqueAcao.hidden = true;
    el.aviso.hidden = true;

    if (opcoes.acompanhante) {
      el.acompanhante.innerHTML = htmlAtor(PERSONAGENS[opcoes.acompanhante]);
      el.acompanhante.hidden = false;
      acompanhante = {
        id: opcoes.acompanhante,
        x: jogador.x + (entrouPelaDireita ? 7 : -7),
        olhandoDireita: jogador.olhandoDireita,
        fase: 0,
      };
    } else {
      el.acompanhante.hidden = true;
      acompanhante = null;
    }

    atualizarPontoPerto();
    desenhar();
    ativo = true;
    inicioTela = ultimoT = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function pararTela() {
    ativo = false;
    if (rafId) cancelAnimationFrame(rafId);
    teclas.esquerda = teclas.direita = false;
    toque.esquerda = toque.direita = false;
  }

  function esconder() {
    pararTela();
    if (el.overlay) el.overlay.hidden = true;
  }

  function posicaoJogador() {
    return jogador.x;
  }

  return {
    iniciarTela: iniciarTela,
    pararTela: pararTela,
    esconder: esconder,
    posicaoJogador: posicaoJogador,
  };
})();
