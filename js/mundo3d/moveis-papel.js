// moveis-papel.js — o kit de móveis de papel das salas. Cada tipo é uma função que monta as
// peças com a frente virada para z positivo e a base em y = 0. Uma sala escolhe e posiciona as
// peças em dados/mundo3d.js (`moveis`). Quem tem `largura` e `profundidade` bloqueia a passagem.

import * as THREE from "../vendor/three.min.js";

const CREME = "#fff3dc";
const MADEIRA = "#a9693f";
const MADEIRA_ESCURA = "#7a4a2a";
const OURO = "#ffd479";
const ROSA = "#ff9ccd";
const ROSA_FORTE = "#ff6fb0";
const MENTA = "#8fd8c8";
const VERMELHO = "#d92b45";

// ---- docinhos e coisinhas que vão em cima dos móveis ----

function cupcake(f, x, y, z, cor = ROSA) {
  const g = new THREE.Group();
  g.add(
    f.cilindro(0.2, 0.15, 0.22, "#f5e8d0", 0, 0.11, 0),
    f.esfera(0.21, cor, 0, 0.3, 0),
    f.esfera(0.06, VERMELHO, 0, 0.5, 0)
  );
  g.position.set(x, y, z);
  return g;
}

function bolo(f, x, y, z, cor = ROSA, escala = 1) {
  const g = new THREE.Group();
  g.add(
    f.cilindro(0.75, 0.75, 0.06, CREME, 0, 0.03, 0),
    f.cilindro(0.6, 0.6, 0.4, "#eccb97", 0, 0.26, 0),
    f.cilindro(0.62, 0.62, 0.1, cor, 0, 0.48, 0),
    f.cilindro(0.38, 0.38, 0.32, "#eccb97", 0, 0.68, 0),
    f.cilindro(0.4, 0.4, 0.08, cor, 0, 0.87, 0),
    f.esfera(0.11, VERMELHO, 0, 1, 0)
  );
  g.position.set(x, y, z);
  g.scale.setScalar(escala);
  return g;
}

function pote(f, x, y, z, cor) {
  const g = new THREE.Group();
  g.add(f.cilindro(0.2, 0.2, 0.42, cor, 0, 0.21, 0), f.cilindro(0.22, 0.22, 0.08, MADEIRA, 0, 0.46, 0));
  g.position.set(x, y, z);
  return g;
}

// ---- móveis ----

function balcao(f, o) {
  const largura = o.largura || 6;
  const profundidade = o.profundidade || 1.6;
  const cor = o.cor || MENTA;
  const g = new THREE.Group();
  g.add(
    f.caixa(largura, 1.3, profundidade, cor, 0, 0.65, 0),
    f.caixa(largura + 0.25, 0.16, profundidade + 0.25, CREME, 0, 1.38, 0),
    f.caixa(largura + 0.04, 0.16, profundidade + 0.04, MADEIRA_ESCURA, 0, 0.08, 0)
  );
  const portas = Math.max(2, Math.round(largura / 1.3));
  const passo = largura / portas;
  for (let i = 0; i < portas; i++) {
    const x = -largura / 2 + passo * (i + 0.5);
    g.add(
      f.caixa(passo - 0.18, 0.95, 0.04, o.corPorta || CREME, x, 0.72, profundidade / 2 + 0.02),
      f.disco(0.06, OURO, x, 0.95, profundidade / 2 + 0.05)
    );
  }
  return { grupo: g, largura: largura + 0.2, profundidade: profundidade + 0.2 };
}

// balcão de trabalho, cheio de coisas da torta
function ilha(f, o) {
  const r = balcao(f, { largura: 6, profundidade: 2, cor: o.cor || ROSA, corPorta: CREME });
  const g = r.grupo;
  g.add(
    bolo(f, -1.9, 1.46, 0),
    cupcake(f, -0.7, 1.46, 0.35, ROSA),
    cupcake(f, -0.25, 1.46, 0.55, "#c8a2f0"),
    cupcake(f, 0.15, 1.46, 0.3, OURO)
  );
  // batedeira
  const b = new THREE.Group();
  b.add(
    f.caixa(0.8, 0.14, 0.5, ROSA_FORTE, 0, 0.07, 0),
    f.caixa(0.2, 0.75, 0.3, ROSA_FORTE, -0.26, 0.5, 0),
    f.caixa(0.8, 0.26, 0.32, ROSA_FORTE, 0.02, 0.9, 0),
    f.cilindro(0.26, 0.18, 0.3, "#d8e6ea", 0.14, 0.3, 0),
    f.cilindro(0.04, 0.04, 0.3, "#b8c8d0", 0.14, 0.62, 0)
  );
  b.position.set(1.15, 1.46, 0);
  g.add(b);
  // rolo e farinha
  const rolo = f.cilindro(0.1, 0.1, 0.9, "#d9b478", 2.3, 1.56, 0.2);
  rolo.rotation.z = Math.PI / 2;
  g.add(rolo, f.caixa(1.1, 0.02, 0.8, "#fbf5e2", 2.3, 1.47, 0.2));
  return r;
}

