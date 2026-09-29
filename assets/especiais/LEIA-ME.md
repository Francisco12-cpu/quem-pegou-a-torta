# Cena especial (chuva de estrelas)

O jogo usa `chuva-de-estrelas.mp4` (a chuva de estrelas com as pôneis). Para trocar, coloque
outro arquivo aqui e mude o nome em `dados/config.js`, em `cenaEspecial.arquivo`.

Formatos: `.gif`, `.webp`, `.mp4` ou `.webm` (vídeo fica mais leve no celular).
O `chuva-de-estrelas.webm` é uma cópia de reserva: se o navegador não tocar o `.mp4`, o jogo
usa o `.webm` com o mesmo nome automaticamente.

Para escolher onde ela aparece, mude `cenaEspecial.usarEm` em `dados/config.js`:
`"carregamento"`, `"final"` ou `"antes-dos-creditos"`. Enquanto for `null`, ela não aparece.
