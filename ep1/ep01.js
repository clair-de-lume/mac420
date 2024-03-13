/* ==================================================
        cronometro.js

        Nome: Luísa Menezes da Costa
        NUSP: 12676491

        Ao preencher esse cabeçalho com o meu nome e o meu número USP,
        declaro que todas as partes originais desse exercício programa (EP)
        foram desenvolvidas e implementadas por mim e que portanto não 
        constituem desonestidade acadêmica ou plágio.
        Declaro também que sou responsável por todas as cópias desse
        programa e que não distribui ou facilitei a sua distribuição.
        Estou ciente que os casos de plágio e desonestidade acadêmica
        serão tratados segundo os critérios divulgados na página da 
        disciplina.
        Entendo que EPs sem assinatura devem receber nota zero e, ainda
        assim, poderão ser punidos por desonestidade acadêmica.

        Abaixo descreva qualquer ajuda que você recebeu para fazer este
        EP.  Inclua qualquer ajuda recebida por pessoas (inclusive
        monitores e colegas). Com exceção de material da disciplina, caso
        você tenha utilizado alguma informação, trecho de código,...
        indique esse fato abaixo para que o seu programa não seja
        considerado plágio ou irregular.

        Exemplo:

            A minha função quicksort() foi baseada na descrição encontrada na 
            página https://www.ime.usp.br/~pf/algoritmos/aulas/quick.html.

        Descrição de ajuda ou indicação de fonte:
        - site MDN Web Docs para sanar dúvidas de JS/CSS/HTML (https://developer.mozilla.org/pt-BR/)
    ================================================== */

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
  diferenca: 0,
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
  gInterface.pause = document.getElementById('btPause');
  gInterface.modo = document.getElementById('btModo');

  // numeric keypad
  gInterface.zero = document.getElementById('bt0');
  gInterface.um = document.getElementById('bt1');
  gInterface.dois = document.getElementById('bt2');
  gInterface.tres = document.getElementById('bt3');
  gInterface.quatro = document.getElementById('bt4');
  gInterface.cinco = document.getElementById('bt5');
  gInterface.seis = document.getElementById('bt6');
  gInterface.sete = document.getElementById('bt7');
  gInterface.oito = document.getElementById('bt8');
  gInterface.nove = document.getElementById('bt9');

  // relogios
  gInterface.clock = document.getElementById('clock');
  gInterface.clock2 = document.getElementById('secondary-clock');

  // registro das funções de callback
  gInterface.start.onclick = callbackStart;
  gInterface.pause.onclick = callbackPause;
  gInterface.reset.onclick = callbackReset;
  gInterface.modo.onclick = callbackModo;
  
  gInterface.zero.onclick = callbackTecla;
  gInterface.um.onclick = callbackTecla;
  gInterface.dois.onclick = callbackTecla;
  gInterface.tres.onclick = callbackTecla;
  gInterface.quatro.onclick = callbackTecla;
  gInterface.cinco.onclick = callbackTecla;
  gInterface.seis.onclick = callbackTecla;
  gInterface.sete.onclick = callbackTecla;
  gInterface.oito.onclick = callbackTecla;
  gInterface.nove.onclick = callbackTecla;
}

/**
 * callbackStart
 */
function callbackStart(e) {
  let v = gInterface.start.value;
  let u = gInterface.pause.value;
  let m = gInterface.modo.value;

  if (gInterface.clock2.innerHTML == "00 : 00"){
    console.log("Nenhum tempo inserido!")
  }

  else if (m == "Crono") {
    if (v == "Start") {
      normalizaTempo();
      console.log("Relógio está rodando ... ")
      gInterface.start.value = 'Stop';
      gInterface.diferenca = transformaTempo();
      let now = Date.now();
      gInterface.inicio = now;
    }
    else {
      if (u != "Run") {
        console.log("Relógio foi parado.");
        gInterface.start.value = 'Start';
      }
      else {
        console.log("tecla desabilitada");
      }
    }
  }
  else {
    if (v == "Start") {
      normalizaTempo();
      console.log("Relógio está rodando ... ")
      gInterface.start.value = 'Stop';
      let now = Date.now();
      gInterface.inicio = now + transformaTempo();
    }
    else {
      if (u != "Run") {
        console.log("Relógio foi parado.");
        gInterface.start.value = 'Start';
      }
      else {
        console.log("tecla desabilitada");
      }
    }
  }
}

function callbackReset(e) {
  if (!desabilitado()) {
    console.log("CL: cl 0");
    gInterface.clock2.innerHTML = "00 : 00";
  }
}

