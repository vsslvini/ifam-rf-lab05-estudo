# Roteiro de perguntas da defesa — RF-LAB05

**Equipe 16** — Jhuliano e Vinicius · **Requisito:** RF-LAB05, Aprovação de
Alocações e Detecção de Conflitos · **Atualizado em:** 17/11/2026, código da
branch `feature/RF-LAB05` (commit `a9dd0029` no front, `0b16479` no back).

O professor avisou que **não vai perguntar linha por linha**. Ele pergunta
fluxo, arquitetura e "o que acontece quando aperto aqui". O formato que ele
usou com outros colegas foi:

> "Como essa tela funciona? Se eu apertar nesse botão, o que acontece?
> Consegue me mostrar no código onde isso ocorre?"

Cada pergunta abaixo tem três partes:

* **Fala:** o que responder em voz alta, em 20 a 40 segundos.
* **Caminho:** a sequência de arquivos por onde a ação passa.
* **Mostre:** o arquivo e a linha para abrir na hora.

Caminhos curtos usados no roteiro:

| Atalho | Pasta real |
| :--- | :--- |
| `lab/` | `frontend-ifam/src/modules/laboratorios/` |
| `comp/` | `frontend-ifam/src/modules/laboratorios/components/aprovacoes/` |
| `core/` | `frontend-ifam/src/core/` |
| `back/` | `backend-ifam/app/` |

> **Dica de ouro:** sempre que ele perguntar de um botão, comece pelo
> componente que desenha o botão, suba para a tela, depois o hook, o service
> e, se houver chamada à API, termine no router do back-end. É sempre a mesma
> escada. Decore a escada, não as linhas.

```
Componente (comp/)  →  Tela (lab/screens)  →  Hook (lab/hooks)  →  Service (lab/services)
     desenha              decide e avisa         guarda estado        fala com a API
                                                                          │
                                                       Axios (core/services/api.js)
                                                                          │
                                       FastAPI: router → schema → repositório → banco
```

---

## Parte 1 — "Como essa tela funciona?"

### 1.1 Visão geral da tela

**Fala:** "É a fila do Administrador para aprovar ou rejeitar pedidos de uso
de laboratório. Quando abre, ela busca os pedidos pendentes na API. Cada
pedido já vem do servidor dizendo se tem conflito de horário. Se tiver, o
card fica com borda vermelha e mostra com quem colide. O administrador pode
aprovar, que o servidor bloqueia se a sala estiver ocupada, ou rejeitar,
que exige justificativa de pelo menos 10 caracteres. Dá para filtrar por
tipo e buscar por texto."

**Mostre:** `lab/screens/aprovacoes_alocacoes_screen.js`, o `return` a partir
da linha 104. A tela inteira cabe numa olhada:

```
CabecalhoAprovacoes      título + contador + voltar          (linha 108)
BannerModoOffline        só aparece se estiver no mock        (linha 110)
CampoBusca               busca por texto                      (linha 112)
FiltrosTipoAlocacao      chips Todos / Pontual / Semestral    (linha 114)
renderConteudo()         carregando, erro ou a lista          (linha 83)
ModalRejeicaoAlocacao    abre quando há pedido para rejeitar  (linha 118)
```

### 1.2 Como a tela está dividida? Por que tantos arquivos?

**Fala:** "Separamos por responsabilidade. A **tela** só orquestra: liga as
peças e mostra os diálogos. O **hook** cuida dos dados: carregar, aprovar,
rejeitar, os estados de carregando e erro. Os **componentes** só desenham:
recebem dados por props e avisam cliques por callback, nenhum deles chama a
API. Os **utils** são funções puras de formatação. O **service** é o único
que fala com o servidor. Antes era um arquivo de 908 linhas; agora a tela
tem 136 e cada parte se explica sozinha."

**Mostre:** o comentário do topo da tela (linhas 1 a 24) e a pasta
`comp/index.js`, que exporta todos os componentes num lugar só.

**Se ele insistir em "por que hook?":** "Porque a regra do que acontece ao
aprovar fica num lugar só. Se amanhã outra tela precisar da mesma fila, ela
usa o mesmo hook. E dá para trocar o visual sem tocar na lógica."

### 1.3 Onde está o estado da tela?

