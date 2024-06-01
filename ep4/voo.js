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

// modos de colorir objetos da classe Cubo
const CHAO = 0;
const BOLA = 1;
const ALEATORIO = 2;

// constantes uteis para classe Esfera
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
  pause: true,        // 
  vista: mat4(),     // view matrix, inicialmente identidade
  perspectiva: mat4(), // projection matrix
};

// ========================================================
// Geração do modelo de um cubo de lado unitário
// ========================================================
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
      // (1,0,0,1) - face +x - vermelho
      if (a == 1) {
        for (let i = 0; i < 6; i++) {
          gaCores.push(vec4(1.0, 0.0, 0.0, 1.0));
        }
      }
      // (0,1,0,1) - face +y - verde
      else if (a == 2) {
        for (let i = 0; i < 6; i++) {
          gaCores.push(vec4(0.0, 1.0, 0.0, 1.0));
        }
      }
      // (1,0,1,1) - face -y - magenta
      else if (a == 3) {
        for (let i = 0; i < 6; i++) {
          gaCores.push(vec4(1.0, 0.0, 1.0, 1.0));
        }
      }
      // (0,1,1,1) - face -x - ciano
      else if (a == 4) {
        for (let i = 0; i < 6; i++) {
          gaCores.push(vec4(0.0, 1.0, 1.0, 1.0));
        }
      }
      // (1,1,0,1) - face -z - amarelo
      else if (a == 5) {
        for (let i = 0; i < 6; i++) {
          gaCores.push(vec4(1.0, 1.0, 0.0, 1.0));
        }
      }
      // (0,0,1,1) - face +z - azul
      else if (a == 6) {
        for (let i = 0; i < 6; i++) {
          gaCores.push(vec4(0.0, 0.0, 1.0, 1.0));
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
    Classe para criar uma esfera de raio unitário centrada na origem.
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

  /**
   * coloca os vertices do triangulo atual nos
   * arrays globais de posicao e de cores
   * @param {Number} a - vertice do triangulo
   * @param {Number} b - vertice do triangulo
   * @param {Number} c - vertice do triangulo
   */
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
  let vtheta = vec3(0, 0.2, 0);
  let vtrans = vec3(0, 0, 0);
  let cubo = new Cubo(pos, theta, escala, vtheta, vtrans, CHAO);
  gaObjetos.push(cubo);
  console.log("Cubo num vertices:", cubo.nv);
  console.log("Cena vertices após cubo 0:", gaPosicoes.length)

  // cubo BOLA
  pos = vec3(0, 90, 0);
  theta = vec3(0, 0, 0);
  escala = vec3(30, 30, 30);
  vtheta = vec3(0, 0, 0);
  vtrans = vec3(0, 0, 0);
  cubo = new Cubo(pos, theta, escala, vtheta, vtrans, BOLA);
  gaObjetos.push(cubo);
  console.log("Cubo num vertices:", cubo.nv);
  console.log("Cena vertices após cubo 1:", gaPosicoes.length)

  // CUBO1
  pos = vec3(200, 200, 0)
  theta = vec3(0, 0, 0);
  escala = vec3(100, 30, 30);
  vtheta = vec3(0, 1, 0);
  vtrans = vec3(-1, 0, 1);
  cubo = new Cubo(pos, theta, escala, vtheta, vtrans, ALEATORIO);
  gaObjetos.push(cubo);
  console.log("Cubo num vertices:", cubo.nv);
  console.log("Cena vertices após cubo 2:", gaPosicoes.length)

  // CUBO2
  pos = vec3(0, 0, 0);
  theta = vec3(50, 0, 0);
  escala = vec3(10, 500, 10);
  vtheta = vec3(0, 1, 0);
  vtrans = vec3(0, 0, 0);
  cubo = new Cubo(pos, theta, escala, vtheta, vtrans, ALEATORIO);
  gaObjetos.push(cubo);
  console.log("Cubo num vertices:", cubo.nv);
  console.log("Cena vertices após cubo 3:", gaPosicoes.length)

  // ESFERA1
  pos = vec3(-200, 200, 0);
  theta = vec3(0, 0, 0);
  escala = vec3(100, 30, 30);
  vtheta = vec3(1, 0, 0);
  vtrans = vec3(0, -1, 0);
  let esfera = new Esfera(pos, theta, escala, vtheta, vtrans);
  gaObjetos.push(esfera);
  console.log("Esfera num vertices:", esfera.nv);
  console.log("Cena vertices após esfera 0:", gaPosicoes.length)

  // ESFERA2
  pos = vec3(150, 30, 140);
  theta = vec3(0, 0, 0);
  escala = vec3(100, 100, 100);
  vtheta = vec3(.2, .2, .2);
  vtrans = vec3(0, 0, 0);
  esfera = new Esfera(pos, theta, escala, vtheta, vtrans);
  gaObjetos.push(esfera);
  console.log("Esfera num vertices:", esfera.nv);
  console.log("Cena vertices após esfera 1:", gaPosicoes.length)

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
      console.log("Pausado:", gCtx.passo)
    }
    else {
      valor.innerHTML = "Executar"
      passo.disabled = false;
      gCtx.passo = true;
      console.log("Pausado:", gCtx.passo)
    }
  };

  document.getElementById("stepButton").onclick = function () {
    console.log("Clicou em passo:", true);
    passo();
  }

  window.onkeydown = callbackKeyDown;
}

