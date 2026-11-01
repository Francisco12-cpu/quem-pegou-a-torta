// casas-papel.js — as casas pop-up, geradas por código. Cada `tipo` de dados/mundo3d.js é uma
// função aqui que monta as peças com a frente (a porta) virada para z positivo.

import * as THREE from "../vendor/three.min.js";
import { dentroDaCaixa } from "./colisao.js";
import { Folha } from "./papel.js";

const ALTURA_BALAO_PORTA = 3.6;
const DISTANCIA_FORA = 1.4; // da parede até onde se fica pra entrar pela porta

const OPACIDADE_ATRAS = 0.35; // a casa fica transparente quando a pônei passa por trás
const VELOCIDADE_FADE = 5;
const FOLGA_CAMERA = 2.5; // a casa some um pouco antes da câmera encostar nela

function janelaRedonda(f, grupo, x, y, z) {
  grupo.add(f.disco(1.15, "#fff3dc", x, y, z), f.disco(0.95, "#bfe8ff", x, y, z + 0.02));
  grupo.add(f.caixa(0.12, 1.9, 0.03, "#fff3dc", x, y, z + 0.04), f.caixa(1.9, 0.12, 0.03, "#fff3dc", x, y, z + 0.04));
}

function toldo(f, grupo, largura, y, z) {
  const listras = 8;
  const passo = largura / listras;
  for (let i = 0; i < listras; i++) {
    const cor = i % 2 ? "#fff3dc" : "#ff6fb0";
    const listra = f.caixa(passo, 0.08, 1.5, cor, -largura / 2 + passo * (i + 0.5), y, z);
    listra.rotation.x = 0.55;
    grupo.add(listra);
  }
}

// a Confeitaria da Pinkie: uma casa de biscoito com cobertura rosa e um cupcake no telhado
function confeitaria(f, dadosCasa) {
  const grupo = new THREE.Group();
  const largura = 11;
  const profundidade = 8;
  const frente = profundidade / 2;

  grupo.add(
    f.caixa(largura + 2, 0.14, profundidade + 2, "#f5e8d0", 0, 0.07, 0), // base de cartolina
    f.caixa(largura, 5, profundidade, "#eccb97", 0, 2.5, 0), // paredes de biscoito
    f.caixa(largura + 0.2, 0.6, profundidade + 0.2, "#8a5a3a", 0, 0.3, 0), // barrado de chocolate
    f.caixa(largura + 0.5, 0.7, profundidade + 0.5, "#ff9ccd", 0, 5.2, 0) // cobertura
  );

  // pingos da cobertura
  for (let i = 0; i < 10; i++) {
    const x = -largura / 2 + 0.6 + i * 1.09;
    grupo.add(f.disco(i % 2 ? 0.42 : 0.56, "#ff9ccd", x, 4.85, frente + 0.26));
  }

  // telhado e o cupcake
  grupo.add(f.prisma(largura + 1.4, 3.4, profundidade + 1, "#ffb7d9", 0, 5.55, 0));
  grupo.add(
    f.cilindro(1.05, 0.75, 1.1, "#f5e8d0", 0, 9.1, 0),
    f.esfera(1.1, "#ff6fb0", 0, 10, 0),
    f.esfera(0.32, "#d92b45", 0, 11.2, 0)
  );
  grupo.children[grupo.children.length - 2].scale.y = 0.75;

  // placa no triângulo do telhado
  grupo.add(f.placa(dadosCasa.placa, 4.8, 1, 0, 6.6, frente + 0.56));

  // porta
  grupo.add(
    f.arco(2.5, 3.5, "#fff3dc", 0, 0.1, frente + 0.02),
    f.arco(2.1, 3.2, "#a9693f", 0, 0.1, frente + 0.04),
    f.disco(0.13, "#ffd479", 0.7, 1.5, frente + 0.06)
  );
  toldo(f, grupo, 4.2, 3.95, frente + 0.65);

  janelaRedonda(f, grupo, -3.6, 2.7, frente + 0.02);
  janelaRedonda(f, grupo, 3.6, 2.7, frente + 0.02);

  return { grupo, largura, profundidade };
}

