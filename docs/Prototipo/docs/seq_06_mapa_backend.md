# Arquitetura e Mapa do Back-end (API RESTful Multi-Módulos)

## 📌 1. Visão Geral da API

A API RESTful institucional do IFAM foi desenvolvida com **FastAPI (Python 3.10+)**, **SQLAlchemy 2.0+** e **Pydantic v2**, provendo alta velocidade assíncrona, documentação interativa automática OpenAPI/Swagger (`/docs`) e validação estrita de contratos de dados.

A arquitetura organiza os endpoints por **Domínios de Negócio (Feature-Based)**:
* **Core / SSO:** Autenticação unificada, gestão de usuários e central de notificações.
* **Módulo 1:** Empréstimo de Equipamentos e Gestão de Inventário (Suporte/TI).
* **Módulo 2:** Alocação e Gestão de Laboratórios de Informática.

---

## 📂 2. Estrutura Modular de Pastas (`backend-ifam/`)

```text
backend-ifam/
│
├── app/
│   ├── main.py                     # Inicialização da API, CORS e inclusão dos routers v1
│   ├── database.py                 # Engine SQLAlchemy, SessionLocal e Base declarativa
│   │
│   ├── core/                       # Núcleo de segurança e configuração
│   │   ├── config.py               # Variáveis de ambiente (DATABASE_URL, SECRET_KEY, ALGORITHM)
│   │   ├── security.py             # Bcrypt para hash de senhas e geração/decodificação de JWT
│   │   └── deps.py                 # Injeção de dependências (get_db, get_current_user, get_admin)
│   │
│   ├── models/                     # Mapeamento ORM SQLAlchemy (Tabelas do DER)
│   │   ├── usuarios.py             # Tabela 'usuarios'
│   │   ├── notificacoes.py         # Tabela 'notificacoes'
│   │   ├── equipamentos.py         # Tabelas 'tipos_recursos', 'recursos', 'reservas'
│   │   └── laboratorios.py         # Tabelas 'laboratorios', 'softwares_laboratorio', 'grades_horarios', 'alocacoes_laboratorios'
│   │
│   ├── schemas/                    # Contratos Pydantic (Validação de entrada/saída JSON)
│   │   ├── auth.py                 # LoginRequest, TokenResponse, RecuperarSenhaRequest
│   │   ├── usuarios.py             # UsuarioCreate, UsuarioUpdate, UsuarioResponse, StatusUpdate
│   │   ├── notificacoes.py         # NotificacaoResponse, NotificacaoBatchRead
│   │   ├── equipamentos.py         # TipoRecursoSchema, RecursoSchema, ReservaSchema, CheckinOutSchema
│   │   └── laboratorios.py         # LabSchema, SoftwareSchema, GradeSchema, AlocacaoSchema, FechamentoSchema
│   │
│   └── routers/                    # Endpoints da API divididos por domínio
│       ├── auth.py                 # /api/v1/auth
│       ├── usuarios.py             # /api/v1/usuarios
│       ├── notificacoes.py         # /api/v1/notificacoes
│       │
│       ├── equipamentos/           # Endpoints do Módulo 1 (Suporte/TI)
│       │   ├── tipos.py            # /api/v1/equipamentos/tipos
│       │   ├── recursos.py         # /api/v1/equipamentos/recursos
│       │   ├── reservas.py         # /api/v1/equipamentos/reservas
│       │   ├── operacoes.py        # /api/v1/equipamentos/operacoes (Check-in/Check-out QR)
│       │   └── dashboard.py        # /api/v1/equipamentos/dashboard (KPIs)
│       │
│       └── laboratorios/           # Endpoints do Módulo 2 (Informática)
│           ├── labs.py             # /api/v1/laboratorios/salas
│           ├── softwares.py        # /api/v1/laboratorios/softwares
│           ├── grades.py           # /api/v1/laboratorios/grades
│           ├── alocacoes.py        # /api/v1/laboratorios/alocacoes
│           ├── operacoes.py        # /api/v1/laboratorios/operacoes (Check-in Porta & Fechamento)
│           └── dashboard.py        # /api/v1/laboratorios/dashboard (KPIs e Ocupação)
│
├── requirements.txt                # Dependências Python
├── Dockerfile                      # Containerização da API
└── .env                            # Configurações de ambiente
```

---

## 🔗 3. Contratos JSON Completos por Endpoint