// ==================================================================
/**
 * Define as atualizacoes da camera de acordo com a tecla pressionada
 */
function callbackKeyDown(e) {
  let tecla = e.key;
  if  (tecla == "J" || tecla == "j") {
    console.log("Tecla J - vel--");
  }
  else if  (tecla == "K" || tecla == "k") {
    console.log("Tecla K - zera vtrans");
  }
  else if  (tecla == "L" || tecla == "l") {
    console.log("Tecla L - vel++");
  }
  else if  (tecla == "W" || tecla == "w") {
    console.log("Tecla W - rot para cima");
  }
  else if  (tecla == "X" || tecla == "x") {
    console.log("Tecla X- rot para baixo");
  }
  else if  (tecla == "A" || tecla == "a") {
    console.log("Tecla A - rot para esq");
  }
  else if  (tecla == "D" || tecla == "d") {
    console.log("Tecla D - rot para dir");
  }
  else if  (tecla == "Z" || tecla == "z") {
    console.log("Tecla Z - rot anti horario");
  }
  else if  (tecla == "C" || tecla == "c") {
    console.log("Tecla C - rot horario");
  }
}

// ==================================================================
/**
 * cria e configura os shaders
 */
function crieShaders() {
  //  cria o programa
  gShader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
  gl.useProgram(gShader.program);

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
  gCtx.perspectiva = perspective(FOVY, ASPECT, NEAR, FAR);
  gl.uniformMatrix4fv(gShader.uPerspective, false, flatten(gCtx.perspectiva));

  // calcula a matriz de transformação da camera, apenas 1 vez
  gCtx.vista = lookAt(eye, at, up);
}

/*
 * Funcao callback chamada ao apertar o botão Passo. Atualiza os elementos
 * apenas 1 vez e depois desenha cada um deles
 */
function passo() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // atualiza cubos 
  atualizaChao();
  atualizaCubo1();
  atualizaCubo2();

  // atualiza esferas
  atualizaEsfera1(); 
  atualizaEsfera2();

  // desenha objetos
  desenhaChao();
  desenhaBola();
  desenhaCubo1();
  desenhaCubo2();
  desenhaEsfera1();
  desenhaEsfera2();
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

// ==================================================================
/**
 * Atualiza o estado do cubo CHAO
 */
function atualizaChao() {
  // atualiza rotacao de CHAO
  gaObjetos[0].theta[EIXO_Y] += gaObjetos[0].vtheta[EIXO_Y];
}

// ==================================================================
/**
 * Desenha o estado atual do cubo CHAO
 */