function porta(f, grupo, z, corPorta, corMoldura = "#fff3dc") {
  grupo.add(
    f.arco(2.5, 3.5, corMoldura, 0, 0.1, z + 0.02),
    f.arco(2.1, 3.2, corPorta, 0, 0.1, z + 0.04),
    f.disco(0.13, "#ffd479", 0.7, 1.5, z + 0.06)
  );
}

// a biblioteca da Twilight mora dentro de uma árvore
function biblioteca(f, dadosCasa) {
  const grupo = new THREE.Group();
  const frente = 4.6;
  grupo.add(
    f.cilindro(4.7, 4.7, 0.14, "#f5e8d0", 0, 0.07, 0),
    f.cilindro(3.8, frente, 7.5, "#a8743f", 0, 3.75, 0)
  );
  // raízes
  [-1, 1].forEach((lado) => grupo.add(f.caixa(1.1, 0.8, 4, "#8f6134", lado * 4.4, 0.4, 1.4)));

  // copa em camadas, do escuro pro claro
  [
    [0, 9.6, -1.4, 5.8, "#5da84c"],
    [-3.6, 8.8, 0.6, 3.6, "#6fbf5a"],
    [3.8, 8.9, 0.4, 3.7, "#6fbf5a"],
    [0, 11.4, 0.6, 3.9, "#86d06c"],
    [-1.8, 8.4, 2.6, 2.3, "#86d06c"],
    [2.2, 8.5, 2.5, 2.2, "#9bdc7f"],
  ].forEach(([x, y, z, raio, cor]) => grupo.add(f.esfera(raio, cor, x, y, z)));

  grupo.add(f.placa(dadosCasa.placa, 3.6, 0.8, 0, 4.5, frente + 0.03, "#5b3a8c"));
  porta(f, grupo, frente, "#6f4a8e");
  grupo.add(f.disco(0.7, "#fff3dc", -2.5, 2.5, frente - 0.5), f.disco(0.55, "#ffe9a8", -2.5, 2.5, frente - 0.47));
  grupo.add(f.disco(0.7, "#fff3dc", 2.5, 2.5, frente - 0.5), f.disco(0.55, "#ffe9a8", 2.5, 2.5, frente - 0.47));
  return { grupo, largura: 9.4, profundidade: frente * 2 };
}

// a Boutique Carrossel da Rarity: redonda como um carrossel, com telhado de cone
function boutique(f, dadosCasa) {
  const grupo = new THREE.Group();
  const frente = 5;
  grupo.add(
    f.cilindro(frente + 0.9, frente + 0.9, 0.14, "#f5e8d0", 0, 0.07, 0),
    f.cilindro(frente, frente, 5.4, "#f1e4f8", 0, 2.7, 0),
    f.cilindro(frente + 0.2, frente + 0.2, 0.5, "#8fd3e8", 0, 0.25, 0),
    f.cilindro(frente + 0.3, frente + 0.3, 0.45, "#ffd479", 0, 5.5, 0),
    f.cilindro(0.1, frente + 1, 4.6, "#a884d8", 0, 8, 0),
    f.esfera(0.5, "#ffd479", 0, 10.5, 0)
  );
  // listras do toldo redondo
  for (let i = -3; i <= 3; i++) {
    const a = (i / 3) * 0.95;
    grupo.add(f.disco(0.5, i % 2 ? "#ffd479" : "#ff9ccd", Math.sin(a) * (frente + 0.4), 5.1, Math.cos(a) * (frente + 0.4)));
  }
  grupo.add(f.placa(dadosCasa.placa, 3.4, 0.8, 0, 4.4, frente + 0.03, "#7a4fb0"));
  porta(f, grupo, frente, "#d58ad0", "#ffd479");
  [-1, 1].forEach((lado) => {
    grupo.add(
      f.arco(1.5, 2.6, "#ffd479", lado * 2.9, 1, frente - 0.75),
      f.arco(1.15, 2.3, "#a8e0f2", lado * 2.9, 1.1, frente - 0.72)
    );
  });
  return { grupo, largura: 10, profundidade: frente * 2 };
}

