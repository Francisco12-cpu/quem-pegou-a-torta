// config.js — chaves de configuração do jogo (fácil de mudar sem mexer no código).

var CONFIG = {
  // ---------------------------------------------------------------------------------------
  // FERRAMENTA DE TESTE (só para desenvolvimento)
  // Mostra, dentro do baú, os botões "Forçar vitória" / "Forçar falha", pra testar os dois
  // finais sem jogar o minigame toda vez.
  //   "local" -> só aparece rodando no seu computador (abrindo o index.html direto ou por
  //              localhost). NUNCA aparece no GitHub Pages — os jogadores não veem.
  //   false   -> desligada em todo lugar (use na versão final, se quiser garantir).
  //   true    -> ligada em todo lugar (inclusive no site publicado — cuidado).
  ferramentasDeTeste: "local",

  // ---------------------------------------------------------------------------------------
  // NOME DO JOGADOR (tela "Escolha seu nome", depois da abertura)
  // Limite de letras do nome. Palavras bloqueadas e nomes de brincadeira ficam em
  // dados/prohibited-names.json.
  nomeMaxCaracteres: 14,

  // ---------------------------------------------------------------------------------------
  // CENA ESPECIAL (o GIF da chuva de estrelas)
  // Coloque o arquivo em assets/especiais/ com o nome abaixo. Formatos aceitos:
  //   .gif ou .webp (animados)  -> mostrados como imagem
  //   .mp4 ou .webm             -> mostrados como vídeo em loop, sem som (mais leve no celular)
  // `usarEm` escolhe onde ela aparece (se o arquivo não existir, o jogo simplesmente pula):
  //   null                  -> não aparece em lugar nenhum
  //   "carregamento"        -> logo depois da tela de abertura, antes do menu
  //   "final"               -> antes da tela "Missão cumprida!"
  //   "antes-dos-creditos"  -> antes dos créditos
  // `duracao`: segundos até fechar sozinha (0 = só fecha com um toque/tecla).
  cenaEspecial: {
    arquivo: "assets/especiais/chuva-de-estrelas.mp4",
    usarEm: "carregamento",
    titulo: "",
    texto: "",
    duracao: 4,
  },
};

// A ferramenta de teste está ligada neste lugar? (ver `ferramentasDeTeste` acima)
function ferramentasDeTesteAtivas() {
  if (CONFIG.ferramentasDeTeste === true) return true;
  if (CONFIG.ferramentasDeTeste !== "local") return false;
  var host = window.location.hostname;
  return window.location.protocol === "file:" || host === "localhost" || host === "127.0.0.1" || host === "";
}
