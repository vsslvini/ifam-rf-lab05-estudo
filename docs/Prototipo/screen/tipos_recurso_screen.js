import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, FlatList, Modal, Platform, Alert } from 'react-native';

// ==========================================
// --- CONSTANTES DE DESIGN (V2/Manual IF) ---
// ==========================================
const COLORS = {
  greenIF: '#2F9E41',
  redAccent: '#CD191E',
  black: '#000000',
  white: '#FFFFFF',
  neutralFundo: '#F5F5F5',
  neutralBorda: '#E0E0E0',
  neutralTexto: '#757575',
};

// ==========================================
// --- DADOS DE TESTE (Simulando API - RF02) ---
// ==========================================
const mockTiposRecursos = [
  { id_tipo_recurso: '1', descricao: 'Datashow Epson 3000 lumens', categoria: 'Eletrônicos' },
  { id_tipo_recurso: '2', descricao: 'Cabo HDMI 2m', categoria: 'Cabos' },
  { id_tipo_recurso: '3', descricao: 'Extensão Elétrica 5m', categoria: 'Acessórios' },
  { id_tipo_recurso: '4', descricao: 'Notebook Dell Inspiron', categoria: 'Eletrônicos' },
];

export default function TiposRecursoScreen({ onBackToMenu }) {
  const [listaTipos, setListaTipos] = useState(mockTiposRecursos);
  
  // Estados do Modal e Formulário
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Atributos de Dados (RF02)
  const [idAtual, setIdAtual] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Eletrônicos');

  const opcoesCategoria = ['Eletrônicos', 'Cabos', 'Acessórios', 'Outros'];

  // Abrir Modal de Criação (Create)
  const handleOpenCreate = () => {
    setIsEditing(false);
    setIdAtual(null);
    setDescricao('');
    setCategoria('Eletrônicos');
    setModalVisible(true);
  };

  // Abrir Modal de Edição (Update)
  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setIdAtual(item.id_tipo_recurso);
    setDescricao(item.descricao);
    setCategoria(item.categoria);
    setModalVisible(true);
  };

  // Salvar Registro (Create / Update)
  const handleSave = () => {
    if (!descricao.trim()) {
      alert('A descrição é obrigatória.');
      return;
    }

    const payload = {
      id_tipo_recurso: isEditing ? idAtual : Math.random().toString(36).substring(2, 9),
      descricao,
      categoria,
    };

    if (isEditing) {
      setListaTipos(listaTipos.map(item => item.id_tipo_recurso === idAtual ? payload : item));
      alert('Tipo de recurso atualizado!');
    } else {
      setListaTipos([...listaTipos, payload]);
      alert('Novo tipo de recurso criado!');
    }

    setModalVisible(false);
  };

  // Excluir Registro (Delete)
  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
      if (confirm('Tem certeza que deseja excluir este tipo de recurso?')) {
        setListaTipos(listaTipos.filter(item => item.id_tipo_recurso !== id));
      }
    } else {
      Alert.alert(
        'Excluir Tipo',
        'Tem certeza que deseja excluir este tipo de recurso?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', onPress: () => setListaTipos(listaTipos.filter(item => item.id_tipo_recurso !== id)), style: 'destructive' },
        ]
      );
    }
  };

  // Componente Auxiliar: Chips de Categoria
  const SelectorChips = ({ options, selectedValue, onSelect }) => (
    <View style={styles.chipContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.chip, selectedValue === option && styles.chipSelected]}
          onPress={() => onSelect(option)}
        >
          <Text style={[styles.chipText, selectedValue === option && styles.chipTextSelected]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.neutralFundo} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToMenu} style={styles.backButton}>
          <Text style={styles.backButtonText}>◀ Menu Principal</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tipos de Recursos</Text>
      </View>

      {/* Lista de Tipos (Read) */}
      <FlatList
        data={listaTipos}
        keyExtractor={(item) => item.id_tipo_recurso}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.card, Platform.OS === 'ios' ? styles.cardShadowIOS : styles.cardShadowAndroid]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardDescricao}>{item.descricao}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.categoria}</Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => handleOpenEdit(item)}>
                <Text style={styles.editButtonText}>✏️ Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id_tipo_recurso)}>
                <Text style={styles.deleteButtonText}>🗑️ Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum tipo de recurso cadastrado.</Text>
          </View>
        )}
      />

      {/* FAB - Adicionar Novo */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenCreate} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Modal de Formulário (Create / Update) */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Editar Tipo' : 'Novo Tipo de Recurso'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição (Marca, Modelo, Especificação)</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ex: Datashow Epson 3000 lumens" 
                  value={descricao} 
                  onChangeText={setDescricao} 
                  placeholderTextColor={COLORS.neutralTexto}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoria</Text>
                <SelectorChips options={opcoesCategoria} selectedValue={categoria} onSelect={setCategoria} />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar Tipo de Recurso</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ==========================================
// --- ESTILOS ---
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.neutralFundo },
  
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.neutralFundo, borderBottomWidth: 1, borderBottomColor: COLORS.neutralBorda },
  backButton: { marginBottom: 8 },
  backButtonText: { color: COLORS.greenIF, fontSize: 14, fontWeight: '600' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.black },

  listContent: { paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 100 },
  card: { backgroundColor: COLORS.white, borderRadius: 8, borderWidth: 1, borderColor: COLORS.neutralBorda, marginBottom: 16, padding: 16 },
  cardShadowIOS: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardShadowAndroid: { elevation: 2 },
  
  cardHeader: { alignItems: 'flex-start', marginBottom: 16 },
  cardDescricao: { fontSize: 16, fontWeight: 'bold', color: COLORS.black, marginBottom: 8 },
  badge: { backgroundColor: COLORS.neutralFundo, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: COLORS.neutralBorda },
  badgeText: { fontSize: 12, fontWeight: '600', color: COLORS.neutralTexto },
  
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: COLORS.neutralFundo, paddingTop: 12 },
  editButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: COLORS.neutralFundo, marginRight: 8, borderWidth: 1, borderColor: COLORS.neutralBorda },
  editButtonText: { color: COLORS.black, fontWeight: '600', fontSize: 14 },
  deleteButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#FFD6D6' },
  deleteButtonText: { color: COLORS.redAccent, fontWeight: '600', fontSize: 14 },

  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.neutralTexto, fontSize: 14 },

  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.greenIF, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 },
  fabIcon: { fontSize: 32, color: COLORS.white, fontWeight: 'bold', lineHeight: 34 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.neutralBorda },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
  closeIcon: { fontSize: 20, color: COLORS.neutralTexto, fontWeight: 'bold' },
  
  modalBody: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.black, marginBottom: 8 },
  input: { backgroundColor: COLORS.neutralFundo, borderWidth: 1, borderColor: COLORS.neutralBorda, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: COLORS.black },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: COLORS.neutralFundo, borderWidth: 1, borderColor: COLORS.neutralBorda, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  chipSelected: { backgroundColor: COLORS.black, borderColor: COLORS.black },
  chipText: { fontSize: 13, color: COLORS.neutralTexto, fontWeight: '500' },
  chipTextSelected: { color: COLORS.white, fontWeight: 'bold' },

  saveButton: { backgroundColor: COLORS.greenIF, paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  saveButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});