// a casa da Rainbow Dash: colunas brancas sobre uma nuvem, com uma cachoeira de arco-íris
function nuvem(f, dadosCasa) {
  const grupo = new THREE.Group();
  const largura = 10;
  const profundidade = 8;
  const frente = profundidade / 2;

  // a nuvem da base, sem nada na frente da porta
  [
    [-5.2, 0.7, 2.6, 2.2],
    [5.2, 0.7, 2.6, 2.2],
    [-5.8, 0.9, -1.4, 2.6],
    [5.8, 0.9, -1.4, 2.6],
    [0, 0.9, -4.4, 3],
    [-3.2, 0.5, 4.2, 1.5],
    [3.2, 0.5, 4.2, 1.5],
  ].forEach(([x, y, z, raio]) => grupo.add(f.esfera(raio, "#ffffff", x, y, z)));

  grupo.add(f.caixa(largura, 5, profundidade, "#a9dcf7", 0, 2.5, 0));
  for (let i = 0; i < 4; i++) {
    const x = -4.2 + i * 2.8;
    if (Math.abs(x) > 1.6) grupo.add(f.cilindro(0.45, 0.45, 5, "#ffffff", x, 2.5, frente + 0.2));
  }
  grupo.add(f.caixa(largura + 1, 0.6, profundidade + 1, "#ffffff", 0, 5.3, 0));
  [
    [0, 6.4, 0, 3.4],
    [-3.3, 6, 0.5, 2.1],
    [3.3, 6, 0.5, 2.1],
  ].forEach(([x, y, z, raio]) => grupo.add(f.esfera(raio, "#ffffff", x, y, z)));

  // arco-íris caindo pelo lado direito
  ["#e8473f", "#f28c38", "#f6d344", "#5bc85a", "#4a9be8", "#8a5bd6"].forEach((cor, i) => {
    grupo.add(f.caixa(0.32, 6, 0.24, cor, largura / 2 + 0.2 + i * 0.32, 3, 1.6));
  });

  grupo.add(f.placa(dadosCasa.placa, 3.8, 0.8, 0, 4.4, frente + 0.53, "#2f7fd6"));
  porta(f, grupo, frente, "#4a9be8");
  return { grupo, largura: largura + 2, profundidade };
}

// o chalé da Fluttershy: telhado coberto de grama, flores e casinhas de passarinho
function chale(f, dadosCasa) {
  const grupo = new THREE.Group();
  const largura = 10;
  const profundidade = 8;
  const frente = profundidade / 2;
  grupo.add(
    f.caixa(largura + 2, 0.14, profundidade + 2, "#f5e8d0", 0, 0.07, 0),
    f.caixa(largura, 4.4, profundidade, "#f6e7c1", 0, 2.2, 0),
    f.caixa(largura + 0.2, 0.5, profundidade + 0.2, "#a07a4f", 0, 0.25, 0),
    f.prisma(largura + 1.8, 4, profundidade + 1.2, "#8cc56a", 0, 4.4, 0),
    f.esfera(0.6, "#6fb04f", -4.6, 4.8, frente + 0.5),
    f.esfera(0.75, "#a5d884", 3.8, 5, frente + 0.5)
  );
  grupo.add(f.placa(dadosCasa.placa, 3.4, 0.8, 0, 5.4, frente + 0.63, "#3f8a4a"));
  porta(f, grupo, frente, "#7cb35c");

  [-1, 1].forEach((lado) => {
    janelaRedonda(f, grupo, lado * 3.3, 2.5, frente + 0.02);
    grupo.add(f.caixa(2.6, 0.4, 0.5, "#a07a4f", lado * 3.3, 1.25, frente + 0.2));
    ["#ff9ccd", "#ffd479", "#c8a2f0", "#ff9ccd"].forEach((cor, i) => {
      grupo.add(f.esfera(0.2, cor, lado * 3.3 - 0.9 + i * 0.6, 1.55, frente + 0.3));
    });
  });

  // casinha de passarinho
  grupo.add(
    f.caixa(0.15, 2, 0.15, "#a07a4f", -6.3, 1, 3.6),
    f.caixa(0.8, 0.8, 0.8, "#ffd479", -6.3, 2.3, 3.6),
    f.prisma(1.2, 0.5, 1, "#e8735a", -6.3, 2.7, 3.6),
    f.disco(0.17, "#4a2a18", -6.3, 2.3, 4.02)
  );
  return { grupo, largura, profundidade };
}

