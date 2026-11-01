"""melhorar-pixelart.py — limpa a pixel art dos sprites sem redesenhar nada.

Os sprites das pôneis vieram de JPG: cada "pixel" do desenho tem uma cor um pouco diferente,
e isso deixa rosto e corpo manchados. Este script trabalha na grade real do desenho:
  1. descobre o tamanho do pixel do desenho e reduz o sprite pra essa grade;
  2. reduz a paleta (poucas cores, sem pontilhado), juntando os tons quase iguais;
  3. troca pixels soltos de ruído pela cor da vizinhança (preservando os de alto contraste,
     como brilho do olho);
  4. firma o contorno de fora com um tom escuro da própria cor;
  5. amplia de volta pro tamanho original, com bordas retas.

Uso:
  python ferramentas/melhorar-pixelart.py <arquivo.png ...> --saida <pasta>
Os sprites gerados por preparar-assets.py ficam intactos em assets/originais.
"""

import argparse
from pathlib import Path

import numpy as np
from PIL import Image

CORES_NA_PALETA = 36
DIFERENCA_RUIDO = 62  # só limpa pixel solto cuja cor seja próxima da vizinhança
ESCURECER_CONTORNO = 0.5  # contorno: cor do pixel multiplicada por isto


def achar_grade(a):
    """Maior tamanho de bloco em que quase todo bloco tem uma cor só."""
    h, w = a.shape[:2]
    melhor = 1
    for g in range(2, 9):
        hh, ww = h - h % g, w - w % g
        blocos = a[:hh, :ww, :3].astype(int).reshape(hh // g, g, ww // g, g, 3)
        variacao = (blocos.max(axis=(1, 3)) - blocos.min(axis=(1, 3))).max(axis=2)
        opaco = a[:hh, :ww, 3].reshape(hh // g, g, ww // g, g).min(axis=(1, 3)) > 200
        if opaco.sum() and (variacao[opaco] <= 6).mean() > 0.9:
            melhor = g
    return melhor


def para_grade(a, g):
    h, w = a.shape[:2]
    return a[g // 2 : h : g, g // 2 : w : g].copy()


def reduzir_paleta(a, n):
    opaco = a[:, :, 3] > 128
    cores = a[opaco][:, :3]
    amostra = Image.fromarray(cores.reshape(-1, 1, 3), "RGB")
    paleta = amostra.quantize(colors=n, method=Image.Quantize.MEDIANCUT, kmeans=4, dither=Image.Dither.NONE)
    lista = np.array(paleta.getpalette()[: n * 3], dtype=int).reshape(-1, 3)
    d = ((cores[:, None, :].astype(int) - lista[None, :, :]) ** 2).sum(axis=2)
    a = a.copy()
    a[opaco, :3] = lista[d.argmin(axis=1)]
    a[:, :, 3] = np.where(opaco, 255, 0)
    return a


def tirar_ruido(a):
    h, w = a.shape[:2]
    saida = a.copy()
    for y in range(h):
        for x in range(w):
            if a[y, x, 3] == 0:
                continue
            viz = []
            for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                j, i = y + dy, x + dx
                if 0 <= j < h and 0 <= i < w and a[j, i, 3]:
                    viz.append(tuple(int(v) for v in a[j, i, :3]))
            cor = tuple(int(v) for v in a[y, x, :3])
            if len(viz) < 3 or cor in viz:
                continue
            maioria = max(set(viz), key=viz.count)
            if viz.count(maioria) >= 2 and sum(abs(p - q) for p, q in zip(cor, maioria)) < DIFERENCA_RUIDO:
                saida[y, x, :3] = maioria
    return saida


def firmar_contorno(a):
    h, w = a.shape[:2]
    p = np.pad(a[:, :, 3] > 0, 1)
    cheio = p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:]
    borda = (a[:, :, 3] > 0) & ~cheio
    luz = a[:, :, :3].astype(float).mean(axis=2)
    clara = borda & (luz > 80)  # o que já é escuro continua como está
    saida = a.copy()
    saida[clara, :3] = (a[clara, :3] * ESCURECER_CONTORNO).astype(np.uint8)
    return saida


def melhorar(caminho, destino):
    original = Image.open(caminho).convert("RGBA")
    a = np.array(original)
    g = achar_grade(a)
    pequeno = para_grade(a, g)
    limpo = firmar_contorno(tirar_ruido(reduzir_paleta(pequeno, CORES_NA_PALETA)))
    final = Image.fromarray(limpo, "RGBA").resize((limpo.shape[1] * g, limpo.shape[0] * g), Image.NEAREST)
    final.save(destino)
    return g, original.size, final.size


def main():
    args = argparse.ArgumentParser()
    args.add_argument("arquivos", nargs="+")
    args.add_argument("--saida", required=True)
    opcoes = args.parse_args()
    pasta = Path(opcoes.saida)
    pasta.mkdir(parents=True, exist_ok=True)
    for arquivo in opcoes.arquivos:
        nome = Path(arquivo).name
        g, antes, depois = melhorar(arquivo, pasta / nome)
        print(f"{nome}: grade {g}px, {antes} -> {depois}")


if __name__ == "__main__":
    main()
