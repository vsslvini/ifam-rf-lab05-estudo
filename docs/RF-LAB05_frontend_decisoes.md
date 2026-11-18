# RF-LAB05 — Registro de Alterações e Decisões de Projeto (Front-end)

**Equipe 16** — Jhuliano e Vinicius
**Requisito:** RF-LAB05 — Aprovação e Detecção de Conflitos (perfil Administrador)
**Branch:** `feature/RF-LAB05` (a partir de `develop`, GitFlow)
**Tela:** `src/modules/laboratorios/screens/aprovacoes_alocacoes_screen.js`
**Desde 15/11/2026:** a tela é só orquestração; componentes em
`components/aprovacoes/`, dados em `hooks/useAprovacoesAlocacoes.js`,
funções puras em `utils/` (ver seção 7).

Documento exigido pela diretriz do projeto: *"todas as alterações devem ser
registradas em um arquivo em /docs, para fins de estudos posteriores"* e
*"devem ser documentadas todas as decisões de projeto, bem como padrões
escolhidos"*.

---

## 1. Ponto de partida

A `develop` já continha a tela do protótipo, mas:

* ela estava em `src/navigation/modules/laboratorios/screen/` — pasta de
  navegação, não de módulo (o commit que a trouxe se chama literalmente
  *"screen no local errado"*);
* era o arquivo do protótipo **sem nenhuma alteração**: `initialAprovacoes`
  com três registros fixos, `conflito: true` escrito à mão e nenhuma chamada
  de API;
* `src/modules/laboratorios/services/laboratoriosService.js` era um
  `export function placeholder() {}`.

---

## 2. Alterações por arquivo

| Arquivo | Estado anterior | O que foi feito |
| :--- | :--- | :--- |
| `src/modules/laboratorios/screens/aprovacoes_alocacoes_screen.js` | protótipo em `src/navigation/...` | Movido (`git mv`) e integrado à API |
| `src/modules/laboratorios/services/laboratoriosService.js` | placeholder | 4 funções do RF-LAB05 com fallback offline |
| `src/modules/laboratorios/services/aprovacoesAlocacoesMock.js` | **novo** | Mock com o contrato do `seq_06` e as RN04/RN05 |
| `App.js` | renderizava uma tela fixa | Seletor por `expo.extra.telaInicial` + mapa `TELAS` |
| `app.json` | — | `extra.telaInicial: "APROVACOES_ALOCACOES"` |
| `README.md` | — | Feature, tabela de chamadas, regras na interface e pontos de troca |

O `git mv` preserva o histórico do arquivo: `git log --follow` continua
mostrando o commit original de quem trouxe o protótipo.

---

## 3. Decisões de projeto

### Decisão 1 — Quem decide o conflito é o servidor

A tela **não recalcula** sobreposição de horário: ela desenha o que vem em
`conflito_detectado` e `conflitos`, e respeita o `409` da aprovação.

*Por quê:* a RN04 depende de todos os pedidos do laboratório, não só dos que
estão na tela (a fila é filtrada e paginável). Duplicar a regra no cliente
criaria duas versões da mesma verdade — e a do cliente estaria sempre
desatualizada. O cliente cuida da *apresentação* do conflito; a decisão é do
servidor.

### Decisão 2 — O alerta vermelho passou a dizer *com quem* o horário bate

No protótipo o card só mostrava "⚠️ Alerta: Conflito de Horário no Lab". Agora
lista cada concorrente (disciplina, docente, turma e status), marcando com 🔒
os que efetivamente bloqueiam a aprovação.

*Por quê:* o objetivo do requisito é o Administrador **resolver** o conflito.
Saber que existe um conflito sem saber quem o causa obriga a sair da tela.
Isso motivou a extensão do contrato no back-end (campo `conflitos`).

### Decisão 3 — Filtro no servidor, não no cliente

Os chips *Pontual* / *Semestral* refazem a requisição com `tipo_alocacao`, em
vez de filtrar o array em memória como no protótipo.

