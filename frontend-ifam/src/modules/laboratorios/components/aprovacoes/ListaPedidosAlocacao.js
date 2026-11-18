/**
 * Lista rolável de pedidos, com "puxar para baixo" e estado vazio.
 *
 * `FlatList` em vez de `ScrollView` + `map`: só desenha os cards visíveis e
 * já traz o `RefreshControl` e o `ListEmptyComponent` prontos.
 */

import { FlatList, RefreshControl, StyleSheet } from 'react-native';

import { COLORS } from '../../../../core/theme/colors';
import { CardPedidoAlocacao } from './CardPedidoAlocacao';
import { EstadoVazio } from './EstadosDaLista';

export function ListaPedidosAlocacao({
  pedidos,
  filtroTipo,
  busca,
  atualizando,
  onAtualizar,
  idEmProcessamento,
  onAprovar,
  onRejeitar,
}) {
  return (
    <FlatList
      data={pedidos}
      keyExtractor={(item) => item.id_alocacao}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <CardPedidoAlocacao
          pedido={item}
          processando={idEmProcessamento === item.id_alocacao}
          onAprovar={onAprovar}
          onRejeitar={onRejeitar}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={onAtualizar}
          colors={[COLORS.greenIF]}
          tintColor={COLORS.greenIF}
        />
      }
      ListEmptyComponent={<EstadoVazio filtroTipo={filtroTipo} busca={busca} />}
    />
  );
}

const styles = StyleSheet.create({
  conteudo: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 30,
  },
});
