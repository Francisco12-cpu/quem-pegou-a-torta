"""preparar-assets.py — gera as imagens usadas pelo jogo (assets/sprites, assets/cenarios,
assets/itens) a partir das imagens originais em assets/originais/.

Precisa de Python 3 + Pillow + NumPy (`pip install pillow numpy`):

    python ferramentas/preparar-assets.py

Os originais em assets/originais/ nunca são alterados.

Como trocar uma imagem por uma versão melhor:
- Jeito mais simples: substitua direto o PNG em assets/sprites/ (ou assets/cenarios/) por
  outro com o MESMO nome. O jogo usa o novo arquivo na hora, sem mexer em código.
- Ou substitua o original em assets/originais/ (mesmo nome, pode ser .jpg ou .png) e rode
  este script de novo. Se o original novo já tiver fundo transparente (PNG), o script só
  recorta e padroniza o tamanho, sem tentar remover fundo.

O que o script faz:
- Sprites: as fotos são pixel art ampliado e salvo em JPG. O script descobre o tamanho do
  "pixel" de cada foto e redesenha o sprite quadradinho por quadradinho, usando a cor do
  centro de cada um — isso elimina a borda borrada e os pontinhos brancos do fundo. Descarta
  o texto do nome no topo e padroniza a altura.
- Cenários: converte pra PNG em 16:9 (todos iguais — a exploração posiciona o chão em % da
  imagem), cortando bordas brancas quando a foto tem cantos arredondados.
- Torta: remove o fundo preto.
- Protagonista: o autor ainda não tem sprite dela; o script gera um recolorindo a Fluttershy.
  Ele NUNCA sobrescreve assets/sprites/protagonista.png se o arquivo já existir — pode trocar
  à vontade. Pra gerar de novo: `python ferramentas/preparar-assets.py --refazer-protagonista`.
- Ícones pixel art (ingredientes, baú, cadeado, relógio, falha): desenhados aqui mesmo, em
  grades de texto, e salvos ampliados sem borrar.
"""

import colorsys
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / "assets" / "originais"
DESTINO = RAIZ / "assets"

ALTURA_SPRITE = 256  # altura final de todo sprite, em px (o CSS escala a partir daqui)

# nome do original em assets/originais (sem extensão) -> arquivo final em assets/sprites
SPRITES = {
    "twilight": "twilight.png",
    "rarity": "rarity.png",
    "rainbow-dash": "rainbow-dash.png",
    "fluttershy": "fluttershy.png",
    "pinkie": "pinkie.png",
    "applejack": "applejack.png",
}

# (arquivo, destino, margem a cortar em % de cada lado — pra cantos arredondados/bordas,
#  âncora vertical do corte 16:9: 0 = mantém o topo, 1 = mantém o chão)
CENARIOS = [
    ("praca-ponyville", "praca-ponyville.png", 0, 0.6),
    ("rua-ponyville", "rua-ponyville.png", 0, 0.6),
    ("cozinha-pinkie", "cozinha-pinkie.png", 0, 0.5),
    ("biblioteca-twilight", "biblioteca-twilight.png", 0, 0.5),
    ("atelie-rarity", "atelie-rarity.png", 0, 0.6),
    ("casa-fluttershy", "casa-fluttershy.png", 2.5, 0.5),
    ("festa-decorada", "festa-decorada.png", 0, 0.5),
    ("celeiro-applejack", "celeiro-applejack.png", 0, 0.5),
]
PROPORCAO_CENARIO = 16 / 9

TORTA = ("torta", "torta.png")

EXTENSOES = (".png", ".jpg", ".jpeg", ".webp")


def abrir_original(nome):
    """Abre assets/originais/<nome>.<png|jpg|jpeg|webp> — a extensão tanto faz, pra facilitar
    trocar o original por uma versão melhor."""
    for ext in EXTENSOES:
        caminho = ORIGEM / (nome + ext)
        if caminho.exists():
            return Image.open(caminho)
    raise FileNotFoundError("original não encontrado: assets/originais/" + nome + ".(png|jpg)")


def tem_transparencia(img):
    return img.mode in ("RGBA", "LA", "P") and img.convert("RGBA").getextrema()[3][0] < 255


