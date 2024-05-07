/*
  EP3 de MAC0420/MAC5744 - Dengue

  Nome: Luísa Menezes da Costa
  NUSP: 12676491
  
  Referências:
  - MDN Web Docs
  - algumas funções foram retiradas diretamente das notas de aula
 */

"use strict";

// ==================================================================
// constantes globais
const BICO_INSETICIDA = 0.075;
const LAR_INSETICIDA = 0.05;
const ALT_MIN_INSETICIDA = 0.25;
const ALT_MAX_INSETICIDA = 0.75;
const ANG_MIN_INSETICIDA = -35;
const ANG_MAX_INSETICIDA =  75;
const COR_INSETICIDA_BASE = [0, .7, .9, 1];
const COR_INSETICIDA_PARAFUSO = [0, 0.2, 0.5, 1];
const COR_INSETICIDA_BICO = [0, 0.8, 1, 1];
const ALT_PASSO = 0.02;
const ANG_PASSO = 2;

const TIRO_VX = 0.07;
const TIRO_VY = 0.07;

const COR_TIRO = [0, 0, 0, 1]
const G = -0.05;

const ALT_DENGUE = 0.05;
const LAR_DENGUE = 0.05;
const MAX_VEL_DENGUE = 0.05;
const COR_DENGUE = [0.5, 0.3, 0.2, 1];
const COR_OLHO_DENGUE = [1, 1, 1, 1];
const MAX_THETA_ASA = 50;
const MIN_THETA_ASA = -50;

const BORDA = 0.15;

const FUNDO = [0, 1, 1, 1];
const N_MOSQUITOS = 5;
const PERTURBACAO_VOO = [0.001, -0.001];

// ==================================================================
// variáveis globais do WebGL
// ==================================================================
var gl;
var gCanvas;
var gShader = {};  // encapsula globais do shader

// Os códigos fonte dos shaders serão descritos em 
// strings para serem compilados e passados a GPU
var gVertexShaderSrc;
var gFragmentShaderSrc;

// Define o objeto a ser desenhado: uma lista de vértices
// com coordenadas no intervalo (0,0) a (200, 200)
var gUltimoT = Date.now();

var gMosquitos = [];
var gCoresMosquitos = [];
var gPosicoesMosquitos = [];

var gInseticida;
var gCoresInseticida = [];
var gPosicoesInseticida = [];

var gTiro;
var gCoresTiro = [];
var gPosicoesTiro = [];

// ==================================================================
// variáveis globais da interface
// ==================================================================
var gInterface = {
  pausado: false,
}
var TIRO_ATIVO = false;
var VELOCIDADE_JOGO = 3;

/**
 * Uma classe para um objeto Mosquito.
 * Mosquito possui os atributos: 
 * - vertices: um vetor de vertices do corpo
 * - pos: um vec2 com sua posicao (x,y)
 * - vel: um vec2 com sua velocidade (vx, vy) 
 * - cor: uma constante com sua cor do corpo em RGBA
 * - sx: sua escala em x
 * - sy: sua escala em y
 * - olhoE: um vetor de vertices do olho esquerdo
 * - olhoD: um vetor de vertices do olho direito
 * - asaE: um vetor de vertices da asa esquerda
 * - asaD: um vetor de vertices da asa direita
 * - thetaAsa: o angulo de rotacao das asas
 * - velAsa: a velocidade angular da asa
 */
class Mosquito {
  vertices;
  pos;
  vel;
  cor;
  cor_olho;
  sx; sy;
  olhoE; olhoD;
  asaE; asaD;
  thetaAsa;
  velAsa;

