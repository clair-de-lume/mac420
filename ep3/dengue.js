/*
EP3 de MAC0420/MAC5744 - Dengue

Nome: Luísa Menezes da Costa
NUSP: 12676491

Referências:
- MDN Web Docs
- algumas funções foram retiradas diretamente das notas de aula
- algumas funções foram retiradas diretamente do meu EP2 - Pescaria
*/

"use strict";

// ==================================================================
// constantes globais

const FUNDO = [0, 1, 1, 1];
const DISCO_UMA_COR = true;

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

const TIRO_VX = 0.01;
const TIRO_VY = 0.01;

const COR_TIRO = [0, 0, 0, 1]
const G = -0.05;

const ALT_DENGUE = 0.05;
const LAR_DENGUE = 0.05;
const MAX_VEL_DENGUE = 0.05;
const MIN_VEL_DENGUE = 0.01;
const COR_DENGUE = [0.5, 0.3, 0.2, 1];
const BORDA = 0.15;

// ==================================================================
// variáveis globais
var gl;
var gCanvas;
var gShader = {};  // encapsula globais do shader
var gInterface = {
  pausado: false,
}
var VELOCIDADE_JOGO = 10;

// Os códigos fonte dos shaders serão descritos em 
// strings para serem compilados e passados a GPU
var gVertexShaderSrc;
var gFragmentShaderSrc;

// Define o objeto a ser desenhado: uma lista de vértices
// com coordenadas no intervalo (0,0) a (200, 200)
var gPosicoes = [];
var gCores = [];
var gObjetos = [];
var gUltimoT = Date.now();

// ==================================================================
// chama a main quando terminar de carregar a janela
window.onload = main;

// ==================================================================
// CLASSES
// ==================================================================

class Mosquito {
  pos;
  cor;
  velX; velY;
  vertices;

  constructor() {
    // posicao inicial do mosquito
    x = sorteie_numero(BORDA, 1-BORDA);
    y = sorteie_numero(BORDA, 1-BORDA);
    this.pos = vec2(x, y)

    // velocidades iniciais do mosquito
    velX = sorteie_numero(MIN_VEL_DENGUE, MAX_VEL_DENGUE);
    velY = sorteie_numero(MIN_VEL_DENGUE, MAX_VEL_DENGUE);

    cor = COR_DENGUE;

    vertices = [
      [x + LAR_DENGUE, y + LAR_DENGUE],
      [x - LAR_DENGUE, y + LAR_DENGUE],
      [x - LAR_DENGUE, y - LAR_DENGUE],
      [x + LAR_DENGUE, y - LAR_DENGUE],
    ];
  }

  desenheMosquito() {
    gl.uniform4f(gShader.uColor, Math.random(), Math.random(), Math.random(), 1);
    gl.drawArrays(gl.LINE_LOOP, 3 * ii, 3);
  }

}


/**
 * programa principal.
 */
function main() {
  gCanvas = document.getElementById("glcanvas");
  gl = gCanvas.getContext('webgl2');
  if (!gl) alert("WebGL 2.0 isn't available");
  console.log(`Canvas: ${gCanvas.width} x ${gCanvas.height}`);

  constroiInterface();

  // cria objetos
  let d0 = new Disco(50, 50, 70, 10, 10, sorteieCorRGBA(), gPosicoes, gCores, 64);
  gObjetos.push(d0);
  console.log("disco 0: ", gPosicoes.length, gCores.length);

  // shaders
  crieShaders();

  // Inicializações feitas apenas 1 vez
  // define como mapear coordenadas normalidas para o canvas
  //gl.viewport(0, 0, gCanvas.width, gCanvas.height);
  // limpa o contexto
  gl.clearColor(FUNDO[0], FUNDO[1], FUNDO[2], FUNDO[3]);

  // finalmente...
  passo();
}

function constroiInterface() {
  gInterface.start = document.getElementById("bRun");
  gInterface.passo = document.getElementById("bStep");
  gInterface.velocidade = document.getElementById("bVel");


  gInterface.start.onclick = callbackJogar;
  gInterface.passo.onclick = callbackPasso;
  gInterface.velocidade.onclick = callbackVelocidade;
}

