/**
 * Chips de filtro por tipo de alocação (Todos / Pontual / Semestral).
 * Rótulos curtos: o contexto ("alocação") já está no título da tela.
 *
 * Componente controlado: recebe o `valor` atual e avisa a mudança por
 * `onChange`. A requisição com o novo filtro é disparada pelo hook, não aqui.
 */

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, RADIUS } from '../../../../core/theme/colors';
import { FILTROS_TIPO_ALOCACAO } from '../../utils/filtrosAlocacao';

export function FiltrosTipoAlocacao({ valor, onChange }) {
  return (
    <View style={styles.linha}>
      {FILTROS_TIPO_ALOCACAO.map((filtro) => {
        const ativo = filtro.valor === valor;
        return (
          <TouchableOpacity
            key={filtro.valor}
            style={[styles.chip, ativo && styles.chipAtivo]}
            onPress={() => onChange(filtro.valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: ativo }}
          >
            <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{filtro.rotulo}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  chip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.chip,
    marginRight: 8,
    marginBottom: 4,
  },
  chipAtivo: {
    backgroundColor: COLORS.greenIF,
    borderColor: COLORS.greenIF,
  },
  chipTexto: {
    fontSize: 12,
    color: COLORS.neutralTextoEscuro,
  },
  chipTextoAtivo: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
