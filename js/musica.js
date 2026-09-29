// musica.js — música e efeitos sonoros gerados por código (Web Audio), sem arquivo de áudio.
// As trilhas ficam em dados/musicas.js; aqui só existe o "sintetizador" que as toca.
// O navegador só libera áudio depois de um clique/toque do jogador — por isso nada toca
// antes de `Musica.liberar()` (chamado no botão "Jogar" do menu).

var Musica = (function () {
  "use strict";

  var ctx = null;
  var mestre = null; // volume geral (mudo = 0)
  var ruido = null; // buffer de ruído branco, usado pela bateria
  var mudo = false;
  var VOLUME_MESTRE = 0.55;

  var trilhaAtual = null; // { nome, ganho, canais: [{passos, indice}], proximoPasso, duracaoPasso }
  var timerAgendador = null;
  var ANTECEDENCIA = 0.12; // segundos agendados à frente
  var INTERVALO_MS = 25;

  try {
    mudo = window.localStorage.getItem("torta-mudo") === "1";
  } catch (e) {}

  function criarContexto() {
    if (ctx) return ctx;
    var Classe = window.AudioContext || window.webkitAudioContext;
    if (!Classe) return null;
    try {
      ctx = new Classe();
    } catch (e) {
      return null;
    }
    var compressor = ctx.createDynamicsCompressor();
    compressor.connect(ctx.destination);
    mestre = ctx.createGain();
    mestre.gain.value = mudo ? 0 : VOLUME_MESTRE;
    mestre.connect(compressor);

    ruido = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    var dados = ruido.getChannelData(0);
    for (var i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
    return ctx;
  }

  // ---- notas ----

  var SEMITONS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function frequencia(nota) {
    var m = /^([A-G])(#|b)?(-?\d)$/.exec(nota);
    if (!m) return null;
    var semitom = SEMITONS[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
    var midi = (parseInt(m[3], 10) + 1) * 12 + semitom;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Converte "C5 . - E5" em [{nota, passos}] (com a duração em passos já somada pelos "-")
  function compilar(texto) {
    var tokens = texto.trim().split(/\s+/);
    var passos = [];
    tokens.forEach(function (t) {
      if (t === "-") {
        for (var i = passos.length - 1; i >= 0; i--) {
          if (passos[i] && passos[i].nota) {
            passos[i].duracao++;
            break;
          }
        }
        passos.push(null);
      } else if (t === ".") {
        passos.push(null);
      } else {
        passos.push({ nota: t, duracao: 1 });
      }
    });
    return passos;
  }

  // ---- instrumentos ----

  function tocarTom(destino, tipo, freq, inicio, dur, vol) {
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, inicio);
    g.gain.setValueAtTime(0.0001, inicio);
    g.gain.exponentialRampToValueAtTime(vol, inicio + 0.008);
    g.gain.exponentialRampToValueAtTime(vol * 0.6, inicio + Math.min(0.08, dur * 0.5));
    g.gain.setValueAtTime(vol * 0.6, inicio + dur * 0.85);
    g.gain.exponentialRampToValueAtTime(0.0001, inicio + dur);
    osc.connect(g).connect(destino);
    osc.start(inicio);
    osc.stop(inicio + dur + 0.02);
  }

  var INSTRUMENTOS = {
    quadrada: function (destino, freq, inicio, dur, vol) {
      tocarTom(destino, "square", freq, inicio, dur * 0.92, vol);
    },
    triangular: function (destino, freq, inicio, dur, vol) {
      tocarTom(destino, "triangle", freq, inicio, dur * 0.9, vol);
    },
    baixo: function (destino, freq, inicio, dur, vol) {
      tocarTom(destino, "triangle", freq, inicio, dur * 0.8, vol);
    },
  };

  function tocarBateria(destino, tipo, inicio, vol) {
    if (tipo === "k") {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.frequency.setValueAtTime(140, inicio);
      osc.frequency.exponentialRampToValueAtTime(42, inicio + 0.12);
      g.gain.setValueAtTime(vol * 0.9, inicio);
      g.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.16);
      osc.connect(g).connect(destino);
      osc.start(inicio);
      osc.stop(inicio + 0.18);
      return;
    }
    var fonte = ctx.createBufferSource();
    fonte.buffer = ruido;
    var filtro = ctx.createBiquadFilter();
    var g2 = ctx.createGain();
    var dur = tipo === "s" ? 0.12 : 0.035;
    filtro.type = tipo === "s" ? "bandpass" : "highpass";
    filtro.frequency.value = tipo === "s" ? 1800 : 7000;
    g2.gain.setValueAtTime(vol * (tipo === "s" ? 0.35 : 0.18), inicio);
    g2.gain.exponentialRampToValueAtTime(0.0001, inicio + dur);
    fonte.connect(filtro).connect(g2).connect(destino);
    fonte.start(inicio);
    fonte.stop(inicio + dur + 0.02);
  }

  // ---- agendador (toca alguns milissegundos à frente, pra não engasgar) ----

  function agendar() {
    if (!trilhaAtual || !ctx) return;
    var t = trilhaAtual;
    while (t.proximoTempo < ctx.currentTime + ANTECEDENCIA) {
      t.canais.forEach(function (canal) {
        var passo = canal.passos[canal.indice % canal.passos.length];
        canal.indice++;
        if (!passo) return;
        if (canal.bateria) {
          if (passo.nota !== ".") tocarBateria(t.ganho, passo.nota, t.proximoTempo, canal.volume);
          return;
        }
        var freq = frequencia(passo.nota);
        if (freq) INSTRUMENTOS[canal.instrumento](t.ganho, freq, t.proximoTempo, passo.duracao * t.duracaoPasso, canal.volume);
      });
      t.proximoTempo += t.duracaoPasso;
    }
  }

  function tocar(nome) {
    if (!ctx) return; // ainda não liberado — `liberar()` começa a trilha pedida por último
    if (trilhaAtual && trilhaAtual.nome === nome) return;
    var dados = MUSICAS[nome];
    if (!dados) return;

    parar(0.6);

    var ganho = ctx.createGain();
    ganho.gain.setValueAtTime(0.0001, ctx.currentTime);
    ganho.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.6);
    ganho.connect(mestre);

    var canais = Object.keys(dados.canais).map(function (chave) {
      var c = dados.canais[chave];
      var ehBateria = chave === "bateria";
      return {
        bateria: ehBateria,
        instrumento: c.instrumento,
        volume: c.volume,
        indice: 0,
        passos: ehBateria
          ? c.notas.trim().split(/\s+/).map(function (n) {
              return { nota: n };
            })
          : compilar(c.notas),
      };
    });

    trilhaAtual = {
      nome: nome,
      ganho: ganho,
      canais: canais,
      duracaoPasso: 60 / dados.bpm / 2,
      proximoTempo: ctx.currentTime + 0.05,
    };
    if (!timerAgendador) timerAgendador = setInterval(agendar, INTERVALO_MS);
  }

  function parar(fade) {
    if (!trilhaAtual) return;
    var ganho = trilhaAtual.ganho;
    var agora = ctx.currentTime;
    ganho.gain.cancelScheduledValues(agora);
    ganho.gain.setValueAtTime(ganho.gain.value || 0.0001, agora);
    ganho.gain.exponentialRampToValueAtTime(0.0001, agora + (fade || 0.3));
    setTimeout(function () {
      ganho.disconnect();
    }, ((fade || 0.3) + 0.3) * 1000);
    trilhaAtual = null;
  }

  // ---- efeitos sonoros ----

  var pedidoPendente = null;

  var EFEITOS = {
    avancar: function (t) {
      tocarTom(mestre, "square", 880, t, 0.04, 0.03);
    },
    interagir: function (t) {
      tocarTom(mestre, "square", 660, t, 0.07, 0.05);
      tocarTom(mestre, "square", 990, t + 0.07, 0.1, 0.05);
    },
    trancado: function (t) {
      tocarTom(mestre, "square", 220, t, 0.09, 0.05);
      tocarTom(mestre, "square", 185, t + 0.1, 0.12, 0.05);
    },
    passagem: function (t) {
      [523, 659, 784].forEach(function (f, i) {
        tocarTom(mestre, "triangle", f, t + i * 0.05, 0.12, 0.06);
      });
    },
    item: function (t) {
      [784, 988, 1175, 1568].forEach(function (f, i) {
        tocarTom(mestre, "square", f, t + i * 0.08, 0.16, 0.05);
      });
    },
    carimbo: function (t) {
      tocarBateria(mestre, "k", t, 1);
      tocarBateria(mestre, "s", t, 1);
      [392, 523, 659, 784, 1047].forEach(function (f, i) {
        tocarTom(mestre, "square", f, t + 0.25 + i * 0.09, 0.22, 0.05);
      });
    },
    decifrar: function (t) {
      for (var i = 0; i < 6; i++) tocarTom(mestre, "square", 900 + i * 120, t + i * 0.05, 0.035, 0.025);
    },
  };

  function efeito(nome) {
    if (!ctx || mudo || !EFEITOS[nome]) return;
    try {
      EFEITOS[nome](ctx.currentTime + 0.01);
    } catch (e) {}
  }

  // ---- API pública ----

  function liberar() {
    if (!criarContexto()) return;
    if (ctx.state === "suspended") ctx.resume();
    if (pedidoPendente) {
      var nome = pedidoPendente;
      pedidoPendente = null;
      tocar(nome);
    }
  }

  function trilha(nome) {
    if (!ctx) {
      pedidoPendente = nome;
      return;
    }
    tocar(nome);
  }

  function alternarMudo() {
    mudo = !mudo;
    try {
      window.localStorage.setItem("torta-mudo", mudo ? "1" : "0");
    } catch (e) {}
    if (mestre) mestre.gain.setTargetAtTime(mudo ? 0 : VOLUME_MESTRE, ctx.currentTime, 0.05);
    return mudo;
  }

  return {
    liberar: liberar,
    trilha: trilha,
    efeito: efeito,
    alternarMudo: alternarMudo,
    estaMudo: function () {
      return mudo;
    },
  };
})();
