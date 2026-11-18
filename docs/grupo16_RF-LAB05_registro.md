# Equipe 16 — RF-LAB05: Registro Consolidado da Entrega

**Alunos:** Jhuliano e Vinicius
**Requisito:** RF-LAB05 — Aprovação e Detecção de Conflitos (`Equipe_Requisitos.md`)
**Perfil:** Administrador
**Regras de negócio:** RN02 (RBAC), RN04 (conflito de grade), RN05 (justificativa obrigatória)
**Data:** 16/09/2026 (entrega) · 07/10/2026 (persistência em PostgreSQL) · 15/11/2026 (componentização do front-end)

> **Material de estudo pessoal — fora dos dois repositórios Git.**
>
> Este arquivo mora na pasta `/docs` do workspace (junto ao protótipo e às
> diretrizes), que não pertence a `backend-ifam` nem a `frontend-ifam`. É
> deliberado: é anotação de estudo, não documentação de projeto para a turma.
>
> Atende à diretriz *"todas as alterações devem ser registradas em um arquivo
> em /docs, para fins de estudos posteriores"*.

> **Sessão de 07/10/2026** (ambiente, PostgreSQL, verificação da `develop` e
> roteiro da apresentação): ver `sessao_2026-10-07_registro.md`.
>
> **Sessão de 15/11/2026** (componentização da tela do front-end, hook de
> dados, testes): ver `sessao_2026-11-15_registro.md` e a seção 7 de
> `RF-LAB05_frontend_decisoes.md`.
>
> **Sessão de 16 e 17/11/2026** (barra de status no Android, visual enxuto,
> busca por texto, roteiro de perguntas da defesa): ver
> `sessao_2026-11-16_registro.md`, a seção 8 de `RF-LAB05_frontend_decisoes.md`
> e `roteiro_perguntas_defesa_RF-LAB05.md`.

---

## 1. O que foi entregue

| Camada | Repositório | Branch | Commits |
| :--- | :--- | :--- | :---: |
| API RESTful (FastAPI) | `backend-ifam` | `feature/RF-LAB05` | 7 + 1 merge |
| App mobile (React Native / Expo) | `frontend-ifam` | `feature/RF-LAB05` | 4 |

**Pull Requests para `develop`** (situação em 07/10/2026):

