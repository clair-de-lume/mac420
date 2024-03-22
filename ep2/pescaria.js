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
var gInterface = {
  start: "Jogar",
}
var ctx;
const AREIA_ALT = 0.30;
const canvas = document.getElementById("meucanvas");
const JANELA_W = window.innerWidth;
const JANELA_H = window.innerHeight;
const N_PEIXES = 1;

var MAR_W;
var MAR_H;

var peixes = [];

class Poligono {
  raio;
  lados;
  cor;
  x;
  y;
  vertices;

  constructor() {
    this.raio = sorteie_inteiro(20, 60);
    this.lados = 4;
    this.cor = "crimson";

    this.x = sorteie_inteiro(0, MAR_W);
    this.y = sorteie_inteiro(0, MAR_H);

    this.vertices = [];
  }

  /**
   * dados um inteiro n e um raio r, retorna
   * uma lista com n pontos equidistantes de um circulo de raio r
   * com origem C = (x0, y0)
   */
  nVertices() {
    this.vertices = [];
    for (let i = 0; i < this.lados; i++) {
      let angulo = (2 * Math.PI * i) / this.lados;
      this.vertices.push([this.x + this.raio * Math.cos(angulo), this.y + this.raio * Math.sin(angulo)]);
      //console.log("vertices: ", this.vertices);
    }
  }

  desenhePoligono() {
    let poli = new Path2D();
    ctx.clearRect(0, 0, MAR_W, MAR_H);
    ctx.beginPath();
    poli.moveTo( this.vertices[0][0], this.vertices[0][1] );
    for (let i = 1; i < this.vertices.length; i++) {
        poli.lineTo( this.vertices[i][0], this.vertices[i][1] );
    }
    poli.closePath(); // cria um contorno fechado.
  
    ctx.fillStyle = this.cor;
    ctx.fill( poli ); 
  }
}

class Peixe extends Poligono {
  velX;
  velY;

  constructor() {
    super();

    this.cor = this.sorteie_cor(0, 3);
    this.lados = this.sorteie_lados(0, 3);

    // garante que o peixe nao ultrapasse as bordas
    this.x = sorteie_inteiro(0+this.raio, MAR_W-this.raio);
    this.y = sorteie_inteiro(0+this.raio, MAR_H-this.raio);

    this.velX = sorteie_inteiro(1, 5);
    this.velY = sorteie_inteiro(1, 5);
  }

  sorteie_cor(min, max) {
    let cores = ['crimson', 'darkmagenta', 'coral'];
    let indice = sorteie_inteiro(min, max);
    return cores[indice];
  }

  sorteie_lados(min, max) {
    let lados = [4, 8, 16];
    let indice = sorteie_inteiro(min, max);
    return lados[indice];
  }

  desenhaPeixe() {
    this.nVertices();
    this.desenhePoligono();
  }
}

/* ==================================================================
    função main
*/
function main() {
  construaInterface();

  criaPeixes();
  
  console.log("xo, yo", peixes[0].x, peixes[0].y);
  console.log("velX velY", peixes[0].velX, peixes[0].velY)
  console.log("vertices", peixes[0].vertices);
  
  redesenhe();
  
  //console.log("xo, yo", peixes[0].x, peixes[0].y);
  //console.log("vertices", peixes[0].vertices);
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
  //console.log("desenhou areia");
  let alturaAreia = AREIA_ALT * window.innerHeight
  ctx.fillStyle =  'yellow';
  ctx.fillRect(0, window.innerHeight - alturaAreia, window.innerWidth, alturaAreia);

  MAR_H = window.innerHeight - alturaAreia;
  MAR_W = JANELA_W;
  //console.log("altura areia: ", alturaAreia)
  //console.log("altura mar: ", MAR_H);
}

function desenhaArpao() {
  console.log("desenhou arpão");
  
}

/**
 * cria um array com n peixes e os desenha pela primeira vez
 */
function criaPeixes() {
  for(let i = 0; i < N_PEIXES; i++) {
    let peixe = new Peixe();
    peixes.push(peixe);
    //peixes[i].desenhaPeixe();
  }
}

/**
 * sorteia um número inteiro entre min e max
 */
function sorteie_inteiro(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * dado um peixe com raio r, centro C = (x, y) e velocidades
 * velX e velY, calcule a nova posicao do peixe a cada frame
 */
function redesenhe() {
  passo();
  // requisita o próximo redesenho 
  requestAnimationFrame(redesenhe);
}

function passo() {
  ctx.clearRect(0, 0, MAR_W, MAR_H);

  for(let i = 0; i < N_PEIXES; i++) {
    let peixe = peixes[i];
    // atualiza a cena, ou seja, a posição do objeto
    peixe.x = peixe.x + peixe.velX;
    peixe.y = peixe.y + peixe.velY;
  
    
    if (peixe.x < 0) {
      peixe.velX *= -1;
      peixe.x = -peixe.x;
    }
    if (peixe.x >= MAR_W) {
      peixe.velX *= -1;
      peixe.x = MAR_W - (peixe.x - MAR_W);
    }
    if (peixe.y < 0) {
      peixe.velY *= -1;
      peixe.y = -peixe.y;
    }
    if (peixe.y >= MAR_H) {
      peixe.velY *= -1;
      peixe.y = MAR_H - (peixe.y - MAR_H);
    }
  
    // ciclo da animação: limpa a tela e desenhe
    //ctx.fillStyle = 'darkcyan';
    //ctx.clearRect(0, 0, MAR_W, MAR_H);
    desenhaAreia();
  
    // desenha o peixe na nova posicao
    peixe.nVertices();
    peixe.desenhePoligono();
  }
}