function pia(f, o) {
  const r = balcao(f, { largura: o.largura || 5, profundidade: 1.5, cor: o.cor || MENTA });
  r.grupo.add(
    f.caixa(1.5, 0.04, 0.95, "#a9c4cc", 0, 1.47, 0),
    f.cilindro(0.06, 0.06, 0.5, "#d8e6ea", 0, 1.7, -0.5),
    f.caixa(0.08, 0.08, 0.42, "#d8e6ea", 0, 1.93, -0.3),
    pote(f, -1.7, 1.46, -0.1, ROSA),
    pote(f, -1.2, 1.46, 0.1, OURO),
    pote(f, 1.5, 1.46, 0, "#c8a2f0")
  );
  return r;
}

function forno(f, o) {
  const cor = o.cor || ROSA_FORTE;
  const g = new THREE.Group();
  g.add(
    f.caixa(2.6, 2.3, 1.6, cor, 0, 1.15, 0),
    f.caixa(2.75, 0.14, 1.72, "#3f3440", 0, 2.36, 0),
    f.caixa(2.05, 1.1, 0.05, "#3f3440", 0, 0.82, 0.82),
    f.caixa(1.65, 0.75, 0.04, "#f28c38", 0, 0.82, 0.85),
    f.caixa(1.2, 0.3, 0.04, "#ffd479", 0, 0.7, 0.87),
    f.caixa(1.9, 0.09, 0.14, OURO, 0, 1.46, 0.87)
  );
  [-0.8, -0.27, 0.27, 0.8].forEach((x) => g.add(f.disco(0.13, CREME, x, 1.86, 0.815)));
  [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.35], [0.6, 0.35]].forEach(([x, z]) => {
    g.add(f.cilindro(0.36, 0.36, 0.04, "#6b5a68", x, 2.46, z));
  });
  // coifa na parede, por cima
  g.add(
    f.caixa(3, 0.35, 1.5, ROSA_FORTE, 0, 4.3, -0.1),
    f.prisma(3, 0.95, 1.4, ROSA, 0, 4.47, -0.1),
    f.caixa(0.95, 2.4, 0.9, ROSA, 0, 6.4, -0.35),
    f.caixa(3.05, 0.1, 1.55, OURO, 0, 4.1, -0.1)
  );
  // uma panela no fogo
  g.add(f.cilindro(0.34, 0.3, 0.42, "#8fc7ff", 0.6, 2.69, 0.35), f.cilindro(0.36, 0.36, 0.05, "#5f94d0", 0.6, 2.92, 0.35));
  return { grupo: g, largura: 2.8, profundidade: 1.8 };
}

function geladeira(f, o) {
  const cor = o.cor || MENTA;
  const g = new THREE.Group();
  g.add(
    f.caixa(2.5, 4.7, 1.7, cor, 0, 2.35, 0),
    f.caixa(2.3, 1.45, 0.05, CREME, 0, 3.75, 0.87),
    f.caixa(2.3, 2.7, 0.05, CREME, 0, 1.45, 0.87),
    f.caixa(0.12, 0.8, 0.1, OURO, 0.9, 3.6, 0.93),
    f.caixa(0.12, 1.1, 0.1, OURO, 0.9, 2.2, 0.93),
    f.disco(0.19, ROSA_FORTE, -0.6, 3.9, 0.91),
    f.disco(0.15, OURO, -0.2, 3.65, 0.91),
    f.caixa(0.5, 0.65, 0.02, "#fbf5e2", -0.55, 2.1, 0.91)
  );
  return { grupo: g, largura: 2.6, profundidade: 1.8 };
}

// vitrine alta de doces
function vitrine(f, o) {
  const cor = o.cor || ROSA;
  const g = new THREE.Group();
  g.add(
    f.caixa(3.6, 4.6, 1.3, cor, 0, 2.3, 0),
    f.caixa(3.2, 4.2, 0.05, "#fff7ea", 0, 2.3, 0.64),
    f.caixa(3.9, 0.3, 1.5, cor, 0, 4.72, 0),
    f.prisma(3.9, 0.7, 1.4, ROSA_FORTE, 0, 4.86, 0)
  );
  [1.1, 2.4, 3.65].forEach((y, i) => {
    g.add(f.caixa(3.15, 0.09, 0.3, MADEIRA, 0, y, 0.72));
    if (i === 0) {
      g.add(bolo(f, -0.8, y + 0.05, 0.75, ROSA, 0.7), bolo(f, 0.8, y + 0.05, 0.75, "#c8a2f0", 0.7));
    } else {
      [-1.15, -0.4, 0.4, 1.15].forEach((x, n) => {
        const cores = [ROSA, OURO, "#c8a2f0", "#8fc7ff"];
        g.add(cupcake(f, x, y + 0.05, 0.75, cores[(n + i) % 4]));
      });
    }
  });
  return { grupo: g, largura: 3.8, profundidade: 1.5 };
}

