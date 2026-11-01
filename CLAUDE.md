# Quem Pegou a Torta? — guia para o Claude

Joguinho de investigação (My Little Pony) para a Feira de Ciências de Informática da escola.
HTML/CSS/JS puro, **sem framework e sem build step**. Publicado no GitHub Pages:
https://francisco12-cpu.github.io/quem-pegou-a-torta/ (repo `Francisco12-cpu/quem-pegou-a-torta`,
branch `main`, raiz). Publicar = commit + `git push`; o Pages atualiza sozinho em 1–2 min.

**Estado atual (atualize quando mudar):** a versão 3D está pronta na branch `mundo-3d` e tem
como modo padrão (`modo: "3d"` em `dados/config.js`). O pull request #1 (`mundo-3d` → `main`)
estava aberto, aguardando merge. Até ele ser aceito na `main`, o site publicado continua na
versão 2D antiga. Só juntar na `main` com autorização explícita do autor.

## Como o autor quer que eu trabalhe
- **Pedido grande → plano primeiro.** Explicar rápido como vou fazer e esperar confirmação.
  Avisar ANTES se alguma mudança afeta algo que já funciona.
- **Mudanças pontuais.** Não refazer sistemas que funcionam, não mudar o estilo sem pedido,
  não remover funcionalidades. Se precisar reescrever um arquivo inteiro, avisar.
- **Nunca usar emoji** em nada do jogo (textos, botões, créditos). Ícones = pixel art
  (gerados em `ferramentas/`) ou SVG/CSS.
- **Música e sons só por código** (Web Audio, `js/musica.js` + `dados/musicas.js`).
- Conteúdo e configuração ficam em `dados/`, nunca escritos dentro dos motores (`js/`).
- **Sempre olhar o visual:** depois de qualquer mudança, tirar print do jogo (em tela deitada e
  em pé) e ver a imagem. Teste só de lógica não pega visual errado.
- **Publicar só com autorização.** Não juntar na `main` nem mudar a fonte do GitHub Pages sem o
  autor dizer. Quando ele autorizar, usar pull request.
- **Commits sem a linha `Co-Authored-By`.** Mensagens curtas e descritivas, em português.
- O autor escreve rápido, com erros de digitação — interpretar pelo contexto.
- Responder em português.

## Estrutura
- `index.html` — todas as telas; scripts carregados em ordem (dados → motores → main).
- `dados/` — conteúdo: falas (`cena-*.js`), mapa 2D (`casas.js` = `TELAS`), baús, itens,
  personagens, textos finais, músicas, `config.js`, `creditos.json`, `prohibited-names.json`,
  `protagonistas.js` (personagens jogáveis: id, categoria, sprite, cor, traços),
  `mundo3d.js` (o mundo 3D inteiro: casas, vila, salas, decoração, qualidade),
  `final-3d.js` (falas do final na versão 3D).
- `js/` — motores do 2D: `engine-dialogo.js`, `engine-exploracao.js` (plataforma 2D horizontal,
  bordas trocam de tela), `engine-minigame.js` (fechadura do baú — mecânica original, só o
  visual pode mudar), `interface.js` (HUD, transições, ingredientes voando), `telas.js`
  (abertura, nome, menu, caso resolvido, final, créditos), `nome.js` (validação do nome),
  `cena-especial.js` (vídeo), `musica.js`, `escolha-personagem.js` (escolha do protagonista ->
  `PERSONAGENS.protagonista`), `main.js` (fluxo, escolhe 2D ou 3D), `responsivo.js` (celular em pé
  bloqueia o jogo), `pwa.js` (instalação e registro do service worker), `final-3d.js` (sequência
  do final 3D). `js/vendor/profanity-br.js` = filtro de palavrões PT-BR (MIT) — não editar à mão.
  `js/vendor/three.min.js` = Three.js 0.187 empacotado (licença em `three.LICENSE.txt`).
- `js/mundo3d/` — o mundo 3D (módulos ES, carregados só no modo 3D):
  - `index.js` — o motor: lugares (mundo aberto e salas), andar, colisão, portas, guia, final.
  - `cena.js` — renderer e câmera; `ehCelular()`; `foto()` para fundos.
  - `papel.js` — material de papel (`Folha`), `fundirPecas` (junta peças numa malha só por
    textura, pra ter poucas chamadas de desenho) e `Quadros` (quadrados de papel em pé).
  - `casas-papel.js` — casas principais (confeitaria, biblioteca, boutique, casa nas nuvens,
    chalé, celeiro) e as casinhas da vila (`criarCasinha`).
  - `moveis-papel.js` — o kit de móveis das salas (estantes, forno, vitrine, manequins, etc.).
  - `interiores.js` — as salas: paredes, piso e móveis gerados por código (`criarSalaDePapel`).
  - `construtor.js` — monta o mundo a partir de `mundo3d.js` (chão, caminhos, flores, árvores).
  - `decoracao.js` — caminhos, árvores (em setores, com dissolve perto da câmera), morros,
    nuvens e fonte.
  - `ponei-papel.js` — a pônei de papel: borda de adesivo, animação de andar, pulinho, dança.
  - `bau-papel.js` — o baú com a estrelinha girando.
  - `controles.js` — teclado e joystick de toque. `colisao.js` — caixas e círculos no chão.
  - `festa-efeitos.js` — balões, fachos de luz e globo da dança dos créditos.