  /**
   * Construtor da classe Mosquito
   * @param {Number} x - posicao x inicial
   * @param {Number} y - posicao y inicial
   * @param {Number} vx - velocidade horizontal inicial
   * @param {Number} vy - velocidade vertical inicial
   * @param {Number} sx - escala no eixo x
   * @param {Number} sy - escala no eixo y
   * @param {Array} cor - cor das asas e olhos
   */
  constructor(x, y, vx, vy, sx, sy, cor) {
    this.vertices = [
    vec2(0.5, 0.5),
    vec2(-0.5, 0.5),
    vec2(-0.5, -0.5),
    vec2(0.5, -0.5)
    ];

    this.olhoE = aproximeDisco(1, 2);
    this.olhoD = aproximeDisco(1, 2);
    this.asaE = defineTriangulo(0, 0, 1, 1, "esquerda");
    this.asaD = defineTriangulo(0, 0, 1, 1, "direita");

    this.nv = this.vertices.length;
    this.pos = vec2(x, y);
    this.vel = vec2(vx, vy);  

    this.cor = COR_DENGUE;
    this.cor_olho = cor;
    this.thetaAsa = sorteie_numero(-50, 50);
    this.velAsa = 200;
    this.sx = sx;
    this.sy = sy;

    // inicializa buffers    
    let vt = this.vertices;
    let i, j, k;
    [i, j, k] = [0, 1, 2]
    gPosicoesMosquitos.push(vt[i]);
    gPosicoesMosquitos.push(vt[j]);
    gPosicoesMosquitos.push(vt[k]);

    gCoresMosquitos.push(this.cor);
    gCoresMosquitos.push(this.cor);
    gCoresMosquitos.push(this.cor);

    [i, j, k] = [0, 2, 3]
    gPosicoesMosquitos.push(vt[i]);
    gPosicoesMosquitos.push(vt[j]);
    gPosicoesMosquitos.push(vt[k]);

    gCoresMosquitos.push(this.cor);
    gCoresMosquitos.push(this.cor);
    gCoresMosquitos.push(this.cor);
 
    let centro = vec2(0, 0);
    let n = this.olhoE.length;

    // olho esquerdo
    for (let i = 0; i < n; i++) {
      let k = (i + 1) % n;
      gPosicoesMosquitos.push(centro);
      gPosicoesMosquitos.push(add(centro, this.olhoE[i]));
      gPosicoesMosquitos.push(add(centro, this.olhoE[k]));

      gCoresMosquitos.push(this.cor_olho);
      gCoresMosquitos.push(this.cor_olho);
      gCoresMosquitos.push(this.cor_olho);
    }

    // olho direito
    for (let i = 0; i < n; i++) {
      let k = (i + 1) % n;
      gPosicoesMosquitos.push(centro);
      gPosicoesMosquitos.push(add(centro, this.olhoD[i]));
      gPosicoesMosquitos.push(add(centro, this.olhoD[k]));

      gCoresMosquitos.push(this.cor_olho);
      gCoresMosquitos.push(this.cor_olho);
      gCoresMosquitos.push(this.cor_olho);
    }
    
    // asa esquerda
    for (let i = 0; i < 3; i++) {
      gPosicoesMosquitos.push(this.asaE[i]);
      gCoresMosquitos.push(this.cor_olho);
    }

    // asa direita
    for (let i = 0; i < 3; i++) {
      gPosicoesMosquitos.push(this.asaD[i]);
      gCoresMosquitos.push(this.cor_olho);
    }
  }

  /**
   * Atualiza a posicao do mosquito de acordo com a variacao de tempo.
   * Adiciona perturbaçoes na velocidade (ate um certo limite) e reflete a
   * trajetoria do mosquito se ele bater em alguma borda. Faz as asas rotacionarem
   * ate um angulo maximo pre-definido.
   * @param {Number} delta intervalo de tempo
   */
  atualizaMosquito(delta) {
    // adiciona a perturbacao no voo
    let velocidadeAleatoria = vec2(sorteie_numero(-0.01, 0.01), sorteie_numero(-0.01, 0.01));
    this.vel = add(this.vel, velocidadeAleatoria);
    
    if (this.vel[0] > 0.1) { this.vel[0] = 0.01; }
    if (this.vel[0] < -0.1) { this.vel[0] = -0.01; }
    if (this.vel[1] > 0.1) { this.vel[1] = 0.01; }
    if (this.vel[1] < -0.1) { this.vel[1] = -0.01; }
    
    // atualiza a posicao do mosquito
    // s = so + (v * t)
    this.pos = add(this.pos, mult(delta, this.vel));    
    
    let x = this.pos[0];
    let y = this.pos[1];
    let vx = this.vel[0];
    let vy = this.vel[1];

    // bateu? Altere o trecho abaixo para considerar o raio!
    if (x < LAR_DENGUE/2 + LAR_INSETICIDA) { x = -x; vx = -vx; };
    if (y < LAR_DENGUE/2) { y = -y; vy = -vy; };
    if (x > 1 - LAR_DENGUE/2) { x = 1; vx = -vx;};
    if (y > 1 - LAR_DENGUE/2) { y = 1; vy = -vy; };

    this.vel = vec2(vx, vy);

    // atualiza angulo da asa
    this.thetaAsa = (this.thetaAsa + this.velAsa * delta) % 360;

    // checa se chegou na angulacao maxima/minima
    if (this.thetaAsa > MAX_THETA_ASA) {
      this.thetaAsa = MAX_THETA_ASA;
      this.velAsa = -this.velAsa;
    }
    if (this.thetaAsa < MIN_THETA_ASA) {
      this.thetaAsa = MIN_THETA_ASA;
      this.velAsa = -this.velAsa;
    }
  }
}