**Fala:** "Quase todo estado está no hook: a lista de pedidos, o filtro, a
busca, carregando, atualizando, erro, se está em modo mock e qual card está
processando. A tela guarda só uma coisa: qual pedido está com o modal de
rejeição aberto. O modal guarda o texto que está sendo digitado."

**Mostre:**

* Hook, linhas 28 a 47: todos os `useState` e o `useRef`.
* Tela, linha 48: `pedidoParaRejeitar`.
* Modal, `comp/ModalRejeicaoAlocacao.js`, linhas 30 e 31.

### 1.4 O que acontece quando a tela abre?

**Caminho:**

1. A tela chama `useAprovacoesAlocacoes()`. Estado inicial: `carregando = true`.
2. O `useEffect` do hook dispara `carregar()` (hook, linha 86).
3. `carregar` chama `listarAlocacoesPendentes` (hook, linha 54 em diante).
4. O service faz `GET /api/v1/laboratorios/alocacoes/pendentes`
   (`lab/services/laboratoriosService.js`, linha 65).
5. No back, `listar_alocacoes_pendentes` busca os pendentes e, para cada um,
   calcula os conflitos (`back/routers/laboratorios/alocacoes.py`, linha 144).
6. A resposta volta, o hook faz `setPedidos(dados)` e `setCarregando(false)`.
7. A tela re-renderiza: sai o `EstadoCarregando`, entra a `ListaPedidosAlocacao`.

**Fala resumida:** "O hook carrega no `useEffect`, enquanto isso aparece o
spinner. Quando a API responde, o estado muda e o React desenha a lista."

---

## Parte 2 — "Se eu apertar nesse botão, o que acontece?"

### 2.1 Botão **Aprovar** num pedido sem conflito

**Caminho:**

1. `comp/CardPedidoAlocacao.js`, linha 65: `onPress={() => onAprovar(pedido)}`.
   O card não sabe aprovar, só avisa quem o chamou.
2. A lista repassa o `onAprovar` que recebeu da tela.
3. Tela, linha 51: `handleAprovar` abre a caixa de confirmação com
   `confirmar(...)` de `lab/utils/dialogos.js`, linha 27.
4. Se o usuário confirmar, a tela chama `fila.aprovar(pedido)`.
5. Hook, linha 97: marca `idEmProcessamento` para o botão virar spinner e
   chama `aprovarAlocacao`.
6. Service, linha 92: `PATCH /alocacoes/{id}/status` com
   `{ status_alocacao: 'Aprovada' }`.
7. Back, `decidir_alocacao`, linha 201: confere se existe (404), se ainda é
   pendente (409), se há conflito bloqueante (409), grava e publica o evento
   de notificação.
8. Volta ao hook: `removerDaFila` tira o card da lista.
9. Volta à tela: `avisar('✅ Aprovado', mensagem)` mostra a mensagem da API.

**Fala resumida:** "O card só avisa. A tela pede confirmação. O hook chama o
service e, se der certo, tira o card da lista. A tela mostra a mensagem que
o servidor mandou."

### 2.2 Botão **Aprovar** num pedido **em conflito** (RN04)

**Fala:** "O botão fica cinza e escrito 'Aprovar (em conflito)', mas a
gente deixou clicável de propósito. Quem decide é o servidor. Se eu clicar,
o back-end recalcula o conflito na hora e responde **409**. A tela mostra
'Conflito de horário' com o motivo, e o hook recarrega a fila, porque se
deu 409 a situação no servidor mudou."

**Caminho:** igual ao 2.1 até o passo 7. Depois:

* Back, linhas 229 a 241: filtra os conflitos com `ocupa_sala` e levanta
  `HTTPException(409)` com o nome da disciplina que ocupa a sala.
* `core/services/interceptors.js`, linhas 67 a 77: o interceptor do Axios
  coloca `erro.status = 409` e `erro.mensagem = detail` em todo erro.
* Hook, linha 105: `if (erro.status === 409)` recarrega a fila em silêncio
  e relança o erro.
* Tela, `catch` do `handleAprovar`: escolhe o título "⚠️ Conflito de
  horário" porque o status é 409.

