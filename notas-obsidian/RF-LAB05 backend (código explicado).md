---
tags: [ifam, backend, fastapi, python, defesa, rf-lab05, codigo]
requisito: RF-LAB05
equipe: 16 (Vinicius e Jhuliano)
repo: https://github.com/vsslvini/ifam-rf-lab05-estudo
commit_base: backend-ifam feature/RF-LAB05 (0b16479, etapa 2, 07/10/2026 — PostgreSQL)
---

# RF-LAB05 backend: o código explicado

> [!info] Relação com as outras notas
> O [[RF-LAB05 (código explicado)]] cobre o **front-end** (tela, hook, componentes, service). Esta nota é a irmã dela para o **back-end** (`backend-ifam/`): o que cada arquivo Python faz, por que está escrito daquele jeito e o caminho de uma requisição do app até o banco. As decisões de projeto, com número, estão em `/docs/RF-LAB05_backend_decisoes.md`; aqui elas aparecem como "(Decisão N)". Para a defesa, use também o [[RF-LAB05 (roteiro de perguntas)]] e o [[Projeto Desenvolvimento Mobile (Benevaldo)]].

> [!important] Versão desta nota
> Descreve a branch `feature/RF-LAB05` do `backend-ifam`, commit `0b16479` (etapa 2: persistência em PostgreSQL). Versões instaladas no `.venv` quando a nota foi escrita: FastAPI 0.141, Pydantic 2.13, SQLAlchemy 2.0.54, Python 3.14. A suíte roda **57 execuções** (32 testes; os HTTP rodam duas vezes, ver Parte 11).

Arquivos cobertos, na ordem em que aparecem aqui (todos dentro de `app/`, salvo os testes e a infra):

1. `main.py` (a porta de entrada)
2. `core/config.py` (as variáveis de ambiente)
3. `routers/laboratorios/alocacoes.py` (os três endpoints)
4. `schemas/laboratorios/alocacoes.py` (os contratos JSON + RN05)
5. `core/deps.py` (injeção de dependências + RN02)
6. `services/conflitos_alocacao.py` (a RN04)
7. `repositories/alocacoes_laboratorios.py` e `catalogo_labs_mock.py` (os dados)
8. `models/laboratorios.py` e `models/usuarios.py` (as tabelas)
9. `database.py` e `seed.py` (o banco)
10. `services/notificacoes.py` (o aviso ao docente)
11. `tests/` (os testes)
12. `docker-compose.yml`, `Dockerfile`, `.env` (a infra)

---

## Parte 0. O mapa antes de mergulhar

```
app/main.py                                   81 linhas   cria o FastAPI, CORS, /, /ping, include_router
app/core/config.py                            52          Settings (lê o .env)
app/core/deps.py                             125          get_db, get_current_user, get_admin_user, repositório
app/routers/laboratorios/alocacoes.py        272          GET /pendentes, GET /{id}/conflitos, PATCH /{id}/status
app/schemas/laboratorios/alocacoes.py        163          formato do JSON de entrada e saída + RN05
app/services/conflitos_alocacao.py            87          RN04 em funções puras
app/services/notificacoes.py                  85          monta o evento "aprovada/rejeitada" (mock da fila)
app/repositories/alocacoes_laboratorios.py   370          protocolo + memória + SQLAlchemy + seed
app/repositories/catalogo_labs_mock.py       224          labs, grades e docentes (de outras equipes)
app/models/laboratorios.py                   270          ENUMs + Laboratorio, GradeHorario, AlocacaoLaboratorio
app/models/usuarios.py                        90          tabela usuarios (só por causa da FK)
app/database.py                               46          Base, engine e sessão (preguiçosas)
app/seed.py                                   93          create_all + dados da demonstração
tests/conftest.py                             56          fixture que roda tudo em memória E em SQL
tests/test_alocacoes_laboratorios.py         384          32 testes
```

Arquivos com **0 linha** (`auth.py`, `security.py`, `equipamentos.py`, `celery_app.py`, `usuarios.py` de schemas...) são a árvore de pastas que veio pronta na `develop`. Pertencem a outras equipes; não fazem parte do RF-LAB05.

> [!tip] A regra de separação, em uma frase
> **Router** = HTTP (recebe, decide o código de resposta, devolve). **Schema** = formato do JSON (e regras que dependem só do JSON, como a RN05). **Service** = regra de negócio pura (RN04), sem banco e sem HTTP. **Repositório** = onde os dados moram (memória ou PostgreSQL). **Model** = como é a tabela. **Deps** = quem fornece o quê para o router.

```mermaid
flowchart TD
    APP[App mobile<br>laboratoriosService.js] -->|HTTP JSON| MAIN[main.py<br>FastAPI + CORS]
    MAIN --> R[Router<br>routers/laboratorios/alocacoes.py]
    R -->|valida corpo| SC[Schemas<br>RN05]
    R -->|Depends| D[deps.py<br>RN02 + escolhe repositório]
    D --> REPO{Repositório}
    REPO -->|USE_IN_MEMORY_REPO=true| MEM[InMemoryAlocacaoRepository]
    REPO -->|false| SQL[SqlAlchemyAlocacaoRepository]
    MEM --> RN04[services/conflitos_alocacao<br>RN04]
    SQL --> RN04
    SQL --> PG[(PostgreSQL)]
    R -->|nome do lab, grade, docente| CAT[catalogo_labs_mock]
    R -->|após decidir| N[services/notificacoes]
```

### Comparação com o front, para fixar

| No front | No back | Papel |
|---|---|---|
| tela | router | recebe o "pedido" e decide o que responder |
| hook | router + repositório | dono dos dados |
| `utils/*` (funções puras) | `services/conflitos_alocacao.py` | regra testável sozinha |
| `laboratoriosService.js` + mock | protocolo `AlocacaoRepository` + memória/SQL | troca de fonte de dados sem mexer em quem usa |
| validação dos 10 caracteres no modal | `model_validator` do schema | o front avisa cedo; **o back garante** |

---

## Parte 1. A porta de entrada (`app/main.py`)

### 1.1 Criando a aplicação

```python
app = FastAPI(
    lifespan=lifespan,
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(...),
    docs_url="/docs",
    redoc_url="/redoc",
)
```

- `app` é **o** objeto que o Uvicorn executa: o comando `uvicorn app.main:app` quer dizer "no módulo `app/main.py`, pegue a variável `app`".
- `docs_url="/docs"`: o FastAPI gera o **Swagger** sozinho, lendo as funções, os tipos e os schemas. É por isso que o projeto quase não tem documentação de API escrita à mão: a documentação é o próprio código.

### 1.2 `lifespan`: o que roda quando a API sobe

```python
@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    if not settings.USE_IN_MEMORY_REPO:
        inicializar_banco()
    yield
```

- Tudo **antes** do `yield` roda uma vez, na subida; tudo depois rodaria no desligamento (aqui não há nada).
- Só prepara o banco (cria as tabelas e semeia) quando o PostgreSQL está ligado. Em memória não há nada a preparar.
- O `_` em `_app` é convenção Python para "parâmetro obrigatório que eu não uso".

### 1.3 CORS

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    ...
)
```

- **CORS** é uma regra do **navegador**: uma página em `localhost:8081` (Expo Web) só pode chamar `localhost:8000` se a API responder que aquela origem é permitida. O app nativo (Android/iOS) não passa por CORS; o Expo Web passa.
- `or ["*"]`: se a lista vier vazia do `.env`, libera tudo, para não travar o desenvolvimento.
- **Middleware** = código que envolve **toda** requisição, antes e depois do router.

### 1.4 Health check e `include_router`

```python
@app.get("/", tags=["Core"], summary="Health check")
def health_check() -> dict[str, str]: ...

@app.get("/ping", ...)
def ping() -> dict[str, str]: ...

app.include_router(laboratorios_alocacoes.router)  # RF-LAB05
```

- `/` e `/ping` seguem o `seq_06` (seções 1.1 e 1.2). Servem para saber se a API está no ar (o `docker-compose` usa o `/ping` no `healthcheck`).
- `include_router` "pendura" no `app` todas as rotas declaradas no router do RF-LAB05. Cada dupla acrescenta o seu `include_router` aqui.
- O router do dashboard (Equipe 19) **não** foi incluído de propósito: o endpoint deles ainda tem corpo `pass`, e a rota falharia (Decisão 10).

---

## Parte 2. As configurações (`app/core/config.py`)

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql+psycopg://ifam:ifam@localhost:5432/ifam"
    USE_IN_MEMORY_REPO: bool = True
    CORS_ORIGINS: str = "http://localhost:8081,http://localhost:19006"
    ...

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
```

