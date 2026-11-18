import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, RADIUS } from '../../../core/theme/colors';

// Somente rotas registradas pelo navegador (availableRoutes) ficam habilitadas.
export function ModuleCard({ module, onNavigate, availableRoutes = [] }) {
  const canNavigate = (route) => typeof onNavigate === 'function' && availableRoutes.includes(route);
  const active = module.active !== false;
  const available = active && canNavigate(module.route);
  const shortcuts = module.shortcuts ?? [];

  return (
    <View style={[styles.card, active && styles.cardHighlight, styles.shadow]}>
      <TouchableOpacity
        accessibilityLabel={`Módulo ${module.title}`}
        accessibilityState={{ disabled: !available }}
        activeOpacity={0.7}
        disabled={!available}
        style={styles.headerArea}
        onPress={() => onNavigate(module.route)}
      >
        <View style={styles.iconAndTitle}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>{module.icon}</Text>
          </View>
          <View style={styles.titleArea}>
            <Text style={styles.title}>{module.title}</Text>
            <Text style={styles.subtitle}>{module.subtitle}</Text>
          </View>
        </View>
        <View style={[styles.tag, { backgroundColor: module.tagBackground }]}>
          <Text style={[styles.tagText, { color: module.tagColor }]}>{module.tag}</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.description}>{module.description}</Text>

      {active ? (
        <>
          <View style={styles.divider} />
          <View style={styles.shortcuts}>
            {shortcuts.map((shortcut) => {
              const enabled = canNavigate(shortcut.route);
              return (
                <TouchableOpacity
                  key={shortcut.route}
                  accessibilityLabel={shortcut.label}
                  accessibilityState={{ disabled: !enabled }}
                  activeOpacity={0.7}
                  disabled={!enabled}
                  style={[styles.shortcut, !enabled && styles.disabled]}
                  onPress={() => onNavigate(shortcut.route)}
                >
                  <Text style={styles.shortcutText}>⚡ {shortcut.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            accessibilityLabel={`Acessar módulo ${module.title}`}
            accessibilityState={{ disabled: !available }}
            activeOpacity={0.8}
            disabled={!available}
            style={[styles.accessButton, { backgroundColor: module.color }, !available && styles.disabled]}
            onPress={() => onNavigate(module.route)}
          >
            <Text style={styles.accessButtonText}>{available ? 'Acessar Módulo ➔' : 'Indisponível'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.soonFooter}>
          <Text style={styles.soonText}>Disponível nas próximas atualizações</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.neutralBorda,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  cardHighlight: { borderColor: '#C8E6C9' },
  shadow: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
    android: { elevation: 2 },
  }),
  headerArea: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  iconAndTitle: { alignItems: 'center', flex: 1, flexDirection: 'row', marginRight: 8 },
  iconBox: { alignItems: 'center', backgroundColor: COLORS.neutralFundo, borderRadius: 10, height: 44, justifyContent: 'center', marginRight: 12, width: 44 },
  icon: { fontSize: 24 },
  titleArea: { flex: 1 },
  title: { color: COLORS.black, fontSize: 16, fontWeight: 'bold' },
  subtitle: { color: COLORS.neutralTexto, fontSize: 12, marginTop: 1 },
  tag: { borderRadius: RADIUS.badge, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, fontWeight: 'bold' },
  description: { color: COLORS.neutralTextoEscuro, fontSize: 13, lineHeight: 18, marginBottom: 12 },
  divider: { backgroundColor: COLORS.neutralFundo, height: 1, marginBottom: 12 },
  shortcuts: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  shortcut: {
    backgroundColor: COLORS.neutralFundo,
    borderColor: COLORS.neutralBorda,
    borderRadius: RADIUS.chip,
    borderWidth: 1,
    marginBottom: 6,
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  shortcutText: { color: COLORS.neutralTextoEscuro, fontSize: 11, fontWeight: '600' },
  accessButton: { alignItems: 'center', borderRadius: RADIUS.botao, marginTop: 6, paddingVertical: 10 },
  accessButtonText: { color: COLORS.white, fontSize: 13, fontWeight: 'bold' },
  disabled: { opacity: 0.45 },
  soonFooter: { borderTopColor: COLORS.neutralFundo, borderTopWidth: 1, marginTop: 4, paddingTop: 8 },
  soonText: { color: COLORS.neutralTexto, fontSize: 12, fontStyle: 'italic' },
});
