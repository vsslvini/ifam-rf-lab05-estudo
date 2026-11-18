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

const laboratoriosDisponiveis = [
  { id: 'lab-01', nome: 'Lab 01 - Redes (32 máq)', capacidade: 32 },
  { id: 'lab-02', nome: 'Lab 02 - Dev Software (36 máq)', capacidade: 36 },
  { id: 'lab-03', nome: 'Lab 03 - CAD & Gráfica (24 máq)', capacidade: 24 },
  { id: 'lab-04', nome: 'Lab 04 - Informática Geral (40 máq)', capacidade: 40 },
  { id: 'lab-05', nome: 'Lab 05 - Hardware & Maker (20 máq)', capacidade: 20 },
];

const temposDisponiveis = [
  '1º e 2º Tempo (07:30 - 09:10)',
  '3º e 4º Tempo (09:30 - 11:10)',
  '5º Tempo (11:10 - 12:00)',
];

const softwaresComuns = ['VS Code', 'Cisco Packet Tracer', 'AutoCAD', 'Docker', 'Python 3.12', 'PostgreSQL', 'Wireshark', 'Blender'];

export default function SolicitacaoAlocacaoLabScreen({ onBackToMenu, onSalvarSucesso }) {
  const [labSelecionado, setLabSelecionado] = useState(laboratoriosDisponiveis[0].id);
  const [tipoAlocacao, setTipoAlocacao] = useState('Pontual'); // 'Pontual' ou 'Semestral'
  const [dataAgendamento, setDataAgendamento] = useState('28/08/2026');
  const [turno, setTurno] = useState('Matutino');
  const [temposSelecionados, setTemposSelecionados] = useState([temposDisponiveis[0]]);
  
  const [disciplina, setDisciplina] = useState('');
  const [curso, setCurso] = useState('');
  const [qtdAlunos, setQtdAlunos] = useState('');
  const [softwaresNecessarios, setSoftwaresNecessarios] = useState(['VS Code']);
  const [justificativa, setJustificativa] = useState('');

  const toggleTempo = (tempo) => {
    if (temposSelecionados.includes(tempo)) {
      if (temposSelecionados.length > 1) {
        setTemposSelecionados(temposSelecionados.filter(t => t !== tempo));
      }
    } else {
      setTemposSelecionados([...temposSelecionados, tempo]);
    }
  };

  const toggleSoftware = (soft) => {
    if (softwaresNecessarios.includes(soft)) {
      setSoftwaresNecessarios(softwaresNecessarios.filter(s => s !== soft));
    } else {
      setSoftwaresNecessarios([...softwaresNecessarios, soft]);
    }
  };

  const handleSubmeter = () => {
    if (!disciplina.trim() || !curso.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha a disciplina e o curso.');
      return;
    }

    const labObj = laboratoriosDisponiveis.find(l => l.id === labSelecionado);
    if (qtdAlunos && parseInt(qtdAlunos) > labObj.capacidade) {
      Alert.alert(
        'Aviso de Capacidade',
        `A turma informada (${qtdAlunos} alunos) excede a capacidade do ${labObj.nome} (${labObj.capacidade} máquinas).`
      );
      return;
    }

    Alert.alert(
      '✅ Solicitação Enviada!',
      `Sua alocação para o ${labObj.nome} no dia ${dataAgendamento} (${turno}) foi enviada para a coordenação de TI.\n\nStatus: Pendente de Aprovação.`,
      [
        {
          text: 'OK',
          onPress: () => {
            if (onSalvarSucesso) onSalvarSucesso();
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
        <Text style={styles.headerTitle}>Solicitar Alocação de Lab</Text>
        <Text style={styles.headerSubtitle}>Formulário oficial de agendamento de aulas e eventos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* TIPO DE ALOCAÇÃO */}
        <View style={styles.tipoAlocacaoRow}>
          <TouchableOpacity
            style={[styles.tipoBtn, tipoAlocacao === 'Pontual' && styles.tipoBtnActive]}
            onPress={() => setTipoAlocacao('Pontual')}
          >
            <Text style={[styles.tipoBtnText, tipoAlocacao === 'Pontual' && styles.tipoBtnTextActive]}>
              📅 Aula Pontual / Reposição
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tipoBtn, tipoAlocacao === 'Semestral' && styles.tipoBtnActive]}
            onPress={() => setTipoAlocacao('Semestral')}
          >
            <Text style={[styles.tipoBtnText, tipoAlocacao === 'Semestral' && styles.tipoBtnTextActive]}>
              🗓️ Semestral Recorrente
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. SELEÇÃO DO LABORATÓRIO */}
        <Text style={styles.fieldLabel}>1. Escolha o Laboratório *</Text>
        <View style={styles.labOptionsContainer}>
          {laboratoriosDisponiveis.map((lab) => {
            const isSelected = labSelecionado === lab.id;
            return (
              <TouchableOpacity
                key={lab.id}
                style={[styles.labRadioCard, isSelected && styles.labRadioCardActive]}
                onPress={() => setLabSelecionado(lab.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                  {isSelected && <View style={styles.radioInnerDot} />}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.labRadioTitle, isSelected && styles.labRadioTitleActive]}>
                    {lab.nome}
                  </Text>
                  <Text style={styles.labRadioCap}>Capacidade máxima: {lab.capacidade} alunos</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. DATA E TURNO */}
        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>2. Data e Turno *</Text>
        <View style={styles.rowInputs}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.subFieldLabel}>Data prevista:</Text>
            <TextInput
              style={styles.textInput}
              value={dataAgendamento}
              onChangeText={setDataAgendamento}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={COLORS.neutralTexto}
            />
          </View>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.subFieldLabel}>Turno:</Text>
            <View style={styles.turnoMiniSelector}>
              {['Matutino', 'Vespertino', 'Noturno'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.turnoMiniBtn, turno === t && styles.turnoMiniBtnActive]}
                  onPress={() => setTurno(t)}
                >
                  <Text style={[styles.turnoMiniBtnText, turno === t && styles.turnoMiniBtnTextActive]}>
                    {t.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 3. TEMPOS DE AULA */}
        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>3. Tempos de Aula (Selecione um ou mais) *</Text>
        {temposDisponiveis.map((tempo) => {
          const isSelected = temposSelecionados.includes(tempo);
          return (
            <TouchableOpacity
              key={tempo}
              style={[styles.tempoCheckCard, isSelected && styles.tempoCheckCardActive]}
              onPress={() => toggleTempo(tempo)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tempoCheckIcon, isSelected && styles.tempoCheckIconActive]}>
                {isSelected ? '☑' : '☐'}
              </Text>
              <Text style={[styles.tempoCheckLabel, isSelected && styles.tempoCheckLabelActive]}>
                {tempo}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* 4. DADOS DA DISCIPLINA */}
        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>4. Dados Acadêmicos *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Nome da Disciplina (ex: Algoritmos e Programação)"
          placeholderTextColor={COLORS.neutralTexto}
          value={disciplina}
          onChangeText={setDisciplina}
        />

        <View style={[styles.rowInputs, { marginTop: 8 }]}>
          <View style={{ flex: 2, marginRight: 8 }}>
            <TextInput
              style={styles.textInput}
              placeholder="Curso / Turma (ex: TADS 3º Per)"
              placeholderTextColor={COLORS.neutralTexto}
              value={curso}
              onChangeText={setCurso}
            />
          </View>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <TextInput
              style={styles.textInput}
              placeholder="Nº Alunos"
              placeholderTextColor={COLORS.neutralTexto}
              keyboardType="numeric"
              value={qtdAlunos}
              onChangeText={setQtdAlunos}
            />
          </View>
        </View>

        {/* 5. SOFTWARES NECESSÁRIOS */}
        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>5. Softwares Necessários para a Aula:</Text>
        <View style={styles.softChipsRow}>
          {softwaresComuns.map((soft) => {
            const isSelected = softwaresNecessarios.includes(soft);
            return (
              <TouchableOpacity
                key={soft}
                style={[styles.softChip, isSelected && styles.softChipActive]}
                onPress={() => toggleSoftware(soft)}
              >
                <Text style={[styles.softChipText, isSelected && styles.softChipTextActive]}>
                  {isSelected ? '✓ ' : '+ '} {soft}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* JUSTIFICATIVA */}
        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>6. Justificativa / Observações (Opcional):</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Informe detalhes sobre o plano de aula prática ou necessidades extras (ex: projetor, internet liberada)..."
          placeholderTextColor={COLORS.neutralTexto}
          multiline
          numberOfLines={3}
          value={justificativa}
          onChangeText={setJustificativa}
        />

        {/* ALERTA INFORMATIVO */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            ℹ️ <Text style={styles.bold}>Aviso:</Text> Alocações entram com status <Text style={styles.bold}>Pendente</Text> e são avaliadas pela TI/Coordenação para evitar conflitos de horário.
          </Text>
        </View>

        {/* BOTÃO DE SUBMISSÃO */}
        <TouchableOpacity style={styles.btnSubmeter} onPress={handleSubmeter} activeOpacity={0.8}>
          <Text style={styles.btnSubmeterText}>Enviar Solicitação de Alocação</Text>
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

  tipoAlocacaoRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    padding: 3,
    marginBottom: 16,
    marginTop: 6,
  },
  tipoBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tipoBtnActive: {
    backgroundColor: COLORS.greenLight,
  },
  tipoBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.neutralDark,
  },
  tipoBtnTextActive: {
    color: COLORS.greenIF,
    fontWeight: 'bold',
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  subFieldLabel: {
    fontSize: 11,
    color: COLORS.neutralTexto,
    marginBottom: 4,
    fontWeight: '600',
  },

  labOptionsContainer: {
    marginBottom: 4,
  },
  labRadioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
  },
  labRadioCardActive: {
    borderColor: COLORS.greenIF,
    backgroundColor: '#F7FCF7',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.neutralTexto,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: COLORS.greenIF,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.greenIF,
  },
  labRadioTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
  },
  labRadioTitleActive: {
    color: COLORS.greenIF,
    fontWeight: 'bold',
  },
  labRadioCap: {
    fontSize: 11,
    color: COLORS.neutralTexto,
  },

  rowInputs: {
    flexDirection: 'row',
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.black,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },

  turnoMiniSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    borderRadius: 8,
    padding: 2,
    height: 42,
    alignItems: 'center',
  },
  turnoMiniBtn: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  turnoMiniBtnActive: {
    backgroundColor: COLORS.greenLight,
  },
  turnoMiniBtnText: {
    fontSize: 11,
    color: COLORS.neutralDark,
  },
  turnoMiniBtnTextActive: {
    color: COLORS.greenIF,
    fontWeight: 'bold',
  },

  tempoCheckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  tempoCheckCardActive: {
    borderColor: COLORS.greenIF,
    backgroundColor: '#F7FCF7',
  },
  tempoCheckIcon: {
    fontSize: 16,
    color: COLORS.neutralTexto,
    marginRight: 8,
  },
  tempoCheckIconActive: {
    color: COLORS.greenIF,
  },
  tempoCheckLabel: {
    fontSize: 12,
    color: COLORS.neutralDark,
  },
  tempoCheckLabelActive: {
    color: COLORS.black,
    fontWeight: '600',
  },

  softChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  softChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
    marginBottom: 6,
  },
  softChipActive: {
    backgroundColor: COLORS.blueLight,
    borderColor: COLORS.blueAccent,
  },
  softChipText: {
    fontSize: 11,
    color: COLORS.neutralDark,
  },
  softChipTextActive: {
    color: COLORS.blueAccent,
    fontWeight: 'bold',
  },

  infoBox: {
    backgroundColor: COLORS.warningLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warningYellow,
    padding: 10,
    borderRadius: 8,
    marginTop: 14,
    marginBottom: 16,
  },
  infoBoxText: {
    fontSize: 12,
    color: COLORS.black,
    lineHeight: 16,
  },
  bold: {
    fontWeight: 'bold',
  },

  btnSubmeter: {
    backgroundColor: COLORS.greenIF,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnSubmeterText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

