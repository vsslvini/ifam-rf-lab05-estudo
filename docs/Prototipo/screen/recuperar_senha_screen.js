import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';

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

export default function RecuperarSenhaScreen({ onBackToLogin }) {
  const [identificacao, setIdentificacao] = useState('');
  const [enviado, setEnviado] = useState(false);

  // Simula o envio das instruções de recuperação (RF01)
  const handleEnviarInstrucoes = () => {
    if (!identificacao.trim()) {
      alert('Por favor, informe seu e-mail ou Matrícula/SIAPE.');
      return;
    }
    
    // Simulação de requisição à API
    setEnviado(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.neutralFundo} />
      
      {/* Header com botão de Voltar para o Login */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToLogin} style={styles.backButton}>
          <Text style={styles.backButtonText}>◀ Voltar ao Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
        {/* Renderização Condicional: Formulário vs Mensagem de Sucesso */}
        {!enviado ? (
          <View style={styles.formContainer}>
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.instructions}>
              Digite seu e-mail cadastrado ou Matrícula/SIAPE para receber as instruções de redefinição de senha.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail ou Matrícula</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: carlos@ifam.edu.br ou 123456"
                placeholderTextColor={COLORS.neutralTexto}
                value={identificacao}
                onChangeText={setIdentificacao}
                autoCapitalize="none"
                keyboardType="default"
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleEnviarInstrucoes}>
              <Text style={styles.primaryButtonText}>Enviar Instruções</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={styles.successTitle}>Instruções Enviadas!</Text>
            <Text style={styles.successMessage}>
              Se o dado informado estiver em nossa base, você receberá um link com as instruções para redefinir sua senha em instantes.
            </Text>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={onBackToLogin}>
              <Text style={styles.secondaryButtonText}>Retornar ao Login</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
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
  },
  backButton: { 
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  backButtonText: { 
    color: COLORS.greenIF, 
    fontSize: 14, 
    fontWeight: '600' 
  },

  // Área Central
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 60, // Sobe um pouco o conteúdo para não ficar exatamente no meio
  },

  // Formulário Padrão
  formContainer: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    ...(Platform.OS === 'ios' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 } : { elevation: 2 }),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: COLORS.neutralTexto,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
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
  primaryButton: {
    backgroundColor: COLORS.greenIF,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Estado de Sucesso
  successContainer: {
    backgroundColor: COLORS.white,
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    alignItems: 'center',
    ...(Platform.OS === 'ios' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 } : { elevation: 2 }),
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.greenIF,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: COLORS.neutralTexto,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  secondaryButton: {
    backgroundColor: COLORS.neutralFundo,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },
});