/**
 * Uma classe para um objeto Inseticida.
 *  Inseticida possui os atributos: 
 * - altura: a altura atual do inseticida
 * - largura: a largura do inseticida
 * - vertices: um vetor de vertices da base
 * - parafuso: um vetor de vertices do parafuso
 * - bico: um vetor de vertices do bico
 * - thetaBico: o angulo atual do bico
 */
class Inseticida {
  altura;
  largura;
  vertices;
  parafuso;
  bico;
  thetaBico = 0;

  constructor() {
    this.altura = (ALT_MAX_INSETICIDA + ALT_MIN_INSETICIDA) / 2;
    this.largura = LAR_INSETICIDA;

    this.vertices = [ 
      // triangulo 1
      vec2(0, 0),
      vec2(1, 0),
      vec2(1, 1),

     // triangulo 2 
      vec2(0, 0),
      vec2(1, 1),
      vec2(0, 1)
    ]
    this.parafuso = defineHexagono();
    this.bico = defineTriangulo(0, 0, 1, 1, "direita");

    // base
    for (let i = 0; i < 6; i++) {
      gPosicoesInseticida.push(this.vertices[i]);
      gCoresInseticida.push(COR_INSETICIDA_BASE);
    }
    
    let n = this.parafuso.length;
    let centro = vec2(0, 0);
    // parafuso
    for (let i = 0; i < n; i++) {
      let k = (i + 1) % n;
      gPosicoesInseticida.push(centro);
      gPosicoesInseticida.push(this.parafuso[i]);
      gPosicoesInseticida.push(this.parafuso[k]);
      
      gCoresInseticida.push(COR_INSETICIDA_PARAFUSO);
      gCoresInseticida.push(COR_INSETICIDA_PARAFUSO);
      gCoresInseticida.push(COR_INSETICIDA_PARAFUSO);
    }
    // bico
    for (let i = 0; i < 3; i++) {
      gPosicoesInseticida.push(this.bico[i]);
      gCoresInseticida.push(COR_INSETICIDA_BICO);
    }
  }
}

/**
 * Uma classe para um objeto Tiro.
 *  Tiro possui os atributos: 
 * - posicao: um vec2 com sua posicao atual (x,y)
 * - vx: sua velocidade horizontal
 * - vy: sua velocidade vertical
 * - vel: um vec2 com sua velocidade (vx, vy) 
 * - cor: uma constante com sua cor em RGBA
 * - vertices: um vetor de vertices do corpo
 */
class Tiro {
  posicao;
  vx; vy;
  vel;
  cor;
  vertices;

  /**
   * Construtor da classe Tiro que recebe um angulo theta que afeta a posicao
   * em que o tiro será criado.
   */
  constructor(theta) {
    let x = LAR_INSETICIDA/2 + BICO_INSETICIDA * Math.cos(degreesToRadians(theta));
    let y = gInseticida.altura + BICO_INSETICIDA * Math.sin(degreesToRadians(theta));
    this.posicao = vec2(x, y);

    this.vx = TIRO_VX * Math.cos(degreesToRadians(theta));
    this.vy = TIRO_VY * Math.sin(degreesToRadians(theta));
    this.vel = vec2(this.vx, this.vy);

    this.vertices = aproximeDisco(1, 2);
    this.cor = COR_TIRO;

    let n = this.vertices.length;
    let centro = this.posicao;

    for (let i = 0; i < n; i++) {
      let k = (i + 1) % n;
      gPosicoesTiro.push(centro);
      gPosicoesTiro.push(this.vertices[i]);
      gPosicoesTiro.push(this.vertices[k]);

      gCoresTiro.push(COR_TIRO);
      gCoresTiro.push(COR_TIRO);
      gCoresTiro.push(COR_TIRO);
    }
  }

