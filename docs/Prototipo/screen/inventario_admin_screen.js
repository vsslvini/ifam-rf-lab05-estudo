import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, FlatList, Platform } from 'react-native';

// ==========================================
// --- CONSTANTES DE DESIGN (V2/Manual IF) ---
// ==========================================
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

// ==========================================
// --- DADOS DE TESTE (Simulando API) ---
// Baseado nos RF02 e RF03 (Catálogo Admin)
// ==========================================
const mockInventario = [
  { 
    id_recurso: '1', 
    id_tipo_recurso: 'cat-datashow', 
    codigo_patrimonio: 'PAT-102030', 
    marca_modelo: 'Datashow Epson X39', 
    estado_conservacao: 'Novo', 
    status_disponibilidade: 'Disponível' 
  },
  { 
    id_recurso: '2', 
    id_tipo_recurso: 'cat-notebook', 
    codigo_patrimonio: 'PAT-405060', 
    marca_modelo: 'Notebook Dell Inspiron 15', 
    estado_conservacao: 'Bom', 
    status_disponibilidade: 'Emprestado' 
  },
  { 
    id_recurso: '3', 
    id_tipo_recurso: 'cat-cabo', 
    codigo_patrimonio: 'PAT-708090', 
    marca_modelo: 'Cabo HDMI 2m Standard', 
    estado_conservacao: 'Defeito', 
    status_disponibilidade: 'Manutenção' 
  },
  { 
    id_recurso: '4', 
    id_tipo_recurso: 'cat-datashow', 
    codigo_patrimonio: 'PAT-112233', 
    marca_modelo: 'Datashow BenQ MX560', 
    estado_conservacao: 'Regular', 
    status_disponibilidade: 'Disponível' 
  },
];

export default function InventarioAdminScreen({ onBackToMenu }) {
  const [listaInventario, setListaInventario] = useState(mockInventario);

  // Define a cor do status baseado na disponibilidade (Design System)
  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponível':
        return COLORS.greenIF;
      case 'Manutenção':
        return COLORS.redAccent;
      case 'Emprestado':
        return COLORS.warningYellow;
      default:
        return COLORS.neutralTexto;
    }
  };

  // Ação simulada para o FAB (Adicionar e gerar QR Code)
  const handleAdicionarRecurso = () => {
    alert('Abrir tela de cadastro de novo recurso e geração de QR Code.');
  };

  // Renderização do Card de Inventário
  const renderItem = ({ item }) => (
    <View style={[styles.card, Platform.OS === 'ios' ? styles.cardShadowIOS : styles.cardShadowAndroid]}>
      <View style={styles.cardHeader}>
        <Text style={styles.codigoPatrimonio}>📦 {item.codigo_patrimonio}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status_disponibilidade) }]}>
          <Text style={[styles.badgeText, item.status_disponibilidade === 'Emprestado' ? { color: COLORS.black } : { color: COLORS.white }]}>
            {item.status_disponibilidade}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.marcaModelo}>{item.marca_modelo}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estado de Conservação:</Text>
          <Text style={styles.infoValue}>{item.estado_conservacao}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID Tipo Recurso:</Text>
          <Text style={styles.infoValue}>{item.id_tipo_recurso}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.neutralFundo} />
      
      {/* Header com botão de Voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToMenu} style={styles.backButton}>
          <Text style={styles.backButtonText}>◀ Menu Principal</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventário de Recursos</Text>
      </View>

      {/* Lista do Catálogo (RF03) */}
      <FlatList
        data={listaInventario}
        keyExtractor={(item) => item.id_recurso}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum equipamento cadastrado no inventário.</Text>
          </View>
        )}
      />

      {/* FAB - Floating Action Button para Adicionar Novo Recurso */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleAdicionarRecurso}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

// ==========================================
// --- ESTILOS ---
// ==========================================
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.neutralFundo 
  },
  
  // Header
  header: { 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: COLORS.neutralFundo,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutralBorda,
  },
  backButton: { 
    marginBottom: 8 
  },
  backButtonText: { 
    color: COLORS.greenIF, 
    fontSize: 14, 
    fontWeight: '600' 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: COLORS.black 
  },

  // FlatList & Cards
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 100, // Espaço extra para não esconder o último item atrás do FAB
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    marginBottom: 16,
    padding: 16,
  },
  cardShadowIOS: { 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4 
  },
  cardShadowAndroid: { 
    elevation: 2 
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutralFundo,
    paddingBottom: 8,
  },
  codigoPatrimonio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    paddingTop: 4,
  },
  marcaModelo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.neutralTexto,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: COLORS.neutralTexto,
    fontSize: 14,
  },

  // Floating Action Button (FAB)
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.greenIF, // Verde IF como ação principal
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: 'bold',
    lineHeight: 34,
  },
});