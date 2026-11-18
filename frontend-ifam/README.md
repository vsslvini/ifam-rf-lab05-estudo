# Front-end IFAM (React Native / Expo)

Aplicativo mobile do **Portal de Serviços e Gestão IFAM**.

Documentação de referência: `Documentação/docs/seq_04_mapa_frontend.md`.

---

## Como executar

```bash
npm install
npx expo start
```

Depois: `a` para o emulador Android, `i` para iOS, `w` para o navegador, ou
escaneie o QR Code com o **Expo Go**.

### Apontando para a API

A URL do back-end fica em `app.json`, em `expo.extra`:

```json
"extra": {
  "apiBaseUrl": "http://localhost:8000",
  "useMock": false,
  "telaInicial": "APROVACOES_ALOCACOES"
}
```

> Em **dispositivo físico** `localhost` aponta para o próprio celular. Troque
> pelo IP da sua máquina na rede local (ex.: `http://192.168.0.10:8000`) e suba
> a API com `uvicorn app.main:app --host 0.0.0.0`.

Com `useMock: true` o app não chama a API e usa dados locais de demonstração.

---

## Features implementadas

| Requisito | Equipe | Tela | Situação |
| :--- | :--- | :--- | :--- |
| **RF-EQ01** | — | `src/modules/equipamentos/screens/tipos_recurso_screen.js` | Integrada à API |
| **RF-LAB05** | 16 | `src/modules/laboratorios/screens/aprovacoes_alocacoes_screen.js` | Integrada à API |

As demais telas do repositório ainda são protótipos com dados fixos.

### Qual tela o app abre

Enquanto não existe navegação global, o `App.js` renderiza **uma** tela por
vez, escolhida em `app.json` → `expo.extra.telaInicial`. As telas registradas
estão no mapa `TELAS` do `App.js`:

| `telaInicial` | Tela |
| :--- | :--- |
| `TIPOS_RECURSO` | RF-EQ01 — Tipos de Recursos |
| `APROVACOES_ALOCACOES` | RF-LAB05 — Aprovações de Laboratórios |

Para demonstrar outra feature, registre a tela no mapa e troque essa palavra.

### RF-EQ01 — Catálogo de Tipos de Recursos

CRUD das categorias de equipamentos, consumindo
`/api/v1/equipamentos/tipos` através de
`src/modules/equipamentos/services/equipamentosService.js`.

**Fallback offline:** se a API não responder (ou `useMock` estiver ligado), o
service cai automaticamente em `tiposRecursoMock.js`, que reproduz o mesmo
contrato. A tela exibe um aviso de que está mostrando dados locais — assim a
demonstração nunca quebra por causa do back-end.

---

### RF-LAB05 — Aprovação e Detecção de Conflitos

Painel do Administrador (`aprovacoes_alocacoes_screen.js`) para analisar os
pedidos de uso de laboratório, consumindo `/api/v1/laboratorios/alocacoes`
através de `src/modules/laboratorios/services/laboratoriosService.js`.

**Como o código está dividido** (feature-first, tudo dentro de
`src/modules/laboratorios/`):

```text
screens/aprovacoes_alocacoes_screen.js   orquestração: liga hook, componentes e diálogos
hooks/useAprovacoesAlocacoes.js          dados: carregar / aprovar / rejeitar + estados de rede
components/aprovacoes/                   só apresentação, sem acesso ao service
  CabecalhoAprovacoes.js                   título, voltar e contador de pendentes
  BannerModoOffline.js                     faixa amarela do modo mock
  CampoBusca.js                            busca por texto (docente, disciplina, lab...)
  FiltrosTipoAlocacao.js                   chips Todos / Pontual / Semestral
  ListaPedidosAlocacao.js                  FlatList + pull-to-refresh + estado vazio
  CardPedidoAlocacao.js                    card do pedido (badges, dados, softwares, ações)
  AlertaConflitoHorario.js                 caixa vermelha da RN04 com os concorrentes
  ModalRejeicaoAlocacao.js                 modal da RN05 (justificativa, contador, envio)
  EstadosDaLista.js                        carregando / erro / vazio
utils/alocacaoFormatters.js              datas, agenda semestral, texto de confirmação
utils/filtrosAlocacao.js                 chips → params da API
utils/buscaAlocacao.js                   busca por texto no aparelho (sem acento/caixa)
utils/dialogos.js                        avisar / confirmar (web e nativo)
services/laboratoriosService.js          API real com fallback para o mock
services/aprovacoesAlocacoesMock.js      mock com o contrato e as regras da API
```

