// servidor.js — servidor estático simples pra rodar o jogo no computador.
// Uso: node ferramentas/servidor.js [porta]   (padrão: 8080)
// Versão 3D: http://localhost:8080/?modo=3d

var http = require("http");
var fs = require("fs");
var path = require("path");

var RAIZ = path.resolve(__dirname, "..");
var PORTA = Number(process.argv[2]) || 8080;
var TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

http
  .createServer(function (req, res) {
    var caminho = decodeURIComponent(req.url.split("?")[0]);
    if (caminho.endsWith("/")) caminho += "index.html";
    var arquivo = path.normalize(path.join(RAIZ, caminho));
    if (arquivo !== RAIZ && !arquivo.startsWith(RAIZ + path.sep)) {
      res.writeHead(403);
      return res.end();
    }
    fs.readFile(arquivo, function (erro, dados) {
      if (erro) {
        res.writeHead(404);
        return res.end("não encontrado");
      }
      res.writeHead(200, {
        "Content-Type": TIPOS[path.extname(arquivo).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(dados);
    });
  })
  .listen(PORTA, "127.0.0.1", function () {
    console.log("Jogo em http://localhost:" + PORTA + "/   |   3D: http://localhost:" + PORTA + "/?modo=3d");
  });
