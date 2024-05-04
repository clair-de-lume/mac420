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