function callbackPause(e) {
  let v = gInterface.start.value;
  let u = gInterface.pause.value;

  if (v == "Stop") {
    if (u == "Pause") {
      console.log("pausado");
      gInterface.pause.value = "Run";
      gInterface.tempoPausado = Date.now();
    } 
    else {
      console.log("rodando");
      gInterface.pause.value = "Pause";
      gInterface.inicio += Date.now() - gInterface.tempoPausado;
    }
  }
  else {
    console.log("tecla desabilitada");  
  }
}

function callbackModo(e) {
  let a = gInterface.modo.value;

  if (!desabilitado()) {
    if (a == "Crono") {
      console.log("Modo Timer habilitado");
      gInterface.modo.value = "Timer";
    }
  
    else {
      console.log("Modo Cronômetro habilitado");
      gInterface.modo.value = "Crono"
    }
  }
  else {
    console.log ('tecla desabilitada');
  }
}

function callbackTecla(e) {
  let valor = e.target.value;
  if (!desabilitado()) {
    somaRelogio(valor);
  }
  else {
    console.log("tecla desabilitada");
  }
}

/**
 * animação
 */
function gereProximoQradro(e) {
  let v = gInterface.start.value;
  let u = gInterface.pause.value;
  let m = gInterface.modo.value;
  let w = gInterface.diferenca;

  if (m == "Crono") {
    // condicoes para animacao: nao deu stop, nao chegou no tempo e nao pausado
    if (v == 'Stop' && !pausado()) {
      let now = Date.now();
      let dt = now - gInterface.inicio;
  
      if (dt <= w) {
        let ms = Math.floor(dt / 10) % 100;
        dt = Math.floor(dt / 1000);
        let mm = Math.floor(dt / 60);
        let ss = dt - mm * 60;
        gInterface.clock.innerHTML = f2(mm) + ' : ' + f2(ss) + ' : ' + f2(ms);
      }
      else {
        gInterface.start.value = "Start";
        gInterface.clock.innerHTML = gInterface.clock2.innerHTML + " : 00"; // sem essa linha, o relogio para em XX : XX : 99 sempre
      }
    }  
  }
  else {
    if (v == 'Stop' && !pausado()) {
      let now = Date.now();
      let dt = gInterface.inicio - now;
  
      if (dt >= 0) {
        let ms = Math.floor(dt / 10) % 100;
        dt = Math.floor(dt / 1000);
        let mm = Math.floor(dt / 60);
        let ss = dt - mm * 60;
        gInterface.clock.innerHTML = f2(mm) + ' : ' + f2(ss) + ' : ' + f2(ms);
      }
      else {
        gInterface.start.value = "Start";
        gInterface.clock.innerHTML = gInterface.clock2.innerHTML + " : 00";
      }
    }
  }
  // pede para gerar o próximo quadro, eternamente...   
  window.requestAnimationFrame(gereProximoQradro);
}

/**
 * 
 * checa se o relogio está contando ou está pausado
*/
function desabilitado() {
  let v = gInterface.start.value;
  let u = gInterface.pause.value;

  return (v == "Stop" || u == "Run")
}

/**
 * 
 * checa se o cronometro começou a contar, mas
 * foi pausado com a tecla Pause
*/
function pausado() {
  let v = gInterface.start.value;
  let u = gInterface.pause.value;

  return (v == 'Stop' && u == 'Run')
}

/**
 * 
 * seta o tempo no relogio secundario (minutos e/ou segundos)
 * para 59 se um valor fora do intervalo [0, 59] for
 * digitado
*/
function normalizaTempo() {
  let v = gInterface.clock2.innerHTML;
  let min = parseInt(v.slice(0,2));
  let seg = parseInt(v.slice(5,7));

  if (min <= 59 && seg <= 59) {
    return;
  }
  if (min > 59 && seg > 59) {
    gInterface.clock2.innerHTML = "59 : 59"
  }
  if (min > 59 && seg <= 59) {
    gInterface.clock2.innerHTML = "59 : " + v.slice(5, 7);
  }
  if (seg > 59 && min <= 59) {
    gInterface.clock2.innerHTML = v.slice(0, 2) + " : 59"
  }
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
 * 0123456
 * 00 : 00
 */
function somaRelogio(x) {
  let v = gInterface.clock2.innerHTML;
  tempo = v.slice(0, 2) + v.slice(5,7);
  tempo = tempo + x;
  result = tempo.slice(1, 5);
  gInterface.clock2.innerHTML = result.slice(0, 2) + " : " + result.slice(2,4);
  console.log("Botão:", x, result.slice(0,2)+result.slice(2,4))
}

/**
 * 
 * transforma tempo inserido no relogio secundario
 * em tempo em milissegundos
 */
function transformaTempo() {
  let v = gInterface.clock2.innerHTML;
  let min = parseInt(v.slice(0, 2));
  let seg = parseInt(v.slice(5, 7));

  return (min * 60 * 1000 + seg * 1000);

}