*Por quê:* a fila real de uma coordenação não cabe numa resposta só; filtrar no
cliente só funciona enquanto tudo estiver carregado. O endpoint já aceita o
filtro, então usá-lo é o caminho que continua correto quando houver paginação.

### Decisão 4 — O mock também aplica RN04 e RN05

`aprovacoesAlocacoesMock.js` recusa a aprovação em conflito (409) e a rejeição
sem justificativa (422), com as mesmas mensagens da API.

*Por quê:* um mock que aceita tudo demonstra um sistema que não existe. Se a
apresentação cair no modo offline, as regras precisam continuar visíveis — é
justamente o que está sendo avaliado.

### Decisão 5 — Validação da RN05 na tela é só conforto

O modal exige 10 caracteres (mesmo mínimo do schema Pydantic) e mostra
contador, mas quem garante a regra é o servidor. A tela trata o `422` como
qualquer outro erro de negócio.

*Por quê:* validação de cliente é feedback imediato, não segurança. O `seq_08`
pede validação nas duas pontas.

### Decisão 6 — Alocação semestral é descrita pelo dia da semana

`descreverAgenda()` mostra "Todas as Quartas-feiras (a partir de 05/08/2026)"
para `Semestral` e "28/08/2026 • Sexta-feira" para `Pontual`.

*Por quê:* é a leitura correta do DDL (em alocação semestral `data_reserva` é o
início do semestre) e a mesma regra que o back-end usa para detectar conflito.
Mostrar só a data faria o usuário achar que a reserva é de um único dia.

### Decisão 7 — Seletor de tela no `App.js` em vez de sobrescrever o arquivo

O `App.js` renderizava a tela do RF-EQ01 direto. Trocá-la pela nossa
apagaria a demonstração da outra dupla; deixar como estava tornaria a nossa
tela inalcançável. A solução foi um mapa `TELAS` + `expo.extra.telaInicial`:
cada dupla acrescenta **uma linha** e troca **uma palavra**.

*Por quê:* é a alteração mais barata que não conflita com as outras equipes, e
as chaves já usam os nomes de rota previstos para o `AppNavigator` — quando a
navegação chegar, cada entrada do mapa vira um `<Stack.Screen>`.

### Decisão 8 — Fallback offline no padrão do RF-EQ01

`comFallback()` é a mesma estratégia de `equipamentosService.js`: erro de rede
cai no mock e liga `isModoMock()`; erro de negócio (404/409/422) é propagado
para a tela tratar.

*Por quê:* padrão já existente no repositório — copiar a convenção da casa vale
mais do que inventar uma melhor.

---

## 4. Padrões adotados

| Tema | Padrão |
| :--- | :--- |
| Organização | Feature-first (`src/modules/<modulo>/{screens,services,components}`), conforme `seq_09` |
| Estilo visual | Exclusivamente `src/core/theme/colors.js` (`COLORS`, `RADIUS`) — Design System V2 |
| Layout | Badges em coluna no topo do card (`seq_03`, seção 2.A), cards `12px`, botões `8px`, chips `16px` |
| Nomes | Estado e funções em português; campos da API mantidos em `snake_case`, como chegam |
| Estados de tela | `carregando` / `erro + tentar novamente` / `vazio` / `pull-to-refresh` / aviso de modo offline |
| Multiplataforma | Helpers `avisar` / `confirmar` (a web não tem `Alert.alert`) |
| Commits | Conventional Commits com escopo de domínio, um commit por etapa |

---

## 5. Como validar a entrega

```bash
# 1. Back-end (outro terminal, no repositorio backend-ifam)
docker compose up -d postgres
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 2. App
npm install
npx expo start          # `w` abre no navegador
```

Com `expo.extra.telaInicial = "APROVACOES_ALOCACOES"` o app abre direto na
tela. Roteiro de demonstração:

1. A fila mostra três pedidos; o do Blender vem com a borda e o alerta
   vermelhos, listando a turma que já ocupa o Lab 03.
