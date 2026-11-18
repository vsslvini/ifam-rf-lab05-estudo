# Plano de Implementação
# Criação dos Projetos `frontend-ifam` e `backend-ifam`


Este documento detalha o plano de criação e estruturação dos dois projetos da plataforma institucional do IFAM (**Módulo 1: Equipamentos** e **Módulo 2: Laboratórios**), atendendo a todas as especificações dos documentos de contexto do Projeto.

---

## 🏗️ Visão Geral da Estrutura

Os projetos serão organizados dentro do diretório `ifam/` no workspace:

```text
c:/IFAM/2026/DSDM/Prototipo/ifam/
├── frontend-ifam/         # Projeto Mobile React Native / Expo (Feature-First)
└── backend-ifam/          # Projeto API RESTful FastAPI / SQLAlchemy / Celery
```

---

## 📱 1. Projeto `ifam/frontend-ifam/` (Mobile React Native / Expo)

### 1.1. Arquitetura Modular (Feature-First)
* **`assets/`**: Logomarcas do IFAM (`logo_ifam_01.png`, `logo_ifam_02.png`), ícones e fontes.
* **`src/core/`**:
  * **`theme/`**: Definições oficiais do Design System V2 (`colors.js`, `typography.js`, `shadows.js`).
  * **`components/`**: Componentes reutilizáveis (`ButtonIF.js`, `CardContainer.js`, `BadgeStatus.js`, `HeaderPrincipal.js`, `IfamLogo.js`, `QRScannerView.js`).
  * **`services/`**: Cliente Axios configurado com interceptores para injeção do token JWT e tratamento de erros (`api.js`).
  * **`context/`**: Provedores de estado global (`AuthContext.js` para SSO e perfis, `NotificationContext.js` para alertas in-app).
  * **`utils/`**: Formatadores de datas, validação de e-mail institucional e storage local.
* **`src/navigation/`**: Roteador com React Navigation:
  * `AppNavigator.js` (Roteador raiz com alternância Auth x Hub).
  * `AuthNavigator.js` (Login, Recuperação de Senha).
  * `HubNavigator.js` (Hub Geral e Notificações).
  * `EquipamentosNavigator.js` (Pilha de telas do Módulo 1).
  * `LaboratoriosNavigator.js` (Pilha de telas do Módulo 2).
* **`src/modules/`**:
  * **`auth/screens/`**: `LoginScreen.js`, `RecuperarSenhaScreen.js`, `PerfilNotificacoesScreen.js`.
  * **`hub/screens/`**: `HubModulosScreen.js` (Vitrine com atalhos contextuais).
  * **`equipamentos/screens/`**: As 12 telas/modais do Módulo 1 (Catálogo, Meus Empréstimos, Dashboard, Aprovações, Check-out QR, Check-in QR + Checklist, Inventário, Cadastro, Categorias, CRUD Usuários, Histórico).
  * **`laboratorios/screens/`**: As 9 telas/modais do Módulo 2 (Menu Labs, Catálogo Labs, Softwares, Grade Horários, Solicitação Alocação, Aprovações Labs, Check-in Porta QR, Checklist Fechamento, Dashboard Labs).
  * **`services/`**: `authService.js`, `equipamentosService.js`, `laboratoriosService.js`.
* **Configurações do Projeto**:
  * `package.json`, `app.json`, `babel.config.js`, `App.js`.

---

## ⚡ 2. Projeto `ifam/backend-ifam/` (API RESTful FastAPI)

### 2.1. Arquitetura em Camadas (Domain-Driven)
* **`app/core/`**:
  * `config.py` (Configurações Pydantic: URLs de conexão, chaves JWT, CORS, Broker).
  * `security.py` (Criptografia Bcrypt e geração/validação de tokens JWT).
  * `deps.py` (Injeção de dependências: `get_db`, `get_current_user`, `get_admin_user`).
* **`app/database.py`**: Configuração da engine SQLAlchemy, gerenciador de sessões e base declarativa para PostgreSQL.
* **`app/models/`**: Mapeamento das 9 tabelas relacionais do DER com UUIDs e Enums:
  * `usuarios.py` (`Usuario`).
  * `notificacoes.py` (`Notificacao`).
  * `equipamentos.py` (`TipoRecurso`, `Recurso`, `Reserva`).
  * `laboratorios.py` (`Laboratorio`, `SoftwareLaboratorio`, `GradeHorario`, `AlocacaoLaboratorio`).
* **`app/schemas/`**: Modelos Pydantic v2 com validação estrita para Requests e Responses:
  * `auth.py`, `usuarios.py`, `notificacoes.py`, `equipamentos.py`, `laboratorios.py`.
* **`app/routers/`**: Rotas RESTful agrupadas por domínio:
  * `auth.py`, `usuarios.py`, `notificacoes.py`.
  * `equipamentos/` (`tipos.py`, `recursos.py`, `reservas.py`, `operacoes.py`, `dashboard.py`).
  * `laboratorios/` (`labs.py`, `softwares.py`, `grades.py`, `alocacoes.py`, `operacoes.py`, `dashboard.py`).
* **`app/tasks/`**: Workers e rotinas assíncronas (Celery + RabbitMQ):
  * `celery_app.py`, `tasks_atrasos.py`, `tasks_emails.py`.
* **`app/main.py`**: Inicialização do FastAPI com middleware CORS, inclusão de todos os roteadores v1 e OpenAPI Swagger em `/docs`.
* **Arquivos de Ambiente & Deploy**:
  * `requirements.txt`, `Dockerfile`, `docker-compose.yml`, `.env.example`.

---

## 📋 Plano de Execução Passo a Passo

1. **Criar estrutura de diretórios e arquivos de configuração de `ifam/frontend-ifam`**.
2. **Copiar assets de logomarca e criar a camada `src/core/` (Theme, Services, Contexts, Components)**.
3. **Criar a camada de Navegação (`src/navigation/`) e migrar/modularizar as telas em `src/modules/`**.
4. **Criar estrutura de diretórios e arquivos de configuração de `ifam/backend-ifam` (`requirements.txt`, `docker-compose.yml`, `.env.example`)**.
5. **Implementar a camada Core & Database do Back-end (`config.py`, `security.py`, `deps.py`, `database.py`)**.
6. **Implementar todos os Modelos ORM SQLAlchemy (`app/models/`) e Schemas Pydantic (`app/schemas/`)**.
7. **Implementar todos os Routers RESTful (`app/routers/`) e o arquivo principal `app/main.py`**.
8. **Configurar as tarefas Celery/RabbitMQ (`app/tasks/`)**.
9. **Verificar integridade dos arquivos e documentar o walkthrough de execução**.

---

## 🔍 Plano de Verificação

### Front-end:
* Verificar se a estrutura de pastas do `frontend-ifam` está completa e se `package.json` / `App.js` importam corretamente todos os módulos.
* Validar que as 25 telas estão devidamente integradas na navegação modular.

### Back-end:
* Verificar sintaxe Python de todos os módulos (`models`, `schemas`, `routers`, `core`, `main`).
* Validar que os endpoints REST correspondem aos contratos JSON especificados em [`seq_06_mapa_backend.md`].