- `BaseSettings` (pacote `pydantic-settings`) lê cada atributo de uma **variável de ambiente com o mesmo nome**, depois do arquivo `.env`, e só então usa o valor padrão escrito no código. Ordem de prioridade: variável do sistema > `.env` > padrão.
- E ele **converte o tipo**: `USE_IN_MEMORY_REPO=false` no `.env` é texto, mas vira o `bool` `False`.
- `extra="ignore"`: variáveis do `.env` que não estão na classe são ignoradas, em vez de dar erro.
- `@lru_cache` guarda o resultado da primeira chamada: o `.env` é lido uma vez só.

> [!warning] Pegadinha real
> O padrão no código é `USE_IN_MEMORY_REPO = True`, mas o `.env` local está com `false`. Ou seja: na sua máquina, a API **sem** o PostgreSQL ligado dá erro de conexão. Para rodar sem Docker: `USE_IN_MEMORY_REPO=true uvicorn app.main:app --reload` (no fish: `env USE_IN_MEMORY_REPO=true uvicorn ...`).

- `cors_origins_list` é uma `@property`: um método que se usa como atributo (`settings.cors_origins_list`, sem parênteses). Transforma `"a,b"` em `["a", "b"]`.

---

## Parte 3. O router (`app/routers/laboratorios/alocacoes.py`)

É o arquivo mais importante para a defesa. Tem três endpoints e duas funções auxiliares de "montagem".

### 3.1 O `APIRouter`

```python
router = APIRouter(
    prefix="/api/v1/laboratorios/alocacoes",
    tags=["Laboratórios - Aprovação de Alocações (RF-LAB05)"],
)
```

- `prefix`: todas as rotas abaixo começam com isso. `@router.get("/pendentes")` vira `GET /api/v1/laboratorios/alocacoes/pendentes`.
- `tags`: o título do grupo no Swagger.
- O `v1` na URL é **versionamento**: se um dia o contrato mudar de forma incompatível, nasce `/api/v2` sem quebrar o app antigo.

### 3.2 Endpoint 1: `GET /pendentes`

```python
@router.get("/pendentes", response_model=list[AlocacaoPendenteResponse], summary="...")
def listar_alocacoes_pendentes(
    repositorio: RepositorioAlocacoes,
    _admin: UsuarioAdmin,
    tipo_alocacao: TipoAlocacaoLab | None = Query(default=None, ...),
    id_laboratorio: uuid.UUID | None = Query(default=None, ...),
) -> list[AlocacaoPendenteResponse]:
    pendentes = repositorio.listar_pendentes(tipo_alocacao=tipo_alocacao, id_laboratorio=id_laboratorio)
    return [_montar_pendente(alocacao, repositorio.listar_conflitos(alocacao)) for alocacao in pendentes]
```

Leia os **parâmetros** como uma lista de pedidos ao FastAPI:

| Parâmetro | De onde o FastAPI tira | O que acontece |
|---|---|---|
| `repositorio: RepositorioAlocacoes` | `Depends(get_alocacao_repository)` (Parte 5) | recebe o repositório em memória ou o SQL |
| `_admin: UsuarioAdmin` | `Depends(get_admin_user)` | se não for Administrador, **403** e a função nem roda (RN02) |
| `tipo_alocacao` | query string `?tipo_alocacao=Pontual` | valida contra o ENUM; `?tipo_alocacao=Mensal` dá **422** sozinho |
| `id_laboratorio` | query string | valida que é UUID |

- `_admin` começa com `_` porque a função não usa o valor: o que importa é o **efeito colateral** de a dependência barrar quem não é admin.
- `response_model=list[...]`: o FastAPI filtra e valida a resposta por esse schema e o desenha no Swagger.
- O `return` é uma **list comprehension**: para cada pendente, calcula os conflitos e monta o JSON. Por isso o front recebe `conflito_detectado` já pronto, **sem uma segunda requisição**.

> [!question]- Isso faz uma consulta de conflito por pedido. Não é lento?
> Com dezenas de pedidos, não. É o padrão "N+1" (1 consulta da lista + 1 por item). Se a fila crescer, dá para calcular tudo numa consulta só. Está na Parte 16 (melhorias).

### 3.3 Endpoint 2: `GET /{id_alocacao}/conflitos`

```python
@router.get("/{id_alocacao}/conflitos", response_model=list[AlocacaoEmConflito], responses={404: {...}})
def listar_conflitos_da_alocacao(id_alocacao: uuid.UUID, repositorio: RepositorioAlocacoes, _admin: UsuarioAdmin):
    alocacao = repositorio.obter(id_alocacao)
    if alocacao is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=NAO_ENCONTRADO)
    return [_montar_conflito(c) for c in repositorio.listar_conflitos(alocacao)]
```

- `{id_alocacao}` na rota + `id_alocacao: uuid.UUID` no parâmetro = **path parameter**. Um texto que não é UUID dá 422 antes de chegar aqui.
- `raise HTTPException(...)`: em FastAPI, erro HTTP se **lança**, não se retorna. O FastAPI captura e transforma em `{"detail": "Alocação não encontrada."}` com status 404.
- Esse endpoint é uma **extensão** ao `seq_06` (Decisão 5): o contrato original só tinha o booleano. O front já tem a função `listarConflitosDaAlocacao` para ele, mas a tela atual não usa (ela já recebe `conflitos` na listagem).

### 3.4 Endpoint 3: `PATCH /{id_alocacao}/status` (aprovar ou rejeitar)

É o coração do requisito. Leia como uma **sequência de portões**: cada `if` pode encerrar a requisição.

```python
def decidir_alocacao(id_alocacao: uuid.UUID, decisao: AlocacaoStatusUpdate,
                     repositorio: RepositorioAlocacoes, _admin: UsuarioAdmin):
    # portão 1: existe?
    alocacao = repositorio.obter(id_alocacao)
    if alocacao is None:
        raise HTTPException(404, NAO_ENCONTRADO)

    # portão 2: ainda está pendente?
    if alocacao.status_alocacao is not StatusAlocacaoLab.PENDENTE:
        raise HTTPException(409, f"{JA_ANALISADA} Status atual: {alocacao.status_alocacao.value}.")

    # portão 3 (só para aprovar): RN04
    if decisao.status_alocacao is StatusAlocacaoLab.APROVADA:
        bloqueios = [c for c in repositorio.listar_conflitos(alocacao) if c.ocupa_sala]
        if bloqueios:
            concorrente = bloqueios[0]
            raise HTTPException(409, f'Conflito de grade (RN04): ... "{concorrente.disciplina}" ...')

    # gravar
    atualizada = repositorio.registrar_decisao(id_alocacao, decisao.status_alocacao, decisao.justificativa_rejeicao)

    # avisar o docente
    enfileirar_decisao_alocacao(montar_evento_decisao(atualizada, docente, nome_lab, grade))

    # responder
    return AlocacaoStatusResponse(id_alocacao=..., status_alocacao=..., mensagem=mensagem)
```

O que aconteceu **antes** da primeira linha da função:

1. O FastAPI leu o corpo JSON e montou `decisao: AlocacaoStatusUpdate`. Aqui roda a **RN05** (Parte 4). Se falhar: **422** e a função não roda.
2. Rodou `get_admin_user` (**RN02**). Se falhar: **403**.
3. Rodou `get_alocacao_repository` e entregou o repositório.

A tabela de respostas possíveis, que vale decorar:

| Situação | Código | Quem decide |
|---|---|---|
| corpo inválido, rejeição sem justificativa ou com menos de 10 caracteres, status diferente de Aprovada/Rejeitada | **422** | schema (Pydantic) |
| usuário não é Administrador | **403** | `deps.get_admin_user` |
| id não existe | **404** | router, portão 1 |
| pedido já foi analisado | **409** | router, portão 2 |
| aprovar com a sala ocupada | **409** | router, portão 3 (RN04) |
| deu certo | **200** | router |

> [!question]- Por que a RN04 é `409` e a RN05 é `422`? (Decisão 4)
> **422 Unprocessable Entity** = "o pedido que você mandou está mal formado". A RN05 depende só do JSON enviado: dá para saber que está errado sem olhar o banco. **409 Conflict** = "o pedido está certo, mas conflita com o estado atual do servidor". A RN04 depende de quem mais está na agenda; o mesmo JSON pode ser aceito hoje e recusado amanhã.

> [!question]- Por que só `c.ocupa_sala` bloqueia, se `listar_conflitos` também devolve pendentes?
> Porque dois pedidos **pendentes** no mesmo horário só se sinalizam: quem escolhe qual atender é o Administrador (Decisão 3). Só uma alocação já `Aprovada` ou `Em_Uso` realmente ocupa a sala. Assim que uma das duas pendentes for aprovada, a outra passa a ser bloqueada.

