// casas-papel.js — as casas pop-up, geradas por código. Cada `tipo` de dados/mundo3d.js é uma
// função aqui que monta as peças com a frente (a porta) virada para z positivo.

import * as THREE from "../vendor/three.min.js";
import { Folha } from "./papel.js";

const ALTURA_BALAO_PORTA = 3.6;
const DISTANCIA_FORA = 1.4; // da parede até onde se fica pra entrar pela porta

const OPACIDADE_ATRAS = 0.35; // a casa fica transparente quando a pônei passa por trás
const VELOCIDADE_FADE = 8;

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

const TIPOS = { confeitaria };

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

// A casa fica transparente enquanto esconde a pônei.
export function atualizarOpacidade(casa, jogador, dt) {
  const dx = Math.abs(jogador.x - casa.x);
  const atras = jogador.z - casa.z; // negativo = mais longe da câmera que o centro da casa
  const escondendo = dx < casa.meiaLargura + 1.5 && atras < 0 && atras > -(casa.meiaProfundidade + casa.altura * 0.7);
  const alvo = escondendo ? OPACIDADE_ATRAS : 1;
  if (casa.opacidade === alvo) return;

  const passo = VELOCIDADE_FADE * dt * (1 - OPACIDADE_ATRAS);
  casa.opacidade += Math.max(-passo, Math.min(passo, alvo - casa.opacidade));
  casa.materiais.forEach((m) => {
    const transparente = casa.opacidade < 1;
    if (m.transparent !== transparente) {
      m.transparent = transparente;
      m.needsUpdate = true;
    }
    m.opacity = casa.opacidade;
  });
}
