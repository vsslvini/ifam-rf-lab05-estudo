import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Image, Platform } from 'react-native';

// ==========================================
// --- CONSTANTES DE DESIGN (V2/Manual IF) ---
// ==========================================
const COLORS = {
  greenIF: '#2F9E41',
  black: '#000000',
  white: '#FFFFFF',
  neutralFundo: '#F5F5F5',
  neutralBorda: '#E0E0E0',
  neutralTexto: '#757575',
};

export default function CadastroRecursoScreen({ onBackToInventario }) {
  // Estados do Formulário (RF03)
  const [tipoRecurso, setTipoRecurso] = useState('');
  const [codigoPatrimonio, setCodigoPatrimonio] = useState('');
  const [marcaModelo, setMarcaModelo] = useState('');
  
  // Estados para os Enums
  const [estadoConservacao, setEstadoConservacao] = useState('Novo');
  const [statusDisponibilidade, setStatusDisponibilidade] = useState('Disponível');

  // Estados de Controle do QR Code
  const [qrCodeGerado, setQrCodeGerado] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeHash, setQrCodeHash] = useState('');

  // Opções para os Enums (RF03)
  const opcoesEstado = ['Novo', 'Bom', 'Regular', 'Defeito'];
  const opcoesStatus = ['Disponível', 'Emprestado', 'Manutenção'];

  // Ação Principal: Salvar e Gerar
  const handleSalvar = () => {
    if (!tipoRecurso || !codigoPatrimonio || !marcaModelo) {
      alert('Por favor, preencha todos os campos de texto.');
      return;
    }

    // Simulação da geração de um Hash único (ex: UUID simplificado)
    const mockHash = `hash_${Math.random().toString(36).substr(2, 9)}_${codigoPatrimonio}`;
    
    // Usando uma API pública para gerar um QR Code real baseado no patrimônio para o protótipo
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${codigoPatrimonio}`;

    setQrCodeHash(mockHash);
    setQrCodeUrl(qrUrl);
    setQrCodeGerado(true);
    
    alert('Recurso cadastrado com sucesso!');
  };

  // Componente de Seleção Visual (Chips)
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
      
      {/* Header com botão de Voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToInventario} style={styles.backButton}>
          <Text style={styles.backButtonText}>◀ Voltar ao Inventário</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Recurso</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Formulário */}
        <View style={styles.formContainer}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Recurso (Ex: Datashow, Cabo)</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o tipo de recurso"
              placeholderTextColor={COLORS.neutralTexto}
              value={tipoRecurso}
              onChangeText={setTipoRecurso}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Código do Patrimônio</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: PAT-12345"
              placeholderTextColor={COLORS.neutralTexto}
              value={codigoPatrimonio}
              onChangeText={setCodigoPatrimonio}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Marca e Modelo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Epson X39"
              placeholderTextColor={COLORS.neutralTexto}
              value={marcaModelo}
              onChangeText={setMarcaModelo}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estado de Conservação</Text>
            <SelectorChips 
              options={opcoesEstado} 
              selectedValue={estadoConservacao} 
              onSelect={setEstadoConservacao} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status de Disponibilidade</Text>
            <SelectorChips 
              options={opcoesStatus} 
              selectedValue={statusDisponibilidade} 
              onSelect={setStatusDisponibilidade} 
            />
          </View>

          {/* Botão de Ação Principal (Verde IF) */}
          <TouchableOpacity style={styles.buttonSalvar} onPress={handleSalvar}>
            <Text style={styles.buttonSalvarText}>Salvar e Gerar QR Code</Text>
          </TouchableOpacity>

        </View>

        {/* Área de Destaque do QR Code (Aparece apenas após salvar) */}
        {qrCodeGerado && (
          <View style={styles.qrCodeContainer}>
            <Text style={styles.qrCodeTitle}>QR Code Gerado</Text>
            <Text style={styles.qrCodeSubtitle}>Cole este código no equipamento físico</Text>
            
            <View style={styles.qrCodeBox}>
              <Image 
                source={{ uri: qrCodeUrl }} 
                style={styles.qrCodeImage} 
                resizeMode="contain"
              />
            </View>
            
            <View style={styles.hashContainer}>
              <Text style={styles.hashLabel}>Hash de Segurança:</Text>
              <Text style={styles.hashValue}>{qrCodeHash}</Text>
            </View>
          </View>
        )}

      </ScrollView>
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

  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },

  // Formulário
  formContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    ...(Platform.OS === 'ios' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 } : { elevation: 2 }),
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.neutralFundo,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.black,
  },

  // Chips (Seletores)
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.neutralFundo,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.neutralTexto,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
  },

  // Botão Principal
  buttonSalvar: {
    backgroundColor: COLORS.greenIF, // Verde IF exigido
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonSalvarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Área do QR Code Gerado
  qrCodeContainer: {
    marginTop: 32,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.greenIF, // Destaque visual
    borderStyle: 'dashed',
  },
  qrCodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.greenIF,
    marginBottom: 4,
  },
  qrCodeSubtitle: {
    fontSize: 14,
    color: COLORS.neutralTexto,
    marginBottom: 24,
  },
  qrCodeBox: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
  },
  hashContainer: {
    backgroundColor: COLORS.neutralFundo,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  hashLabel: {
    fontSize: 12,
    color: COLORS.neutralTexto,
    marginBottom: 4,
  },
  hashValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
});