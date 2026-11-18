import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, FlatList, Modal, ScrollView, Platform, Alert } from 'react-native';

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
// --- DADOS DE TESTE (Simulando API - RF01) ---
// ==========================================
const mockUsuarios = [
  {
    id_usuario: '1',
    nome_completo: 'Carlos Bento',
    email: 'carlos.bento@ifam.edu.br',
    perfil: 'Solicitante',
    identificacao_institucional: '123456',
    status_conta: 'Ativo',
  },
  {
    id_usuario: '2',
    nome_completo: 'Ana Silva',
    email: 'ana.silva@ifam.edu.br',
    perfil: 'Administrador',
    identificacao_institucional: '987654',
    status_conta: 'Ativo',
  },
  {
    id_usuario: '3',
    nome_completo: 'Marcos Souza',
    email: 'marcos.souza@ifam.edu.br',
    perfil: 'Solicitante',
    identificacao_institucional: '112233',
    status_conta: 'Bloqueado_por_Atraso',
  },
];

export default function CrudUsuariosScreen({ onBackToMenu }) {
  const [usuarios, setUsuarios] = useState(mockUsuarios);
  
  // Estados para controle do Modal e do Formulário
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Atributos de Dados (RF01)
  const [idAtual, setIdAtual] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [identificacao, setIdentificacao] = useState('');
  const [perfil, setPerfil] = useState('Solicitante');
  const [statusConta, setStatusConta] = useState('Ativo');

  const opcoesPerfil = ['Solicitante', 'Administrador'];
  const opcoesStatus = ['Ativo', 'Bloqueado_por_Atraso', 'Inativo'];

  // Função para abrir modal de Criação (Create)
  const handleOpenCreate = () => {
    setIsEditing(false);
    setIdAtual(null);
    setNomeCompleto('');
    setEmail('');
    setIdentificacao('');
    setPerfil('Solicitante');
    setStatusConta('Ativo');
    setModalVisible(true);
  };

  // Função para abrir modal de Edição (Update)
  const handleOpenEdit = (usuario) => {
    setIsEditing(true);
    setIdAtual(usuario.id_usuario);
    setNomeCompleto(usuario.nome_completo);
    setEmail(usuario.email);
    setIdentificacao(usuario.identificacao_institucional);
    setPerfil(usuario.perfil);
    setStatusConta(usuario.status_conta);
    setModalVisible(true);
  };

  // Função para Salvar (Create ou Update)
  const handleSave = () => {
    if (!nomeCompleto || !email || !identificacao) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const payload = {
      id_usuario: isEditing ? idAtual : Math.random().toString(),
      nome_completo: nomeCompleto,
      email: email,
      perfil: perfil,
      identificacao_institucional: identificacao,
      status_conta: statusConta,
    };

    if (isEditing) {
      setUsuarios(usuarios.map(u => (u.id_usuario === idAtual ? payload : u)));
      alert('Usuário atualizado com sucesso!');
    } else {
      setUsuarios([...usuarios, payload]);
      alert('Novo usuário cadastrado com sucesso!');
    }

    setModalVisible(false);
  };

  // Função para Excluir (Delete)
  const handleDelete = (id) => {
    // No Expo Snack nativo Web, Alert.alert pode ter limitações, então usamos lógica direta ou window.confirm
    if (Platform.OS === 'web') {
      if (confirm('Tem certeza que deseja inativar/excluir este usuário?')) {
        setUsuarios(usuarios.filter(u => u.id_usuario !== id));
      }
    } else {
      Alert.alert(
        'Excluir Usuário',
        'Tem certeza que deseja inativar/excluir este usuário?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', onPress: () => setUsuarios(usuarios.filter(u => u.id_usuario !== id)), style: 'destructive' },
        ]
      );
    }
  };

  // Define a cor do Status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo': return COLORS.greenIF;
      case 'Bloqueado_por_Atraso': return COLORS.warningYellow;
      case 'Inativo': return COLORS.redAccent;
      default: return COLORS.neutralTexto;
    }
  };

  // Componente Auxiliar: Chips de Seleção
  const SelectorChips = ({ options, selectedValue, onSelect }) => (
    <View style={styles.chipContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.chip, selectedValue === option && styles.chipSelected]}
          onPress={() => onSelect(option)}
        >
          <Text style={[styles.chipText, selectedValue === option && styles.chipTextSelected]}>
            {option.replace(/_/g, ' ')}
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
        <Text style={styles.headerTitle}>Gestão de Usuários</Text>
      </View>

      {/* Listagem de Usuários (Read) */}
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id_usuario}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.card, Platform.OS === 'ios' ? styles.cardShadowIOS : styles.cardShadowAndroid]}>
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.nome_completo}</Text>
                <Text style={styles.userRole}>{item.perfil}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: getStatusColor(item.status_conta) }]}>
                <Text style={[styles.badgeText, item.status_conta === 'Bloqueado_por_Atraso' && { color: COLORS.black }]}>
                  {item.status_conta === 'Bloqueado_por_Atraso' ? 'Bloqueado' : item.status_conta}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.userDetail}>📧 {item.email}</Text>
              <Text style={styles.userDetail}>🆔 SIAPE/Matrícula: {item.identificacao_institucional}</Text>
            </View>

            {/* Ações: Update e Delete */}
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => handleOpenEdit(item)}>
                <Text style={styles.editButtonText}>✏️ Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id_usuario)}>
                <Text style={styles.deleteButtonText}>🗑️ Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* FAB - Create User */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenCreate} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Modal de Formulário (Create / Update) */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput style={styles.input} placeholder="Ex: Carlos Bento" value={nomeCompleto} onChangeText={setNomeCompleto} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail Institucional</Text>
                <TextInput style={styles.input} placeholder="Ex: carlos@ifam.edu.br" keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Matrícula / SIAPE</Text>
                <TextInput style={styles.input} placeholder="Ex: 123456" keyboardType="numeric" value={identificacao} onChangeText={setIdentificacao} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Perfil de Acesso</Text>
                <SelectorChips options={opcoesPerfil} selectedValue={perfil} onSelect={setPerfil} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Status da Conta</Text>
                <SelectorChips options={opcoesStatus} selectedValue={statusConta} onSelect={setStatusConta} />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar Usuário</Text>
              </TouchableOpacity>
            </ScrollView>
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
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.neutralFundo, paddingBottom: 8 },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
  userRole: { fontSize: 12, color: COLORS.neutralTexto, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: COLORS.white },
  
  cardBody: { marginBottom: 16 },
  userDetail: { fontSize: 14, color: COLORS.black, marginBottom: 4 },
  
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: COLORS.neutralBorda, paddingTop: 12 },
  editButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: COLORS.neutralFundo, marginRight: 8, borderWidth: 1, borderColor: COLORS.neutralBorda },
  editButtonText: { color: COLORS.black, fontWeight: '600', fontSize: 14 },
  deleteButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#FFD6D6' },
  deleteButtonText: { color: COLORS.redAccent, fontWeight: '600', fontSize: 14 },

  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.greenIF, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 },
  fabIcon: { fontSize: 32, color: COLORS.white, fontWeight: 'bold', lineHeight: 34 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.neutralBorda },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
  closeIcon: { fontSize: 20, color: COLORS.neutralTexto, fontWeight: 'bold' },
  
  modalBody: { padding: 20, paddingBottom: 40 },
  inputGroup: { marginBottom: 16 },
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