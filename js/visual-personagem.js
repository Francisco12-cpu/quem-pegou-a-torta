// visual-personagem.js — desenha uma personagem: sprite (<img>) quando `dados/personagens.js`
// tem um, senão o placeholder CSS (bloco de cor). Único lugar que decide isso — diálogo e
// exploração só chamam daqui, então trocar placeholder por sprite nunca exige mexer no motor.

function htmlVisualPersonagem(p) {
  if (p.sprite) {
    return '<img class="sprite-personagem" src="' + p.sprite + '" alt="' + p.nome + '" draggable="false" />';
  }
  return '<div class="bloco-cor" style="background:' + p.cor + '"></div>';
}