// o celeiro da Applejack, onde é a festa
function celeiro(f, dadosCasa) {
  const grupo = new THREE.Group();
  const largura = 12;
  const profundidade = 9;
  const frente = profundidade / 2;
  grupo.add(
    f.caixa(largura + 2, 0.14, profundidade + 2, "#f5e8d0", 0, 0.07, 0),
    f.caixa(largura, 5.4, profundidade, "#c9413a", 0, 2.7, 0),
    f.prisma(largura + 1.2, 4, profundidade + 1, "#7a2f2a", 0, 5.4, 0),
    f.prisma(largura - 0.9, 3.4, 0.1, "#c9413a", 0, 5.4, frente + 0.4)
  );
  grupo.add(f.placa(dadosCasa.placa, 3.6, 0.9, 0, 6.5, frente + 0.48, "#b5332d"));
  porta(f, grupo, frente, "#fff3dc", "#7a2f2a");
  // o X branco de cada lado da porta
  [-1, 1].forEach((lado) => {
    const x = lado * 3.9;
    grupo.add(f.caixa(3, 3, 0.05, "#d9574f", x, 2.3, frente + 0.02));
    [0.78, -0.78].forEach((giro) => {
      const barra = f.caixa(4, 0.22, 0.05, "#fff3dc", x, 2.3, frente + 0.05);
      barra.rotation.z = giro;
      grupo.add(barra);
    });
  });
  // bandeirinhas da festa
  for (let i = 0; i < 9; i++) {
    const x = -largura / 2 + 1 + i * 1.25;
    const bandeira = f.disco(0.36, ["#ff6fb0", "#ffd479", "#8fc7ff"][i % 3], x, 5.05, frente + 0.1);
    grupo.add(bandeira);
  }
  return { grupo, largura, profundidade };
}

const TIPOS = { confeitaria, biblioteca, boutique, nuvem, chale, celeiro };

// dadosCasa: item de MUNDO3D.casas
export function criarCasa(dadosCasa) {
  const folha = new Folha();
  const { grupo, largura, profundidade } = TIPOS[dadosCasa.tipo](folha, dadosCasa);
  const giro = THREE.MathUtils.degToRad(dadosCasa.giro || 0);

  grupo.position.set(dadosCasa.x, 0, dadosCasa.z);
  grupo.rotation.y = giro;

  const naFrente = (distancia) => ({
    x: dadosCasa.x + Math.sin(giro) * distancia,
    z: dadosCasa.z + Math.cos(giro) * distancia,
  });

  return {
    dados: dadosCasa,
    grupo,
    x: dadosCasa.x,
    z: dadosCasa.z,
    giro,
    meiaLargura: largura / 2,
    meiaProfundidade: profundidade / 2,
    altura: 12,
    materiais: folha.materiais,
    opacidade: 1,
    porta: { ...naFrente(profundidade / 2 + DISTANCIA_FORA / 2), altura: ALTURA_BALAO_PORTA },
    saida: naFrente(profundidade / 2 + DISTANCIA_FORA),
  };
}

// A casa fica transparente enquanto esconde a pônei, e some se a câmera entrar nela.
export function atualizarOpacidade(casa, jogador, camera, dt) {
  const dx = Math.abs(jogador.x - casa.x);
  const fundoDaCasa = casa.z - casa.meiaProfundidade;
  const escondendo = dx < casa.meiaLargura + 1.5 && jogador.z < casa.z && camera.z > fundoDaCasa - 2;
  const cameraDentro = dentroDaCaixa(camera.x, camera.z, casa, FOLGA_CAMERA);
  const alvo = cameraDentro ? 0 : escondendo ? OPACIDADE_ATRAS : 1;
  if (casa.opacidade === alvo) return;

  const passo = VELOCIDADE_FADE * dt;
  casa.opacidade += Math.max(-passo, Math.min(passo, alvo - casa.opacidade));
  casa.grupo.visible = casa.opacidade > 0;
  casa.materiais.forEach((m) => {
    const transparente = casa.opacidade < 1;
    if (m.transparent !== transparente) {
      m.transparent = transparente;
      m.needsUpdate = true;
    }
    m.opacity = casa.opacidade;
  });
}