Abaixo estão detalhados **todos os contratos de Request e Response JSON** para cada endpoint da aplicação.

---

### 🟢 SEÇÃO 1: Core / Autenticação, Usuários & Notificações

---

#### 1.1. Health Check
* **Método:** `GET`
* **Rota:** `/`
* **Permissão:** Pública
* **Response (200 OK):**
```json
{
  "status": "online",
  "versao": "2.0.0",
  "instituicao": "IFAM - Instituto Federal do Amazonas",
  "documentacao": "/docs"
}
```

---

#### 1.2. Teste de Latência (Ping)
* **Método:** `GET`
* **Rota:** `/ping`
* **Permissão:** Pública
* **Response (200 OK):**
```json
{
  "ping": "pong",
  "timestamp": "2026-08-25T18:20:00Z"
}
```

---

#### 1.3. Login Institucional (SSO)
* **Método:** `POST`
* **Rota:** `/api/v1/auth/login`
* **Permissão:** Pública
* **Request Body:**
```json
{
  "identificacao": "carlos.bento@ifam.edu.br",
  "senha": "senha_segura_123"
}
```
* **Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTdhOGItOWMwZC0xZTJmM2E0YjVjNmQiLCJwZXJmaWwiOiJBZG1pbmlzdHJhZG9yIiwiZXhwIjoxNzU2MjAwMDAwfQ...",
  "token_type": "bearer",
  "usuario": {
    "id_usuario": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "nome_completo": "Prof. Carlos Bento",
    "email": "carlos.bento@ifam.edu.br",
    "identificacao_institucional": "SIAPE 1982341",
    "perfil": "Administrador",
    "status_conta": "Ativo"
  }
}
```
* **Response de Erro (401 Unauthorized):**
```json
{
  "detail": "Credenciais inválidas. Verifique seu e-mail/matrícula e senha."
}
```

---

#### 1.4. Solicitar Recuperação de Senha
* **Método:** `POST`
* **Rota:** `/api/v1/auth/recuperar-senha`
* **Permissão:** Pública
* **Request Body:**
```json
{
  "email": "carlos.bento@ifam.edu.br"
}
```
* **Response (200 OK):**
```json
{
  "status": "sucesso",
  "mensagem": "Se o e-mail informado estiver cadastrado, um link de recuperação foi enviado."
}
```

---

#### 1.5. Perfil do Usuário Autenticado
* **Método:** `GET`
* **Rota:** `/api/v1/usuarios/me`
* **Permissão:** `Bearer Token` (Qualquer usuário logado)
* **Response (200 OK):**
```json
{
  "id_usuario": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "nome_completo": "Prof. Carlos Bento",
  "email": "carlos.bento@ifam.edu.br",
  "identificacao_institucional": "SIAPE 1982341",
  "perfil": "Administrador",
  "status_conta": "Ativo",
  "criado_em": "2026-08-10T10:00:00Z"
}
```

---

#### 1.6. Listar Usuários do Sistema
* **Método:** `GET`
* **Rota:** `/api/v1/usuarios/`
* **Query Params:** `?perfil=Solicitante&status_conta=Ativo`
* **Permissão:** `Bearer Token` (Administrador)
* **Response (200 OK):**
```json
[
  {
    "id_usuario": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "nome_completo": "Ana Silva",
    "email": "ana.silva@ifam.edu.br",
    "identificacao_institucional": "2023001122",
    "perfil": "Solicitante",
    "status_conta": "Ativo",
    "criado_em": "2026-08-12T14:30:00Z"
  },
  {
    "id_usuario": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "nome_completo": "Lucas Rocha",
    "email": "lucas.rocha@ifam.edu.br",
    "identificacao_institucional": "2024009988",
    "perfil": "Solicitante",
    "status_conta": "Bloqueado_por_Atraso",
    "criado_em": "2026-08-15T09:15:00Z"
  }
]
```

---

#### 1.7. Cadastrar Novo Usuário
* **Método:** `POST`
* **Rota:** `/api/v1/usuarios/`
* **Permissão:** `Bearer Token` (Administrador)
* **Request Body:**
```json
{
  "nome_completo": "Mariana Souza",
  "email": "mariana.souza@ifam.edu.br",
  "senha": "senha_inicial_123",
  "identificacao_institucional": "2025003344",
  "perfil": "Solicitante"
}
```
* **Response (201 Created):**
```json
{
  "id_usuario": "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
  "nome_completo": "Mariana Souza",
  "email": "mariana.souza@ifam.edu.br",
  "identificacao_institucional": "2025003344",
  "perfil": "Solicitante",
  "status_conta": "Ativo",
  "criado_em": "2026-08-25T18:25:00Z"
}
```

---

#### 1.8. Atualizar Status da Conta do Usuário
* **Método:** `PATCH`
* **Rota:** `/api/v1/usuarios/{id}/status`
* **Permissão:** `Bearer Token` (Administrador)
* **Request Body:**
```json
{
  "status_conta": "Bloqueado_por_Atraso"
}
```
* **Response (200 OK):**
```json
{
  "id_usuario": "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
  "status_conta": "Bloqueado_por_Atraso",
  "mensagem": "Status da conta atualizado com sucesso."
}
```

---

#### 1.9. Listar Notificações do Usuário
* **Método:** `GET`
* **Rota:** `/api/v1/notificacoes/`
* **Permissão:** `Bearer Token` (Autenticado)
* **Response (200 OK):**
```json
[
  {
    "id_notificacao": "550e8400-e29b-41d4-a716-446655440000",
    "modulo_origem": "EQUIPAMENTOS",
    "tipo_evento": "Reserva_Aprovada",
    "mensagem_corpo": "Sua solicitação de empréstimo para o Datashow Epson foi APROVADA.",
    "status_leitura": false,
    "data_hora_envio": "2026-08-25T14:30:00Z"
  },
  {
    "id_notificacao": "660e8400-e29b-41d4-a716-446655441111",
    "modulo_origem": "LABORATORIOS",
    "tipo_evento": "Alocacao_Aprovada",
    "mensagem_corpo": "Sua aula prática no Laboratório 01 (Redes) para sexta-feira foi confirmada.",
    "status_leitura": false,
    "data_hora_envio": "2026-08-25T15:00:00Z"
  }
]
```

---

#### 1.10. Marcar Notificação como Lida
* **Método:** `PATCH`
* **Rota:** `/api/v1/notificacoes/{id}/ler`
* **Permissão:** `Bearer Token` (Autenticado)
* **Response (200 OK):**
```json
{
  "id_notificacao": "550e8400-e29b-41d4-a716-446655440000",
  "status_leitura": true
}
```

---

### 📦 SEÇÃO 2: Módulo 1 — Empréstimo de Equipamentos & Inventário

---

#### 2.1. Listar Categorias de Recursos
* **Método:** `GET`
* **Rota:** `/api/v1/equipamentos/tipos/`
* **Permissão:** `Bearer Token` (Autenticado)
* **Response (200 OK):**
```json
[
  {
    "id_tipo_recurso": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "descricao": "Datashow Epson 3000 lumens",
    "categoria": "Eletrônicos",
    "criado_em": "2026-08-01T08:00:00Z"
  },
  {
    "id_tipo_recurso": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
    "descricao": "Cabo HDMI 2.0 (2 metros)",
    "categoria": "Cabos",
    "criado_em": "2026-08-01T08:05:00Z"
  }
]
```

---

#### 2.2. Cadastrar Categoria de Recurso
* **Método:** `POST`
* **Rota:** `/api/v1/equipamentos/tipos/`
* **Permissão:** `Bearer Token` (Administrador)
* **Request Body:**
```json
{
  "descricao": "Notebook Dell Core i7 16GB RAM",
  "categoria": "Eletrônicos"
}
```
* **Response (201 Created):**
```json
{
  "id_tipo_recurso": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
  "descricao": "Notebook Dell Core i7 16GB RAM",
  "categoria": "Eletrônicos",
  "criado_em": "2026-08-25T18:30:00Z"
}
```

---

#### 2.3. Listar Catálogo e Inventário de Equipamentos
* **Método:** `GET`
* **Rota:** `/api/v1/equipamentos/recursos/`
* **Query Params:** `?status=Disponível&categoria=Eletrônicos&busca=Epson`
* **Permissão:** `Bearer Token` (Autenticado)
* **Response (200 OK):**
```json
[
  {
    "id_recurso": "123e4567-e89b-12d3-a456-426614174000",
    "id_tipo_recurso": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "codigo_patrimonio": "PAT-102030",
    "marca_modelo": "Datashow Epson PowerLite X41+",
    "categoria": "Eletrônicos",
    "estado_conservacao": "Bom",
    "status_disponibilidade": "Disponível",
    "qr_code_hash": "hash_seguro_pat_102030_epson",
    "criado_em": "2026-08-02T10:00:00Z"
  }
]
```

---

#### 2.4. Cadastrar Equipamento Físico (Inventário)
* **Método:** `POST`
* **Rota:** `/api/v1/equipamentos/recursos/`
* **Permissão:** `Bearer Token` (Administrador)
* **Request Body:**
```json
{
  "id_tipo_recurso": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "codigo_patrimonio": "PAT-102031",
  "marca_modelo": "Datashow Epson PowerLite S41+",
  "estado_conservacao": "Novo"
}
```
* **Response (201 Created):**
```json
{
  "id_recurso": "223e4567-e89b-12d3-a456-426614174001",
  "id_tipo_recurso": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "codigo_patrimonio": "PAT-102031",
  "marca_modelo": "Datashow Epson PowerLite S41+",
  "estado_conservacao": "Novo",
  "status_disponibilidade": "Disponível",
  "qr_code_hash": "hash_seguro_pat_102031_s41",
  "criado_em": "2026-08-25T18:35:00Z"
}
```

---

#### 2.5. Solicitar Reserva de Equipamento
* **Método:** `POST`
* **Rota:** `/api/v1/equipamentos/reservas/`
* **Permissão:** `Bearer Token` (Solicitante)
* **Request Body:**
```json
{
  "id_recurso": "123e4567-e89b-12d3-a456-426614174000",
  "data_hora_prevista_retirada": "2026-08-28T07:30:00Z",
  "data_hora_prevista_devolucao": "2026-08-28T11:30:00Z"
}
```
* **Response (201 Created):**
```json
{
  "id_reserva": "888e4567-e89b-12d3-a456-426614174888",
  "id_usuario": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "id_recurso": "123e4567-e89b-12d3-a456-426614174000",
  "status_reserva": "Pendente",
  "data_hora_prevista_retirada": "2026-08-28T07:30:00Z",
  "data_hora_prevista_devolucao": "2026-08-28T11:30:00Z",
  "criado_em": "2026-08-25T18:40:00Z"
}
```

---

#### 2.6. Listar Meus Empréstimos (Histórico do Solicitante)
* **Método:** `GET`
* **Rota:** `/api/v1/equipamentos/reservas/meus`
* **Permissão:** `Bearer Token` (Solicitante)
* **Response (200 OK):**
```json
[
  {
    "id_reserva": "888e4567-e89b-12d3-a456-426614174888",
    "recurso": {
      "marca_modelo": "Datashow Epson PowerLite X41+",
      "codigo_patrimonio": "PAT-102030",
      "categoria": "Eletrônicos"
    },
    "data_hora_prevista_retirada": "2026-08-28T07:30:00Z",
    "data_hora_prevista_devolucao": "2026-08-28T11:30:00Z",
    "status_reserva": "Aprovada",
    "observacoes": null
  }
]
```

---

#### 2.7. Listar Reservas Pendentes de Aprovação
* **Método:** `GET`
* **Rota:** `/api/v1/equipamentos/reservas/pendentes`
* **Permissão:** `Bearer Token` (Administrador)
* **Response (200 OK):**
```json
[
  {
    "id_reserva": "888e4567-e89b-12d3-a456-426614174888",
    "solicitante": {
      "nome_completo": "Prof. Carlos Bento",
      "email": "carlos.bento@ifam.edu.br",
      "identificacao_institucional": "SIAPE 1982341"
    },
    "recurso": {
      "marca_modelo": "Datashow Epson PowerLite X41+",
      "codigo_patrimonio": "PAT-102030"
    },
    "data_hora_prevista_retirada": "2026-08-28T07:30:00Z",
    "data_hora_prevista_devolucao": "2026-08-28T11:30:00Z",
    "status_reserva": "Pendente"
  }
]
```

---

#### 2.8. Aprovar ou Rejeitar Reserva de Equipamento
* **Método:** `PATCH`
* **Rota:** `/api/v1/equipamentos/reservas/{id}/status`
* **Permissão:** `Bearer Token` (Administrador)
* **Request Body (Rejeição com Justificativa Obrigatória):**
```json
{
  "status_reserva": "Rejeitada",
  "justificativa_rejeicao": "Equipamento já reservado para banca de TCC no mesmo horário."
}
```
* **Response (200 OK):**
```json
{
  "id_reserva": "888e4567-e89b-12d3-a456-426614174888",
  "status_reserva": "Rejeitada",
  "justificativa_rejeicao": "Equipamento já reservado para banca de TCC no mesmo horário.",
  "atualizado_em": "2026-08-25T18:45:00Z"
}
```

---

#### 2.9. Operação de Check-out via QR Code (Saída Física)
* **Método:** `POST`
* **Rota:** `/api/v1/equipamentos/operacoes/checkout`
* **Permissão:** `Bearer Token` (Administrador)
* **Request Body:**
```json
{
  "qr_code_hash": "hash_seguro_pat_102030_epson"
}
```
* **Response (200 OK):**
```json
{
  "id_reserva": "888e4567-e89b-12d3-a456-426614174888",
  "codigo_patrimonio": "PAT-102030",
  "marca_modelo": "Datashow Epson PowerLite X41+",
  "solicitante": "Prof. Carlos Bento",
  "status_reserva": "Em_Andamento",
  "data_hora_efetiva_retirada": "2026-08-28T07:28:15Z",
  "mensagem": "Check-out realizado com sucesso. Equipamento liberado."
}
```

---

#### 2.10. Operação de Check-in via QR Code (Devolução + Checklist)
* **Método:** `POST`
* **Rota:** `/api/v1/equipamentos/operacoes/checkin`
* **Permissão:** `Bearer Token` (Administrador)
* **Request Body:**
```json
{
  "qr_code_hash": "hash_seguro_pat_102030_epson",
  "checklist_devolucao": "Bom",
  "observacoes": "Devolvido completo com cabos e maleta."
}
```
* **Response (200 OK):**
```json
{
  "id_reserva": "888e4567-e89b-12d3-a456-426614174888",
  "codigo_patrimonio": "PAT-102030",
  "status_reserva": "Concluido",
  "data_hora_efetiva_devolucao": "2026-08-28T11:25:40Z",
  "checklist_devolucao": "Bom",
  "mensagem": "Check-in realizado com sucesso. Item retornado ao catálogo como Disponível."
}
```

---

#### 2.11. Dashboard e KPIs de Equipamentos
* **Método:** `GET`
* **Rota:** `/api/v1/equipamentos/dashboard/kpis`
* **Permissão:** `Bearer Token` (Administrador)
* **Response (200 OK):**
```json
{
  "reservas_pendentes": 4,
  "itens_emprestados_agora": 12,
  "itens_em_manutencao": 2,
  "devolucoes_atrasadas": 1,
  "total_recursos_cadastrados": 45
}
```

---

### 💻 SEÇÃO 3: Módulo 2 — Alocação & Gestão de Laboratórios de Informática

---

#### 3.1. Listar Catálogo de Laboratórios
* **Método:** `GET`
* **Rota:** `/api/v1/laboratorios/salas/`
* **Query Params:** `?bloco=Bloco B&so=Linux&capacidade_min=30`
* **Permissão:** `Bearer Token` (Autenticado)
* **Response (200 OK):**
```json
[
  {
    "id_laboratorio": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "nome_laboratorio": "Laboratório 01 - Redes e Infraestrutura",
    "bloco_predio": "Bloco B - 1º Andar (Sala 102)",
    "capacidade_computadores": 32,
    "sistema_operacional": "Dual Boot (Linux Ubuntu / Windows 11)",
    "status_laboratorio": "Disponivel",
    "softwares": ["Cisco Packet Tracer", "Wireshark", "VS Code", "VirtualBox"],
    "criado_em": "2026-08-01T09:00:00Z"
  }
]
```

---

#### 3.2. Ficha Técnica Detalhada do Laboratório
* **Método:** `GET`
* **Rota:** `/api/v1/laboratorios/salas/{id}`
* **Permissão:** `Bearer Token` (Autenticado)
* **Response (200 OK):**
```json
{
  "id_laboratorio": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "nome_laboratorio": "Laboratório 01 - Redes e Infraestrutura",
  "bloco_predio": "Bloco B - 1º Andar (Sala 102)",
  "capacidade_computadores": 32,
  "sistema_operacional": "Dual Boot (Linux Ubuntu / Windows 11)",
  "especificacao_hardware": "Intel Core i5 12ª Ger, 16GB RAM, SSD 512GB",
  "status_laboratorio": "Disponivel",
  "qr_code_porta_hash": "QR-LAB-01-PORTA-B102",
  "softwares": [
    { "nome": "Cisco Packet Tracer", "versao": "8.2.1", "categoria": "Redes" },
    { "nome": "Wireshark", "versao": "4.2.2", "categoria": "Redes" },
    { "nome": "VS Code", "versao": "1.87.0", "categoria": "Desenvolvimento" }
  ],
  "recursos_sala": ["Projetor HDMI", "Quadro Branco", "2x Ar-condicionado 24k BTUs", "Patch Panel"]
}
```

---

#### 3.3. Cadastrar / Vincular Softwares aos Laboratórios
* **Método:** `POST`
* **Rota:** `/api/v1/laboratorios/softwares/`
* **Permissão:** `Bearer Token` (Administrador)
* **Request Body:**
```json
{
  "nome_software": "Docker Desktop",
  "versao": "24.0.7",
  "categoria": "Desenvolvimento",
  "tipo_licenca": "Open Source",
  "id_laboratorios": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "4fa85f64-5717-4562-b3fc-2c963f66afa7"
  ]
}
```
* **Response (201 Created):**
```json
{
  "id_software": "777e4567-e89b-12d3-a456-426614174777",
  "nome_software": "Docker Desktop",
  "versao": "24.0.7",
  "categoria": "Desenvolvimento",
  "labs_vinculados": 2,
  "criado_em": "2026-08-25T18:50:00Z"
}
```

---

#### 3.4. Consultar Grade de Horários e Disponibilidade
* **Método:** `GET`
* **Rota:** `/api/v1/laboratorios/grades/disponibilidade`
* **Query Params:** `?id_laboratorio=3fa85f64-5717-4562-b3fc-2c963f66afa6&dia_semana=Segunda-feira&turno=Matutino`
* **Permissão:** `Bearer Token` (Autenticado)
* **Response (200 OK):**
```json
{
  "laboratorio": "Laboratório 01 - Redes e Infraestrutura",
  "dia_semana": "Segunda-feira",
  "turno": "Matutino",
  "slots": [
    {
      "id_grade_horario": "7a9b8c12-3456-7890-abcd-ef1234567890",
      "descricao_tempo": "1º e 2º Tempo (07:30 - 09:10)",
      "status": "Ocupado",
      "alocacao": {
        "disciplina": "Redes de Computadores I",
        "docente": "Prof. Carlos Bento",
        "curso_turma": "TADS 4º Período"
      }
    },
    {
      "id_grade_horario": "8a9b8c12-3456-7890-abcd-ef1234567891",
      "descricao_tempo": "3º e 4º Tempo (09:30 - 11:10)",
      "status": "Livre",
      "alocacao": null
    }
  ]
}
```

---

#### 3.5. Solicitar Alocação de Laboratório (Pontual ou Semestral)
* **Método:** `POST`
* **Rota:** `/api/v1/laboratorios/alocacoes/`
* **Permissão:** `Bearer Token` (Solicitante)
* **Request Body:**
```json
{
  "id_laboratorio": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id_grade_horario": "8a9b8c12-3456-7890-abcd-ef1234567891",
  "data_reserva": "2026-08-28",
  "dia_semana": "Sexta-feira",
  "disciplina": "Segurança de Redes e Firewalls",
  "curso_turma": "TADS 4º Período",
  "qtd_alunos_prevista": 28,
  "tipo_alocacao": "Pontual",
  "softwares_solicitados": "Wireshark, VirtualBox, Putty"
}
```
* **Response (201 Created):**
```json
{
  "id_alocacao": "999e4567-e89b-12d3-a456-426614174999",
  "id_usuario": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "id_laboratorio": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "disciplina": "Segurança de Redes e Firewalls",
  "status_alocacao": "Pendente",
  "conflito_detectado": false,
  "criado_em": "2026-08-25T18:55:00Z"
}
```

---

#### 3.6. Listar Pedidos de Alocação Pendentes (com Detecção de Conflitos)
* **Método:** `GET`
* **Rota:** `/api/v1/laboratorios/alocacoes/pendentes`
* **Permissão:** `Bearer Token` (Administrador)
* **Response (200 OK):**
```json
[
  {
    "id_alocacao": "999e4567-e89b-12d3-a456-426614174999",
    "laboratorio": {
      "nome": "Laboratório 01 - Redes e Infraestrutura",
      "bloco": "Bloco B - Sala 102"
    },
    "docente": {
      "nome": "Prof. Roberto Dias",
      "matricula": "SIAPE 1982341"
    },
    "disciplina": "Segurança de Redes e Firewalls",
    "curso_turma": "TADS 4º Período",
    "data_reserva": "2026-08-28",
    "horario": "Matutino (07:30 - 09:10)",
    "tipo_alocacao": "Pontual",
    "softwares_solicitados": ["Wireshark", "VirtualBox"],
    "conflito_detectado": false
  }
]
```

---

#### 3.7. Aprovar ou Rejeitar Alocação de Laboratório
* **Método:** `PATCH`
* **Rota:** `/api/v1/laboratorios/alocacoes/{id}/status`
* **Permissão:** `Bearer Token` (Administrador)
* **Request Body (Aprovação):**
```json
{
  "status_alocacao": "Aprovada",
  "justificativa_rejeicao": null
}
```
* **Response (200 OK):**
```json
{
  "id_alocacao": "999e4567-e89b-12d3-a456-426614174999",
  "status_alocacao": "Aprovada",
  "mensagem": "Alocação aprovada. Notificação disparada ao docente."
}
```

---

#### 3.8. Operação de Check-in na Porta via QR Code (Abertura da Sala)
* **Método:** `POST`
* **Rota:** `/api/v1/laboratorios/operacoes/checkin-porta`
* **Permissão:** `Bearer Token` (Autenticado)
* **Request Body:**
```json
{
  "qr_code_porta_hash": "QR-LAB-01-PORTA-B102"
}
```
* **Response (200 OK - Alocação Válida):**
```json
{
  "status": "acesso_liberado",
  "id_alocacao": "999e4567-e89b-12d3-a456-426614174999",
  "laboratorio": "Laboratório 01 - Redes e Infraestrutura",
  "bloco": "Bloco B - Sala 102",
  "docente": "Prof. Carlos Bento",
  "disciplina": "Redes de Computadores I",
  "data_hora_checkin": "2026-08-28T07:27:50Z",
  "mensagem": "Check-in realizado com sucesso. Presença registrada e sala liberada."
}
```

---

#### 3.9. Operação de Checklist de Fechamento (Encerramento de Aula)
* **Método:** `POST`
* **Rota:** `/api/v1/laboratorios/operacoes/checklist-fechamento`
* **Permissão:** `Bearer Token` (Autenticado)
* **Request Body:**
```json
{
  "id_alocacao": "999e4567-e89b-12d3-a456-426614174999",
  "computadores_desligados": true,
  "ar_condicionado_desligado": true,
  "projetor_desligado": true,
  "perifericos_em_ordem": true,
  "porta_trancada": true,
  "estado_conservacao_pos_aula": "Bom",
  "checklist_fechamento_obs": "Todas as bancadas organizadas e sala trancada."
}
```
* **Response (200 OK):**
```json
{
  "id_alocacao": "999e4567-e89b-12d3-a456-426614174999",
  "status_alocacao": "Concluida",
  "data_hora_fechamento": "2026-08-28T09:12:10Z",
  "estado_conservacao_pos_aula": "Bom",
  "mensagem": "Vistoria pós-aula concluída e registrada. Sala liberada no sistema."
}
```

---

#### 3.10. Dashboard e KPIs de Ocupação dos Laboratórios
* **Método:** `GET`
* **Rota:** `/api/v1/laboratorios/dashboard/kpis`
* **Query Params:** `?periodo=Semana`
* **Permissão:** `Bearer Token` (Administrador)
* **Response (200 OK):**
```json
{
  "taxa_ocupacao_media": 78.5,
  "labs_em_uso_agora": 3,
  "total_labs_cadastrados": 5,
  "aulas_agendadas_hoje": 14,
  "maquinas_em_manutencao": 3,
  "ocupacao_por_turno": {
    "matutino": 85.0,
    "vespertino": 72.0,
    "noturno": 60.0
  },
  "ranking_mais_demandados": [
    { "posicao": 1, "laboratorio": "Lab 02 - Desenvolvimento de Software", "horas_semana": 42, "taxa": 92 },
    { "posicao": 2, "laboratorio": "Lab 01 - Redes e Infraestrutura", "horas_semana": 36, "taxa": 80 },
    { "posicao": 3, "laboratorio": "Lab 03 - Computação Gráfica & CAD", "horas_semana": 28, "taxa": 65 }
  ],
  "alertas_manutencao": [
    { "laboratorio": "Lab 05 - Maker & Robótica", "mensagem": "Troca de fonte das bancadas 03 e 04 programada." }
  ]
}
```