  /**
   * Metodo de Tiro que atualiza a posicao do tiro levando em conta
   * suas velocidades e a gravidade.
   */
  atualizeTiro(delta) {
    let x = this.posicao[0];
    let vx = this.vel[0];

    x = x + (vx * VELOCIDADE_JOGO) * delta;
    this.posicao[0] = x;

    let y = this.posicao[1];
    let vy = this.vel[1];

    // acao da gravidade apenas na componente vertical
    vy = vy + G * delta;
    y = y + vy * delta;
    this.posicao[1] = y;
    this.vel[1] = vy;

    // destroi o tiro se estiver fora do canva
    if (y < 0 || x > 1) {
      TIRO_ATIVO = false;
      delete this;
    }
  }

  /**
   * Metodo de Tiro que checa se ele colidiu com um dado mosquito. 
   */
  checaColisao(mosquito) {
    let xMosquito = mosquito.pos[0];
    let yMosquito = mosquito.pos[1];

    let xTiro = this.posicao[0];
    let yTiro = this.posicao[1];

    if (distancia(xMosquito, yMosquito, xTiro, yTiro) < LAR_DENGUE/2 + 0.01) {
      console.log("colidiu");
      TIRO_ATIVO = false;
      delete this;
      return true;
    }
    return false;
  }
}

// ==================================================================
// chama a main quando terminar de carregar a janela
window.onload = main;

/**
 * programa principal.
 */
function main() {
  gCanvas = document.getElementById("glcanvas");
  gl = gCanvas.getContext('webgl2');
  if (!gl) alert("WebGL 2.0 isn't available");
  
  constroiInterface();
  
  // cria objetos
  gInseticida = new Inseticida();
  console.log("inseticida num vertices:", gPosicoesInseticida.length);
  
  for (let i = 0; i < N_MOSQUITOS; i++) {
    let x = sorteie_numero(BORDA, 1-BORDA);
    let y = sorteie_numero(BORDA, 1-BORDA);
    let vx = sorteie_numero(-MAX_VEL_DENGUE, MAX_VEL_DENGUE);
    let vy = sorteie_numero(-MAX_VEL_DENGUE, MAX_VEL_DENGUE);
    let cor = sorteia_RGB();

    gMosquitos.push(new Mosquito(x, y, vx, vy, LAR_DENGUE, ALT_DENGUE, cor));
  }
  console.log("dengue num vertices:", gPosicoesMosquitos.length/N_MOSQUITOS);
  console.log("Canvas: ", gCanvas.width, gCanvas.height);

  console.log(gMosquitos);
  console.log(gPosicoesMosquitos)

  // shaders
  crieShaders();

  // Inicializações feitas apenas 1 vez
  // define como mapear coordenadas normalidas para o canvas
  //gl.viewport(0, 0, gCanvas.width, gCanvas.height);
  // limpa o contexto
  gl.clearColor(FUNDO[0], FUNDO[1], FUNDO[2], FUNDO[3]);

  // finalmente...
  //desenhe();
  jogar();
}

/**
 * Funcao que pega os elementos da interface e os coloca na variavel
 * glocal gInterface, bem como declara as funcoes de callback.
 */
function constroiInterface() {
  gInterface.start = document.getElementById("bRun");
  gInterface.passo = document.getElementById("bStep");
  gInterface.velocidade = document.getElementById("bVel");


  gInterface.start.onclick = callbackJogar;
  gInterface.passo.onclick = callbackPasso;
  gInterface.velocidade.onclick = callbackVelocidade;

  window.onkeydown = callbackKeyDown;
}

// ==================================================================
// FUNCOES CALLBACK DA INTERFACE
// ==================================================================

/*
 * Funcao callback chamada ao apertar o botão Executar/Pausar. Muda
 * os estados dos botões da interface, bem como a variavel global
 * gInterface.pausado para refletir o estado correto da interface e do jogo.
 */
function callbackJogar() {
  let u = gInterface.start.value;
  if (u == "Pausar") {
    gInterface.start.value = "Executar";
    gInterface.pausado = true;
    gInterface.passo.disabled = false;
    gInterface.passo.value = "Passo";
    console.log("Pausado:", gInterface.pausado); 
  }
  else {
    gInterface.start.value = "Pausar";
    gInterface.pausado = false;
    gInterface.passo.disabled = true;
    gInterface.passo.value = " ";
    console.log("Pausado:", gInterface.pausado);
  }
}


/*
 * Funcao callback chamada ao apertar o botão Passo. Identica a funcao
 * desenhe(), porem o delta sempre sera igual a 0.1 segundo.
 */
