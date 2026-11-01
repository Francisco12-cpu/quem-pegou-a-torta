// papel.js — o "material" do mundo: cartolina de cor chapada, com grão de papel e contorno nas
// bordas de cada recorte. Sem luzes: cada face de uma caixa já vem com o seu tom (mais leve
// no celular e combina com o visual de livro pop-up).

import * as THREE from "../vendor/three.min.js";

// tom de cada face de uma caixa: direita, esquerda, topo, base, frente, trás
const TONS_DAS_FACES = [0.86, 0.86, 1.06, 0.7, 1, 0.8];

function texturaPapel(comBorda) {
  const lado = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = lado;
  const g = canvas.getContext("2d");
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, lado, lado);
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = "rgba(90, 60, 40, " + (0.02 + Math.random() * 0.05) + ")";
    g.fillRect(Math.random() * lado, Math.random() * lado, 2, 1);
  }
  if (comBorda) {
    g.strokeStyle = "rgba(70, 40, 40, 0.6)";
    g.lineWidth = 4;
    g.strokeRect(0, 0, lado, lado);
  }
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.anisotropy = 4;
  return textura;
}

let graoComBorda = null;
let graoLiso = null;

// Uma "folha": cria peças de papel e lembra dos materiais usados nelas.
export class Folha {
  constructor() {
    graoComBorda = graoComBorda || texturaPapel(true);
    graoLiso = graoLiso || texturaPapel(false);
    this.materiais = [];
    this.cache = new Map();
  }

  material(cor, tom = 1, liso = false) {
    const chave = cor + "|" + tom + "|" + liso;
    if (!this.cache.has(chave)) {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(cor).multiplyScalar(tom),
        map: liso ? graoLiso : graoComBorda,
        side: THREE.DoubleSide,
      });
      this.cache.set(chave, material);
      this.materiais.push(material);
    }
    return this.cache.get(chave);
  }

  // caixa com o centro em (x, y, z)
  caixa(largura, altura, profundidade, cor, x = 0, y = 0, z = 0) {
    const materiais = TONS_DAS_FACES.map((tom) => this.material(cor, tom));
    const malha = new THREE.Mesh(new THREE.BoxGeometry(largura, altura, profundidade), materiais);
    malha.position.set(x, y, z);
    return malha;
  }

  // telhado: triângulo na frente, deitado ao longo da profundidade; base centrada em (x, y, z)
  prisma(largura, altura, profundidade, cor, x = 0, y = 0, z = 0) {
    const forma = new THREE.Shape();
    forma.moveTo(-largura / 2, 0);
    forma.lineTo(largura / 2, 0);
    forma.lineTo(0, altura);
    forma.closePath();
    const geometria = new THREE.ExtrudeGeometry(forma, { depth: profundidade, bevelEnabled: false });
    geometria.translate(0, 0, -profundidade / 2);
    const malha = new THREE.Mesh(geometria, this.material(cor, 1, true));
    malha.position.set(x, y, z);
    return malha;
  }

  disco(raio, cor, x = 0, y = 0, z = 0) {
    const malha = new THREE.Mesh(new THREE.CircleGeometry(raio, 28), this.material(cor, 1, true));
    malha.position.set(x, y, z);
    return malha;
  }

  // porta/janela com topo redondo, base em (x, y, z)
  arco(largura, altura, cor, x = 0, y = 0, z = 0) {
    const r = largura / 2;
    const forma = new THREE.Shape();
    forma.moveTo(-r, 0);
    forma.lineTo(r, 0);
    forma.lineTo(r, altura - r);
    forma.absarc(0, altura - r, r, 0, Math.PI, false);
    forma.lineTo(-r, 0);
    const malha = new THREE.Mesh(new THREE.ShapeGeometry(forma, 20), this.material(cor, 1, true));
    malha.position.set(x, y, z);
    return malha;
  }

  cilindro(raioTopo, raioBase, altura, cor, x = 0, y = 0, z = 0) {
    const geometria = new THREE.CylinderGeometry(raioTopo, raioBase, altura, 20);
    const malha = new THREE.Mesh(geometria, this.material(cor, 1, true));
    malha.position.set(x, y, z);
    return malha;
  }

  esfera(raio, cor, x = 0, y = 0, z = 0) {
    const malha = new THREE.Mesh(new THREE.SphereGeometry(raio, 20, 14), this.material(cor, 1, true));
    malha.position.set(x, y, z);
    return malha;
  }

  // plaquinha de madeira com texto
  placa(texto, largura, altura, x = 0, y = 0, z = 0) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = Math.round((512 * altura) / largura);
    const g = canvas.getContext("2d");
    g.fillStyle = "#fff3dc";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.strokeStyle = "#8a5a3a";
    g.lineWidth = 14;
    g.strokeRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = "#c9367f";
    g.font = "bold " + Math.round(canvas.height * 0.58) + "px Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(texto, canvas.width / 2, canvas.height / 2 + 4, canvas.width - 50);
    const textura = new THREE.CanvasTexture(canvas);
    textura.colorSpace = THREE.SRGBColorSpace;
    textura.anisotropy = 4;
    const material = new THREE.MeshBasicMaterial({ map: textura });
    this.materiais.push(material);
    const malha = new THREE.Mesh(new THREE.PlaneGeometry(largura, altura), material);
    malha.position.set(x, y, z);
    return malha;
  }
}
