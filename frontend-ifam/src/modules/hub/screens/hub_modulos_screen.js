import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useNotifications } from '../../../core/context/NotificationContext';
import { COLORS, RADIUS } from '../../../core/theme/colors';
import { InfoBanner } from '../components/InfoBanner';
import { ModuleCard } from '../components/ModuleCard';

const CAMPUS = 'IFAM - Campus Manaus Centro';

// Para incluir um módulo, acrescente um item aqui (seq_08, seção de extensibilidade).
function getModulos(perfil) {
  const administrador = perfil === 'Administrador';
  return [
    {
      route: 'MODULO_EQUIPAMENTOS',
      title: 'Empréstimo de Equipamentos',
      subtitle: 'Setor de Suporte e TI',
      description: 'Reserva de datashows, notebooks, adaptadores, caixas de som e controle de inventário com QR Code.',
      icon: '📦',
      tag: 'Ativo',
      tagColor: COLORS.greenIF,
      tagBackground: COLORS.greenLightBg,
      color: COLORS.greenIF,
      shortcuts: administrador
        ? [
            { label: 'Aprovações', route: 'APROVACOES_PENDENTES' },
            { label: 'Check-out (QR)', route: 'CHECKOUT' },
            { label: 'Inventário', route: 'INVENTARIO' },
          ]
        : [
            { label: 'Novo Pedido', route: 'CATALOGO_SOLICITANTE' },
            { label: 'Meus Empréstimos', route: 'MEUS_EMPRESTIMOS' },
          ],
    },
    {
      route: 'MODULO_LABORATORIOS',
      title: 'Alocação de Laboratórios',
      subtitle: 'Coordenação de Informática',
      description: 'Consulta de disponibilidade de salas, softwares instalados, agendamento de aulas práticas e eventos.',
      icon: '💻',
      tag: 'Novo',
      tagColor: COLORS.blueIF,
      tagBackground: COLORS.blueLightBg,
      color: COLORS.blueIF,
      shortcuts: administrador
        ? [
            { label: 'Grade Semestral', route: 'GRADE_LABS' },
            { label: 'Abertura (QR)', route: 'CHECKIN_LAB_PORTA' },
            { label: 'Softwares', route: 'GESTAO_SOFTWARES' },
          ]
        : [
            { label: 'Consultar Salas', route: 'CATALOGO_LABS' },
            { label: 'Solicitar Lab', route: 'SOLICITAR_LAB' },
          ],
    },
    {
      route: 'MODULO_AUDITORIOS',
      active: false,
      title: 'Auditórios e Salas Nobres',
      subtitle: 'Departamento de Eventos & Extensão',
      description: 'Agendamento para palestras, formaturas, bancas examinadoras e reuniões institucionais.',
      icon: '🏛️',
      tag: 'Em Breve',
      tagColor: COLORS.yellowIF,
      tagBackground: COLORS.yellowLightBg,
    },
    {
      route: 'MODULO_CHAVES',
      active: false,
      title: 'Gestão de Chaves e Acessos',
      subtitle: 'Prefeitura de Campus / Portaria',
      description: 'Retirada e devolução de chaves de salas de aula e departamentos com assinatura digital.',
      icon: '🔑',
      tag: 'Em Breve',
      tagColor: COLORS.yellowIF,
      tagBackground: COLORS.yellowLightBg,
    },
  ];
}

export default function HubModulosScreen({ usuario, onNavigate, onLogout, rotasDisponiveis = [] }) {
  const { quantidadeNaoLidas, erro } = useNotifications();

  if (!usuario) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.message}><Text style={styles.messageText}>Entre na sua conta para acessar os módulos.</Text></View>
      </SafeAreaView>
    );
  }

  const perfil = usuario.perfil;
  const notificationsEnabled = typeof onNavigate === 'function' && rotasDisponiveis.includes('PERFIL_NOTIFICACOES');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.greenIF} />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Olá, {usuario.nome_completo} 👋</Text>
            <Text style={styles.campus}>{CAMPUS}</Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>Perfil: {perfil}</Text>
            </View>
          </View>
          <TouchableOpacity
            accessibilityLabel="Abrir notificações"
            accessibilityState={{ disabled: !notificationsEnabled }}
            activeOpacity={0.8}
            disabled={!notificationsEnabled}
            style={[styles.notificationButton, !notificationsEnabled && styles.disabled]}
            onPress={() => onNavigate('PERFIL_NOTIFICACOES')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {quantidadeNaoLidas > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{quantidadeNaoLidas > 99 ? '99+' : quantidadeNaoLidas}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <InfoBanner
          title="Portal de Serviços IFAM"
          subtitle="Selecione abaixo o módulo desejado para realizar suas solicitações e acompanhar seus agendamentos."
        />

        {erro && <Text accessibilityRole="alert" style={styles.error}>{erro}</Text>}

        <Text style={styles.sectionTitle}>Módulos Institucionais</Text>
        {getModulos(perfil).map((module) => (
          <ModuleCard key={module.route} module={module} onNavigate={onNavigate} availableRoutes={rotasDisponiveis} />
        ))}

        <TouchableOpacity accessibilityLabel="Encerrar sessão" activeOpacity={0.8} style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Encerrar Sessão</Text>
        </TouchableOpacity>

        <Text style={styles.versionFooter}>IFAM Mobile v2.0 • Plataforma Multi-Módulos</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.neutralFundo },
  header: {
    backgroundColor: COLORS.greenIF,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerContent: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  userInfo: { flex: 1, paddingRight: 12 },
  greeting: { color: COLORS.white, fontSize: 22, fontWeight: 'bold', marginBottom: 2 },
  campus: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 13, marginBottom: 8 },
  profileBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  profileBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  notificationButton: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 22, padding: 10, position: 'relative' },
  notificationIcon: { fontSize: 20 },
  notificationBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.redAccent,
    borderColor: COLORS.greenIF,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 4,
    position: 'absolute',
    right: -4,
    top: -4,
  },
  notificationBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
  disabled: { opacity: 0.45 },
  scrollContent: { paddingBottom: 32, paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { color: COLORS.black, fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  error: { backgroundColor: COLORS.redLightBg, borderRadius: RADIUS.botao, color: COLORS.redAccent, fontSize: 13, marginBottom: 14, padding: 10 },
  logoutButton: { alignItems: 'center', backgroundColor: COLORS.neutralBorda, borderRadius: RADIUS.botao, marginBottom: 12, marginTop: 8, paddingVertical: 14 },
  logoutText: { color: COLORS.redAccent, fontSize: 15, fontWeight: 'bold' },
  versionFooter: { color: COLORS.neutralTexto, fontSize: 11, marginTop: 6, textAlign: 'center' },
  message: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 20 },
  messageText: { color: COLORS.neutralTexto, fontSize: 14, textAlign: 'center' },
});