2. **Aprovar** nesse card → alerta de conflito com o motivo da API (RN04).
3. **Rejeitar** com o campo vazio → aviso de justificativa obrigatória (RN05);
   com o texto preenchido, o pedido sai da fila.
4. **Aprovar** o pedido de Redes → "Alocação aprovada. Notificação disparada ao
   docente." e a fila diminui.
5. Derrube a API e puxe a lista para baixo: aparece o aviso de dados locais e
   os passos 2‑4 continuam funcionando pelo mock.

> **Desde a etapa 2 do back-end (07/10/2026)** a API grava no PostgreSQL:
> depois dos passos 2‑4 os pedidos analisados não voltam ao reiniciar a API.
> Para repetir o roteiro, rode `python -m app.seed --recriar` no back-end.
> Nada mudou no front-end — o contrato da API é o mesmo e a integração foi
> conferida (CORS de `localhost:8081` para GET e PATCH).

---

> Autoria dos commits, como localizar a entrega no repositório e o índice geral
> das duas camadas: ver `grupo16_RF-LAB05_registro.md` nesta mesma pasta.

---

## 6. Verificação na `develop` (07/10/2026)

O PR #27 foi mergeado em 05/10/2026. Na `develop` o app abre **direto** na
tela de aprovações, sem passar pelas telas anteriores do fluxo do protótipo
(`seq_04`, seção 3): Login → Hub de Módulos → Menu de Laboratórios →
Aprovações.

Isso é esperado, não é falha do merge:

| Tela anterior | Requisito | Situação na `develop` |
| :--- | :--- | :--- |
| Login (`AuthNavigator`) | RF-CORE01 | Não mergeado — está em `feature/rf-02-v2`, já com `AppNavigator` e React Navigation |
| Hub de Módulos | RF-CORE04 | Mergeado (`src/modules/hub/screens/hub_modulos_screen.js`), mas **não ligado** ao `App.js` |
| Menu de Laboratórios | Hub do Módulo 2 | Não existe em `src/` (só o protótipo `menu_laboratorios_screen.js`); `LaboratoriosScreen.js` é placeholder |
| Navigators (`App`/`Hub`/`Laboratorios`) | Equipe de navegação | Placeholders (`export function placeholder() {}`) |

Enquanto a navegação não entra, o `App.js` usa o seletor `TELAS` da decisão 7
e abre a tela indicada em `expo.extra.telaInicial`. A nossa tela já recebe
`onBackToMenu`, que é o ponto de ligação com o Menu de Laboratórios quando ele
existir.

---

## 7. Componentização da tela (15/11/2026)

**Branch:** `feature/RF-LAB05`, recriada a partir da `develop` (fluxo
combinado na sessão de 07/10: feature mergeada é finalizada; alteração nova
sai de uma branch nova com o nome do requisito e volta por PR). Commits
locais, **sem push**.

### 7.1. Ponto de partida

A tela mergeada no PR #27 era **um arquivo de 908 linhas**: helpers,
estados, chamadas ao service, o card, o modal, os três estados da lista e
quatrocentas linhas de `StyleSheet`, tudo em `aprovacoes_alocacoes_screen.js`.
Funcionava, mas era difícil de explicar e de apontar "onde fica" cada
responsabilidade — e o `seq_04` já previa a pasta `components/` em cada
módulo, que estava vazia no nosso.

### 7.2. Estrutura resultante

Tudo continua dentro de `src/modules/laboratorios/` (feature-first):

