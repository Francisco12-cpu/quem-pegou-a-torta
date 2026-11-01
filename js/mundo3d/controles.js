// controles.js — teclado e joystick de toque. Devolve só uma direção {x, z} de tamanho até 1:
// x positivo = direita da tela; z positivo = para perto da câmera.

const CODIGOS = {
  ArrowLeft: "esquerda",
  KeyA: "esquerda",
  ArrowRight: "direita",
  KeyD: "direita",
  ArrowUp: "cima",
  KeyW: "cima",
  ArrowDown: "baixo",
  KeyS: "baixo",
};
const CODIGOS_ACAO = { KeyE: true, Enter: true, Space: true };

const ZONA_MORTA = 0.15;

export class Controles {
  // area: elemento que recebe o arrasto; base/pino: o desenho do joystick
  constructor(area, base, pino, aoAcao) {
    this.area = area;
    this.base = base;
    this.pino = pino;
    this.aoAcao = aoAcao;
    this.ativo = false;
    this.teclas = {};
    this.toque = null; // { id, x, y }
    this.raio = 55;
    this.direcao = { x: 0, z: 0 };

    window.addEventListener("keydown", (e) => this.teclaBaixo(e));
    window.addEventListener("keyup", (e) => this.teclaCima(e));
    window.addEventListener("blur", () => this.limpar());

    area.addEventListener("pointerdown", (e) => this.tocar(e));
    area.addEventListener("pointermove", (e) => this.arrastar(e));
    area.addEventListener("pointerup", (e) => this.soltar(e));
    area.addEventListener("pointercancel", (e) => this.soltar(e));
    area.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  teclaBaixo(e) {
    if (!this.ativo) return;
    const nome = CODIGOS[e.code];
    if (nome) {
      this.teclas[nome] = true;
      e.preventDefault();
    } else if (CODIGOS_ACAO[e.code] && !e.repeat) {
      e.preventDefault();
      if (this.aoAcao) this.aoAcao();
    }
  }

  teclaCima(e) {
    const nome = CODIGOS[e.code];
    if (nome) this.teclas[nome] = false;
  }

  tocar(e) {
    if (!this.ativo || this.toque) return;
    const caixa = this.area.getBoundingClientRect();
    this.toque = { id: e.pointerId, x: e.clientX, y: e.clientY };
    this.area.setPointerCapture(e.pointerId);
    this.base.style.left = e.clientX - caixa.left + "px";
    this.base.style.top = e.clientY - caixa.top + "px";
    this.base.hidden = false;
    this.raio = this.base.offsetWidth / 2 || 55; // só tem tamanho depois de aparecer
    this.moverPino(0, 0);
  }

  arrastar(e) {
    if (!this.toque || e.pointerId !== this.toque.id) return;
    this.moverPino(e.clientX - this.toque.x, e.clientY - this.toque.y);
  }

  soltar(e) {
    if (this.toque && e.pointerId === this.toque.id) this.soltarToque();
  }

  soltarToque() {
    this.toque = null;
    this.direcao.x = this.direcao.z = 0;
    this.base.hidden = true;
  }

  moverPino(dx, dy) {
    const d = Math.hypot(dx, dy);
    const limite = d > this.raio ? this.raio / d : 1;
    this.pino.style.transform = "translate(" + dx * limite + "px, " + dy * limite + "px)";
    const forca = Math.min(1, d / this.raio);
    const util = forca < ZONA_MORTA ? 0 : forca;
    this.direcao.x = d ? (dx / d) * util : 0;
    this.direcao.z = d ? (dy / d) * util : 0;
  }

  // direção desejada agora (tamanho de 0 a 1)
  ler() {
    if (this.toque) return this.direcao;
    let x = (this.teclas.direita ? 1 : 0) - (this.teclas.esquerda ? 1 : 0);
    let z = (this.teclas.baixo ? 1 : 0) - (this.teclas.cima ? 1 : 0);
    const d = Math.hypot(x, z);
    if (d > 1) {
      x /= d;
      z /= d;
    }
    return { x, z };
  }

  limpar() {
    this.teclas = {};
    if (this.toque) this.soltarToque();
  }

  ligar() {
    this.ativo = true;
  }

  desligar() {
    this.ativo = false;
    this.limpar();
  }
}
