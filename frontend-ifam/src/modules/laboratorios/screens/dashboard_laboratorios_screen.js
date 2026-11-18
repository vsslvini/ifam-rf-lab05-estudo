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

export default function DashboardLaboratoriosScreen({ onBackToMenu, onNavigate }) {
  const [periodoFiltro, setPeriodoFiltro] = useState('Semana');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.neutralFundo} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToMenu} style={styles.backButton}>
          <Text style={styles.backButtonText}>◀ Menu de Laboratórios</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Dashboard de Labs</Text>
            <Text style={styles.headerSubtitle}>Indicadores de ocupação e eficiência do IFAM</Text>
          </View>
          <View style={styles.filtroPeriodoBox}>
            {['Semana', 'Mês'].map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodoBtn, periodoFiltro === p && styles.periodoBtnActive]}
                onPress={() => setPeriodoFiltro(p)}
              >
                <Text style={[styles.periodoBtnText, periodoFiltro === p && styles.periodoBtnTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* GRID DE KPIS PRINCIPAIS */}
        <View style={styles.kpiGrid}>
          {/* KPI 1: Taxa de Ocupação */}
          <View style={[styles.kpiCard, styles.shadow]}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiIcon}>📈</Text>
              <View style={[styles.kpiBadge, { backgroundColor: COLORS.greenLight }]}>
                <Text style={[styles.kpiBadgeText, { color: COLORS.greenIF }]}>+5% vs mês ant.</Text>
              </View>
            </View>
            <Text style={styles.kpiValue}>78%</Text>
            <Text style={styles.kpiTitle}>Taxa de Ocupação Média</Text>
          </View>

          {/* KPI 2: Labs em Uso Agora */}
          <View style={[styles.kpiCard, styles.shadow]}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiIcon}>💻</Text>
              <View style={[styles.kpiBadge, { backgroundColor: COLORS.blueLight }]}>
                <Text style={[styles.kpiBadgeText, { color: COLORS.blueAccent }]}>Ao Vivo</Text>
              </View>
            </View>
            <Text style={styles.kpiValue}>3 <Text style={{ fontSize: 16, color: COLORS.neutralTexto }}>/ 5</Text></Text>
            <Text style={styles.kpiTitle}>Laboratórios em Uso</Text>
          </View>

          {/* KPI 3: Total de Aulas / Alocações */}
          <View style={[styles.kpiCard, styles.shadow]}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiIcon}>📅</Text>
              <View style={[styles.kpiBadge, { backgroundColor: COLORS.greenLight }]}>
                <Text style={[styles.kpiBadgeText, { color: COLORS.greenIF }]}>Hoje</Text>
              </View>
            </View>
            <Text style={styles.kpiValue}>14</Text>
            <Text style={styles.kpiTitle}>Aulas Agendadas Hoje</Text>
          </View>

          {/* KPI 4: Manutenções / Ocorrências */}
          <View style={[styles.kpiCard, styles.shadow]}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiIcon}>🛠️</Text>
              <View style={[styles.kpiBadge, { backgroundColor: COLORS.redLight }]}>
                <Text style={[styles.kpiBadgeText, { color: COLORS.redAccent }]}>1 Lab</Text>
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: COLORS.redAccent }]}>3</Text>
            <Text style={styles.kpiTitle}>Máquinas em Manutenção</Text>
          </View>
        </View>

        {/* OCUPAÇÃO POR TURNO (BARRAS VISUAIS) */}
        <View style={[styles.sectionCard, styles.shadow]}>
          <Text style={styles.sectionCardTitle}>📊 Ocupação por Turno</Text>
          
          {/* Matutino */}
          <View style={styles.barItem}>
            <View style={styles.barItemHeader}>
              <Text style={styles.barItemLabel}>🌅 Matutino (07:30 - 12:00)</Text>
              <Text style={styles.barItemPercent}>85% ocupado</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: '85%', backgroundColor: COLORS.greenIF }]} />
            </View>
          </View>

          {/* Vespertino */}
          <View style={styles.barItem}>
            <View style={styles.barItemHeader}>
              <Text style={styles.barItemLabel}>☀️ Vespertino (13:30 - 17:50)</Text>
              <Text style={styles.barItemPercent}>72% ocupado</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: '72%', backgroundColor: COLORS.blueAccent }]} />
            </View>
          </View>

          {/* Noturno */}
          <View style={styles.barItem}>
            <View style={styles.barItemHeader}>
              <Text style={styles.barItemLabel}>🌙 Noturno (18:30 - 22:00)</Text>
              <Text style={styles.barItemPercent}>60% ocupado</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: '60%', backgroundColor: COLORS.warningYellow }]} />
            </View>
          </View>
        </View>

        {/* RANKING DE LABORATÓRIOS MAIS REQUISITADOS */}
        <View style={[styles.sectionCard, styles.shadow]}>
          <Text style={styles.sectionCardTitle}>🏆 Laboratórios Mais Demandados</Text>
          
          <View style={styles.rankItem}>
            <Text style={styles.rankPos}>1º</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.rankTitle}>Lab 02 - Desenvolvimento de Software</Text>
              <Text style={styles.rankSub}>42 horas de aula nesta semana</Text>
            </View>
            <Text style={styles.rankBadge}>92% uso</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.rankItem}>
            <Text style={styles.rankPos}>2º</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.rankTitle}>Lab 01 - Redes e Infraestrutura</Text>
              <Text style={styles.rankSub}>36 horas de aula nesta semana</Text>
            </View>
            <Text style={styles.rankBadge}>80% uso</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.rankItem}>
            <Text style={styles.rankPos}>3º</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.rankTitle}>Lab 03 - Computação Gráfica & CAD</Text>
              <Text style={styles.rankSub}>28 horas de aula nesta semana</Text>
            </View>
            <Text style={styles.rankBadge}>65% uso</Text>
          </View>
        </View>

        {/* ALERTAS DA EQUIPE DE TI */}
        <View style={[styles.sectionCard, styles.shadow]}>
          <Text style={styles.sectionCardTitle}>🔔 Alertas Recentes da TI</Text>
          <View style={styles.alertItem}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.alertTitle}>Manutenção Preventiva - Lab 05</Text>
              <Text style={styles.alertSub}>Bancadas 03 e 04 com troca de fonte programada para sexta 14h.</Text>
            </View>
          </View>
        </View>

        {/* BOTÃO PARA GRADE GERAL */}
        <TouchableOpacity
          style={styles.btnAcaoRapida}
          onPress={() => onNavigate ? onNavigate('GRADE_HORARIOS') : Alert.alert('Grade', 'Abrindo Grade Geral')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnAcaoRapidaText}>Visualizar Grade Semestral Completa ➔</Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  filtroPeriodoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    padding: 2,
  },
  periodoBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  periodoBtnActive: {
    backgroundColor: COLORS.greenLight,
  },
  periodoBtnText: {
    fontSize: 11,
    color: COLORS.neutralDark,
  },
  periodoBtnTextActive: {
    color: COLORS.greenIF,
    fontWeight: 'bold',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 10,
  },
  kpiCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiIcon: {
    fontSize: 20,
  },
  kpiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  kpiBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 2,
  },
  kpiTitle: {
    fontSize: 11,
    color: COLORS.neutralTexto,
    lineHeight: 14,
  },

  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },

  barItem: {
    marginBottom: 12,
  },
  barItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barItemLabel: {
    fontSize: 12,
    color: COLORS.neutralDark,
    fontWeight: '500',
  },
  barItemPercent: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.neutralFundo,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },

  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rankPos: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.greenIF,
    width: 24,
  },
  rankTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  rankSub: {
    fontSize: 11,
    color: COLORS.neutralTexto,
  },
  rankBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.neutralDark,
    backgroundColor: COLORS.neutralFundo,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutralFundo,
    marginVertical: 4,
  },

  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    padding: 10,
    borderRadius: 8,
  },
  alertIcon: {
    fontSize: 20,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E65100',
  },
  alertSub: {
    fontSize: 11,
    color: COLORS.black,
    lineHeight: 15,
  },

  btnAcaoRapida: {
    backgroundColor: COLORS.greenIF,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  btnAcaoRapidaText: {
    color: COLORS.white,
    fontSize: 13,
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

