/**
 * RF-LAB05 — Aprovação de Alocações e Detecção de Conflitos.
 *
 * Painel do Administrador para analisar os pedidos de uso de laboratório, com
 * alerta visual automático de sobreposição de horário (RN04) e recusa
 * justificada (RN05).
 *
 * A tela é só orquestração — cada responsabilidade mora num lugar:
 *
 *   hooks/useAprovacoesAlocacoes   dados e chamadas ao service (carregar,
 *                                  aprovar, rejeitar, estados de rede)
 *   components/aprovacoes/         o que aparece na tela (cabeçalho, filtros,
 *                                  card, alerta de conflito, modal, estados)
 *   utils/                         formatação, filtros e diálogos
 *   services/laboratoriosService   API real com fallback para o mock
 *
 * Quem decide o conflito é o servidor: a tela apenas desenha o que vem em
 * `conflito_detectado` / `conflitos` e respeita o 409 devolvido na aprovação.
 *
 * Dois filtros convivem: o chip de tipo vai para a API; a busca por texto é
 * aplicada no aparelho, pelo hook (`pedidosVisiveis`). O contador do cabeçalho
 * mostra a fila inteira do filtro atual, não só o que a busca deixou visível.
 */

import { useState } from 'react';
import Constants from 'expo-constants';
import { Platform, SafeAreaView, StatusBar, StyleSheet } from 'react-native';

import { COLORS } from '../../../core/theme/colors';
import {
  BannerModoOffline,
  CabecalhoAprovacoes,
  CampoBusca,
  EstadoCarregando,
  EstadoErro,
  FiltrosTipoAlocacao,
  ListaPedidosAlocacao,
  ModalRejeicaoAlocacao,
} from '../components/aprovacoes';
import { useAprovacoesAlocacoes } from '../hooks/useAprovacoesAlocacoes';
import { descreverConfirmacaoAprovacao } from '../utils/alocacaoFormatters';
import { avisar, confirmar } from '../utils/dialogos';

export default function AprovacoesAlocacoesScreen({ onBackToMenu }) {
  const fila = useAprovacoesAlocacoes();

  // Único estado de interface da tela: qual pedido está com o modal aberto.
  const [pedidoParaRejeitar, setPedidoParaRejeitar] = useState(null);

  // --- Aprovação (RN04) -------------------------------------------------
  const handleAprovar = (pedido) => {
    confirmar(
      'Confirmar Aprovação',
      descreverConfirmacaoAprovacao(pedido),
      async () => {
        try {
          const { mensagem } = await fila.aprovar(pedido);
          avisar('✅ Aprovado', mensagem);
        } catch (erro) {
          // 409 = conflito de grade: a sala já está ocupada no horário.
          avisar(
            erro.status === 409 ? '⚠️ Conflito de horário' : 'Não foi possível aprovar',
            erro.mensagem ?? 'Tente novamente.',
          );
        }
      },
      'Aprovar',
    );
  };

  // --- Rejeição (RN05) --------------------------------------------------
  const handleConfirmarRejeicao = async (justificativa) => {
    try {
      const { mensagem } = await fila.rejeitar(pedidoParaRejeitar, justificativa);
      setPedidoParaRejeitar(null);
      avisar('🚫 Rejeitado', mensagem);
    } catch (erro) {
      avisar('Não foi possível rejeitar', erro.mensagem ?? 'Tente novamente.');
    }
  };

  // --- Conteúdo central: carregando, erro ou lista -----------------------
  const renderConteudo = () => {
    if (fila.carregando) {
      return <EstadoCarregando />;
    }
    if (fila.erroCarregamento) {
      return <EstadoErro mensagem={fila.erroCarregamento} onTentarNovamente={fila.recarregar} />;
    }
    return (
      <ListaPedidosAlocacao
        pedidos={fila.pedidosVisiveis}
        filtroTipo={fila.filtroTipo}
        busca={fila.busca}
        atualizando={fila.atualizando}
        onAtualizar={fila.atualizar}
        idEmProcessamento={fila.idEmProcessamento}
        onAprovar={handleAprovar}
        onRejeitar={setPedidoParaRejeitar}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.neutralFundo} />

      <CabecalhoAprovacoes totalPendentes={fila.pedidos.length} onVoltar={onBackToMenu} />

      {fila.modoMock && <BannerModoOffline />}

      <CampoBusca valor={fila.busca} onChange={fila.setBusca} />

      <FiltrosTipoAlocacao valor={fila.filtroTipo} onChange={fila.setFiltroTipo} />

      {renderConteudo()}

      <ModalRejeicaoAlocacao
        pedido={pedidoParaRejeitar}
        onCancelar={() => setPedidoParaRejeitar(null)}
        onConfirmar={handleConfirmarRejeicao}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutralFundo,
    // O SafeAreaView do React Native só reserva espaço no iOS. No Android o
    // conteúdo nasceria embaixo da barra de status; `expo-constants` informa
    // a altura dela e o padding resolve sem dependência nova.
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
  },
});
