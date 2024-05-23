/**
 * Programa usando WegGL para demonstrar a animação 3D de um cubo
 * em perspectiva com rotação em cada eixo.
 *  
 * Bibliotecas utilizadas
 * macWebglUtils.js
 * MVnew.js do livro -- Interactive Computer Graphics
 * 
 * Esse programa foi baseado no exemplo cuboV do capítulo 4 do livro 
 * Interactive Computer Graphics - Angel & Shreiner.
 *
 */

"use strict";

// ==================================================================
// constantes globais

const FUNDO = [0.0, 0.0, 0.0, 1.0];
const EIXO_X = 0;
const EIXO_Y = 1;
const EIXO_Z = 2;

// ==================================================================
// variáveis globais
var gl;
var gCanvas;
var gShader = {};  // encapsula globais do shader

// Os códigos fonte dos shaders serão descritos em 
// strings para serem compilados e passados a GPU
var gVertexShaderSrc;
var gFragmentShaderSrc;

// guarda dados da interface e contexto do desenho
var gCtx = {
  axis: 0,   // eixo rodando
  theta: [0, 0, 0],  // angulos por eixo
  pause: false,        // 
  numV: 36,          // número de vertices
  vista: mat4(),     // view matrix, inicialmente identidade
  perspectiva: mat4(), // projection matrix
}

// posições dos 8 vértices de um cubo de lado 1
// centrado na origem
var gaPosicoes = [
  vec3(-0.5, -0.5, 0.5),
  vec3(-0.5, 0.5, 0.5),
  vec3(0.5, 0.5, 0.5),
  vec3(0.5, -0.5, 0.5),
  vec3(-0.5, -0.5, -0.5),
  vec3(-0.5, 0.5, -0.5),
  vec3(0.5, 0.5, -0.5),
  vec3(0.5, -0.5, -0.5)
];
// cores associadas a cada vértice
var gaCores = [
  vec4(0.0, 0.0, 0.0, 1.0),  // black
  vec4(1.0, 0.0, 0.0, 1.0),  // red
  vec4(1.0, 1.0, 0.0, 1.0),  // yellow
  vec4(0.0, 1.0, 0.0, 1.0),  // green
  vec4(0.0, 0.0, 1.0, 1.0),  // blue
  vec4(1.0, 0.0, 1.0, 1.0),  // magenta
  vec4(1.0, 1.0, 1.0, 1.0),  // white
  vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];

// indices para cada um dos 12 triângulos, 2 por face, que definem o cubo.

var gaIndices = [
  1, 0, 3,
  3, 2, 1,
  2, 3, 7,
  7, 6, 2,
  3, 0, 4,
  4, 7, 3,
  6, 5, 1,
  1, 2, 6,
  4, 5, 6,
  6, 7, 4,
  5, 4, 0,
  0, 1, 5
];

// ==================================================================
// chama a main quando terminar de carregar a janela
window.onload = main;

/**
 * programa principal.
 */
function main() {
  // ambiente
  gCanvas = document.getElementById("glcanvas");
  gl = gCanvas.getContext('webgl2');
  if (!gl) alert("Vixe! Não achei WebGL 2.0 aqui :-(");

  console.log("Canvas: ", gCanvas.width, gCanvas.height);

  // interface
  crieInterface();

  // Inicializações feitas apenas 1 vez
  gl.viewport(0, 0, gCanvas.width, gCanvas.height);
  gl.clearColor(FUNDO[0], FUNDO[1], FUNDO[2], FUNDO[3]);
  gl.enable(gl.DEPTH_TEST);

  // shaders
  crieShaders();

  // finalmente...
  render();
}

// ==================================================================
/**
 * Cria e configura os elementos da interface e funções de callback
 */
function crieInterface() {
  document.getElementById("xButton").onclick = function () {
    gCtx.axis = EIXO_X;
  };
  document.getElementById("yButton").onclick = function () {
    gCtx.axis = EIXO_Y;
  };
  document.getElementById("zButton").onclick = function () {
    gCtx.axis = EIXO_Z;
  };
  document.getElementById("pButton").onclick = function () {
    gCtx.pause = !gCtx.pause;
  };
}

// ==================================================================
/**
 * cria e configura os shaders
 */
