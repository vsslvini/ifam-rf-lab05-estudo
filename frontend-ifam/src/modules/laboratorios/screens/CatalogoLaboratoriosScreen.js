import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Modal,
  ScrollView,
  Platform,
  Alert,
  RefreshControl
} from 'react-native';

// ========================================================
// --- CONSTANTES DE DESIGN SYSTEM V2 (MANUAL IFAM) ---
// ========================================================
const COLORS = {
  // Primárias e Destaque
  greenIF: '#2F9E41',
  greenLight: '#E8F5E9',
  redAccent: '#CD191E',
  redLight: '#FFEBEE',
  warningYellow: '#FFC107',
  warningLight: '#FFF8E1',
  blueAccent: '#1976D2',      // Cor temática oficial do Módulo 2 (Laboratórios)
  blueLight: '#E3F2FD',

  // Neutras
  black: '#000000',
  white: '#FFFFFF',
  neutralFundo: '#F5F5F5',
  neutralBorda: '#E0E0E0',
  neutralTexto: '#757575',
  neutralDark: '#333333',
};

// ========================================================
// --- DADOS MOCKADOS INSTITUCIONAIS (CONFORME O DER) ---
// Alinhado com seq_05_database_schema.md e seq_06_mapa_backend.md
// ========================================================
const mockLaboratorios = [
  {
    id_laboratorio: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    nome_laboratorio: 'Laboratório 01 - Redes e Infraestrutura',
    bloco_predio: 'Bloco B - 1º Andar (Sala 102)',
    bloco: 'Bloco B',
    capacidade_computadores: 32,
    sistema_operacional: 'Dual Boot (Linux Ubuntu / Windows 11)',
    so_tipo: 'Dual Boot',
    status_laboratorio: 'Disponivel',
    especificacao_hardware: 'Intel Core i5 12ª Ger (12400), 16GB RAM DDR4, SSD 512GB NVMe',
    qr_code_porta_hash: 'QR-LAB-01-PORTA-B102',
    softwares: [
      { nome: 'Cisco Packet Tracer', versao: '8.2.1', categoria: 'Redes', licenca: 'Educacional' },
      { nome: 'Wireshark', versao: '4.2.2', categoria: 'Redes', licenca: 'Open Source' },
      { nome: 'Visual Studio Code', versao: '1.87.0', categoria: 'Desenvolvimento', licenca: 'Open Source' },
      { nome: 'VirtualBox', versao: '7.0.14', categoria: 'Virtualização', licenca: 'GPL v2' },
      { nome: 'GNS3', versao: '2.2.44', categoria: 'Redes', licenca: 'Open Source' },
    ],
    recursos_sala: ['Projetor Epson HDMI 3500lm', 'Quadro Branco Panorâmico', '2x Ar-condicionado 24.000 BTUs', 'Rack com Patch Panel Didático', 'Sistema de Som Integrado'],
  },
  {
    id_laboratorio: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
    nome_laboratorio: 'Laboratório 02 - Desenvolvimento de Software',
    bloco_predio: 'Bloco B - 1º Andar (Sala 104)',
    bloco: 'Bloco B',
    capacidade_computadores: 36,
    sistema_operacional: 'Linux Ubuntu 22.04 LTS',
    so_tipo: 'Linux',
    status_laboratorio: 'Disponivel',
    especificacao_hardware: 'Intel Core i7 11ª Ger (11700), 32GB RAM DDR4, SSD 1TB NVMe M.2',
    qr_code_porta_hash: 'QR-LAB-02-PORTA-B104',
    softwares: [
      { nome: 'Visual Studio Code', versao: '1.87.0', categoria: 'Desenvolvimento', licenca: 'Open Source' },
      { nome: 'Docker Desktop', versao: '24.0.7', categoria: 'DevOps / Containers', licenca: 'Open Source' },
      { nome: 'Node.js & npm', versao: '20.11.0 LTS', categoria: 'Desenvolvimento', licenca: 'MIT' },
      { nome: 'Python & Anaconda', versao: '3.12.1', categoria: 'Ciência de Dados', licenca: 'Open Source' },
      { nome: 'PostgreSQL & pgAdmin', versao: '16.1', categoria: 'Banco de Dados', licenca: 'PostgreSQL' },
      { nome: 'Git / GitHub CLI', versao: '2.43.0', categoria: 'Versionamento', licenca: 'GPL v2' },
    ],
    recursos_sala: ['Projetor Laser Interativo', 'Quadro Branco', '2x Ar-condicionado 30.000 BTUs', 'Bancadas Ergonômicas', 'Link Dedicado 1Gbps'],
  },
  {
    id_laboratorio: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
    nome_laboratorio: 'Laboratório 03 - Computação Gráfica & CAD',
    bloco_predio: 'Bloco A - Térreo (Sala 12)',
    bloco: 'Bloco A',
    capacidade_computadores: 24,
    sistema_operacional: 'Windows 11 Pro 64-bit',
    so_tipo: 'Windows',
    status_laboratorio: 'Ocupado',
    especificacao_hardware: 'Intel Core i7 13ª Ger (13700F), 32GB RAM DDR5, SSD 1TB NVMe, GPU NVIDIA RTX 3060 12GB',
    qr_code_porta_hash: 'QR-LAB-03-PORTA-A012',
    softwares: [
      { nome: 'AutoCAD 2024', versao: '2024.1', categoria: 'Design & Engenharia', licenca: 'Educacional Autodesk' },
      { nome: 'Blender 3D', versao: '4.0.2', categoria: 'Modelagem 3D & Animação', licenca: 'GPL v3' },
      { nome: 'Adobe Creative Cloud', versao: '2024', categoria: 'Design Gráfico', licenca: 'Comercial Institucional' },
      { nome: 'Unity 3D Engine', versao: '2023.2 LTS', categoria: 'Jogos / Simulação', licenca: 'Personal Free' },
      { nome: 'Figma Desktop', versao: '116.15', categoria: 'UI/UX Design', licenca: 'Educacional' },
    ],
    recursos_sala: ['Monitores Profissionais 27" IPS 144Hz', 'Mesa Digitalizadora Wacom', 'Projetor 4K Ultra HD', '2x Ar-condicionado 24.000 BTUs'],
  },
  {
    id_laboratorio: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
    nome_laboratorio: 'Laboratório 04 - Informática Geral e Básica',
    bloco_predio: 'Bloco C - 2º Andar (Sala 201)',
    bloco: 'Bloco C',
    capacidade_computadores: 40,
    sistema_operacional: 'Windows 11 Pro 64-bit',
    so_tipo: 'Windows',
    status_laboratorio: 'Disponivel',
    especificacao_hardware: 'Intel Core i3 10ª Ger, 8GB RAM DDR4, SSD 256GB SATA',
    qr_code_porta_hash: 'QR-LAB-04-PORTA-C201',
    softwares: [
      { nome: 'LibreOffice Suite', versao: '7.6.4', categoria: 'Produtividade', licenca: 'MPL v2' },
      { nome: 'Google Chrome / Firefox', versao: 'Atualizado', categoria: 'Navegação', licenca: 'Gratuito' },
      { nome: 'Visual Studio Code', versao: '1.87.0', categoria: 'Desenvolvimento', licenca: 'Open Source' },
      { nome: 'Adobe Acrobat Reader', versao: 'DC', categoria: 'Visualizador PDF', licenca: 'Gratuito' },
    ],
    recursos_sala: ['Projetor HDMI', 'Quadro Branco', '3x Ar-condicionado 18.000 BTUs', 'Acessibilidade para PCD'],
  },
  {
    id_laboratorio: '7fa85f64-5717-4562-b3fc-2c963f66afb0',
    nome_laboratorio: 'Laboratório 05 - Hardware, Robótica e Maker',
    bloco_predio: 'Bloco A - Térreo (Sala 15)',
    bloco: 'Bloco A',
    capacidade_computadores: 20,
    sistema_operacional: 'Dual Boot (Linux Ubuntu / Windows 11)',
    so_tipo: 'Dual Boot',
    status_laboratorio: 'Manutencao',
    especificacao_hardware: 'Intel Core i5 10ª Ger, 16GB RAM DDR4, SSD 512GB SATA',
    qr_code_porta_hash: 'QR-LAB-05-PORTA-A015',
    softwares: [
      { nome: 'Arduino IDE', versao: '2.3.0', categoria: 'Sistemas Embarcados', licenca: 'Open Source' },
      { nome: 'Fritzing', versao: '1.0.1', categoria: 'Eletrônica e Esquemas', licenca: 'Open Source' },
      { nome: 'Thonny Python IDE', versao: '4.1.4', categoria: 'MicroPython / ESP32', licenca: 'MIT' },
      { nome: 'UltiMaker Cura (3D)', versao: '5.6.0', categoria: 'Fatiamento 3D', licenca: 'LGPL' },
    ],
    recursos_sala: ['2x Impressoras 3D Ender-3', 'Osciloscópios Digitais e Multímetros', 'Estações de Solda Hikari', 'Bancadas Antiestáticas ESD', '1x Ar-condicionado 30.000 BTUs'],
  },
];