**Por que deixar clicável?** "Porque o front pode estar desatualizado. Outro
administrador pode ter rejeitado o concorrente um segundo atrás. Se a gente
bloqueasse no front, estaria decidindo com dado velho. A regra mora no
servidor; o front só avisa."

**Onde o card decide a cor cinza:** `comp/CardPedidoAlocacao.js`, linha 24,
`aprovacaoBloqueada = listarBloqueios(pedido).length > 0`.

### 2.3 Botão **Rejeitar**

**Fala:** "Rejeitar não chama a API direto. Ele só abre o modal, porque a
rejeição exige justificativa."

**Caminho:**

1. Card, linha 56: `onPress={() => onRejeitar(pedido)}`.
2. Tela, linha 99: `onRejeitar={setPedidoParaRejeitar}`. O clique só guarda
   qual pedido está sendo rejeitado.
3. Modal, linha 62: `visible={pedido != null}`. Como agora há pedido, abre.
4. Modal, linha 34: o `useEffect` limpa o texto, para não sobrar
   justificativa de outro pedido.

### 2.4 Botão **Confirmar Rejeição** no modal (RN05)

**Caminho:**

1. Modal, linha 101: `onPress={confirmar}`.
2. Modal, linha 41: se o texto tiver menos de 10 caracteres, mostra aviso e
   **não chama a API**.
3. Se passou, `setEnviando(true)`: o botão vira spinner, ✕ e Cancelar ficam
   desativados.
4. Modal, linha 52: `await onConfirmar(texto)`, que é o
   `handleConfirmarRejeicao` da tela (linha 72).
5. Tela chama `fila.rejeitar(pedido, justificativa)`, hook linha 118.
6. Service, linha 110: `PATCH /status` com `Rejeitada` e a justificativa.
7. Back, `back/schemas/laboratorios/alocacoes.py`, linhas 125 a 150: o
   Pydantic valida a justificativa **antes** de chegar ao router. Vazia ou
   curta dá **422**.
8. Gravou: hook remove o card, tela fecha o modal e mostra "🚫 Rejeitado".

**Pergunta que pode vir junto:** "Se o front já valida, por que o back
valida de novo?" **Fala:** "Porque o front pode ser contornado. Alguém pode
chamar a API pelo Swagger ou por outro app. A validação do front é só para
dar retorno rápido. A garantia é o 422 do servidor."

### 2.5 **Cancelar** ou **✕** do modal

**Fala:** "Chama `onCancelar`, que na tela faz `setPedidoParaRejeitar(null)`.
Como o modal só fica visível quando há pedido, ele fecha. Durante o envio
esses botões ficam desativados, para não fechar no meio da requisição."

**Mostre:** modal linhas 69 e 97; tela linha 120.

### 2.6 Chips **Todos / Pontual / Semestral**

**Caminho:**

1. `comp/FiltrosTipoAlocacao.js`, linha 23: `onChange(filtro.valor)`.
2. Tela, linha 114: `onChange={fila.setFiltroTipo}`.
3. Hook: `filtroTipo` mudou, então o `useCallback` do `carregar` cria uma
   função nova, e o `useEffect` da linha 86 roda de novo.
4. `filtrosParaApi` (`lab/utils/filtrosAlocacao.js`, linha 22) transforma
   "Pontual" em `{ tipo_alocacao: 'Pontual' }`. "Todos" vira `{}`.
5. `GET /pendentes?tipo_alocacao=Pontual`. **Quem filtra é o servidor.**

**Pergunta de aprofundamento:** "E se eu trocar de chip muito rápido?"
**Fala:** "A segunda resposta poderia chegar antes da primeira e a lista
mostraria o filtro errado. O hook numera cada requisição com um `useRef` e
ignora respostas que não são a mais recente." **Mostre:** hook linha 47 e o
`aindaEhAtual()` dentro do `carregar`.

### 2.7 Campo de **busca**

**Fala:** "A busca é diferente do chip. O chip vai para a API. A busca
filtra no próprio aparelho, sobre a lista que já foi carregada, porque a API
ainda não tem esse parâmetro e a fila de pendentes é pequena. Ela ignora
maiúsculas e acentos, e procura em docente, disciplina, laboratório, bloco,
turma e softwares. Se eu digitar duas palavras, as duas precisam aparecer."

**Caminho:**