* backend — http://172.16.37.134:3000/IFAM/backend-ifam/pulls/5 — **ainda não
  mergeado**. A `develop` recebeu depois o RF-LAB03 (#8) e o RF-CORE03 (#6),
  que conflitam com a branch em `.gitignore`, `app/models/laboratorios.py` e
  `app/schemas/laboratorios.py`.
* frontend — http://172.16.37.134:3000/IFAM/frontend-ifam/pulls/27 — **mergeado
  em 05/10/2026** (commit `ed436e9`).

### Back-end — `/api/v1/laboratorios/alocacoes`

| Método | Rota | Papel na entrega |
| :--- | :--- | :--- |
| `GET` | `/pendentes` | Fila de análise, já com o resultado da RN04 |
| `GET` | `/{id}/conflitos` | Detalhe de quem disputa a sala |
| `PATCH` | `/{id}/status` | Aprovar (RN04) ou rejeitar (RN05) |

32 testes automatizados (`pytest`), cobrindo contrato, filtros, RN04, RN05,
pedido já analisado e disparo da notificação. Desde a etapa 2, os 25 testes
HTTP rodam nas duas implementações do repositório (memória e SQLAlchemy),
totalizando 57 execuções.

### Etapa 2 — Persistência em PostgreSQL (07/10/2026)

`docker-compose.yml` com PostgreSQL 16 e a API, `Dockerfile` preenchido,
`SqlAlchemyAlocacaoRepository` e criação do schema + dados de demonstração na
subida da API (`app/seed.py`). Commit `0b16479`, ainda **sem push**. Detalhes
na seção 6 do registro do back-end.

### Front-end — `aprovacoes_alocacoes_screen.js`

Tela do protótipo movida para o caminho feature-first e integrada à API:
carregamento/erro/vazio/pull-to-refresh, chips filtrando no servidor, alerta
vermelho da RN04 detalhando o concorrente, tratamento do `409`, modal de
rejeição com justificativa obrigatória e fallback offline.

### Etapa 3 — Componentização do front-end (15/11/2026)

A tela de 908 linhas virou orquestração (123 linhas) sobre um hook de dados
(`hooks/useAprovacoesAlocacoes.js`), oito componentes em
`components/aprovacoes/` e três utilitários puros em `utils/`, com 11 testes
em `tests/laboratorios/run.cjs`. Comportamento e visual inalterados. Quatro
commits em `feature/RF-LAB05` (recriada a partir da `develop`), **sem push**.
Detalhes na seção 7 do registro do front-end.

### Etapa 4 — Barra de status, visual enxuto e busca (16/11/2026)

Testado no celular, o conteúdo ficava embaixo da barra de status do Android
e a tela tinha informação repetida demais. Três commits: a tela reserva a
altura da barra de status no Android; cabeçalho, card, alerta e chips ficaram
mais curtos; entrou um campo de busca por texto, filtrado no aparelho. Os
testes foram de 11 para 15. Detalhes na seção 8 do registro do front-end.

---

## 2. Decisões que valem estudar depois

| # | Decisão | Onde está detalhada |
| :--- | :--- | :--- |
| 1 | RN04 como função pura, fora do router e do repositório | back-end, decisão 2 |
| 2 | Conflito por **intervalo de horário**, não por igualdade de slot | back-end, decisão 3 |
| 3 | Alocação **semestral** comparada pelo **dia da semana** | back-end, decisão 3 |
| 4 | Só `Aprovada`/`Em_Uso` bloqueiam; dois `Pendente` só se sinalizam | back-end, decisão 3 |
| 5 | RN05 no schema (`422`), RN04 no router (`409`) | back-end, decisão 4 |
| 6 | Extensão do contrato: campo `conflitos` + endpoint de detalhe | back-end, decisão 5 |
| 7 | Persistência atrás de `Protocol` (repositório em memória hoje) | back-end, decisão 1 |
| 8 | Quem decide o conflito é o servidor; a tela só apresenta | front-end, decisão 1 |
| 9 | Filtro dos chips no servidor | front-end, decisão 3 |
| 10 | O mock também aplica RN04 e RN05 | front-end, decisão 4 |
| 11 | Seletor de tela no `App.js` para não sobrescrever outras duplas | front-end, decisão 7 |
| 12 | Docker alinhado à branch da Equipe do Core (`feature/rf-02-v2`) | back-end, decisão 11 |
| 13 | ENUMs gravam o valor do DDL (`Em_Uso`), não o nome (`EM_USO`) | back-end, decisão 12 |
| 14 | Tabela `usuarios` declarada por nós, fiel ao DDL, só pela FK | back-end, decisão 13 |
| 15 | RN04 com uma única implementação nos dois repositórios | back-end, decisão 14 |
| 16 | `create_all` + seed na subida, em vez de Alembic | back-end, decisão 15 |
| 17 | Tela = orquestração; hook = dados; componentes = apresentação | front-end, decisão 9 |
| 18 | Subpasta `components/aprovacoes/` com barrel, para não colidir com outros requisitos | front-end, decisão 10 |
| 19 | Nada em `src/core/` — placeholders são da Equipe do Core | front-end, decisão 11 |
| 20 | Hook devolve resultado e relança erro; diálogos ficam na tela | front-end, decisão 13 |
| 21 | Respostas obsoletas da listagem são descartadas (condição de corrida dos chips) | front-end, decisão 14 |
| 22 | Testes só do que é puro, com o Babel que o Expo já instala | front-end, decisão 15 |
| 23 | Barra de status do Android via `Constants.statusBarHeight`, sem biblioteca nova | front-end, decisão 16 |
| 24 | Menos texto repetido: cada informação aparece uma vez no card | front-end, decisão 17 |
| 25 | Busca por texto no aparelho; o chip continua indo para a API | front-end, decisão 18 |
| 26 | Contador do cabeçalho conta a fila inteira, não o resultado da busca | front-end, decisão 19 |

---

## 3. O que foi mockado (e como integrar)

A diretriz do projeto pede que tudo que não é do nosso requisito seja mockado
**de forma que a integração futura seja simples**. Cada mock fica atrás de uma
função ou protocolo, com um bloco `FRONTEIRA DE INTEGRACAO` no cabeçalho do
arquivo e um `TODO(requisito, equipe)` no ponto exato da troca.

| O que | De quem é | Arquivo | Troca |
| :--- | :--- | :--- | :--- |
| Login / JWT / RBAC | RF-CORE01 (Eq. 1) | `backend: app/core/deps.py` | Corpo de `get_current_user` |
| Tabela `usuarios` | RF-CORE05 (Eq. 3) | `backend: app/repositories/catalogo_labs_mock.py` | `obter_docente` → `session.get(Usuario, id)` |
| Catálogo de labs | RF-LAB01 (Eq. 12) | idem | `obter_laboratorio` → `session.get(...)` |
| Grade de horários | RF-LAB03 (Eq. 14) | idem | `obter_grade` → `session.get(...)` |
| Criação do pedido | RF-LAB04 (Eq. 15) | `backend: app/routers/laboratorios/alocacoes.py` | `POST /alocacoes/` no mesmo router |
| Notificação + e-mail | RF-CORE03 (Eq. 2) + mensageria | `backend: app/services/notificacoes.py` | `...delay(**evento)` |
| ~~Persistência PostgreSQL~~ | Equipe do Core | `backend: app/repositories/alocacoes_laboratorios.py` | **Feito na etapa 2** (`SqlAlchemyAlocacaoRepository`) |
| Migrações | Equipe do Core | `backend: app/seed.py` | `create_all` → Alembic |
| Modelo `Usuario` | RF-CORE05 (Eq. 3) | `backend: app/models/usuarios.py` | Substituir pelo modelo definitivo (mesma tabela) |
| Navegação | equipe de navegação | `frontend: App.js` | Mapa `TELAS` → `<Stack.Screen>` |
| API indisponível | — | `frontend: aprovacoesAlocacoesMock.js` | Automático: só desligar o fallback |

Nenhum campo do contrato do `seq_06` foi renomeado ou removido, e os UUIDs dos
dados de seed são os mesmos nos dois repositórios — então back-end e front-end
de outras duplas continuam batendo com o nosso.

---

## 4. Como rodar tudo

```bash
# API
cd backend-ifam
python3 -m venv .venv && source .venv/bin/activate   # fish: activate.fish
pip install -r requirements.txt
cp .env.example .env                             # USE_IN_MEMORY_REPO=false
pytest -v                                        # 57 execuções, sem banco
docker compose up -d postgres                    # PostgreSQL 16
uvicorn app.main:app --reload --host 0.0.0.0     # /docs no navegador
python -m app.seed --recriar                     # volta aos dados da demo

# App
cd ../frontend-ifam
npm install
npx expo start                                   # `w` para abrir no navegador
```

O app já abre na tela de aprovações
(`app.json` → `expo.extra.telaInicial = "APROVACOES_ALOCACOES"`).

Roteiro de demonstração completo nos dois documentos de registro, seção 5.

---

## 5. GitFlow seguido

```
main ──────────────────────────────────────────
develop ───────────────────────────────────────
   └── feature/RF-LAB05  (backend-ifam:  7 commits)
   └── feature/RF-LAB05  (frontend-ifam: 4 commits)        ← PR #27, mergeada
   └── feature/RF-LAB05  (frontend-ifam: 4 commits, 15/11) ← etapa 3, recriada da develop
                         (+ 4 commits, 16-17/11)           ← etapa 4, mesma branch
```

Cada etapa da entrega é um commit (estrutura → modelos/contratos → regra de
negócio → endpoints → testes → documentação), no padrão Conventional Commits.
A integração em `develop` é por **Pull Request**, como as demais features do
repositório.

### Conflito resolvido na integração (vale estudar)

Enquanto a entrega estava em andamento, a `develop` do back-end recebeu o
PR #4 (RF-LAB08, Equipe 19), que criou `app/schemas/laboratorios/dashboard.py`
— transformando em **pasta** o caminho que o `seq_06` descrevia como
**arquivo**. Os dois formatos não coexistem em Python: um módulo
`laboratorios.py` sombreia o pacote de mesmo nome e o import
`app.schemas.laboratorios.dashboard` falha, derrubando o router da outra
equipe.

A resolução foi mover **os nossos** schemas para dentro do pacote
(`app/schemas/laboratorios/alocacoes.py`) e acrescentar o `__init__.py` que
faltava — sem alterar nenhum arquivo da Equipe 19. Detalhes na decisão 10 do
registro do back-end.

Lição: quando duas duplas mexem no mesmo caminho do `seq_06`, `git merge` pode
acusar "sem conflito" e ainda assim quebrar a aplicação — o merge só compara
arquivos, não o sistema de import. Vale sempre rodar os testes **depois** do
merge, não só antes.

---

## 6. Autoria dos commits e como localizar a entrega

### 6.1. Identidade usada nos commits

Os 11 commits da entrega foram feitos como:

```
Vinicius Alencar <vsslviniciussousa@gmail.com>
```

(valor do `git config --global user.name` / `user.email` da máquina). Cada
commit carrega também o trailer
`Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

### 6.2. ⚠️ Descasamento com a conta do Gitea

A conta `vinicius.alencar` no servidor tem registrado **apenas**
`2024006157@ifam.edu.br`. Como os commits foram assinados com o e-mail pessoal,
o Gitea **não os vincula ao perfil**: aparecem como texto simples, sem avatar, e
**não entram no gráfico de contribuidores**. Os Pull Requests, sim, estão no
nome da conta — foram abertos autenticado.

Como verificar:

```bash
curl -s -u vinicius.alencar \
  http://172.16.37.134:3000/api/v1/repos/IFAM/backend-ifam/git/commits/8e5579e \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('author'))"
# None  =>  commit nao vinculado a nenhum usuario
```

| Caminho para corrigir | Como | Custo |
| :--- | :--- | :--- |
| **Recomendado** | Cadastrar o e-mail pessoal como secundário no Gitea (*Settings → Emails*) | Nenhum — o vínculo é retroativo |
| Alternativo | Reescrever os commits para o e-mail institucional + `force push` | Troca todos os hashes |

**Lição:** conferir `git config user.email` **antes** do primeiro commit e
garantir que ele é um dos e-mails registrados na conta do servidor. Senão o
trabalho não é contabilizado a quem o fez.

### 6.2.1. Correção a partir da etapa 2

Desde o commit `0b16479` (persistência), os dois repositórios têm
`user.email = 2024006157@ifam.edu.br` na **configuração local** (o global da
máquina continua com o pessoal). Os commits novos já ficam vinculados ao
perfil; os 11 anteriores continuam com o e-mail pessoal — cadastrar esse
e-mail como secundário no Gitea resolve sem reescrever histórico.

### 6.3. Onde a entrega está

Branch **`feature/RF-LAB05`** nos dois repositórios.

```bash
git log --oneline origin/develop..feature/RF-LAB05   # apenas os commits da entrega
git log --author="Vinicius"                          # filtra por autor
git diff --stat origin/develop...feature/RF-LAB05    # arquivos tocados
git show <sha>                                       # um commit especifico
```

No Gitea, a aba **Files changed** do PR mostra tudo de uma vez; a lista de
commits fica em `.../commits/branch/feature/RF-LAB05`.

**Back-end** — 29 arquivos, +2438 / −8. Onde o requisito se concentra:

| Arquivo | Papel |
| :--- | :--- |
| `app/services/conflitos_alocacao.py` | RN04 como funções puras |
| `app/routers/laboratorios/alocacoes.py` | Os três endpoints |
| `app/repositories/alocacoes_laboratorios.py` | Persistência atrás de `Protocol` + seed |
| `app/schemas/laboratorios/alocacoes.py` | Contratos + validação da RN05 |
| `tests/test_alocacoes_laboratorios.py` | 32 casos de teste |

**Front-end** — 8 arquivos, +1503 / −641. A tela aparece como +908/−627 porque
foi **movida** de pasta, não reescrita. Para ler a evolução real:

```bash
git log --follow -p src/modules/laboratorios/screens/aprovacoes_alocacoes_screen.js
```

**Front-end, etapa 3 (15/11/2026)** — onde o requisito se concentra agora:

| Arquivo | Papel |
| :--- | :--- |
| `src/modules/laboratorios/screens/aprovacoes_alocacoes_screen.js` | Orquestração (hook + componentes + diálogos) |
| `src/modules/laboratorios/hooks/useAprovacoesAlocacoes.js` | Carregar, aprovar, rejeitar e estados de rede |
| `src/modules/laboratorios/components/aprovacoes/` | Cabeçalho, banner, filtros, lista, card, alerta RN04, modal RN05, estados |
| `src/modules/laboratorios/utils/` | Formatadores, filtros da API, diálogos multiplataforma |
| `tests/laboratorios/run.cjs` | 15 testes (`node tests/laboratorios/run.cjs`) |
| `src/modules/laboratorios/utils/buscaAlocacao.js` | Busca por texto (etapa 4) |
| `src/modules/laboratorios/components/aprovacoes/CampoBusca.js` | Campo de busca (etapa 4) |

```bash
git log --oneline develop..feature/RF-LAB05     # etapas 3 e 4 (e os commits de Expo 58 / IP do Metro)
```

---

## 7. Nota sobre este arquivo

Na primeira versão, este registro foi **versionado nos dois repositórios** por
decisão minha (do assistente), com o argumento de que "só o que está versionado
é entregue". Isso estava errado: material de estudo pessoal não pertence a um
repositório compartilhado da turma. Os commits foram revertidos e o conteúdo
voltou para cá.

Lição de processo: *onde* um documento vive é parte do requisito, não um detalhe
de implementação — e a pasta `/docs` do workspace estar fora do Git era
intencional, não um descuido.