- Depois do 409 da RN04 a mensagem cita a disciplina e a turma concorrentes, para o admin saber **com quem** bate. O front mostra esse texto no alerta "⚠️ Conflito de horário".
- `# pragma: no cover` no segundo 404: esse caminho é impossível (o portão 1 já garantiu que existe), e o comentário avisa a ferramenta de cobertura de testes para não cobrar teste dele.

### 3.5 As funções de montagem: `_montar_pendente` e `_montar_conflito`

O banco guarda **colunas**; o contrato do `seq_06` quer **blocos aninhados**. Essas funções traduzem um no outro.

```python
def _montar_pendente(alocacao, conflitos) -> AlocacaoPendenteResponse:
    laboratorio = catalogo.obter_laboratorio(alocacao.id_laboratorio)
    grade = catalogo.obter_grade(alocacao.id_grade_horario)
    docente = catalogo.obter_docente(alocacao.id_usuario)

    if laboratorio is None or grade is None or docente is None:
        raise HTTPException(422, CADASTRO_INCOMPLETO)   # Decisão 9

    intervalo = f"{grade.hora_inicio:%H:%M} - {grade.hora_fim:%H:%M}"
    return AlocacaoPendenteResponse(
        laboratorio=LaboratorioResumo(id_laboratorio=..., nome=laboratorio.nome_laboratorio, bloco=laboratorio.bloco_predio),
        docente=DocenteResumo(id_usuario=..., nome=docente.nome_completo, matricula=docente.identificacao_institucional),
        horario=f"{grade.turno.value} ({intervalo})",            # "Noturno (18:30 - 20:10)"
        softwares_solicitados=_separar_softwares(alocacao.softwares_solicitados),
        conflito_detectado=bool(conflitos),
        conflitos=[_montar_conflito(c) for c in conflitos],
        ...
    )
```

- **Renomeações** entre banco e contrato: `nome_laboratorio → nome`, `bloco_predio → bloco`, `identificacao_institucional → matricula`.
- `f"{grade.hora_inicio:%H:%M}"`: f-string com **formato de data**; `time(18, 30)` vira `"18:30"`.
- `_separar_softwares`: no banco é um `TEXT` `"Blender 3D, Photoshop"`; no contrato é a lista `["Blender 3D", "Photoshop"]`.
- `bool(conflitos)`: lista vazia é `False`, com qualquer item é `True`.
- Lab, grade e docente vêm do `catalogo_labs_mock`, não do banco (ver "Limite conhecido", Parte 6.4).

Exemplo real da resposta (o pedido do Blender, conferido com a API rodando):

```json
{
  "id_alocacao": "999e4567-e89b-12d3-a456-426614174997",
  "laboratorio": { "id_laboratorio": "5fa85f64-...", "nome": "Laboratório 03 - Computação Gráfica & CAD", "bloco": "Bloco C - Sala 04" },
  "docente": { "id_usuario": "d3e4f5a6-...", "nome": "Prof. Marcos Lima", "matricula": "SIAPE 3120098" },
  "disciplina": "Modelagem Tridimensional com Blender",
  "data_reserva": "2026-08-29", "dia_semana": "Sábado",
  "turno": "Noturno", "horario": "Noturno (18:30 - 20:10)",
  "tipo_alocacao": "Pontual", "softwares_solicitados": ["Blender 3D", "Photoshop"],
  "status_alocacao": "Pendente",
  "conflito_detectado": true,
  "conflitos": [{
    "docente": "Prof. Carlos Bento", "disciplina": "Introdução à Computação Gráfica",
    "status_alocacao": "Aprovada", "bloqueia_aprovacao": true, ...
  }],
  "criado_em": "2026-08-26T09:05:00Z"
}
```

---

## Parte 4. Os schemas (`app/schemas/laboratorios/alocacoes.py`)

Schema = **o formato do JSON**, escrito como classe Pydantic. É a "planta" que o FastAPI usa para validar a entrada, filtrar a saída e desenhar o Swagger.

> [!tip] Model × Schema (confusão clássica)
> **Model** (`app/models/`) = a **tabela** do banco (SQLAlchemy). **Schema** (`app/schemas/`) = o **JSON** da API (Pydantic). São separados porque o banco e o contrato evoluem por motivos diferentes: a tabela tem `qr_code_porta_hash`, que não deve sair na API; o JSON tem `horario` formatado, que não é coluna.

### 4.1 Os schemas de resposta

```python
class LaboratorioResumo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_laboratorio: uuid.UUID
    nome: str = Field(examples=["Laboratório 01 - Redes e Infraestrutura"])
    bloco: str = Field(examples=["Bloco B - Sala 102"])
```

- Cada atributo com tipo = um campo do JSON. O Pydantic converte (`uuid.UUID` vira texto no JSON, `date` vira `"2026-08-29"`).
- `Field(examples=[...])`: só aparece no Swagger, como exemplo.
- `from_attributes=True`: permite criar o schema a partir de um objeto com atributos (um model ORM). Fica pronto para quando os nomes coincidirem.
- `AlocacaoPendenteResponse` aninha `LaboratorioResumo` e `DocenteResumo`, e tem `conflitos: list[AlocacaoEmConflito] = Field(default_factory=list)`.

> [!question]- Por que `default_factory=list` e não `= []`?
> Porque `default_factory` cria uma lista **nova** a cada objeto. É o hábito correto em Python (em funções comuns, `def f(x=[])` compartilha a mesma lista entre chamadas, um bug clássico). O Pydantic até copia o `[]`, mas `default_factory` deixa a intenção explícita.

### 4.2 O schema de entrada e a RN05

```python
class AlocacaoStatusUpdate(BaseModel):
    status_alocacao: StatusAlocacaoLab
    justificativa_rejeicao: str | None = None

    @model_validator(mode="after")
    def validar_decisao(self) -> "AlocacaoStatusUpdate":
        if self.status_alocacao not in (StatusAlocacaoLab.APROVADA, StatusAlocacaoLab.REJEITADA):
            raise ValueError("Este endpoint aceita apenas 'Aprovada' ou 'Rejeitada'.")

        justificativa = (self.justificativa_rejeicao or "").strip()

        if self.status_alocacao is StatusAlocacaoLab.REJEITADA:
            if not justificativa:
                raise ValueError("A justificativa e obrigatoria para rejeitar uma alocacao (RN05).")
            if len(justificativa) < TAMANHO_MIN_JUSTIFICATIVA:   # 10
                raise ValueError("A justificativa deve explicar o motivo da recusa (minimo de 10 caracteres).")
            self.justificativa_rejeicao = justificativa
        else:
            self.justificativa_rejeicao = None
        return self
```

Linha a linha:

- `status_alocacao: StatusAlocacaoLab`: já recusa qualquer texto fora do ENUM (`"Aprovado"` sem o "a" dá 422).
- `@model_validator(mode="after")`: roda **depois** de cada campo ter sido validado sozinho, com o objeto pronto. É o lugar certo para regras que olham **dois campos juntos** (status + justificativa).
- Primeiro `if`: o ENUM tem 6 status, mas este endpoint só aceita 2. `Em_Uso`, `Concluida`, `Cancelada` são transições de outros requisitos (check-in, fechamento).
- `(self.justificativa_rejeicao or "").strip()`: se vier `None`, vira `""`; e `.strip()` tira espaços. Assim `"          "` (só espaços) também é recusado.
- `raise ValueError(...)` dentro de um validador vira **422** automaticamente.
- Na **aprovação**, a justificativa é apagada (`= None`): não se grava motivo de recusa em pedido aprovado, mesmo que o front mande por engano (há teste para isso).
- Na **rejeição**, grava a versão sem espaços nas pontas.

Como o 422 chega ao app (conferido):

```json
{"detail": [{"type": "value_error", "loc": ["body"],
             "msg": "Value error, A justificativa deve explicar o motivo da recusa (minimo de 10 caracteres).", ...}]}
```

O `extrairMensagemDeErro` do `interceptors.js` (front) junta os `msg` dessa lista. Repare no prefixo `"Value error, "` que o Pydantic acrescenta (Parte 16).

> [!question]- Se a RN05 é validada no schema, o router sabe disso?
> Não precisa saber. Quando a função `decidir_alocacao` começa, `decisao` **já é válida por construção**. É a vantagem de validar na fronteira: o resto do código não repete checagens.

### 4.3 Por que é uma pasta (`schemas/laboratorios/alocacoes.py`)