function mesaRedonda(f, o) {
  const g = new THREE.Group();
  g.add(
    f.cilindro(1.5, 1.5, 0.14, o.cor || CREME, 0, 1.3, 0),
    f.cilindro(1.56, 1.56, 0.05, ROSA, 0, 1.2, 0),
    f.cilindro(0.16, 0.2, 1.2, MADEIRA, 0, 0.6, 0),
    f.cilindro(0.65, 0.75, 0.1, MADEIRA, 0, 0.05, 0),
    bolo(f, -0.1, 1.37, 0, ROSA_FORTE),
    cupcake(f, 0.85, 1.37, 0.3, OURO),
    cupcake(f, -0.85, 1.37, 0.45, "#8fc7ff")
  );
  return { grupo: g, largura: 2.8, profundidade: 2.8, redondo: true };
}

function banqueta(f, o) {
  const g = new THREE.Group();
  g.add(
    f.cilindro(0.48, 0.48, 0.15, o.cor || ROSA_FORTE, 0, 0.92, 0),
    f.cilindro(0.08, 0.1, 0.85, MADEIRA, 0, 0.43, 0),
    f.cilindro(0.34, 0.38, 0.06, MADEIRA, 0, 0.03, 0)
  );
  return { grupo: g, largura: 0.8, profundidade: 0.8, redondo: true };
}

function janela(f, o) {
  const largura = o.largura || 3.4;
  const altura = o.altura || 3.2;
  const g = new THREE.Group();
  g.add(
    f.arco(largura + 0.4, altura + 0.3, CREME, 0, 0, 0),
    f.arco(largura, altura, "#bfe8ff", 0, 0.15, 0.02),
    f.caixa(0.1, altura - 0.2, 0.04, CREME, 0, altura / 2, 0.05),
    f.caixa(largura, 0.1, 0.04, CREME, 0, altura * 0.55, 0.05),
    f.caixa(largura + 0.7, 0.14, 0.2, MADEIRA, 0, -0.04, 0.1)
  );
  [-1, 1].forEach((lado) => {
    for (let i = 0; i < 4; i++) {
      const prega = f.caixa(0.27, altura + 0.2, 0.05 + (i % 2) * 0.05, i % 2 ? o.cor || ROSA : o.corForte || ROSA_FORTE);
      prega.position.set(lado * (largura / 2 + 0.05 - i * 0.26), altura / 2 + 0.1, 0.14);
      g.add(prega);
    }
    g.add(f.caixa(1.15, 0.16, 0.14, OURO, lado * (largura / 2 - 0.34), altura * 0.42, 0.2));
  });
  g.add(f.caixa(largura + 1.5, 0.1, 0.1, OURO, 0, altura + 0.28, 0.16));
  return { grupo: g };
}

function prateleira(f, o) {
  const largura = o.largura || 4;
  const g = new THREE.Group();
  g.add(
    f.caixa(largura, 0.14, 0.7, MADEIRA, 0, 0, 0),
    f.caixa(0.12, 0.36, 0.5, MADEIRA_ESCURA, -largura / 2 + 0.4, -0.22, -0.05),
    f.caixa(0.12, 0.36, 0.5, MADEIRA_ESCURA, largura / 2 - 0.4, -0.22, -0.05)
  );
  const n = Math.floor(largura / 0.7);
  const cores = [ROSA, OURO, "#c8a2f0", MENTA, "#8fc7ff"];
  for (let i = 0; i < n; i++) {
    const x = -largura / 2 + 0.4 + (i * (largura - 0.8)) / Math.max(1, n - 1);
    g.add(i % 2 ? pote(f, x, 0.07, 0.05, cores[i % 5]) : cupcake(f, x, 0.07, 0.05, cores[i % 5]));
  }
  return { grupo: g };
}

function quadro(f, o) {
  const g = new THREE.Group();
  const l = o.largura || 1.5;
  const a = o.altura || 1.8;
  g.add(
    f.caixa(l + 0.24, a + 0.24, 0.08, MADEIRA, 0, 0, 0),
    f.caixa(l, a, 0.05, o.cor || "#fff7ea", 0, 0, 0.04),
    f.cilindro(0.36, 0.26, 0.42, "#f5e8d0", 0, -0.3, 0.1),
    f.esfera(0.42, ROSA, 0, 0.1, 0.1),
    f.esfera(0.12, VERMELHO, 0, 0.56, 0.1)
  );
  return { grupo: g };
}

// fieira de bandeirinhas de festa presa na parede
function bandeirinhas(f, o) {
  const largura = o.largura || 8;
  const g = new THREE.Group();
  const n = Math.round(largura / 0.8);
  const cores = [ROSA_FORTE, OURO, "#8fc7ff", "#c8a2f0", MENTA];
  for (let i = 0; i < n; i++) {
    const x = -largura / 2 + (i + 0.5) * (largura / n);
    const caida = -Math.sin(((i + 0.5) / n) * Math.PI) * 0.45;
    const bandeira = f.prisma(0.62, 0.72, 0.03, cores[i % 5], x, caida, 0);
    bandeira.rotation.z = Math.PI; // ponta para baixo
    g.add(bandeira);
  }
  return { grupo: g };
}

