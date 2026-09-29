// engine-dialogo.js — renderiza fala, opções, timer, histórico.
// Não conhece o conteúdo de nenhuma cena: só sabe como desenhar o que `dados/cena-*.js` descreve,
// no formato definido em ARQUITETURA.md. Campos extras aceitos numa fala:
//   mostrarItem: "torta"  -> mostra o cartão do item (dados/itens.js) enquanto a fala está na tela
//   quemFala: "todas"     -> fala coletiva: todas as pôneis no palco ficam em destaque

var MotorDialogo = (function () {
  "use strict";

  var elementos = {};
  var cenaAtualObj = null;
  var indiceAtual = -1;
  var filaEspecial = []; // passos intermediários (fala do jogador escolhida, saltos de id)
  var escolhaAtiva = false;
  var timeoutEscolha = null;
  var aoTerminarCallback = null;
  var palcoState = { esquerda: null, direita: null };
  var ativo = false;
  var inicioCena = 0;
  var ESPERA_INICIAL_MS = 250; // o mesmo clique/tecla que abriu a conversa não pula a 1ª fala
  var TEMPO_PADRAO_ESCOLHA = 15; // segundos, pra escolhas sem `tempoLimite`

  function pegarElementos() {
    elementos = {
      jogo: document.getElementById("jogo"),
      cenario: document.getElementById("cenario"),
      personagemEsquerda: document.getElementById("personagem-esquerda"),
      personagemDireita: document.getElementById("personagem-direita"),
      personagemProtagonista: document.getElementById("personagem-protagonista"),
      caixaDialogo: document.getElementById("caixa-dialogo"),
      nomeFalante: document.getElementById("nome-falante"),
      textoFala: document.getElementById("texto-fala"),
      barraTempo: document.getElementById("barra-tempo"),
      areaOpcoes: document.getElementById("area-opcoes"),
    };
  }

  function buscarPersonagem(id) {
    return (typeof PERSONAGENS !== "undefined" && PERSONAGENS[id]) || null;
  }

  function buscarIndicePorId(id) {
    for (var i = 0; i < cenaAtualObj.falas.length; i++) {
      if (cenaAtualObj.falas[i].id === id) return i;
    }
    console.warn('MotorDialogo: nenhuma fala com id "' + id + '" encontrada em ' + cenaAtualObj.id);
    return -1;
  }

  // ---- Palco (personagens presentes, quem fala fica destacado, o resto escurecido) ----
  // Regra inegociável (ARQUITETURA.md): a protagonista tem um 3º espaço fixo, separado dos
  // dois espaços de pônei — ela está sempre visível na tela, em toda cena de diálogo, desde
  // o início da cena, nunca some. Isso corrige o bug da v1 (ela só existia como texto).

  function atualizarPalco(fala) {
    var quemFala = fala.quemFala;
    var ehNarrador = !quemFala || quemFala === "narrador";
    var ehProtagonista = quemFala === "protagonista";
    var p = buscarPersonagem(quemFala);
    var ehGrupo = !!(p && p.grupo);

    if (!ehNarrador && !ehProtagonista && !ehGrupo && fala.lado) {
      palcoState[fala.lado] = quemFala;
    }

    var quemFalaNosPoneis = ehGrupo ? "*" : ehNarrador || ehProtagonista ? null : quemFala;
    renderizarSlot("esquerda", quemFalaNosPoneis);
    renderizarSlot("direita", quemFalaNosPoneis);
    renderizarProtagonista(ehProtagonista);
  }

  function htmlPersonagemNoPalco(p) {
    return htmlVisualPersonagem(p) + '<div class="nome-personagem">' + p.nome + "</div>";
  }

  function renderizarProtagonista(estaFalando) {
    var el = elementos.personagemProtagonista;
    var p = buscarPersonagem("protagonista");
    if (!p) return;

    if (el.dataset.montado !== "protagonista") {
      el.innerHTML = htmlPersonagemNoPalco(p);
      el.dataset.montado = "protagonista";
    }

    el.hidden = false; // sempre visível, nunca some (ver comentário acima)
    el.classList.toggle("falando", estaFalando);
    el.classList.toggle("escurecido", !estaFalando);
  }

  function renderizarSlot(lado, quemEstaFalandoAgora) {
    var el = lado === "esquerda" ? elementos.personagemEsquerda : elementos.personagemDireita;
    var idOcupante = palcoState[lado];

    if (!idOcupante) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }

    var p = buscarPersonagem(idOcupante);
    if (!p) return;

    var entrando = el.hidden || el.dataset.montado !== idOcupante;
    el.hidden = false;
    if (!el.dataset.montado || el.dataset.montado !== idOcupante) {
      el.innerHTML = htmlPersonagemNoPalco(p);
      el.dataset.montado = idOcupante;
    }
    if (entrando) {
      el.classList.remove("entrando");
      void el.offsetWidth;
      el.classList.add("entrando");
    }

    var estaFalando = quemEstaFalandoAgora === "*" || quemEstaFalandoAgora === idOcupante;
    el.classList.toggle("falando", estaFalando);
    el.classList.toggle("escurecido", !estaFalando);
  }

  function resetarPalco() {
    palcoState = { esquerda: null, direita: null };
    elementos.personagemEsquerda.hidden = true;
    elementos.personagemEsquerda.innerHTML = "";
    elementos.personagemEsquerda.dataset.montado = "";
    elementos.personagemDireita.hidden = true;
    elementos.personagemDireita.innerHTML = "";
    elementos.personagemDireita.dataset.montado = "";
    renderizarProtagonista(false); // aparece já no início da cena, só ainda não é ela quem fala
  }

  // ---- Histórico (o painel em si é desenhado por interface.js) ----

  function registrarHistorico(nomeFalante, texto, cor) {
    estado.historicoDialogo.push({ falante: nomeFalante, texto: texto, cor: cor || "" });
  }

  // ---- Exibição de uma fala normal (de narrador ou personagem) ----

  function mostrarNome(nome, cor) {
    elementos.nomeFalante.textContent = nome;
    elementos.nomeFalante.hidden = !nome;
    elementos.nomeFalante.style.setProperty("--cor-falante", cor || "#ffd479");
  }

  // {nome} nas falas vira o nome que o jogador escolheu
  function comNome(texto) {
    return String(texto).replace(/\{nome\}/g, buscarPersonagem("protagonista").nome);
  }

  function mostrarTexto(texto) {
    texto = comNome(texto);
    elementos.textoFala.textContent = texto;
    elementos.textoFala.classList.remove("aparecendo");
    void elementos.textoFala.offsetWidth;
    elementos.textoFala.classList.add("aparecendo");
  }

  function exibirFala(fala) {
    limparOpcoes();
    atualizarPalco(fala);

    var ehNarrador = !fala.quemFala || fala.quemFala === "narrador";
    var p = buscarPersonagem(fala.quemFala);
    var nomeExibido = ehNarrador ? "" : p ? p.nome : "";

    mostrarNome(nomeExibido, ehNarrador ? "" : p ? p.cor : "");
    mostrarTexto(fala.texto);
    elementos.caixaDialogo.classList.toggle("narracao", ehNarrador);
    elementos.caixaDialogo.classList.remove("escolhendo");

    if (fala.mostrarItem) Interface.mostrarCartao(fala.mostrarItem);
    else Interface.esconderCartao();

    registrarHistorico(ehNarrador ? null : nomeExibido, comNome(fala.texto), p && p.cor);
  }

  // ---- Escolhas (decorativas ou reais) ----

  function exibirEscolha(fala) {
    escolhaAtiva = true;
    elementos.areaOpcoes.innerHTML = "";
    elementos.caixaDialogo.classList.add("escolhendo");
    Interface.esconderCartao();

    fala.opcoes.forEach(function (opcao, i) {
      var botao = document.createElement("button");
      botao.type = "button";
      botao.className = "opcao";
      botao.style.animationDelay = i * 0.06 + "s";
      botao.textContent = opcao.texto;
      botao.addEventListener("click", function (e) {
        e.stopPropagation();
        selecionarOpcao(fala, opcao);
      });
      elementos.areaOpcoes.appendChild(botao);
    });

    // toda escolha tem tempo; se a cena não disser quanto, usa o padrão
    iniciarBarraTempo(fala.tempoLimite || TEMPO_PADRAO_ESCOLHA, function () {
      // tempo esgotado: sorteia uma das opções
      var sorteada = fala.opcoes[Math.floor(Math.random() * fala.opcoes.length)];
      selecionarOpcao(fala, sorteada);
    });
  }

  function iniciarBarraTempo(segundos, aoEsgotar) {
    elementos.barraTempo.hidden = false;
    elementos.barraTempo.innerHTML = '<div class="preenchimento"></div>';
    var preenchimento = elementos.barraTempo.firstChild;

    preenchimento.style.transition = "none";
    preenchimento.style.width = "100%";
    // força reflow antes de iniciar a transição pra largura 0
    void preenchimento.offsetWidth;
    preenchimento.style.transition = "width " + segundos + "s linear";
    preenchimento.style.width = "0%";

    timeoutEscolha = setTimeout(function () {
      timeoutEscolha = null;
      aoEsgotar();
    }, segundos * 1000);
  }

  function pararBarraTempo() {
    if (timeoutEscolha) {
      clearTimeout(timeoutEscolha);
      timeoutEscolha = null;
    }
  }

  function limparOpcoes() {
    escolhaAtiva = false;
    pararBarraTempo();
    elementos.areaOpcoes.innerHTML = "";
    elementos.barraTempo.hidden = true;
    elementos.barraTempo.innerHTML = "";
  }

  function selecionarOpcao(falaEscolha, opcao) {
    if (!escolhaAtiva) return;
    pararBarraTempo();
    escolhaAtiva = false;
    elementos.areaOpcoes.innerHTML = "";
    elementos.barraTempo.hidden = true;
    Musica.efeito("interagir");

    var protagonista = buscarPersonagem("protagonista");
    registrarHistorico(protagonista.nome, opcao.texto, protagonista.cor);

    // Protagonista nunca ocupa bloco no palco (ver dados/cena-01-confeitaria.js) — só pôneis têm lado.
    var falaEscolhida = {
      quemFala: "protagonista",
      texto: opcao.texto,
    };

    if (falaEscolha.decorativa) {
      filaEspecial = [{ tipo: "saltar", id: opcao.proximaFala }];
    } else {
      // Acusação (cena-06): a reação usa as pistas reais já registradas em estado.pistas —
      // ver ARQUITETURA.md "Sistema de pistas". A convenção de id é: a fala com o raciocínio
      // da protagonista tem id "reacao-<suspeita>", e a negação da pônei acusada tem id
      // "nega-<suspeita>" (ambas escritas com as pistas de verdade em dados/cena-06-confronto.js,
      // nunca genéricas). Sem suspeita (opção "nenhuma delas"), só existe a primeira.
      estado.acusacaoEscolhida = opcao.suspeita;
      if (opcao.suspeita) {
        filaEspecial = [
          { tipo: "saltar", id: "reacao-" + opcao.suspeita },
          { tipo: "saltar", id: "nega-" + opcao.suspeita },
          { tipo: "saltar", id: falaEscolha.proximaFalaComum },
        ];
      } else {
        filaEspecial = [
          { tipo: "saltar", id: "reacao-nenhuma" },
          { tipo: "saltar", id: falaEscolha.proximaFalaComum },
        ];
      }
    }

    // a linha escolhida pelo jogador já foi registrada no histórico acima; exibe na caixa
    // sem duplicar o registro (exibirFala registraria de novo), então desenha direto:
    limparOpcoes();
    atualizarPalco(falaEscolhida);
    mostrarNome(protagonista.nome, protagonista.cor);
    mostrarTexto(falaEscolhida.texto);
    elementos.caixaDialogo.classList.remove("narracao", "escolhendo");
  }

  // ---- Avanço da conversa ----

  function processarProximoPasso() {
    var passo = filaEspecial.shift();
    if (passo.tipo === "saltar") {
      var idx = buscarIndicePorId(passo.id);
      if (idx === -1) {
        terminarCena();
        return;
      }
      indiceAtual = idx;
      renderizarFalaAtual();
    }
  }

  function renderizarFalaAtual() {
    var fala = cenaAtualObj.falas[indiceAtual];
    if (fala.escolha) {
      exibirEscolha(fala);
    } else if (fala.pista) {
      registrarPista(fala.pista);
      avancar(); // não pausa a conversa — só grava e segue
    } else {
      exibirFala(fala);
    }
  }

  // ---- Pistas: registra em estado.pistas pra cena-06 usar na acusação (ARQUITETURA.md) ----

  function registrarPista(pista) {
    if (!estado.pistas[pista.suspeita]) estado.pistas[pista.suspeita] = [];
    if (estado.pistas[pista.suspeita].indexOf(pista.chave) === -1) {
      estado.pistas[pista.suspeita].push(pista.chave);
      estado.ordemPistas.push(pista.chave);
    }
  }

  function avancar() {
    if (escolhaAtiva) return; // precisa escolher uma opção, clique na caixa não faz nada

    if (filaEspecial.length > 0) {
      processarProximoPasso();
      return;
    }

    indiceAtual++;
    if (indiceAtual >= cenaAtualObj.falas.length) {
      terminarCena();
      return;
    }
    renderizarFalaAtual();
  }

  function avancarPeloJogador() {
    if (!ativo || escolhaAtiva) return;
    if (performance.now() - inicioCena < ESPERA_INICIAL_MS) return;
    Musica.efeito("avancar");
    avancar();
  }

  function terminarCena() {
    ativo = false;
    Interface.esconderCartao();
    elementos.jogo.classList.remove("dialogo-ativo");
    var callback = aoTerminarCallback;
    aoTerminarCallback = null;
    if (typeof callback === "function") callback();
  }

  // ---- Entrada de eventos ----

  function aoClicarJogo(evento) {
    if (!ativo) return;
    // botões, HUD, painéis e telas por cima do diálogo têm o próprio clique
    if (evento.target.closest("button, #hud, #painel-log, .tela, #exploracao-overlay, #minigame-overlay")) return;
    avancarPeloJogador();
  }

  function aoPressionarTecla(evento) {
    if (!ativo || evento.repeat) return;
    if (evento.code === "Space" || evento.code === "Enter" || evento.code === "KeyE") {
      evento.preventDefault();
      avancarPeloJogador();
    }
  }

  function iniciarEventos() {
    elementos.jogo.addEventListener("click", aoClicarJogo);
    document.addEventListener("keydown", aoPressionarTecla);
  }

  // ---- API pública ----

  function iniciarCena(cena, aoTerminar) {
    if (!elementos.jogo) {
      pegarElementos();
      iniciarEventos();
    }

    cenaAtualObj = cena;
    indiceAtual = 0;
    filaEspecial = [];
    aoTerminarCallback = aoTerminar || null;
    ativo = true;
    inicioCena = performance.now();
    resetarPalco();
    limparOpcoes();
    elementos.jogo.classList.add("dialogo-ativo");

    estado.cenaDialogoAtual = cena.id;
    elementos.cenario.className = "fundo-" + cena.fundo;

    renderizarFalaAtual();
  }

  return {
    iniciarCena: iniciarCena,
  };
})();