| Camada | Arquivo | Responsabilidade | Linhas |
| :--- | :--- | :--- | :---: |
| Tela | `screens/aprovacoes_alocacoes_screen.js` | Orquestração: liga hook, componentes e diálogos | 123 |
| Hook | `hooks/useAprovacoesAlocacoes.js` | Dados: carregar/aprovar/rejeitar + estados de rede | 132 |
| Componente | `components/aprovacoes/CabecalhoAprovacoes.js` | Título, voltar, contador de pendentes | 76 |
| Componente | `components/aprovacoes/BannerModoOffline.js` | Faixa amarela do modo mock | 36 |
| Componente | `components/aprovacoes/FiltrosTipoAlocacao.js` | Chips Todos / Pontual / Semestral | 63 |
| Componente | `components/aprovacoes/ListaPedidosAlocacao.js` | `FlatList` + pull-to-refresh + vazio | 55 |
| Componente | `components/aprovacoes/CardPedidoAlocacao.js` | O card (badges, dados, softwares, ações) | 238 |
| Componente | `components/aprovacoes/AlertaConflitoHorario.js` | Caixa vermelha da RN04 | 48 |
| Componente | `components/aprovacoes/ModalRejeicaoAlocacao.js` | Modal da RN05 | 207 |
| Componente | `components/aprovacoes/EstadosDaLista.js` | Carregando / erro / vazio | 97 |
| Componente | `components/aprovacoes/estilosCompartilhados.js` | Laranja "pendente" e sombra do card | 25 |
| Componente | `components/aprovacoes/index.js` | Barrel: a tela importa tudo de um lugar | 15 |
| Util | `utils/alocacaoFormatters.js` | `formatarData`, `descreverAgenda`, bloqueios | 56 |
| Util | `utils/filtrosAlocacao.js` | Lista de chips e `filtrosParaApi` | 24 |
| Util | `utils/dialogos.js` | `avisar` / `confirmar` multiplataforma | 38 |
| Teste | `tests/laboratorios/run.cjs` | 11 casos: formatadores, filtro e regras do mock | — |

`services/` não mudou. O `App.js` e o `app.json` também não: o caminho e o
nome da tela são os mesmos, então nada fora do módulo percebe a mudança.

### 7.3. Decisões

#### Decisão 9 — Três camadas dentro do módulo: tela, hook, componentes

A regra de separação é por **pergunta**:

* *"De onde vêm os dados e o que acontece ao aprovar?"* → `hooks/`. O hook
  é o único que importa o service.
* *"Como isso aparece na tela?"* → `components/`. Componentes "burros":
  recebem props e disparam callbacks; nenhum importa o service.
* *"O que está aberto agora?"* → a tela. Só um estado sobrou nela: qual
  pedido está com o modal de rejeição aberto.

*Por quê:* é o mesmo princípio da decisão 1 (apresentação × decisão), agora
aplicado dentro do front-end. Dá para explicar a tela em um minuto: ela chama
o hook, passa os dados para os componentes e traduz erros em diálogos.

#### Decisão 10 — Subpasta `components/aprovacoes/` com barrel

Os componentes ficam em `components/aprovacoes/`, não soltos em
`components/`, e um `index.js` reexporta todos.

*Por quê:* `components/` do Módulo 2 já tem placeholders de outros
requisitos (`GradeSlotsGrid`, `ModalFichaTecnicaLab`...). A subpasta deixa
claro o que é da Equipe 16 e evita colisão de nome no merge. O barrel faz a
tela ter **um** import para a camada visual.

#### Decisão 11 — Nada foi colocado em `src/core/`

`ButtonIF`, `CardContainer`, `BadgeStatus`, `dateUtils` e `shadows` do
`core/` continuam `placeholder()`. Os equivalentes nossos (o `Badge` interno
do card, `SOMBRA_CARD`, `formatarData`, `avisar`/`confirmar`) ficaram no
módulo.

*Por quê:* o `seq_09` atribui a camada `core/` à Equipe do Core; preencher
esses arquivos geraria conflito com o trabalho dela. A diretriz manda mockar
o que não é nosso "de forma que a integração seja simples": quando o core
entregar, a troca é um import por componente, e `dialogos.js` /
`alocacaoFormatters.js` podem migrar inteiros para `core/utils/`.

#### Decisão 12 — O modal é dono do próprio texto

