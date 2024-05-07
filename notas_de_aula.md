### Anotações sobre WebGL2

## Fundamentos

WebGL roda na GPU. Para rodar o código na GPU, você deve fornecer um par de funções para a GPU: a função vertex shader e a fragment shader.

Um vertex shader computa as posições dos vértices, que permite ao WebGL rasterizar primitivas (pontos, triângulos, linhas). O fragment shader computa cada pixel da primitiva que está sendo desenhada naquele momento.

Para cada primitiva a ser desenhada, você deve setar estados/dados e executar um par de funções chamando gl.drawArrays ou gl.drawElements, os quais executam os shaders na GPU.

O shader pode receber dados de 4 maneiras:
- Buffers: buffers são arrays de dados binários, que contêm posições, textura, cor de vértices, etc. 
- Atributos: são usados para especificar como pegar os dados de dentro dos buffers e envia-los para o vertex shader. Você deve indicar:
    1. o buffer de qual você vai retirar os dados
    2. o offset 
    3. o tamanho (quantos bytes de informação devemos pegar em cada bloco retirado)

ATENÇÃO! Buffers não tem acesso aleatório. Ao invés disso, cada vez que o vertex shader é executado, ele pega uma fatia do buffer e coloca em um atributo.

- Uniformes: são variáveis globais setadas antes de executar o shader.
- Texturas: arrays de dados que o shader pode acessar aleatoriamente.
- Varyings: modo com que o vertex shader passa dados para o fragment shader. 

## Escrevendo um "Hello World" em WebGL

No WebGL, você deve se preocupar com 2 coisas: coordenadas do clip space e cores. O vertex shader cuida das coordenadas e o fragment shader cuida das cores.

Essas coordenadas sempre vão de -1 até +1. Ou seja, num plano cartesiano, o canvas do WebGl é um quadrado de lado 1 centrado na origem.

Um exemplo dos shaders:

`
attribute vec4 a_position; // um array de tamanho 4 chamado a_position
 
// all shaders have a main function
void main() {
 
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
}`

`// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;
 
void main() {
  // gl_FragColor is a special variable a fragment shader
  // is responsible for setting
  gl_FragColor = vec4(1, 0, 0.5, 1); // return reddish-purple
}` 

Cada elemento do array gl_FragColor corresponde a uma cor (RGB e alfa=opacidade).

