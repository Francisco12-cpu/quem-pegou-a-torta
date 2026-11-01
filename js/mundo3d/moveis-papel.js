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
      const prega = f.caixa(0.27, altura + 0.2, 0.05 + (i % 2) * 0.05, i % 2 ? o.cor || ROSA : ROSA_FORTE);
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
    [raio, ROSA_FORTE, 0.03],
    [raio * 0.8, CREME, 0.045],
    [raio * 0.58, ROSA, 0.06],
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
