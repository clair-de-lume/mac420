/*
EP4 de MAC0420/MAC5744 - Simulador de voo

Nome: Luísa Menezes da Costa
NUSP: 12676491

Referências:
- MDN Web Docs
- site WebGL2 Fundamentals
- algumas funções foram retiradas diretamente das notas de aula
*/

"use strict";

// ==================================================================
// constantes globais
const FUNDO = [0.0, 0.5, 0.5, 1.0];
const EIXO_X = 0;
const EIXO_Y = 1;
const EIXO_Z = 2;

//camera
const eye = vec3(400, 500, 500);
const at = vec3(0, 0, 0);
const up = vec3(0, 1, 0);
const FOVY = 60;
const ASPECT = 1;
const NEAR = 0.1;
const FAR = 2000;

// posições dos 8 vértices de um cubo de lado 1
// centrado na origem
const vCubo = [
  vec3(-0.5, -0.5, 0.5),
  vec3(-0.5, 0.5, 0.5),
  vec3(0.5, 0.5, 0.5),
  vec3(0.5, -0.5, 0.5),
  vec3(-0.5, -0.5, -0.5),
  vec3(-0.5, 0.5, -0.5),
  vec3(0.5, 0.5, -0.5),
  vec3(0.5, -0.5, -0.5)
];

// modos de colorir
const CHAO = 0;
const BOLA = 1;
const ALEATORIO = 2;

const N_DIVISOES = 2;
const COR_SOLIDA = false;
const COR_ESFERA = [1.0, 1.0, 0.0, 1.0];

// ==================================================================
// variáveis globais
var gl;
var gCanvas;
var gShader = {};  // encapsula globais do shader

var gaObjetos = [];
var gaPosicoes = [];
var gaCores = [];

// guarda dados da interface e contexto do desenho
var gCtx = {
  axis: 0,   // eixo rodando
  theta: [0, 0, 0],  // angulos por eixo
  pause: true,        // 
  passo: true,
  numV: 36,          // número de vertices
  vista: mat4(),     // view matrix, inicialmente identidade
  perspectiva: mat4(), // projection matrix
};

class Cubo {
  nv = 36;
  pos;
  theta;
  escala;
  vtheta;
  vtrans;

  constructor(pos, theta, escala, vtheta, vtrans, tipo) {
    this.pos = pos;
    this.theta = theta;
    this.escala = escala;
    this.vtheta = vtheta;
    this.vtrans = vtrans;

    this.crieCubo(tipo);
  }

  /**
   *  define as seis faces de um cubo usando os 8 vértices
   */
  crieCubo(tipo) {
    this.quad(1, 0, 3, 2, tipo);
    this.quad(2, 3, 7, 6, tipo);
    this.quad(3, 0, 4, 7, tipo);
    this.quad(4, 5, 6, 7, tipo);
    this.quad(5, 4, 0, 1, tipo);
    this.quad(6, 5, 1, 2, tipo);
  };

  /**
   * recebe 4 indices de vertices de uma face
   * monta os dois triangulos voltados para "fora"
   * 
   * @param {Number} a 
   * @param {Number} b 
   * @param {Number} c 
   * @param {Number} d 
   */
  quad(a, b, c, d, tipo) {
    // vertices
    gaPosicoes.push(vCubo[a]);
    gaPosicoes.push(vCubo[b]);
    gaPosicoes.push(vCubo[c]);
    gaPosicoes.push(vCubo[a]);
    gaPosicoes.push(vCubo[c]);
    gaPosicoes.push(vCubo[d]);

    // cores
    if (tipo == CHAO) {
      // triangulo preto
      gaCores.push(vec4(0.0, 0.0, 0.0, 1.0));
      gaCores.push(vec4(0.0, 0.0, 0.0, 1.0));
      gaCores.push(vec4(0.0, 0.0, 0.0, 1.0));
      // triangulo branco
      gaCores.push(vec4(1.0, 1.0, 1.0, 1.0));
      gaCores.push(vec4(1.0, 1.0, 1.0, 1.0));
      gaCores.push(vec4(1.0, 1.0, 1.0, 1.0));
    }
    else if (tipo == BOLA) {
      console.log("coloriu BOLA");

      // (1,0,0,1) - face +x
      if (a == 1) {
        for (let i = 0; i < 6; i++) {
          gaCores.push(vec4(1.0, 0.0, 0.0, 1.0));
        }
      }
      // (0,1,1,1) - face -x
      else if (a == 2) {
        for (let i = 0; i < 6; i++) {
          gaCores.push(vec4(0.0, 1.0, 1.0, 1.0));
        }
      }
      // (0,1,0,1) - face +y
      else if (a == 3) {
        for (let i = 0; i < 6; i++) {
          gaCores.push(vec4(0.0, 1.0, 0.0, 1.0));
        }
      }
      // (1,0,1,1) - face -y
      else if (a == 4) {
        for (let i = 0; i < 6; i++) {
          gaCores.push(vec4(1.0, 0.0, 1.0, 1.0));
        }
      }
      // (0,0,1,1) - face +z
      else if (a == 5) {
        for (let i = 0; i < 6; i++) {
          gaCores.push(vec4(0.0, 0.0, 1.0, 1.0));
        }
      }
      // (1,1,0,1) - face -z
      else if (a == 6) {
        for (let i = 0; i < 6; i++) {
          gaCores.push(vec4(1.0, 1.0, 0.0, 1.0));
        }
      }
    }

    // sorteia 2 cores aleatorias para os dois triangulos
    // de cada face do cubo
    else {
      let cor1 = sorteia_RGB();
      let cor2 = sorteia_RGB();

      gaCores.push(cor1);
      gaCores.push(cor1);
      gaCores.push(cor1);
      gaCores.push(cor2);
      gaCores.push(cor2);
      gaCores.push(cor2);
    }
  };
}

