// nome.js — validação do nome que o jogador escolhe para a protagonista.
// Regras, na ordem: vazio -> nome de brincadeira -> lista própria de bloqueio -> grande demais
// -> caracteres estranhos -> filtro de palavrões em português (js/vendor/profanity-br.js).
// Listas em dados/prohibited-names.json; limite de letras em CONFIG.nomeMaxCaracteres.

var Nome = (function () {
  "use strict";

  var regras = { mensagemProibido: "Essa palavra não pode ser utilizada.", proibidos: [], especiais: [] };
  var promessa = null;

  function limite() {
    return (typeof CONFIG !== "undefined" && CONFIG.nomeMaxCaracteres) || 14;
  }

  function carregar() {
    if (promessa) return promessa;
    promessa = fetch("dados/prohibited-names.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        regras.mensagemProibido = json.mensagemProibido || regras.mensagemProibido;
        regras.proibidos = (json.proibidos || []).map(normalizar).filter(Boolean);
        regras.especiais = (json.especiais || []).map(function (grupo) {
          return { nomes: (grupo.nomes || []).map(normalizar).filter(Boolean), mensagem: grupo.mensagem || regras.mensagemProibido };
        });
      })
      .catch(function (erro) {
        // abrindo o index.html direto do disco o navegador bloqueia o fetch; o filtro de
        // palavrões continua valendo, só as listas personalizadas ficam de fora
        console.warn("Não deu pra ler dados/prohibited-names.json:", erro);
      });
    return promessa;
  }

  // Tira espaços extras (é o nome que aparece no jogo)
  function limpar(nome) {
    return (nome || "").replace(/\s+/g, " ").trim();
  }

  // Forma usada só pra comparar: minúsculas, sem acento, sem pontuação, números "disfarçados"
  // viram letras (m4xw3ll -> maxwell). O nome exibido no jogo não muda.
  var TROCAS = { 4: "a", "@": "a", 3: "e", 1: "i", "!": "i", 0: "o", 5: "s", $: "s", 7: "t" };
  function normalizar(texto) {
    return (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[4@31!05$7]/g, function (c) {
        return TROCAS[c];
      })
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  // "matheus" bate em "Matheus", "MATHEUS" e "Matheus Silva" (palavra inteira)
  function contemPalavras(nomeNormal, alvo) {
    return (" " + nomeNormal + " ").indexOf(" " + alvo + " ") !== -1;
  }

  function validar(nomeDigitado) {
    var nome = limpar(nomeDigitado);
    if (!nome) return { ok: false, mensagem: "Digite um nome para continuar." };

    var normal = normalizar(nome);
    var colado = normal.replace(/ /g, "");

    for (var i = 0; i < regras.especiais.length; i++) {
      var grupo = regras.especiais[i];
      for (var j = 0; j < grupo.nomes.length; j++) {
        if (contemPalavras(normal, grupo.nomes[j]) || colado === grupo.nomes[j].replace(/ /g, "")) {
          return { ok: false, mensagem: grupo.mensagem, especial: true };
        }
      }
    }

    for (var k = 0; k < regras.proibidos.length; k++) {
      var termo = regras.proibidos[k];
      var termoColado = termo.replace(/ /g, "");
      if (contemPalavras(normal, termo) || (termoColado.length >= 4 && colado.indexOf(termoColado) !== -1)) {
        return { ok: false, mensagem: regras.mensagemProibido };
      }
    }

    // tamanho e caracteres por último: assim a mensagem de brincadeira aparece mesmo se o
    // nome for comprido (ex.: "Francisco Audir")
    if (Array.from(nome).length > limite()) return { ok: false, mensagem: "Use no máximo " + limite() + " caracteres." };
    if (!/^[\p{L}\p{M}0-9 '.-]+$/u.test(nome)) return { ok: false, mensagem: "Use só letras, números e espaços." };

    if (window.ProfanidadeBR) {
      var analise = window.ProfanidadeBR.analisar(nome);
      // só o que o filtro marca com certeza; duplo sentido ("Pinto", "Rola") passa — são
      // sobrenomes de verdade. Pra barrar algum desses, ponha em "proibidos" no JSON.
      var certeza = analise.hits.some(function (h) {
        return h.confianca !== "ambigua";
      });
      if (certeza || analise.vulgaridade > 0 || analise.alvo) {
        return { ok: false, mensagem: regras.mensagemProibido };
      }
    }

    return { ok: true, nome: nome };
  }

  return {
    carregar: carregar,
    validar: validar,
    limite: limite,
    limpar: limpar,
  };
})();
