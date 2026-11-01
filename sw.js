// sw.js — deixa o jogo abrir sem internet depois da primeira visita.
// Sempre tenta a internet primeiro (assim, publicar uma versão nova vale na hora); só usa a
// cópia guardada se estiver sem conexão. Ao mudar o jeito de guardar, troque CACHE.

var CACHE = "torta-v1";

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches
      .keys()
      .then(function (nomes) {
        return Promise.all(
          nomes
            .filter(function (nome) {
              return nome !== CACHE;
            })
            .map(function (nome) {
              return caches.delete(nome);
            })
        );
      })
      .then(function () {
        return self.clients.claim(); // os arquivos da primeira visita também são guardados
      })
  );
});

function deveGuardar(pedido) {
  var url = new URL(pedido.url);
  // vídeo fica de fora: é pesado, e sem ele a tela usa o céu desenhado em CSS
  return pedido.method === "GET" && url.origin === self.location.origin && !/\.(mp4|webm)$/.test(url.pathname);
}

self.addEventListener("fetch", function (evento) {
  var pedido = evento.request;
  if (!deveGuardar(pedido)) return;

  evento.respondWith(
    fetch(pedido)
      .then(function (resposta) {
        if (resposta.ok) {
          var copia = resposta.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(pedido, copia);
          });
        }
        return resposta;
      })
      .catch(function () {
        return caches.match(pedido, { ignoreSearch: true }).then(function (guardada) {
          if (guardada) return guardada;
          if (pedido.mode === "navigate") return caches.match("index.html", { ignoreSearch: true });
          return Response.error();
        });
      })
  );
});