/* ==================================================================
    Funções para criar uma esfera de raio unitário centrada na origem.
*/

class Esfera {
  nv = 384;       // se N_DIVISOES == 2
  pos;
  theta;
  escala;
  vtheta;
  vtrans;

  constructor(pos, theta, escala, vtheta, vtrans) {
    this.pos = pos;
    this.theta = theta;
    this.escala = escala;
    this.vtheta = vtheta;
    this.vtrans = vtrans;

    this.crieEsfera(N_DIVISOES);
  }

  /**
   * Refina os vértices da esfera recursivamente
   * @param {Number} n - profundidade da recursão
   */
  crieEsfera(ndivisoes = 2) {
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
    this.dividaTriangulo(a, b, c, ndivisoes);
  }
};

  dividaTriangulo(a, b, c, ndivs) {
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

      this.dividaTriangulo(a, ab, ca, ndivs - 1);
      this.dividaTriangulo(b, bc, ab, ndivs - 1);
      this.dividaTriangulo(c, ca, bc, ndivs - 1);
      this.dividaTriangulo(ab, bc, ca, ndivs - 1);
    }

    else {
      this.insiraTriangulo(a, b, c);
    }
  };

  insiraTriangulo(a, b, c) {
    gaPosicoes.push(a);
    gaPosicoes.push(b);
    gaPosicoes.push(c);

    let cor = COR_ESFERA;

    if (!COR_SOLIDA) cor = sorteia_RGB();
    gaCores.push(cor);
    if (!COR_SOLIDA) cor = sorteia_RGB();
    gaCores.push(cor);
    if (!COR_SOLIDA) cor = sorteia_RGB();
    gaCores.push(cor);
  }
}

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

  // cubo CHAO
  let pos = vec3(0, 0, -10);
  let theta = vec3(0, 0, 0);
  let escala = vec3(500, 20, 500);
  let vtheta = vec3(0, 0, 0);
  let vtrans = vec3(0, 0, 0);
  let cubo = new Cubo(pos, theta, escala, vtheta, vtrans, CHAO);
  gaObjetos.push(cubo);

  // cubo BOLA
  pos = vec3(0, 90, 0);
  theta = vec3(0, 0, 0);
  escala = vec3(30, 30, 30);
  vtheta = vec3(0, 0, 0);
  vtrans = vec3(0, 0, 0);
  cubo = new Cubo(pos, theta, escala, vtheta, vtrans, BOLA);
  gaObjetos.push(cubo);

  // cubo aleatorio 1
  pos = vec3(200, 200, 0);
  theta = vec3(0, 0, 0);
  escala = vec3(100, 30, 30);
  vtheta = vec3(0, 0, 0);
  vtrans = vec3(0, 0, 0);
  cubo = new Cubo(pos, theta, escala, vtheta, vtrans, ALEATORIO);
  gaObjetos.push(cubo);

  // cubo aleatorio 2
  pos = vec3(0, 0, 0);
  theta = vec3(0, 0, 0);
  escala = vec3(10, 500, 10);
  vtheta = vec3(0, 0, 0);
  vtrans = vec3(0, 0, 0);
  cubo = new Cubo(pos, theta, escala, vtheta, vtrans, ALEATORIO);
  gaObjetos.push(cubo);

  // esfera 1
  pos = vec3(-200, 200, 0);
  theta = vec3(0, 0, 0);
  escala = vec3(100, 30, 30);
  vtheta = vec3(0, 0, 0);
  vtrans = vec3(0, 0, 0);
  let esfera = new Esfera(pos, theta, escala, vtheta, vtrans);
  gaObjetos.push(esfera);

  // esfera 2
  pos = vec3(150, 30, 140);
  theta = vec3(0, 0, 0);
  escala = vec3(100, 100, 100);
  vtheta = vec3(0, 0, 0);
  vtrans = vec3(0, 0, 0);
  esfera = new Esfera(pos, theta, escala, vtheta, vtrans);
  gaObjetos.push(esfera);

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
  document.getElementById("runButton").onclick = function () {
    gCtx.pause = !gCtx.pause;
    
    let valor = document.getElementById("runButton");
    let passo = document.getElementById("stepButton");
    if (valor.innerHTML == "Executar") {
      valor.innerHTML = "Pausar"
      passo.disabled = true;
      gCtx.passo = false;
    }
    else {
      valor.innerHTML = "Executar"
      passo.disabled = false;
      gCtx.passo = true;
    }
  };

  document.getElementById("stepButton").onclick = function () {
    passo();
  }
}