1. `comp/CampoBusca.js`, linha 20: `onChangeText={onChange}`.
2. Tela, linha 112: `onChange={fila.setBusca}`.
3. Hook, linha 35: `pedidosVisiveis = useMemo(() => filtrarPorBusca(pedidos, busca))`.
4. `lab/utils/buscaAlocacao.js`, linha 38: `filtrarPorBusca`.
5. A lista recebe `pedidosVisiveis` (tela, linha 92).

**Por que o contador não muda quando busco?** "O contador mostra quantos
pendentes existem de verdade (`fila.pedidos.length`). A busca só muda o que
está visível. Senão o administrador acharia que a fila diminuiu."

**Por que `useMemo`?** "Para não refiltrar a lista a cada re-render que não
mudou nem a lista nem o texto."

**O ✕ da busca:** linha 29 do `CampoBusca`, chama `onChange('')`.

### 2.8 **Puxar para baixo** (pull-to-refresh)

**Fala:** "O `FlatList` tem um `RefreshControl`. Ao puxar, chama
`fila.atualizar`, que é o `carregar` em modo silencioso: em vez do spinner de
tela cheia, aparece só a bolinha de atualização em cima."

**Mostre:** `comp/ListaPedidosAlocacao.js`, linhas 40 a 45.

### 2.9 **Tentar novamente** na tela de erro

**Fala:** "Se a API respondeu com erro que não é de rede, o hook guarda a
mensagem em `erroCarregamento`. A tela mostra o `EstadoErro`, e o botão chama
`fila.recarregar`, que roda o `carregar` de novo."

**Mostre:** `comp/EstadosDaLista.js`, linha 27; tela, `renderConteudo`.

### 2.10 **Voltar** (‹)

**Fala:** "Chama `onBackToMenu`, que vem do `App.js`. Hoje não existe
navegação global, porque ela é de outra equipe, então é uma função vazia. Quando
o React Navigation entrar, vira um `navigation.goBack()`."

**Mostre:** `comp/CabecalhoAprovacoes.js`, linha 17; `App.js`, onde a tela é
renderizada com `onBackToMenu={() => {}}`.

---

## Parte 3 — Fluxos de exceção

### 3.1 "E se o servidor estiver desligado?"

**Fala:** "A tela não quebra. O service tenta a API; se der erro de rede,
ele passa a usar um mock em memória com o mesmo contrato e as mesmas regras,
RN04 e RN05 inclusas. Aparece uma faixa amarela avisando que são dados de
demonstração."

**Caminho:**

1. `core/services/interceptors.js`, linha 72: sem `response` significa erro
   de rede, então marca `codigoInterno = ERRO_DE_REDE`.
2. `lab/services/laboratoriosService.js`, linha 41, `comFallback`: se for erro
   de rede, liga `usandoMock` e chama o mock. Erro de negócio (404, 409, 422)
   é relançado normalmente.
3. Hook chama `isModoMock()` e guarda em `modoMock`.
4. Tela, linha 110: `{fila.modoMock && <BannerModoOffline />}`.

**Mostre:** o `comFallback` e `lab/services/aprovacoesAlocacoesMock.js`,
função `decidir` na linha 151.

### 3.2 "E se dois administradores aprovarem o mesmo pedido ao mesmo tempo?"

**Fala:** "O segundo recebe 409 'Esta solicitação já foi analisada', porque
o back confere se o status ainda é Pendente antes de gravar. O hook recarrega
a fila e o card some."

**Mostre:** back, `alocacoes.py`, linhas 220 a 227.

### 3.3 "E se alguém chamar a API sem ser administrador?"

**Fala:** "Todas as rotas recebem a dependência `UsuarioAdmin`. Ela exige
perfil Administrador e responde 403. O login real ainda é de outra equipe;
hoje o usuário atual é simulado como admin, mas a checagem de perfil já é
real."

**Mostre:** `back/core/deps.py`, linhas 93 a 107 e 124.

### 3.4 "Como o servidor sabe que há conflito?" (RN04)

**Fala:** "Dois pedidos conflitam se são do mesmo laboratório, os horários
se sobrepõem e caem na mesma ocorrência do calendário. Pontual com pontual
compara a data. Se um deles é semestral, compara o dia da semana, porque o
semestral se repete toda semana. Só bloqueia a aprovação quem já ocupa a
sala, ou seja, Aprovada ou Em uso. Outro pendente só aparece como aviso."

