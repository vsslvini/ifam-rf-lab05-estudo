# Integração futura — Equipe 2 — RF-CORE03 e RF-CORE04

Este documento é o contrato para conectar a Central de Notificações e o Hub à aplicação compartilhada da turma. Ele **não** é necessário para executar a demonstração isolada ou o Expo Snack; para isso, consulte `EXECUCAO_ISOLADA_EQUIPE_2.md`.

## Estado da integração

Esta entrega implementa o consumo real da API de notificações e as telas de hub/central. Não contém usuário simulado, notificações de demonstração ou substituição de falhas por dados fictícios.

Quando este contrato foi preparado, `App.js`, `package.json` e `AppNavigator.js` estavam vazios e os componentes de autenticação/navegação ainda eram placeholders. A entrega não resolve a inicialização global do aplicativo nem implementa o login da equipe 1. A integração deve ser feita quando as interfaces abaixo estiverem disponíveis e alinhadas.

## RF-CORE03 — Central de notificações

- Listagem autenticada, filtros por módulo, estados de carregamento/erro e atualização manual.
- `GET /api/v1/notificacoes/` e `PATCH /api/v1/notificacoes/{id_notificacao}/ler`, conforme o mapa de backend do projeto.
- A leitura e o contador só mudam após confirmação do PATCH. Falhas são exibidas e mantêm a notificação não lida.
- Ao trocar a sessão, a lista anterior deixa de ser exibida. Respostas atrasadas da sessão anterior são ignoradas.
- Sem token não há requisição. Sem URL ou com API indisponível, o serviço retorna erro; não há fallback de demonstração.

### Dependências externas

| Responsável | Entrega necessária |
| --- | --- |
| Equipe 1 (RF-CORE01) | Sessão real, JWT e dados do usuário |
| Equipes 1/3 (RF-CORE01/RF-CORE05) | Modelo e identificação compartilhados do usuário |
| Base compartilhada | App executável, API registrada e PostgreSQL com tabelas de usuários/notificações |
| Equipe 7 (RF-EQ04) | Registros de aprovação/rejeição de equipamentos |
| Equipe 16 (RF-LAB05) | Registros de aprovação/rejeição de laboratórios |
| Responsáveis pela mensageria | Registros de lembretes/atrasos; responsável individual ainda não definido no documento de equipes |

O serviço HTTP fica em `src/modules/auth/services/notificacoesService.js`. Ajustes de rota, autenticação ou resposta devem ser concentrados ali. Usa `fetch` nativo, sem depender do `src/core/services/api.js` ainda vazio e sem modificar o cliente compartilhado.

## RF-CORE04 — Hub

O hub recebe `usuario`, `onNavigate`, `onLogout` e `rotasDisponiveis`. O perfil vem de `usuario.perfil` (`Administrador` ou `Solicitante`); não existe alternador artificial de perfil. O hub não substitui a autorização dos endpoints.

O layout do Hub segue o `hub_modulos_screen.js` do professor e o Design System V2 (`seq_03`): banner institucional, cards de Equipamentos e Laboratórios, cards "Em Breve" de Auditórios e Chaves (sem rota) e atalhos por perfil. A paleta e os raios vêm de `src/core/theme/colors.js`. Novos módulos entram no array de módulos do hub (`seq_08`).

**Ordem de merge:** esta PR (RF-CORE03) deve entrar antes da PR RF-CORE04, pois o Hub usa `useNotifications` do `NotificationContext` daqui.

Somente rotas informadas em `rotasDisponiveis` ficam habilitadas. Módulos não registrados aparecem indisponíveis. O responsável pela navegação deve informar somente destinos reais, incluindo o mapeamento para navegadores aninhados quando necessário.

| Rota | Destino / responsável |
| --- | --- |
| `PERFIL_NOTIFICACOES` | Central da equipe 2 |
| `MODULO_EQUIPAMENTOS`, `MODULO_LABORATORIOS` | Navegadores dos módulos |
| `APROVACOES_PENDENTES` | RF-EQ04, equipe 7 |
| `CHECKOUT` | Check-out por QR, atalho do administrador de equipamentos |
| `INVENTARIO` | RF-EQ02, equipe 5 |
| `CATALOGO_SOLICITANTE` | RF-EQ03, equipe 6 |
| `MEUS_EMPRESTIMOS` | RF-EQ07, equipe 10 |
| `APROVACOES_ALOCACOES` | RF-LAB05, equipe 16 |
| `GRADE_LABS` | RF-LAB03, equipe 14 |
| `CHECKIN_LAB_PORTA` | Abertura de laboratório por QR, atalho do administrador |
| `GESTAO_SOFTWARES` | Gestão de softwares dos laboratórios, atalho do administrador |
| `CATALOGO_LABS` | RF-LAB01, equipe 12 |
| `SOLICITAR_LAB` | RF-LAB04, equipe 15 |

## Conexão com autenticação e navegação

Preservados os nomes de arquivos e exports default já presentes no Gitea:

```jsx
import HubModulosScreen from './src/modules/hub/screens/hub_modulos_screen';
import PerfilNotificacoesScreen from './src/modules/auth/screens/perfil_notificacoes_screen';
import { NotificationProvider } from './src/core/context/NotificationContext';

// Envolver o navegador autenticado inteiro, para compartilhar a lista e o contador.
<NotificationProvider token={sessao.access_token} apiUrl={apiUrl}>
  {navegadorAutenticado}
</NotificationProvider>

// Props na rota do hub:
<HubModulosScreen
  usuario={sessao.usuario}
  onNavigate={navegarParaRotaRegistrada}
  onLogout={encerrarSessao}
  rotasDisponiveis={rotasRegistradas}
/>

// Props na rota da central:
<PerfilNotificacoesScreen usuario={sessao.usuario} onBack={voltarAoHub} />
```

O exemplo descreve os pontos de conexão, não constitui um `App.js` independente. Se o AuthContext usar `accessToken`, mapear `access_token` da resposta de login nesse contexto. `onBackToMenu` permanece aceito como alternativa a `onBack` para preservar o callback antigo da central.

Configure `EXPO_PUBLIC_API_URL` com a raiz alcançável da API, sem `/api/v1`; alternativamente passe `apiUrl` ao provider. Não existe URL local presumida. A API recebe `Authorization: Bearer <token>`. A atualização ocorre ao receber a sessão e por gesto de atualização na central; não há push nem polling automático nesta entrega.

## Validação da integração futura

```text
npm --prefix tests/notificacoes install --ignore-scripts
npm --prefix tests/notificacoes test
```

Os 10 testes usam dependências próprias da pasta de testes. Exercitam os caminhos HTTP, token/configuração ausentes, 401, resposta incompatível, timeout, confirmação de leitura, falha de PATCH, isolamento após troca de conta e compilação da tela de notificações. JSX é transformado e componentes nativos são substituídos somente no ambiente de testes. Isso não é um teste de execução do Expo/dispositivo.

Antes da integração final, validar na aplicação: login real → hub → central → marcar leitura → reabrir e confirmar persistência. Validar os atalhos à medida que as equipes registrarem os destinos.