A tela não conhece o Axios nem o mock; os componentes não conhecem o
service. Para trocar o visual, mexe-se em `components/`; para trocar a
origem dos dados, em `services/`; a regra de "o que acontece ao aprovar"
está num lugar só, o hook.

| Ação na tela | Chamada |
| :--- | :--- |
| Carregar a fila / pull-to-refresh | `GET /alocacoes/pendentes` |
| Chips *Pontual* / *Semestral* | `GET /alocacoes/pendentes?tipo_alocacao=...` |
| Campo de **busca** | nenhuma: filtra no aparelho a lista já carregada |
| Botão **Aprovar** | `PATCH /alocacoes/{id}/status` → `Aprovada` |
| Modal **Rejeitar** | `PATCH /alocacoes/{id}/status` → `Rejeitada` + justificativa |

**Regras de negócio na interface**

* **RN04 (conflito de grade):** quem decide o conflito é o servidor. A tela
  desenha o alerta crítico vermelho a partir de `conflito_detectado` e lista os
  concorrentes que vêm em `conflitos` (disciplina, docente, turma e status). O
  botão Aprovar aparece marcado como bloqueado e, se ainda assim for acionado,
  o `409` da API é exibido com o motivo e a fila é recarregada.
* **RN05 (justificativa obrigatória):** o modal de rejeição só habilita o envio
  com pelo menos 10 caracteres (mesmo mínimo do schema da API) e mostra um
  contador. A validação real continua no servidor, que responde `422`.

**Fallback offline:** se a API não responder (ou `useMock` estiver ligado), o
service cai automaticamente em `aprovacoesAlocacoesMock.js`, que reproduz o
mesmo contrato — **inclusive as RN04 e RN05**, para que a demonstração não
mostre um comportamento que o sistema real não tem. A tela exibe um aviso de
que está com dados locais.

**Busca por texto:** procura em docente, disciplina, laboratório, bloco,
turma e softwares, ignorando caixa e acentos; todas as palavras digitadas
precisam aparecer. Roda no aparelho porque a API ainda não tem `?busca=`.
O contador do cabeçalho continua mostrando a fila inteira do filtro atual.

**Barra de status no Android:** o `SafeAreaView` do React Native só reserva
espaço no iOS. A tela soma `Constants.statusBarHeight` (`expo-constants`) ao
topo no Android.

**Testes:** `node tests/laboratorios/run.cjs` (15 testes) cobre os
formatadores, o filtro enviado à API, a busca por texto e as regras RN04/RN05
do mock. Usa só o `node:test` e o
Babel que o Expo já instala.

---

## Pontos de troca (dependências de outras equipes)

| Dependência | Arquivo | Situação hoje | O que muda depois |
| :--- | :--- | :--- | :--- |
| Token JWT (RF-CORE01) | `src/core/services/interceptors.js` | `obterTokenArmazenado()` devolve `null` | Ler o token do AuthContext / SecureStore |
| Navegação | `App.js` | Renderiza a tela indicada em `expo.extra.telaInicial` | Trocar pelo `AppNavigator` e transformar cada item do mapa `TELAS` num `<Stack.Screen>` |
| Solicitação de alocação (RF-LAB04) | — | A fila vem do seed do back-end | A tela de solicitação passa a alimentar a fila; nada muda aqui |
| Menu do Módulo 2 | `onBackToMenu` | Recebe uma função vazia | Ligar ao menu de laboratórios do HubNavigator |

Nada em `src/navigation/` foi alterado — essa camada continua livre para a
equipe responsável.