O `seq_06` previa um arquivo `schemas/laboratorios.py`. A Equipe 19 criou a **pasta** `schemas/laboratorios/` (com `dashboard.py`). Em Python, um arquivo `laboratorios.py` e uma pasta `laboratorios/` no mesmo lugar não convivem: o arquivo "esconde" a pasta e o `import app.schemas.laboratorios.dashboard` deles quebraria. Solução no merge: os schemas do RF-LAB05 viraram `laboratorios/alocacoes.py`, um arquivo por requisito, sem tocar no arquivo deles (Decisão 10).

---

## Parte 5. A injeção de dependências (`app/core/deps.py`)

### 5.1 O que é `Depends`

Em vez de a função do router **criar** o que precisa (abrir sessão, descobrir o usuário, escolher o repositório), ela **declara** o que precisa, e o FastAPI entrega. Vantagens: o router fica curto, e os testes podem **trocar** qualquer dependência (Parte 11).

```python
UsuarioAtual = Annotated[UsuarioAutenticado, Depends(get_current_user)]
UsuarioAdmin = Annotated[UsuarioAutenticado, Depends(get_admin_user)]
RepositorioAlocacoes = Annotated[AlocacaoRepository, Depends(get_alocacao_repository)]
```

- `Annotated[Tipo, Depends(funcao)]` = "este parâmetro é do tipo X e quem fornece é a `funcao`". Os **aliases** só encurtam a assinatura do router: `repositorio: RepositorioAlocacoes` em vez da linha inteira.

A **árvore** de dependências de uma requisição ao PATCH:

```mermaid
flowchart LR
    F[decidir_alocacao] --> A[get_admin_user]
    A --> U[get_current_user]
    F --> R[get_alocacao_repository]
    R --> DB[get_db]
```

### 5.2 `get_db`: uma sessão por requisição

```python
def get_db() -> Iterator[Session]:
    session = get_session_factory()()
    try:
        yield session
    finally:
        session.close()
```

- Dependência com `yield`: o FastAPI executa até o `yield`, entrega a sessão para a requisição, e quando a requisição termina executa o `finally`. **Garante** que a sessão fecha, mesmo se der erro.
- `get_session_factory()()`: os primeiros `()` pegam a fábrica; os segundos criam uma sessão.
- Em modo memória, a sessão é criada mas **nunca** executa SQL, então nunca abre conexão. É por isso que a API sobe sem banco.

### 5.3 Autenticação mockada e RBAC real

```python
def get_current_user() -> UsuarioAutenticado:
    return _ADMIN_MOCK          # Prof. Carlos Bento, perfil Administrador

def get_admin_user(usuario: Annotated[UsuarioAutenticado, Depends(get_current_user)]) -> UsuarioAutenticado:
    if not usuario.is_admin:
        raise HTTPException(status_code=403, detail="Acesso restrito a usuarios com perfil Administrador.")
    return usuario
```

- O login (RF-CORE01, Equipe 1) não existe. `get_current_user` já tem a **assinatura definitiva** e devolve um administrador fixo.
- `get_admin_user` (a **RN02**) é **real**: o `if` está lá. Quando o login entrar, só o corpo de `get_current_user` muda (ler o `Authorization: Bearer`, decodificar o JWT, buscar o usuário) e o 403 passa a acontecer de verdade, sem tocar no router.
- `UsuarioAutenticado` é um schema Pydantic com os mesmos campos do JWT previsto no `seq_08` (`sub`, `email`, `matricula`, `perfil`).

> [!question]- Então hoje qualquer um aprova pedidos?
> Hoje sim, porque todo mundo "é" o Prof. Carlos Bento. Isso é aceitável porque o login é de outra equipe e o ponto de troca está documentado. Atenção: **não há teste automatizado do 403**. Para ver funcionar, troque o perfil do `_ADMIN_MOCK` para `"Solicitante"` (experimento da Parte 13). Um teste com `dependency_overrides[get_current_user]` seria a forma certa de cobrir isso (Parte 16).

### 5.4 `get_alocacao_repository`: o interruptor

```python
def get_alocacao_repository(db: Annotated[Session, Depends(get_db)]) -> AlocacaoRepository:
    if settings.USE_IN_MEMORY_REPO:
        return repositorio_alocacoes_em_memoria
    return SqlAlchemyAlocacaoRepository(db)
```

- Uma variável do `.env` decide se os dados vêm do dicionário em memória ou do PostgreSQL. O router não sabe qual recebeu (Decisão 1).
- Em memória: devolve **sempre a mesma instância** (definida no fim do arquivo do repositório), para que uma aprovação feita numa requisição continue valendo na próxima.
- SQL: cria um repositório **novo por requisição**, embrulhando a sessão daquela requisição.

---

## Parte 6. Os repositórios (`app/repositories/`)

### 6.1 O protocolo `AlocacaoRepository`

```python
class AlocacaoRepository(Protocol):
    def listar_pendentes(self, tipo_alocacao=None, id_laboratorio=None) -> list[AlocacaoLaboratorio]: ...
    def obter(self, id_alocacao) -> AlocacaoLaboratorio | None: ...
    def listar_conflitos(self, alocacao) -> list[AlocacaoLaboratorio]: ...
    def registrar_decisao(self, id_alocacao, status, justificativa=None) -> AlocacaoLaboratorio | None: ...
```

- `typing.Protocol` é uma **interface**: lista os métodos que um repositório precisa ter. O `...` é o corpo vazio.
- As duas classes (`InMemory...` e `SqlAlchemy...`) **não herdam** dele. Basta terem os mesmos métodos ("duck typing": se anda como pato e grasna como pato...). O verificador de tipos confere.
- É o mesmo padrão da dupla do RF-EQ01 (`repositories/tipos_recursos.py`), escolhido de propósito para o merge ser fácil.

### 6.2 `InMemoryAlocacaoRepository`

```python
class InMemoryAlocacaoRepository:
    def __init__(self, semear: bool = True) -> None:
        self._registros: dict[uuid.UUID, AlocacaoLaboratorio] = {}
        if semear:
            self.semear()

    def listar_pendentes(self, tipo_alocacao=None, id_laboratorio=None):
        resultado = [a for a in self._registros.values() if a.status_alocacao is StatusAlocacaoLab.PENDENTE]
        if tipo_alocacao is not None:
            resultado = [a for a in resultado if a.tipo_alocacao is tipo_alocacao]
        if id_laboratorio is not None:
            resultado = [a for a in resultado if a.id_laboratorio == id_laboratorio]
        return sorted(resultado, key=lambda a: a.criado_em)
```

- `_registros` é um dicionário `{id: alocação}`. O `_` na frente = "privado por convenção".
- Os objetos guardados são **instâncias reais do model ORM** (`AlocacaoLaboratorio`), só que sem sessão. Assim o router recebe o mesmo tipo de objeto nas duas implementações.
- `sorted(..., key=lambda a: a.criado_em)`: fila **cronológica**: quem pediu primeiro é analisado primeiro.
- `is` para comparar ENUM (é o mesmo objeto) e `==` para comparar UUID (objetos diferentes com o mesmo valor).

```python
    def listar_conflitos(self, alocacao):
        grade = self._grade_de(alocacao)
        if grade is None:
            return []
        conflitos = []
        for candidata in self._registros.values():
            if candidata.status_alocacao not in STATUS_NA_AGENDA:   # Pendente, Aprovada, Em_Uso
                continue
            grade_candidata = self._grade_de(candidata)
            if grade_candidata is None:
                continue
            if alocacoes_conflitam(alocacao, grade, candidata, grade_candidata):
                conflitos.append(candidata)
        return sorted(conflitos, key=lambda a: a.criado_em)
```

- **Varredura**: compara o pedido com todos os registros. O repositório só escolhe os **candidatos**; quem decide se conflita é `alocacoes_conflitam` (Parte 7).
- `STATUS_NA_AGENDA` exclui `Rejeitada`, `Concluida` e `Cancelada`: elas **liberam** a sala. É por isso que, depois de rejeitar um pedido, o concorrente deixa de ver o conflito (há teste).

```python
    def registrar_decisao(self, id_alocacao, status, justificativa=None):
        alocacao = self._registros.get(id_alocacao)
        if alocacao is None:
            return None
        alocacao.status_alocacao = status
        alocacao.justificativa_rejeicao = justificativa
        alocacao.atualizado_em = datetime.now(timezone.utc)
        return alocacao
```

- Só grava. A RN05 já foi validada no schema; a RN04 no router. "Aqui só persiste."
- `datetime.now(timezone.utc)`: hora **com fuso** (UTC). Combina com as colunas `DateTime(timezone=True)`.

