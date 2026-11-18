import { Platform, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS } from '../../../core/theme/colors';

export function InfoBanner({ title, subtitle, icon = '🏛️' }) {
  return (
    <View style={[styles.banner, styles.shadow]}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderLeftColor: COLORS.greenIF,
    borderLeftWidth: 4,
    borderRadius: RADIUS.card,
    flexDirection: 'row',
    marginBottom: 20,
    padding: 14,
  },
  shadow: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
    android: { elevation: 2 },
  }),
  icon: { marginRight: 12 },
  iconText: { fontSize: 24 },
  texts: { flex: 1 },
  title: { color: COLORS.black, fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  subtitle: { color: COLORS.neutralTexto, fontSize: 12, lineHeight: 16 },
});
