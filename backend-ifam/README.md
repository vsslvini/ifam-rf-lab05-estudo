# Back-end IFAM (FastAPI)

API RESTful institucional do **Portal de Serviços e Gestão IFAM** — plataforma
multi-módulos (Core/SSO, Empréstimo de Equipamentos e Alocação de Laboratórios).

Documentação de referência: `Documentação/docs/seq_06_mapa_backend.md`.

---

## Como executar

```bash
# 1. Criar o ambiente virtual e instalar as dependências
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2. Configurar o ambiente
cp .env.example .env

# 3. Subir o PostgreSQL
docker compose up -d postgres

# 4. Subir a API (cria as tabelas e os dados iniciais na primeira vez)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger interativo em <http://localhost:8000/docs>.

### Banco de dados

| Comando | Efeito |
| :--- | :--- |
| `docker compose up -d postgres` | Sobe só o PostgreSQL 16 (`ifam`/`ifam`, porta 5432) |
| `docker compose up --build` | Sobe banco **e** API em container (porta 8000) |
| `python -m app.seed --recriar` | Apaga tudo e volta aos dados da demonstração |
| `docker compose down -v` | Derruba os containers e apaga o volume do banco |

Na subida, a API executa `app/seed.py`: cria as tabelas e os ENUMs do DDL
(`create_all`) e, se o banco estiver vazio, grava os mesmos dados do
repositório em memória (mesmos UUIDs). Para rodar sem Docker, use
`USE_IN_MEMORY_REPO=true` no `.env`.

### Testes

```bash
pytest -v
```

Os testes HTTP rodam nas duas implementações do repositório (memória e
SQLAlchemy sobre SQLite), sem precisar do PostgreSQL.

---

## Features implementadas

| Requisito | Equipe | Domínio | Rotas |
| :--- | :--- | :--- | :--- |
| **RF-LAB05** | 16 | Aprovação de Alocações e Detecção de Conflitos | `/api/v1/laboratorios/alocacoes` |

### RF-LAB05 — Aprovação e Detecção de Conflitos

Painel do Administrador para analisar os pedidos de uso de laboratório, com
alerta automático de sobreposição de horário e recusa justificada.

| Método | Rota | Permissão |
| :--- | :--- | :--- |
| `GET` | `/api/v1/laboratorios/alocacoes/pendentes` (query: `tipo_alocacao`, `id_laboratorio`) | Administrador |
| `GET` | `/api/v1/laboratorios/alocacoes/{id}/conflitos` | Administrador |
| `PATCH` | `/api/v1/laboratorios/alocacoes/{id}/status` | Administrador |

**Regras de negócio aplicadas**

| Regra | Onde | Efeito |
| :--- | :--- | :--- |
| **RN02** — RBAC | `app/core/deps.py::get_admin_user` | `403` para perfil Solicitante |
| **RN04** — Conflito de grade | `app/services/conflitos_alocacao.py` | `409` ao aprovar sobre sala ocupada |
| **RN05** — Justificativa obrigatória | `app/schemas/laboratorios.py::AlocacaoStatusUpdate` | `422` ao rejeitar sem justificativa |

> **Extensão sobre o `seq_06`:** o contrato expõe apenas o booleano
> `conflito_detectado`. Foram acrescentados o campo `conflitos` na listagem e o
> endpoint `GET /{id}/conflitos` para que o Administrador veja **com quem** o
> horário bate — sem isso o alerta vermelho informa o problema mas não ajuda a
> resolvê-lo. Também foram acrescentados à resposta `qtd_alunos_prevista`,
> `turno`, `dia_semana` e `descricao_tempo`, exibidos no card do protótipo.

Como a RN04 é decidida (a documentação define a regra, não o algoritmo):

* comparação por **intervalo de horário**, não por igualdade de slot — pedidos
  de 07:30‑09:10 e 08:30‑10:10 ocupam a mesma sala;
* alocação **`Semestral`** é comparada pelo **dia da semana**, porque no DDL
  `data_reserva` guarda o início do semestre e a aula se repete toda semana;
* apenas os status **`Aprovada` / `Em_Uso`** bloqueiam a aprovação;
  dois pedidos `Pendente` são apenas sinalizados um ao outro — quem decide qual
  atender é o Administrador.

---

## Pontos de troca (dependências de outras equipes)

Como as features são desenvolvidas em paralelo por duplas diferentes, as
dependências que ainda não existem estão **mockadas atrás de uma fronteira
explícita**, com a assinatura final já definida. Substituir cada mock pela
implementação real não exige mudança em routers, schemas ou testes.

| Dependência | Arquivo | Situação hoje | O que muda depois |
| :--- | :--- | :--- | :--- |
| Autenticação / RBAC (RF-CORE01) | `app/core/deps.py` | `get_current_user` devolve um Administrador fixo | Decodificar o Bearer token e carregar o usuário — só o corpo da função |
| Migrações (Equipe do Core) | `app/seed.py` | `Base.metadata.create_all` + seed na subida | Trocar por Alembic quando o schema evoluir |
| Modelo `Usuario` (RF-CORE05) | `app/models/usuarios.py` | Só a tabela do DDL, para a FK de `alocacoes_laboratorios` | Substituir pelo modelo definitivo — mesma tabela, sem mudança no banco |
| Laboratórios (RF-LAB01) | `app/repositories/catalogo_labs_mock.py::obter_laboratorio` | Seed em memória | `session.get(Laboratorio, id)` |
| Grade de horários (RF-LAB03) | `app/repositories/catalogo_labs_mock.py::obter_grade` | Seed em memória | `session.get(GradeHorario, id)` |
| Usuários (RF-CORE05) | `app/repositories/catalogo_labs_mock.py::obter_docente` | `DocenteMock` com os campos do DDL | `session.get(Usuario, id)` |
| Criação do pedido (RF-LAB04) | `app/routers/laboratorios/alocacoes.py` | Pedidos vêm do seed | `POST /alocacoes/` entra no mesmo router |
| Notificação / e-mail (RF-CORE03 + mensageria) | `app/services/notificacoes.py` | Evento registrado em log | `tasks_emails.enviar_email_decisao_alocacao.delay(**evento)` |

A verificação de perfil `Administrador` em `get_admin_user` **já é real** — passa
a barrar Solicitantes automaticamente assim que o SSO entrar.