### 6.3 `SqlAlchemyAlocacaoRepository`

```python
class SqlAlchemyAlocacaoRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def listar_pendentes(self, tipo_alocacao=None, id_laboratorio=None):
        consulta = select(AlocacaoLaboratorio).where(AlocacaoLaboratorio.status_alocacao == StatusAlocacaoLab.PENDENTE)
        if tipo_alocacao is not None:
            consulta = consulta.where(AlocacaoLaboratorio.tipo_alocacao == tipo_alocacao)
        if id_laboratorio is not None:
            consulta = consulta.where(AlocacaoLaboratorio.id_laboratorio == id_laboratorio)
        consulta = consulta.order_by(AlocacaoLaboratorio.criado_em)
        return list(self._session.scalars(consulta))

    def obter(self, id_alocacao):
        return self._session.get(AlocacaoLaboratorio, id_alocacao)
```

- `select(...).where(...)` é o estilo **SQLAlchemy 2.0**: monta o SQL como objeto. Cada `.where` acrescenta um `AND`. Equivale a `SELECT * FROM alocacoes_laboratorios WHERE status_alocacao = 'Pendente' [AND tipo_alocacao = ...] ORDER BY criado_em`.
- `AlocacaoLaboratorio.status_alocacao == ...` **não** é uma comparação Python que dá `True/False`: o SQLAlchemy sobrecarrega o `==` e devolve um pedaço de SQL.
- `session.scalars(consulta)` executa e devolve os objetos da primeira coluna (as alocações).
- `session.get(Model, chave)` busca pela chave primária (e reaproveita o objeto se já estiver carregado na sessão).

```python
    def listar_conflitos(self, alocacao):
        grade = self._grade_de(alocacao)
        if grade is None:
            return []
        consulta = (
            select(AlocacaoLaboratorio, GradeHorario)
            .join(GradeHorario, GradeHorario.id_grade_horario == AlocacaoLaboratorio.id_grade_horario)
            .where(
                AlocacaoLaboratorio.id_laboratorio == alocacao.id_laboratorio,
                AlocacaoLaboratorio.id_alocacao != alocacao.id_alocacao,
                AlocacaoLaboratorio.status_alocacao.in_(STATUS_NA_AGENDA),
                GradeHorario.hora_inicio < grade.hora_fim,
                GradeHorario.hora_fim > grade.hora_inicio,
            )
            .order_by(AlocacaoLaboratorio.criado_em)
        )
        return [candidata for candidata, grade_candidata in self._session.execute(consulta)
                if alocacoes_conflitam(alocacao, grade, candidata, grade_candidata)]
```

- **Duas etapas** (Decisão 14): o banco faz o **filtro grosso** (mesmo lab, outro pedido, status na agenda, horários que se cruzam) com `JOIN` na grade; o Python faz a **decisão final** com a **mesma função** da versão em memória. A comparação de data/dia da semana fica só no Python.
- Por que não fazer tudo em SQL? Para a RN04 ter **uma única implementação**. Se a regra mudar, muda num lugar e as duas versões continuam iguais (e os testes rodam nas duas para provar).
- `.in_(...)` vira `status_alocacao IN ('Pendente', 'Aprovada', 'Em_Uso')`.
- `select(A, B)` devolve **tuplas** `(alocação, grade)`; o `for candidata, grade_candidata in ...` desempacota cada uma.

> [!note] O SQL do cabeçalho do arquivo
> O comentário no topo do arquivo mostra um SQL "equivalente" com `CASE WHEN :semestral ...`. É a regra inteira em SQL, para referência. O código real **não** faz o `CASE` no banco: essa parte fica no Python (`mesma_ocorrencia_no_calendario`).

```python
    def registrar_decisao(self, id_alocacao, status, justificativa=None):
        alocacao = self.obter(id_alocacao)
        if alocacao is None:
            return None
        alocacao.status_alocacao = status
        alocacao.justificativa_rejeicao = justificativa
        alocacao.atualizado_em = datetime.now(timezone.utc)
        self._session.commit()
        return alocacao
```

- Não há `UPDATE` escrito: o SQLAlchemy **percebe** que os atributos do objeto mudaram (o objeto está "na sessão") e gera o `UPDATE ... SET ... WHERE id_alocacao = ...` no `commit()`. Isso se chama **unit of work**.
- Única diferença real para a versão em memória: o `commit()`.

### 6.4 `catalogo_labs_mock.py`: dados de outras equipes

- Laboratórios (RF-LAB01, Equipe 12), grades de horário (RF-LAB03, Equipe 14) e docentes (RF-CORE05, Equipe 3) não são do RF-LAB05, mas o card precisa mostrar sala, horário e professor.
- O arquivo guarda dicionários "privados" (`_LABORATORIOS`, `_GRADES`, `_DOCENTES`) e expõe só **funções** (`obter_laboratorio`, `obter_grade`, `obter_docente`). Quem usa não sabe que é dicionário; na integração, cada função vira um `session.get(...)` (`TODO` em cada uma).
- `DocenteMock` é um `@dataclass(frozen=True)` com **os mesmos nomes de coluna** da tabela `usuarios` (`nome_completo`, `identificacao_institucional`, `email`). `frozen=True` = imutável.
- UUIDs copiados do `seq_06` (Lab 01 = `3fa85f64-...`, grade matutina = `8a9b8c12-...891`): o exemplo da documentação funciona de verdade.

> [!warning] Limite conhecido (seção 6 das decisões)
> Com o PostgreSQL ligado, lab, grade e docente **estão** no banco (o seed grava, por causa das FKs), mas o **router** ainda os lê do catálogo em memória. São os mesmos dados e UUIDs, então a resposta é igual. Se alguém mudar o nome de um lab direto no banco, o card não mostra a mudança.

### 6.5 O seed das alocações (`_seed()`)

Quatro registros, os mesmos do protótipo da tela:

| Pedido | Lab | Quando | Tipo | Status | Papel na demo |
|---|---|---|---|---|---|
| Segurança de Redes (Prof. Roberto) | Lab 01 | sex 28/08, 07:30–09:10 | Pontual | Pendente | aprova sem conflito |
| Web FullStack (Profª. Camila) | Lab 02 | quartas, 15:30–17:10 | Semestral | Pendente | mostra a regra do semestral |
| Blender (Prof. Marcos) | Lab 03 | sáb 29/08, 18:30–20:10 | Pontual | Pendente | **em conflito** → 409 ao aprovar |
| Computação Gráfica (Prof. Carlos) | Lab 03 | sáb 29/08, 18:30–20:10 | Pontual | **Aprovada** | é quem ocupa a sala |

- O quarto registro existe só para o conflito ser **demonstrável** de verdade, calculado pela regra, e não um `conflito: true` escrito à mão (Decisão 8). Ele não aparece na fila (não é pendente).
- `_seed()` é uma **função** que cria objetos novos a cada chamada. Assim `semear()` (usado nos testes) volta sempre ao estado inicial, e o `seed.py` do banco reaproveita os mesmos dados.

---

## Parte 7. A RN04 (`app/services/conflitos_alocacao.py`)

> "O sistema não permite a aprovação de duas alocações para o mesmo laboratório no mesmo dia e intervalo de tempo."

Três funções **puras**: recebem objetos, devolvem `bool`, não acessam banco nem HTTP. Por isso são testadas diretamente (7 testes), sem subir a API.

### 7.1 `horarios_se_sobrepoem`

```python
def horarios_se_sobrepoem(grade_a, grade_b) -> bool:
    return grade_a.hora_inicio < grade_b.hora_fim and grade_b.hora_inicio < grade_a.hora_fim
```

A fórmula clássica de interseção de intervalos: **A começa antes de B terminar E B começa antes de A terminar**.

```
A: 07:30 |=========| 09:10
B:            08:30 |=========| 10:10    → 07:30 < 10:10 e 08:30 < 09:10 → conflita
C:                  09:10 |=========|    → 09:10 < 09:10? não            → NÃO conflita (encostado)
```

- Intervalo **meio-aberto** `[início, fim)`: usa `<` e não `<=`. Uma aula que termina 09:10 não conflita com outra que começa 09:10.
- Compara **horários**, não o id da grade: slots diferentes que se cruzam (07:30–09:10 e 08:30–10:10) também conflitam (Decisão 3).

### 7.2 `mesma_ocorrencia_no_calendario`

