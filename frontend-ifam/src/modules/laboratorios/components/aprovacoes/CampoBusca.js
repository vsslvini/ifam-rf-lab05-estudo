/**
 * Campo de busca por texto da fila (docente, disciplina, laboratório, turma
 * ou software). Componente controlado: só repassa o que foi digitado; quem
 * filtra é o hook.
 */

import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { COLORS, RADIUS } from '../../../../core/theme/colors';

export function CampoBusca({ valor, onChange }) {
  return (
    <View style={styles.caixa}>
      <Text style={styles.icone}>🔍</Text>
      <TextInput
        style={styles.campo}
        placeholder="Buscar por docente, disciplina, laboratório..."
        placeholderTextColor={COLORS.neutralTexto}
        value={valor}
        onChangeText={onChange}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        accessibilityLabel="Buscar pedidos"
      />
      {valor.length > 0 && (
        <TouchableOpacity
          onPress={() => onChange('')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
        >
          <Text style={styles.limpar}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    borderRadius: RADIUS.botao,
  },
  icone: {
    fontSize: 13,
    marginRight: 6,
  },
  campo: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 13,
    color: COLORS.black,
  },
  limpar: {
    fontSize: 14,
    color: COLORS.neutralTexto,
    paddingLeft: 8,
  },
});