// ==================================================================
// FUNCOES CALLBACK DA INTERFACE
// ==================================================================

function callbackJogar() {
  let u = gInterface.start.value;
  if (u == "Pausar") {
    gInterface.start.value = "Executar";
    gInterface.pausado = true;
    gInterface.passo.disabled = false;
    gInterface.passo.value = "Passo";
    console.log("Pausado:", gInterface.pausado);
    jogar(); 
  }
  else {
    gInterface.start.value = "Pausar";
    gInterface.pausado = false;
    gInterface.passo.disabled = true;
    gInterface.passo.value = " ";
    console.log("Pausado:", gInterface.pausado);
  }
}

function callbackPasso() {
  if(gInterface.pausado) {
    console.log("Cliquei em passo");
    passo();
  }
}

function callbackVelocidade() {
  VELOCIDADE_JOGO = gInterface.velocidade.value;
  console.log("Nova velocidade:", VELOCIDADE_JOGO/10);
}


// ==================================================================
// FUNCOES AUXILIARES
// ==================================================================

/**
 * sorteia um número entre min e max
 */
function sorteie_numero(min, max) {
  return Math.random() * (max - min) + min;
}

// ==================================================================
// FUNCOES DO WEBGL
// ==================================================================

function crieShaders() {
  //  cria o programa
  gShader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
  gl.useProgram(gShader.program);

  // carrega dados na GPU
  gShader.bufPosicoes = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gShader.bufPosicoes);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gPosicoes), gl.STATIC_DRAW);

  // Associa as variáveis do shader ao buffer gPosicoes
  var aPositionLoc = gl.getAttribLocation(gShader.program, "aPosition");
  // Configuração do atributo para ler do buffer
  // atual ARRAY_BUFFER
  let size = 2;          // 2 elementos de cada vez - vec2
  let type = gl.FLOAT;   // tipo de 1 elemento = float 32 bits
  let normalize = false; // não normalize os dados
  let stride = 0;        // passo, quanto avançar a cada iteração depois de size*sizeof(type) 
  let offset = 0;        // começo do buffer
  gl.vertexAttribPointer(aPositionLoc, size, type, normalize, stride, offset);
  gl.enableVertexAttribArray(aPositionLoc);

  // buffer de cores
  var bufCores = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufCores);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gCores), gl.STATIC_DRAW);
  var aColorLoc = gl.getAttribLocation(gShader.program, "aColor");
  gl.vertexAttribPointer(aColorLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColorLoc);

  // resolve os uniforms
  gShader.uResolution = gl.getUniformLocation(gShader.program, "uResolution");

};

/**
 * Usa o shader para desenhar.
 * Assume que os dados já foram carregados e são estáticos.
 */
function passo() {
  let now = Date.now();
  let delta = (now - gUltimoT) / 1000;
  gUltimoT = now;

  // desenha vertices
  let skip = 0
  for (let i = 0; i < gObjetos.length; i++) {
    gObjetos[i].atualize(delta, gCanvas, skip);
    skip += gObjetos[i].nv * 3;
  }

  // atualiza o buffer de vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, gShader.bufPosicoes);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gPosicoes), gl.STATIC_DRAW);

  gl.uniform2f(gShader.uResolution, gCanvas.width, gCanvas.height);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, gPosicoes.length); 
}

/**
 * Usa o shader para desenhar.
 * Assume que os dados já foram carregados e são estáticos.
 */
function jogar() {
  if (!gInterface.pausado) {
    passo();
    window.requestAnimationFrame(jogar);
  }
}

// ========================================================
// Código fonte dos shaders em GLSL
// a primeira linha deve conter "#version 300 es"
// para WebGL 2.0