function luminaria(f, o) {
  const g = new THREE.Group();
  g.add(
    f.cilindro(0.03, 0.03, 2, "#3f3440", 0, 1, 0),
    f.cilindro(0.16, 0.95, 0.65, o.cor || ROSA_FORTE, 0, -0.3, 0),
    f.esfera(0.26, "#fff0a6", 0, -0.6, 0)
  );
  return { grupo: g };
}

function tapete(f, o) {
  const g = new THREE.Group();
  const raio = o.raio || 2.2;
  [
    [raio, o.cor || ROSA_FORTE, 0.03],
    [raio * 0.8, o.corMeio || CREME, 0.045],
    [raio * 0.58, o.corCentro || ROSA, 0.06],
  ].forEach(([r, cor, y]) => {
    const disco = f.disco(r, cor, 0, y, 0);
    disco.rotation.x = -Math.PI / 2;
    g.add(disco);
  });
  return { grupo: g };
}

// baldinho com flores, pra enfeitar um canto
function vaso(f, o) {
  const g = new THREE.Group();
  g.add(f.cilindro(0.42, 0.3, 0.75, o.cor || MENTA, 0, 0.38, 0));
  [[-0.25, 1, ROSA], [0.25, 1.05, OURO], [0, 1.3, "#c8a2f0"], [0.12, 0.9, "#8fc7ff"]].forEach(([x, y, cor]) => {
    g.add(f.cilindro(0.025, 0.025, y, "#4aa84a", x * 0.5, y / 2 + 0.3, 0), f.esfera(0.2, cor, x, y + 0.3, 0));
  });
  return { grupo: g, largura: 0.9, profundidade: 0.9, redondo: true };
}

// ---- biblioteca da Twilight ----

const CORES_LIVRO = ["#8a5bd6", "#e65a94", "#4a9be8", "#f2b13c", "#4aa84a", "#d9574f", "#5b3a8c"];

function fileiraDeLivros(f, g, largura, y, z, deslocamento) {
  let x = -largura / 2 + 0.1;
  let i = deslocamento;
  while (x < largura / 2 - 0.2) {
    const grossura = 0.16 + ((i * 7) % 5) * 0.03;
    const altura = 0.62 + ((i * 3) % 4) * 0.07;
    g.add(f.caixa(grossura, altura, 0.34, CORES_LIVRO[i % CORES_LIVRO.length], x + grossura / 2, y + altura / 2, z));
    x += grossura + 0.02;
    i++;
  }
}

function estante(f, o) {
  const largura = o.largura || 4;
  const altura = o.altura || 6;
  const prof = 1;
  const g = new THREE.Group();
  g.add(
    f.caixa(largura, altura, prof, o.cor || MADEIRA_ESCURA, 0, altura / 2, 0),
    f.caixa(largura - 0.3, altura - 0.3, 0.05, "#4a2d1a", 0, altura / 2, prof / 2 + 0.01),
    f.caixa(largura + 0.3, 0.25, prof + 0.2, MADEIRA, 0, altura + 0.1, 0)
  );
  const niveis = Math.floor(altura / 1.15);
  for (let i = 0; i < niveis; i++) {
    const y = 0.25 + i * 1.15;
    g.add(f.caixa(largura - 0.2, 0.1, 0.5, MADEIRA, 0, y, prof / 2 + 0.2));
    fileiraDeLivros(f, g, largura - 0.5, y + 0.05, prof / 2 + 0.22, i * 5 + (o.semente || 0));
  }
  return { grupo: g, largura: largura + 0.1, profundidade: prof + 0.4 };
}

function escadaria(f, o) {
  const degraus = o.degraus || 12;
  const largura = 2.6;
  const g = new THREE.Group();
  for (let i = 0; i < degraus; i++) {
    const y = 0.28 * (i + 1);
    g.add(f.caixa(largura, y, 0.62, i % 2 ? "#b87a4a" : MADEIRA, 0, y / 2, 3.3 - i * 0.6));
  }
  // corrimão
  const comprimento = degraus * 0.66;
  const corrimao = f.caixa(0.12, 0.12, comprimento, OURO, -largura / 2 - 0.1, (degraus * 0.28) / 2 + 1.1, 3.3 - (degraus * 0.6) / 2);
  corrimao.rotation.x = Math.atan2(0.28, 0.6);
  g.add(corrimao);
  for (let i = 0; i < degraus; i += 3) {
    const y = 0.28 * (i + 1);
    g.add(f.caixa(0.09, 1.1, 0.09, OURO, -largura / 2 - 0.1, y + 0.55, 3.3 - i * 0.6));
  }
  return { grupo: g, largura: largura + 0.5, profundidade: degraus * 0.62 };
}

