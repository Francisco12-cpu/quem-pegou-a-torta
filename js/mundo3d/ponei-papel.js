// ponei-papel.js — uma pônei "de papel": o sprite recortado (com borda branca de adesivo) num
// plano que sempre olha pra câmera, animado por código: balanço, squash/stretch, pulinhos e
// virada de carta ao mudar de lado. NPCs usam a mesma classe, só muda a imagem.

import * as THREE from "../vendor/three.min.js";

const BORDA_PX = 5; // grossura da borda branca, nos pixels do sprite
const ALFA_MINIMO = 40; // o que conta como "pixel do desenho" ao medir os cascos

const VELOCIDADE_VIRADA = 9; // unidades por segundo (a carta vai de -1 a 1)
const PASSOS_POR_SEGUNDO = 2.1; // com a velocidade máxima
const ALTURA_PULINHO = 0.16;
const BALANCO = 0.075; // radianos
const INCLINACAO = 0.07; // inclina pra frente ao andar
const SQUASH = 0.075;

export function carregarImagem(url) {
  return new Promise((resolver, rejeitar) => {
    const imagem = new Image();
    imagem.onload = () => resolver(imagem);
    imagem.onerror = () => rejeitar(new Error("Não carregou " + url));
    imagem.src = url;
  });
}

// Desenha o sprite com a borda branca e descobre onde ficam os cascos.
function recortarAdesivo(imagem) {
  const canvas = document.createElement("canvas");
  canvas.width = imagem.naturalWidth + BORDA_PX * 2;
  canvas.height = imagem.naturalHeight + BORDA_PX * 2;
  const g = canvas.getContext("2d", { willReadFrequently: true });

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    g.drawImage(imagem, BORDA_PX + Math.cos(a) * BORDA_PX, BORDA_PX + Math.sin(a) * BORDA_PX);
  }
  g.globalCompositeOperation = "source-in";
  g.fillStyle = "#fff";
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.globalCompositeOperation = "source-over";
  g.drawImage(imagem, BORDA_PX, BORDA_PX);

  const { data, width, height } = g.getImageData(0, 0, canvas.width, canvas.height);
  let base = height - 1;
  procura: for (; base > 0; base--) {
    for (let x = 0; x < width; x++) {
      if (data[(base * width + x) * 4 + 3] > ALFA_MINIMO) break procura;
    }
  }
  return { canvas, sobraEmbaixo: (height - 1 - base) / height };
}

export function criarSombra(raio) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const g = canvas.getContext("2d");
  const grad = g.createRadialGradient(32, 32, 8, 32, 32, 32);
  grad.addColorStop(0, "rgba(30, 40, 30, 0.5)");
  grad.addColorStop(0.7, "rgba(30, 40, 30, 0.34)");
  grad.addColorStop(1, "rgba(30, 40, 30, 0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);

  const malha = new THREE.Mesh(
    new THREE.PlaneGeometry(raio * 2, raio * 2),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false })
  );
  malha.rotation.x = -Math.PI / 2;
  malha.position.y = 0.03;
  return malha;
}

export class PoneiPapel {
  // imagem: <img> já carregada; altura: tamanho no mundo; opcoes.olhandoDireita
  constructor(imagem, altura, opcoes = {}) {
    const { canvas, sobraEmbaixo } = recortarAdesivo(imagem);
    const textura = new THREE.CanvasTexture(canvas);
    textura.colorSpace = THREE.SRGBColorSpace;
    textura.anisotropy = 4;

    const largura = (altura * canvas.width) / canvas.height;
    const geometria = new THREE.PlaneGeometry(largura, altura);
    geometria.translate(0, altura * (0.5 - sobraEmbaixo), 0); // cascos em y = 0

    this.malha = new THREE.Mesh(
      geometria,
      new THREE.MeshBasicMaterial({ map: textura, alphaTest: 0.5, side: THREE.DoubleSide })
    );
    this.pivo = new THREE.Group(); // balança a partir dos cascos
    this.pivo.add(this.malha);

    this.sombra = criarSombra(largura * 0.42);
    this.grupo = new THREE.Group();
    this.grupo.add(this.pivo, this.sombra);

    // os sprites originais olham para a esquerda: 1 = esquerda, -1 = direita
    this.lado = opcoes.olhandoDireita ? -1 : 1;
    this.virada = this.lado;
    this.fase = 0;
    this.andar = 0; // 0 parada, 1 andando na velocidade máxima
    this.tempo = Math.random() * 10; // NPCs não respiram todas juntas
  }

  // vira de lado pra olhar para o ponto x (NPC olhando pra quem chega perto)
  olharPara(x) {
    if (Math.abs(x - this.grupo.position.x) > 0.3) this.lado = x > this.grupo.position.x ? -1 : 1;
  }

  // vx, vz: velocidade atual; vMax: velocidade máxima; camera: pra olhar pra ela
  atualizar(dt, vx, vz, vMax, camera) {
    const rapidez = Math.min(1, Math.hypot(vx, vz) / vMax);
    this.andar += (rapidez - this.andar) * (1 - Math.exp(-14 * dt));
    this.tempo += dt;

    if (Math.abs(vx) > 0.15 * vMax) this.lado = vx > 0 ? -1 : 1;
    const passo = VELOCIDADE_VIRADA * dt;
    this.virada += Math.max(-passo, Math.min(passo, this.lado - this.virada));

    this.fase += PASSOS_POR_SEGUNDO * Math.PI * rapidez * dt;
    const salto = Math.abs(Math.sin(this.fase)); // 0 = casco no chão, 1 = no alto do passo

    const esticar = 1 + (salto - 0.45) * 2 * SQUASH * this.andar + Math.sin(this.tempo * 2.4) * 0.012;
    const larguraVirada = Math.sign(this.virada || 1) * Math.max(0.04, Math.abs(this.virada));

    this.pivo.position.y = salto * ALTURA_PULINHO * this.andar;
    this.pivo.rotation.z = Math.sin(this.fase) * BALANCO * this.andar + this.lado * INCLINACAO * this.andar;
    this.pivo.scale.set(larguraVirada / esticar, esticar, 1);

    const sombra = 1 - salto * 0.22 * this.andar;
    this.sombra.scale.set(sombra, sombra, 1);

    // billboard só no eixo Y
    this.grupo.rotation.y = Math.atan2(
      camera.position.x - this.grupo.position.x,
      camera.position.z - this.grupo.position.z
    );
  }
}
