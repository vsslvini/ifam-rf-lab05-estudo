# RF-LAB05 — pasta de estudo

**Equipe 16** — Jhuliano e Vinicius · Portal IFAM, Módulo 2 (Laboratórios) ·
Aprovação de Alocações e Detecção de Conflitos.

Cópia do código e da documentação para **estudar a defesa** de qualquer
máquina. A entrega oficial está no Gitea do IFAM, na branch
`feature/RF-LAB05` dos repositórios `frontend-ifam` e `backend-ifam`.
Esta pasta é um retrato de 17/11/2026 e não substitui aquela entrega.

## Por onde começar

| Arquivo | Para quê |
| :--- | :--- |
| [`ROTEIRO_DEFESA.md`](ROTEIRO_DEFESA.md) | **Comece aqui.** Perguntas de fluxo e arquitetura no estilo do professor ("se eu apertar aqui, o que acontece? mostre no código"), com a fala, o caminho dos arquivos e a linha para abrir |
| [`notas-obsidian/`](notas-obsidian/) | O guia de defesa (arquitetura e perguntas), a explicação arquivo a arquivo do front e do **back-end**, e o roteiro, como estão no Obsidian |
| [`RF-LAB05 backend (código explicado)`](notas-obsidian/RF-LAB05%20backend%20(c%C3%B3digo%20explicado).md) | Tutorial do back-end (FastAPI): router, schemas, deps, RN04, repositórios, banco, testes, roteiro no Swagger e perguntas |
| [`docs/`](docs/) | Registro de decisões do front e do back, registros de cada sessão e o protótipo da disciplina |
| [`HISTORICO_COMMITS.md`](HISTORICO_COMMITS.md) | O `git log` dos dois repositórios oficiais |

## Onde está o código do requisito

```
frontend-ifam/src/modules/laboratorios/
  screens/aprovacoes_alocacoes_screen.js   a tela (orquestração)
  hooks/useAprovacoesAlocacoes.js          dados: carregar, aprovar, rejeitar, busca
  components/aprovacoes/                   o que aparece na tela
  utils/                                   formatadores, filtros, busca, diálogos
  services/laboratoriosService.js          API com fallback para o mock
frontend-ifam/src/core/services/           Axios e interceptors

backend-ifam/app/
  routers/laboratorios/alocacoes.py        as 3 rotas do RF-LAB05
  schemas/laboratorios/alocacoes.py        validação (RN05)
  services/conflitos_alocacao.py           regra de conflito (RN04)
  repositories/alocacoes_laboratorios.py   acesso ao banco
  core/deps.py                             injeção de dependências e perfil admin
```

## Como rodar

**App** (Node 20+ e Expo Go do SDK 58 no celular):

```bash
cd frontend-ifam
npm install
npx expo start -c          # QR code no Expo Go; 'w' abre no navegador
node tests/laboratorios/run.cjs
```

Sem o back-end no ar, o app cai sozinho no mock e mostra uma faixa amarela.

**API** (Python 3.12+):

```bash
cd backend-ifam
python -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env       # sem PostgreSQL: USE_IN_MEMORY_REPO=true
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
.venv/bin/pytest
```

O Swagger fica em `http://localhost:8000/docs`.