function crieShaders() {
  //  cria o programa
  gShader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
  gl.useProgram(gShader.program);

  // buffer dos índices dos vértices
  var bufIndices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufIndices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(gaIndices), gl.STATIC_DRAW);

  // buffer dos vértices
  var bufVertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufVertices);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gaPosicoes), gl.STATIC_DRAW);

  var aPosition = gl.getAttribLocation(gShader.program, "aPosition");
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  // buffer de cores
  var bufCores = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufCores);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gaCores), gl.STATIC_DRAW);

  var aColor = gl.getAttribLocation(gShader.program, "aColor");
  gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColor);

  // resolve os uniforms
  gShader.uModelView = gl.getUniformLocation(gShader.program, "uModelView");
  gShader.uPerspective = gl.getUniformLocation(gShader.program, "uPerspective");

  // calcula a matriz de transformação perpectiva (fovy, aspect, near, far)
  // que é feita apenas 1 vez
  gCtx.perspectiva = perspective(60, 1, 0.1, 5);
  gl.uniformMatrix4fv(gShader.uPerspective, false, flatten(gCtx.perspectiva));

  // calcula a matriz de transformação da camera, apenas 1 vez
  let eye = vec3(1.75, 1.75, 1.75);
  let at = vec3(0, 0, 0);
  let up = vec3(0, 1, 0);
  gCtx.vista = lookAt(eye, at, up);
};

// ==================================================================
/**
 * Usa o shader para desenhar.
 * Assume que os dados já foram carregados e são estáticos.
 */
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // modelo muda a cada frame da animação
  if (!gCtx.pause) gCtx.theta[gCtx.axis] += 2.0;

  let rx = rotateX(gCtx.theta[EIXO_X]);
  let ry = rotateY(gCtx.theta[EIXO_Y]);
  let rz = rotateZ(gCtx.theta[EIXO_Z]);
  let model = mult(rz, mult(ry, rx));

  gl.uniformMatrix4fv(gShader.uModelView, false, flatten(mult(gCtx.vista, model)));
  gl.drawElements(gl.TRIANGLES, gCtx.numV, gl.UNSIGNED_BYTE, 0);

  window.requestAnimationFrame(render);
}
// ========================================================
// Código fonte dos shaders em GLSL
// a primeira linha deve conter "#version 300 es"
// para WebGL 2.0

gVertexShaderSrc = `#version 300 es

// aPosition é um buffer de entrada
in vec3 aPosition;
uniform mat4 uModelView;
uniform mat4 uPerspective;

in vec4 aColor;  // buffer com a cor de cada vértice
out vec4 vColor; // varying -> passado ao fShader

void main() {
    gl_Position = uPerspective * uModelView * vec4(aPosition, 1);
    vColor = aColor; 
}
`;

gFragmentShaderSrc = `#version 300 es

precision highp float;

in vec4 vColor;
out vec4 outColor;

void main() {
  outColor = vColor;
}
`;

/* ==================================================================
    Funções para criar uma esfera de raio unitário centrada na origem.
*/

/**
 * Refina os vértices da esfera recursivamente
 * @param {Number} n - profundidade da recursão
 */
function crieEsfera(ndivisoes = 2) {
  // começamos com os vértices de um balão
  let vp = [
    vec3(1.0, 0.0, 0.0),
    vec3(0.0, 1.0, 0.0),
    vec3(0.0, 0.0, 1.0),
  ];

  let vn = [
    vec3(-1.0, 0.0, 0.0),
    vec3(0.0, -1.0, 0.0),
    vec3(0.0, 0.0, -1.0),
  ];

  let triangulo = [
    [vp[0], vp[1], vp[2]],
    [vp[0], vp[1], vn[2]],

    [vp[0], vn[1], vp[2]],
    [vp[0], vn[1], vn[2]],

    [vn[0], vp[1], vp[2]],
    [vn[0], vp[1], vn[2]],

    [vn[0], vn[1], vp[2]],
    [vn[0], vn[1], vn[2]],
  ];

  for (let i = 0; i < triangulo.length; i++) {
    let a, b, c;
    [a, b, c] = triangulo[i];
    dividaTriangulo(a, b, c, ndivisoes);
  }
};

function dividaTriangulo(a, b, c, ndivs) {
  // Cada nível quebra um triângulo em 4 subtriângulos
  // a, b, c em ordem mão direita
  //    c
  // a  b 

  // caso base
  if (ndivs > 0) {
    let ab = mix(a, b, 0.5);
    let bc = mix(b, c, 0.5);
    let ca = mix(c, a, 0.5);

    ab = normalize(ab);
    bc = normalize(bc);
    ca = normalize(ca);

    dividaTriangulo(a, ab, ca, ndivs - 1);
    dividaTriangulo(b, bc, ab, ndivs - 1);
    dividaTriangulo(c, ca, bc, ndivs - 1);
    dividaTriangulo(ab, bc, ca, ndivs - 1);
  }

  else {
    insiraTriangulo(a, b, c);
  }
};

function insiraTriangulo(a, b, c) {

  gaPosicoes.push(a);
  gaPosicoes.push(b);
  gaPosicoes.push(c);

  let cor = COR_ESFERA;

  if (!COR_SOLIDA) cor = sorteieCorRGBA();
  gaCores.push(cor);
  if (!COR_SOLIDA) cor = sorteieCorRGBA();
  gaCores.push(cor);
  if (!COR_SOLIDA) cor = sorteieCorRGBA();
  gaCores.push(cor);
}