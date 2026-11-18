# RF-LAB05 — Registro de Alterações e Decisões de Projeto (Back-end)

**Equipe 16** — Jhuliano e Vinicius
**Requisito:** RF-LAB05 — Aprovação e Detecção de Conflitos (perfil Administrador)
**Branch:** `feature/RF-LAB05` (a partir de `develop`, GitFlow)
**Regras de negócio envolvidas:** RN02 (RBAC), RN04 (conflito de grade), RN05 (justificativa)

Documento exigido pela diretriz do projeto: *"todas as alterações devem ser
registradas em um arquivo em /docs, para fins de estudos posteriores"* e
*"devem ser documentadas todas as decisões de projeto, bem como padrões
escolhidos"*.

---

## 1. Ponto de partida

A branch `develop` do `backend-ifam` continha apenas a **árvore de pastas** do
`seq_09_plano_implementacao.md`: todos os arquivos `.py`, o `requirements.txt`,
o `.env.example` e o `Dockerfile` estavam **vazios (0 byte)**.

Consequência: para entregar o RF-LAB05 funcionando foi necessário preencher
também a infraestrutura mínima (config, database, deps, main). Isso foi feito
seguindo **exatamente** os nomes e a organização do `seq_06_mapa_backend.md`,
para que a convergência com as demais duplas seja um merge trivial.

---

## 2. Alterações por arquivo

| Arquivo | Estado anterior | O que foi feito |
| :--- | :--- | :--- |
| `requirements.txt` | vazio | FastAPI, Uvicorn, Pydantic v2, pydantic-settings, SQLAlchemy, pytest, httpx. Celery/FastAPI-Mail comentados (ver decisão 6) |
| `.env.example` | vazio | Variáveis de `config.py`, incluindo `USE_IN_MEMORY_REPO` |
| `.gitignore` | vazio | Python, `.venv/`, `.env`, caches de teste |
| `app/core/config.py` | vazio | `Settings` (pydantic-settings) + `get_settings()` cacheado |
| `app/database.py` | vazio | `Base` declarativa e engine **preguiçosa** — a API sobe sem PostgreSQL |
| `app/core/deps.py` | vazio | `get_db`, `get_current_user`, `get_admin_user`, `get_alocacao_repository` |
| `app/models/laboratorios.py` | vazio | Enums do Módulo 2 + `Laboratorio`, `GradeHorario`, `AlocacaoLaboratorio` |
| `app/schemas/laboratorios.py` | vazio | Contratos das seções 3.6 e 3.7 do `seq_06` + validação da RN05 |
| `app/services/conflitos_alocacao.py` | **novo** | RN04 como funções puras |
| `app/services/notificacoes.py` | **novo** | Monta e publica o evento de decisão (mock da fila) |
| `app/repositories/alocacoes_laboratorios.py` | **novo** | Protocolo + implementação em memória com seed |
| `app/repositories/catalogo_labs_mock.py` | **novo** | Mock de laboratórios, grades e docentes (outras equipes) |
| `app/routers/laboratorios/alocacoes.py` | **novo** | Os três endpoints do requisito |
| `app/main.py` | vazio | CORS, health check (`/`, `/ping`) e `include_router` |
| `tests/` | inexistente | `conftest.py` + 32 casos de teste |
| `README.md` | 1 linha | Execução, endpoints, regras e tabela de pontos de troca |

**Pastas criadas** além do `seq_09`: `app/repositories/` e `app/services/`
(justificativa na decisão 2).

---

## 3. Decisões de projeto

### Decisão 1 — Arquitetura em camadas: router → repositório → modelo

O router só conhece o **protocolo** `AlocacaoRepository`
(`typing.Protocol`), nunca o SQLAlchemy nem o dicionário em memória. Trocar a
persistência é trocar uma linha em `deps.py::get_alocacao_repository`.

*Por quê:* a camada de banco pertence à Equipe do Core e não existia. Sem essa
fronteira, o RF-LAB05 ficaria bloqueado esperando outra dupla.

*Padrão seguido:* o mesmo adotado pela dupla do RF-EQ01 em
`app/repositories/tipos_recursos.py` — repositório único por agregado,
`InMemory...` + seed e um `TODO` apontando o ponto de troca. Manter o mesmo
padrão entre as duplas foi uma escolha deliberada para facilitar o merge.

### Decisão 2 — A RN04 vive em `app/services/`, fora do router e do repositório

`conflitos_alocacao.py` contém apenas funções puras
(`horarios_se_sobrepoem`, `mesma_ocorrencia_no_calendario`,
`alocacoes_conflitam`), sem banco e sem HTTP.

