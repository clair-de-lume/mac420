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
  pausado: true,
}
var ctx;
const AREIA_ALT = 0.30;
const canvas = document.getElementById("meucanvas");
const JANELA_W = window.innerWidth;
const JANELA_H = window.innerHeight;

const ESQUERDA = 0;
const DIREITA = 1;

var MAR_W;
var MAR_H;
var N_PEIXES = 10;
var VELOCIDADE_JOGO = 10;

var peixes = [];
var arpao;
var BOLHA_ATIVA = 0;
var bolha;

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
    }
  }

  desenhePoligono() {
    let poli = new Path2D();
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

  movePeixe() {
    this.x = this.x + this.velX * (VELOCIDADE_JOGO/10);
    this.y = this.y + this.velY * (VELOCIDADE_JOGO/10);
    
    if (this.x < this.raio) {
      this.velX *= -1;
    }
    if (this.x >= MAR_W - this.raio) {
      this.velX *= -1;
    }
    if (this.y < this.raio) {
      this.velY *= -1;
    }
    if (this.y >= MAR_H - this.raio) {
      this.velY *= -1;
    }
  }
}

class Arpao {
  a;
  b;
  c;
  cor;

  constructor() {
    this.a = [JANELA_W/2, JANELA_H - (JANELA_H*AREIA_ALT) + 40];
    this.b = [JANELA_W/2 - 50, JANELA_H - 40];
    this.c = [JANELA_W/2 + 50, JANELA_H - 40];

    this.cor = "brown";
  }

  desenhaArpao() {
    let poli = new Path2D();
    ctx.beginPath();
    poli.moveTo(this.a[0], this.a[1]);
    poli.lineTo(this.b[0], this.b[1]);
    poli.lineTo(this.c[0], this.c[1]);
    poli.closePath(); 
  
    ctx.fillStyle = this.cor;
    ctx.fill(poli);
  }
  
  moveArpao(direcao) {
    if (direcao == ESQUERDA) {
      this.a[0] -= 10;
      this.b[0] -= 10;
      this.c[0] -= 10;
    }
    else {
      this.a[0] += 10;
      this.b[0] += 10;
      this.c[0] += 10;
    }
  }
}

class Bolha extends Poligono {
  velY = 5;

  constructor(x, y) {
    super();

    this.cor = "blue";
    this.lados = 64;
    this.raio = 10

    this.x = x,
    this.y = y;
  }

  moveBolha() {
    if (BOLHA_ATIVA) {
      this.y = this.y - this.velY * VELOCIDADE_JOGO/10;
    }
    if (bolha.y < 0) {
      BOLHA_ATIVA = 0;
    }
  }

  desenhaBolha() {
    this.nVertices();
    this.desenhePoligono();
  }

  checaColisao(peixe) {
    let d = distancia(peixe.x, peixe.y, bolha.x, bolha.y);
    if (d <= peixe.raio + bolha.raio / 2) {
      BOLHA_ATIVA = 0;
      return true;
    }
  }
}

/* ==================================================================
    função main
*/
function main() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  ctx = canvas.getContext('2d');
  if (!ctx) {
    alert("Não consegui abrir o contexto 2d!");
  }

  // redesenha elementos pela primeira vez
  
  gInterface.start = document.getElementById("btJogar");
  gInterface.passo = document.getElementById("btPasso");
  gInterface.velocidade = document.getElementById("rgVelocidade");
  gInterface.pVelocidade = document.getElementById("pVelocidade");
  
  // registro das funções de callback;
  window.onresize = callbackResize;
  window.onkeydown = callbackKeyDown;
  gInterface.start.onclick = callbackJogar;
  gInterface.passo.onclick = callbackPasso;
  gInterface.velocidade.onclick = callbackVelocidade;

  callbackResize();
  
  criaPeixes();
  criaArpao();

}

