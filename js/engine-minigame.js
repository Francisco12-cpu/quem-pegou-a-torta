// engine-minigame.js — ÚNICA mecânica de minigame do jogo: arrombar fechadura, extraída
// exatamente de `mine game.html` (estrutura de pinos, física de empurrar/soltar, feedback
// visual e sonoro) e transformada em componente parametrizável. Usada só pelo baú de cada
// casa — não existe mais nenhum minigame "obrigatório" preso à história.
//
// O que foi ADICIONADO em cima da mecânica original (não muda a interação em si):
// - parametrização por `rounds` (= nº de pinos), `velocidadeMs` (= velocidade de empurrar)
//   e `errosPermitidos` (limite de falhas antes do baú "falhar" — no jogo original as
//   falhas não tinham limite, aqui isso vira a dificuldade crescente por casa)
// - integração com `estado.ingredientes`, contador de ingredientes e "baú já aberto"
//   (responsabilidade que antes vivia no extinto engine-bau.js)
// - botão "Deixar pra depois" (o baú é opcional, não pode travar a história)
// - visual no estilo do resto do jogo: fundo da própria casa desfocado, baú de madeira,
//   ícones em pixel art e a cena do baú abrindo com a protagonista pegando o ingrediente
//   (só aparência — pinos, velocidades, tolerância e regras de erro são as do original)

