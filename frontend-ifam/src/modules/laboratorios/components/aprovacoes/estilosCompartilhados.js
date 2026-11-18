/**
 * Valores de estilo usados por mais de um componente da fila de aprovações.
 *
 * Tudo que é do Design System V2 continua vindo de `core/theme/colors.js`;
 * aqui ficam só os complementos que o protótipo introduziu e que não têm
 * token no tema ainda.
 */

import { Platform } from 'react-native';

/** Laranja do texto "Pendente" do protótipo (não existe em `COLORS`). */
export const COR_TEXTO_PENDENTE = '#E65100';

/** Sombra multiplataforma do seq_03, seção 2.C. */
export const SOMBRA_CARD = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  android: {
    elevation: 2,
  },
});
