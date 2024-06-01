# EP4 de MAC0420 - Simulador de Voo

## Objetivo
O objetivo deste exercício-programa é aprender como implementar formas primitivas (cubos e esferas) em WebGL2 e aplicar a elas transformações (translação, rotação e escala), como visto em aula.

## Como rodar o programa
Dentro de uma pasta contendo os arquivo "voo.js" e "voo.html", abra o .html em seu navegador.

## Como esse EP funciona?
Este EP é um simulador de voo sem colisão implementada. Ao abrir o simulador, uma cena com alguns cubos e esferas irá aparecer. Na interface, há dois botões: Executar/Pausar e Passo. O programa deve inicia no estado ‘Pausado’. Ao clicar em “Executar” o botãomuda de estado, para “Pausar”, e os objetos, inclusive a nave, começam a se mover. Clicando novamente em “Pausar”, o botão muda de volta para “Executar” e os objetos e a nave param de se mover. Nesse estado, ao clicar em “Passo”, todos os objetos se movimentar o equivalente a 1 segundo. Esse botão não tem efeito quando os objetos estão se movendo.

O estado do EP também pode ser mudado pelas teclas do teclado. O usuário pode navegar pela cena a partir de uma nave (câmera) em primeira pessoa, que possui os seguintes comandos: 

| Tecla | Ação                                  |
|-------|---------------------------------------|
| J     | decrementa a velocidade de translação |
| K     | zera a velocidade de translação       | 
| L     | incrementa a velocidade de translação |
| W     | incrementa a rotação no eixo X        |
| X     | decrementa a rotação no eixo X        |
| A     | incrementa a rotação no eixo Y        |
| D     | decrementa a rotação no eixo Y        |
| Z     | incrementa a rotação no eixo Z        |
| C     | incrementa a rotação no eixo Z        |

## Dependências
Esse EP não possui dependências. A única coisa que você precisa é de um navegador web que suporte WebGL2.

## Breve descrição dos objetos da cena
- CHAO: está na posição (0, 0, -10) e tem escala (500, 20, 500). Não possui velocidade de translação, i.e., não muda de posição, mas possui velocidade de rotação (0, 0.2, 0), ou seja, roda apenas em torno do eixo Y.
- BOLA: está na posição (0, 90, 0) e tem escala (30, 30, 30). Não possui velocidade de translação nem de rotação.
- CUBO1: está na posição (200, 200, 0) e tem escala (100, 30, 30). Possui velocidade de translação (-1, 0, 1), i.e., se move em uma linha reta no meio dos eixos X e Z, a partir de sua posição inicial até uma posição pré-definida (0, 200, 200). Quando atinge essa posição máxima, os sinais das velocidades são invertidos e CUBO1 anda em linha reta até sua posição inicial. Possui também velocidade de rotação (0, 1, 0), ou seja, roda apenas em torno do eixo Y.
- CUBO2: está na posição (0, 0, 0) e tem escala (10, 500, 10). Não possui velocidade de translação, mas possui velocidade de rotação (0, 1, 0).
- ESFERA1: está na posição (-200, 200, 0) e tem escala (100, 30, 30). Possui velocidade de translação (0, -1, 0), i.e., se move em uma linha reta seguindo o eixo Y, a partir de sua posição inicial até uma posição pré-definida (-200, -50, 0). Quando atinge essa posição máxima, os sinais das velocidades são invertidos e ESFERA1 anda em linha reta até sua posição inicial. Possui também velocidade de rotação (1, 0, 0), ou seja, roda apenas em torno do eixo X.
- ESFERA2: está na posição (150, 30, 140) e tem escala (100, 100, 100). Não possui velocidade de translação, mas possui velocidade de rotação (0.2, 0.2, 0.2), i.e, rotaciona em torno de todos os eixos.

## Bugs conhecidos
Nenhum bug conhecido até agora.