- `css/` — `mundo3d.css` (canvas, balões, marcas, créditos com festa), `minigame.css` (baú, com
  ajuste especial para celular deitado).
- `assets/originais/` — imagens originais (nunca alterar). `assets/sprites|cenarios|itens`
  são gerados pelos scripts de `ferramentas/`. Para trocar um sprite, basta substituir o PNG com
  o mesmo nome. **Atenção:** rodar `preparar-assets.py` de novo sobrescreve os sprites
  limpos por `melhorar-pixelart.py`; depois de rodar, rodar o `melhorar-pixelart.py` de novo.
- `assets/icones/` — ícones do app (gerados por `ferramentas/gerar-icones.py` a partir de
  `assets/itens/torta.png`). `manifest.webmanifest` e `sw.js` (cache offline) completam o app.
- Protagonistas: `assets/sprites/protagonistas/<id>.png`, gerados de `assets/originais/ficha-protagonistas.png`
  e `lavanda-e-caramelo.png` (caixas/frestas em `PROTAGONISTAS` no script). Falas com gênero usam
  `{feminino|masculino}` (ex.: `{juntas|juntos}`), resolvido por `textoDoProtagonista`.
- Segredo: o Audir (autor) é um card "???" trancado; 5 toques na estrelinha ciano do fundo da
  escolha destravam (campo `secreto` em `protagonistas.js`; recarregar a página tranca de novo).
  Só o Audir tem `modoCriador: true`, e isso liga o "Modo criador" (botões de teste em qualquer lugar).
- `assets/especiais/` — vídeo da chuva de estrelas (`.mp4` + `.webm` de reserva).
- `ferramentas/` — scripts que geram arte: `preparar-assets.py` (sprites e cenários a partir das
  originais), `melhorar-pixelart.py` (limpa a pixel art dos sprites), `desenhar-itens.py` (itens
  da torta e exclamação, em 32×32), `gerar-icones.py` (ícones do app), `servidor.js` (servidor
  local para testar o jogo).

## Fluxo do jogo
Abertura (libera o áudio) → Escolha seu personagem (masculino/feminino → personagem; fundo =
vídeo da chuva de estrelas) → Escolha seu nome (botão "Trocar personagem" volta) → menu → Jogar.

**Modo 3D (padrão na branch `mundo-3d`):** a protagonista anda livre pelo mundo.
- Portas abrem **em ordem**: confeitaria da Pinkie → biblioteca da Twilight → boutique da Rarity →
  casa da Rainbow Dash → chalé da Fluttershy → celeiro da festa. Cada porta trancada mostra o
  motivo, e uma seta no chão aponta o próximo destino ("Próximo: ...").
- Cada casa tem uma sala de papel com móveis. Dentro dela estão a dona e o baú (a Pinkie não tem baú).
  Conversas e baú usam a própria sala como fundo (foto do lugar).
- A Pinkie acompanha a protagonista depois da confeitaria.
- No celeiro, o confronto acontece **a pé**: fale com todas, depois ande até quem você acha que
  pegou a torta e acuse ("Nenhuma delas" é a Pinkie). Depois aparece a Applejack entrando, com
  exclamação, revelação e "Caso resolvido".
- Com os 4 ingredientes: volta ao mundo, "Ah... eu consegui!", os ingredientes giram em roda,
  se juntam e a torta aparece. Depois, a conversa final com todas (fim feliz).
- Sem os ingredientes: a história termina na tela "Missão cumprida!" com a amizade.
- Créditos: a festa de fundo, com todas dançando, balões caindo, luzes e música animada.

**Modo 2D (`?modo=2d`):** o fluxo antigo, com as telas em plataforma e as cenas 06 a 08
(confronto, revelação e bônus) inteiras, sem andar.

**Celular em pé:** o jogo fica parado e a tela "Deite o celular" cobre tudo até virar.