function mesaDeLeitura(f, o) {
  const g = new THREE.Group();
  g.add(f.caixa(4.6, 0.16, 2, MADEIRA, 0, 1.25, 0));
  [[-2, -0.8], [2, -0.8], [-2, 0.8], [2, 0.8]].forEach(([x, z]) => g.add(f.caixa(0.2, 1.2, 0.2, MADEIRA_ESCURA, x, 0.6, z)));
  // livro aberto, pilha, vela e pena
  const aberto = new THREE.Group();
  aberto.add(f.caixa(1.3, 0.08, 0.85, "#5b3a8c", 0, 0.04, 0), f.caixa(0.6, 0.06, 0.78, "#fff7ea", -0.31, 0.1, 0), f.caixa(0.6, 0.06, 0.78, "#fff7ea", 0.31, 0.1, 0));
  aberto.position.set(-0.7, 1.33, 0.1);
  aberto.rotation.y = 0.15;
  g.add(aberto);
  [["#e65a94", 0], ["#4a9be8", 0.16], ["#f2b13c", 0.32]].forEach(([cor, y], i) => {
    g.add(f.caixa(0.95 - i * 0.08, 0.15, 0.7 - i * 0.05, cor, 1.3, 1.41 + y, -0.1));
  });
  g.add(f.cilindro(0.15, 0.2, 0.08, OURO, -1.9, 1.37, -0.3), f.cilindro(0.06, 0.06, 0.4, CREME, -1.9, 1.61, -0.3), f.esfera(0.08, "#ffb347", -1.9, 1.89, -0.3));
  return { grupo: g, largura: 4.6, profundidade: 2 };
}

function globo(f) {
  const g = new THREE.Group();
  g.add(
    f.cilindro(0.5, 0.65, 0.12, MADEIRA, 0, 0.06, 0),
    f.cilindro(0.08, 0.12, 1.1, MADEIRA_ESCURA, 0, 0.65, 0),
    f.esfera(0.7, "#4a9be8", 0, 1.8, 0),
    f.esfera(0.32, "#5bc85a", -0.28, 1.95, 0.48),
    f.esfera(0.24, "#5bc85a", 0.32, 1.6, 0.52),
    f.caixa(1.75, 0.07, 0.07, OURO, 0, 1.8, 0)
  );
  return { grupo: g, largura: 1.3, profundidade: 1.3, redondo: true };
}

function pilhaDeLivros(f, o) {
  const g = new THREE.Group();
  for (let i = 0; i < (o.quantos || 6); i++) {
    const livro = f.caixa(1 - (i % 3) * 0.08, 0.2, 0.75, CORES_LIVRO[i % CORES_LIVRO.length], (i % 2) * 0.06, 0.1 + i * 0.21, 0);
    livro.rotation.y = (i * 0.5) % 0.6;
    g.add(livro);
  }
  return { grupo: g, largura: 1.1, profundidade: 1 };
}

function poltrona(f, o) {
  const cor = o.cor || "#8a5bd6";
  const g = new THREE.Group();
  g.add(
    f.caixa(2, 0.75, 1.6, cor, 0, 0.5, 0),
    f.caixa(2, 1.9, 0.4, cor, 0, 1.15, -0.65),
    f.caixa(0.38, 1.1, 1.5, cor, -1.02, 0.75, 0),
    f.caixa(0.38, 1.1, 1.5, cor, 1.02, 0.75, 0),
    f.caixa(1.3, 0.14, 1.05, "#c8a2f0", 0, 0.94, 0.2)
  );
  return { grupo: g, largura: 2.4, profundidade: 1.7 };
}

// ---- boutique da Rarity ----

function manequim(f, o) {
  const cor = o.cor || "#c8a2f0";
  const g = new THREE.Group();
  g.add(
    f.cilindro(0.45, 0.55, 0.12, OURO, 0, 0.06, 0),
    f.cilindro(0.06, 0.06, 0.7, MADEIRA, 0, 0.45, 0),
    f.cilindro(0.48, 0.92, 1.5, cor, 0, 1.45, 0),
    f.cilindro(0.5, 0.5, 0.1, OURO, 0, 2.2, 0),
    f.cilindro(0.3, 0.46, 0.8, o.corBusto || cor, 0, 2.6, 0),
    f.esfera(0.28, "#f5e8d0", 0, 3.2, 0)
  );
  [[-0.32, 1.1], [0.3, 1.5], [0, 0.95]].forEach(([x, y]) => g.add(f.esfera(0.09, OURO, x, y, 0.78)));
  return { grupo: g, largura: 1.3, profundidade: 1.3, redondo: true };
}

function espelho(f, o) {
  const g = new THREE.Group();
  const moldura = f.cilindro(1.2, 1.2, 0.14, OURO, 0, 2.6, 0);
  moldura.rotation.x = Math.PI / 2;
  moldura.scale.z = 1.65;
  const vidro = f.cilindro(1, 1, 0.05, "#c6e6f5", 0, 2.6, 0.08);
  vidro.rotation.x = Math.PI / 2;
  vidro.scale.z = 1.65;
  const brilho = f.caixa(0.22, 1.8, 0.02, "#f2fbff", -0.3, 2.7, 0.13);
  brilho.rotation.z = -0.3;
  g.add(moldura, vidro, brilho, f.caixa(1.4, 0.2, 0.7, OURO, 0, 0.1, 0.05));
  return { grupo: g };
}