```python
def mesma_ocorrencia_no_calendario(alocacao_a, alocacao_b) -> bool:
    envolve_semestral = TipoAlocacaoLab.SEMESTRAL in (alocacao_a.tipo_alocacao, alocacao_b.tipo_alocacao)
    if envolve_semestral:
        return alocacao_a.dia_semana.strip().casefold() == alocacao_b.dia_semana.strip().casefold()
    return alocacao_a.data_reserva == alocacao_b.data_reserva
```

- Pontual × Pontual: mesma **data**.
- Se **qualquer uma** for Semestral: mesmo **dia da semana**. Motivo: no DDL, a `data_reserva` de uma semestral guarda o **início do semestre**, e a aula se repete toda semana ("Todas as Quartas-feiras").
- `.casefold()` é um `.lower()` mais forte, para comparar sem ligar para maiúsculas (`"Sábado"` = `"sábado"`).

### 7.3 `alocacoes_conflitam`

```python
def alocacoes_conflitam(alocacao_a, grade_a, alocacao_b, grade_b) -> bool:
    if alocacao_a.id_alocacao == alocacao_b.id_alocacao:
        return False                     # não conflita consigo mesma
    if alocacao_a.id_laboratorio != alocacao_b.id_laboratorio:
        return False                     # salas diferentes
    if not mesma_ocorrencia_no_calendario(alocacao_a, alocacao_b):
        return False                     # dias diferentes
    return horarios_se_sobrepoem(grade_a, grade_b)
```

- Estilo **"retorno antecipado"** (guard clauses): cada `if` descarta um caso e sai. Lê-se de cima para baixo como a frase da RN04: mesmo lab → mesmo dia → mesmo intervalo.
- A ordem é do teste mais barato para o mais caro.

> [!question]- Onde está o "Aprovada/Em_Uso bloqueia, Pendente não"?
> **Não** está aqui. Esta função responde só "disputam a mesma sala?". Quem decide se a disputa **bloqueia** é o router (`if c.ocupa_sala`), e `ocupa_sala` é uma `@property` do model (Parte 8). Separar "conflita" de "bloqueia" é o que permite mostrar o alerta entre dois pendentes sem travar nenhum.

---

## Parte 8. Os models (`app/models/`)

### 8.1 Os ENUMs

```python
class StatusAlocacaoLab(str, enum.Enum):
    PENDENTE = "Pendente"
    APROVADA = "Aprovada"
    EM_USO = "Em_Uso"
    ...
```

- Herdar de `str` **e** de `Enum` faz o membro se comportar como texto: vira `"Pendente"` no JSON e compara com string.
- **Nome** do membro (`EM_USO`) × **valor** (`"Em_Uso"`): o valor é o que está no DDL do `seq_05`.

```python
def _enum_ddl(enum_cls, nome_tipo):
    return SAEnum(enum_cls, name=nome_tipo, values_callable=lambda membros: [m.value for m in membros])
```

- Sem `values_callable`, o SQLAlchemy criaria o tipo do PostgreSQL com os **nomes** (`'EM_USO'`), diferente do DDL (`'Em_Uso'`). Em memória ninguém perceberia; no banco, um SQL de outra equipe com `WHERE status_alocacao = 'Em_Uso'` falharia. Bug encontrado e corrigido na etapa 2 (Decisão 12).
- `name="status_alocacao_lab"`: o nome do `CREATE TYPE` no PostgreSQL, igual ao DDL.

```python
STATUS_QUE_OCUPAM_SALA = frozenset({StatusAlocacaoLab.APROVADA, StatusAlocacaoLab.EM_USO})
```

- `frozenset` = conjunto imutável. Constante em MAIÚSCULAS por convenção. Usada na `@property ocupa_sala`.

### 8.2 As tabelas (estilo SQLAlchemy 2.0)

```python
class AlocacaoLaboratorio(Base):
    __tablename__ = "alocacoes_laboratorios"

    id_alocacao: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_usuario: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True),
                                                  ForeignKey("usuarios.id_usuario", ondelete="RESTRICT"), nullable=False)
    data_reserva: Mapped[date] = mapped_column(Date, nullable=False)
    status_alocacao: Mapped[StatusAlocacaoLab] = mapped_column(_enum_ddl(StatusAlocacaoLab, "status_alocacao_lab"),
                                                               nullable=False, default=StatusAlocacaoLab.PENDENTE)
    justificativa_rejeicao: Mapped[str | None] = mapped_column(Text, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False,
                                                server_default=func.current_timestamp())
    ...

    @property
    def ocupa_sala(self) -> bool:
        return self.status_alocacao in STATUS_QUE_OCUPAM_SALA
```

- Herdar de `Base` registra a classe como tabela. `__tablename__` é o nome no banco.
- `Mapped[tipo]` = o tipo Python do atributo; `mapped_column(...)` = como é a coluna. `Mapped[str | None]` indica coluna que aceita nulo.
- `default=uuid.uuid4` (sem parênteses!): passa a **função**, que o SQLAlchemy chama para cada registro novo. Com parênteses, todos os registros teriam o mesmo id.
- `default` (Python preenche) × `server_default` (o **banco** preenche, com `CURRENT_TIMESTAMP`).
- `ForeignKey("usuarios.id_usuario")` em **texto**: resolvido só na criação do schema, então o model carrega mesmo se o arquivo de usuários fosse vazio. Não há `relationship()` (Decisão 7).
- `ondelete="RESTRICT"`: o banco não deixa apagar um laboratório/usuário que tenha alocações.
- As colunas de check-in e fechamento (`data_hora_checkin`, `estado_conservacao_pos_aula`, ...) só são **declaradas**: quem preenche são RF-LAB06 e RF-LAB07.
- `Laboratorio` e `GradeHorario` estão no mesmo arquivo porque são pré-requisitos; o CRUD deles é de outras equipes.

### 8.3 `usuarios.py`: declarado só por causa da FK

- A FK `alocacoes_laboratorios.id_usuario → usuarios` exige que a tabela exista no PostgreSQL. O model `Usuario` é do RF-CORE05; a dupla declarou **só a tabela**, coluna a coluna como no DDL, para o arquivo da Equipe do Core substituir este sem mudar o banco (Decisão 13).

---

## Parte 9. O banco: `database.py` e `seed.py`

### 9.1 `database.py`: engine preguiçosa

```python
_engine: Engine | None = None

def get_engine() -> Engine:
    global _engine
    if _engine is None:
        _engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
    return _engine

def get_session_factory():
    ...
    _session_factory = sessionmaker(bind=get_engine(), autoflush=False, autocommit=False, expire_on_commit=False)
```

- **Engine** = o "motor" de conexão com o banco (guarda um *pool* de conexões). **Sessão** = uma conversa com o banco, que acompanha os objetos carregados e faz o `commit`.
- **Preguiçosa (lazy)**: só cria a engine na primeira vez que alguém pede. Importar o módulo não conecta em nada. `global _engine` é necessário porque a função **reatribui** a variável do módulo.
- `DATABASE_URL = "postgresql+psycopg://ifam:ifam@localhost:5432/ifam"` = banco `+` driver `://` usuário `:` senha `@` host `:` porta `/` nome do banco.
- `pool_pre_ping=True`: testa a conexão antes de usar (evita erro se o banco reiniciou).
- `expire_on_commit=False`: por padrão, depois do `commit` o SQLAlchemy "esquece" os valores dos objetos e os recarrega do banco no próximo acesso. Como o router lê `atualizada.disciplina`, `atualizada.status_alocacao` etc. logo depois do commit, desligar isso evita consultas extras.

### 9.2 `seed.py`: criar tabelas e dados da demonstração

```python
def criar_schema(recriar=False):
    engine = get_engine()
    if recriar:
        Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

def semear(session) -> bool:
    if session.scalar(select(AlocacaoLaboratorio.id_alocacao).limit(1)) is not None:
        return False                                   # já tem dados: não mexe
    for docente in catalogo.listar_docentes():
        session.merge(Usuario(..., senha_hash=SENHA_HASH_SEM_LOGIN, ...))
    for laboratorio in catalogo.listar_laboratorios():
        session.merge(laboratorio)
    for grade in catalogo.listar_grades():
        session.merge(grade)
    session.flush()
    session.add_all(seed_alocacoes())
    session.commit()
    return True
```

