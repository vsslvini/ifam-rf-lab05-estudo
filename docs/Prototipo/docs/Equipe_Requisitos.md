# Documento de Requisitos Funcionais & Regras de Negócio
# Plataforma Multi-Módulos

**Relação das Equipes dos Alunos associados com os seus respectivos Requisitos.**

---

## 📌 1. Requisitos Globais da Plataforma (Core & SSO)

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `1`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-CORE01** | Autenticação Única (SSO) | Login unificado por e-mail institucional ou matrícula/SIAPE com senha criptografada (JWT). | Todos | ✅ Concluído |
| **RF-CORE02** | Recuperação de Senha | Fluxo seguro de redefinição de senha com envio de token/link transacional por e-mail. | Todos | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `2`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-CORE03** | Central de Notificações | Recepção e gestão de alertas (aprovações, rejeições, lembretes e avisos institucionais) com controle de leitura. | Todos | ✅ Concluído |
| **RF-CORE04** | Hub Geral de Módulos | Vitrine inicial (Dashboard Principal) com acesso aos módulos ativos e atalhos rápidos contextuais. | Todos | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `3`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-CORE05** | Gestão de Contas de Usuários | CRUD de usuários e gerenciamento de status de conta (`Ativo`, `Bloqueado_por_Atraso`, `Inativo`). | Admin | ✅ Concluído |

---

## 📦 2. Requisitos do Módulo 1: Empréstimo de Equipamentos & Inventário (Suporte/TI)

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `4`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-EQ01** | Catálogo de Tipos de Recursos | CRUD de categorias (Eletrônicos, Cabos, Acessórios) gerenciado pelo Admin. | Admin | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `5`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-EQ02** | Inventário Físico e Tombamento | Cadastro de itens físicos com número de patrimônio e geração de QR Code exclusivo. | Admin | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `6`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-EQ03** | Agendamento e Solicitação de Reserva | Seleção de item com DateTimePicker nativo e envio de pedido de empréstimo. | Solicitante | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `7`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-EQ04** | Aprovação / Rejeição de Reservas | Análise de pedidos com aprovação ou rejeição fundamentada com justificativa obrigatória. | Admin | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `8`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-EQ05** | Check-out via QR Code (Saída) | Leitura do QR Code no ato da retirada física para liberação do equipamento (`Em Andamento`). | Admin | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `9`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-EQ06** | Check-in via QR Code (Retorno + Checklist) | Leitura do QR Code na devolução, conferência de avarias e liberação do item no catálogo. | Admin | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `10`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-EQ07** | Histórico Pessoal & Global | Acompanhamento de empréstimos do usuário e histórico global de movimentações para o Admin. | Ambos | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `11`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-EQ08** | Dashboard Gerencial de TI | Painel com KPIs de itens emprestados, reservas pendentes, manutenções e devoluções em atraso. | Admin | ✅ Concluído |

---

## 💻 3. Requisitos do Módulo 2: Alocação e Gestão de Laboratórios de Informática

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `12`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-LAB01** | Catálogo e Ficha Técnica de Labs | Busca e listagem com filtros por bloco, SO (Linux/Windows/Dual Boot), capacidade e softwares. | Ambos | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `13`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-LAB02** | Gestão de Softwares e Equipamentos | CRUD de softwares, versões e vinculação direta aos laboratórios onde estão instalados. | Admin | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `14`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-LAB03** | Grade de Disponibilidade por Turno | Matriz visual de turnos (*Matutino, Vespertino, Noturno*) e tempos de aula com status Livre/Ocupado. | Ambos | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `15`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-LAB04** | Solicitação de Alocação de Lab | Formulário de reserva para aulas pontuais ou semestrais, indicando turma, horários e softwares. | Solicitante | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `16`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-LAB05** | Aprovação e Detecção de Conflitos | Painel para aprovar pedidos com alerta visual automático de sobreposição de horários. | Admin | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `17`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-LAB06** | Check-in de Abertura via QR Code | Scanner na porta do laboratório para validar presença do docente e registrar horário de entrada. | Ambos | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `18`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-LAB07** | Checklist de Fechamento de Aula | Vistoria pós-aula (computadores, ar-condicionado, projetor, periféricos e relato de avarias). | Ambos | ✅ Concluído |

---

| Equipe | Aluno 01 | Aluno 02 |
| :--- | :--- | :--- |
| `19`   | Nome do Aluno 01 | Nome do Aluno 02 |

| ID | Nome do Requisito | Descrição Resumida | Perfil | Status Front-end |
| :--- | :--- | :--- | :--- | :--- |
| **RF-LAB08** | Dashboard e Indicadores de Ocupação | Painel com taxa de ocupação por turno, ranking de labs mais usados e alertas de manutenção. | Admin | ✅ Concluído |

---

## ⚖️ 4. Regras de Negócio Institucionais Críticas (RN)

---

* **RN01 — Unicidade Cadastral:** Cada usuário possui um único cadastro institucional no IFAM, identificado obrigatoriamente pelo e-mail `@ifam.edu.br` e pela Matrícula (Discente) ou SIAPE (Servidor/Docente).
* **RN02 — Controle de Acesso Baseado em Funções (RBAC):** As permissões de acesso às funcionalidades administrativas são validadas por token JWT tanto no aplicativo mobile quanto na API RESTful.
* **RN03 — Bloqueio Automático por Inadimplência (Equipamentos):** Usuários com devoluções de equipamentos com status `Atrasado` têm suas contas alteradas automaticamente para `Bloqueado_por_Atraso` e ficam impedidos de realizar novas reservas até a regularização no balcão.
* **RN04 — Prevenção de Conflitos de Grade (Laboratórios):** O sistema não permite a aprovação de duas alocações para o mesmo laboratório no mesmo dia e intervalo de tempo. Conflitos são destacados com alerta crítico vermelho na tela do Administrador.
* **RN05 — Justificativa Obrigatória em Rejeições:** Qualquer rejeição de pedido (seja de equipamento ou de laboratório) exige obrigatoriamente o preenchimento de um texto de justificativa, o qual é enviado imediatamente ao solicitante.
* **RN06 — Validação de Presença e Check-in:** O check-in de abertura do laboratório via QR Code só é validado se houver uma alocação previamente aprovada para aquele horário ou através de liberação explícita da equipe de suporte de TI.