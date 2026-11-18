import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Image
} from 'react-native';

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
// --- COMPONENTE: LOGO OFICIAL DO IFAM ---
// --- Compatível 100% com Expo Snack / Web / Mobile ---
// ==========================================
function IfamLogo({ size = 110 }) {
  const blockSize = size * 0.13;
  const gap = size * 0.035;

  return (
    <View style={[styles.logoCircleContainer, { width: size, height: size, borderRadius: size / 2 }]}>
      {/* Símbolo da Rede Federal / IFAM */}
      <View style={styles.ifamSymbolGrid}>
        {/* Linha 1 */}
        <View style={styles.ifamRow}>
          <View style={[styles.ifamRedDot, { width: blockSize, height: blockSize, borderRadius: blockSize / 2, marginRight: gap }]} />
          <View style={[styles.ifamGreenBlock, { width: blockSize, height: blockSize, marginRight: gap }]} />
          <View style={[styles.ifamGreenBlock, { width: blockSize, height: blockSize }]} />
        </View>

        {/* Linha 2 */}
        <View style={[styles.ifamRow, { marginTop: gap }]}>
          <View style={[styles.ifamGreenBlock, { width: blockSize, height: blockSize, marginRight: gap }]} />
          <View style={[styles.ifamGreenBlock, { width: blockSize, height: blockSize, marginRight: gap }]} />
          <View style={{ width: blockSize, height: blockSize }} />
        </View>

        {/* Linha 3 */}
        <View style={[styles.ifamRow, { marginTop: gap }]}>
          <View style={[styles.ifamGreenBlock, { width: blockSize, height: blockSize, marginRight: gap }]} />
          <View style={[styles.ifamGreenBlock, { width: blockSize, height: blockSize, marginRight: gap }]} />
          <View style={[styles.ifamGreenBlock, { width: blockSize, height: blockSize }]} />
        </View>

        {/* Linha 4 */}
        <View style={[styles.ifamRow, { marginTop: gap }]}>
          <View style={[styles.ifamGreenBlock, { width: blockSize, height: blockSize, marginRight: gap }]} />
          <View style={[styles.ifamGreenBlock, { width: blockSize, height: blockSize, marginRight: gap }]} />
          <View style={{ width: blockSize, height: blockSize }} />
        </View>
      </View>

      {/* Tipografia Oficial IFAM */}
      <Text style={[styles.logoTextInstituto, { fontSize: size * 0.088, marginTop: size * 0.04 }]}>INSTITUTO</Text>
      <Text style={[styles.logoTextFederal, { fontSize: size * 0.098 }]}>FEDERAL</Text>
      <Text style={[styles.logoTextAmazonas, { fontSize: size * 0.082 }]}>Amazonas</Text>
    </View>
  );
}

export default function LoginScreen({ onLogin, onNavigateRecuperarSenha }) {
  const [identificacao, setIdentificacao] = useState('');
  const [senha, setSenha] = useState('');

  // Lógica de Autenticação e Redirecionamento (RF-CORE01)
  const handleLogin = () => {
    if (!identificacao.trim() || !senha.trim()) {
      alert('⚠️ Por favor, preencha o e-mail/matrícula e a senha.');
      return;
    }

    // Simulação da lógica de perfis (Solicitante vs Administrador)
    let perfilLogado = 'Solicitante';
    if (identificacao.toLowerCase().includes('admin')) {
      perfilLogado = 'Administrador';
    }

    if (onLogin) {
      onLogin(perfilLogado);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.neutralFundo} />
      
      <View style={styles.content}>
        
        {/* Cabeçalho do Login com a Logo Oficial do IFAM */}
        <View style={styles.header}>
          <IfamLogo size={120} />
          <Text style={styles.title}>Portal de Serviços IFAM</Text>
          <Text style={styles.subtitle}>Faça login para acessar o sistema integrado de recursos e laboratórios.</Text>
        </View>

        {/* Formulário de Login */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail ou Matrícula (SIAPE)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: carlos@ifam.edu.br ou 123456"
              placeholderTextColor={COLORS.neutralTexto}
              value={identificacao}
              onChangeText={setIdentificacao}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor={COLORS.neutralTexto}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={true}
            />
          </View>

          {/* Link para Recuperar Senha */}
          <TouchableOpacity style={styles.forgotPasswordBtn} onPress={onNavigateRecuperarSenha}>
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* Botão de Entrar */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </TouchableOpacity>
        </View>

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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 30,
  },
  
  // Header / Logo
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircleContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#A5D6A7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...(Platform.OS === 'ios' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 } : { elevation: 3 }),
  },
  ifamSymbolGrid: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ifamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ifamRedDot: {
    backgroundColor: COLORS.redAccent,
  },
  ifamGreenBlock: {
    backgroundColor: COLORS.greenIF,
    borderRadius: 3,
  },
  logoTextInstituto: {
    fontWeight: 'bold',
    color: COLORS.black,
    letterSpacing: 0.5,
    lineHeight: 12,
  },
  logoTextFederal: {
    fontWeight: 'bold',
    color: COLORS.black,
    letterSpacing: 0.8,
    lineHeight: 13,
  },
  logoTextAmazonas: {
    fontWeight: '600',
    color: COLORS.black,
    lineHeight: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.neutralTexto,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
  },

  // Formulário
  formContainer: {
    backgroundColor: COLORS.white,
    padding: 22,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    ...(Platform.OS === 'ios' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 } : { elevation: 2 }),
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.neutralFundo,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.black,
  },
  
  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: COLORS.greenIF,
    fontSize: 13,
    fontWeight: '600',
  },

  primaryButton: {
    backgroundColor: COLORS.greenIF,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
});