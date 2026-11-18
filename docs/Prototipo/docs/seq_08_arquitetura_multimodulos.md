# Guia de Arquitetura da Plataforma Multi-Módulos IFAM

## 🏛️ 1. Princípios Arquiteturais

A plataforma foi concebida para atender à visão de um **Super App Institucional**, integrando múltiplos setores do IFAM em um único aplicativo móvel e uma API escalável.

### Pilares Fundamentais:
1. **Padrão Hub & Spoke:** O usuário autentica-se uma única vez e visualiza o **Hub de Módulos**, a partir do qual acessa os subsistemas autorizados.
2. **Arquitetura Orientada a Domínios (Feature-First):** Tanto o Front-end quanto o Back-end são organizados por contexto de negócio (Equipamentos, Laboratórios, etc.), minimizando acoplamento e facilitando o desenvolvimento concorrente por múltiplos times.
3. **Serviços Globais Compartilhados (Core Shared):** Autenticação JWT, Notificações in-app, Scanner de QR Code e Design System V2 são transversais e reutilizados por todos os módulos.
4. **Resiliência e Assincronismo:** Regras temporais e comunicações externas nunca bloqueiam a API principal, sendo processadas via RabbitMQ + Celery.

---

## 🔐 2. Autenticação Unificada (SSO) e Controle de Acesso (RBAC)

O controle de acesso opera através de **JSON Web Tokens (JWT)** com claims que definem o perfil institucional do usuário:

```json
{
  "sub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "email": "carlos.bento@ifam.edu.br",
  "matricula": "SIAPE 1982341",
  "perfil": "Administrador",
  "exp": 1756200000
}
```

* **No Mobile:** O estado global de autenticação é carregado no início da sessão. Telas administrativas exibem alertas e opções de aprovação/gerenciamento apenas se o token contiver `perfil == 'Administrador'`.
* **No Back-end:** Todas as rotas protegidas utilizam dependências de injeção (`get_current_user` e `get_admin_user`) que validam o token e a assinatura antes de executar qualquer operação no banco.

---

## 🚀 3. Guia de Extensibilidade: Como Adicionar um Novo Módulo

A arquitetura foi estruturada para permitir que novos módulos (ex: **Módulo 3: Auditórios** ou **Módulo 4: Gestão de Chaves**) sejam adicionados sem modificar o código dos módulos já existentes.

### Passo a Passo para Novos Módulos:

#### 1. Front-end (React Native):
1. Criar a pasta do novo módulo em `src/modules/[nome_modulo]/` (com suas `screens` e `components`).
2. Adicionar o card do módulo no array `modulos` do arquivo [`screen/hub_modulos_screen.js`](file:///c:/IFAM/2026/DSDM/Prototipo/screen/hub_modulos_screen.js).
3. Adicionar o identificador de navegação no roteador principal da aplicação.

#### 2. Back-end (FastAPI):
1. Criar o arquivo de modelos SQLAlchemy em `app/models/[nome_modulo].py`.
2. Criar os schemas Pydantic de entrada e saída em `app/schemas/[nome_modulo].py`.
3. Criar os endpoints REST em `app/routers/[nome_modulo]/`.
4. Incluir o novo router no `app/main.py` com o prefixo `/api/v1/[nome_modulo]`.

#### 3. Banco de Dados (PostgreSQL):
1. Criar as tabelas específicas do novo módulo referenciando `usuarios(id_usuario)` como chave estrangeira para manter a integridade cadastral.
2. Atualizar o script DDL em [`docs/seq_05_database_schema.md`](file:///c:/IFAM/2026/DSDM/Prototipo/docs/seq_05_database_schema.md).

---

## 📋 4. Diretrizes de Qualidade e Boas Práticas para o Time de Desenvolvimento

* **Padrão de Cores e Estilos:** Qualquer nova interface deve utilizar exclusivamente a paleta de cores definida em [`docs/seq_03_design_system_V2.md`](file:///c:/IFAM/2026/DSDM/Prototipo/docs/seq_03_design_system_V2.md).
* **Validação de Formulários:** Todos os inputs obrigatórios devem possuir feedback visual imediato e validação de schema tanto no cliente (React Native) quanto no servidor (Pydantic).
* **Tratamento de Exceções na API:** Utilizar `HTTPException` do FastAPI com códigos HTTP semânticos (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`).
* **Testes de UI:** Todas as telas no repositório foram desenhadas para serem autocontidas e testáveis diretamente no ambiente web do **Expo Snack** sem dependência de emuladores pesados.