function callbackPasso() {
  if(gInterface.pausado) {
    console.log("Cliquei em passo");
    
    // limpa o canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // cria a matriz de projeção - pode ser feita uma única vez
    const projection = mat4(
      2, 0, 0, -1,
      0, 2, 0, -1,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
    
    let delta = 0.1;
    
    desenheMosquitos(delta, projection);
    desenheInseticida(projection);
    if (TIRO_ATIVO) {
      desenheTiro(delta, projection);
      
      for (let i = 0; i < gMosquitos.length; i++) {
        let mosquito = gMosquitos[i];
        let colidiu = gTiro.checaColisao(mosquito);
        
        if (colidiu) {
          gCoresMosquitos.splice(60 * i , 60)
          gPosicoesMosquitos.splice(60 * i , 60);
          gMosquitos.splice(i, 1);
        }
      }
    }
    console.log("Passou 0.1 segundo");
    console.log("Cena:", constroiCena());
    console.log(gMosquitos[0].pos[0], gMosquitos[0].pos[1])
  }
}

/*
 * Funcao callback para mudanca do range de velocidade.
 * Altera a variavel global VELOCIDADE_JOGO para a velocidade
 * escolhida pelo usuario.
 */
function callbackVelocidade() {
  VELOCIDADE_JOGO = gInterface.velocidade.value;
  console.log("Nova velocidade:", VELOCIDADE_JOGO);
}

/*
 * Funcao callback para onkeydown
 */
function callbackKeyDown(e) {
  let tecla = e.key;

  if (tecla == "i" || tecla == "I") {
    if (gInseticida.altura < ALT_MAX_INSETICIDA) {
      gInseticida.altura += ALT_PASSO;
      console.log("Nova altura:", gInseticida.altura);
      console.log("Tecla cima - para cima", gInseticida.altura);
    }
  }
  if (tecla == "k" || tecla == "K") {
    if (gInseticida.altura > ALT_MIN_INSETICIDA) {
      gInseticida.altura -= ALT_PASSO;
      console.log("Nova altura:", gInseticida.altura);
      console.log("Tecla baixo - para baixo", gInseticida.altura);
    }
  }
  if (tecla == "j" || tecla == "J") {
    if (gInseticida.thetaBico < ANG_MAX_INSETICIDA) {
      gInseticida.thetaBico += ANG_PASSO;
      console.log("Novo angulo:", gInseticida.thetaBico);
      console.log("Tecla esq - roda anti horario", gInseticida.thetaBico);
    }
  }
  if (tecla == "l" || tecla == "L") {
    if (gInseticida.thetaBico > ANG_MIN_INSETICIDA) {
      gInseticida.thetaBico -= ANG_PASSO;
      console.log("Novo angulo:", gInseticida.thetaBico);
      console.log("Tecla esq - roda horario", gInseticida.thetaBico);
    }
  }
  if (tecla == "t" || tecla == "T") {
    if (!TIRO_ATIVO) {
      gTiro = new Tiro(gInseticida.thetaBico);
      crieShaderTiro();
      TIRO_ATIVO = true;
      console.log("Tiro em:", gTiro.posicao[0], gTiro.posicao[1], 0);
      console.log("Tiro");
    }
  }
}

/**
 * Desenha continuamente a cena utilizando a funcao desenhe()
 */
function jogar() {
  desenhe();
  window.requestAnimationFrame(jogar);
}

/**
 * Usa o shader para desenhar todos os elementos na cena. Assume que os dados já 
 * foram carregados e são estáticos.
 */
function desenhe() {
  // atualiza o relógio
  let now = Date.now();
  let delta = (now - gUltimoT) / 1000;
  gUltimoT = now;

  // limpa o canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  // cria a matriz de projeção - pode ser feita uma única vez
  const projection = mat4(
    2, 0, 0, -1,
    0, 2, 0, -1,
    0, 0, 1, 0,
    0, 0, 0, 1
  );

  // se estiver pausado, ainda atualiza a cena,
  // mas de modo que todos os objetos sejam desenhados
  // no mesmo lugar    
  if (gInterface.pausado) {
    delta = 0;
  }

  desenheMosquitos(delta, projection);
  desenheInseticida(projection);
  if (TIRO_ATIVO) {
    desenheTiro(delta, projection);

    for (let i = 0; i < gMosquitos.length; i++) {
      let mosquito = gMosquitos[i];
      let colidiu = gTiro.checaColisao(mosquito);

      if (colidiu) {
        console.log("Acertou!", gTiro.posicao[0], gTiro.posicao[1]);
        gMosquitos.splice(i, 1);
        gCoresMosquitos.splice(60 * i , 60);
        gPosicoesMosquitos.splice(60 * i , 60);
      }
    }
  }
}

/**
 * desenha elementos da classe Mosquito
 * @param {Number} delta - variacao de tempo
 * @param {Number} projection - matriz de projecao
 */
function desenheMosquitos(delta, projection) {
  // atualiza e desenha mosquitos
  gl.bindVertexArray(gShader.mosquitosVAO);

  for (let i = 0; i < gMosquitos.length; i++) {
    let obj = gMosquitos[i];
    obj.atualizaMosquito(delta);
    let x = obj.pos[0];
    let y = obj.pos[1];

    // desenha o corpo do mosquito
    let modelView = translate(x, y, 0);
    modelView = mult(modelView, scale(obj.sx, obj.sy, 1));
    let uMatrix = mult(projection, modelView);
    gl.uniformMatrix4fv(gShader.uMatrix, false, flatten(uMatrix));
    gl.drawArrays(gl.TRIANGLES, 60 * i, 6); // cada mosquito ocupa 60 espacos em gPosicoesMosquitos

    // desenha olho esquerdo
    modelView = translate(x - 0.012, y, 0);
    modelView = mult(modelView, scale(0.007, 0.007, 1));
    uMatrix = mult(projection, modelView);
    gl.uniformMatrix4fv(gShader.uMatrix, false, flatten(uMatrix));
    gl.drawArrays(gl.TRIANGLES, 60 * i + 6, 24); // obj.nv * i + 6 pula os 6 vertices do corpo
                                                 // e 24 inclui os 24 vertices referentes ao olho esquerdo
    // desenha olho esquerdo
    modelView = translate(x + 0.012, y, 0);
    modelView = mult(modelView, scale(0.007, 0.007, 1));
    uMatrix = mult(projection, modelView);
    gl.uniformMatrix4fv(gShader.uMatrix, false, flatten(uMatrix));
    gl.drawArrays(gl.TRIANGLES, 60 * i + 30, 24); // obj.nv * i + 30 pula os 30 vertices do olho esquerdo
                                                  // e 24 inclui os 24 vertices referentes ao olho direito
    // desenha asa esquerda
    modelView = translate(x - LAR_DENGUE/2, y, 0);
    modelView = mult(modelView, scale(0.03, 0.03, 1));
    modelView = mult(modelView, rotateZ(obj.thetaAsa));
    uMatrix = mult(projection, modelView);
    gl.uniformMatrix4fv(gShader.uMatrix, false, flatten(uMatrix));
    gl.drawArrays(gl.TRIANGLES, 60 * i + 54, 3);

    // desenha asa direita
    modelView = translate(x + LAR_DENGUE/2, y, 0);
    modelView = mult(modelView, scale(0.03, 0.03, 1));
    modelView = mult(modelView, rotateZ(-obj.thetaAsa));
    uMatrix = mult(projection, modelView);
    gl.uniformMatrix4fv(gShader.uMatrix, false, flatten(uMatrix));
    gl.drawArrays(gl.TRIANGLES, 60 * i + 57, 3);
  }
}

/**
 * desenha um elemento da classe Inseticida
 * @param {Number} delta - variacao de tempo
 * @param {Number} projection - matriz de projecao
 */
function desenheInseticida(projection) {
  gl.bindVertexArray(gShader.inseticidaVAO);

  // base
  let modelView = scale(gInseticida.largura, gInseticida.altura, 1);
  let uMatrix = mult(projection, modelView);
  gl.uniformMatrix4fv(gShader.uMatrix, false, flatten(uMatrix));
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // parafuso
  modelView = translate(gInseticida.largura/2, gInseticida.altura, 0);
  modelView = mult(modelView, scale(0.35 * gInseticida.largura, 0.35 * gInseticida.largura, 1));
  uMatrix = mult(projection, modelView);
  gl.uniformMatrix4fv(gShader.uMatrix, false, flatten(uMatrix));
  gl.drawArrays(gl.TRIANGLES, 6, 18);

  // bico
  modelView = translate(gInseticida.largura/2, gInseticida.altura, 0);
  modelView = mult(modelView, rotateZ(gInseticida.thetaBico));
  modelView = mult(modelView, scale(BICO_INSETICIDA, BICO_INSETICIDA * 0.5, 1));
  uMatrix = mult(projection, modelView);
  gl.uniformMatrix4fv(gShader.uMatrix, false, flatten(uMatrix));
  gl.drawArrays(gl.TRIANGLES, 24, 3); 
}

/**
 * desenha um elemento da classe Tiro
 * @param {Number} delta - variacao de tempo
 * @param {Number} projection - matriz de projecao
 */
function desenheTiro(delta, projection) {
  gl.bindVertexArray(gShader.tiroVAO);

  gTiro.atualizeTiro(delta);
  let x = gTiro.posicao[0];
  let y = gTiro.posicao[1];

  let modelView = translate(x, y, 0);
  modelView = mult(modelView, scale(0.01, 0.01, 1));
  let uMatrix = mult(projection, modelView);
  gl.uniformMatrix4fv(gShader.uMatrix, false, flatten(uMatrix));
  gl.drawArrays(gl.TRIANGLES, 0, 24);
}

// ==================================================================
// SHADERS
// ==================================================================

gVertexShaderSrc = `#version 300 es

// aPosition é um buffer de entrada
in vec2 aPosition;
uniform mat4 uMatrix;

in vec4 aColor;  // buffer com a cor de cada vértice
out vec4 vColor; // varying -> passado ao fShader

void main() {
    gl_Position = vec4( uMatrix * vec4(aPosition,0,1) );
    vColor = aColor; 
}
`;

gFragmentShaderSrc = `#version 300 es

// Vc deve definir a precisão do FS.
// Use highp ("high precision") para desktops e mediump para mobiles.
precision highp float;

// out define a saída 
in vec4 vColor;
out vec4 outColor;

void main() {
  outColor = vColor;
}
`;

/**
 * cria e configura os shaders
 */
function crieShaders() {
  //  cria o programa
  gShader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
  gl.useProgram(gShader.program);

  crieShaderMosquito()
  crieShaderInseticida();

  // resolve os uniforms
  gShader.uMatrix = gl.getUniformLocation(gShader.program, "uMatrix");
  gl.bindVertexArray(null); // apenas boa prática

};

/**
 * cria e configura o shader dos mosquitos
 */
function crieShaderMosquito() {
  // Criar VAO para os mosquitos
  gShader.mosquitosVAO = gl.createVertexArray();
  gl.bindVertexArray(gShader.mosquitosVAO);

  // carrega dados dos mosquitos
  var bufPosMosquitos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufPosMosquitos);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gPosicoesMosquitos), gl.STATIC_DRAW);

  // Associa as variáveis do shader ao buffer gPosicoes
  var aPosMosquitos = gl.getAttribLocation(gShader.program, "aPosition");
  gl.vertexAttribPointer(aPosMosquitos, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosMosquitos);
  // buffer de cores
  var colorBufMosquitos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBufMosquitos);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gCoresMosquitos), gl.STATIC_DRAW);
  var aColorMosquitos = gl.getAttribLocation(gShader.program, "aColor");
  gl.vertexAttribPointer(aColorMosquitos, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColorMosquitos);
}