*Por quê:* é a regra mais importante do requisito e a que mais tende a ser
reaproveitada — o RF-LAB04 (solicitação) e o RF-LAB03 (grade) precisam da mesma
resposta. Isolada, ela é testável direto (7 dos 32 testes) e não depende do
repositório escolhido.

### Decisão 3 — Como a sobreposição é calculada

A documentação define a regra (*"mesmo laboratório no mesmo dia e intervalo de
tempo"*), não o algoritmo. Foi implementado assim:

1. **Comparação por intervalo, não por slot.** Dois pedidos conflitam quando
   `[hora_inicio, hora_fim)` se sobrepõem — não apenas quando o
   `id_grade_horario` é igual. 07:30‑09:10 e 08:30‑10:10 são slots diferentes e
   ocupam a mesma sala. Intervalo **meio-aberto**: uma aula que termina 09:10
   não conflita com outra que começa 09:10.
2. **`Semestral` é comparada pelo dia da semana.** No DDL, `data_reserva` de
   uma alocação semestral guarda o *início do semestre* e a aula se repete
   ("Todas as Quartas (2026/2)" no protótipo). Logo: `Pontual` × `Pontual` →
   mesma `data_reserva`; qualquer `Semestral` → mesmo `dia_semana`.
3. **Só `Aprovada` / `Em_Uso` bloqueiam a aprovação** (`STATUS_QUE_OCUPAM_SALA`
   em `app/models/laboratorios.py`). Dois pedidos `Pendente` aparecem
   sinalizados um para o outro, mas nenhum é bloqueado — quem escolhe qual
   atender é o Administrador. `Rejeitada`, `Concluida` e `Cancelada` liberam a
   sala e saem da agenda (`STATUS_NA_AGENDA`).

### Decisão 4 — RN04 no router, RN05 no schema

* A **RN05** (justificativa obrigatória) é uma regra sobre o *formato do
  pedido*: vive no `model_validator` de `AlocacaoStatusUpdate` e responde `422`
  antes de chegar ao router. Também exige no mínimo 10 caracteres — uma
  justificativa em branco ou com "não" não cumpre o objetivo da regra, que é
  informar o solicitante. Numa aprovação, `justificativa_rejeicao` é
  descartada, para não gravar recusa em pedido aprovado.
* A **RN04** depende do estado do banco (quem mais está na agenda): vive no
  router e responde `409 Conflict`, com a mensagem indicando a disciplina e a
  turma concorrentes.

### Decisão 5 — Extensão do contrato: `conflitos` e `GET /{id}/conflitos`

O `seq_06` expõe apenas `conflito_detectado: bool`. Um booleano permite
*mostrar* o alerta vermelho, mas não *resolver* o conflito. Foi acrescentada a
lista `conflitos` (quem ocupa a sala, com `bloqueia_aprovacao`) e o endpoint de
detalhe. Nenhum campo do contrato original foi removido ou renomeado, então
quem já consome o `seq_06` continua funcionando.

Também foram acrescentados à resposta `qtd_alunos_prevista`, `turno`,
`dia_semana` e `descricao_tempo`: são dados exibidos no card do protótipo
`aprovacoes_alocacoes_screen.js` que o contrato original não trazia.

### Decisão 6 — Notificação registrada em log, não enfileirada

O `seq_07` manda publicar a decisão na fila `fila_emails_transacionais`
(RabbitMQ + Celery) e gravar uma notificação in-app (RF-CORE03, Equipe 2). Nem
o broker nem a tabela `notificacoes` existem.

Em vez de subir RabbitMQ só para esta entrega, `app/services/notificacoes.py`
**monta o payload definitivo** (com `tipo_evento` = `Alocacao_Aprovada` /
`Alocacao_Rejeitada`, valores do ENUM `tipo_notificacao` do DDL) e o registra
no log, guardando o histórico em memória para inspeção e teste. A integração é
trocar o corpo de uma função por `...delay(**evento)`. Celery e FastAPI-Mail
ficaram **comentados** no `requirements.txt` para não instalar dependência que
ainda não é usada.

### Decisão 7 — Sem `relationship()` para `usuarios`

`app/models/usuarios.py` está vazio (RF-CORE05, Equipe 3). A FK usa a forma
textual `ForeignKey("usuarios.id_usuario")`, que o SQLAlchemy resolve só na
criação do schema — assim os modelos do Módulo 2 carregam hoje, sem a tabela
`usuarios`. O `DocenteMock` repete os nomes de coluna do DDL (`nome_completo`,
`identificacao_institucional`, `email`) para que a troca pelo modelo `Usuario`
não toque em schema nem em router.

### Decisão 8 — Dados de seed iguais ao protótipo

Os três pedidos pendentes são os mesmos exibidos em
`screen/aprovacoes_alocacoes_screen.js`, e o primeiro reproduz o exemplo
publicado no `seq_06` (seções 3.5/3.6) — inclusive os UUIDs. Foi acrescentada
uma quarta alocação já **`Aprovada`** no Lab 03, no mesmo dia e horário do
pedido do Blender: é ela que torna o conflito da RN04 **demonstrável** na
apresentação, em vez de um campo `conflito: true` escrito à mão como no
protótipo.

### Decisão 9 — `422` quando o cadastro de apoio está incompleto

Se o laboratório, a grade ou o docente de um pedido não for encontrado, a API
responde `422` com mensagem explícita, em vez de devolver o card com campos
vazios. Com o banco real a integridade referencial do DDL impede o caso; com os
mocks, falhar alto evita esconder erro de dado.

### Decisão 10 — `app/schemas/laboratorios` virou pacote na integração

Durante a entrega, a `develop` recebeu o PR #4 (RF-LAB08, Equipe 19), que criou
**`app/schemas/laboratorios/dashboard.py`** — transformando em **pasta** o
caminho que o `seq_06` descrevia como **arquivo** (`laboratorios.py`).

Os dois formatos não coexistem: um módulo `laboratorios.py` sombreia o pacote
de mesmo nome (módulo regular tem precedência sobre *namespace package*), e o
import `app.schemas.laboratorios.dashboard` passa a falhar com
`ModuleNotFoundError` — ou seja, o merge ingênuo derrubaria o router da outra
equipe.

Resolução no merge: os schemas do RF-LAB05 foram movidos para
**`app/schemas/laboratorios/alocacoes.py`** e foi acrescentado o `__init__.py`
que faltava no pacote. **Nenhum arquivo da Equipe 19 foi alterado.** Um arquivo
por requisito dentro do pacote é também o padrão que eles já usaram em
`app/routers/laboratorios/`, então a convenção fica consistente nas duas
camadas.

O `requirements.txt` foi resolvido como **união** das duas listas (as deps de
JWT, `psycopg2-binary`, `python-dotenv` e `python-multipart` da Equipe 19 +
as versões mínimas e as deps de teste desta entrega).

O router `dashboard.py` deles **não** foi incluído no `app/main.py`: o endpoint
`/kpis` ainda tem corpo `pass` e a rota falharia na validação do
`response_model`. Ficou um `TODO` nomeado no `main.py` indicando a única linha
necessária quando eles implementarem.

---

## 4. Padrões adotados

| Tema | Padrão |
| :--- | :--- |
| Idioma | Código, rotas e mensagens em português; docstrings sem acento (compatibilidade de terminal), textos de usuário com acento |
| Commits | Conventional Commits (`feat`, `test`, `chore`, `docs`) com escopo de domínio, um commit por etapa da entrega |
| Branches | GitFlow — `feature/RF-LAB05` a partir de `develop`, integração por Pull Request |
| HTTP | `HTTPException` com código semântico: `403` (RBAC), `404`, `409` (conflito/estado), `422` (validação) |
| Validação | Pydantic v2 no servidor, espelhando os limites do DDL |
| Testes | `pytest` + `TestClient`, repositório reposto por fixture; nome do teste descreve a regra |
| Mocks | Sempre atrás de função ou protocolo, com bloco `FRONTEIRA DE INTEGRACAO` no cabeçalho e `TODO(requisito, equipe)` no ponto de troca |

---

## 5. Como validar a entrega

```bash
source .venv/bin/activate
pytest -v                       # 32 testes (57 execuções desde a etapa 2)
docker compose up -d postgres   # desde a etapa 2; ou USE_IN_MEMORY_REPO=true
uvicorn app.main:app --reload   # e abrir /docs
```

Com o banco ligado, as decisões do roteiro ficam gravadas. Para repetir a
demonstração: `python -m app.seed --recriar`.

Roteiro de demonstração no Swagger:

1. `GET /api/v1/laboratorios/alocacoes/pendentes` — três pedidos; o do Blender
   vem com `conflito_detectado: true` e o concorrente em `conflitos`.
2. `PATCH .../{id do Blender}/status` com `"Aprovada"` → **409 (RN04)**.
3. `PATCH .../{id do Blender}/status` com `"Rejeitada"` e sem justificativa →
   **422 (RN05)**.
4. O mesmo com justificativa → **200**, sai da fila e o evento
   `Alocacao_Rejeitada` aparece no log do Uvicorn.
5. `PATCH .../{id de Redes}/status` com `"Aprovada"` → **200** e evento
   `Alocacao_Aprovada`.

---

> Autoria dos commits, como localizar a entrega no repositório e o índice geral
> das duas camadas: ver `grupo16_RF-LAB05_registro.md` nesta mesma pasta.

---

## 6. Etapa 2 — Persistência em PostgreSQL (07/10/2026)

**Branch:** `feature/RF-LAB05`, a branch de trabalho da dupla. O commit
entra no mesmo PR #5. Commit local, **sem push**.

**Autoria:** a partir deste commit, `user.email` do repositório (config local,
não global) é `2024006157@ifam.edu.br`, o e-mail registrado na conta do
Gitea. Assim o commit fica vinculado ao perfil (ver seção 6.2 do
`grupo16_RF-LAB05_registro.md`).

### Alterações

| Arquivo | O que foi feito |
| :--- | :--- |
| `docker-compose.yml` | **novo** — serviços `postgres` (16-alpine) e `api` |
| `Dockerfile` | estava vazio; agora `python:3.12-slim` + `uvicorn` |
| `.dockerignore` | **novo** — tira `.venv`, `.env`, testes e caches da imagem |
| `requirements.txt` | `psycopg[binary]>=3.2`, o driver da `DATABASE_URL` |
| `.env.example` | `USE_IN_MEMORY_REPO=false` e instruções do Docker |
| `app/models/laboratorios.py` | ENUMs gravam o **valor** do DDL (`Em_Uso`), não o nome (`EM_USO`) |
| `app/models/usuarios.py` | estava vazio; agora só a tabela `usuarios` do DDL |
| `app/repositories/alocacoes_laboratorios.py` | `SqlAlchemyAlocacaoRepository` |
| `app/core/deps.py` | `get_db()` abre sessão real; repositório escolhido por `USE_IN_MEMORY_REPO` |
| `app/database.py` | `expire_on_commit=False` |
| `app/seed.py` | **novo** — `create_all` + dados iniciais; `python -m app.seed --recriar` |
| `app/main.py` | `lifespan` chama o seed quando o banco está ligado |
| `tests/conftest.py` | testes HTTP rodam nas duas implementações (32 → 57 execuções) |

### Decisão 11 — Alinhar o Docker com a branch da Equipe do Core

A branch `feature/rf-02-v2` (Core) já tem `Dockerfile` e `docker-compose.yml`.
O nosso `Dockerfile` é **idêntico** ao deles (o merge não conflita), e o
compose usa os mesmos nomes de serviço (`postgres`, `api`), credenciais
(`ifam`/`ifam`), banco (`ifam`) e driver (`postgresql+psycopg://`). Na
integração, o compose deles é um superconjunto do nosso (acrescenta
`rabbitmq` e `worker`), então basta ficar com a versão deles.

### Decisão 12 — Bug latente dos ENUMs

Sem `values_callable`, o SQLAlchemy cria o tipo `status_alocacao_lab` com os
**nomes** dos membros (`'PENDENTE'`, `'EM_USO'`), diferente do DDL do `seq_05`
(`'Pendente'`, `'Em_Uso'`). Em memória isso nunca aparecia; no banco, qualquer
SQL escrito à mão por outra equipe (`WHERE status_alocacao = 'Pendente'`)
falharia. Corrigido com o helper `_enum_ddl`.

### Decisão 13 — `usuarios` declarado por nós, mas fiel ao DDL

A FK `alocacoes_laboratorios.id_usuario → usuarios` exige a tabela. O modelo
`Usuario` é do RF-CORE05; declaramos só a tabela, coluna a coluna como no DDL
e com os mesmos ENUMs, sem relacionamentos. Na integração, o arquivo da Equipe
do Core substitui o nosso inteiro sem mudança no banco. Os docentes do seed
recebem um `senha_hash` inválido de propósito: existem para a FK, não fazem
login.

### Decisão 14 — RN04 continua com uma única implementação

O repositório SQL pré-filtra no banco (mesmo laboratório, status na agenda,
intervalo sobreposto) e a decisão final continua em `alocacoes_conflitam`
(`app/services/`). Assim as duas implementações não podem divergir — e a
suíte de testes roda inteira contra as duas para garantir isso.

### Decisão 15 — `create_all` + seed na subida, não Alembic

Migrações são da Equipe do Core. `create_all` basta enquanto o schema é o do
DDL, e o seed idempotente (só grava se o banco estiver vazio) faz
`docker compose up` resultar numa API pronta para demonstração.
`python -m app.seed --recriar` volta ao estado inicial depois de uma
apresentação.

### Limite conhecido

Laboratórios, grades e docentes **estão** no banco (exigência das FKs), mas o
router ainda os lê de `catalogo_labs_mock.py` — são os mesmos dados e UUIDs.
Trocar essas três consultas por `session.get(...)` continua sendo o ponto de
integração com RF-LAB01, RF-LAB03 e RF-CORE05.

### Como rodar

```bash
docker compose up -d postgres
source .venv/bin/activate        # fish: source .venv/bin/activate.fish
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