function crieShaders() {
  //  cria o programa
  gShader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
  gl.useProgram(gShader.program);

  // buffer dos vértices dos cubos
  var bufVertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufVertices);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gaPosicoes), gl.STATIC_DRAW);

  var aPosition = gl.getAttribLocation(gShader.program, "aPosition");
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  // buffer de cores dos cubos
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
  gCtx.perspectiva = perspective(FOVY, ASPECT, NEAR, FAR);
  gl.uniformMatrix4fv(gShader.uPerspective, false, flatten(gCtx.perspectiva));

  // calcula a matriz de transformação da camera, apenas 1 vez
  gCtx.vista = lookAt(eye, at, up);
}

function passo() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // atualiza cubos 
  gaObjetos[0].theta[1] += 1;   // CHAO
  gaObjetos[1].theta[1] -= 1;   // BOLA
  gaObjetos[2].theta[1] += 1;   // CUBO 1
  gaObjetos[3].theta[1] += 1;   // CUBO 2
  gaObjetos[4].theta[1] += 1;   // ESFERA 1  
  gaObjetos[5].theta[1] += 1;   // ESFERA 2  

  desenhaChao();
  desenhaBola();
}

// ==================================================================
/**
 * Usa o shader para desenhar.
 * Assume que os dados já foram carregados e são estáticos.
 */
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  desenhaChao();
  desenhaBola();
  desenhaCubo1();
  desenhaCubo2();
  desenhaEsfera1();
  desenhaEsfera2();
  window.requestAnimationFrame(render);
}

function desenhaChao() {
  // modelo muda a cada frame da animação
  if (!gCtx.pause) gaObjetos[0].theta[1] += 1;

  // rotacao apenas no eixo y
  let ry = rotateY(gaObjetos[0].theta[EIXO_Y]);

  // escala
  let s = scale(gaObjetos[0].escala[0], gaObjetos[0].escala[1], gaObjetos[0].escala[2]);
  
  // translacao
  let t = translate(gaObjetos[0].pos[0], gaObjetos[0].pos[1], gaObjetos[0].pos[2]);
    
  //let model = mult(t, mult(s, mult(rz, mult(ry, rx))));
  let model = mult(t, mult(s, ry));

  gl.uniformMatrix4fv(gShader.uModelView, false, flatten(mult(gCtx.vista, model)));
  gl.drawArrays(gl.TRIANGLES, 0, gCtx.numV);
}

function desenhaBola() {
  // modelo muda a cada frame da animação
  if (!gCtx.pause) gaObjetos[1].theta[1] -= 1;

  // rotacao em cada eixo
  let rx = rotateX(gaObjetos[1].theta[EIXO_X]);
  let ry = rotateY(gaObjetos[1].theta[EIXO_Y]);
  let rz = rotateZ(gaObjetos[1].theta[EIXO_Z]);

  // escala
  let s = scale(gaObjetos[1].escala[0], gaObjetos[1].escala[1], gaObjetos[1].escala[2]);
  
  // translacao
  let t = translate(gaObjetos[1].pos[0], gaObjetos[1].pos[1], gaObjetos[1].pos[2]);
    
  //let model = mult(t, mult(s, mult(rz, mult(ry, rx))));
  let model = mult(t, mult(s, ry));

  gl.uniformMatrix4fv(gShader.uModelView, false, flatten(mult(gCtx.vista, model)));
  gl.drawArrays(gl.TRIANGLES, 36, gCtx.numV);
}

