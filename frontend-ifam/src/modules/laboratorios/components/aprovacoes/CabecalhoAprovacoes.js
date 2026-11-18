/**
 * Cabeçalho da fila de aprovações: voltar, título e contador de pendentes.
 *
 * Uma linha só — o que a tela faz já está dito no título; o subtítulo e o
 * nome do menu de origem foram retirados para a lista começar mais cedo.
 */

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS } from '../../../../core/theme/colors';
import { COR_TEXTO_PENDENTE } from './estilosCompartilhados';

export function CabecalhoAprovacoes({ totalPendentes, onVoltar }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onVoltar}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <Text style={styles.voltar}>‹</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Aprovações de Laboratório</Text>

      <View style={styles.badge}>
        <Text style={styles.badgeTexto}>{totalPendentes}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  voltar: {
    fontSize: 30,
    lineHeight: 32,
    color: COLORS.greenIF,
    paddingRight: 10,
  },
  titulo: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  badge: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
    backgroundColor: COLORS.yellowLightBg,
    alignItems: 'center',
  },
  badgeTexto: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COR_TEXTO_PENDENTE,
  },
});
