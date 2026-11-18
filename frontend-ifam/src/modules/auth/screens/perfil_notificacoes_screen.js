import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNotifications } from '../../../core/context/NotificationContext';
import { COLORS, RADIUS } from '../../../core/theme/colors';

// Filtros por módulo de origem (seq_05: EQUIPAMENTOS, LABORATORIOS, SISTEMA).
const FILTERS = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'EQUIPAMENTOS', label: 'Equipamentos' },
  { id: 'LABORATORIOS', label: 'Laboratórios' },
  { id: 'SISTEMA', label: 'Sistema' },
];

const MODULE_LABELS = {
  EQUIPAMENTOS: 'Equipamentos',
  LABORATORIOS: 'Laboratórios',
  SISTEMA: 'Sistema',
};

// Cor semântica e ícone por tipo_evento (mesma regra da tela original do Design System V2).
function getEventStyle(tipoEvento) {
  if (tipoEvento === 'Alerta_Atraso') return { color: COLORS.redAccent, icon: '🚨' };
  if (tipoEvento.endsWith('_Rejeitada')) return { color: COLORS.redAccent, icon: '❌' };
  if (tipoEvento.startsWith('Lembrete_')) return { color: COLORS.yellowIF, icon: '⚠️' };
  if (tipoEvento.endsWith('_Aprovada')) return { color: COLORS.greenIF, icon: '✅' };
  return { color: COLORS.neutralTexto, icon: '🔔' };
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function getInitials(name) {
  const names = name.trim().split(/\s+/);
  if (names.length > 1) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export default function PerfilNotificacoesScreen({ usuario, onBack, onBackToMenu }) {
  const { notificacoes, quantidadeNaoLidas, carregando, erro, carregarNotificacoes, marcarComoLida } = useNotifications();
  const [filter, setFilter] = useState('TODAS');

  const filteredNotifications = useMemo(
    () => notificacoes.filter((item) => filter === 'TODAS' || item.modulo_origem === filter),
    [filter, notificacoes]
  );

  if (!usuario) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}><Text style={styles.emptyText}>Entre na sua conta para consultar os alertas.</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.neutralFundo} />

      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Voltar ao menu principal" style={styles.backButton} onPress={onBack || onBackToMenu}>
          <Text style={styles.backText}>◀ Menu Principal</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil e Alertas</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(usuario.nome_completo)}</Text></View>
        <View style={styles.profileText}>
          <Text style={styles.name}>{usuario.nome_completo}</Text>
          <Text style={styles.email}>{usuario.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{usuario.perfil}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Minhas Notificações</Text>
        {quantidadeNaoLidas > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{quantidadeNaoLidas} novas</Text>
          </View>
        )}
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id_notificacao}
        renderItem={({ item }) => {
          const unread = !item.status_leitura;
          const { color, icon } = getEventStyle(item.tipo_evento);
          return (
            <TouchableOpacity
              accessibilityLabel={`Notificação: ${item.mensagem_corpo}`}
              activeOpacity={0.7}
              onPress={() => marcarComoLida(item.id_notificacao)}
              style={[styles.card, styles.shadow, { borderLeftColor: color }, unread ? styles.cardUnread : styles.cardRead]}
            >
              <View style={styles.cardIconBox}>
                <Text style={styles.cardIcon}>{icon}</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.date}>{formatDate(item.data_hora_envio)}</Text>
                  <View style={styles.cardHeaderRight}>
                    <Text style={[styles.module, { color: COLORS.neutralTexto }]}>{MODULE_LABELS[item.modulo_origem] ?? item.modulo_origem}</Text>
                    {unread && <View style={styles.unreadDot} />}
                  </View>
                </View>
                <Text style={[styles.message, unread && styles.unreadMessage]}>{item.mensagem_corpo}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListHeaderComponent={
          <View style={styles.filters}>
            {FILTERS.map((item) => (
              <TouchableOpacity
                accessibilityLabel={`Filtrar por ${item.label}`}
                key={item.id}
                onPress={() => setFilter(item.id)}
                style={[styles.filter, filter === item.id && styles.filterActive]}
              >
                <Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        }
        ListEmptyComponent={
          carregando ? (
            <View style={styles.empty}><ActivityIndicator color={COLORS.greenIF} /><Text style={styles.emptyText}>Carregando notificações...</Text></View>
          ) : (
            <View style={styles.empty}><Text style={styles.emptyText}>Você não possui nenhuma notificação{filter === 'TODAS' ? '.' : ' neste filtro.'}</Text></View>
          )
        }
        ListFooterComponent={erro ? <Text accessibilityRole="alert" style={styles.error}>{erro}</Text> : null}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregarNotificacoes} tintColor={COLORS.greenIF} colors={[COLORS.greenIF]} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.neutralFundo },

  header: { backgroundColor: COLORS.neutralFundo, paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { marginBottom: 8 },
  backText: { color: COLORS.greenIF, fontSize: 14, fontWeight: '600' },
  headerTitle: { color: COLORS.black, fontSize: 24, fontWeight: 'bold' },

  profileSection: { alignItems: 'center', backgroundColor: COLORS.neutralFundo, flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16 },
  avatar: { alignItems: 'center', backgroundColor: COLORS.greenIF, borderRadius: 32, height: 64, justifyContent: 'center', marginRight: 16, width: 64 },
  avatarText: { color: COLORS.white, fontSize: 24, fontWeight: 'bold' },
  profileText: { flex: 1 },
  name: { color: COLORS.black, fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  email: { color: COLORS.neutralTexto, fontSize: 14, marginBottom: 6 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: COLORS.neutralBorda, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  roleBadgeText: { color: COLORS.black, fontSize: 12, fontWeight: '600' },

  divider: { backgroundColor: COLORS.neutralBorda, height: 1, marginBottom: 16, marginHorizontal: 20 },

  listHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, paddingHorizontal: 20 },
  listTitle: { color: COLORS.black, fontSize: 18, fontWeight: 'bold' },
  unreadBadge: { backgroundColor: COLORS.redAccent, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  unreadBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },

  listContent: { paddingBottom: 40, paddingHorizontal: 20 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 12 },
  filter: { backgroundColor: COLORS.white, borderColor: COLORS.neutralBorda, borderRadius: RADIUS.chip, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  filterActive: { backgroundColor: COLORS.greenIF, borderColor: COLORS.greenIF },
  filterText: { color: COLORS.neutralTextoEscuro, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: COLORS.white },

  card: { borderColor: COLORS.neutralBorda, borderLeftWidth: 6, borderRadius: RADIUS.botao, borderWidth: 1, flexDirection: 'row', marginBottom: 12, padding: 16 },
  cardUnread: { backgroundColor: COLORS.white },
  cardRead: { backgroundColor: '#FAFAFA', opacity: 0.8 },
  shadow: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    android: { elevation: 1 },
  }),
  cardIconBox: { justifyContent: 'flex-start', marginRight: 12, paddingTop: 2 },
  cardIcon: { fontSize: 20 },
  cardContent: { flex: 1 },
  cardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardHeaderRight: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  date: { color: COLORS.neutralTexto, fontSize: 12 },
  module: { fontSize: 11, fontWeight: '700' },
  unreadDot: { backgroundColor: COLORS.greenIF, borderRadius: 4, height: 8, width: 8 },
  message: { color: COLORS.black, fontSize: 14, lineHeight: 20 },
  unreadMessage: { fontWeight: 'bold' },

  empty: { alignItems: 'center', gap: 10, justifyContent: 'center', paddingHorizontal: 20, paddingTop: 40 },
  emptyText: { color: COLORS.neutralTexto, fontSize: 14, textAlign: 'center' },
  error: { color: COLORS.redAccent, fontSize: 13, paddingTop: 8, textAlign: 'center' },
});
