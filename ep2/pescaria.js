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
const canvas = document.getElementById("meucanvas");

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
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  ctx = canvas.getContext('2d');
  console.log("construiu o canva!")
  if (!ctx) {
    alert("Não consegui abrir o contexto 2d!");
  }
  desenhaAreia();

}

/**
 * resize o tamanho do canvas e da areia ao mudar
 * o tamanho da tela
*/
function callbackResize() {
  console.log("resizou para resolucao", window.innerWidth, "x", window.innerHeight);
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  desenhaAreia();
}

/**
 * desenha a areia de acordo com a proporção
 * da altura do canvas
*/
function desenhaAreia() {
  console.log("desenhou areia");
  let alturaAreia = AREIA_ALT * window.innerHeight
  ctx.fillStyle =  'yellow';
  ctx.fillRect(0, window.innerHeight - alturaAreia, window.innerWidth, alturaAreia);

}

function desenhaArpao() {
  console.log("desenhou arpão");
  
}
