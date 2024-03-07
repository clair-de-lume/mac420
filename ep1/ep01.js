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
  tempoPausado: 0,
  fim: 0,
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

  // numeric keypad
  gInterface.nove = document.getElementById('bt9');
  gInterface.oito = document.getElementById('bt8');

  // campos de texto
  gInterface.clock = document.getElementById('clock');
  gInterface.clock2 = document.getElementById('secondary-clock');

  // registro das funções de callback
  gInterface.start.onclick = callbackStart;
  gInterface.reset.onclick = callbackReset;
  
  // clicar botoes de numero
  gInterface.nove.onclick = callbackNove;
  gInterface.oito.onclick = callbackOito;
}

/**
 * callbackStart
 */

function callbackStart(e) {
  let v = gInterface.start.value;
  //console.log("cronometro 1:", gInterface.inicio);
  
  if (v == "Start") {
    console.log("Relógio está rodando ... ")
    gInterface.start.value = 'Stop';
    gInterface.inicio = Date.now() - gInterface.tempoPausado; 
    let tempo = pegaTempo();
    gInterface.fim = gInterface.inicio + tempo;
  }
  else {
    console.log("Relógio foi parado.");
    gInterface.start.value = 'Start';
    gInterface.tempoPausado = Date.now() - gInterface.inicio;
    //console.log("tempo pausado:", gInterface.tempoPausado)
  }
}

function callbackReset(e) {
  let v = gInterface.start.value;

  if (v == "Start") {
    //gInterface.inicio = Date.now();
    gInterface.clock.innerHTML = "00 : 00 : 00";
    gInterface.clock2.innerHTML = "00:00"
    gInterface.tempoPausado = 0;
  }
}

function callbackOito(e) {
  somaRelogio('8');
}

function callbackNove(e) {
  somaRelogio('9');
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
  if (checaTempo2()) {
    window.requestAnimationFrame(gereProximoQradro);
  }
}

function checaTempo2() {
  let u = gInterface.clock.innerHTML;
  let v = gInterface.clock2.innerHTML;
  v.append(":00");
  
  return (u != v);
}

/**
 * 
 * checa se o relogio principal já alcançou
 * o tempo solicitado
 */
function checaTempo(mm, ss, ms) {
  let v = gInterface.clock2.innerHTML;
  let min = v.slice(0,2);
  let seg = v.slice(2,5);
  console.log("min:", min);

  if (min.charAt(0) == '0') {
    min = min.slice(0);
  }
  if (seg.charAt(0) == '0') {
    seg = seg.slice(0);
  }
  console.log("min:", min);

  min = parseInt(min);
  seg = parseInt(seg);
  console.log("mm : ss : ms: ", )
  console.log("min:", min);

  return (min == mm && seg == ss && ms == "00");
}

/**
 * 
 * recebe um inteiro com até dois dígitos
 * retorna uma string com zeros a esquerda.
 */
function f2(x) {
  return ('00' + x).slice(-2);
}

/**
 * 
 * concatena o novo valor aos valores ja existentes 
 * no relogio ao pressionar nova tecla
 */
function somaRelogio(x) {
  console.log("a tecla", x, "foi apertada!")
  let v = gInterface.clock2.innerHTML;
  tempo = v.slice(0, 2) + v.slice(3,5);
  tempo = tempo + x;
  result = tempo.slice(1, 5);
  gInterface.clock2.innerHTML = result.slice(0, 2) + ":" + result.slice(2,4);
  console.log("display secundário", gInterface.clock2.innerHTML)
}