- `Base.metadata` conhece todas as classes que herdaram de `Base`. `create_all` executa os `CREATE TYPE` e `CREATE TABLE` que ainda não existem. **Não altera** tabelas já criadas: para isso seriam migrações (Alembic), responsabilidade da Equipe do Core (Decisão 15).
- **Idempotente**: rodar duas vezes dá o mesmo resultado. Se já existe alguma alocação, não semeia. Assim reiniciar a API não apaga o que foi aprovado na apresentação.
- Ordem: usuários, labs e grades **antes** das alocações, porque as alocações apontam para eles (FK). O `flush()` envia esses `INSERT` ao banco antes (sem `commit`).
- `merge` × `add`: `merge` grava uma **cópia** do objeto. Os objetos do catálogo em memória continuam livres de sessão (o router ainda os usa).
- `senha_hash` inválido de propósito: os docentes existem para a FK, não fazem login.
- `if __name__ == "__main__":` permite rodar o arquivo como comando: `python -m app.seed --recriar` volta ao estado inicial da demonstração. `argparse` lê o `--recriar`.

---

## Parte 10. A notificação (`app/services/notificacoes.py`)

- A documentação (`seq_07`) manda publicar a decisão numa **fila** (RabbitMQ + Celery, `fila_emails_transacionais`) e gravar uma notificação no app (RF-CORE03). Nada disso existe ainda (Decisão 6).
- `montar_evento_decisao` monta o **payload definitivo**: `tipo_evento` (`Alocacao_Aprovada` / `Alocacao_Rejeitada`, valores do ENUM do DDL), destinatário, laboratório, disciplina, data, horário e a justificativa.
- `enfileirar_decisao_alocacao` hoje só **registra no log** (`[MOCK fila_emails_transacionais] Alocacao_Rejeitada -> marcos.lima@ifam.edu.br (...)`) e guarda o evento numa lista, que os testes leem com `eventos_emitidos()`. Na integração, o corpo vira `...delay(**evento)` e o router não muda.
- `getattr(docente, "email", None)`: pega o atributo, ou `None` se o docente não existir, sem dar erro.
- Celery e FastAPI-Mail estão **comentados** no `requirements.txt`: não se instala o que ainda não se usa.

---

## Parte 11. Os testes (`tests/`)

### 11.1 `conftest.py`: a fixture que roda tudo duas vezes

```python
@pytest.fixture(params=["memoria", "sqlalchemy"])
def client(request):
    notificacoes.limpar_eventos()
    if request.param == "memoria":
        repositorio_em_memoria.semear()
        app.dependency_overrides[get_alocacao_repository] = lambda: repositorio_em_memoria
        yield TestClient(app)
        app.dependency_overrides.clear()
        return

    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    fabrica = sessionmaker(bind=engine, expire_on_commit=False)
    with fabrica() as session:
        semear(session)

    def repositorio_sqlalchemy():
        with fabrica() as session:
            yield SqlAlchemyAlocacaoRepository(session)

    app.dependency_overrides[get_alocacao_repository] = repositorio_sqlalchemy
    yield TestClient(app)
    app.dependency_overrides.clear()
    engine.dispose()
```

- **Fixture** = algo que o pytest prepara e entrega ao teste que pede (`def test_x(client)`). O `yield` separa preparação e limpeza.
- `params=["memoria", "sqlalchemy"]`: o pytest roda **cada teste que usa `client` duas vezes**. É por isso que são 32 testes e 57 execuções (25 HTTP × 2 + 7 da regra pura).
- `app.dependency_overrides[...]`: o poder do `Depends` na prática. O teste **troca** a função que fornece o repositório, sem mexer no router.
- `"sqlite://"` = SQLite **em memória**. Roda o `SqlAlchemyAlocacaoRepository` de verdade, sem precisar de PostgreSQL. `StaticPool` + `check_same_thread=False` fazem todas as conexões usarem o mesmo banco em memória (senão cada conexão veria um banco vazio).
- `TestClient(app)` faz requisições HTTP de mentira direto na aplicação, sem subir servidor. Como ele é criado sem `with`, o `lifespan` não roda (os testes não tocam no PostgreSQL).

### 11.2 O que é testado

| Grupo | Exemplos de teste |
|---|---|
| Health | `test_health_check_segue_contrato`, `test_ping_responde_pong` |
| Fila | só pendentes, segue o contrato do `seq_06`, ordem cronológica, filtro por tipo/lab, filtro sem resultado |
| Conflito na listagem | `test_pendente_com_sala_ocupada_e_sinalizado`, endpoint `/conflitos` com/sem conflito, 404 |
| RN04 | `test_aprovar_com_sala_ocupada_e_bloqueado`, `test_rejeicao_libera_a_sala_para_o_pedido_concorrente` |
| Aprovar | sem conflito, dispara evento, já analisado → 409, id inexistente → 404 |
| RN05 | sem justificativa, em branco, curta → 422; válida → 200; justificativa chega ao evento; aprovação ignora justificativa; status `Em_Uso` → 422 |
| Regra pura | encostados não conflitam, parcialmente sobrepostos conflitam, slots diferentes sobrepostos, labs diferentes, datas diferentes, semestral pelo dia da semana |

- O **nome do teste descreve a regra**. Ler a lista de nomes (`grep "def test_" tests/*.py`) é um bom resumo do requisito.
- Os testes da regra pura usam os ajudantes `_grade(...)` e `_alocacao(...)` para criar objetos com só o que importa, sem banco.

Os dois avisos (`2 warnings`) do pytest vêm de bibliotecas (`starlette`/`httpx`/`anyio` depreciando nomes), não do código do projeto.

---

## Parte 12. A infra: `docker-compose.yml`, `Dockerfile` e `.env`

- **`docker-compose.yml`** sobe dois serviços:
  - `postgres` (imagem `postgres:16-alpine`, banco/usuário/senha `ifam`, porta 5432, dados num **volume** `postgres_data` que sobrevive a `docker compose down`) com `healthcheck` (`pg_isready`).
  - `api` (constrói o `Dockerfile`), com `USE_IN_MEMORY_REPO: "false"` e `DATABASE_URL` apontando para o host **`postgres`** (o nome do serviço vira o endereço dentro da rede do compose; de fora é `localhost`). `depends_on: condition: service_healthy` = a API só sobe depois que o banco responde.
  - Nomes e credenciais iguais aos da branch da Equipe do Core (`feature/rf-02-v2`), para o merge ser trivial (Decisão 11).
- **`Dockerfile`**: `python:3.12-slim`, copia **primeiro** o `requirements.txt` e instala, **depois** copia o código. Assim, mudar só código não reinstala dependências (cache de camadas do Docker).
- **`.dockerignore`**: tira `.venv`, `.env`, testes e caches da imagem.
- **`.env`** (não versionado) × **`.env.example`** (versionado, modelo sem segredos).

---

## Parte 13. Mão na massa (roteiro para estudar rodando)

```bash
cd backend-ifam
source .venv/bin/activate.fish           # bash: source .venv/bin/activate
pytest -v                                # 57 passed

# Sem Docker (repositório em memória):
env USE_IN_MEMORY_REPO=true uvicorn app.main:app --reload
# Com PostgreSQL:
docker compose up -d postgres
uvicorn app.main:app --reload
```

Abra `http://localhost:8000/docs` e faça, nesta ordem (é o roteiro da defesa):

1. `GET /pendentes` → 3 pedidos; o do Blender com `conflito_detectado: true`.
2. `PATCH /999e4567-e89b-12d3-a456-426614174997/status` com `{"status_alocacao": "Aprovada"}` → **409** RN04.
3. Mesmo id, `{"status_alocacao": "Rejeitada"}` → **422** RN05.
4. Mesmo id, `{"status_alocacao": "Rejeitada", "justificativa_rejeicao": "Sala já reservada para Computação Gráfica"}` → **200**; veja o log `[MOCK fila_emails_transacionais] Alocacao_Rejeitada` no terminal do Uvicorn.
5. `PATCH /999e4567-e89b-12d3-a456-426614174999/status` com `"Aprovada"` → **200**.
6. `GET /pendentes` de novo → sobrou 1 (Web FullStack).
7. Para voltar ao início: em memória, reinicie o Uvicorn; no banco, `python -m app.seed --recriar`.

Experimentos para entender "quebrando":

- Troque `<` por `<=` em `horarios_se_sobrepoem` e rode `pytest`: qual teste quebra? (`test_horarios_encostados_nao_se_sobrepoem`.)
- Mude `_ADMIN_MOCK.perfil` para `"Solicitante"` e chame `GET /pendentes` no Swagger: 403.
- Mude `TAMANHO_MIN_JUSTIFICATIVA` para 20 e veja o texto do 422 mudar sozinho.
- Comente o `values_callable` de `_enum_ddl`, rode `python -m app.seed --recriar` com o banco ligado e confira no `psql` (`\dT+ status_alocacao_lab`) que os valores viraram `PENDENTE`, `EM_USO`. Depois desfaça.

### O caminho completo de um clique em "Rejeitar"

