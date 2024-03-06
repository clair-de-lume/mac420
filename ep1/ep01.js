/* =====================================================
    lab01 - cronômetro

    Autor: Carlos Hitoshi Morimoto
    Data:  01.MAR.2024

    O objetivo desse laboratório é explorar um pouco
    os conceitos de HTML + CSS + Javascript.

    Esse exemplo para entender como funciona uma animação
    quadro a quadro usando o comando

    window.requestAnimationFrame( nome_funcao );
    
   ================================================== */

// A `main()` só deve ser executada quando tudo estiver carregado
window.onload = main;

/* ==================================================================
    constantes e variáveis globais
*/

// notação constantes em letras maiúsculas
const MSG = 'Exemplo de animação: cronômetro';

// notação g minúscula para variável global
// a Interface vai conter os elementos da interface
// para facilitar a organização do código
var gInterface = {
  inicio: 0,
};

/* ==================================================================
    função main
*/

function main() {
  // use o console para exibir mensagens
  console.log(MSG);

  construaInterface();

  gereProximoQradro();  // inicia o ciclo de animação quadro a quadro
};

/**
 * Registra os elementos HTML responsáveis pela interação no objeto
 * interface e os associa às rotinas de callback.
 */
function construaInterface() {
  // monta estrutura com os elementos da interface

  // botões
  gInterface.start = document.getElementById('btStart');
  gInterface.reset = document.getElementById('btReset');

  // campos de texto
  gInterface.clock = document.getElementById('clock');

  // registro das funções de callback
  gInterface.start.onclick = callbackStart;
  gInterface.reset.onclick = callbackReset;
}

/**
 * callbackStart
 */

function callbackStart(e) {
  let v = gInterface.start.value;

  if (v == "Start") {
    console.log("Relógio está rodando ... ")
    gInterface.start.value = 'Stop'; // botão muda seu valor
    gInterface.inicio = Date.now();
  }
  else {
    gInterface.start.value = 'Start'; // botão muda seu valor
    console.log("Relógio foi parado.")
  }
}

function callbackReset(e) {
  let v = gInterface.start.value;

  if (v == "Start") {
    gInterface.inicio = Date.now();
    gInterface.clock.innerHTML = "00 : 00 : 00"
  }
}

/**
 * animação
 */
function gereProximoQradro(e) {
  let v = gInterface.start.value;

  if (v == 'Stop') {
    let now = Date.now();
    let dt = now - gInterface.inicio;

    let ms = Math.floor(dt / 10) % 100;
    dt = Math.floor(dt / 1000);
    let mm = Math.floor(dt / 60);
    let ss = dt - mm * 60;
    gInterface.clock.innerHTML = f2(mm) + ' : ' + f2(ss) + ' : ' + f2(ms)
  }
  // pede para gerar o próximo quadro, eternamente...
  window.requestAnimationFrame(gereProximoQradro);
}

/**
 * 
 * recebe um inteiro com até dois dígitos
 * retorna uma string com zeros a esquerda.
 */
function f2(x) {
  return ('00' + x).slice(-2);
}
