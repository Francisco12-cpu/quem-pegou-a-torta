// telas.js — telas fora da história: menu, "Como jogar", "Caso resolvido", tela final e
// créditos. Os textos vêm de dados/final.js; os créditos, de dados/creditos.json (lido na hora
// — dá pra adicionar pessoas só editando o JSON).

var Telas = (function () {
  "use strict";

  var creditos = null; // conteúdo de creditos.json, depois de carregado
  var promessaCreditos = null;

  function $(id) {
    return document.getElementById(id);
  }

  function mostrar(id) {
    $(id).hidden = false;
  }

  function esconder(id) {
    $(id).hidden = true;
  }

  function spriteDe(id) {
    var p = PERSONAGENS[id];
    return p ? htmlVisualPersonagem(p) : "";
  }

  // fileira de pôneis pulando (menu e final)
  function montarDesfile(container, ids) {
    container.innerHTML = ids
      .map(function (id, i) {
        return '<div class="desfile-ponei" style="animation-delay:' + i * 0.13 + 's">' + spriteDe(id) + "</div>";
      })
      .join("");
  }

  // estrelinhas de brilho em volta (CSS desenha a estrela de 4 pontas)
  function montarBrilhos(container, quantidade) {
    var html = "";
    for (var i = 0; i < quantidade; i++) {
      html +=
        '<span class="brilho" style="left:' +
        Math.random() * 100 +
        "%;top:" +
        Math.random() * 70 +
        "%;animation-delay:" +
        (Math.random() * 3).toFixed(2) +
        "s;--tamanho:" +
        (6 + Math.random() * 10).toFixed(0) +
        'px"></span>';
    }
    container.innerHTML = html;
  }

  // ---- créditos: leitura do JSON ----

  function carregarCreditos() {
    if (promessaCreditos) return promessaCreditos;
    promessaCreditos = fetch("dados/creditos.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        creditos = json;
        return json;
      })
      .catch(function (erro) {
        // abrindo o index.html direto do disco (file://) o navegador bloqueia o fetch —
        // no GitHub Pages funciona normal. Mostra o mínimo em vez de travar.
        console.warn("Não deu pra ler dados/creditos.json:", erro);
        creditos = {
          titulo: "Quem Pegou a Torta?",
          subtitulo: "",
          cifra: { tipo: "cesar", deslocamento: 3 },
          secoes: [{ titulo: "Programação e desenvolvimento", pessoas: [{ nome: "Francisco Audir" }] }],
          notas: ["(Abra o jogo por um servidor, como o GitHub Pages, para carregar todos os créditos.)"],
          _falhou: true,
        };
        return creditos;
      });
    return promessaCreditos;
  }

  // ---- cifra de César ----
  // Letras acentuadas são cifradas pela letra base (é -> h com deslocamento 3); o resto
  // (espaço, pontuação, números) fica como está.

  function cifrarCesar(texto, deslocamento) {
    var d = ((deslocamento % 26) + 26) % 26;
    return Array.from(texto)
      .map(function (ch) {
        var base = ch.normalize("NFD")[0];
        var codigo = base.charCodeAt(0);
        if (codigo >= 65 && codigo <= 90) return String.fromCharCode(((codigo - 65 + d) % 26) + 65);
        if (codigo >= 97 && codigo <= 122) return String.fromCharCode(((codigo - 97 + d) % 26) + 97);
        return ch;
      })
      .join("");
  }

  // animação de "decifrando": as letras embaralham e vão se acertando da esquerda pra direita
  function decifrarAnimado(elemento, original) {
    if (elemento.dataset.decifrado) return;
    elemento.dataset.decifrado = "1";
    elemento.classList.add("decifrando");
    Musica.efeito("decifrar");
    var letras = Array.from(original);
    var cifrado = Array.from(elemento.textContent);
    var ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var total = letras.length;
    var duracao = Math.min(1600, 400 + total * 40);
    var inicio = performance.now();

    function quadro(t) {
      var progresso = Math.min(1, (t - inicio) / duracao);
      var resolvidas = Math.floor(progresso * total);
      var saida = "";
      for (var i = 0; i < total; i++) {
        if (i < resolvidas || letras[i] === " ") saida += letras[i];
        else if (/[A-Za-zÀ-ÿ]/.test(letras[i])) saida += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
        else saida += cifrado[i] || letras[i];
      }
      elemento.textContent = saida;
      if (progresso < 1) requestAnimationFrame(quadro);
      else {
        elemento.textContent = original;
        elemento.classList.remove("decifrando");
        elemento.classList.add("decifrado");
      }
    }
    requestAnimationFrame(quadro);
  }

  // ícone de câmera (desenho próprio em SVG, sem emoji nem logo de marca)
  var ICONE_REDE =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" />' +
    '<circle cx="12" cy="12" r="4" /><circle class="ponto" cx="17.3" cy="6.7" r="1.2" /></svg>';

  // Aceita o formato novo (`secoes`: [{titulo, pessoas}]) e o antigo (`pessoas` com `funcao`).
  function secoesDos(dados) {
    if (dados.secoes) return dados.secoes;
    return (dados.pessoas || []).map(function (p) {
      return { titulo: p.funcao || "", pessoas: [p] };
    });
  }

  function montarPessoa(pessoa, deslocamento) {
    var linha = document.createElement(pessoa.mensagem ? "button" : "div");
    if (pessoa.mensagem) linha.type = "button";
    linha.className = "creditos-pessoa" + (pessoa.mensagem ? " com-mensagem" : "");

    var nome = document.createElement("div");
    nome.className = "creditos-nome";
    nome.textContent = pessoa.nome || "";
    linha.appendChild(nome);

    if (pessoa.mensagem) {
      var msg = document.createElement("div");
      msg.className = "creditos-mensagem";
      msg.textContent = cifrarCesar(pessoa.mensagem, deslocamento);
      linha.appendChild(msg);
      linha.addEventListener("click", function () {
        decifrarAnimado(msg, pessoa.mensagem);
      });
    }
    return linha;
  }

  function montarCreditos(dados) {
    $("creditos-titulo").textContent = dados.titulo || "";
    $("creditos-subtitulo").textContent = dados.subtitulo || "";
    var deslocamento = (dados.cifra && dados.cifra.deslocamento) || 3;
    var temMensagem = false;

    var lista = $("creditos-pessoas");
    lista.innerHTML = "";
    secoesDos(dados).forEach(function (secao, i) {
      var cartao = document.createElement("section");
      cartao.className = "creditos-secao-cartao";
      cartao.style.animationDelay = 0.1 + i * 0.1 + "s";
      var titulo = document.createElement("h3");
      titulo.className = "creditos-secao-titulo";
      titulo.textContent = secao.titulo || "";
      cartao.appendChild(titulo);
      (secao.pessoas || []).forEach(function (pessoa) {
        if (pessoa.mensagem) temMensagem = true;
        cartao.appendChild(montarPessoa(pessoa, deslocamento));
      });
      lista.appendChild(cartao);
    });

    $("creditos-dica").hidden = !temMensagem;
    $("creditos-dica").textContent = "Toque num nome com mensagem para decifrá-la (cifra de César, deslocamento " + deslocamento + ")";

    // redes (ex.: Instagram) — texto e endereço vêm do JSON
    var redes = $("creditos-redes");
    redes.innerHTML = "";
    (dados.redes || []).forEach(function (rede) {
      if (!rede.endereco) return;
      var link = document.createElement("a");
      link.className = "creditos-rede";
      link.href = rede.endereco;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.innerHTML = ICONE_REDE + "<span></span>";
      link.querySelector("span").textContent = rede.texto || rede.endereco;
      if (rede.legenda) {
        var legenda = document.createElement("small");
        legenda.textContent = rede.legenda;
        link.appendChild(legenda);
      }
      redes.appendChild(link);
    });

    var notas = $("creditos-notas");
    notas.innerHTML = "";
    (dados.notas || []).forEach(function (texto) {
      var p = document.createElement("p");
      p.textContent = texto;
      notas.appendChild(p);
    });
  }

  function abrirCreditos(aoVoltar, rotuloVoltar) {
    Musica.trilha("tema");
    CenaEspecial.mostrar("antes-dos-creditos", function () {
      mostrarCreditos(aoVoltar, rotuloVoltar);
    });
  }

  function mostrarCreditos(aoVoltar, rotuloVoltar) {
    carregarCreditos().then(function (dados) {
      montarCreditos(dados);
      $("creditos-voltar").textContent = rotuloVoltar || "Voltar ao menu";
      $("creditos-voltar").onclick = function () {
        Musica.efeito("interagir");
        Interface.transicao(function () {
          esconder("tela-creditos");
          if (aoVoltar) aoVoltar();
        });
      };
      Interface.transicao(function () {
        mostrar("tela-creditos");
        $("tela-creditos").querySelector(".creditos-rolagem").scrollTop = 0;
      });
    });
  }

  // ---- abertura: logo animada + "aperte qualquer botão" ----
  // O navegador só deixa tocar som depois de uma interação do jogador — esta tela existe pra
  // isso: o primeiro toque/tecla libera o áudio, e a música do menu já começa tocando.

  function abrirAbertura(aoIniciar) {
    var tela = $("tela-abertura");
    var pronto = false;
    var saiu = false;
    setTimeout(function () {
      pronto = true; // ignora toques antes da logo terminar de aparecer
    }, 700);

    function iniciar(e) {
      if (!pronto || saiu) return;
      if (e && e.type === "keydown") e.preventDefault();
      saiu = true;
      document.removeEventListener("keydown", iniciar, true);
      tela.removeEventListener("pointerup", iniciar);
      tela.removeEventListener("touchend", iniciar);
      Musica.liberar();
      Musica.trilha("tema");
      Musica.efeito("passagem");
      tela.classList.add("saindo");
      setTimeout(function () {
        tela.hidden = true;
        if (aoIniciar) aoIniciar();
      }, 650);
    }

    document.addEventListener("keydown", iniciar, true);
    tela.addEventListener("pointerup", iniciar);
    tela.addEventListener("touchend", iniciar);
  }

  // ---- escolha do nome da protagonista ----
  // O nome vale pra sessão toda: vira o nome dela nos diálogos (PERSONAGENS.protagonista.nome)
  // e o {nome} das falas do narrador. Não é cadastro — nada é salvo além da aba aberta.

  function abrirNome(aoConfirmar) {
    var tela = $("tela-nome");
    var form = $("nome-form");
    var campo = $("nome-campo");
    var aviso = $("nome-aviso");
    var contador = $("nome-contador");
    var enviando = false;

    Nome.carregar();
    campo.maxLength = Nome.limite();
    $("nome-retrato").innerHTML = htmlVisualPersonagem(PERSONAGENS.protagonista);
    try {
      campo.value = window.sessionStorage.getItem("torta-nome") || "";
    } catch (e) {}

    function atualizarContador() {
      contador.textContent = Array.from(campo.value).length + "/" + Nome.limite();
    }

    function mostrarAviso(texto) {
      aviso.textContent = texto;
      aviso.hidden = false;
      form.classList.remove("recusado");
      void form.offsetWidth;
      form.classList.add("recusado");
      Musica.efeito("trancado");
    }

    campo.oninput = function () {
      aviso.hidden = true;
      atualizarContador();
    };

    form.onsubmit = function (e) {
      e.preventDefault();
      if (enviando) return;
      Nome.carregar().then(function () {
        var resultado = Nome.validar(campo.value);
        if (!resultado.ok) {
          mostrarAviso(resultado.mensagem);
          campo.focus();
          return;
        }
        enviando = true;
        estado.nomeJogador = resultado.nome;
        PERSONAGENS.protagonista.nome = resultado.nome;
        try {
          window.sessionStorage.setItem("torta-nome", resultado.nome);
        } catch (erro) {}
        Musica.efeito("interagir");
        campo.blur(); // fecha o teclado do celular
        Interface.transicao(function () {
          tela.hidden = true;
          aoConfirmar();
        });
      });
    };

    atualizarContador();
    aviso.hidden = true;
    tela.hidden = false;
    // no computador já deixa pronto pra digitar; no celular o teclado abre ao tocar no campo
    if (!document.body.classList.contains("toque")) {
      setTimeout(function () {
        campo.focus();
      }, 80);
    }
  }

  // ---- menu ----

  function abrirMenu(aoJogar) {
    montarDesfile($("tela-menu").querySelector(".desfile-poneis"), [
      "twilight",
      "rarity",
      "pinkie",
      "protagonista",
      "rainbow-dash",
      "fluttershy",
      "applejack",
    ]);
    montarBrilhos($("tela-menu").querySelector(".brilhos"), 18);
    mostrar("tela-menu");

    carregarCreditos().then(function (dados) {
      $("menu-rodape").textContent = dados.subtitulo || "";
    });

    $("menu-jogar").onclick = function () {
      Musica.liberar();
      Musica.efeito("interagir");
      if (document.body.classList.contains("toque")) Interface.entrarTelaCheia();
      Interface.transicao(function () {
        esconder("tela-menu");
        aoJogar();
      });
    };
    $("menu-como-jogar").onclick = function () {
      Musica.liberar();
      Musica.trilha("tema");
      Musica.efeito("interagir");
      mostrar("tela-como-jogar");
    };
    $("como-jogar-fechar").onclick = function () {
      Musica.efeito("interagir");
      esconder("tela-como-jogar");
    };
    $("menu-creditos").onclick = function () {
      Musica.liberar();
      Musica.efeito("interagir");
      abrirCreditos(function () {
        mostrar("tela-menu");
      });
    };
    // qualquer primeiro toque no menu já libera a música de fundo
    $("tela-menu").addEventListener(
      "pointerdown",
      function () {
        Musica.liberar();
        Musica.trilha("tema");
      },
      { once: true }
    );
  }

  // ---- caso resolvido ----

  function abrirCaso(aoContinuar) {
    var culpada = PERSONAGENS[CASO_RESOLVIDO.culpada];
    $("caso-sprite").src = culpada.sprite;
    $("caso-sprite").alt = culpada.nome;
    $("caso-nome").textContent = culpada.nome;
    $("caso-carimbo").textContent = CASO_RESOLVIDO.titulo;
    $("caso-culpada").textContent = culpada.nome;
    $("caso-frase").textContent = CASO_RESOLVIDO.frase;
    $("caso-motivo").textContent = CASO_RESOLVIDO.motivo;

    var acusacao = $("caso-acusacao");
    var suspeitaId = estado.acusacaoEscolhida ? SUSPEITAS[estado.acusacaoEscolhida] : null;
    if (suspeitaId) {
      acusacao.innerHTML =
        "Sua acusação: <b>" + PERSONAGENS[suspeitaId].nome + "</b>. As pistas pareciam apontar pra ela, mas tinham outra explicação.";
    } else {
      acusacao.innerHTML = "Você não acusou ninguém. <b>Boa intuição!</b>";
    }

    var lista = $("caso-pistas");
    lista.innerHTML = "";
    estado.ordemPistas.forEach(function (chave) {
      if (!TEXTO_PISTAS[chave]) return;
      var li = document.createElement("li");
      li.textContent = TEXTO_PISTAS[chave];
      lista.appendChild(li);
    });

    $("caso-continuar").onclick = function () {
      Musica.efeito("interagir");
      Interface.transicao(function () {
        esconder("tela-caso");
        aoContinuar();
      });
    };

    Interface.mostrarHud(false);
    Interface.transicao(function () {
      mostrar("tela-caso");
      var tela = $("tela-caso");
      tela.classList.remove("animar");
      void tela.offsetWidth;
      tela.classList.add("animar");
      setTimeout(function () {
        Musica.efeito("carimbo");
      }, 900);
    });
  }

  // ---- final ----

  function formatarTempo(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function montarConfete(container) {
    var cores = ["#ff6fb0", "#ffd479", "#7fd6c2", "#b89cff", "#5bc8f2", "#f2a65a"];
    var html = "";
    for (var i = 0; i < 46; i++) {
      html +=
        '<span style="left:' +
        Math.random() * 100 +
        "%;background:" +
        cores[i % cores.length] +
        ";animation-delay:" +
        (Math.random() * 4).toFixed(2) +
        "s;animation-duration:" +
        (3 + Math.random() * 3).toFixed(2) +
        's"></span>';
    }
    container.innerHTML = html;
  }

  function abrirFim(completo, aoCreditos) {
    Musica.trilha("festa");
    Interface.mostrarHud(false);
    CenaEspecial.mostrar("final", function () {
      mostrarFim(completo, aoCreditos);
    });
  }

  function mostrarFim(completo, aoCreditos) {

    $("tela-fim-titulo").textContent = TEXTOS_FIM.titulo;
    $("tela-fim-texto").textContent = completo ? TEXTOS_FIM.subtitulo100 : TEXTOS_FIM.subtitulo;
    $("tela-fim-selo").textContent = TEXTOS_FIM.selo100;
    $("tela-fim-selo").hidden = !completo;

    $("fim-ingredientes").innerHTML = ORDEM_INGREDIENTES.map(function (chave) {
      var tem = estado.ingredientes.indexOf(chave) !== -1;
      return '<img class="' + (tem ? "tem" : "") + '" src="' + ITENS[chave].imagem + '" alt="' + (tem ? ITENS[chave].nome : "") + '" />';
    }).join("");
    $("fim-pistas").textContent = estado.ordemPistas.length;
    $("fim-tempo").textContent = formatarTempo(Date.now() - (estado.inicio || Date.now()));

    montarConfete($("tela-fim").querySelector(".confete"));
    montarDesfile($("tela-fim").querySelector(".desfile-poneis"), [
      "twilight",
      "rarity",
      "pinkie",
      "protagonista",
      "applejack",
      "rainbow-dash",
      "fluttershy",
    ]);

    $("fim-creditos").onclick = function () {
      Musica.efeito("interagir");
      abrirCreditos(function () {
        mostrar("tela-fim");
        Musica.trilha("festa");
      }, "Voltar");
      aoCreditos && aoCreditos();
    };
    $("fim-jogar-de-novo").onclick = function () {
      Interface.transicao(function () {
        window.location.reload();
      });
    };

    Interface.transicao(function () {
      mostrar("tela-fim");
    });
  }

  return {
    abrirAbertura: abrirAbertura,
    abrirNome: abrirNome,
    abrirMenu: abrirMenu,
    abrirCaso: abrirCaso,
    abrirFim: abrirFim,
    abrirCreditos: abrirCreditos,
    carregarCreditos: carregarCreditos,
  };
})();