function desenhaCubo1() {
  // modelo muda a cada frame da animação
  if (!gCtx.pause) gaObjetos[2].theta[1] -= 1;

  // rotacao em cada eixo
  let rx = rotateX(gaObjetos[2].theta[EIXO_X]);
  let ry = rotateY(gaObjetos[2].theta[EIXO_Y]);
  let rz = rotateZ(gaObjetos[2].theta[EIXO_Z]);

  // escala
  let s = scale(gaObjetos[2].escala[0], gaObjetos[2].escala[1], gaObjetos[2].escala[2]);
  
  // translacao
  let t = translate(gaObjetos[2].pos[0], gaObjetos[2].pos[1], gaObjetos[2].pos[2]);
    
  //let model = mult(t, mult(s, mult(rz, mult(ry, rx))));
  let model = mult(t, mult(s, ry));

  gl.uniformMatrix4fv(gShader.uModelView, false, flatten(mult(gCtx.vista, model)));
  gl.drawArrays(gl.TRIANGLES, 72, gCtx.numV);
}

function desenhaCubo2() {
  // modelo muda a cada frame da animação
  if (!gCtx.pause) gaObjetos[3].theta[1] -= 1;

  // rotacao em cada eixo
  let rx = rotateX(gaObjetos[3].theta[EIXO_X]);
  let ry = rotateY(gaObjetos[3].theta[EIXO_Y]);
  let rz = rotateZ(gaObjetos[3].theta[EIXO_Z]);

  // escala
  let s = scale(gaObjetos[3].escala[0], gaObjetos[3].escala[1], gaObjetos[3].escala[2]);
  
  // translacao
  let t = translate(gaObjetos[3].pos[0], gaObjetos[3].pos[1], gaObjetos[3].pos[2]);
    
  //let model = mult(t, mult(s, mult(rz, mult(ry, rx))));
  let model = mult(t, mult(s, ry));

  gl.uniformMatrix4fv(gShader.uModelView, false, flatten(mult(gCtx.vista, model)));
  gl.drawArrays(gl.TRIANGLES, 108, gCtx.numV);
}

function desenhaEsfera1() {
  // modelo muda a cada frame da animação
  if (!gCtx.pause) gaObjetos[4].theta[1] += 1;

  // rotacao apenas no eixo y
  let ry = rotateY(gaObjetos[4].theta[EIXO_Y]);

  // escala
  let s = scale(gaObjetos[4].escala[0], gaObjetos[4].escala[1], gaObjetos[4].escala[2]);
  
  // translacao
  let t = translate(gaObjetos[4].pos[0], gaObjetos[4].pos[1], gaObjetos[4].pos[2]);
    
  //let model = mult(t, mult(s, mult(rz, mult(ry, rx))));
  let model = mult(t, mult(s, ry));

  gl.uniformMatrix4fv(gShader.uModelView, false, flatten(mult(gCtx.vista, model)));
  gl.drawArrays(gl.TRIANGLES, 144, gaObjetos[4].nv);
}

function desenhaEsfera2() {
  // modelo muda a cada frame da animação
  if (!gCtx.pause) gaObjetos[5].theta[1] += 1;

  // rotacao apenas no eixo y
  let ry = rotateX(gaObjetos[5].theta[EIXO_Y]);

  // escala
  let s = scale(gaObjetos[5].escala[0], gaObjetos[5].escala[1], gaObjetos[5].escala[2]);
  
  // translacao
  let t = translate(gaObjetos[5].pos[0], gaObjetos[5].pos[1], gaObjetos[5].pos[2]);
    
  //let model = mult(t, mult(s, mult(rz, mult(ry, rx))));
  let model = mult(t, mult(s, ry));

  gl.uniformMatrix4fv(gShader.uModelView, false, flatten(mult(gCtx.vista, model)));
  gl.drawArrays(gl.TRIANGLES, 528, gaObjetos[5].nv);
}

// ========================================================
// Código fonte dos shaders em GLSL
// a primeira linha deve conter "#version 300 es"
// para WebGL 2.0

var gVertexShaderSrc = `#version 300 es

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

var gFragmentShaderSrc = `#version 300 es

precision highp float;

in vec4 vColor;
out vec4 outColor;

void main() {
  outColor = vColor;
}
`;

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