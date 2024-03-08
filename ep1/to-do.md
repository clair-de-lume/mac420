# To-do
OK sincronizar valor no relógio secundário com valor no relógio principal
OK fazer cronometro parar ao atingir valor digitado no relogio secundario
OK desativar teclas quando cronometro esta contando
OK normalizar o tempo
- colocar teclas de numeros em uma classe filha
- retornar tecla para value="Start" quando cronometro finaliza
- função reserva de contar tempo (iniciar no tempo especificado e descrescer)
- adicionar prints do console para teclas numericas, botao desabilitado e troca de modo (conforme video)

# Dúvidas
- quando o relogio secundario está com a casa das dezenas de minutos preenchidas, ainda deve atualizar ao teclar novo numero? (ex.: 55:55 e teclo 1 -> 55:51) ou deve travar naquele valor? SIM

# Erros
- cronometro não funciona se tentar rodar dnv após já ter atingido o tempo especificado uma vez
- (CORRIGIDO) tecla stop não volta para start ao terminar de rodar 
- no seguinte fluxo, ao restartar o cronometro com novo tempo, ele ultrapassa o novo tempo: insere tempo -> start -> stop -> clear -> insere novo tempo -> start 