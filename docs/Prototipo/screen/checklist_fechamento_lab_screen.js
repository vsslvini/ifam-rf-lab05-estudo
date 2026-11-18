import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  Alert
} from 'react-native';

// ==========================================
// --- CONSTANTES DE DESIGN (V2/Manual IFAM) ---
// ==========================================
const COLORS = {
  greenIF: '#2F9E41',
  greenLight: '#E8F5E9',
  redAccent: '#CD191E',
  redLight: '#FFEBEE',
  warningYellow: '#FFC107',
  warningLight: '#FFF8E1',
  blueAccent: '#1976D2',
  blueLight: '#E3F2FD',
  black: '#000000',
  white: '#FFFFFF',
  neutralFundo: '#F5F5F5',
  neutralBorda: '#E0E0E0',
  neutralTexto: '#757575',
  neutralDark: '#333333',
};

const labsLista = [
  'Lab 01 - Redes (Sala 102)',
  'Lab 02 - Dev Software (Sala 104)',
  'Lab 03 - CAD & Gráfica (Sala 04)',
  'Lab 04 - Informática Geral (Sala 201)',
  'Lab 05 - Maker & Robótica (Subsolo)',
];

export default function ChecklistFechamentoLabScreen({ onBackToMenu, onFechamentoConcluido }) {
  const [labSelecionado, setLabSelecionado] = useState(labsLista[0]);

  // Itens do Checklist (Booleanos)
  const [checklist, setChecklist] = useState({
    computadoresDesligados: true,
    arCondicionadoDesligado: true,
    projetorDesligado: true,
    perifericosEmOrdem: true,
    lousaApagada: true,
    portaTrancada: true,
  });

  // Estado geral
  const [estadoGeral, setEstadoGeral] = useState('Bom');
  const [ocorrencias, setOcorrencias] = useState('');

  const toggleCheck = (chave) => {
    setChecklist(prev => ({
      ...prev,
      [chave]: !prev[chave]
    }));
  };

  const handleFinalizarFechamento = () => {
    const itensNaoConformes = Object.entries(checklist).filter(([_, val]) => !val);

    Alert.alert(
      'Confirmar Encerramento de Aula',
      `Registrar encerramento e devolução do ${labSelecionado}?\n\nEstado Geral: ${estadoGeral}${itensNaoConformes.length > 0 ? '\n⚠️ Existem itens pendentes no checklist.' : '\n✓ Todos os itens verificados.'}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Fechamento',
          onPress: () => {
            Alert.alert(
              '✅ Fechamento Registrado!',
              'O relatório de vistoria pós-aula foi arquivado com sucesso e a sala foi liberada no sistema.'
            );
            if (onFechamentoConcluido) onFechamentoConcluido();
            else if (onBackToMenu) onBackToMenu();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.neutralFundo} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToMenu} style={styles.backButton}>
          <Text style={styles.backButtonText}>◀ Menu de Laboratórios</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checklist de Fechamento</Text>
        <Text style={styles.headerSubtitle}>Vistoria de encerramento de aula e devolução do laboratório</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* SELETOR DE LABORATÓRIO */}
        <Text style={styles.sectionTitle}>1. Laboratório Vistoriado:</Text>
        <View style={styles.labSelectorContainer}>
          {labsLista.map((lab) => {
            const isSelected = labSelecionado === lab;
            return (
              <TouchableOpacity
                key={lab}
                style={[styles.labRadioBtn, isSelected && styles.labRadioBtnActive]}
                onPress={() => setLabSelecionado(lab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.labRadioText, isSelected && styles.labRadioTextActive]}>
                  {isSelected ? '● ' : '○ '} {lab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ITENS DE VERIFICAÇÃO (CHECKLIST) */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>2. Verificação dos Itens da Sala:</Text>
        <View style={[styles.card, styles.shadow]}>
          <TouchableOpacity
            style={styles.checkItemRow}
            onPress={() => toggleCheck('computadoresDesligados')}
            activeOpacity={0.7}
          >
            <Text style={[styles.checkIcon, checklist.computadoresDesligados && styles.checkIconChecked]}>
              {checklist.computadoresDesligados ? '☑' : '☐'}
            </Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.checkTitle}>Computadores dos Alunos Desligados</Text>
              <Text style={styles.checkSubtitle}>Todas as máquinas de bancada foram encerradas</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.checkItemRow}
            onPress={() => toggleCheck('arCondicionadoDesligado')}
            activeOpacity={0.7}
          >
            <Text style={[styles.checkIcon, checklist.arCondicionadoDesligado && styles.checkIconChecked]}>
              {checklist.arCondicionadoDesligado ? '☑' : '☐'}
            </Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.checkTitle}>Ar-condicionado e Luzes Desligados</Text>
              <Text style={styles.checkSubtitle}>Controle de consumo e eficiência energética</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.checkItemRow}
            onPress={() => toggleCheck('projetorDesligado')}
            activeOpacity={0.7}
          >
            <Text style={[styles.checkIcon, checklist.projetorDesligado && styles.checkIconChecked]}>
              {checklist.projetorDesligado ? '☑' : '☐'}
            </Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.checkTitle}>Projetor / Datashow Desligado</Text>
              <Text style={styles.checkSubtitle}>Preservação da lâmpada e equipamentos audiovisuais</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.checkItemRow}
            onPress={() => toggleCheck('perifericosEmOrdem')}
            activeOpacity={0.7}
          >
            <Text style={[styles.checkIcon, checklist.perifericosEmOrdem && styles.checkIconChecked]}>
              {checklist.perifericosEmOrdem ? '☑' : '☐'}
            </Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.checkTitle}>Teclados, Mouses e Cadeiras Organizados</Text>
              <Text style={styles.checkSubtitle}>Todos os postos em ordem para a próxima turma</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.checkItemRow}
            onPress={() => toggleCheck('portaTrancada')}
            activeOpacity={0.7}
          >
            <Text style={[styles.checkIcon, checklist.portaTrancada && styles.checkIconChecked]}>
              {checklist.portaTrancada ? '☑' : '☐'}
            </Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.checkTitle}>Janelas e Porta Trancadas</Text>
              <Text style={styles.checkSubtitle}>Segurança física do patrimônio institucional</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ESTADO GERAL DE CONSERVAÇÃO */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>3. Estado Geral Pós-Uso:</Text>
        <View style={styles.estadoGeralRow}>
          {['Excelente', 'Bom', 'Avarias Leves', 'Defeito Crítico'].map((estado) => {
            const isSelected = estadoGeral === estado;
            return (
              <TouchableOpacity
                key={estado}
                style={[
                  styles.estadoChip,
                  isSelected && styles.estadoChipActive,
                  isSelected && estado === 'Defeito Crítico' && styles.estadoChipCritico
                ]}
                onPress={() => setEstadoGeral(estado)}
              >
                <Text style={[styles.estadoChipText, isSelected && styles.estadoChipTextActive]}>
                  {estado}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* RELATO DE OCORRÊNCIAS */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>4. Relato de Danos / Ocorrências (Opcional):</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Ex: Mouse da bancada 07 não responde, máquina 12 travando na inicialização..."
          placeholderTextColor={COLORS.neutralTexto}
          multiline
          numberOfLines={3}
          value={ocorrencias}
          onChangeText={setOcorrencias}
        />

        {/* BOTÃO DE CONFIRMAÇÃO */}
        <TouchableOpacity
          style={styles.btnFinalizar}
          onPress={handleFinalizarFechamento}
          activeOpacity={0.8}
        >
          <Text style={styles.btnFinalizarText}>✓ Concluir Fechamento e Liberar Sala</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// --- ESTILOS DO COMPONENTE ---
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutralFundo,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backButton: {
    marginBottom: 6,
  },
  backButtonText: {
    color: COLORS.greenIF,
    fontSize: 13,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.neutralTexto,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },

  labSelectorContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    padding: 6,
  },
  labRadioBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  labRadioBtnActive: {
    backgroundColor: COLORS.greenLight,
  },
  labRadioText: {
    fontSize: 12,
    color: COLORS.neutralDark,
  },
  labRadioTextActive: {
    color: COLORS.greenIF,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkIcon: {
    fontSize: 22,
    color: COLORS.neutralTexto,
  },
  checkIconChecked: {
    color: COLORS.greenIF,
  },
  checkTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  checkSubtitle: {
    fontSize: 11,
    color: COLORS.neutralTexto,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutralFundo,
    marginVertical: 6,
  },

  estadoGeralRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  estadoChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  estadoChipActive: {
    backgroundColor: COLORS.greenLight,
    borderColor: COLORS.greenIF,
  },
  estadoChipCritico: {
    backgroundColor: COLORS.redLight,
    borderColor: COLORS.redAccent,
  },
  estadoChipText: {
    fontSize: 12,
    color: COLORS.neutralDark,
  },
  estadoChipTextActive: {
    color: COLORS.greenIF,
    fontWeight: 'bold',
  },

  textArea: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: COLORS.black,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 16,
  },

  btnFinalizar: {
    backgroundColor: COLORS.greenIF,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnFinalizarText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },

  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
  }),
});

