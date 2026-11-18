# Portal de Serviços e Gestão IFAM (Plataforma Multi-Módulos)

## 📌 1. Visão Geral da Plataforma

O **Portal Mobile IFAM** é uma solução institucional desenvolvida para digitalizar, centralizar e modernizar a gestão de recursos físicos e acadêmicos do Instituto Federal de Educação, Ciência e Tecnologia do Amazonas (**IFAM**).

A aplicação opera no modelo arquitetural **Hub & Spoke (Super App)**:
* **Hub Central (SSO & Vitrine de Módulos):** Autenticação unificada por e-mail ou matrícula/SIAPE, direcionando o usuário para os módulos autorizados conforme seu perfil.
* **Módulos Especializados:**
  1. **Módulo 1: Empréstimo de Equipamentos e Inventário (Suporte/TI)** — Controle de movimentação de projetores, notebooks, cabos e periféricos com QR Code e travas automáticas por atraso.
  2. **Módulo 2: Alocação e Gestão de Laboratórios de Informática** — Gestão de capacidade de máquinas, softwares instalados, grade horária de aulas, check-in na porta e vistoria pós-aula.
* **Módulos em Expansão (Roadmap):** Reserva de Auditórios e Gestão de Chaves/Acessos.

---

## 👥 Perfis de Acesso Institucionais

| Perfil | Escopo no Módulo 1 (Equipamentos) | Escopo no Módulo 2 (Laboratórios) |
| :--- | :--- | :--- |
| **Solicitante** *(Professores, Servidores, Alunos)* | Consulta catálogo, agenda empréstimo de itens e acompanha prazos de devolução. | Consulta salas, grade horária, solicita alocações de aula e faz check-in/fechamento. |
| **Administrador** *(Equipe de TI, Suporte, Coordenação)* | Aprova/rejeita reservas, realiza Check-in/Check-out via QR Code, gerencia inventário e bloqueios. | Aprova grade semestral, resolve conflitos, gerencia softwares/máquinas e monitora ocupação. |

---

## 🛠️ Stack Tecnológica Completa

* **Front-end Mobile:** React Native + Expo (26 Telas e Modais prototipados e prontos para teste).
* **Back-end (API RESTful):** Python 3.10+ com FastAPI, Uvicorn, SQLAlchemy (ORM) e Pydantic v2.
* **Banco de Dados:** PostgreSQL 15+ (UUIDs v4, Chaves Estrangeiras com Integridade Referencial, Tipos Enumerados `ENUM`).
* **Mensageria e Tarefas Assíncronas:** Celery + RabbitMQ + FastAPI-Mail / SMTP (processamento em segundo plano, alertas e bloqueios).
* **Design System:** Manual de Identidade Visual IFAM V2 (Verde IF `#2F9E41`, Vermelho IF `#CD191E`, Amarelo `#FFC107`, Azul Módulo `#1976D2`).

---

## 📁 Estrutura de Documentos de Contexto (`docs/`)

Para guiar a equipe de desenvolvimento, a documentação está organizada sequencialmente:

1. [`seq_01_readme_projeto.md`](file:///c:/IFAM/2026/DSDM/Prototipo/docs/seq_01_readme_projeto.md) — Visão geral da plataforma, módulos e arquitetura de alto nível.
2. [`seq_02_requisitos_V8.md`](file:///c:/IFAM/2026/DSDM/Prototipo/docs/seq_02_requisitos_V8.md) — Requisitos Funcionais (Módulo 1 e Módulo 2) e Regras de Negócio Críticas (RN01 a RN06).
3. [`seq_03_design_system_V2.md`](file:///c:/IFAM/2026/DSDM/Prototipo/docs/seq_03_design_system_V2.md) — Padrões visuais, paleta de cores, componentes nativos e layouts em coluna.
4. [`seq_04_mapa_frontend.md`](file:///c:/IFAM/2026/DSDM/Prototipo/docs/seq_04_mapa_frontend.md) — Mapeamento das 26 telas/modais e instruções de execução no Expo Snack / Expo Go.
5. [`seq_05_database_schema.md`](file:///c:/IFAM/2026/DSDM/Prototipo/docs/seq_05_database_schema.md) — Dicionário de dados, script DDL PostgreSQL completo e Diagrama ER (Mermaid).
6. [`seq_06_mapa_backend.md`](file:///c:/IFAM/2026/DSDM/Prototipo/docs/seq_06_mapa_backend.md) — Arquitetura de rotas FastAPI, contratos JSON de entrada/saída e schemas Pydantic.
7. [`seq_07_mapa_mensageria.md`](file:///c:/IFAM/2026/DSDM/Prototipo/docs/seq_07_mapa_mensageria.md) — Filas RabbitMQ, rotinas agendadas (Celery Beat) e templates de e-mail.
8. [`seq_08_arquitetura_multimodulos_e_laboratorios.md`](file:///c:/IFAM/2026/DSDM/Prototipo/docs/seq_08_arquitetura_multimodulos_e_laboratorios.md) — Guia de arquitetura Hub & Spoke, SSO e extensibilidade da plataforma.

---

## 🚀 Status do Projeto

* [x] Arquitetura Multi-Módulos e Hub Central definidos.
* [x] Design System V2 padronizado para todos os módulos.
* [x] Requisitos Funcionais unificados (Módulo 1 + Módulo 2).
* [x] 26 Telas mobile React Native / Expo codificadas na pasta [`screen/`](file:///c:/IFAM/2026/DSDM/Prototipo/screen).
* [x] Modelagem de Banco de Dados PostgreSQL unificada (DDL + DER + Dicionário).
* [x] Mapa completo de endpoints e contratos da API RESTful (FastAPI).
* [x] Mapeamento das filas de mensageria assíncrona (RabbitMQ + Celery).
* [ ] Implementação do código-fonte da API Back-end (`app/`).
* [ ] Integração Front-end Mobile com a API FastAPI.