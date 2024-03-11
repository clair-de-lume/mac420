# To-do
- OK sincronizar valor no relógio secundário com valor no relógio principal
- OK fazer cronometro parar ao atingir valor digitado no relogio secundario
- OK desativar teclas quando cronometro esta contando
- OK normalizar o tempo
- OK retornar tecla para value="Start" quando cronometro finaliza
- OK função reserva de contar tempo (iniciar no tempo especificado e descrescer)
- OK adicionar prints do console para teclas numericas, botao desabilitado e troca de modo (conforme video)
- estilizar o teclado

# Fixes
OK tecla Clear deve resetar apenas relogio secundario

# Dúvidas
- se eu deixar o print do console ao apertar botão como "1 0001" ao invés de "1 1", vai descontar nota?
- quando o relogio secundario está com a casa das dezenas de minutos preenchidas, ainda deve atualizar ao teclar novo numero? (ex.: 55:55 e teclo 1 -> 55:51) ou deve travar naquele valor? SIM

# Erros
- (CORRIGIDO) ao clicar em pause após dar Start, e clicar em Run, o cronometro volta a contar com alguns segundos de atraso
- (CORRIGIDO) no fluxo, o contador volta a contar com tempo errado após o ultimo Run: Start -> Pause -> Run -> Stop -> Start -> Pause -> Run
- (CORRIGIDO) no modo cronometro, ao completar uma contagem, o botao start nao funciona por causa de temposIguais()
- (CORRIGIDO) no modo timer, o relogio nao esta parando após terminar de contar
- (CORRIGIDO) no modo timer, o tempo volta errado ao despausar
- (CORRIGIDO) cronometro não funciona se tentar rodar dnv após já ter atingido o tempo especificado uma vez
- (CORRIGIDO) tecla stop não volta para start ao terminar de rodar 
- (CORRIGIDO) no seguinte fluxo, ao restartar o cronometro com novo tempo, ele ultrapassa o novo tempo: insere tempo -> start -> stop -> clear -> insere novo tempo -> start 

# Brainstorming
Pausa no cronometro:

clicar no Pause;
inicio da pausa = Date.now();

clicar no Run:
final da pausa = Date.now();

tempo da pausa = final - inicio;
inicio = tempo da pausa;