export default function CatalogoLaboratoriosScreen({ onBackToMenu, onNavigate }) {
  // ==========================================
  // --- ESTADOS DE FILTRO E BUSCA ---
  // ==========================================
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroBloco, setFiltroBloco] = useState('Todos');
  const [filtroSO, setFiltroSO] = useState('Todos');
  const [filtroCapacidade, setFiltroCapacidade] = useState('Todas');
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // --- ESTADOS DO MODAL FICHA TÉCNICA ---
  // ==========================================
  const [modalVisible, setModalVisible] = useState(false);
  const [labSelecionado, setLabSelecionado] = useState(null);

  // Listas de opções para filtros rápidos em chips
  const blocos = ['Todos', 'Bloco A', 'Bloco B', 'Bloco C'];
  const sistemasOperacionais = ['Todos', 'Linux', 'Windows', 'Dual Boot'];
  const capacidades = ['Todas', '20+ máq', '30+ máq', '36+ máq'];

  // ==========================================
  // --- LÓGICA DE FILTRAGEM REATIVA ---
  // ==========================================
  const laboratoriosFiltrados = mockLaboratorios.filter((lab) => {
    // 1. Busca por texto (nome do lab, bloco, SO ou qualquer software instalado)
    const textoLimpo = buscaTexto.toLowerCase().trim();
    const coincideNome = lab.nome_laboratorio.toLowerCase().includes(textoLimpo);
    const coincideBlocoNome = lab.bloco_predio.toLowerCase().includes(textoLimpo);
    const coincideSO = lab.sistema_operacional.toLowerCase().includes(textoLimpo);
    const coincideSoftware = lab.softwares.some(
      (s) => s.nome.toLowerCase().includes(textoLimpo) || s.categoria.toLowerCase().includes(textoLimpo)
    );
    const passaBusca = textoLimpo === '' || coincideNome || coincideBlocoNome || coincideSO || coincideSoftware;

    // 2. Filtro por Bloco
    const passaBloco = filtroBloco === 'Todos' || lab.bloco === filtroBloco;

    // 3. Filtro por Sistema Operacional
    const passaSO = filtroSO === 'Todos' || lab.so_tipo === filtroSO;

    // 4. Filtro por Capacidade de Máquinas
    let passaCapacidade = true;
    if (filtroCapacidade === '20+ máq') passaCapacidade = lab.capacidade_computadores >= 20;
    if (filtroCapacidade === '30+ máq') passaCapacidade = lab.capacidade_computadores >= 30;
    if (filtroCapacidade === '36+ máq') passaCapacidade = lab.capacidade_computadores >= 36;

    return passaBusca && passaBloco && passaSO && passaCapacidade;
  });

  // Pull-to-refresh para simulação e integração real
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  // ==========================================
  // --- HELPERS VISUAIS (DESIGN SYSTEM V2) ---
  // ==========================================
  const getStatusBadgeConfig = (status) => {
    switch (status) {
      case 'Disponivel':
        return { label: 'Disponível', corTexto: COLORS.greenIF, corFundo: COLORS.greenLight, icone: '●' };
      case 'Ocupado':
        return { label: 'Em Aula / Ocupado', corTexto: '#E65100', corFundo: COLORS.warningLight, icone: '⏳' };
      case 'Manutencao':
        return { label: 'Em Manutenção', corTexto: COLORS.redAccent, corFundo: COLORS.redLight, icone: '🛠️' };
      case 'Interditado':
        return { label: 'Interditado', corTexto: COLORS.redAccent, corFundo: COLORS.redLight, icone: '⛔' };
      default:
        return { label: status, corTexto: COLORS.neutralDark, corFundo: COLORS.neutralFundo, icone: '•' };
    }
  };

  const abrirFichaTecnica = (lab) => {
    setLabSelecionado(lab);
    setModalVisible(true);
  };

  const fecharFichaTecnica = () => {
    setModalVisible(false);
    setLabSelecionado(null);
  };

  // Encaminha para o agendamento tratando indisponibilidade com confirmação
  const handleSolicitarLab = (lab) => {
    const prosseguir = () => {
      fecharFichaTecnica();
      if (onNavigate) {
        onNavigate('SOLICITAR_LAB', { labId: lab.id_laboratorio, labNome: lab.nome_laboratorio });
      } else {
        Alert.alert(
          'Solicitação de Alocação',
          `Iniciando agendamento para o ${lab.nome_laboratorio}.\nCapacidade: ${lab.capacidade_computadores} computadores.`
        );
      }
    };

    if (lab.status_laboratorio === 'Manutencao' || lab.status_laboratorio === 'Interditado') {
      const cfg = getStatusBadgeConfig(lab.status_laboratorio);
      Alert.alert(
        'Laboratório Temporariamente Indisponível',
        `O ${lab.nome_laboratorio} encontra-se como "${cfg.label}".\n\nDeseja continuar para solicitar uma data futura?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Prosseguir', onPress: prosseguir }
        ]
      );
      return;
    }

    prosseguir();
  };

  const temFiltroAtivo =
    filtroBloco !== 'Todos' ||
    filtroSO !== 'Todos' ||
    filtroCapacidade !== 'Todas' ||
    buscaTexto.trim() !== '';

  const limparFiltros = () => {
    setBuscaTexto('');
    setFiltroBloco('Todos');
    setFiltroSO('Todos');
    setFiltroCapacidade('Todas');
  };

  // ==========================================
  // --- RENDERIZAÇÃO DO CARD DE LABORATÓRIO ---
  // ==========================================
  const renderItemLab = ({ item }) => {
    const statusCfg = getStatusBadgeConfig(item.status_laboratorio);

    return (
      <View style={[styles.cardLab, styles.shadow]}>
        {/* Topo do Card: Badge de Status e Capacidade */}
        <View style={styles.cardTopRow}>
          <View style={[styles.badgeStatus, { backgroundColor: statusCfg.corFundo }]}>
            <Text style={[styles.badgeStatusText, { color: statusCfg.corTexto }]}>
              {statusCfg.icone} {statusCfg.label}
            </Text>
          </View>
          <View style={styles.badgeCapacidade}>
            <Text style={styles.badgeCapacidadeText}>💻 {item.capacidade_computadores} Máquinas</Text>
          </View>
        </View>

        {/* Título e Localização com proteção contra overflow */}
        <Text style={styles.cardTitulo} numberOfLines={2}>{item.nome_laboratorio}</Text>
        <View style={styles.localRow}>
          <Text style={styles.localIcon}>📍</Text>
          <Text style={styles.localTexto} numberOfLines={1} ellipsizeMode="tail">{item.bloco_predio}</Text>
        </View>

        {/* Tag de Sistema Operacional */}
        <View style={styles.soContainer}>
          <Text style={styles.soLabel}>Sistema Operacional:</Text>
          <Text style={styles.soValor} numberOfLines={1}>{item.sistema_operacional}</Text>
        </View>

        {/* Softwares Principais (Chips Resumidos) */}
        <Text style={styles.softwareHeader}>Softwares Instalados:</Text>
        <View style={styles.chipsContainer}>
          {item.softwares && item.softwares.length > 0 ? (
            <>
              {item.softwares.slice(0, 4).map((soft, idx) => (
                <View key={idx} style={styles.chipSoftware}>
                  <Text style={styles.chipSoftwareText} numberOfLines={1}>{soft.nome}</Text>
                </View>
              ))}
              {item.softwares.length > 4 && (
                <View style={styles.chipMais}>
                  <Text style={styles.chipMaisText}>+{item.softwares.length - 4} mais</Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.semItemTexto}>Nenhum software específico cadastrado</Text>
          )}
        </View>

        {/* Rodapé com Botão de Detalhes (Touch target acessível) */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.btnFicha}
            onPress={() => abrirFichaTecnica(item)}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.btnFichaText}>Ver Ficha Técnica Detalhada ➔</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.greenIF}
        translucent={Platform.OS === 'android'}
      />

      {/* HEADER INSTITUCIONAL DO IFAM COM PADDING ADAPTATIVO */}
      <View style={styles.header}>
        <View style={styles.headerNav}>
          <TouchableOpacity
            onPress={onBackToMenu || (() => Alert.alert('Voltar', 'Retornando ao Menu'))}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>◀ Menu de Laboratórios</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitles}>
          <Text style={styles.tagModulo}>MÓDULO 2 • INFORMÁTICA</Text>
          <Text style={styles.headerMainTitle}>Catálogo de Laboratórios</Text>
          <Text style={styles.headerSubtitle}>Consulte capacidade, hardware e softwares para aulas práticas</Text>
        </View>
      </View>

      {/* ÁREA DE BUSCA E FILTROS */}
      <View style={styles.searchFilterArea}>
        {/* Barra de Pesquisa com Teclado Mobile Otimizado */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por laboratório, bloco ou software..."
            placeholderTextColor={COLORS.neutralTexto}
            value={buscaTexto}
            onChangeText={setBuscaTexto}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {buscaTexto.length > 0 && (
            <TouchableOpacity
              onPress={() => setBuscaTexto('')}
              style={styles.clearBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Linha 1: Filtro por Bloco */}
        <View style={styles.filtroLinha}>
          <Text style={styles.filtroRotulo}>Bloco:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosScroll}>
            {blocos.map((bloco) => (
              <TouchableOpacity
                key={bloco}
                style={[styles.filtroChip, filtroBloco === bloco && styles.filtroChipActive]}
                onPress={() => setFiltroBloco(bloco)}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Text style={[styles.filtroChipText, filtroBloco === bloco && styles.filtroChipTextActive]}>
                  {bloco}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Linha 2: Filtro por Sistema Operacional */}
        <View style={styles.filtroLinha}>
          <Text style={styles.filtroRotulo}>SO:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosScroll}>
            {sistemasOperacionais.map((so) => (
              <TouchableOpacity
                key={so}
                style={[styles.filtroChip, filtroSO === so && styles.filtroChipActiveSO]}
                onPress={() => setFiltroSO(so)}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Text style={[styles.filtroChipText, filtroSO === so && styles.filtroChipTextActiveSO]}>
                  {so}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Linha 3: Filtro por Capacidade de Máquinas (Atendendo integralmente ao RF-LAB01) */}
        <View style={styles.filtroLinha}>
          <Text style={styles.filtroRotulo}>Vagas:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosScroll}>
            {capacidades.map((cap) => (
              <TouchableOpacity
                key={cap}
                style={[styles.filtroChip, filtroCapacidade === cap && styles.filtroChipActiveCap]}
                onPress={() => setFiltroCapacidade(cap)}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Text style={[styles.filtroChipText, filtroCapacidade === cap && styles.filtroChipTextActiveCap]}>
                  {cap}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* LISTAGEM DOS LABORATÓRIOS */}
      <View style={styles.listContainer}>
        <View style={styles.contadorRow}>
          <Text style={styles.contadorTexto}>
            Exibindo <Text style={{ fontWeight: 'bold', color: COLORS.black }}>{laboratoriosFiltrados.length}</Text> de {mockLaboratorios.length} laboratórios
          </Text>
          {temFiltroAtivo && (
            <TouchableOpacity onPress={limparFiltros} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.resetFiltrosText}>Limpar filtros</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={laboratoriosFiltrados}
          keyExtractor={(item) => item.id_laboratorio}
          renderItem={renderItemLab}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          initialNumToRender={5}
          maxToRenderPerBatch={8}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.greenIF, COLORS.blueAccent]}
              tintColor={COLORS.greenIF}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔎</Text>
              <Text style={styles.emptyTitle}>Nenhum laboratório encontrado</Text>
              <Text style={styles.emptyDesc}>
                Nenhum laboratório atende aos critérios selecionados. Tente ajustar a busca ou limpar os filtros.
              </Text>
              <TouchableOpacity style={styles.btnLimparEmpty} onPress={limparFiltros} activeOpacity={0.8}>
                <Text style={styles.btnLimparEmptyText}>Limpar Todos os Filtros</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* ======================================================== */}
      {/* --- MODAL: FICHA TÉCNICA DETALHADA (RF-LAB01) ---        */}
      {/* ======================================================== */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={fecharFichaTecnica}
        statusBarTranslucent={true}
      >
        {/* Toque no backdrop escuro fecha o modal no mobile */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={fecharFichaTecnica}
        >
          {/* Card interno não propaga o toque de fechamento */}
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation && e.stopPropagation()}
          >
            {labSelecionado && (
              <>
                {/* Cabeçalho do Modal */}
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.modalSubHeader}>FICHA TÉCNICA OFICIAL • MÓDULO 2</Text>
                    <Text style={styles.modalTitulo} numberOfLines={2}>{labSelecionado.nome_laboratorio}</Text>
                    <Text style={styles.modalLocal} numberOfLines={1}>📍 {labSelecionado.bloco_predio}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={fecharFichaTecnica}
                    style={styles.modalCloseBtn}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Conteúdo com Scroll */}
                <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
                  
                  {/* Status do Laboratório em destaque */}
                  <View style={styles.modalStatusRow}>
                    {(() => {
                      const cfg = getStatusBadgeConfig(labSelecionado.status_laboratorio);
                      return (
                        <View style={[styles.badgeStatusModal, { backgroundColor: cfg.corFundo }]}>
                          <Text style={[styles.badgeStatusTextModal, { color: cfg.corTexto }]}>
                            {cfg.icone} Status Atual: {cfg.label}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>

                  {/* Capacidade e Sistema Operacional */}
                  <View style={styles.modalRowInfo}>
                    <View style={styles.modalInfoBox}>
                      <Text style={styles.modalInfoLabel}>Capacidade</Text>
                      <Text style={styles.modalInfoValor}>{labSelecionado.capacidade_computadores} Computadores</Text>
                    </View>
                    <View style={styles.modalInfoBox}>
                      <Text style={styles.modalInfoLabel}>Sistema Operacional</Text>
                      <Text style={styles.modalInfoValor} numberOfLines={2}>{labSelecionado.sistema_operacional}</Text>
                    </View>
                  </View>

                  {/* Seção Hardware Detalhado */}
                  <View style={styles.modalSecao}>
                    <Text style={styles.modalSecaoTitulo}>🖥️ Especificações de Hardware</Text>
                    <View style={styles.hardwareCard}>
                      <Text style={styles.hardwareTexto}>{labSelecionado.especificacao_hardware}</Text>
                    </View>
                  </View>

                  {/* Seção Softwares Instalados */}
                  <View style={styles.modalSecao}>
                    <Text style={styles.modalSecaoTitulo}>
                      💾 Softwares Instalados ({labSelecionado.softwares ? labSelecionado.softwares.length : 0})
                    </Text>
                    {labSelecionado.softwares && labSelecionado.softwares.length > 0 ? (
                      labSelecionado.softwares.map((sw, index) => (
                        <View key={index} style={styles.softwareItem}>
                          <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={styles.softwareItemNome} numberOfLines={1}>{sw.nome}</Text>
                            <Text style={styles.softwareItemCat}>{sw.categoria} • Licença: {sw.licenca}</Text>
                          </View>
                          <View style={styles.badgeVersao}>
                            <Text style={styles.badgeVersaoText}>{sw.versao}</Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.semItemTexto}>Nenhum software registrado para este laboratório.</Text>
                    )}
                  </View>

                  {/* Seção Recursos Adicionais da Sala */}
                  <View style={styles.modalSecao}>
                    <Text style={styles.modalSecaoTitulo}>✨ Recursos Adicionais do Ambiente</Text>
                    <View style={styles.recursosWrap}>
                      {labSelecionado.recursos_sala && labSelecionado.recursos_sala.length > 0 ? (
                        labSelecionado.recursos_sala.map((rec, index) => (
                          <View key={index} style={styles.recursoChip}>
                            <Text style={styles.recursoChipText}>✔ {rec}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.semItemTexto}>Recursos padrão institucionais.</Text>
                      )}
                    </View>
                  </View>

                  {/* Plaqueta QR Code de Identificação */}
                  <View style={styles.modalSecao}>
                    <Text style={styles.modalSecaoTitulo}>📲 Plaqueta de Porta (Check-in)</Text>
                    <View style={styles.qrInfoCard}>
                      <Text style={styles.qrCodeIcon}>🏷️</Text>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.qrTitle}>Identificador de Check-in na Porta</Text>
                        <Text style={styles.qrHash}>{labSelecionado.qr_code_porta_hash}</Text>
                      </View>
                    </View>
                  </View>

                </ScrollView>

                {/* Ações do Modal */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.btnSolicitarModal}
                    onPress={() => handleSolicitarLab(labSelecionado)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnSolicitarModalText}>📝 Solicitar Alocação Deste Lab</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnFecharModal}
                    onPress={fecharFichaTecnica}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnFecharModalText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

// ========================================================
// --- ESTILOS DO DESIGN SYSTEM V2 (IFAM) ---
// ========================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutralFundo,
  },

  // Header Institucional com paddingTop adaptativo para Android Notch/StatusBar
  header: {
    backgroundColor: COLORS.greenIF,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 16) : 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerNav: {
    marginBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 13,
    fontWeight: '600',
  },
  headerTitles: {
    marginTop: 2,
  },
  tagModulo: {
    color: COLORS.warningYellow,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  headerMainTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },

  // Área de Busca e Filtros
  searchFilterArea: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutralBorda,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutralFundo,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    marginBottom: 8,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.black,
    height: '100%',
    paddingVertical: 0, // Evita desalinhamento no Android
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    fontSize: 14,
    color: COLORS.neutralTexto,
  },
  filtroLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  filtroRotulo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.neutralTexto,
    width: 46,
  },
  filtrosScroll: {
    paddingRight: 8,
  },
  filtroChip: {
    backgroundColor: COLORS.neutralFundo,
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
  },
  filtroChipActive: {
    backgroundColor: COLORS.greenLight,
    borderColor: COLORS.greenIF,
  },
  filtroChipText: {
    fontSize: 11,
    color: COLORS.neutralDark,
    fontWeight: '500',
  },
  filtroChipTextActive: {
    color: COLORS.greenIF,
    fontWeight: 'bold',
  },
  filtroChipActiveSO: {
    backgroundColor: COLORS.blueLight,
    borderColor: COLORS.blueAccent,
  },
  filtroChipTextActiveSO: {
    color: COLORS.blueAccent,
    fontWeight: 'bold',
  },
  filtroChipActiveCap: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FB8C00',
  },
  filtroChipTextActiveCap: {
    color: '#E65100',
    fontWeight: 'bold',
  },

  // Lista
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contadorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contadorTexto: {
    fontSize: 12,
    color: COLORS.neutralTexto,
  },
  resetFiltrosText: {
    fontSize: 12,
    color: COLORS.blueAccent,
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingBottom: 24,
  },

  // Card do Laboratório
  cardLab: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeCapacidade: {
    backgroundColor: COLORS.neutralFundo,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeCapacidadeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.neutralDark,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  localRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  localIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  localTexto: {
    fontSize: 12,
    color: COLORS.neutralTexto,
    flex: 1,
  },
  soContainer: {
    backgroundColor: COLORS.neutralFundo,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 10,
  },
  soLabel: {
    fontSize: 10,
    color: COLORS.neutralTexto,
    fontWeight: 'bold',
  },
  soValor: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: '600',
  },
  softwareHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.neutralTexto,
    marginBottom: 6,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chipSoftware: {
    backgroundColor: COLORS.blueLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  chipSoftwareText: {
    fontSize: 10,
    color: COLORS.blueAccent,
    fontWeight: '600',
  },
  chipMais: {
    backgroundColor: COLORS.neutralFundo,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  chipMaisText: {
    fontSize: 10,
    color: COLORS.neutralTexto,
    fontWeight: '600',
  },
  semItemTexto: {
    fontSize: 11,
    color: COLORS.neutralTexto,
    fontStyle: 'italic',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutralBorda,
    paddingTop: 10,
  },
  btnFicha: {
    backgroundColor: COLORS.blueLight,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnFichaText: {
    color: COLORS.blueAccent,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Estado Vazio
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: COLORS.neutralTexto,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 18,
    marginBottom: 14,
  },
  btnLimparEmpty: {
    backgroundColor: COLORS.greenIF,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnLimparEmptyText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Modal Ficha Técnica
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Safe margin para iPhone Home Bar
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutralBorda,
  },
  modalSubHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.blueAccent,
    letterSpacing: 1,
    marginBottom: 2,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  modalLocal: {
    fontSize: 12,
    color: COLORS.neutralTexto,
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: COLORS.neutralFundo,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: COLORS.neutralDark,
    fontWeight: 'bold',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
  },
  modalStatusRow: {
    marginBottom: 14,
  },
  badgeStatusModal: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeStatusTextModal: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalRowInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalInfoBox: {
    width: '48%',
    backgroundColor: COLORS.neutralFundo,
    padding: 10,
    borderRadius: 8,
  },
  modalInfoLabel: {
    fontSize: 10,
    color: COLORS.neutralTexto,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  modalInfoValor: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  modalSecao: {
    marginBottom: 16,
  },
  modalSecaoTitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  hardwareCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.neutralBorda,
    padding: 12,
    borderRadius: 8,
  },
  hardwareTexto: {
    fontSize: 12,
    color: COLORS.neutralDark,
    lineHeight: 18,
    fontWeight: '500',
  },
  softwareItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutralFundo,
  },
  softwareItemNome: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  softwareItemCat: {
    fontSize: 10,
    color: COLORS.neutralTexto,
    marginTop: 1,
  },
  badgeVersao: {
    backgroundColor: COLORS.blueLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeVersaoText: {
    fontSize: 10,
    color: COLORS.blueAccent,
    fontWeight: 'bold',
  },
  recursosWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recursoChip: {
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  recursoChipText: {
    fontSize: 11,
    color: COLORS.greenIF,
    fontWeight: '600',
  },
  qrInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FBE7',
    borderWidth: 1,
    borderColor: '#E6EE9C',
    padding: 10,
    borderRadius: 8,
  },
  qrCodeIcon: {
    fontSize: 24,
  },
  qrTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#33691E',
  },
  qrHash: {
    fontSize: 11,
    color: COLORS.neutralDark,
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      default: 'monospace'
    }),
    marginTop: 2,
  },

  // Rodapé do Modal
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutralBorda,
  },
  btnSolicitarModal: {
    backgroundColor: COLORS.greenIF,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnSolicitarModalText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  btnFecharModal: {
    backgroundColor: COLORS.neutralBorda,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnFecharModalText: {
    color: COLORS.neutralDark,
    fontSize: 13,
    fontWeight: '600',
  },

  // Sombra Multiplataforma
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  }),
});