gVertexShaderSrc = `#version 300 es

// aPosition é um buffer de entrada
in vec2 aPosition;
uniform vec2 uResolution;
in vec4 aColor;  // buffer com a cor de cada vértice
out vec4 vColor; // varying -> passado ao fShader

void main() {
    vec2 escala1 = aPosition / uResolution;
    vec2 escala2 = escala1 * 2.0;
    vec2 clipSpace = escala2 - 1.0;

    gl_Position = vec4(clipSpace, 0, 1);
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



/*
    Classe Disco

    Um disco é representado por um centro e um raio.
    DISCO_RES define o número de vértices usado.
    Cada vértice tem uma posição em 2D e uma cor.

*/

// Algumas constantes
const DISCO_RES = 1;   // número de vértices = 4 ^ DISCO_RES

// ========================================================
/**
 * calcula os vértices de um disco de raio raio centrado em (0,0)
 * @param {Number} raio - do disco
 * @param {Number} nv - numero de vertices
 * @returns - Array de vértices vec2
 */

function aproximeDiscoN(raio, nv = 3) {

  let verts = [vec2(raio, 0)];
  let dang = (360 / nv) * Math.PI / 180.0; // em radianos

  for (let i = 1; i < nv; i++) {
    let ang = i * dang;
    let x = raio * Math.cos(ang);
    let y = raio * Math.sin(ang);
    verts.push(vec2(x, y));
    console.log(verts[i]);
  }

  return verts;
}

/**
 * calcula os vértices de um disco de raio raio centrado em (0,0)
 * @param {Number} raio - do disco
 * @param {Number} ref - numero de vertices
 * @returns - Array de vértices vec2
 */
function aproximeDisco(raio, ref = DISCO_RES) {
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

// ========================================================
/**
 * define a classe de objetos do tipo Disco
 * @param {Number} x - centro x
 * @param {Number} y - centro y
 * @param {Number} r - raio
 * @param {Number} vx - vel x 
 * @param {Number} vy - vel y 
 * @param {Array} cor - RGBA 
 * @param {Array} ap - Array de posições 
 * @param {Array} ac - Array de cores
 * @param {Number} res - define o número de vértices
 * 
 */
function Disco(x, y, r, vx, vy, cor, ap, ac, res = DISCO_RES) {

  /*       CONSTRUTOR    */
  // atributos
  this.vertices = aproximeDiscoN(r, res);
  this.nv = this.vertices.length;

  console.log("NV: ", this.nv)
  this.pos = vec2(x, y);
  this.vel = vec2(vx, vy);
  this.cor = cor;
  this.ap = ap;
  this.ac = ac;

  // inicializa buffer de posições e cores
  let ct = this.pos;  // sugar 
  let nv = this.nv;
  let vt = this.vertices;
  for (let i = 0; i < nv; i++) {
    let k = (i + 1) % nv;
    this.ap.push(ct);
    this.ap.push(add(ct, vt[i])); // translada 
    this.ap.push(add(ct, vt[k]));

    this.ac.push(cor);
    this.ac.push(cor);
    this.ac.push(cor);
  }
  /*  Fim do construtor */

  /** -------------------------------------------------------------
   * atualiza a posicao dos vertices do disco
   * @param {*} delta - intervalo de tempo desde a ultima atualizacao
   */
  this.atualize = function (delta, canvas, skip) {
    this.pos = add(this.pos, mult(delta, this.vel));
    let x, y;
    let vx, vy;
    [x, y] = this.pos;
    [vx, vy] = this.vel;

    // bateu? Altere o trecho abaixo para considerar o raio!
    if (x < 0) { x = -x; vx = -vx; };
    if (y < 0) { y = -y; vy = -vy; };
    if (x >= canvas.width) { x = canvas.width; vx = -vx; };
    if (y >= canvas.height) { y = canvas.height; vy = -vy; };
    // console.log(x, y, vx, vy);
    let centro = this.pos = vec2(x, y);
    this.vel = vec2(vx, vy);

    let nv = this.nv;
    let vert = this.vertices;
    for (let i = 0; i < nv; i++) {
      let k = (i + 1) % nv;  // lista circular
      this.ap[skip++] = centro;
      this.ap[skip++] = add(centro, vert[i]);
      this.ap[skip++] = add(centro, vert[k]);
    }
  }
};
