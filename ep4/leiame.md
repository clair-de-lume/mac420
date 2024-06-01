# EP4 de MAC0420 - Simulador de Voo

## Objetivo
O objetivo deste exercício-programa é aprender como implementar formas primitivas (cubos e esferas) em WebGL2 e aplicar a elas transformações (translação, rotação e escala), como visto em aula.

## Como rodar o programa
Dentro de uma pasta contendo os arquivos "voo.js" e "voo.html", abra o .html em seu navegador.

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

## Bugs conhecidos
Nenhum bug conhecido até agora.