/**
 * cria e configura o shader do inseticida
 */
function crieShaderInseticida() {
  // Criar VAO para o inseticida
  gShader.inseticidaVAO = gl.createVertexArray();
  gl.bindVertexArray(gShader.inseticidaVAO);

  // carrega dados do inseticida
  var bufPosInseticida = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufPosInseticida);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gPosicoesInseticida), gl.STATIC_DRAW);

  // Associa as variáveis do shader ao buffer gPosicoes
  var aPosInseticida = gl.getAttribLocation(gShader.program, "aPosition");
  gl.vertexAttribPointer(aPosInseticida, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosInseticida);
  // buffer de cores
  var colorBufInseticida = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBufInseticida);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gCoresInseticida), gl.STATIC_DRAW);
  var aColorInseticida = gl.getAttribLocation(gShader.program, "aColor");
  gl.vertexAttribPointer(aColorInseticida, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColorInseticida);
}

/**
 * cria e configura o shader do tiro
 */
function crieShaderTiro() {
  // Criar VAO para o tiro
  gShader.tiroVAO = gl.createVertexArray();
  gl.bindVertexArray(gShader.tiroVAO);

  // carrega dados do tiro
  var bufPosTiro = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufPosTiro);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gPosicoesTiro), gl.STATIC_DRAW);

  // Associa as variáveis do shader ao buffer gPosicoes
  var aPosTiro = gl.getAttribLocation(gShader.program, "aPosition");
  gl.vertexAttribPointer(aPosTiro, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosTiro);
  // buffer de cores
  var colorBufTiro = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBufTiro);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gCoresTiro), gl.STATIC_DRAW);
  var aColorTiro = gl.getAttribLocation(gShader.program, "aColor");
  gl.vertexAttribPointer(aColorTiro, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColorTiro);

  // resolve os uniforms
  gShader.uMatrix = gl.getUniformLocation(gShader.program, "uMatrix");
  gl.bindVertexArray(null); // apenas boa prática
}

