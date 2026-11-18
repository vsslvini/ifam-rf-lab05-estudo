import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, FlatList, Platform } from 'react-native';

// Constantes de Design do IFAM
const COLORS = {
  greenIF: '#2F9E41',
  redAccent: '#CD191E',
  warningYellow: '#FFC107',
  black: '#000000',
  white: '#FFFFFF',
  neutralFundo: '#F5F5F5',
  neutralBorda: '#E0E0E0',
  neutralTexto: '#757575',
};

// Dados Simulados de Toda a Instituição (RF06)
const mockHistoricoGlobal = [
  { id: '1', solicitante: 'Carlos Bento', patrimonio: 'PAT-102030', equipamento: 'Datashow Epson X39', retirada: '18/08/2026 14:00', devolucao: '18/08/2026 18:00', status: 'Em_Andamento' },
  { id: '2', solicitante: 'Ana Silva', patrimonio: 'PAT-405060', equipamento: 'Notebook Dell', retirada: '17/08/2026 08:00', devolucao: '17/08/2026 12:00', status: 'Concluido' },
  { id: '3', solicitante: 'Marcos Souza', patrimonio: 'PAT-708090', equipamento: 'Cabo HDMI 2m', retirada: '15/08/2026 10:00', devolucao: '15/08/2026 12:00', status: 'Atrasado' },
  { id: '4', solicitante: 'Juliana Costa', patrimonio: 'PAT-112233', equipamento: 'Extensão Elétrica', retirada: '14/08/2026 14:00', devolucao: '14/08/2026 16:00', status: 'Concluido' },
];

export default function HistoricoGlobalAdminScreen({ onBackToMenu }) {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  const filtros = ['Todos', 'Em_Andamento', 'Atrasado', 'Concluido'];

  // Lógica de Busca e Filtragem
  const filteredData = mockHistoricoGlobal.filter(item => {
    const matchesFilter = selectedFilter === 'Todos' || item.status === selectedFilter;
    const matchesSearch = searchText === '' || 
      item.solicitante.toLowerCase().includes(searchText.toLowerCase()) ||
      item.patrimonio.toLowerCase().includes(searchText.toLowerCase()) ||
      item.equipamento.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Em_Andamento': return COLORS.greenIF;
      case 'Atrasado': return COLORS.redAccent;
      case 'Concluido': return COLORS.neutralTexto;
      default: return COLORS.black;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.neutralFundo} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToMenu} style={styles.backButton}>
          <Text style={styles.backButtonText}>◀ Menu Principal</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico Global</Text>
      </View>

      {/* Busca e Filtros */}
      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar por solicitante, patrimônio ou recurso..."
          placeholderTextColor={COLORS.neutralTexto}
          value={searchText}
          onChangeText={setSearchText}
        />

        <View style={styles.chipContainer}>
          {filtros.map((filtro) => (
            <TouchableOpacity
              key={filtro}
              style={[styles.chip, selectedFilter === filtro && styles.chipSelected]}
              onPress={() => setSelectedFilter(filtro)}
            >
              <Text style={[styles.chipText, selectedFilter === filtro && styles.chipTextSelected]}>
                {filtro.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lista de Registros */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.card, Platform.OS === 'ios' ? styles.cardShadowIOS : styles.cardShadowAndroid]}>
            
            {/* CABEÇALHO DO CARD - STATUS ACIMA DO NOME */}
            <View style={styles.cardHeader}>
              <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.badgeText}>{item.status.replace('_', ' ')}</Text>
              </View>
              
              <Text style={styles.solicitanteName} numberOfLines={1}>👤 {item.solicitante}</Text>
              <Text style={styles.equipamentoText} numberOfLines={2}>
                {item.equipamento} ({item.patrimonio})
              </Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.dateText}>Retirada: <Text style={styles.bold}>{item.retirada}</Text></Text>
              <Text style={styles.dateText}>Devolução: <Text style={styles.bold}>{item.devolucao}</Text></Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum empréstimo encontrado para os filtros aplicados.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.neutralFundo },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.neutralFundo, borderBottomWidth: 1, borderBottomColor: COLORS.neutralBorda },
  backButton: { marginBottom: 8 },
  backButtonText: { color: COLORS.greenIF, fontSize: 14, fontWeight: '600' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.black },
  
  filterSection: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.neutralBorda },
  searchInput: { backgroundColor: COLORS.neutralFundo, borderWidth: 1, borderColor: COLORS.neutralBorda, borderRadius: 25, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: COLORS.black, marginBottom: 12 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: COLORS.neutralFundo, borderWidth: 1, borderColor: COLORS.neutralBorda, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, marginBottom: 6 },
  chipSelected: { backgroundColor: COLORS.black, borderColor: COLORS.black },
  chipText: { fontSize: 12, color: COLORS.neutralTexto, fontWeight: '500' },
  chipTextSelected: { color: COLORS.white, fontWeight: 'bold' },

  listContent: { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40 },
  card: { backgroundColor: COLORS.white, borderRadius: 8, borderWidth: 1, borderColor: COLORS.neutralBorda, padding: 16, marginBottom: 12 },
  cardShadowIOS: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  cardShadowAndroid: { elevation: 2 },
  
  // LAYOUT AJUSTADO: Em coluna
  cardHeader: { 
    flexDirection: 'column', // Alterado para coluna
    alignItems: 'flex-start', 
    marginBottom: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.neutralFundo, 
    paddingBottom: 12 
  },
  
  badge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8 // Dá um espaço entre o Status e o Nome
  },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: COLORS.white },
  
  solicitanteName: { fontSize: 16, fontWeight: 'bold', color: COLORS.black, marginBottom: 2 },
  equipamentoText: { fontSize: 13, color: COLORS.neutralTexto },
  
  cardBody: { gap: 4 },
  dateText: { fontSize: 13, color: COLORS.neutralTexto },
  bold: { color: COLORS.black, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.neutralTexto, fontSize: 14, textAlign: 'center' },
});