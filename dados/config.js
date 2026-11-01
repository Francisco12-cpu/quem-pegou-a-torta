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
  // Jogando com o personagem secreto (Audir, `modoCriador` em dados/protagonistas.js) ela
  // aparece em qualquer lugar, com o nome "Modo criador" — é o prêmio de quem descobre.
  ferramentasDeTeste: "local",

  // ---------------------------------------------------------------------------------------
  // MODO DO JOGO
  //   "2d" -> a exploração em telas de sempre (pode ser usada com ?modo=2d)
  //   "3d" -> o mundo 3D (em construção, configurado em dados/mundo3d.js)
  // Pra testar sem mudar aqui, abra o jogo com ?modo=3d no fim do endereço.
  modo: "3d",

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
    usarEm: null, // a chuva de estrelas agora é o fundo da escolha de personagem (abaixo)
    titulo: "",
    texto: "",
    duracao: 4,
  },

  // ---------------------------------------------------------------------------------------
  // ESCOLHA DE PERSONAGEM (tela depois da abertura — personagens em dados/protagonistas.js)
  // `fundo`: animação de fundo da tela. Aceita .mp4/.webm (vídeo em loop, sem som; se o .mp4
  // não tocar, tenta o .webm com o mesmo nome) ou .gif/.webp animado. Se o arquivo não
  // existir, a tela usa um céu estrelado desenhado em CSS.
  escolhaPersonagem: {
    fundo: "assets/especiais/chuva-de-estrelas.mp4",
  },
};

// Qual modo está valendo: o da URL (?modo=3d), senão o de CONFIG.modo
function modoDeJogo() {
  var daUrl = new URLSearchParams(window.location.search).get("modo");
  return daUrl === "2d" || daUrl === "3d" ? daUrl : CONFIG.modo;
}

// A ferramenta de teste está ligada neste lugar? (ver `ferramentasDeTeste` acima)
function ferramentasDeTesteAtivas() {
  if (CONFIG.ferramentasDeTeste === true || modoCriadorAtivo()) return true;
  if (CONFIG.ferramentasDeTeste !== "local") return false;
  var host = window.location.hostname;
  return window.location.protocol === "file:" || host === "localhost" || host === "127.0.0.1" || host === "";
}

// Está jogando com o personagem secreto que libera o "Modo criador"?
function modoCriadorAtivo() {
  return typeof PERSONAGENS !== "undefined" && !!PERSONAGENS.protagonista.modoCriador;
}