function desenhaChao() {
  // modelo muda a cada frame da animação
  if (!gCtx.pause) atualizaChao();

  // rotacao apenas no eixo y
  let ry = rotateY(gaObjetos[0].theta[EIXO_Y]);

  // escala
  let s = scale(gaObjetos[0].escala[0], gaObjetos[0].escala[1], gaObjetos[0].escala[2]);
  
  // translacao
  let t = translate(gaObjetos[0].pos[0], gaObjetos[0].pos[1], gaObjetos[0].pos[2]);
    
  let model = mult(t, mult(s, ry));

  gl.uniformMatrix4fv(gShader.uModelView, false, flatten(mult(gCtx.vista, model)));
  gl.drawArrays(gl.TRIANGLES, 0, gaObjetos[0].nv);
}

// ==================================================================
/**
 * Desenha o estado atual do cubo BOLA
 */
function desenhaBola() {
  // escala
  let s = scale(gaObjetos[1].escala[0], gaObjetos[1].escala[1], gaObjetos[1].escala[2]);
  
  // translacao
  let t = translate(gaObjetos[1].pos[0], gaObjetos[1].pos[1], gaObjetos[1].pos[2]);
    
  let model = mult(t, s);

  gl.uniformMatrix4fv(gShader.uModelView, false, flatten(mult(gCtx.vista, model)));
  gl.drawArrays(gl.TRIANGLES, 36, gaObjetos[1].nv);
}

// ==================================================================
/**
 * Atualiza o estado do CUBO1
 */
function atualizaCubo1() {
  // atualiza rotacao do cubo 1
  gaObjetos[2].theta[EIXO_Y] += gaObjetos[2].vtheta[EIXO_Y];

  // atualiza posicao do cubo 1
  gaObjetos[2].pos[EIXO_X] += gaObjetos[2].vtrans[EIXO_X];
  gaObjetos[2].pos[EIXO_Z] += gaObjetos[2].vtrans[EIXO_Z];

  // garante que cubo 1 esteja sempre no intervalo (200, 200, 0)
  // ate (0, 200, 200)
  if (gaObjetos[2].pos[EIXO_X] <= 0) {
    gaObjetos[2].vtrans[EIXO_X] = -gaObjetos[2].vtrans[EIXO_X];
  }
  if (gaObjetos[2].pos[EIXO_X] >= 200) {
    gaObjetos[2].vtrans[EIXO_X] = -gaObjetos[2].vtrans[EIXO_X];
  }
  if (gaObjetos[2].pos[EIXO_Z] >= 200) {
    gaObjetos[2].vtrans[EIXO_Z] = -gaObjetos[2].vtrans[EIXO_Z];
  }
  if (gaObjetos[2].pos[EIXO_Z] <= 0) {
    gaObjetos[2].vtrans[EIXO_Z] = -gaObjetos[2].vtrans[EIXO_Z];
  }
}
// ==================================================================
/**
 * Desenha o estado atual do CUBO1
 */
function desenhaCubo1() {
  // modelo muda a cada frame da animação
  if (!gCtx.pause) atualizaCubo1();

  // rotacao apenas no eixo Y
  let ry = rotateY(gaObjetos[2].theta[EIXO_Y]);

  // escala
  let s = scale(gaObjetos[2].escala[0], gaObjetos[2].escala[1], gaObjetos[2].escala[2]);
  
  // translacao
  let t = translate(gaObjetos[2].pos[0], gaObjetos[2].pos[1], gaObjetos[2].pos[2]);
    
  let model = mult(t, mult(s, ry));

  gl.uniformMatrix4fv(gShader.uModelView, false, flatten(mult(gCtx.vista, model)));
  gl.drawArrays(gl.TRIANGLES, 72, gaObjetos[2].nv);
}

// ==================================================================
/**
 * Atualiza o estado do CUBO2
 */
function atualizaCubo2() {
  // atualiza rotacao do cubo2
  gaObjetos[3].theta[EIXO_Y] += gaObjetos[3].vtheta[EIXO_Y];
}

// ==================================================================
/**
 * Desenha o estado atual do CUBO2
 */