function provador(f, o) {
  const cor = o.cor || "#a884d8";
  const g = new THREE.Group();
  g.add(f.caixa(3.6, 0.16, 2, OURO, 0, 5, 0), f.cilindro(0.1, 1.9, 0.9, cor, 0, 5.5, 0));
  for (let i = 0; i < 8; i++) {
    g.add(f.caixa(0.46, 4.8, 0.08 + (i % 2) * 0.06, i % 2 ? cor : "#c8a2f0", -1.6 + i * 0.46, 2.45, 0.9));
  }
  g.add(f.caixa(1.1, 0.14, 0.14, OURO, -0.9, 2.4, 1));
  return { grupo: g, largura: 3.6, profundidade: 2 };
}

function araraDeRoupas(f, o) {
  const g = new THREE.Group();
  const largura = o.largura || 4;
  g.add(
    f.caixa(largura + 0.2, 0.1, 0.1, OURO, 0, 3.3, 0),
    f.caixa(0.1, 3.3, 0.1, OURO, -largura / 2, 1.65, 0),
    f.caixa(0.1, 3.3, 0.1, OURO, largura / 2, 1.65, 0),
    f.caixa(0.8, 0.1, 0.7, OURO, -largura / 2, 0.05, 0),
    f.caixa(0.8, 0.1, 0.7, OURO, largura / 2, 0.05, 0)
  );
  const cores = ["#ff9ccd", "#8fc7ff", "#c8a2f0", "#ffd479", "#8fd8c8", "#ff6fb0"];
  const n = Math.floor(largura / 0.62);
  for (let i = 0; i < n; i++) {
    const x = -largura / 2 + 0.4 + (i * (largura - 0.8)) / Math.max(1, n - 1);
    g.add(f.cilindro(0.17, 0.31, 1.75, cores[i % cores.length], x, 2.3, 0), f.cilindro(0.015, 0.015, 0.25, "#d8e6ea", x, 3.2, 0));
  }
  return { grupo: g, largura: largura + 0.3, profundidade: 0.9 };
}

function rolosDeTecido(f, o) {
  const g = new THREE.Group();
  g.add(f.caixa(4, 0.2, 1, MADEIRA, 0, 0.1, 0), f.caixa(0.2, 2.8, 1, MADEIRA, -1.9, 1.4, 0), f.caixa(0.2, 2.8, 1, MADEIRA, 1.9, 1.4, 0), f.caixa(4, 0.2, 1, MADEIRA, 0, 1.4, 0), f.caixa(4, 0.2, 1, MADEIRA, 0, 2.75, 0));
  const cores = ["#ff9ccd", "#8fc7ff", "#ffd479", "#8fd8c8", "#c8a2f0", "#ff6fb0"];
  [0.5, 1.8].forEach((y, l) => {
    for (let i = 0; i < 5; i++) {
      const rolo = f.cilindro(0.31, 0.31, 0.9, cores[(i + l * 2) % 6], -1.34 + i * 0.67, y, 0.05);
      rolo.rotation.x = Math.PI / 2;
      g.add(rolo);
    }
  });
  return { grupo: g, largura: 4, profundidade: 1.1 };
}

function penteadeira(f, o) {
  const g = new THREE.Group();
  g.add(
    f.caixa(3.4, 1.3, 1.2, CREME, 0, 0.65, 0),
    f.caixa(3.6, 0.12, 1.35, OURO, 0, 1.36, 0),
    f.caixa(1.3, 0.9, 0.04, "#e6d6f7", -0.85, 0.72, 0.62),
    f.caixa(1.3, 0.9, 0.04, "#e6d6f7", 0.85, 0.72, 0.62),
    f.disco(0.06, OURO, -0.3, 0.75, 0.66),
    f.disco(0.06, OURO, 0.3, 0.75, 0.66)
  );
  const moldura = f.cilindro(0.95, 0.95, 0.1, OURO, 0, 2.5, -0.45);
  moldura.rotation.x = Math.PI / 2;
  const vidro = f.cilindro(0.78, 0.78, 0.05, "#c6e6f5", 0, 2.5, -0.38);
  vidro.rotation.x = Math.PI / 2;
  g.add(moldura, vidro, f.esfera(0.2, "#ff9ccd", -1.2, 1.6, 0.15), f.cilindro(0.14, 0.14, 0.5, "#a884d8", 1.2, 1.66, 0.1), f.esfera(0.1, OURO, 1.2, 2, 0.1));
  return { grupo: g, largura: 3.6, profundidade: 1.4 };
}

function pedestal(f, o) {
  const g = new THREE.Group();
  g.add(f.cilindro(1.7, 1.85, 0.35, o.cor || "#a884d8", 0, 0.18, 0), f.cilindro(1.45, 1.55, 0.25, OURO, 0, 0.47, 0), f.cilindro(1.3, 1.4, 0.05, "#ff9ccd", 0, 0.62, 0));
  return { grupo: g, largura: 3.4, profundidade: 3.4, redondo: true };
}

// ---- casa da Rainbow Dash ----