// ==================================================================
// FUNCOES AUXILIARES
// ==================================================================

/**
 * sorteia um número entre min e max
 * @param {Number} min - numero minimo do intervalo
 * @param {Number} max - numero maximo do intervalo
 * @returns numero aleatorio em [min, max]
 */
function sorteie_numero(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * sorteia uma cor aleatoria no formato rgb
 * @returns array com 4 elementos referentes a RGB e alfa
 */
function sorteia_RGB() {
  let min = 0;
  let max = 1;

  return ([
    Math.random() * (max - min) + min,
    Math.random() * (max - min) + min,
    Math.random() * (max - min) + min,
    1,
  ])
}

/**
 * converte um angulo em graus para radianos
 * @param {Number} degrees - angulo em graus
 * @returns angulo em radianos
 */
function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// ========================================================
/**
 * calcula os vértices de um disco de raio raio centrado em (0,0)
 * @param {vec2} centro - do disco 
 * @param {Number} raio - do disco
 * @param {Number} ref - numero de vertices
 * @returns - Array de vértices vec2
 */
function aproximeDisco(raio, ref = 4) {
  // primeiro um quadrado ao redor da origem
  let vertices = [
    vec2(raio, 0),
    vec2(0, raio),
    vec2(-raio, 0),
    vec2(0, -raio),
  ];

  // refinamento: adiciona 1 vértice em cada lado
  for (let i = 1; i < ref; i++) {
    let novo = [];
    let nv = vertices.length;
    for (let j = 0; j < nv; j++) {
      novo.push(vertices[j]);
      let k = (j + 1) % nv;
      let v0 = vertices[j];
      let v1 = vertices[k];
      let m = mix(v0, v1, 0.5);

      let s = raio / length(m);
      m = mult(s, m)
      novo.push(m);
    }
    vertices = novo;
  }
  return vertices;
}

/**
 * define os vertices de um triangulo (orientado para direita
 * ou para esquerda) com base b e altura h
 * @param {Number} x - coordenada horizontal de algum vertice do triangulo
 * @param {Number} y - coordenada vertical de algum vertice do triangulo
 * @param {Number} h - altura do triangulo
 * @param {Number} b - base do triangulo
 * @param {Number} direcao - orientacao do triangulo
 * @returns - array de vertices vec2
 */
function defineTriangulo(x, y, h, b, direcao) {
  if (direcao == "direita") {
    return ([vec2(x, y), vec2(x+h, y-b/2), vec2(x+h, y+b/2)]);
  }
  else {
    return ([vec2(x, y), vec2(x-h, y-b/2), vec2(x-h, y+b/2)]);
  }
}

/**
 * define os vertices de um hexagono de raio 1 e centrado
 * na origem (0, 0)
 * @returns array de vertices
 */
function defineHexagono() {
  let vertices = [];
  let radius = 1;

  for (let i = 0; i < 6; i++) {
    let angle = (Math.PI / 3) * i;

    let x = radius * Math.cos(angle);
    let y = radius * Math.sin(angle);

    vertices.push([x, y]);
  }
  return vertices;
}

// ========================================================
/**
 * calcula a distancia entre dois pontos (x1, y1) e (x2, y2)
 * @param {Number} x1 - do elemento 1
 * @param {Number} y1 - do elemento 1
 * @param {Number} x2 - do elemento 2
 * @param {Number} y2 - do elemento 2
 * @returns - distancia entre os dois elementos
 */
function distancia(x1, y1, x2, y2){
  return (Math.sqrt((x1-x2)**2 + (y1-y2)**2))
}

// ========================================================
/**
 * coloca todos os elementos da cena em um unico array
 * @returns - array com elementos da cena
 */
function constroiCena() {
  let cena = [];
  cena.push(gInseticida);
  if (TIRO_ATIVO) {
    cena.push(gTiro);
  }
  for (let i = 0; i < gMosquitos.length; i++) {
    cena.push(gMosquitos[i]);
  }
  return cena;
}