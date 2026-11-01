"""desenhar-itens.py — pixel art 32x32 dos ingredientes da torta (farinha, maçã, canela, mel).

Cada item é desenhado por formas com sombreamento em faixas (luz vindo de cima à esquerda) e
recebe um contorno escuro automático. Sai em 128x128 com os mesmos nomes de sempre em
assets/itens/, então o jogo inteiro usa a arte nova sem mudar nada.

Uso: python ferramentas/desenhar-itens.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

LADO = 32
ESCALA = 4
PASTA = Path(__file__).resolve().parent.parent / "assets" / "itens"
CONTORNO = (59, 32, 39)

CREME = ["#8f7b5c", "#c9b78f", "#ece0bf", "#fbf5e2", "#ffffff"]
VERMELHO = ["#7a1630", "#b3203c", "#de3448", "#f4606a", "#ffb4ae"]
CANELA = ["#5e2f18", "#84461f", "#ab632f", "#cc8646", "#e8ae72"]
AMBAR = ["#a85a10", "#d9860f", "#f5ac1f", "#ffce4d", "#fff0a6"]
VERDE = ["#2f7a3c", "#4aa84a", "#7fd15a"]
ROSA = ["#b83570", "#e65a94", "#ff9cc4", "#ffd0e2"]
CORDA = ["#7a5230", "#b08048", "#d9b478"]
XADREZ = ["#c9374f", "#fff3dc"]


def rgb(cor):
    if isinstance(cor, tuple):
        return cor
    return tuple(int(cor[i : i + 2], 16) for i in (1, 3, 5))


class Tela:
    def __init__(self):
        self.a = np.zeros((LADO, LADO, 4), dtype=np.uint8)
        self.y, self.x = np.mgrid[0:LADO, 0:LADO]

    def pintar(self, mascara, cor):
        self.a[mascara] = rgb(cor) + (255,)

    def rampa(self, mascara, rampa, cx, cy, rx, ry, vies=0.0):
        """Pinta com faixas de luz: mais claro no alto à esquerda, mais escuro embaixo à direita."""
        nx = (self.x - cx) / max(rx, 0.1)
        ny = (self.y - cy) / max(ry, 0.1)
        distancia = np.sqrt(nx**2 + ny**2)
        luz = 0.52 - 0.34 * nx - 0.46 * ny - 0.24 * distancia ** 2 + vies
        indice = np.clip((luz * len(rampa)).astype(int), 0, len(rampa) - 1)
        for i, cor in enumerate(rampa):
            self.pintar(mascara & (indice == i), cor)

    def elipse(self, cx, cy, rx, ry):
        return ((self.x - cx) / rx) ** 2 + ((self.y - cy) / ry) ** 2 <= 1

    def caixa(self, x0, y0, x1, y1):
        return (self.x >= x0) & (self.x <= x1) & (self.y >= y0) & (self.y <= y1)

    def faixa(self, x0, y0, x1, y1, grossura):
        """Pixels a até grossura/2 do segmento."""
        dx, dy = x1 - x0, y1 - y0
        t = np.clip(((self.x - x0) * dx + (self.y - y0) * dy) / (dx * dx + dy * dy), 0, 1)
        return np.hypot(self.x - (x0 + dx * t), self.y - (y0 + dy * t)) <= grossura / 2

    def contornar(self):
        opaco = self.a[:, :, 3] > 0
        p = np.pad(opaco, 1)
        vizinho = p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]
        self.a[vizinho & ~opaco] = CONTORNO + (255,)

    def salvar(self, nome):
        self.contornar()
        img = Image.fromarray(self.a, "RGBA").resize((LADO * ESCALA, LADO * ESCALA), Image.NEAREST)
        img.save(PASTA / (nome + ".png"), optimize=True)
        print(nome + ".png", img.size)


def farinha():
    t = Tela()
    corpo = t.elipse(15.5, 20, 11.5, 9.5) | t.caixa(7, 13, 24, 21)
    corpo &= ~(t.y > 29)
    afunila = (t.y < 13) & (np.abs(t.x - 15.5) > 3.5 + (t.y - 7) * 0.9)
    corpo |= t.elipse(15.5, 13, 8.5, 5)
    t.rampa(corpo & ~afunila, CREME, 13, 17, 13, 13, 0.14)

    # a boca do saco, aberta acima da amarra
    boca = t.elipse(15.5, 5, 6.5, 2.6) | (t.caixa(11, 5, 20, 8))
    t.rampa(boca, CREME, 14, 5, 7, 4, 0.2)
    t.pintar(t.elipse(15.5, 4.4, 4.6, 1.3), "#a9926a")
    t.pintar(t.elipse(15.5, 4.4, 3.2, 0.8), "#ffffff")

    # amarra de corda com laço caindo
    t.pintar(t.caixa(10, 8, 21, 9), CORDA[1])
    t.pintar(t.caixa(10, 8, 21, 8), CORDA[2])
    t.pintar(t.caixa(13, 8, 13, 9), CORDA[0])
    t.pintar(t.caixa(18, 8, 18, 9), CORDA[0])
    t.pintar(t.faixa(21, 9, 24, 14, 1.3), CORDA[1])

    # dobras do pano
    for x0, x1 in ((11, 9), (15, 15), (20, 22)):
        t.pintar(t.faixa(x0, 10, x1, 13, 0.9), CREME[1])

    # ramo de trigo estampado
    t.pintar(t.faixa(15.5, 27, 15.5, 16, 1.0), "#c98a2c")
    for i, y in enumerate((17, 19.5, 22)):
        for lado in (-1, 1):
            t.pintar(t.faixa(15.5, y + 2, 15.5 + lado * 3.2, y, 1.7), "#e6ad3f" if i != 1 else "#d99a30")
    t.pintar(t.elipse(15.5, 15.5, 1.3, 1.9), "#f2c35a")

    # um pouquinho de farinha no chão
    t.pintar(t.elipse(26.5, 28.5, 3, 1.1), CREME[3])
    t.pintar(t.elipse(5, 29, 2, 0.9), CREME[3])
    t.salvar("farinha")


def maca():
    t = Tela()
    corpo = t.elipse(11.5, 18, 8.5, 10) | t.elipse(20.5, 18, 8.5, 10) | t.caixa(11, 24, 21, 27)
    corpo &= ~t.elipse(16, 7.4, 3.2, 2.6)
    corpo &= ~t.elipse(16, 29.5, 1.7, 1.7)
    t.rampa(corpo, VERMELHO, 14, 16, 14, 13, 0.08)

    # covinha do cabinho
    t.pintar(t.elipse(16, 10.5, 3, 1.1) & corpo, VERMELHO[0])
    t.pintar(t.elipse(16, 10.2, 1.6, 0.6) & corpo, "#59102a")

    # brilhos
    t.pintar(t.elipse(9.5, 14, 2, 3.2) & corpo, VERMELHO[4])
    t.pintar(t.elipse(9, 12.5, 1, 1.5) & corpo, "#ffffff")
    t.pintar(t.elipse(13, 11, 0.9, 0.9) & corpo, VERMELHO[4])

    # cabinho
    t.pintar(t.faixa(16, 10, 17.5, 3, 2), CANELA[1])
    t.pintar(t.faixa(15.6, 9, 17, 3, 0.8), CANELA[3])

    # folha com nervura
    folha = t.faixa(19, 7, 26, 3.5, 4.2)
    t.pintar(folha, VERDE[1])
    t.pintar(folha & (t.y + (t.x - 19) * 0.5 < 6), VERDE[2])
    t.pintar(t.faixa(18, 7.5, 26, 3.5, 0.8), VERDE[0])
    t.salvar("maca")


def pau_canela(t, cx, base, topo, inclinacao):
    alto = (cx + inclinacao, topo)
    corpo = t.faixa(cx, base, alto[0], alto[1], 6)
    t.rampa(corpo, CANELA, cx - 0.5, (base + topo) / 2, 3.2, 16, 0.1)
    # a casca enrolada, vista na ponta
    ponta = t.elipse(alto[0], alto[1], 3, 2)
    t.pintar(ponta, CANELA[4])
    t.pintar(t.elipse(alto[0], alto[1], 2, 1.2), CANELA[2])
    t.pintar(t.elipse(alto[0] + 0.2, alto[1], 1, 0.6), CANELA[0])
    # veios
    for y in (base - 5, base - 12, base - 17):
        p = (y - topo) / (base - topo)
        x = alto[0] + (cx - alto[0]) * p
        t.pintar(t.faixa(x - 1.6, y, x + 1.2, y + 1.2, 0.8), CANELA[1])


def canela():
    t = Tela()
    pau_canela(t, 9, 27, 6, -3)
    pau_canela(t, 23, 27, 6, 3)
    pau_canela(t, 16, 28, 4, 0)

    # fita em volta do feixe
    fita = t.caixa(6, 16, 26, 20)
    fita &= t.a[:, :, 3] > 0
    t.pintar(fita, ROSA[1])
    t.pintar(fita & (t.y == 16), ROSA[2])
    t.pintar(fita & (t.y == 20), ROSA[0])

    # laço
    for lado in (-1, 1):
        asa = t.elipse(16 + lado * 5.5, 16.5, 4.8, 3.3)
        t.pintar(asa, ROSA[1])
        t.pintar(asa & t.elipse(16 + lado * 5, 15.5, 3, 1.5), ROSA[2])
        t.pintar(t.elipse(16 + lado * 6.5, 16.8, 1.3, 1), ROSA[0])
        t.pintar(t.faixa(16 + lado, 19, 16 + lado * 4.5, 25, 2.2), ROSA[1])
        t.pintar(t.faixa(16 + lado, 19, 16 + lado * 4.5, 25, 0.8), ROSA[0])
    t.pintar(t.elipse(16, 16.5, 2, 2.3), ROSA[2])
    t.pintar(t.elipse(15.5, 16, 0.9, 1), ROSA[3])
    t.salvar("canela")


def mel():
    t = Tela()
    corpo = t.elipse(15.5, 19.5, 12, 10)
    corpo &= t.y <= 28
    t.rampa(corpo, AMBAR, 13, 17, 14, 12, 0.08)
    t.pintar(t.caixa(9, 29, 22, 29), AMBAR[0])

    # pano xadrez amarrado na tampa
    pano = t.elipse(15.5, 8, 10.5, 4.8) & (t.y <= 11)
    t.pintar(pano, XADREZ[1])
    quadros = (((t.x // 3) + (t.y // 3)) % 2 == 0)
    t.pintar(pano & quadros, XADREZ[0])
    bico = t.caixa(5, 9, 26, 11) & ((t.x % 4) < 3)
    t.pintar(bico & ~quadros, XADREZ[1])
    t.pintar(bico & quadros, XADREZ[0])

    # barbante
    t.pintar(t.caixa(6, 12, 25, 13), CORDA[1])
    t.pintar(t.caixa(6, 12, 25, 12), CORDA[2])

    # mel escorrendo pela boca do pote
    for x, altura in ((9, 18), (13, 16), (21, 19)):
        t.pintar(t.caixa(x - 1, 14, x + 1, altura), AMBAR[4])
        t.pintar(t.elipse(x, altura, 1.4, 1.6), AMBAR[4])

    # brilho do vidro
    t.pintar(t.faixa(6.5, 18, 7.5, 24, 1.7) & corpo, AMBAR[4])
    t.pintar(t.elipse(25, 21, 0.9, 1.6) & corpo, AMBAR[3])

    # etiqueta com uma abelhinha
    rotulo = t.elipse(16, 22.5, 6.2, 4.6)
    t.pintar(rotulo, CONTORNO)
    t.pintar(t.elipse(16, 22.5, 5.2, 3.7), "#fff3dc")
    t.pintar(t.elipse(14.5, 21, 1.8, 1.2), "#bfe8ff")
    t.pintar(t.elipse(17.5, 21, 1.8, 1.2), "#bfe8ff")
    abelha = t.elipse(16, 23.2, 3, 1.8)
    t.pintar(abelha, "#ffc62e")
    t.pintar(abelha & (t.x % 2 == 0), CONTORNO)
    t.salvar("mel")


if __name__ == "__main__":
    farinha()
    maca()
    canela()
    mel()
