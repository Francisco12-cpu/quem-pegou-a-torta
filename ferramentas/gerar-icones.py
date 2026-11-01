"""gerar-icones.py — ícones do aplicativo (PWA), feitos a partir da torta do jogo.

Saem em assets/icones/:
  icone-192.png, icone-512.png — ícone normal
  mascara-512.png              — versão com folga: o Android recorta em círculo/gota
  apple-180.png                — iPhone

Uso: python ferramentas/gerar-icones.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
TORTA = RAIZ / "assets" / "itens" / "torta.png"
PASTA = RAIZ / "assets" / "icones"

COR_CENTRO = np.array((122, 58, 150), dtype=float)
COR_BORDA = np.array((26, 16, 48), dtype=float)


def fundo(lado):
    y, x = np.mgrid[0:lado, 0:lado] / (lado - 1) - 0.5
    distancia = np.clip(np.hypot(x, y) / 0.7, 0, 1)[..., None]
    cores = COR_CENTRO * (1 - distancia) + COR_BORDA * distancia
    alfa = np.full((lado, lado, 1), 255.0)
    return Image.fromarray(np.concatenate((cores, alfa), axis=2).astype(np.uint8), "RGBA")


def icone(lado, fracao):
    """fracao: quanto da largura a torta ocupa."""
    torta = Image.open(TORTA).convert("RGBA")
    # amplia reto primeiro: a pixel art continua nítida ao reduzir pro tamanho final
    torta = torta.resize((torta.width * 4, torta.height * 4), Image.NEAREST)
    largura = round(lado * fracao)
    torta = torta.resize((largura, round(largura * torta.height / torta.width)), Image.LANCZOS)
    img = fundo(lado)
    img.alpha_composite(torta, ((lado - torta.width) // 2, (lado - torta.height) // 2))
    return img


def main():
    PASTA.mkdir(exist_ok=True)
    for nome, lado, fracao in (
        ("icone-192", 192, 0.86),
        ("icone-512", 512, 0.86),
        ("mascara-512", 512, 0.68),
        ("apple-180", 180, 0.8),
    ):
        icone(lado, fracao).convert("RGB").save(PASTA / (nome + ".png"), optimize=True)
        print(nome + ".png")


if __name__ == "__main__":
    main()
