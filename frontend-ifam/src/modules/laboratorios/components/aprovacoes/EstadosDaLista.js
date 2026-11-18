/**
 * Os três estados "sem cards" da fila: carregando, erro e vazio.
 *
 * Ficam no mesmo arquivo porque compartilham o mesmo layout centralizado e
 * nunca aparecem ao mesmo tempo.
 */

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, RADIUS } from '../../../../core/theme/colors';
import { FILTRO_TODOS } from '../../utils/filtrosAlocacao';

export function EstadoCarregando() {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={COLORS.greenIF} />
      <Text style={styles.texto}>Carregando solicitações...</Text>
    </View>
  );
}

export function EstadoErro({ mensagem, onTentarNovamente }) {
  return (
    <View style={styles.centro}>
      <Text style={styles.tituloErro}>Falha ao carregar</Text>
      <Text style={styles.texto}>{mensagem}</Text>
      <TouchableOpacity style={styles.botaoTentar} onPress={onTentarNovamente}>
        <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Vazio por três motivos diferentes, cada um com a sua frase: a busca não
 * achou nada, o chip não tem pedidos, ou a fila inteira está limpa.
 */
export function EstadoVazio({ filtroTipo, busca = '' }) {
  if (busca.trim()) {
    return (
      <View style={styles.vazio}>
        <Text style={styles.vazioTitulo}>Nada encontrado</Text>
        <Text style={styles.vazioSubtitulo}>Nenhum pedido corresponde a "{busca.trim()}".</Text>
      </View>
    );
  }

  const complemento = filtroTipo !== FILTRO_TODOS ? ` do tipo ${filtroTipo}` : '';
  return (
    <View style={styles.vazio}>
      <Text style={styles.vazioIcone}>🎉</Text>
      <Text style={styles.vazioTitulo}>Tudo em dia!</Text>
      <Text style={styles.vazioSubtitulo}>Não há solicitações pendentes{complemento}.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  texto: {
    fontSize: 13,
    color: COLORS.neutralTexto,
    textAlign: 'center',
    marginTop: 10,
  },
  tituloErro: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.redAccent,
  },
  botaoTentar: {
    marginTop: 16,
    backgroundColor: COLORS.greenIF,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.botao,
  },
  botaoTentarTexto: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },

  vazio: {
    padding: 40,
    alignItems: 'center',
  },
  vazioIcone: {
    fontSize: 40,
    marginBottom: 10,
  },
  vazioTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  vazioSubtitulo: {
    fontSize: 12,
    color: COLORS.neutralTexto,
    textAlign: 'center',
    marginTop: 4,
  },
});
