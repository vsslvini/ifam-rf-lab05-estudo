/**
 * Ponto de entrada do aplicativo Portal IFAM.
 *
 * Estado atual: a navegação global (React Navigation) ainda não existe, então
 * o app renderiza **uma** tela por vez, escolhida em `app.json` →
 * `expo.extra.telaInicial`. Cada dupla registra a sua tela no mapa `TELAS`
 * abaixo e troca uma palavra no `app.json` para demonstrar a sua feature, sem
 * mexer no trabalho das outras.
 *
 * TODO(equipe de navegação): substituir o corpo deste componente pelo
 * `AppNavigator` (src/navigation/AppNavigator.js), que alterna entre o
 * AuthNavigator e o HubNavigator. As chaves de `TELAS` já usam os mesmos
 * nomes de rota previstos para os navigators (ver menu_principal_screen.js),
 * então cada entrada vira um `<Stack.Screen>`.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';

import TiposRecursoScreen from './src/modules/equipamentos/screens/tipos_recurso_screen';
import AprovacoesAlocacoesScreen from './src/modules/laboratorios/screens/aprovacoes_alocacoes_screen';

/** Telas já integradas à API, por nome de rota. */
const TELAS = {
  // Módulo 1 — Empréstimo de Equipamentos
  TIPOS_RECURSO: TiposRecursoScreen, // RF-EQ01
  // Módulo 2 — Laboratórios de Informática
  APROVACOES_ALOCACOES: AprovacoesAlocacoesScreen, // RF-LAB05
};

const TELA_PADRAO = 'TIPOS_RECURSO';

export default function App() {
  const rota = Constants.expoConfig?.extra?.telaInicial ?? TELA_PADRAO;
  const Tela = TELAS[rota];

  if (!Tela) {
    return (
      <View style={styles.erroContainer}>
        <StatusBar style="dark" />
        <Text style={styles.erroTitulo}>Tela "{rota}" não registrada</Text>
        <Text style={styles.erroTexto}>
          Ajuste `expo.extra.telaInicial` no app.json. Disponíveis:{' '}
          {Object.keys(TELAS).join(', ')}.
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Tela onBackToMenu={() => {}} />
    </>
  );
}

const styles = StyleSheet.create({
  erroContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  erroTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#CD191E',
    textAlign: 'center',
  },
  erroTexto: {
    fontSize: 13,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
  },
});