## Configurações importantes (`dados/config.js`)
- `modo: "3d"` — modo padrão. `?modo=2d` ou `?modo=3d` no endereço sobrescrevem.
- `ferramentasDeTeste: "local"` — botões "Forçar vitória/falha" no baú só aparecem rodando no
  computador (file:// ou localhost), nunca no site publicado. Manter assim. Exceção pedida pelo
  autor: jogando com o personagem secreto Audir ("Modo criador") eles aparecem em qualquer lugar.
- `nomeMaxCaracteres` — limite do nome do jogador.
- `cenaEspecial` — arquivo e momento do vídeo (`usarEm`: "carregamento", "final",
  "antes-dos-creditos" ou null).
- `escolhaPersonagem.fundo` — vídeo de fundo da escolha de personagem.

**Ajustes do 3D (`dados/mundo3d.js`):** cada casa tem `x`, `z`, `giro` (use de -90 a 90, a câmera
não gira). As salas têm `moveis`, `pontos` e `parede`/`piso`. A vila é a lista `vila`. Flores e
árvores ficam em setores; `qualidade` controla pixels por ponto, distância de desenho e a baixa
automática de qualidade em celular lento. Tamanho da chegada da Applejack e do fim com a torta em
`chegadaApplejack` e `fimNoMundo`.

## Como testar (não há navegador visível nesta máquina)
- Usar **Edge headless + CDP** (Edge em `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`,
  `--headless=new --remote-debugging-port=...`; Node 24 tem `WebSocket` global). Para o 3D, usar
  também `--use-angle=swiftshader --enable-unsafe-swiftshader` (sem isso o WebGL não sobe).
  Chamar funções do jogo com `Runtime.evaluate` e tirar prints com `Page.captureScreenshot`.
- Para testar o 3D sem passar pela história, usar `import('/js/mundo3d/index.js')` e chamar
  `teleportar(x, z)`, `lugarAtual()`, `posicaoJogador()`, `infoRender()` (chamadas de desenho).
- Tamanho da tela: usar `Emulation.setDeviceMetricsOverride` (o `--window-size` não funciona).
  Testar 1280×720, 1920×1080, 844×390 (celular deitado) e 390×844 (celular em pé).
- Servidor de teste: `node ferramentas/servidor.js` (porta 8080). O `python -m http.server` é
  lentíssimo nesta máquina. `fetch` dos JSON e os módulos ES não funcionam em `file://`.
- **Um Edge por vez** — vários em paralelo congelam a renderização e dão falso erro.
  Para matar Edges de teste, filtrar pelo `--user-data-dir` que contém `edge-cdp-`.
- Esperar `document.readyState === "complete"` antes de clicar (carregamento pode ser lento).
- A tela de abertura precisa de uma tecla, e a de nome precisa de um nome válido, antes do menu.
- Validar sintaxe com `node --check` em `js/*.js` e `dados/*.js`, e com
  `node --input-type=module --check < arquivo` nos módulos de `js/mundo3d/`.
- Com a memória baixa do computador, o servidor de teste pode ser encerrado pelo sistema. Se o
  jogo parar de carregar, religar o servidor.

## Armadilhas já encontradas
- Mesmo clique/tecla que fecha uma tela pode disparar a próxima: os motores ignoram entrada nos
  primeiros ~250 ms (`ESPERA_INICIAL_MS`). Manter isso ao criar telas novas.
- O `body` tem `user-select: none`; campos de texto precisam de `user-select: text`.
- Input no celular: fonte ≥ 16px (senão o iPhone dá zoom).
- Nomes de arquivo sem espaço nem vírgula (quebram o link no GitHub Pages).
- Sprites originais olham para a esquerda; o lado esquerdo do palco é espelhado via CSS.
- Todos os cenários são 16:9 — a exploração posiciona o chão em % da imagem (`chao` em `casas.js`).
- **Service worker (`sw.js`):** guarda o jogo para funcionar offline. Ele sempre tenta a internet
  primeiro, mas, se o servidor local estiver fora, pode abrir a cópia guardada, antiga. Para ver
  uma versão nova no navegador, usar Ctrl+F5. Ao mudar o jeito de guardar, trocar o nome do
  cache (`CACHE`).
- **Malhas unidas (`fundirPecas`):** depois de unir, as peças de um grupo não podem mais ser
  mexidas uma a uma. Quem precisa mexer (como a estrelinha do baú) fica de fora da união.
- **Shader das árvores:** o dissolve perto da câmera usa `onBeforeCompile`. Trocar o texto de
  `#include` por uma string com quebra de linha dentro quebra o shader; usar template strings.
- **Tela pequena no minigame:** em tela deitada baixa, o cartão do baú precisa caber sem rolar.
  Ajustes em `@media (orientation: landscape) and (max-height: 500px)` em `minigame.css`.
- **Final 3D:** falas de discussão viram conversas soltas, uma por pônei. Não dá para repetir a
  cena 06 inteira no 3D.
- **Textos com aspas e quebras:** ao gerar código com `node` ou `python` pela linha de comando,
  escrever o script em arquivo (Write) em vez de colar tudo num heredoc longo.
- **Nomes no pixel art:** o `grep` deste ambiente aceita `--` antes do padrão, o que transforma as
  opções em arquivos. Usar a ferramenta de busca ou colocar as opções antes do padrão.
- **Dados antigos em comentários:** vários arquivos citam `ARQUITETURA.md`, `ROTEIRO.md` e
  `mine game.html`, que não estão no repositório. São só referências antigas.