function nuvemPuff(f, o) {
  const g = new THREE.Group();
  const e = o.escala || 1;
  [[-0.9, 0.55, 0, 0.8], [0.15, 0.75, 0, 1.05], [1.05, 0.5, 0.1, 0.72], [-0.2, 0.45, 0.45, 0.7]].forEach(([x, y, z, r]) => {
    g.add(f.esfera(r * e, "#ffffff", x * e, y * e, z * e));
  });
  return { grupo: g, largura: 3 * e, profundidade: 1.8 * e, redondo: true };
}

function camaDeNuvem(f, o) {
  const g = new THREE.Group();
  [[-1.4, 0], [0, 0.1], [1.4, 0], [-0.7, -0.5], [0.8, -0.5]].forEach(([x, z]) => g.add(f.esfera(1, "#ffffff", x, 0.6, z)));
  g.add(f.caixa(1.3, 0.3, 0.9, "#5bc8f2", -1.4, 1.5, -0.35));
  const cobertor = f.caixa(2.4, 0.2, 1.7, "#4a9be8", 0.65, 1.46, 0.05);
  g.add(cobertor);
  ["#e8473f", "#f6d344", "#5bc85a"].forEach((cor, i) => g.add(f.caixa(2.42, 0.05, 0.28, cor, 0.65, 1.58, -0.45 + i * 0.45)));
  return { grupo: g, largura: 4.2, profundidade: 2.6, redondo: true };
}

function trofeus(f, o) {
  const g = new THREE.Group();
  g.add(f.caixa(4, 1.3, 1, "#4a9be8", 0, 0.65, 0), f.caixa(4.2, 0.14, 1.15, "#ffffff", 0, 1.36, 0));
  [-1.3, 0, 1.3].forEach((x, i) => {
    const e = [0.85, 1.15, 0.7][i];
    const cor = [OURO, "#ffc62e", "#e6e6f0"][i];
    g.add(
      f.caixa(0.5 * e, 0.16, 0.5 * e, MADEIRA_ESCURA, x, 1.51, 0),
      f.cilindro(0.06 * e, 0.09 * e, 0.4 * e, cor, x, 1.75, 0),
      f.cilindro(0.4 * e, 0.12 * e, 0.68 * e, cor, x, 2.2, 0),
      f.disco(0.18 * e, "#fff0a6", x, 2.25, 0.27 * e)
    );
  });
  return { grupo: g, largura: 4.2, profundidade: 1.2 };
}

function posterRaio(f, o) {
  const g = new THREE.Group();
  g.add(f.caixa(2.2, 3, 0.04, "#2f7fd6", 0, 0, 0), f.caixa(2, 2.8, 0.05, "#5bc8f2", 0, 0, 0.01));
  g.add(
    f.poligono(
      [
        [0.3, 1.15],
        [-0.55, -0.1],
        [-0.02, -0.1],
        [-0.4, -1.15],
        [0.6, 0.3],
        [0.08, 0.3],
      ],
      "#ffd479",
      0,
      0,
      0.05
    )
  );
  return { grupo: g };
}

function halteres(f) {
  const g = new THREE.Group();
  [0, 0.9].forEach((z) => {
    const barra = f.cilindro(0.06, 0.06, 1.1, "#d8e6ea", 0, 0.24, z);
    barra.rotation.z = Math.PI / 2;
    g.add(barra);
    [-0.48, 0.48].forEach((x) => {
      const peso = f.cilindro(0.22, 0.22, 0.3, "#e8473f", x, 0.24, z);
      peso.rotation.z = Math.PI / 2;
      g.add(peso);
    });
  });
  return { grupo: g, largura: 1.5, profundidade: 1.5 };
}

// ---- chalé da Fluttershy ----

function sofa(f, o) {
  const cor = o.cor || "#8cc56a";
  const g = new THREE.Group();
  g.add(
    f.caixa(5, 0.75, 1.8, cor, 0, 0.5, 0),
    f.caixa(5, 1.9, 0.4, cor, 0, 1.25, -0.75),
    f.caixa(0.4, 1.2, 1.8, "#6fb04f", -2.5, 0.75, 0),
    f.caixa(0.4, 1.2, 1.8, "#6fb04f", 2.5, 0.75, 0)
  );
  [-1.45, 0, 1.45].forEach((x) => g.add(f.caixa(1.35, 0.16, 1.25, "#a5d884", x, 0.96, 0.2)));
  g.add(f.caixa(0.85, 0.85, 0.22, "#ffd479", -1.6, 1.42, -0.42), f.caixa(0.85, 0.85, 0.22, "#ff9ccd", 1.6, 1.42, -0.42));
  return { grupo: g, largura: 5.4, profundidade: 2 };
}

function lareira(f) {
  const g = new THREE.Group();
  g.add(
    f.caixa(4, 3.4, 1.2, "#b8a48c", 0, 1.7, 0),
    f.caixa(4.4, 0.25, 1.5, MADEIRA, 0, 3.5, 0.05),
    f.caixa(2.3, 2, 0.06, "#3f3440", 0, 1.05, 0.61),
    f.caixa(2.8, 0.2, 1.3, "#8f7f6c", 0, 0.1, 0.35),
    f.prisma(1.6, 1.4, 0.05, "#f28c38", 0, 0.25, 0.66),
    f.prisma(0.9, 0.85, 0.05, "#ffd479", 0, 0.25, 0.7),
    f.caixa(1.5, 4, 1, "#b8a48c", 0, 5.4, -0.1),
    pote(f, -1.5, 3.62, 0.1, "#ff9ccd"),
    pote(f, 1.5, 3.62, 0.1, "#c8a2f0")
  );
  return { grupo: g, largura: 4.4, profundidade: 1.6 };
}

