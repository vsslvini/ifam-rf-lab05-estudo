/**
 * Caixa vermelha da RN04: com quem o horário do pedido colide.
 *
 * Só apresenta o que a API já resolveu (`conflitos`). Uma linha por
 * concorrente, com a disciplina e o docente; o status entre parênteses
 * diferencia o que já bloqueia a aprovação (Aprovada / Em uso) do que apenas
 * disputa a mesma vaga (outro pedido Pendente).
 */

import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../../../core/theme/colors';

export function AlertaConflitoHorario({ conflitos = [] }) {
  return (
    <View style={styles.caixa}>
      <Text style={styles.titulo}>Conflito de horário neste laboratório</Text>
      {conflitos.map((conflito) => (
        <Text key={conflito.id_alocacao} style={styles.detalhe}>
          {conflito.disciplina} · {conflito.docente} ({conflito.status_alocacao.toLowerCase()})
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    backgroundColor: COLORS.redLightBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  titulo: {
    color: COLORS.redAccent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  detalhe: {
    color: COLORS.redAccent,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});
