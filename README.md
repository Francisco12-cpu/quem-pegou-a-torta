# Quem Pegou a Torta?

Um joguinho de investigação no universo de My Little Pony, feito para a Feira de Ciências de
Informática da escola. A torta da festa surpresa da Applejack sumiu: ande por Ponyville,
converse com as pôneis, junte as pistas e descubra quem pegou.

**Jogar:** https://francisco12-cpu.github.io/quem-pegou-a-torta/

## Como jogar
- **Computador:** `A`/`D` ou setas para andar, `E`/`Enter`/`Espaço` para conversar e avançar.
- **Celular:** botões na tela ou toque no cenário para andar.
- Baús escondidos guardam ingredientes: junte os quatro para o final especial.

## Como funciona
HTML, CSS e JavaScript puro, sem bibliotecas nem instalação. O conteúdo (falas, mapa, baús,
créditos) fica em `dados/` e os "motores" do jogo em `js/`: diálogo, exploração em plataforma
2D, minigame da fechadura e música gerada por código (Web Audio). Os créditos são lidos de
`dados/creditos.json`.

Para rodar no computador, abra um servidor na pasta (ex.: `python -m http.server`) e acesse
`http://localhost:8000`.

---
Personagens de My Little Pony pertencem à Hasbro. Projeto escolar feito por fãs, sem fins
lucrativos.
