# Quem Pegou a Torta? — guia para o Claude

Joguinho de investigação (My Little Pony) para a Feira de Ciências de Informática da escola.
HTML/CSS/JS puro, **sem framework e sem build step**. Publicado no GitHub Pages:
https://francisco12-cpu.github.io/quem-pegou-a-torta/ (repo `Francisco12-cpu/quem-pegou-a-torta`,
branch `main`, raiz). Publicar = commit + `git push`; o Pages atualiza sozinho em 1–2 min.

## Como o autor quer que eu trabalhe
- **Pedido grande → plano primeiro.** Explicar rápido como vou fazer e esperar confirmação.
  Avisar ANTES se alguma mudança afeta algo que já funciona.
- **Mudanças pontuais.** Não refazer sistemas que funcionam, não mudar o estilo sem pedido,
  não remover funcionalidades. Se precisar reescrever um arquivo inteiro, avisar.
- **Nunca usar emoji** em nada do jogo (textos, botões, créditos). Ícones = pixel art
  (gerados em `ferramentas/preparar-assets.py`) ou SVG/CSS.
- **Música e sons só por código** (Web Audio, `js/musica.js` + `dados/musicas.js`).
- Conteúdo e configuração ficam em `dados/`, nunca escritos dentro dos motores (`js/`).
- O autor escreve rápido, com erros de digitação — interpretar pelo contexto.
- Responder em português.

## Estrutura
- `index.html` — todas as telas; scripts carregados em ordem (dados → motores → main).
- `dados/` — conteúdo: falas (`cena-*.js`), mapa (`casas.js` = `TELAS`), baús, itens,
  personagens, textos finais, músicas, `config.js`, `creditos.json`, `prohibited-names.json`.
- `js/` — motores: `engine-dialogo.js`, `engine-exploracao.js` (plataforma 2D horizontal,
  bordas trocam de tela), `engine-minigame.js` (fechadura do baú — mecânica original, só o
  visual pode mudar), `interface.js` (HUD, transições), `telas.js` (abertura, nome, menu,
  caso resolvido, final, créditos), `nome.js` (validação do nome), `cena-especial.js` (vídeo),
  `musica.js`, `main.js` (fluxo). `js/vendor/profanity-br.js` = filtro de palavrões PT-BR
  (MIT) já empacotado para navegador — não editar à mão.
- `assets/originais/` — imagens originais (nunca alterar). `assets/sprites|cenarios|itens`
  são gerados por `python ferramentas/preparar-assets.py` (Pillow + NumPy). Para trocar um
  sprite, basta substituir o PNG com o mesmo nome. O script **não** sobrescreve
  `assets/sprites/protagonista.png` (só com `--refazer-protagonista`).
- `assets/especiais/` — vídeo da chuva de estrelas (`.mp4` + `.webm` de reserva).

## Fluxo do jogo
Abertura (libera o áudio) → Escolha seu nome → vídeo de carregamento → menu → confeitaria →
ruas/casas (Twilight, Rarity, Rainbow Dash, Fluttershy) → confronto → revelação →
"Caso resolvido" → cena bônus (se pegou os 4 ingredientes) → final → créditos.

## Configurações importantes (`dados/config.js`)
- `ferramentasDeTeste: "local"` — botões "Forçar vitória/falha" no baú só aparecem rodando no
  computador (file:// ou localhost), nunca no site publicado. Manter assim.
- `nomeMaxCaracteres` — limite do nome do jogador.
- `cenaEspecial` — arquivo e momento do vídeo (`usarEm`: "carregamento", "final",
  "antes-dos-creditos" ou null).

## Como testar (não há navegador visível nesta máquina)
- Usar **Edge headless + CDP** (Edge em `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`,
  `--headless=new --remote-debugging-port=...`; Node 24 tem `WebSocket` global). Chamar funções
  do jogo com `Runtime.evaluate` e tirar prints com `Page.captureScreenshot`.
- Tamanho da tela: usar `Emulation.setDeviceMetricsOverride` (o `--window-size` não funciona).
  Testar 1280×720, 1920×1080, 844×390 (celular deitado) e 390×844 (celular em pé).
- Servidor de teste: um servidor estático em **Node** (o `python -m http.server` é lentíssimo
  nesta máquina, ~8 s por arquivo). `fetch` dos JSON não funciona em `file://`.
- **Um Edge por vez** — vários em paralelo congelam a renderização e dão falso erro.
- Esperar `document.readyState === "complete"` antes de clicar (carregamento pode ser lento).
- A tela de abertura precisa de uma tecla, e a de nome precisa de um nome válido, antes do menu.
- Validar sintaxe com `node --check` em todos os `js/` e `dados/*.js`.

## Armadilhas já encontradas
- Mesmo clique/tecla que fecha uma tela pode disparar a próxima: os motores ignoram entrada nos
  primeiros ~250 ms (`ESPERA_INICIAL_MS`). Manter isso ao criar telas novas.
- O `body` tem `user-select: none`; campos de texto precisam de `user-select: text`.
- Input no celular: fonte ≥ 16px (senão o iPhone dá zoom).
- Nomes de arquivo sem espaço nem vírgula (quebram o link no GitHub Pages).
- Sprites originais olham para a esquerda; o lado esquerdo do palco é espelhado via CSS.
- Todos os cenários são 16:9 — a exploração posiciona o chão em % da imagem (`chao` em `casas.js`).
