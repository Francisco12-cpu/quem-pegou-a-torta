// bau-papel.js — o baú de papel, com uma estrelinha dourada girando em cima pra achar de longe.
// Abrir é com o minigame de sempre: aqui só se desenha.

import * as THREE from "../vendor/three.min.js";
import { Folha, fundirPecas } from "./papel.js";
import { criarSombra } from "./ponei-papel.js";

const MADEIRA = "#a9693f";
const OURO = "#ffd479";
const ESCALA = 0.8;

export class BauPapel {
  constructor(x, z, giroGraus = 0) {
    const f = new Folha();
    this.corpo = new THREE.Group();

    const tampa = f.cilindro(0.6, 0.6, 1.8, "#b87a4a", 0, 0.9, 0);
    tampa.rotation.z = Math.PI / 2;
    tampa.scale.x = 0.85; // achata um pouco a curva
    this.corpo.add(tampa, f.caixa(1.8, 0.9, 1.2, MADEIRA, 0, 0.5, 0));

    [-0.62, 0.62].forEach((bx) => {
      this.corpo.add(f.caixa(0.18, 0.92, 1.24, OURO, bx, 0.5, 0));
      const aro = f.cilindro(0.63, 0.63, 0.18, OURO, bx, 0.9, 0);
      aro.rotation.z = Math.PI / 2;
      aro.scale.x = 0.85;
      this.corpo.add(aro);
    });

    this.corpo.add(f.caixa(0.4, 0.46, 0.08, OURO, 0, 0.72, 0.62), f.disco(0.08, "#4a2a18", 0, 0.74, 0.665));

    fundirPecas(this.corpo);

    this.estrela = new THREE.Mesh(new THREE.OctahedronGeometry(0.17), f.material(OURO, 1, true));
    this.estrela.position.y = 2.1;

    const sombra = criarSombra(1.35);
    this.grupo = new THREE.Group();
    this.grupo.add(sombra, this.corpo, this.estrela);
    this.grupo.position.set(x, 0, z);
    this.grupo.scale.setScalar(ESCALA);
    this.corpo.rotation.y = THREE.MathUtils.degToRad(giroGraus);
    this.tempo = Math.random() * 10;
  }

  // perto: a protagonista pode abrir agora (o baú se mexe, chamando)
  atualizar(dt, perto) {
    this.tempo += dt;
    this.estrela.rotation.y = this.tempo * 2.4;
    this.estrela.position.y = 2.1 + Math.sin(this.tempo * 2.6) * 0.1;
    const pulso = perto ? 1 + Math.sin(this.tempo * 9) * 0.035 : 1;
    this.corpo.scale.set(pulso, 2 - pulso, pulso);
  }
}
