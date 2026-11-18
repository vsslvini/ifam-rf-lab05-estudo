// Entrada do Expo Snack — Equipe 2 (RF-CORE03 e RF-CORE04).
// Mantém as telas originais fornecidas no projeto multi-módulos.
// No Snack, crie também os arquivos hub_modulos_screen.js e
// perfil_notificacoes_screen.js, com os arquivos homônimos desta pasta.
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import HubModulosScreen from './hub_modulos_screen';
import PerfilNotificacoesScreen from './perfil_notificacoes_screen';

const ROTAS_EM_INTEGRACAO = {
  MODULO_EQUIPAMENTOS: 'Módulo de Empréstimo de Equipamentos',
  MODULO_LABORATORIOS: 'Módulo de Alocação de Laboratórios',
  APROVACOES_PENDENTES: 'Aprovações de Equipamentos',
  CHECKOUT: 'Check-out de Equipamentos',
  INVENTARIO: 'Inventário de Equipamentos',
  CATALOGO_SOLICITANTE: 'Catálogo de Equipamentos',
  MEUS_EMPRESTIMOS: 'Meus Empréstimos',
  APROVACOES_ALOCACOES: 'Aprovações de Laboratórios',
  GRADE_LABS: 'Grade de Horários',
  CHECKIN_LAB_PORTA: 'Abertura de Laboratório (QR)',
  GESTAO_SOFTWARES: 'Gestão de Softwares',
  CATALOGO_LABS: 'Catálogo de Laboratórios',
  SOLICITAR_LAB: 'Solicitação de Laboratório',
};

function TelaEmIntegracao({ rota, voltar }) {
  const titulo = ROTAS_EM_INTEGRACAO[rota] ?? 'Este módulo';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.integrationPage}>
        <Text style={styles.integrationBadge}>EM INTEGRAÇÃO</Text>
        <Text style={styles.integrationTitle}>{titulo}</Text>
        <Text style={styles.integrationText}>
          Este atalho já está registrado no Hub. A tela será conectada quando o módulo responsável estiver integrado à aplicação.
        </Text>
        <Text style={styles.routeCode}>Rota: {rota}</Text>
        <TouchableOpacity accessibilityRole="button" onPress={voltar} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar ao Hub</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [telaAtual, setTelaAtual] = useState('HUB');
  const [rotaEmIntegracao, setRotaEmIntegracao] = useState(null);

  const navegar = (rota) => {
    if (rota === 'PERFIL_NOTIFICACOES') {
      setTelaAtual('NOTIFICACOES');
      return;
    }

    setRotaEmIntegracao(rota);
    setTelaAtual('INTEGRACAO');
  };

  if (telaAtual === 'NOTIFICACOES') {
    return <PerfilNotificacoesScreen onBackToMenu={() => setTelaAtual('HUB')} />;
  }

  if (telaAtual === 'INTEGRACAO') {
    return <TelaEmIntegracao rota={rotaEmIntegracao} voltar={() => setTelaAtual('HUB')} />;
  }

  return (
    <HubModulosScreen
      onNavigate={navegar}
      onLogout={() => Alert.alert('Demonstração', 'Sessão de demonstração encerrada.')}
    />
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#F5F5F5', flex: 1 },
  integrationPage: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 28 },
  integrationBadge: { backgroundColor: '#FFF8E1', borderRadius: 16, color: '#A56C00', fontSize: 12, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 7 },
  integrationTitle: { color: '#000000', fontSize: 23, fontWeight: '700', marginTop: 18, textAlign: 'center' },
  integrationText: { color: '#333333', fontSize: 15, lineHeight: 22, marginTop: 12, textAlign: 'center' },
  routeCode: { color: '#757575', fontSize: 12, marginTop: 16 },
  backButton: { backgroundColor: '#2F9E41', borderRadius: 8, marginTop: 28, paddingHorizontal: 20, paddingVertical: 13 },
  backButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