/**
 * resize o tamanho dos elementoss do jogo ao mudar
 * o tamanho da tela
*/
function callbackResize() {
  // resize mar
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  // resize areia
  desenhaAreia();

  // resize peixes
  //for(let i = 0; i < N_PEIXES; i++) {
    //peixes[i].desenhaPeixe();
  //}

  // resize arpao
  //arpao.desenhaArpao();

  // resize bolha
  //
}

function callbackKeyDown(e) {
  if (!gInterface.pausado) {
    let tecla = e.keyCode;
    // tecla A: arpao move para esquerda
    if (tecla == 65) {
      desenhaAreia();
      arpao.moveArpao(ESQUERDA);
      arpao.desenhaArpao();
    }
  
    // tecla D: arpao move para direita
    else if (tecla == 68) {
      desenhaAreia();
      arpao.moveArpao(DIREITA);
      arpao.desenhaArpao();
    }
  
    // tecla S: arpao dispara bolha
    else if (tecla == 83) {
      if (!BOLHA_ATIVA) {
        BOLHA_ATIVA = 1;
        bolha = new Bolha(arpao.a[0], arpao.a[1]);
      }
    }
  }
}

function callbackJogar() {
  let u = gInterface.start.value;
  if (u == "Jogar") {
    gInterface.start.value = "Pausar";
    gInterface.pausado = false;
    gInterface.passo.disabled = true;
    jogar(); 
  }
  else {
    gInterface.start.value = "Jogar";
    gInterface.pausado = true;
    gInterface.passo.disabled = false;
  }
}

function callbackPasso() {
  if(gInterface.start.value == "Jogar") {
    passo();
  }
}

function callbackVelocidade() {
  VELOCIDADE_JOGO = gInterface.velocidade.value;
  gInterface.pVelocidade.innerHTML = "Velocidade x" + VELOCIDADE_JOGO/10;
}

/**
 * desenha a areia de acordo com a proporção
 * da altura do canvas
*/
function desenhaAreia() {
  let alturaAreia = AREIA_ALT * window.innerHeight
  ctx.fillStyle =  'yellow';
  ctx.fillRect(0, window.innerHeight - alturaAreia, window.innerWidth, alturaAreia);

  MAR_H = window.innerHeight - alturaAreia;
  MAR_W = JANELA_W;
}

/**
 * cria um array com n peixes
 */
function criaPeixes() {
  for(let i = 0; i < N_PEIXES; i++) {
    let peixe = new Peixe();
    peixes.push(peixe);
    peixe.desenhaPeixe();
  }
}

function criaArpao() {
  arpao = new Arpao();
  arpao.desenhaArpao();
}

/**
 * sorteia um número inteiro entre min e max
 */
function sorteie_inteiro(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * calcula a distancia entre dois pontos (x1, y1) e (x2, y2)
 */
function distancia(x1, y1, x2, y2){
  return (Math.sqrt((x1-x2)**2 + (y1-y2)**2))
}

/**
 * dado uma lista de peixes, redesenha cada um deles
 * em sua nova posicao continuamente
 * 
 * Usar esse para o botao Jogar
 */
function jogar() {
  if (!gInterface.pausado) {
    passo();
    requestAnimationFrame(jogar);
  }
}

/**
 * dado uma lista de peixes, redesenha cada um deles
 * em sua nova posicao 1 frame por vez
 * 
 * Usar esse para o botao Passo
 */
function passo() {
  // limpa mar
  ctx.fillStyle = "darkcyan";
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for(let i = 0; i < N_PEIXES; i++) {
    let peixe = peixes[i];
    peixe.movePeixe();
    peixe.desenhaPeixe();
  }

  if (BOLHA_ATIVA) {
    bolha.moveBolha();
    for(let i = 0; i < N_PEIXES; i++) {
      if (bolha.checaColisao(peixes[i])) {
        peixes.splice(i, 1);
        N_PEIXES -= 1;
        console.log(peixes);
      }
    }
  }

  desenhaAreia();
  arpao.desenhaArpao();

  if (BOLHA_ATIVA) {
    bolha.desenhaBolha();
  }
}