function desenhaCubo2() {
  // modelo muda a cada frame da animação
  if (!gCtx.pause) atualizaCubo2();

  // rotacao apenas no eixo Y
  let ry = rotateY(gaObjetos[3].theta[EIXO_Y]);

  // escala
  let s = scale(gaObjetos[3].escala[0], gaObjetos[3].escala[1], gaObjetos[3].escala[2]);
  
  // translacao
  let t = translate(gaObjetos[3].pos[0], gaObjetos[3].pos[1], gaObjetos[3].pos[2]);
    
  let model = mult(t, mult(s, ry));

  gl.uniformMatrix4fv(gShader.uModelView, false, flatten(mult(gCtx.vista, model)));
  gl.drawArrays(gl.TRIANGLES, 108, gaObjetos[3].nv);
}

// ==================================================================
/**
 * Atualiza o estado de ESFERA1
 */
function atualizaEsfera1() {
  // atualiza rotacao de esfera1
  gaObjetos[4].theta[EIXO_X] += gaObjetos[4].vtheta[EIXO_X]

  // atualiza posicao de esfera1
  gaObjetos[4].pos[EIXO_Y] += gaObjetos[4].vtrans[EIXO_Y];

  // garante que esfera 1 esteja sempre no intervalo (-200, 200, 0)
  // ate (-200, -50, 200)
  if (gaObjetos[4].pos[EIXO_Y] <= -50) {
    gaObjetos[4].vtrans[EIXO_Y] = -gaObjetos[4].vtrans[EIXO_Y];
  }
  if (gaObjetos[4].pos[EIXO_Y] >= 200) {
    gaObjetos[4].vtrans[EIXO_Y] = -gaObjetos[4].vtrans[EIXO_Y];
  }
}

// ==================================================================
/**
 * Desenha o estado atual da ESFERA1
 */
function desenhaEsfera1() {
  // modelo muda a cada frame da animação
  if (!gCtx.pause) atualizaEsfera1();

  // rotacao apenas no eixo x
  let rx = rotateX(gaObjetos[4].theta[EIXO_X])

  // escala
  let s = scale(gaObjetos[4].escala[0], gaObjetos[4].escala[1], gaObjetos[4].escala[2]);
  
  // translacao
  let t = translate(gaObjetos[4].pos[0], gaObjetos[4].pos[1], gaObjetos[4].pos[2]);
    
  let model = mult(t, mult(s, rx));

  gl.uniformMatrix4fv(gShader.uModelView, false, flatten(mult(gCtx.vista, model)));
  gl.drawArrays(gl.TRIANGLES, 144, gaObjetos[4].nv);
}

// ==================================================================
/**
 * Atualiza o estado de ESFERA2
 */
function atualizaEsfera2() {
  // atualiza rotacao de esfera2
  gaObjetos[5].theta[EIXO_X] += gaObjetos[5].vtheta[EIXO_X];
  gaObjetos[5].theta[EIXO_Y] += gaObjetos[5].vtheta[EIXO_Y];
  gaObjetos[5].theta[EIXO_Z] += gaObjetos[5].vtheta[EIXO_Z];
}

// ==================================================================
/**
 * Desenha o estado atual da ESFERA2
 */
function desenhaEsfera2() {
  // modelo muda a cada frame da animação
  if (!gCtx.pause) atualizaEsfera2();

  // rotacao em todos os eixos
  let rx = rotateX(gaObjetos[5].theta[EIXO_X]);
  let ry = rotateY(gaObjetos[5].theta[EIXO_Y]);
  let rz = rotateZ(gaObjetos[5].theta[EIXO_Z]);

  // escala
  let s = scale(gaObjetos[5].escala[0], gaObjetos[5].escala[1], gaObjetos[5].escala[2]);
  
  // translacao
  let t = translate(gaObjetos[5].pos[0], gaObjetos[5].pos[1], gaObjetos[5].pos[2]);
    
  let model = mult(t, mult(s, mult(rz, mult(rx, ry))));

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