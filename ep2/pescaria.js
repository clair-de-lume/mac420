/*
    pescaria de MAC0420/MAC5744 - Pescaria

    Nome: Luísa Menezes da Costa
    NUSP: 12676491

    Referências:
    - MDN Web Docs
    - algumas funções foram retiradas diretamente das notas de aula
 */

window.onload = main;

/* ==================================================================
    constantes e variáveis globais
*/
var ctx;
const AREIA_ALT = 0.30;
const canvas = document.getElementById("meucanvas");
const JANELA_W = window.innerWidth;
const JANELA_H = window.innerHeight;

var MAR_W;
var MAR_H;

/* ==================================================================
    função main
*/
function main() {
  construaInterface();

  let vertices = nVertices(4, 50, 400, 400);
  //pontos = [[500, 400], [400, 500], [300, 400], [400, 300]]
  desenhePoligono(vertices, 'crimson');
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
  MAR_H = JANELA_H - AREIA_ALT;
}

function desenhaArpao() {
  console.log("desenhou arpão");
  
}

/**
 * dados um inteiro n e um raio r, retorna
 * uma lista com n pontos equidistantes de um circulo de raio r
 * com origem C = (x0, y0)
 */
function nVertices(n, r, x0, y0) {
  let lista = [];
  for (let i = 0; i < n; i++) {
    let angulo = (2 * Math.PI * i) / n;
    lista.push([x0 + r * Math.cos(angulo), y0 + r * Math.sin(angulo)]);
  }
  return lista;
}

function criaPeixe() {
  let x = sorteie_inteiro(0, MAR_W);
  let y = sorteie_inteiro(0, MAR_H);

  let pts = nVertices(4, 30, x, y);
  desenhePoligono()
}

function desenhePoligono(pts, cor) {
  let tam = pts.length;

  let poli = new Path2D();
  poli.moveTo( pts[0][0], pts[0][1] );
  for (let i = 1; i < pts.length; i++) {
      poli.lineTo( pts[i][0], pts[i][1] );
  }
  poli.closePath(); // cria um contorno fechado.

  ctx.fillStyle=cor;
  ctx.fill( poli ); 
}

/**
 * sorteia um número inteiro entre min e max
 */
function sorteie_inteiro(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}