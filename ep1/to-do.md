# To-do
OK sincronizar valor no relógio secundário com valor no relógio principal
OK fazer cronometro parar ao atingir valor digitado no relogio secundario
OK desativar teclas quando cronometro esta contando
OK normalizar o tempo
OK retornar tecla para value="Start" quando cronometro finaliza
OK função reserva de contar tempo (iniciar no tempo especificado e descrescer)
- adicionar prints do console para teclas numericas, botao desabilitado e troca de modo (conforme video)
- estilizar o teclado

# Fixes
OK tecla Clear deve resetar apenas relogio secundario

# Dúvidas
- quando o relogio secundario está com a casa das dezenas de minutos preenchidas, ainda deve atualizar ao teclar novo numero? (ex.: 55:55 e teclo 1 -> 55:51) ou deve travar naquele valor? SIM

# Erros
- no modo cronometro, ao completar uma contagem, o botao start nao funciona por causa de temposIguais()
- (CORRIGIDO) no modo timer, o relogio nao esta parando após terminar de contar
- (CORRIGIDO) no modo timer, o tempo volta errado ao despausar
- ao clicar em pause após dar Start, e clicar em Run, o cronometro volta a contar com alguns segundos de atraso
- no fluxo, o contador volta a contar com tempo errado após o ultimo Run Start -> Pause -> Run -> Stop -> Start -> Pause -> Run
- (CORRIGIDO) cronometro não funciona se tentar rodar dnv após já ter atingido o tempo especificado uma vez
- (CORRIGIDO) tecla stop não volta para start ao terminar de rodar 
- (CORRIGIDO) no seguinte fluxo, ao restartar o cronometro com novo tempo, ele ultrapassa o novo tempo: insere tempo -> start -> stop -> clear -> insere novo tempo -> start 