`ModalRejeicaoAlocacao` guarda a justificativa digitada e o estado
"enviando"; abre quando recebe `pedido` e fecha quando ele vira `null`. A
validação dos 10 caracteres (RN05, conforto) também vive nele. A tela só
recebe `onConfirmar(justificativa)` já validada.

*Por quê:* quatro `useState` da tela antiga eram detalhes do modal. Fora
dele, obrigavam a tela a saber de contador e campo de texto. Dentro, o modal
é reutilizável e a tela encolhe.

#### Decisão 13 — Hook devolve resultado e relança erro; quem avisa é a tela

`fila.aprovar(pedido)` devolve `{ mensagem }` ou lança o erro do service (409,
422...). O hook cuida só do que é dado: tirar da fila, sincronizar o modo
mock, recarregar depois de um 409. `avisar`/`confirmar` ficam na tela.

*Por quê:* um hook que abre `window.alert` é difícil de testar e de
reaproveitar numa tela de detalhe. Mantendo os diálogos na tela, o hook
poderia ser usado por outra interface (ex.: dashboard do RF-LAB08) sem mudar.

#### Decisão 14 — Respostas obsoletas da listagem são ignoradas

O hook numera cada `GET /pendentes` e descarta a resposta se outra requisição
foi disparada depois (`ultimaRequisicao` com `useRef`).

*Por quê:* trocar os chips rápido podia fazer a resposta do filtro antigo
chegar depois da do novo e sobrescrever a lista — condição de corrida
anotada como melhoria no guia de estudo. Já que a lógica de carregamento
estava sendo movida, foi o momento de resolver sem tocar no comportamento
visível.

#### Decisão 15 — Testes só do que é puro, sem dependência nova

`tests/laboratorios/run.cjs` transpila os módulos com o `@babel/core` que o
Expo já traz e roda com `node:test`. Cobre formatadores, `filtrosParaApi` e
as regras RN04/RN05/404 do mock. Componentes e hook ficam de fora.

*Por quê:* testar componentes exigiria `react-test-renderer` (não instalado
no projeto) e a equipe do RF-CORE03 já tem um runner próprio com
`package.json` separado. Seguimos o formato dela (`tests/<modulo>/run.cjs`),
mas sem pedir instalação extra: `node tests/laboratorios/run.cjs` roda
direto depois do `npm install` normal.

### 7.4. O que mudou de comportamento

Nada visível, exceto:

| Antes | Depois | Motivo |
| :--- | :--- | :--- |
| "Todas as Quarta-feiras" | "Todas as Quartas-feiras" / "Todos os Sábados" | Plural errado apontado no guia de estudo; `descreverRecorrenciaSemanal` flexiona os dois termos |
| Resposta do filtro antigo podia sobrescrever a lista | Ignorada | Decisão 14 |
| ✕ e Cancelar do modal clicáveis durante o envio | Desabilitados enquanto `enviando` | Evita fechar o modal com a requisição em curso |

Continuam como estavam, de propósito: o botão Aprovar em conflito **não** é
desabilitado (decisão de projeto: quem decide é o servidor, 409), e o mock
segue sem validar o mínimo de 10 caracteres (a API valida).

### 7.5. Como foi verificado

* `node tests/laboratorios/run.cjs` → 11 testes passando.
* `npx expo export --platform web` → bundle gerado (303 módulos), sem erro
  de resolução de import.
* Transpilação de cada arquivo novo com o Babel (sintaxe JSX).

A verificação visual no navegador não foi feita nesta sessão; o roteiro da
seção 5 continua válido e deve ser repetido antes da apresentação.

---

## 8. Barra de status, visual enxuto e busca (16/11/2026)

### 8.1. Ponto de partida

O app foi aberto no celular pela primeira vez depois da componentização. O
usuário apontou três coisas: o conteúdo ficava embaixo da barra de status, a
tela mostrava informação demais ao mesmo tempo, e faltava uma busca.

Antes disso, o Expo Go recusou o projeto ("SDK 57 vs. 58"). A causa era o
Metro rodando numa **cópia antiga** do repositório em `~/Projetos/frontend-ifam`,
ainda no SDK 57. A cópia foi conferida (sem alteração pendente, branches
sincronizadas) e apagada; o projeto certo é `~/Projetos/ifam-web/frontend-ifam`.

