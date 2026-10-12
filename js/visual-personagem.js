// visual-personagem.js — desenha uma personagem: sprite (<img>) quando `dados/personagens.js`
// tem um, senão o placeholder CSS (bloco de cor). Único lugar que decide isso — diálogo e
// exploração só chamam daqui, então trocar placeholder por sprite nunca exige mexer no motor.

function htmlVisualPersonagem(p) {
  if (p.sprite) {
    return '<img class="sprite-personagem" src="' + p.sprite + '" alt="' + p.nome + '" draggable="false" />';
  }
  return '<div class="bloco-cor" style="background:' + p.cor + '"></div>';
}

// Textos que dependem do protagonista escolhido: {nome} vira o nome que o jogador digitou, e
// {feminino|masculino} escolhe a palavra pelo personagem (ex.: "fizemos {juntas|juntos}").
function textoDoProtagonista(texto) {
  var p = PERSONAGENS.protagonista;
  return String(texto)
    .replace(/\{nome\}/g, p.nome)
    .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, function (_, feminino, masculino) {
      return p.genero === "masculino" ? masculino : feminino;
    });
}