**Caminho e onde mostrar:**

* Consulta no banco: `back/repositories/alocacoes_laboratorios.py`, linha 319,
  `listar_conflitos`. Filtra mesmo laboratório e horário sobreposto no SQL.
* Regra do calendário: `back/services/conflitos_alocacao.py`, linhas 36
  (`horarios_se_sobrepoem`), 45 (`mesma_ocorrencia_no_calendario`) e 65
  (`alocacoes_conflitam`).
* Quem bloqueia: `back/models/laboratorios.py`, linha 262, `ocupa_sala`.

**Frase para decorar:** "Dois intervalos se sobrepõem quando um começa antes
do outro terminar, nos dois sentidos."

### 3.5 "O que acontece depois que aprova ou rejeita?"

**Fala:** "O back grava a decisão e publica um evento de notificação para o
docente, `Alocacao_Aprovada` ou `Alocacao_Rejeitada`. A fila de e-mails com
RabbitMQ é de outra equipe, então hoje o evento é registrado num mock com o
mesmo formato do documento de mensageria."

**Mostre:** back, `alocacoes.py`, final do `decidir_alocacao`;
`back/services/notificacoes.py`, linhas 43 e 66.

---

## Parte 4 — Arquitetura

### 4.1 Como o front está organizado?

**Fala:** "Feature-first, como o mapa do front pede. Cada módulo tem a sua
pasta em `src/modules`, com `screens`, `services`, `components`, `hooks` e
`utils`. O que é compartilhado entre módulos, como o cliente Axios e as
cores, fica em `src/core`."

**Por que nada novo em `core/`?** "As pastas de componentes e utilitários
compartilhados são da Equipe do Core. Para não invadir o trabalho deles,
deixamos tudo dentro do nosso módulo e anotamos o que pode migrar depois."

### 4.2 Como o back está organizado?

**Fala:** "Em camadas. O **router** recebe o HTTP e decide o status. O
**schema** Pydantic valida a entrada e define o JSON de saída. O
**repositório** acessa o banco. O **service** de conflitos tem a regra pura
da RN04. O `deps.py` injeta repositório e usuário com o `Depends` do FastAPI."

```
HTTP → router (alocacoes.py) → schema valida (RN05, 422)
                      │
                      ├── repositório (alocacoes_laboratorios.py) → PostgreSQL
                      ├── conflitos_alocacao.py (RN04, regra pura)
                      └── notificacoes.py (evento para o docente)
```

**Por que repositório com duas implementações?** "Existe um em memória e um
SQLAlchemy com PostgreSQL. A variável `USE_IN_MEMORY_REPO` escolhe. O router
não sabe qual está usando, porque os dois seguem o mesmo `Protocol`."
**Mostre:** `back/core/deps.py`, linhas 110 a 120.

### 4.3 Como o front fala com o back?

**Fala:** "Pelo Axios, configurado uma vez em `core/services/api.js`. A URL
vem do `app.json`. No celular, `localhost` não funciona, então o `api.js`
troca pelo IP da máquina que está rodando o Metro. Os interceptors colocam o
token, quando houver, e padronizam os erros em `status` e `mensagem`."

**Mostre:** `core/services/api.js` (função `resolverBaseUrl`) e
`core/services/interceptors.js`, linha 58.

### 4.4 Componente "burro" vs. componente "inteligente"

**Fala:** "Os componentes de `comp/` são burros: só recebem props e chamam
callbacks. Nenhum importa o service. A tela e o hook são os inteligentes.
Isso facilita testar e trocar o visual."

**Prova rápida:** abrir `comp/CardPedidoAlocacao.js` e mostrar que os
imports não têm nada de `services`.

### 4.5 Por que `FlatList` e não `ScrollView`?

**Fala:** "O `FlatList` só desenha os itens visíveis e já traz
pull-to-refresh e componente de lista vazia prontos."

### 4.6 Por que `SafeAreaView` mais um `paddingTop`?

**Fala:** "O `SafeAreaView` do React Native só funciona no iOS. No Android o
conteúdo ficava embaixo da barra de status. Usamos a altura da barra que o
`expo-constants` informa como espaçamento, sem instalar biblioteca nova."