### 8.2. Commits

| Commit | O que fez |
| :--- | :--- |
| `6a4c25d` fix | `paddingTop: Constants.statusBarHeight` no Android |
| `1ca5380` style | cabeçalho em uma linha, card sem badge redundante, alerta e chips curtos |
| `be14310` feat | `utils/buscaAlocacao.js`, `CampoBusca.js`, `busca` / `pedidosVisiveis` no hook, 4 testes |
| `a9dd002` docs | README do front-end |

### 8.3. Decisões

#### Decisão 16 — Barra de status com `expo-constants`, sem biblioteca nova

O `SafeAreaView` do React Native só reserva espaço no iOS. A solução completa
seria o `react-native-safe-area-context`, mas ele é dependência nova e o
`App.js` é compartilhado entre as equipes (precisaria de um
`SafeAreaProvider` na raiz). `Constants.statusBarHeight` já está instalado e
resolve o problema na nossa tela. **Quando a equipe de navegação colocar o
React Navigation**, que já traz o `safe-area-context`, este `paddingTop` sai.

#### Decisão 17 — Cada informação aparece uma vez

| Antes | Depois | Motivo |
| :--- | :--- | :--- |
| "◀ Menu de Laboratórios" + título + subtítulo + "N Pendentes" | "‹ Aprovações de Laboratório (N)" em uma linha | O subtítulo repetia o título |
| Badge "● Aguardando Análise" em todo card | Removido | Tudo nesta fila é pendente |
| Badge grande do tipo | Rótulo pequeno ao lado do bloco | Continua visível, ocupa menos |
| Linhas "👤 Docente:", "📚 Disciplina:" etc. | Nome do docente em destaque, depois "disciplina · turma · N alunos" | Os rótulos não acrescentavam nada |
| Softwares em chips | "Softwares: A, B, C" numa linha | Era a parte mais pesada do card |
| Alerta com 🔒/• e status no fim | "Disciplina · Docente (status)" | Mesmo conteúdo, mais curto |
| "✓ Aprovar Alocação" + aviso da RN04 embaixo | "Aprovar" / "Aprovar (em conflito)" | O alerta vermelho já explica o conflito |
| Chips "Todos os Pedidos / Alocação Pontual / Alocação Semestral" | "Todos / Pontual / Semestral" | O contexto já está no título |

Regra mantida: o botão Aprovar em conflito continua **clicável** (decisão 1).

#### Decisão 18 — Busca por texto no aparelho, chip na API

A API não tem parâmetro de busca, e a fila de pendentes é curta. Filtrar a
lista já carregada evita uma requisição por tecla e funciona igual no mock.
`filtrarPorBusca` normaliza com `NFKD` (tira acentos e também desmonta `ª`/`º`,
por isso "profa" acha "Profª") e exige **todas** as palavras digitadas, em
qualquer campo. Quando o back-end ganhar `?busca=`, a troca é: a busca vira
mais um item de `filtrosParaApi` e o `useMemo` do hook sai.

#### Decisão 19 — O contador conta a fila, não a busca

O cabeçalho usa `fila.pedidos.length`; a lista usa `fila.pedidosVisiveis`.
Se o contador caísse ao digitar, o Administrador acharia que a fila diminuiu.
O estado vazio também distingue os casos: "Nada encontrado" para a busca e
"Tudo em dia!" para a fila limpa.

### 8.4. Como foi verificado

* `node tests/laboratorios/run.cjs` → 15 testes passando (4 novos da busca).
* `npx expo export --platform web` → bundle gerado (302 módulos), sem erro.
* Back-end: `pytest` → 57 testes passando (sem mudança no back nesta etapa).
* O usuário confirmou no celular que o app abriu depois da correção da pasta.
  A conferência visual do novo layout e da barra de status ficou para ele.

