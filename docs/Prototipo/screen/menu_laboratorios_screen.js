import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
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
  redAccent: '#CD191E',
  warningYellow: '#FFC107',
  blueAccent: '#1976D2',
  blueLight: '#E3F2FD',
  black: '#000000',
  white: '#FFFFFF',
  neutralFundo: '#F5F5F5',
  neutralBorda: '#E0E0E0',
  neutralTexto: '#757575',
};

export default function MenuLaboratoriosScreen({ onNavigate, onBackToHub }) {
  // Estado para simular perfil (Solicitante / Administrador)
  const [perfilUsuario, setPerfilUsuario] = useState('Solicitante');
  const nomeUsuario = "Prof. Carlos Bento";

  const togglePerfil = () => {
    setPerfilUsuario(prev => prev === 'Solicitante' ? 'Administrador' : 'Solicitante');
  };

  // ==========================================
  // --- ITENS DE MENU POR PERFIL ---
  // ==========================================
  const menuSolicitante = [
    { id: 'catalogo_labs', titulo: 'Catálogo de Labs', icone: '🏫', acao: 'CATALOGO_LABS', desc: 'Consultar salas, capacidade e softwares' },
    { id: 'grade_horarios', titulo: 'Grade de Horários', icone: '📅', acao: 'GRADE_HORARIOS', desc: 'Ver disponibilidade semanal por turno' },
    { id: 'solicitar_lab', titulo: 'Solicitar Alocação', icone: '📝', acao: 'SOLICITAR_LAB', destaque: true, desc: 'Agendar lab para aula ou evento' },
    { id: 'checkin_porta', titulo: 'Check-in Abertura (QR)', icone: '📲', acao: 'CHECKIN_LAB', desc: 'Validar presença na porta da sala' },
    { id: 'checklist_fechamento', titulo: 'Fechamento de Aula', icone: '📋', acao: 'CHECKLIST_FECHAMENTO', desc: 'Checklist de encerramento e avarias' },
  ];

  const menuAdministrador = [
    { id: 'dashboard_labs', titulo: 'Dashboard & Ocupação', icone: '📊', acao: 'DASHBOARD_LABS', desc: 'KPIs e taxas de ocupação por turno' },
    { id: 'aprovacoes_labs', titulo: 'Aprovações Pendentes', icone: '✅', acao: 'APROVACOES_LABS', destaque: true, desc: 'Analisar e aprovar pedidos de alocação' },
    { id: 'catalogo_labs', titulo: 'Gestão de Salas', icone: '🏫', acao: 'CATALOGO_LABS', desc: 'Consultar e configurar laboratórios' },
    { id: 'grade_horarios', titulo: 'Grade Geral', icone: '📅', acao: 'GRADE_HORARIOS', desc: 'Visualizar grade mestra institucional' },
    { id: 'gestao_softwares', titulo: 'Gestão de Softwares', icone: '💾', acao: 'GESTAO_SOFTWARES', desc: 'CRUD de softwares e versões instaladas' },
    { id: 'checkin_porta', titulo: 'Check-in (Abertura)', icone: '📲', acao: 'CHECKIN_LAB', desc: 'Leitura QR Code na porta do lab' },
    { id: 'checklist_fechamento', titulo: 'Vistoria / Fechamento', icone: '📋', acao: 'CHECKLIST_FECHAMENTO', desc: 'Checklist de conferência de equipamentos' },
  ];

  const menuAtual = perfilUsuario === 'Administrador' ? menuAdministrador : menuSolicitante;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.greenIF} />

      {/* HEADER DO MÓDULO */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBackToHub || (() => Alert.alert('Voltar', 'Retornando ao Hub'))} style={styles.backBtn}>
            <Text style={styles.backBtnText}>◀ Hub de Módulos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerContent}>
          <View>
            <Text style={styles.moduloBadge}>MÓDULO 2 • INFORMÁTICA</Text>
            <Text style={styles.headerTitle}>Gestão de Laboratórios</Text>
            <Text style={styles.headerSubtitle}>Olá, {nomeUsuario} ({perfilUsuario})</Text>
          </View>
          <View style={styles.iconHeaderWrapper}>
            <Text style={{ fontSize: 32 }}>💻</Text>
          </View>
        </View>
      </View>

      {/* BOTÃO DE TESTE (ALTERNAR PERFIL) */}
      <TouchableOpacity style={styles.testBtn} onPress={togglePerfil} activeOpacity={0.8}>
        <Text style={styles.testBtnText}>
          🔄 Alternar visão para: {perfilUsuario === 'Solicitante' ? 'Administrador' : 'Solicitante'}
        </Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>

        <View style={styles.menuGrid}>
          {menuAtual.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuCard,
                item.destaque && styles.menuCardDestaque,
                Platform.OS === 'ios' ? styles.shadowIOS : styles.shadowAndroid
              ]}
              onPress={() => onNavigate ? onNavigate(item.acao) : Alert.alert('Navegação', `Acessando: ${item.titulo}`)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{item.icone}</Text>
                {item.destaque && (
                  <View style={styles.badgeDestaque}>
                    <Text style={styles.badgeDestaqueText}>Prioritário</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BANNER RÁPIDO DE SUPORTE */}
        <View style={[styles.helpCard, styles.shadowAndroid]}>
          <Text style={styles.helpTitle}>💡 Precisa de um software específico?</Text>
          <Text style={styles.helpDesc}>
            Solicite a instalação com pelo menos 48h de antecedência à equipe de TI do IFAM.
          </Text>
        </View>

        {/* BOTÃO VOLTAR AO HUB */}
        <TouchableOpacity
          style={styles.hubBtn}
          onPress={onBackToHub || (() => Alert.alert('Hub', 'Voltando ao Hub Geral'))}
          activeOpacity={0.8}
        >
          <Text style={styles.hubBtnText}>Voltar ao Hub Geral do IFAM</Text>
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
    backgroundColor: COLORS.greenIF,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    marginBottom: 10,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduloBadge: {
    color: COLORS.warningYellow,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginTop: 2,
  },
  iconHeaderWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  testBtn: {
    backgroundColor: COLORS.warningYellow,
    marginHorizontal: 20,
    marginTop: -14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  testBtnText: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 12,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 14,
  },

  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    backgroundColor: COLORS.white,
    width: '48%',
    minHeight: 150,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    justifyContent: 'flex-start',
  },
  menuCardDestaque: {
    borderColor: COLORS.greenIF,
    borderWidth: 1.5,
    backgroundColor: '#F7FCF7',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 28,
  },
  badgeDestaque: {
    backgroundColor: COLORS.greenIF,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeDestaqueText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11,
    color: COLORS.neutralTexto,
    lineHeight: 15,
  },

  helpCard: {
    backgroundColor: COLORS.blueLight,
    borderRadius: 10,
    padding: 14,
    marginTop: 6,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.blueAccent,
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.blueAccent,
    marginBottom: 4,
  },
  helpDesc: {
    fontSize: 12,
    color: COLORS.black,
    lineHeight: 17,
  },

  hubBtn: {
    backgroundColor: COLORS.neutralBorda,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  hubBtnText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '600',
  },

  shadowIOS: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  shadowAndroid: {
    elevation: 2,
  },
});