**Mostre:** tela, linha 134.

### 4.7 Como vocês testaram?

**Fala:** "No back, 57 testes com pytest, no arquivo do RF-LAB05, cobrindo as rotas, RN04, RN05, 404,
403 e o banco. No front, 15 testes com o `node:test` sobre as partes puras:
formatadores, filtro da API, busca e as regras do mock. Não testamos os
componentes visuais, porque precisaria de biblioteca extra."

```
cd backend-ifam && pytest
cd frontend-ifam && node tests/laboratorios/run.cjs
```

---

## Parte 5 — Perguntas de conceito que costumam aparecer

| Pergunta | Resposta curta |
| :--- | :--- |
| O que é um hook? | Função que começa com `use` e pode usar estado e efeitos do React. O nosso agrupa todo o estado da fila. |
| `useState` vs `useRef`? | Mudar `useState` re-renderiza a tela. Mudar `useRef` não re-renderiza; usamos para contar requisições. |
| Para que serve o `useEffect`? | Rodar algo depois do render. Aqui, carregar a fila quando a tela abre e quando o filtro muda. |
| Para que serve o `useCallback`? | Manter a mesma função entre renders até uma dependência mudar. O `carregar` só muda quando muda o filtro, e isso dispara o `useEffect`. |
| Para que serve o `useMemo`? | Guardar o resultado de um cálculo até as dependências mudarem. Usamos na busca. |
| O que são props? | Os parâmetros de um componente, passados de cima para baixo. |
| O que é um callback como `onAprovar`? | Uma função que o pai passa ao filho para o filho avisar que algo aconteceu. |
| O que é um barrel (`index.js`)? | Arquivo que reexporta os componentes da pasta, para importar tudo de um lugar só. |
| 404, 409 e 422? | 404 não existe. 409 conflito com o estado atual, como sala ocupada ou já analisada. 422 dados inválidos, como justificativa curta. |
| Por que PATCH e não PUT? | PATCH altera parte do recurso, só o status. PUT substituiria o recurso inteiro. |
| O que é o Pydantic? | Biblioteca que valida os dados de entrada e monta o JSON de saída no FastAPI. |
| O que é o `Depends`? | Injeção de dependência do FastAPI: entrega repositório e usuário prontos para a rota. |

---

## Parte 6 — Roteiro de demonstração (5 minutos)

1. Subir o back: `cd backend-ifam && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`. O `--host 0.0.0.0` deixa o celular alcançar o servidor.
2. Subir o front: `cd frontend-ifam && npx expo start -c`, abrir no celular.
3. Mostrar a fila e apontar o card vermelho: "este colide com uma aula já aprovada".
4. Clicar **Aprovar** no card vermelho: aparece o 409 com o motivo.
5. Clicar **Rejeitar**, digitar "curto": aparece o aviso dos 10 caracteres.
6. Digitar uma justificativa completa e confirmar: o card some.
7. Aprovar um card sem conflito: o card some e o contador diminui.
8. Trocar o chip para **Semestral**: a lista muda, o pedido vai para a API.
9. Digitar o nome de um professor na busca: a lista filtra na hora.
10. Opcional: derrubar o back e puxar a lista. Aparece a faixa amarela e a
    tela continua funcionando com o mock.

**Se travar no meio:** "a tela tem fallback offline justamente para a
apresentação não depender da rede", e seguir pelo mock.

---

## Parte 7 — Pontos fracos que vocês devem admitir com tranquilidade

* **Login ainda é simulado.** O perfil é verificado de verdade, mas o token
  vem de outra equipe.
* **Navegação ainda não existe.** O botão voltar é uma função vazia até o
  React Navigation entrar.
* **Notificação é mock.** O evento tem o formato certo, mas a fila RabbitMQ
  é de outra equipe.
* **Busca é local.** Funciona porque a fila é pequena. Com muitos pedidos,
  o ideal é um parâmetro `?busca=` na API.
* **Sem teste de componente visual.** Testamos a lógica pura; componentes
  precisariam do React Native Testing Library.

Frase para fechar qualquer um desses: "Deixamos o ponto de integração pronto
e documentado, então quando a outra equipe entregar é trocar uma linha."