def distancia(c1, c2):
    return max(abs(c1[0] - c2[0]), abs(c1[1] - c2[1]), abs(c1[2] - c2[2]))


def cor_de_fundo(img):
    """Mediana das cores das 4 bordas — o fundo das fotos é liso (branco, cinza ou preto)."""
    w, h = img.size
    px = img.load()
    amostras = [px[x, 0] for x in range(w)] + [px[x, h - 1] for x in range(w)]
    amostras += [px[0, y] for y in range(h)] + [px[w - 1, y] for y in range(h)]
    return tuple(sorted(c[i] for c in amostras)[len(amostras) // 2] for i in range(3))


def mascara_fundo(img, tolerancia):
    """Flood fill a partir de toda a borda: marca como fundo só o que for parecido com a cor
    de fundo E estiver conectado à borda — assim o branco dos olhos/Rarity não some."""
    w, h = img.size
    px = img.load()
    fundo = cor_de_fundo(img)
    eh_fundo = bytearray(w * h)
    fila = deque()
    for x in range(w):
        fila.append((x, 0))
        fila.append((x, h - 1))
    for y in range(h):
        fila.append((0, y))
        fila.append((w - 1, y))
    while fila:
        x, y = fila.popleft()
        i = y * w + x
        if eh_fundo[i] or distancia(px[x, y], fundo) > tolerancia:
            continue
        eh_fundo[i] = 1
        if x > 0:
            fila.append((x - 1, y))
        if x < w - 1:
            fila.append((x + 1, y))
        if y > 0:
            fila.append((x, y - 1))
        if y < h - 1:
            fila.append((x, y + 1))
    return eh_fundo


def remover_buracos_fechados(img, eh_fundo, tolerancia_buraco, area_minima):
    """Buracos de fundo que o flood fill não alcança (ex.: entre as patas, fechados pela
    sombra). Só remove regiões GRANDES e quase idênticas ao fundo — o corpo branco-lilás da
    Rarity e o branco dos olhos ficam."""
    w, h = img.size
    px = img.load()
    fundo = cor_de_fundo(img)
    visto = bytearray(w * h)
    for inicio in range(w * h):
        if eh_fundo[inicio] or visto[inicio]:
            continue
        if distancia(px[inicio % w, inicio // w], fundo) > tolerancia_buraco:
            continue
        regiao, fila = [], deque([inicio])
        visto[inicio] = 1
        while fila:
            i = fila.popleft()
            regiao.append(i)
            x = i % w
            for j in (i - 1 if x > 0 else -1, i + 1 if x < w - 1 else -1, i - w, i + w):
                if 0 <= j < w * h and not eh_fundo[j] and not visto[j]:
                    if distancia(px[j % w, j // w], fundo) <= tolerancia_buraco:
                        visto[j] = 1
                        fila.append(j)
        if len(regiao) >= area_minima:
            for i in regiao:
                eh_fundo[i] = 1


def limpar_franja(img, eh_fundo, tolerancia_franja, passadas):
    """Compressão JPG deixa uma borda clara em volta do pixel art; remove pixels colados no
    fundo que ainda puxam pra cor de fundo."""
    w, h = img.size
    px = img.load()
    fundo = cor_de_fundo(img)
    for _ in range(passadas):
        remover = []
        for y in range(1, h - 1):
            for x in range(1, w - 1):
                i = y * w + x
                if eh_fundo[i]:
                    continue
                vizinho_fundo = eh_fundo[i - 1] or eh_fundo[i + 1] or eh_fundo[i - w] or eh_fundo[i + w]
                if vizinho_fundo and distancia(px[x, y], fundo) <= tolerancia_franja:
                    remover.append(i)
        for i in remover:
            eh_fundo[i] = 1


def maior_componente(eh_fundo, w, h):
    """Bounding box do maior bloco conectado que não é fundo (a pônei). Descarta o texto do
    nome no topo da foto e qualquer sujeira solta de compressão JPG."""
    visto = bytearray(w * h)
    melhor = (0, None)
    for inicio in range(w * h):
        if eh_fundo[inicio] or visto[inicio]:
            continue
        fila = deque([inicio])
        visto[inicio] = 1
        tamanho, x0, y0, x1, y1 = 0, w, h, 0, 0
        while fila:
            i = fila.popleft()
            x, y = i % w, i // w
            tamanho += 1
            x0, y0, x1, y1 = min(x0, x), min(y0, y), max(x1, x), max(y1, y)
            for j in (i - 1 if x > 0 else -1, i + 1 if x < w - 1 else -1, i - w, i + w):
                if 0 <= j < w * h and not eh_fundo[j] and not visto[j]:
                    visto[j] = 1
                    fila.append(j)
        if tamanho > melhor[0]:
            melhor = (tamanho, (x0, y0, x1 + 1, y1 + 1))
    return melhor[1]


def recortar_sem_fundo(img, tolerancia, limpar_buracos=True):
    img = img.convert("RGB")
    w, h = img.size
    eh_fundo = mascara_fundo(img, tolerancia)
    if limpar_buracos:
        remover_buracos_fechados(img, eh_fundo, tolerancia_buraco=14, area_minima=w * h // 800)
        limpar_franja(img, eh_fundo, tolerancia_franja=60, passadas=2)
    caixa = maior_componente(eh_fundo, w, h)

    rgba = img.convert("RGBA")
    px = rgba.load()
    for y in range(h):
        for x in range(w):
            dentro = caixa[0] <= x < caixa[2] and caixa[1] <= y < caixa[3]
            if eh_fundo[y * w + x] or not dentro:
                px[x, y] = (0, 0, 0, 0)
    return rgba.crop(caixa)


# ---- recorte em grade (pixel art) ----


def perfil_de_bordas(arr, eixo):
    """Quantas "bordas" de cor existem em cada coluna (eixo=1) ou linha (eixo=0)."""
    d = np.abs(np.diff(arr.astype(int), axis=eixo)).sum(axis=2)
    return (d > 50).sum(axis=0 if eixo == 1 else 1)


def detectar_grade(perfil):
    """Acha o tamanho (s) e o deslocamento (o) do "pixel" do pixel art: o período em que as
    bordas de cor mais se repetem. Devolve (s, o, confiança)."""
    n = len(perfil)
    idx = np.arange(n)
    total = perfil.sum() + 1e-9
    melhor = (0.0, None, None)
    for s in np.arange(3.0, 16.0, 0.02):
        for o in np.arange(0, s, 0.25):
            fase = (idx - o) % s
            perto = (fase < 0.75) | (fase > s - 0.75)
            nota = perfil[perto].sum() / total - perto.mean()
            if nota > melhor[0]:
                melhor = (nota, s, o)
    return melhor[1], melhor[2], melhor[0]


def recortar_em_grade(img, tolerancia):
    """Redesenha o sprite quadradinho por quadradinho: a cor de cada "pixel" vem do centro
    dele (longe das bordas borradas do JPG), e ele só é transparente se o centro for fundo."""
    img = img.convert("RGB")
    w, h = img.size
    eh_fundo = mascara_fundo(img, tolerancia)
    remover_buracos_fechados(img, eh_fundo, tolerancia_buraco=14, area_minima=w * h // 800)

    arr = np.array(img)
    fundo = np.frombuffer(bytes(eh_fundo), dtype=np.uint8).reshape(h, w).astype(bool)
    sx, ox, cx = detectar_grade(perfil_de_bordas(arr, 1))
    sy, oy, cy = detectar_grade(perfil_de_bordas(arr, 0))
    if min(cx, cy) < 0.25:
        return None  # sem grade clara: quem chama usa o recorte simples

    s = (sx + sy) / 2
    x_ini = (ox + 1) % s  # a borda fica entre o pixel i e i+1 -> a célula começa em i+1
    y_ini = (oy + 1) % s
    colunas = int((w - x_ini) // s)
    linhas = int((h - y_ini) // s)

    cores = np.zeros((linhas, colunas, 4), dtype=np.uint8)
    margem = s * 0.3
    for j in range(linhas):
        y0, y1 = int(y_ini + j * s + margem), int(y_ini + (j + 1) * s - margem)
        for i in range(colunas):
            x0, x1 = int(x_ini + i * s + margem), int(x_ini + (i + 1) * s - margem)
            bloco_fundo = fundo[y0 : y1 + 1, x0 : x1 + 1]
            if bloco_fundo.size == 0 or bloco_fundo.mean() > 0.5:
                continue
            bloco = arr[y0 : y1 + 1, x0 : x1 + 1][~bloco_fundo]
            cores[j, i, :3] = np.median(bloco, axis=0)
            cores[j, i, 3] = 255

    # fica só o maior grupo de "pixels" (a pônei + sombra); o texto do nome é descartado
    opaco = cores[:, :, 3] > 0
    rotulo = np.zeros(opaco.shape, dtype=int)
    atual, maior, tamanho_maior = 0, 0, 0
    for j0 in range(linhas):
        for i0 in range(colunas):
            if not opaco[j0, i0] or rotulo[j0, i0]:
                continue
            atual += 1
            fila, tamanho = deque([(j0, i0)]), 0
            rotulo[j0, i0] = atual
            while fila:
                j, i = fila.popleft()
                tamanho += 1
                for dj in (-1, 0, 1):
                    for di in (-1, 0, 1):
                        a, b = j + dj, i + di
                        if 0 <= a < linhas and 0 <= b < colunas and opaco[a, b] and not rotulo[a, b]:
                            rotulo[a, b] = atual
                            fila.append((a, b))
            if tamanho > tamanho_maior:
                maior, tamanho_maior = atual, tamanho
    cores[rotulo != maior] = 0
    remover_restos_de_fundo(cores, np.array(cor_de_fundo(img)))

    js, is_ = np.nonzero(cores[:, :, 3] > 0)
    cores = cores[js.min() : js.max() + 1, is_.min() : is_.max() + 1]
    return Image.fromarray(cores, "RGBA")


def remover_restos_de_fundo(cores, fundo, tolerancia=20):
    """Tira "pixels" da cor do fundo que sobraram em frestas (entre cachos da cauda, entre a
    asa e o corpo). O contorno das pôneis é escuro, então um pixel da cor do fundo encostado
    na transparência é sempre resto de fundo. Os fechados (sem encostar) só saem da metade
    de baixo do sprite — em cima podem ser brilho de olho/cabelo, que é branco de propósito."""
    linhas, colunas = cores.shape[:2]
    parecido = (np.abs(cores[:, :, :3].astype(int) - fundo).max(axis=2) <= tolerancia) & (cores[:, :, 3] > 0)

    def encosta_na_transparencia(j, i):
        for dj in (-1, 0, 1):
            for di in (-1, 0, 1):
                a, b = j + dj, i + di
                if not (0 <= a < linhas and 0 <= b < colunas) or cores[a, b, 3] == 0:
                    return True
        return False

    def abrir_frestas():
        mudou = True
        while mudou:  # repete: uma fresta de 2-3 pixels vai "abrindo" de fora pra dentro
            mudou = False
            for j, i in zip(*np.nonzero(parecido)):
                if cores[j, i, 3] and encosta_na_transparencia(j, i):
                    cores[j, i] = 0
                    parecido[j, i] = False
                    mudou = True

    abrir_frestas()
    opacos = np.nonzero(cores[:, :, 3] > 0)[0]
    if len(opacos):
        meio = (opacos.min() + opacos.max()) / 2
        for j, i in zip(*np.nonzero(parecido)):
            if j > meio:
                cores[j, i] = 0
                parecido[j, i] = False
    abrir_frestas()


def recortar_transparente(img):
    """Original que já veio com fundo transparente: só recorta o espaço vazio em volta."""
    img = img.convert("RGBA")
    return img.crop(img.getbbox())


def preparar_sprites():
    pasta = DESTINO / "sprites"
    pasta.mkdir(parents=True, exist_ok=True)
    for original, final in SPRITES.items():
        img = abrir_original(original)
        if tem_transparencia(img):
            sprite = recortar_transparente(img)
            metodo = "transparente"
        else:
            sprite = recortar_em_grade(img, tolerancia=28)
            metodo = "grade"
            if sprite is None:
                sprite = recortar_sem_fundo(img, tolerancia=28)
                metodo = "simples"
        # ampliação por número inteiro, sem borrar (NEAREST): cada pixel vira um quadrado
        fator = max(1, round(ALTURA_SPRITE / sprite.height))
        sprite = sprite.resize((sprite.width * fator, sprite.height * fator), Image.NEAREST)
        sprite.save(pasta / final, optimize=True)
        print("sprite  ", final, sprite.size, metodo)


def cortar_proporcao(img, proporcao, ancora_vertical):
    w, h = img.size
    if w / h > proporcao:  # larga demais: corta dos lados, centralizado
        nova_w = round(h * proporcao)
        x0 = (w - nova_w) // 2
        return img.crop((x0, 0, x0 + nova_w, h))
    nova_h = round(w / proporcao)
    y0 = round((h - nova_h) * ancora_vertical)
    return img.crop((0, y0, w, y0 + nova_h))


def preparar_cenarios():
    pasta = DESTINO / "cenarios"
    pasta.mkdir(parents=True, exist_ok=True)
    for original, final, margem, ancora in CENARIOS:
        img = abrir_original(original).convert("RGB")
        if margem:
            mx, my = round(img.width * margem / 100), round(img.height * margem / 100)
            img = img.crop((mx, my, img.width - mx, img.height - my))
        img = cortar_proporcao(img, PROPORCAO_CENARIO, ancora)
        img.save(pasta / final, optimize=True)
        print("cenario ", final, img.size)


def preparar_torta():
    pasta = DESTINO / "itens"
    pasta.mkdir(parents=True, exist_ok=True)
    original, final = TORTA
    img = abrir_original(original)
    if tem_transparencia(img):
        torta = recortar_transparente(img)
    else:
        torta = recortar_sem_fundo(img, tolerancia=40, limpar_buracos=False)
    torta.thumbnail((256, 256), Image.NEAREST)
    torta.save(pasta / final, optimize=True)
    print("item    ", final, torta.size)


# ---- protagonista: Fluttershy recolorida ----

# faixas de matiz (graus) do sprite da Fluttershy -> matiz nova, fator de saturação e de
# brilho. Paleta natural: pelagem creme/bege e crina castanha.
RECOLOR_PROTAGONISTA = [
    ((20, 70), 32, 0.55, 1.0),  # corpo amarelo -> creme/bege
    ((290, 360), 20, 1.6, 0.6),  # crina/cauda rosa (e contorno) -> castanho
    ((0, 20), 20, 1.6, 0.6),
]


def preparar_protagonista():
    destino = DESTINO / "sprites" / "protagonista.png"
    if destino.exists() and "--refazer-protagonista" not in sys.argv:
        print("sprite   protagonista.png já existe — mantido (use --refazer-protagonista pra gerar de novo)")
        return
    base = Image.open(DESTINO / "sprites" / "fluttershy.png").convert("RGBA")
    px = base.load()
    for y in range(base.height):
        for x in range(base.width):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if s < 0.12:  # sombra cinza e branco dos olhos ficam como estão
                continue
            graus = h * 360
            for (ini, fim), novo, fator_s, fator_v in RECOLOR_PROTAGONISTA:
                if ini <= graus < fim:
                    nr, ng, nb = colorsys.hsv_to_rgb(novo / 360, min(1, s * fator_s), v * fator_v)
                    px[x, y] = (round(nr * 255), round(ng * 255), round(nb * 255), a)
                    break
    base.save(destino, optimize=True)
    print("sprite   protagonista.png", base.size)


# ---- ícones pixel art ----
# Cada ícone é uma grade de texto; cada caractere é uma cor da paleta ("." = transparente).

PALETA = {
    "k": (59, 32, 39),  # contorno
    "W": (243, 234, 211),  # creme
    "S": (203, 189, 152),  # creme sombra
    "T": (160, 112, 58),  # barbante
    "b": (217, 164, 65),  # trigo
    "R": (214, 48, 64),  # vermelho maçã
    "r": (255, 140, 140),  # brilho
    "d": (150, 28, 44),  # vermelho sombra
    "g": (104, 180, 72),  # folha
    "G": (60, 130, 50),  # folha escura
    "n": (120, 70, 40),  # cabinho
    "C": (190, 110, 60),  # canela clara
    "c": (120, 62, 32),  # canela escura
    "P": (230, 90, 140),  # fita rosa
    "p": (255, 170, 205),  # fita brilho
    "O": (245, 170, 40),  # mel
    "o": (255, 214, 110),  # mel brilho
    "D": (196, 116, 20),  # mel sombra
    "M": (168, 104, 56),  # madeira
    "m": (206, 142, 84),  # madeira clara
    "N": (110, 62, 34),  # madeira escura
    "Y": (255, 205, 80),  # dourado
    "y": (255, 240, 170),  # dourado brilho
    "Z": (190, 132, 30),  # dourado sombra
    "L": (255, 236, 150),  # luz de dentro do baú
    "A": (200, 208, 224),  # metal
    "a": (130, 138, 160),  # metal sombra
    "B": (250, 250, 255),  # branco
    "V": (120, 200, 240),  # azul relógio
    "X": (235, 70, 90),  # falha
}

ICONES = {
    "farinha": [
        "................",
        "......kkkk......",
        ".....kTTTTk.....",
        "......kTTk......",
        ".....kkkkkk.....",
        "....kWWWWWWk....",
        "...kWWWWWWWWk...",
        "..kWWWWWWWWWSk..",
        "..kWWWbbbbWWSk..",
        "..kWWbWbbWbWSk..",
        "..kWWWbbbbWWSk..",
        "..kWWWWbbWWWSk..",
        "..kWWWWWWWWSSk..",
        "...kSSSSSSSSk...",
        "....kkkkkkkk....",
        "................",
    ],
    "maca": [
        "................",
        ".......kk.......",
        "......knk.kk....",
        "......knkkggk...",
        "......knkgGgk...",
        "....kkknkkkk....",
        "...kRRRnRRRRk...",
        "..kRrrRRRRRRRk..",
        "..kRrRRRRRRRRk..",
        "..kRRRRRRRRRdk..",
        "..kRRRRRRRRRdk..",
        "..kRRRRRRRRddk..",
        "...kRRRRRRddk...",
        "....kRRkkRdk....",
        ".....kk..kk.....",
        "................",
    ],
    "canela": [
        "................",
        "...kkkkkkkkkk...",
        "..kCckCckCckCk..",
        "..kCckCckCckCk..",
        "..kCckCckCckCk..",
        "..kCckCckCckCk..",
        ".kPPPPPPPPPPPPk.",
        ".kPppPPPPPPppPk.",
        ".kPPPPPPPPPPPPk.",
        "..kCckCckCckCk..",
        "..kCckCckCckCk..",
        "..kCckCckCckCk..",
        "..kCckCckCckCk..",
        "..kcckcckcckck..",
        "...kkkkkkkkkk...",
        "................",
    ],
    "mel": [
        "................",
        ".....kkkkkk.....",
        "....kMmmmmMk....",
        "....kkkkkkkk....",
        "...kYyYYYYYZk...",
        "....kkOkkOkk....",
        "...kOOOOOOOOk...",
        "..kOoOOOOOOODk..",
        "..kOoOkkkkOODk..",
        "..kOOkWWWWkODk..",
        "..kOOkWSSWkODk..",
        "..kOOOkkkkOODk..",
        "..kOOOOOOOODDk..",
        "...kDDDDDDDDk...",
        "....kkkkkkkk....",
        "................",
    ],
    "bau-fechado": [
        "....................",
        "..kkkkkkkkkkkkkkkk..",
        ".kmmmmmmmmmmmmmmmmk.",
        ".kMmMMMMMMMMMMMMmMk.",
        ".kYYYYYYYYYYYYYYYYk.",
        ".kMMMMMMMMMMMMMMMMk.",
        ".kkkkkkkkYYkkkkkkkk.",
        ".kMmMMMMkYyYkMMMmMk.",
        ".kMMMMMMkYkYkMMMMMk.",
        ".kMMMMMMkYkYkMMMMMk.",
        ".kMMMMMMMkYkMMMMMMk.",
        ".kYYYYYYYYYYYYYYYYk.",
        ".kMMMMMMMMMMMMMMMMk.",
        ".kMmMMMMMMMMMMMMmMk.",
        ".kNNNNNNNNNNNNNNNNk.",
        "..kkkkkkkkkkkkkkkk..",
    ],
    "bau-aberto": [
        "..kkkkkkkkkkkkkkkk..",
        ".kmmmmmmmmmmmmmmmmk.",
        ".kYYYYYYYYYYYYYYYYk.",
        ".kNNNNNNNNNNNNNNNNk.",
        "..kkkkkkkkkkkkkkkk..",
        ".kLLLLLLLLLLLLLLLLk.",
        ".kLLyyLLLLLLLLyyLLk.",
        ".kkkkkkkkYYkkkkkkkk.",
        ".kMmMMMMkYyYkMMMmMk.",
        ".kMMMMMMkYkYkMMMMMk.",
        ".kMMMMMMMkYkMMMMMMk.",
        ".kYYYYYYYYYYYYYYYYk.",
        ".kMMMMMMMMMMMMMMMMk.",
        ".kMmMMMMMMMMMMMMmMk.",
        ".kNNNNNNNNNNNNNNNNk.",
        "..kkkkkkkkkkkkkkkk..",
    ],
    "cadeado": [
        "....kkkkkk....",
        "...kAAAAAAk...",
        "..kAakkkkaAk..",
        "..kAk....kAk..",
        "..kAk....kAk..",
        ".kkkkkkkkkkkk.",
        ".kYyYYYYYYYZk.",
        ".kYYYYkkYYYZk.",
        ".kYYYkkkkYYZk.",
        ".kYYYYkkYYYZk.",
        ".kYYYYkkYYYZk.",
        ".kYYYYYYYYZZk.",
        ".kZZZZZZZZZZk.",
        "..kkkkkkkkkk..",
    ],
    "cadeado-aberto": [
        "..........kkkk",
        ".........kAAAk",
        "........kAakAk",
        "........kAk.kk",
        "........kAk...",
        ".kkkkkkkkkkkk.",
        ".kYyYYYYYYYZk.",
        ".kYYYYkkYYYZk.",
        ".kYYYkkkkYYZk.",
        ".kYYYYkkYYYZk.",
        ".kYYYYkkYYYZk.",
        ".kYYYYYYYYZZk.",
        ".kZZZZZZZZZZk.",
        "..kkkkkkkkkk..",
    ],
    "relogio": [
        "....kkkkkk....",
        "...kVVVVVVk...",
        "..kVBBBBBBVk..",
        ".kVBBBBkBBBVk.",
        ".kVBBBBkBBBVk.",
        ".kVBBBBkBBBVk.",
        ".kVBBBBkkkBVk.",
        ".kVBBBBBBBBVk.",
        ".kVBBBBBBBBVk.",
        "..kVBBBBBBVk..",
        "...kVVVVVVk...",
        "....kkkkkk....",
    ],
    "falha": [
        "............",
        ".kk......kk.",
        "kXXk....kXXk",
        "kXXXk..kXXXk",
        ".kXXXkkXXXk.",
        "..kXXXXXXk..",
        "..kXXXXXXk..",
        ".kXXXkkXXXk.",
        "kXXXk..kXXXk",
        "kXXk....kXXk",
        ".kk......kk.",
        "............",
    ],
}

ESCALA_ICONE = 8  # 16px de pixel art -> 128px; o CSS reduz sem borrar (image-rendering: pixelated)


def preparar_icones():
    pasta = DESTINO / "itens"
    pasta.mkdir(parents=True, exist_ok=True)
    for nome, grade in ICONES.items():
        largura = max(len(linha) for linha in grade)
        img = Image.new("RGBA", (largura, len(grade)), (0, 0, 0, 0))
        px = img.load()
        for y, linha in enumerate(grade):
            for x, ch in enumerate(linha):
                if ch != ".":
                    px[x, y] = PALETA[ch] + (255,)
        img = img.resize((largura * ESCALA_ICONE, len(grade) * ESCALA_ICONE), Image.NEAREST)
        img.save(pasta / (nome + ".png"), optimize=True)
        print("icone   ", nome + ".png", img.size)


if __name__ == "__main__":
    preparar_sprites()
    preparar_protagonista()
    preparar_cenarios()
    preparar_torta()
    preparar_icones()