var MotorMinigame = (function () {
  "use strict";

  var el = {};
  var aoCompletarAtual = null;
  var configAtual = null;
  var casasAbertas = {};

  var CFG = null; // recalculado a cada iniciar(), depende de config.rounds/velocidadeMs
  var pinEls = [];
  var notchEls = [];
  var dotEls = [];
  var state = {};
  var pressTimer = null;
  var rafId = null;
  var lastT = 0;

  function pegarElementos() {
    el.overlay = document.getElementById("minigame-overlay");
  }

  // ---- áudio (idêntico ao mine game.html) ----

  var audioCtx = null;
  function actx() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      return audioCtx;
    } catch (e) {
      return null;
    }
  }
  function blip(freq, dur, type, vol, slideTo) {
    var ctx = actx();
    if (!ctx) return;
    try {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = type || "square";
      o.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
      g.gain.setValueAtTime(vol || 0.07, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + dur + 0.02);
    } catch (e) {}
  }
  var sfx = {
    set: function () {
      blip(720, 0.07, "square", 0.06);
      setTimeout(function () {
        blip(1180, 0.13, "square", 0.05);
      }, 48);
    },
    fail: function () {
      blip(170, 0.24, "sawtooth", 0.08, 70);
    },
    win: function () {
      [523, 659, 784, 1046, 1318].forEach(function (f, i) {
        setTimeout(function () {
          blip(f, 0.28, "triangle", 0.07);
        }, i * 105);
      });
    },
  };

  function vibrate(pattern) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // ---- montagem do DOM (uma vez por iniciar()) ----

  function montarDom() {
    el.overlay.innerHTML =
      '<div class="mg-fundo fundo-' +
      (configAtual.fundo || "") +
      '"></div>' +
      '<div class="mg-app">' +
      '<div class="mg-titulo">Baú escondido</div>' +
      '<div class="mg-hud">' +
      '<div class="mg-chip"><img src="assets/itens/relogio.png" alt="Tempo" /><b id="mgHudTime">0.0s</b></div>' +
      '<div class="mg-chip"><img src="assets/itens/cadeado-aberto.png" alt="Pinos" /><b id="mgHudPins">0/0</b></div>' +
      '<div class="mg-chip"><img src="assets/itens/falha.png" alt="Falhas" /><b id="mgHudFails">0</b></div>' +
      "</div>" +
      '<div class="mg-lock-area">' +
      '<div class="mg-pin-bar" id="mgPinBar"></div>' +
      '<div class="mg-lock" id="mgLock">' +
      '<div class="mg-shell"></div><div class="mg-plug"></div>' +
      '<div id="mgChambers"></div>' +
      '<div class="mg-shear-line"></div><div class="mg-keyway"></div>' +
      '<div class="mg-pins" id="mgPins"></div>' +
      '<div class="mg-pick" id="mgPick">' +
      '<div class="mg-rod" id="mgRod"></div><div class="mg-tip" id="mgTip"></div>' +
      '<svg class="mg-handle" viewBox="0 0 60 70"><path d="M18 66 V22 A12 12 0 0 1 42 22 V54 A7 7 0 0 1 28 54 V30" fill="none" stroke="#c9d6e8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</div>" +
      '<div class="mg-flash" id="mgFlash"></div>' +
      '<div class="mg-inner-overlay" id="mgOverlay"><div class="mg-ov-inner" id="mgOvContent"></div></div>' +
      "</div>" +
      "</div>" +
      '<div class="mg-controls">' +
      '<button class="mg-arrow" id="mgPrev" type="button" aria-label="Pino anterior"><span class="chevron esquerda"></span></button>' +
      '<button class="mg-hold" id="mgHold" type="button" aria-label="Segurar para empurrar"><span class="mg-pulse"></span><span>SEGURE</span></button>' +
      '<button class="mg-arrow" id="mgNext" type="button" aria-label="Próximo pino"><span class="chevron direita"></span></button>' +
      "</div>" +
      '<p class="mg-hint">Toque na fechadura pra escolher o pino <span class="separador"></span> Segure pra empurrar <span class="separador"></span> Solte quando a marca cruzar a linha</p>' +
      '<button class="mg-fechar" id="mgFechar" type="button">Deixar pra depois</button>' +
      "</div>";

    el.lock = document.getElementById("mgLock");
    el.pinsLayer = document.getElementById("mgPins");
    el.chambersLayer = document.getElementById("mgChambers");
    el.pick = document.getElementById("mgPick");
    el.rod = document.getElementById("mgRod");
    el.tip = document.getElementById("mgTip");
    el.flash = document.getElementById("mgFlash");
    el.innerOverlay = document.getElementById("mgOverlay");
    el.ovContent = document.getElementById("mgOvContent");
    el.hudTime = document.getElementById("mgHudTime");
    el.hudPins = document.getElementById("mgHudPins");
    el.hudFails = document.getElementById("mgHudFails");
    el.pinBar = document.getElementById("mgPinBar");
    el.holdBtn = document.getElementById("mgHold");
    el.prevBtn = document.getElementById("mgPrev");
    el.nextBtn = document.getElementById("mgNext");
    el.fecharBtn = document.getElementById("mgFechar");

    ligarEventos();
    montarFerramentaDeTeste();
  }

  // ---- FERRAMENTA DE TESTE (só desenvolvimento — ver `ferramentasDeTeste` em dados/config.js) ----
  // Força o resultado do baú pra testar os dois finais sem jogar o minigame. Nunca aparece no
  // site publicado: `ferramentasDeTesteAtivas()` só é verdadeiro rodando no computador local.

  function montarFerramentaDeTeste() {
    if (typeof ferramentasDeTesteAtivas !== "function" || !ferramentasDeTesteAtivas()) return;
    var faixa = document.createElement("div");
    faixa.className = "mg-teste";
    faixa.innerHTML =
      '<span class="mg-teste-rotulo">Ferramenta de teste</span>' +
      '<button type="button" id="mgTesteVencer">Forçar vitória</button>' +
      '<button type="button" id="mgTesteFalhar">Forçar falha</button>';
    el.overlay.querySelector(".mg-titulo").insertAdjacentElement("afterend", faixa);

    function comecarSeNecessario() {
      if (state.started) return;
      el.innerOverlay.classList.remove("show");
      state.started = true;
    }
    document.getElementById("mgTesteVencer").addEventListener("click", function () {
      if (state.won || state.perdeu) return;
      comecarSeNecessario();
      state.pins.forEach(function (p) {
        p.set = true;
        p.push = p.target;
      });
      updateHUD();
      render();
      checkWin();
    });
    document.getElementById("mgTesteFalhar").addEventListener("click", function () {
      if (state.won || state.perdeu) return;
      comecarSeNecessario();
      state.fails = configAtual.errosPermitidos + 1;
      updateHUD();
      perderBau();
    });
  }

  // ---- setup de uma partida ----

  function calcularCFG(config) {
    var pinCount = config.rounds;
    var pinXs = [];
    for (var i = 0; i < pinCount; i++) {
      pinXs.push(50 + (i - (pinCount - 1) / 2) * 16);
    }
    var baseSpeed = 25200 / config.velocidadeMs; // 900ms -> 28 (igual ao original)
    return {
      pinCount: pinCount,
      pinXs: pinXs,
      pinW: 5.4,
      shear: 40,
      restBottom: 76,
      maxPush: 42,
      notchH: 3.2,
      tolerance: 2.8,
      baseSpeed: baseSpeed,
      speedStep: baseSpeed * 0.1,
      holdDelay: 130,
    };
  }

  function newGame() {
    state = {
      pins: [],
      selected: 0,
      pushing: false,
      started: false,
      won: false,
      perdeu: false,
      fails: 0,
      time: 0,
      t0: 0,
      timerRunning: false,
    };

    for (var i = 0; i < CFG.pinCount; i++) {
      var len = 26 + Math.random() * 8;
      var nf = 0.35 + Math.random() * 0.4;
      var target = CFG.restBottom - CFG.shear - len * (1 - nf);
      state.pins.push({
        len: len,
        nf: nf,
        target: target,
        push: 0,
        set: false,
        speed: CFG.baseSpeed + i * CFG.speedStep,
      });
    }

    buildPins();
    buildPinBar();
    el.hudPins.textContent = "0/" + CFG.pinCount;
    el.hudFails.textContent = "0";
    el.hudTime.textContent = "0.0s";
    el.lock.classList.remove("shake");
    el.pick.classList.remove("pushing");
    el.holdBtn.classList.remove("active");
    render();
  }

  function buildPins() {
    el.pinsLayer.innerHTML = "";
    el.chambersLayer.innerHTML = "";
    pinEls = [];
    notchEls = [];

    CFG.pinXs.forEach(function (x) {
      var ch = document.createElement("div");
      ch.className = "mg-chamber";
      ch.style.left = x - CFG.pinW / 2 - 0.8 + "%";
      ch.style.width = CFG.pinW + 1.6 + "%";
      el.chambersLayer.appendChild(ch);

      var pinEl = document.createElement("div");
      pinEl.className = "mg-pin";
      pinEl.style.left = x - CFG.pinW / 2 + "%";
      pinEl.style.width = CFG.pinW + "%";

      var body = document.createElement("div");
      body.className = "mg-pin-body";
      var notch = document.createElement("div");
      notch.className = "mg-pin-notch";

      pinEl.appendChild(body);
      pinEl.appendChild(notch);
      el.pinsLayer.appendChild(pinEl);

      pinEls.push(pinEl);
      notchEls.push(notch);
    });
  }

  function buildPinBar() {
    el.pinBar.innerHTML = "";
    dotEls = [];
    CFG.pinXs.forEach(function (x, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "mg-pin-dot";
      dot.style.left = x + "%";
      dot.setAttribute("aria-label", "Pino " + (i + 1));
      dot.innerHTML = '<span class="mg-bar"><span class="mg-fill"></span></span>';

      dot.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!state.started || state.won || state.perdeu || state.pushing) return;
        if (state.pins[i].set) return;

        state.selected = i;
        render();

        clearTimeout(pressTimer);
        var delay = e.pointerType === "mouse" ? 0 : CFG.holdDelay;
        pressTimer = setTimeout(startPush, delay);
      });

      el.pinBar.appendChild(dot);
      dotEls.push(dot);
    });
  }

  // ---- render ----

  function render() {
    state.pins.forEach(function (p, i) {
      var push = p.set ? p.target : p.push;
      var top = CFG.restBottom - p.len - push;

      var pinEl = pinEls[i];
      pinEl.style.top = top + "%";
      pinEl.style.height = p.len + "%";
      pinEl.classList.toggle("set", p.set);

      var nTop = ((p.nf * p.len - CFG.notchH / 2) / p.len) * 100;
      var nH = (CFG.notchH / p.len) * 100;
      notchEls[i].style.top = nTop + "%";
      notchEls[i].style.height = nH + "%";

      var dot = dotEls[i];
      dot.classList.toggle("set", p.set);
      dot.classList.toggle("selected", i === state.selected && !p.set);

      var fill = dot.querySelector(".mg-fill");
      if (p.set) {
        fill.style.width = "100%";
      } else {
        var frac = Math.min(1, p.push / CFG.maxPush);
        fill.style.width = frac * 100 + "%";
      }
    });

    var sel = state.selected;
    var sp = state.pins[sel];
    var push = sp.set ? 0 : sp.push;
    var rodTop = CFG.restBottom - push;

    el.pick.style.left = CFG.pinXs[sel] + "%";
    el.rod.style.top = rodTop + "%";
    el.tip.style.top = rodTop + "%";

    var travado = state.pushing || state.won || state.perdeu || !state.started;
    el.prevBtn.disabled = travado;
    el.nextBtn.disabled = travado;
    el.holdBtn.disabled = state.won || state.perdeu || !state.started;
  }

  // ---- loop ----

  function loop(t) {
    if (!state.ativo) return; // partida encerrada — para o loop

    var dt = Math.min((t - lastT) / 1000, 0.05);
    lastT = t;

    if (state.started && !state.won && !state.perdeu) {
      if (state.pushing) {
        var p = state.pins[state.selected];
        if (!p.set) {
          p.push += p.speed * dt;
          if (p.push >= CFG.maxPush) {
            p.push = CFG.maxPush;
            fail();
          }
        }
      }
      if (state.timerRunning) {
        state.time = (t - state.t0) / 1000;
        el.hudTime.textContent = state.time.toFixed(1) + "s";
      }
    }

    render();
    rafId = requestAnimationFrame(loop);
  }

  // ---- ações ----

  function startPush() {
    if (!state.started || state.won || state.perdeu || state.pushing) return;
    var p = state.pins[state.selected];
    if (p.set) return;

    state.pushing = true;
    el.pick.classList.add("pushing");
    el.holdBtn.classList.add("active");

    if (!state.timerRunning) {
      state.timerRunning = true;
      state.t0 = performance.now() - state.time * 1000;
    }
  }

  function endPush() {
    clearTimeout(pressTimer);
    if (!state.pushing) return;
    state.pushing = false;
    el.pick.classList.remove("pushing");
    el.holdBtn.classList.remove("active");

    var p = state.pins[state.selected];
    if (p.set) return;

    if (Math.abs(p.push - p.target) <= CFG.tolerance) {
      p.set = true;
      p.push = p.target;
      sfx.set();
      vibrate(40);
      el.flash.classList.add("on");
      setTimeout(function () {
        el.flash.classList.remove("on");
      }, 500);

      var next = state.pins.findIndex(function (q) {
        return !q.set;
      });
      if (next >= 0) state.selected = next;

      el.pick.classList.add("smooth");
      setTimeout(function () {
        el.pick.classList.remove("smooth");
      }, 240);

      updateHUD();
      checkWin();
    } else {
      fail();
    }
  }

  function fail() {
    var p = state.pins[state.selected];
    p.push = 0;
    state.pushing = false;
    state.fails++;
    el.pick.classList.remove("pushing");
    el.holdBtn.classList.remove("active");

    el.pick.classList.add("smooth");
    setTimeout(function () {
      el.pick.classList.remove("smooth");
    }, 260);

    sfx.fail();
    vibrate([30, 50, 30]);
    el.flash.classList.add("red", "on");
    setTimeout(function () {
      el.flash.classList.remove("red", "on");
    }, 700);

    el.lock.classList.add("shake");
    setTimeout(function () {
      el.lock.classList.remove("shake");
    }, 320);

    updateHUD();

    // dificuldade por casa: aqui é onde `errosPermitidos` entra — não existia limite no
    // mine game.html original, mas é exatamente o número que baus.js já previa
    if (state.fails > configAtual.errosPermitidos) {
      perderBau();
    }
  }

  function updateHUD() {
    var setCount = state.pins.filter(function (p) {
      return p.set;
    }).length;
    el.hudPins.textContent = setCount + "/" + CFG.pinCount;
    el.hudFails.textContent = state.fails;
  }

  function checkWin() {
    if (
      !state.pins.every(function (p) {
        return p.set;
      })
    )
      return;

    state.won = true;
    state.ativo = false;
    state.timerRunning = false;
    state.pushing = false;
    el.pick.classList.remove("pushing");
    el.holdBtn.classList.remove("active");

    sfx.win();
    vibrate([50, 60, 50, 60, 120]);
    el.flash.classList.add("on");
    setTimeout(function () {
      el.flash.classList.remove("on");
    }, 900);
    setTimeout(showWin, 620);
  }

  function perderBau() {
    state.perdeu = true;
    state.ativo = false;
    state.pushing = false;
    state.timerRunning = false;
    el.pick.classList.remove("pushing");
    el.holdBtn.classList.remove("active");
    setTimeout(showPerdeu, 500);
  }

  // ---- overlays internos ----

  function showIntro() {
    el.innerOverlay.classList.add("show");
    el.ovContent.innerHTML =
      '<img class="mg-ov-icone" src="assets/itens/cadeado.png" alt="" />' +
      "<h2>Abra o baú</h2>" +
      "<p><b>Toque</b> na fechadura pra escolher o pino.<br><b>Segure</b> o botão <b>Segure</b> (ou a própria fechadura) pra empurrar o grampo.<br>Solte quando a <b>marca dourada</b> cruzar a linha brilhante.</p>" +
      '<p class="mg-ov-erros">' +
      (configAtual.errosPermitidos === 0
        ? "Nenhum erro permitido: capricha!"
        : "Pode errar " + configAtual.errosPermitidos + (configAtual.errosPermitidos === 1 ? " vez" : " vezes") + " antes do baú travar.") +
      "</p>" +
      '<button class="botao principal" id="mgStartBtn" type="button">Começar</button>';
    document.getElementById("mgStartBtn").addEventListener("click", startGame);
  }

  function startGame() {
    el.innerOverlay.classList.remove("show");
    state.started = true;
    actx();
  }

  function showWin() {
    finalizarComVitoria._chamado = false;
    var t = state.time.toFixed(1);
    var f = state.fails;
    var item = ITENS[configAtual.ingrediente];
    el.ovContent.innerHTML =
      '<div class="mg-premio">' +
      '<div class="mg-premio-luz"></div>' +
      '<img class="mg-premio-bau" id="mgPremioBau" src="assets/itens/bau-fechado.png" alt="" />' +
      '<img class="mg-premio-item" id="mgPremioItem" src="' +
      item.imagem +
      '" alt="" />' +
      '<div class="mg-premio-protagonista">' +
      htmlVisualPersonagem(PERSONAGENS.protagonista) +
      "</div>" +
      "</div>" +
      "<h2>Baú aberto!</h2>" +
      '<p class="mg-premio-texto">Você encontrou: <b>' +
      item.nome +
      "</b></p>" +
      '<div class="mg-ov-stats">' +
      '<div class="mg-ov-stat"><span>Tempo</span><b>' +
      t +
      's</b></div>' +
      '<div class="mg-ov-stat"><span>Falhas</span><b>' +
      f +
      "</b></div>" +
      "</div>" +
      '<button class="botao principal" id="mgContinuarBtn" type="button">Guardar</button>';
    el.innerOverlay.classList.add("show", "vitoria");
    document.getElementById("mgContinuarBtn").addEventListener("click", finalizarComVitoria);

    // a tampa abre um instante depois de o painel aparecer
    setTimeout(function () {
      var bau = document.getElementById("mgPremioBau");
      if (bau) bau.src = "assets/itens/bau-aberto.png";
      el.innerOverlay.classList.add("aberto");
    }, 450);

    finalizarComVitoria._auto = setTimeout(finalizarComVitoria, 4200);
  }

  function showPerdeu() {
    el.ovContent.innerHTML =
      '<img class="mg-ov-icone travado" src="assets/itens/cadeado.png" alt="" />' +
      "<h2>Não foi dessa vez</h2>" +
      "<p>A fechadura emperrou. Dá pra tentar de novo: é só voltar até o baú.</p>" +
      '<button class="botao principal" id="mgOkBtn" type="button">Tudo bem</button>';
    el.innerOverlay.classList.add("show");
    document.getElementById("mgOkBtn").addEventListener("click", function () {
      fecharComResultado(null);
    });
  }

  function finalizarComVitoria() {
    if (finalizarComVitoria._chamado) return;
    finalizarComVitoria._chamado = true;
    clearTimeout(finalizarComVitoria._auto);

    casasAbertas[configAtual.casa] = true;
    estado.ingredientes.push(configAtual.ingrediente);

    // o ícone voa do baú até o espaço dele no contador, e só então o minigame fecha
    var itemEl = document.getElementById("mgPremioItem");
    var origem = itemEl ? itemEl.getBoundingClientRect() : null;
    if (itemEl) itemEl.style.visibility = "hidden";
    Interface.mostrarHud(true);
    Interface.voarIngrediente(configAtual.ingrediente, origem, function () {
      setTimeout(function () {
        fecharComResultado(configAtual.ingrediente);
      }, 250);
    });
  }

  function fecharComResultado(ingrediente) {
    state.ativo = false;
    if (rafId) cancelAnimationFrame(rafId);
    el.overlay.hidden = true;
    var callback = aoCompletarAtual;
    aoCompletarAtual = null;
    if (typeof callback === "function") callback(ingrediente);
  }

  // ---- input ----

  function nearestPin(fracX) {
    var x = fracX * 100;
    var best = 0,
      bd = Infinity;
    CFG.pinXs.forEach(function (px, i) {
      var d = Math.abs(px - x);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  }

  function ligarEventos() {
    el.lock.addEventListener("pointerdown", function (e) {
      if (!state.started || state.won || state.perdeu) return;
      e.preventDefault();

      var r = el.lock.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var idx = nearestPin(x);

      if (idx !== state.selected) {
        state.selected = idx;
        render();
      }

      if (state.pins[idx].set) return;
      if (state.pushing) return;

      clearTimeout(pressTimer);
      var delay = e.pointerType === "mouse" ? 0 : CFG.holdDelay;
      pressTimer = setTimeout(startPush, delay);
    });

    el.lock.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      if (!state.started || state.won || state.perdeu || state.pushing) return;
      var r = el.lock.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var idx = nearestPin(x);
      if (idx !== state.selected) {
        state.selected = idx;
        render();
      }
    });

    el.holdBtn.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      if (!state.started || state.won || state.perdeu) return;
      if (state.pins[state.selected].set) return;
      clearTimeout(pressTimer);
      startPush();
    });
    el.holdBtn.addEventListener("pointerup", endPush);
    el.holdBtn.addEventListener("pointercancel", endPush);
    el.holdBtn.addEventListener("pointerleave", endPush);

    el.prevBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (!state.started || state.won || state.perdeu || state.pushing) return;
      var i = state.selected;
      for (var k = 1; k <= CFG.pinCount; k++) {
        var j = (i - k + CFG.pinCount) % CFG.pinCount;
        if (!state.pins[j].set) {
          state.selected = j;
          break;
        }
      }
      render();
    });
    el.nextBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (!state.started || state.won || state.perdeu || state.pushing) return;
      var i = state.selected;
      for (var k = 1; k <= CFG.pinCount; k++) {
        var j = (i + k) % CFG.pinCount;
        if (!state.pins[j].set) {
          state.selected = j;
          break;
        }
      }
      render();
    });

    el.fecharBtn.addEventListener("click", function () {
      state.ativo = false;
      if (rafId) cancelAnimationFrame(rafId);
      fecharComResultado(null);
    });
  }

  function atualizarContadorIngredientes() {
    Interface.atualizarIngredientes(); // o contador agora é desenhado pela interface (HUD)
  }

  // ---- API pública ----

  var eventosGlobaisLigados = false;
  function ligarEventosGlobais() {
    if (eventosGlobaisLigados) return;
    eventosGlobaisLigados = true;
    window.addEventListener("pointerup", function () {
      endPush();
    });
    window.addEventListener("pointercancel", function () {
      endPush();
    });
  }

  function iniciar(config, aoCompletar) {
    if (!el.overlay) pegarElementos();
    ligarEventosGlobais();

    if (casasAbertas[config.casa]) {
      console.warn('MotorMinigame: o baú de "' + config.casa + '" já foi aberto.');
      if (typeof aoCompletar === "function") aoCompletar(null);
      return;
    }

    configAtual = config;
    aoCompletarAtual = aoCompletar;
    CFG = calcularCFG(config);

    el.overlay.hidden = false;
    montarDom();
    newGame();
    showIntro();
    Musica.trilha("cofre");

    state.ativo = true;
    lastT = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  return {
    iniciar: iniciar,
    atualizarContadorIngredientes: atualizarContadorIngredientes,
  };
})();