```mermaid
sequenceDiagram
    participant App as App (modal)
    participant API as FastAPI
    participant SC as Schema
    participant D as deps
    participant R as Router
    participant Repo as Repositório
    participant N as notificacoes
    App->>API: PATCH /{id}/status {Rejeitada, justificativa}
    API->>SC: monta AlocacaoStatusUpdate (RN05)
    SC-->>API: ok (ou 422)
    API->>D: get_admin_user (RN02), get_alocacao_repository
    D-->>API: admin, repositório
    API->>R: decidir_alocacao(...)
    R->>Repo: obter(id)  [404?]
    R->>R: está pendente?  [409?]
    R->>Repo: registrar_decisao(Rejeitada, justificativa)
    R->>N: enfileirar(montar_evento(...))
    R-->>App: 200 {mensagem: "Alocação rejeitada. Justificativa enviada ao docente."}
```

---

## Parte 14. Conceitos de Python/FastAPI que aparecem

| Conceito | Onde ver | Em uma frase |
|---|---|---|
| Type hints | todas as funções | `def f(x: int) -> str`; no FastAPI eles **são** a validação |
| `X \| None` | `tipo_alocacao: TipoAlocacaoLab \| None` | "pode ser X ou nulo" (Python 3.10+) |
| Decorator | `@router.get`, `@lru_cache`, `@property` | função que embrulha outra e muda seu comportamento |
| `Annotated` + `Depends` | `deps.py` | "este parâmetro é fornecido por esta função" |
| Dependência com `yield` | `get_db` | prepara, entrega, e limpa no `finally` |
| `HTTPException` | router | erro HTTP se lança com `raise` |
| Pydantic `BaseModel` | schemas | classe que valida e converte dados |
| `model_validator(mode="after")` | `AlocacaoStatusUpdate` | validação que olha vários campos juntos |
| `str, Enum` | models | enum que também é texto |
| `Protocol` | `AlocacaoRepository` | interface por "formato", sem herança |
| `Mapped` / `mapped_column` | models | declarar coluna no SQLAlchemy 2.0 |
| `select().where()` | repositório SQL | montar SQL com objetos Python |
| Unit of work | `registrar_decisao` SQL | mudar o atributo e o `commit` gera o `UPDATE` |
| List comprehension | router, repositório | `[f(x) for x in lista if cond]` |
| f-string com formato | `f"{hora:%H:%M}"` | texto com variáveis e formatação |
| `@dataclass(frozen=True)` | `DocenteMock` | classe de dados imutável, sem escrever `__init__` |
| `global` | `database.py` | reatribuir variável do módulo dentro de função |
| `if __name__ == "__main__"` | `seed.py` | código que só roda quando o arquivo é executado como comando |
| Fixture parametrizada | `conftest.py` | o mesmo teste roda com cada parâmetro |
| `dependency_overrides` | `conftest.py` | trocar dependência só nos testes |

---

## Parte 15. Teste seu entendimento

> [!question]- 1. Onde está a RN02, a RN04 e a RN05? (Partes 3 a 7)
> **RN02**: `deps.get_admin_user` (403). **RN04**: a regra em `services/conflitos_alocacao.py`; o bloqueio (409) no router, portão 3. **RN05**: `model_validator` de `AlocacaoStatusUpdate` (422).

> [!question]- 2. Mandei `PATCH` para um id que não existe, com `"Rejeitada"` e sem justificativa. Volta 404 ou 422? (3.4)
> **422**. O corpo é validado **antes** de a função rodar; o 404 só seria verificado dentro dela. (Conferido com a API rodando.)

> [!question]- 3. Aprovei o pedido do Blender e veio 409. Quem é o concorrente e por que ele bloqueia? (6.5, 3.4)
> "Introdução à Computação Gráfica", do Prof. Carlos Bento: mesmo Lab 03, mesmo sábado 29/08, mesmo horário noturno, e com status `Aprovada` (`ocupa_sala = True`).

> [!question]- 4. Rejeitei o Blender. Se existisse outro pendente no mesmo horário, ele ainda mostraria conflito com o Blender? (6.2)
> Não. `Rejeitada` não está em `STATUS_NA_AGENDA`; o Blender sai da varredura. O teste `test_rejeicao_libera_a_sala_para_o_pedido_concorrente` prova isso: depois de rejeitar o Blender, `GET /{id da Computação Gráfica}/conflitos` volta vazio.

> [!question]- 5. Uma aula 07:30–09:10 e outra 09:10–10:50 no mesmo lab e dia conflitam? (7.1)
> Não. Intervalo meio-aberto: `09:10 < 09:10` é falso.

> [!question]- 6. Um pedido semestral de quarta conflita com um pontual numa quarta qualquer do semestre? (7.2)
> Sim, se for o mesmo lab e os horários se cruzarem: com semestral envolvido, compara-se o **dia da semana**, não a data.

> [!question]- 7. Para trocar o banco de memória para PostgreSQL, quantas linhas do router mudam? (5.4)
> Nenhuma. Muda a variável `USE_IN_MEMORY_REPO` no `.env`; `get_alocacao_repository` entrega a outra implementação.

> [!question]- 8. Por que a regra de sobreposição não foi escrita toda em SQL? (6.3)
> Para existir **uma** implementação da RN04. O SQL só pré-filtra; a decisão final é `alocacoes_conflitam`, a mesma da versão em memória. Os testes rodam nas duas para garantir que não divergem.

> [!question]- 9. Qual a diferença entre `app/models/` e `app/schemas/`? (Parte 4)
> Model = tabela do banco (SQLAlchemy). Schema = JSON da API (Pydantic). Ex.: `qr_code_porta_hash` existe na tabela e não sai na API; `horario` existe no JSON e não é coluna.

> [!question]- 10. Por que 32 testes viram 57 execuções? (11.1)
> A fixture `client` tem `params=["memoria", "sqlalchemy"]`: os 25 testes HTTP rodam duas vezes (50) e os 7 da regra pura não usam `client` (7). 50 + 7 = 57.

> [!question]- 11. Se eu reiniciar a API com o PostgreSQL ligado, as aprovações da apresentação somem? (9.2)
> Não. O seed é idempotente: se já existe alguma alocação, não grava nada. Para zerar: `python -m app.seed --recriar`.

> [!question]- 12. Quem garante que um Solicitante não aprova? E por que hoje isso não acontece na prática? (5.3)
> `get_admin_user` garante (403). Hoje `get_current_user` devolve sempre um Administrador fixo, porque o login (RF-CORE01) é de outra equipe; quando ele entrar, só o corpo de `get_current_user` muda.

> [!question]- 13. Por que o front ainda valida os 10 caracteres no modal, se o back já valida? (4.2)
> Feedback imediato, sem ida ao servidor. Mas quem **garante** é o back: qualquer cliente (Swagger, curl, outro app) passa pelo schema.

> [!question]- 14. O que significa `postgres` em `postgresql+psycopg://ifam:ifam@postgres:5432/ifam` no compose? (Parte 12)
> O nome do serviço do compose, que funciona como endereço dentro da rede dos containers. Rodando a API fora do Docker, o host é `localhost`.

> [!question]- 15. Por que `default=uuid.uuid4` e não `default=uuid.uuid4()`? (8.2)
> Sem parênteses passa a **função**, chamada a cada novo registro. Com parênteses, o UUID seria gerado uma vez só (ao carregar o módulo) e todos os registros teriam o mesmo id.

---

## Parte 16. Melhorias que este código ainda permite

1. Ler lab, grade e docente do **banco** no router (hoje vêm do catálogo em memória), trocando as três funções do catálogo por `session.get(...)`.
2. Evitar o **N+1** em `GET /pendentes` (uma consulta de conflito por pedido) quando a fila crescer.
3. **Concorrência**: dois admins aprovando dois pedidos conflitantes ao mesmo tempo poderiam passar os dois pelo portão 3. Resolve-se com trava de linha (`SELECT ... FOR UPDATE`) ou uma restrição no banco.
4. Tirar o prefixo `"Value error, "` das mensagens 422 (handler de exceção próprio ou `PydanticCustomError`).
5. `atualizado_em` só muda porque o repositório preenche à mão; poderia ser `onupdate=func.now()` no model.
6. Migrações com **Alembic** no lugar de `create_all` (Equipe do Core).
7. Login real (RF-CORE01) em `get_current_user` e fila real (Celery) em `enfileirar_decisao_alocacao`.
8. Ativar o router do dashboard (Equipe 19) quando o `/kpis` for implementado.
9. Teste automatizado da RN02 (403 para Solicitante), trocando `get_current_user` por `dependency_overrides`. Hoje a regra existe, mas nenhum teste a cobre.
