# Sessão de 16 e 17/11/2026 — Celular, visual enxuto, busca e roteiro da defesa

**Equipe 16** — Jhuliano e Vinicius · **Requisito:** RF-LAB05

Registro do que foi feito e decidido, para estudo posterior (diretriz:
*"todas as alterações devem ser registradas em /docs"*). As decisões estão
detalhadas na **seção 8** de `RF-LAB05_frontend_decisoes.md`; o índice geral
está em `grupo16_RF-LAB05_registro.md`.

---

## 1. Linha do tempo

| # | Pedido | O que foi feito |
| :--- | :--- | :--- |
| 1 | "Expo Go diz que o projeto é SDK 57" | O Metro estava rodando na cópia antiga `~/Projetos/frontend-ifam` (SDK 57). O projeto certo, `ifam-web/frontend-ifam`, já estava no SDK 58. Bastou subir o Metro na pasta certa com `npx expo start -c`. |
| 2 | "Pode apagar a pasta antiga" | Conferido antes: sem alteração pendente, sem stash, `main` e `develop` iguais ao remoto. Apagada. |
| 3 | "A safe area não funciona" | Commit `6a4c25d`: `paddingTop` com a altura da barra de status no Android (decisão 16). |
| 4 | "Muita informação o tempo todo" | Commit `1ca5380`: cabeçalho, card, alerta, chips e banner mais curtos (decisão 17). |
| 5 | "Adicione a feature de search" | Commit `be14310`: busca por texto no aparelho, 4 testes novos (decisões 18 e 19). |
| 6 | O usuário precisou desligar o computador | Código commitado; a documentação ficou para o dia seguinte. |
| 7 | Entre as sessões | O próprio aluno commitou o upgrade para o Expo 58 (`f40cfd5`) e o IP do Metro no `api.js` (`ed0ee15`). |
| 8 | Documentação pendente | Commit `a9dd002` (README do front), seção 8 das decisões do front, etapa 4 no registro do grupo e este arquivo. |
| 9 | "Roteiro de perguntas que o professor pode fazer" | `roteiro_perguntas_defesa_RF-LAB05.md`, focado em fluxo, arquitetura e "o que acontece se eu apertar aqui". |
| 10 | "Copie o código e crie um repositório no GitHub" | Pasta de estudo `~/Projetos/ifam-rf-lab05-estudo` publicada como repositório **privado** no GitHub (ver seção 3). |

---

## 2. Como a tela ficou

```
‹ Aprovações de Laboratório                    (3)
[ 🔍 Buscar por docente, disciplina, laboratório... ]
( Todos ) ( Pontual ) ( Semestral )

┌──────────────────────────────────────────────┐
│ Pontual                     Bloco B - Sala 102│
│ Laboratório 01 - Redes e Infraestrutura       │
│ 28/08/2026 • Sexta-feira · 1º e 2º Tempo      │
│ Prof. Roberto Dias                            │
│ Segurança de Redes · TADS 4º Período · 28 alunos
│ Softwares: Wireshark, VirtualBox, Putty       │
│ [ Rejeitar ] [          Aprovar             ] │
└──────────────────────────────────────────────┘
```

Em conflito, entra a caixa vermelha "Conflito de horário neste laboratório"
antes dos botões, e o Aprovar fica cinza com "Aprovar (em conflito)".

---

## 3. Pasta e repositório de estudo

O repositório que o aluno já tinha no GitHub, `vsslvini/frontend-ifam`, é
**público**, só tem o front-end e está no estado de uma aula antiga (commit
`7a98e24`). Para não sobrescrever esse histórico, foi criado um repositório
separado e **privado** só para estudo:

| O quê | Onde |
| :--- | :--- |
| Pasta local | `~/Projetos/ifam-rf-lab05-estudo/` |
| Repositório | `github.com/vsslvini/ifam-rf-lab05-estudo` (privado) |
| Conteúdo | `frontend-ifam/` e `backend-ifam/` (cópia do código, sem `node_modules`, `.venv` e `.env`), `docs/`, `ROTEIRO_DEFESA.md` e `HISTORICO_COMMITS.md` |

A entrega oficial continua sendo a branch `feature/RF-LAB05` no Gitea do
IFAM. **Nada foi enviado ao Gitea**: push e PR lá continuam com o aluno.

Para rodar o código em outra máquina:

```bash
git clone https://github.com/vsslvini/ifam-rf-lab05-estudo.git
cd ifam-rf-lab05-estudo/frontend-ifam && npm install && npx expo start -c
cd ../backend-ifam && python -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env && .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Sem PostgreSQL na máquina, use `USE_IN_MEMORY_REPO=true` no `.env`. Sem o
back-end rodando, o app cai sozinho no mock.

---

## 4. Pendências

* Conferir no celular o layout novo e a barra de status.
* Abrir o PR de `feature/RF-LAB05` para `develop` no Gitea, que agora inclui
  as etapas 3 e 4 e os dois commits de ambiente do aluno.
* Quando o React Navigation entrar, trocar o `paddingTop` da decisão 16 pelo
  `react-native-safe-area-context`.
