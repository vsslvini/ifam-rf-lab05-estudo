/**
 * Card de um pedido de alocação na fila do Administrador.
 *
 * Hierarquia do mais para o menos importante: laboratório, quando, quem/o quê,
 * softwares; o alerta de conflito (RN04) entra entre os dados e os botões.
 * O badge "Pendente" do protótipo foi retirado — tudo nesta fila é pendente —
 * e o tipo (Pontual / Semestral) virou um rótulo discreto na primeira linha.
 *
 * Em conflito o card ganha borda vermelha e o botão Aprovar fica cinza, mas
 * continua clicável: quem decide é o servidor (409).
 *
 * Componente "burro": não conhece o service. Recebe o pedido e avisa a tela
 * por `onAprovar` / `onRejeitar`.
 */

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, RADIUS } from '../../../../core/theme/colors';
import { descreverAgenda, listarBloqueios } from '../../utils/alocacaoFormatters';
import { AlertaConflitoHorario } from './AlertaConflitoHorario';
import { SOMBRA_CARD } from './estilosCompartilhados';

export function CardPedidoAlocacao({ pedido, processando = false, onAprovar, onRejeitar }) {
  const aprovacaoBloqueada = listarBloqueios(pedido).length > 0;

  return (
    <View style={[styles.card, SOMBRA_CARD, pedido.conflito_detectado && styles.cardEmConflito]}>
      {/* Linha 1: tipo à esquerda, bloco à direita */}
      <View style={styles.linhaTopo}>
        <Text style={styles.tipo}>{pedido.tipo_alocacao}</Text>
        <Text style={styles.bloco}>{pedido.laboratorio.bloco}</Text>
      </View>

      <Text style={styles.laboratorio}>{pedido.laboratorio.nome}</Text>
      <Text style={styles.agenda}>
        {descreverAgenda(pedido)} · {pedido.descricao_tempo}
      </Text>

      {/* Quem e o quê */}
      <Text style={styles.docente}>{pedido.docente.nome}</Text>
      <Text style={styles.detalhe}>
        {pedido.disciplina} · {pedido.curso_turma} · {pedido.qtd_alunos_prevista} alunos
      </Text>
      {pedido.softwares_solicitados?.length > 0 && (
        <Text style={styles.softwares} numberOfLines={2}>
          Softwares: {pedido.softwares_solicitados.join(', ')}
        </Text>
      )}

      {pedido.conflito_detectado && <AlertaConflitoHorario conflitos={pedido.conflitos} />}

      {/* Ações */}
      <View style={styles.acoes}>
        <TouchableOpacity
          style={styles.botaoRejeitar}
          onPress={() => onRejeitar(pedido)}
          disabled={processando}
          activeOpacity={0.8}
        >
          <Text style={styles.botaoRejeitarTexto}>Rejeitar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoAprovar, aprovacaoBloqueada && styles.botaoAprovarBloqueado]}
          onPress={() => onAprovar(pedido)}
          disabled={processando}
          activeOpacity={0.8}
        >
          {processando ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.botaoAprovarTexto}>
              {aprovacaoBloqueada ? 'Aprovar (em conflito)' : 'Aprovar'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
  },
  cardEmConflito: {
    borderColor: COLORS.redAccent,
  },

  linhaTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tipo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.blueIF,
    backgroundColor: COLORS.blueLightBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.badge,
    overflow: 'hidden',
  },
  bloco: {
    fontSize: 12,
    color: COLORS.neutralTexto,
  },

  laboratorio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  agenda: {
    fontSize: 13,
    color: COLORS.neutralTextoEscuro,
    marginTop: 2,
    marginBottom: 10,
  },

  docente: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  detalhe: {
    fontSize: 12,
    color: COLORS.neutralTextoEscuro,
    lineHeight: 17,
    marginTop: 2,
  },
  softwares: {
    fontSize: 12,
    color: COLORS.neutralTexto,
    lineHeight: 17,
    marginTop: 2,
  },

  acoes: {
    flexDirection: 'row',
    marginTop: 14,
  },
  botaoRejeitar: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: RADIUS.botao,
    borderWidth: 1,
    borderColor: COLORS.redAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  botaoRejeitarTexto: {
    color: COLORS.redAccent,
    fontSize: 13,
    fontWeight: '600',
  },
  botaoAprovar: {
    flex: 1,
    backgroundColor: COLORS.greenIF,
    paddingVertical: 10,
    borderRadius: RADIUS.botao,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoAprovarBloqueado: {
    backgroundColor: COLORS.neutralTexto,
  },
  botaoAprovarTexto: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