// cestinha com um coelhinho dormindo
function cesta(f, o) {
  const g = new THREE.Group();
  g.add(
    f.cilindro(1, 0.82, 0.62, "#c9a36e", 0, 0.31, 0),
    f.cilindro(0.9, 0.9, 0.05, "#f5e8d0", 0, 0.62, 0),
    f.esfera(0.5, "#ffffff", 0, 0.8, 0),
    f.esfera(0.28, "#ffffff", 0.32, 1.05, 0.25),
    f.cilindro(0.04, 0.09, 0.5, "#ffffff", 0.22, 1.42, 0.2),
    f.cilindro(0.04, 0.09, 0.5, "#ffffff", 0.44, 1.42, 0.2),
    f.esfera(0.05, "#ff9ccd", 0.32, 1.02, 0.52)
  );
  return { grupo: g, largura: 2, profundidade: 2, redondo: true };
}

function planta(f, o) {
  const g = new THREE.Group();
  g.add(f.cilindro(0.55, 0.42, 0.8, o.cor || "#c9694a", 0, 0.4, 0));
  [[0, 2, 0, 0.75, "#5da84c"], [-0.5, 1.45, 0.1, 0.6, "#6fbf5a"], [0.5, 1.5, 0, 0.62, "#6fbf5a"], [0.15, 1.2, 0.4, 0.45, "#86d06c"], [-0.15, 2.5, 0.1, 0.45, "#86d06c"]].forEach(([x, y, z, r, cor]) => {
    g.add(f.esfera(r, cor, x, y, z));
  });
  return { grupo: g, largura: 1.2, profundidade: 1.2, redondo: true };
}

function gaiola(f) {
  const g = new THREE.Group();
  g.add(f.caixa(0.04, 2, 0.04, "#7a5230", 0, 1.1, 0), f.esfera(0.12, OURO, 0, 0.12, 0), f.cilindro(0.1, 0.85, 0.5, OURO, 0, -0.1, 0), f.cilindro(0.85, 0.85, 0.08, OURO, 0, -1.9, 0));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.add(f.caixa(0.04, 1.5, 0.04, OURO, Math.cos(a) * 0.82, -1.1, Math.sin(a) * 0.82));
  }
  g.add(f.esfera(0.26, "#ffd479", 0, -1.45, 0.1), f.esfera(0.16, "#ffd479", 0.15, -1.2, 0.2), f.caixa(0.1, 0.05, 0.1, "#f28c38", 0.3, -1.2, 0.28), f.caixa(1, 0.05, 0.05, MADEIRA, 0, -1.7, 0.1));
  return { grupo: g };
}

function mesinha(f, o) {
  const g = new THREE.Group();
  g.add(
    f.cilindro(1.2, 1.2, 0.14, MADEIRA, 0, 0.72, 0),
    f.cilindro(0.14, 0.2, 0.7, MADEIRA_ESCURA, 0, 0.35, 0),
    f.cilindro(0.2, 0.15, 0.3, "#ffffff", 0.3, 0.94, 0.1),
    f.cilindro(0.3, 0.3, 0.04, "#ffffff", 0.3, 0.8, 0.1),
    f.esfera(0.32, "#ffd479", -0.42, 1, -0.05)
  );
  return { grupo: g, largura: 2.3, profundidade: 2.3, redondo: true };
}

const TIPOS = {
  balcao,
  ilha,
  pia,
  forno,
  geladeira,
  vitrine,
  mesaRedonda,
  banqueta,
  janela,
  prateleira,
  quadro,
  bandeirinhas,
  luminaria,
  tapete,
  vaso,
  estante,
  escadaria,
  mesaDeLeitura,
  globo,
  pilhaDeLivros,
  poltrona,
  manequim,
  espelho,
  provador,
  araraDeRoupas,
  rolosDeTecido,
  penteadeira,
  pedestal,
  nuvemPuff,
  camaDeNuvem,
  trofeus,
  posterRaio,
  halteres,
  sofa,
  lareira,
  cesta,
  planta,
  gaiola,
  mesinha,
};

// item: { tipo, x, y?, z, giro? (graus), ...opções do móvel }
// Devolve { grupo, caixa? }; a caixa é o que bloqueia a passagem.
export function criarMovel(f, item) {
  const { grupo, largura, profundidade, redondo } = TIPOS[item.tipo](f, item);
  const giro = THREE.MathUtils.degToRad(item.giro || 0);
  grupo.position.set(item.x, item.y || 0, item.z);
  grupo.rotation.y = giro;
  const caixa = largura
    ? { x: item.x, z: item.z, giro, meiaLargura: largura / 2, meiaProfundidade: profundidade / 2 }
    : null;
  return { grupo, caixa, redondo };
}
