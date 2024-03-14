/*
    pescaria de MAC0420/MAC5744 - Pescaria

    Nome: Luísa Menezes da Costa
    NUSP: 12676491
 */

window.onload = main;

/* ==================================================================
    constantes e variáveis globais
*/
var ctx;
const AREIA_ALT = 0.30;

/* ==================================================================
    função main
*/
function main() {
  construaInterface();
}

/**
 * Registra os elementos HTML responsáveis pela interação no objeto
 * interface e os associa às rotinas de callback.
 */
function construaInterface(){

  constroiCanvas();

  // registro das funções de callback;
  window.onresize = callbackResize;
}

/**
 * Inicializa o canvas na variável global ctx
 */
function constroiCanvas() {
  const canvas = document.getElementById("meucanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx = canvas.getContext('2d');
  console.log("construiu o canva!")
  if (!ctx) {
    alert("Não consegui abrir o contexto 2d!");
  }
}

function callbackResize() {
  console.log("resizou!");
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  ctx.fillRect(30, 30, ctx.canvas.innerWidth, ctx.canvas.innerHeight);
  ctx.fillStyle = 'yellow';
  ctx.fillRect(ctx.canvas.innerWidth - AREIA_ALT, ctx.canvas.innerHeight - AREIA_ALT, ctx.canvas.innerWidth, AREIA_ALT);
}