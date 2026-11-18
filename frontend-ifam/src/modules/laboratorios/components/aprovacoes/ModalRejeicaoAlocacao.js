/**
 * Modal de rejeição com justificativa obrigatória (RN05).
 *
 * Abre quando recebe um `pedido` e fecha quando ele vira `null`. O texto
 * digitado e o estado "enviando" moram aqui dentro: são detalhes do modal,
 * a tela não precisa deles.
 *
 * O mínimo de 10 caracteres é o mesmo do schema da API. Validar aqui é só
 * feedback imediato; quem garante a regra é o servidor (422).
 */

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS, RADIUS } from '../../../../core/theme/colors';
import { avisar } from '../../utils/dialogos';

export const MIN_JUSTIFICATIVA = 10;

export function ModalRejeicaoAlocacao({ pedido, onCancelar, onConfirmar }) {
  const [justificativa, setJustificativa] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Cada pedido começa com o campo limpo, sem a justificativa do anterior.
  useEffect(() => {
    setJustificativa('');
  }, [pedido]);

  const confirmar = async () => {
    const texto = justificativa.trim();

    if (texto.length < MIN_JUSTIFICATIVA) {
      avisar(
        'Justificativa obrigatória',
        `Descreva o motivo da recusa com pelo menos ${MIN_JUSTIFICATIVA} caracteres — ` +
          'ele é enviado ao solicitante (RN05).',
      );
      return;
    }

    setEnviando(true);
    try {
      await onConfirmar(texto);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={pedido != null}
      onRequestClose={onCancelar}
    >
      <View style={styles.overlay}>
        <View style={styles.conteudo}>
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>Rejeitar Solicitação</Text>
            <TouchableOpacity onPress={onCancelar} disabled={enviando}>
              <Text style={styles.fechar}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.corpo}>
            <Text style={styles.descricao}>
              Informe o motivo da rejeição para{' '}
              <Text style={styles.negrito}>{pedido?.docente?.nome}</Text>. A justificativa é
              obrigatória e será enviada ao solicitante.
            </Text>

            <TextInput
              style={styles.campo}
              placeholder="Ex: Sala já reservada para manutenção preventiva ou conflito de grade..."
              placeholderTextColor={COLORS.neutralTexto}
              multiline
              numberOfLines={4}
              value={justificativa}
              onChangeText={setJustificativa}
              editable={!enviando}
            />

            <Text style={styles.contador}>
              {justificativa.trim().length}/{MIN_JUSTIFICATIVA} caracteres mínimos
            </Text>

            <View style={styles.acoes}>
              <TouchableOpacity style={styles.botaoCancelar} onPress={onCancelar} disabled={enviando}>
                <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.botaoConfirmar} onPress={confirmar} disabled={enviando}>
                {enviando ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.botaoConfirmarTexto}>Confirmar Rejeição</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  conteudo: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutralBorda,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  fechar: {
    fontSize: 18,
    color: COLORS.neutralTexto,
    fontWeight: 'bold',
    padding: 4,
  },
  corpo: {
    padding: 16,
  },
  descricao: {
    fontSize: 13,
    color: COLORS.black,
    marginBottom: 10,
  },
  negrito: {
    fontWeight: 'bold',
    color: COLORS.black,
  },
  campo: {
    backgroundColor: COLORS.neutralFundo,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    borderRadius: RADIUS.botao,
    padding: 12,
    fontSize: 13,
    color: COLORS.black,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  contador: {
    fontSize: 11,
    color: COLORS.neutralTexto,
    marginTop: 6,
    marginBottom: 16,
    textAlign: 'right',
  },
  acoes: {
    flexDirection: 'row',
  },
  botaoCancelar: {
    flex: 1,
    backgroundColor: COLORS.neutralFundo,
    paddingVertical: 12,
    borderRadius: RADIUS.botao,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  botaoCancelarTexto: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '600',
  },
  botaoConfirmar: {
    flex: 1,
    backgroundColor: COLORS.redAccent,
    paddingVertical: 12,
    borderRadius: RADIUS.botao,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoConfirmarTexto: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
