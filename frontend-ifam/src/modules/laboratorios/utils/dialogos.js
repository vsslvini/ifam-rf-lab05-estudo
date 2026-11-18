/**
 * Caixas de diálogo multiplataforma.
 *
 * `Alert.alert` do React Native não faz nada no navegador; `window.alert` e
 * `window.confirm` não existem no Android/iOS. Estes helpers escolhem o
 * certo pela plataforma, e a tela não precisa saber onde está rodando.
 *
 * Candidatos naturais a `src/core/utils/` quando a Equipe do Core preencher a
 * pasta — hoje ficam no módulo para não conflitar com o trabalho dela.
 */

import { Alert, Platform } from 'react-native';

/** Aviso com um único botão OK. */
export function avisar(titulo, mensagem) {
  if (Platform.OS === 'web') {
    window.alert(mensagem ? `${titulo}\n\n${mensagem}` : titulo);
    return;
  }
  Alert.alert(titulo, mensagem);
}

/**
 * Pergunta com Cancelar / confirmar. `onConfirmar` só roda se o usuário
 * aceitar; cancelar não chama nada.
 */
export function confirmar(titulo, mensagem, onConfirmar, textoConfirmar = 'Confirmar') {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titulo}\n\n${mensagem}`)) {
      onConfirmar();
    }
    return;
  }
  Alert.alert(titulo, mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoConfirmar, onPress: onConfirmar },
  ]);
}
