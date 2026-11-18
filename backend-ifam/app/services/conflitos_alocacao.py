"""RN04 - Prevencao de Conflitos de Grade (regra de dominio do RF-LAB05).

> "O sistema nao permite a aprovacao de duas alocacoes para o mesmo
>  laboratorio no mesmo dia e intervalo de tempo."
> (docs/seq_02_requisitos_V8.md, secao 4)

Este modulo isola a decisao "estes dois pedidos disputam a mesma sala?" em
funcoes puras, sem banco e sem HTTP - assim a regra e testavel diretamente e
continua valida quando a persistencia real entrar.

Decisoes de projeto tomadas aqui (a documentacao define a regra, nao o
algoritmo):

1. **Comparacao por intervalo, nao por slot.** Dois pedidos conflitam quando
   os intervalos `[hora_inicio, hora_fim)` das suas grades se sobrepoem - nao
   apenas quando o `id_grade_horario` e igual. Um pedido de 07:30-09:10 e
   outro de 08:30-10:10 sao slots diferentes e ainda assim ocupam a mesma
   sala, e a RN04 fala em "intervalo de tempo".

2. **Alocacao semestral e comparada pelo dia da semana.** No DDL,
   `data_reserva` de uma alocacao `Semestral` guarda o *inicio do semestre*
   e a aula se repete toda semana (ver a tela de aprovacoes: "Todas as
   Quartas (2026/2)"). Logo:
     - `Pontual` x `Pontual`   -> conflitam se `data_reserva` for a mesma;
     - qualquer `Semestral`    -> conflitam se `dia_semana` for o mesmo.

3. **Somente alocacoes que ocupam a sala bloqueiam a aprovacao.** Dois
   pedidos ainda `Pendente` sao sinalizados um ao outro (alerta visual), mas
   apenas os status `Aprovada` / `Em_Uso` impedem a aprovacao - e o
   Administrador quem decide qual dos dois pedidos atender.
"""

from app.models.laboratorios import AlocacaoLaboratorio, GradeHorario, TipoAlocacaoLab


def horarios_se_sobrepoem(grade_a: GradeHorario, grade_b: GradeHorario) -> bool:
    """Indica se dois slots de horario tem intersecao de tempo.

    Intervalos meio-abertos: uma aula que termina 09:10 nao conflita com
    outra que comeca 09:10.
    """
    return grade_a.hora_inicio < grade_b.hora_fim and grade_b.hora_inicio < grade_a.hora_fim


def mesma_ocorrencia_no_calendario(
    alocacao_a: AlocacaoLaboratorio,
    alocacao_b: AlocacaoLaboratorio,
) -> bool:
    """Indica se as duas alocacoes recaem no mesmo dia de aula.

    Ver a decisao 2 do cabecalho: `Semestral` se repete semanalmente, por
    isso a comparacao passa a ser pelo dia da semana.
    """
    envolve_semestral = TipoAlocacaoLab.SEMESTRAL in (
        alocacao_a.tipo_alocacao,
        alocacao_b.tipo_alocacao,
    )

    if envolve_semestral:
        return alocacao_a.dia_semana.strip().casefold() == alocacao_b.dia_semana.strip().casefold()

    return alocacao_a.data_reserva == alocacao_b.data_reserva


def alocacoes_conflitam(
    alocacao_a: AlocacaoLaboratorio,
    grade_a: GradeHorario,
    alocacao_b: AlocacaoLaboratorio,
    grade_b: GradeHorario,
) -> bool:
    """Aplica a RN04 entre duas alocacoes distintas.

    Conflita quando as tres condicoes sao verdadeiras:
      1. e o mesmo laboratorio;
      2. cai no mesmo dia de aula (data ou dia da semana);
      3. os horarios se sobrepoem.
    """
    if alocacao_a.id_alocacao == alocacao_b.id_alocacao:
        return False

    if alocacao_a.id_laboratorio != alocacao_b.id_laboratorio:
        return False

    if not mesma_ocorrencia_no_calendario(alocacao_a, alocacao_b):
        return False

    return horarios_se_sobrepoem(grade_a, grade_b)
