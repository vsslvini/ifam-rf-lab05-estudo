/**
 * Faixa discreta exibida quando os dados vêm do mock (API indisponível ou
 * `useMock: true` no app.json). Quem decide se ela aparece é a tela, a partir
 * de `isModoMock()` do service.
 */

import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../../../core/theme/colors';
import { COR_TEXTO_PENDENTE } from './estilosCompartilhados';

export function BannerModoOffline() {
  return (
    <View style={styles.faixa}>
      <Text style={styles.texto}>Sem conexão com o servidor · dados de demonstração</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  faixa: {
    backgroundColor: COLORS.yellowLightBg,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  texto: {
    fontSize: 11,
    color: COR_TEXTO_PENDENTE,
    textAlign: 'center',
  },
});
