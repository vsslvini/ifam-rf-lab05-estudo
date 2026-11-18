# Sessão de 07/10/2026 — Ambiente, Persistência e Verificação da `develop`

**Equipe 16** — Jhuliano e Vinicius · **Requisito:** RF-LAB05

Registro de tudo o que foi feito e decidido nesta sessão, para estudo
posterior (diretriz: *"todas as alterações devem ser registradas em /docs"*).
Os detalhes técnicos de cada decisão estão nos documentos de cada camada:

* `RF-LAB05_backend_decisoes.md` — seção 6 (etapa 2: PostgreSQL, decisões 11–15)
* `RF-LAB05_frontend_decisoes.md` — seção 6 (verificação na `develop`)
* `grupo16_RF-LAB05_registro.md` — índice geral, situação dos PRs, autoria

---

## 1. Linha do tempo

| # | O que foi feito | Resultado |
| :--- | :--- | :--- |
| 1 | Leitura de `/docs` e configuração do back-end (`pip install`, `.env` a partir do `.env.example`) | 32 testes passando; API no ar em modo memória |
| 2 | Configuração do front-end (`npm install`) | App compila para web; CORS da API libera `localhost:8081` |
| 3 | Constatação: `Dockerfile` vazio e **nenhum banco ligado** (repositório em memória por decisão de projeto) | — |
| 4 | Persistência em PostgreSQL no back-end | Commit `0b16479` em `feature/RF-LAB05`, **sem push** |
| 5 | E-mail dos commits trocado para o institucional nos dois repositórios | Commit `0b16479` refeito com `2024006157@ifam.edu.br` |
| 6 | Verificação de merge | Front-end **mergeado** (PR #27); back-end **não** (PR #5) |
| 7 | Erro `PluginError: expo-camera` ao rodar o front-end | Causa: checkout acidental em `feature/RF-EQ06` |
| 8 | Teste visual na `develop` | Tela funciona; abre direto nela, sem Login/Hub/Menu antes |

---

## 2. Back-end — persistência (etapa 2)

**Prazo:** o back-end ainda **não tem deadline**. A entrega cobrada agora é só
o front-end funcionando.

**O que entrou** (commit `0b16479`, só local):

* `docker-compose.yml` com `postgres` (16-alpine) e `api`; `Dockerfile`
  preenchido (idêntico ao da branch da Equipe do Core, `feature/rf-02-v2`);
* `SqlAlchemyAlocacaoRepository`, escolhido por `USE_IN_MEMORY_REPO` no `.env`;
* `app/seed.py`: cria schema e dados da demonstração na subida da API;
* ENUMs passaram a gravar o valor do DDL (`Em_Uso`), não o nome (`EM_USO`);
* tabela `usuarios` declarada fiel ao DDL, só para a FK;
* testes HTTP rodam nas duas implementações: 57 execuções.

**Situação do PR #5 na `develop`:** não mergeado. Depois dele entraram o
RF-LAB03 (#8, grade de horários) e o RF-CORE03 (#6, notificações). Um merge
simulado aponta **3 conflitos**: `.gitignore`, `app/models/laboratorios.py`
(classes `GradeHorario`/`Alocacao` do RF-LAB03 × as nossas) e
`app/schemas/laboratorios.py` (o RF-LAB03 recriou o arquivo ao lado da pasta
`laboratorios/` — o mesmo problema da decisão 10). Fica para quando o
back-end tiver prazo.

---

## 3. Fluxo Git combinado

1. A feature mergeada em `develop` é considerada **finalizada**.
2. Para alterar algo depois disso: `git switch develop && git pull`, depois
   `git checkout -b <nome do requisito>` (ex.: `feature/RF-LAB05`).
3. Ao terminar, abrir PR para `develop`.
4. Push e PR são feitos pelo aluno.

**E-mail:** `git config user.email 2024006157@ifam.edu.br` aplicado
**localmente** em `backend-ifam` e `frontend-ifam` (o global da máquina
continua com o pessoal). Só commits com o e-mail cadastrado no Gitea contam no
perfil. Os 11 commits antigos seguem com o e-mail pessoal; cadastrá-lo como
secundário no Gitea resolve sem reescrever histórico.

**Observação:** o commit `0b16479` está em `feature/RF-LAB05` do back-end, que
ainda tem o PR #5 aberto — por isso ele entra no mesmo PR, sem branch nova.

---

## 4. Incidente: `PluginError: expo-camera`

```
PluginError: Failed to resolve plugin for module "expo-camera" ...
```

* **Causa:** o reflog mostrou `develop → feature/RF-EQ06` (outra equipe),
  provavelmente autocompletar. O `app.json` dessa branch declara o plugin
  `expo-camera`, mas o `package.json` dela não instala o pacote.
* **Correção:** `git switch develop` + `npm install`.
* **Lição:** antes de rodar, conferir `git branch --show-current`; ao trocar
  de branch no front-end, rodar `npm install` (o `package.json` muda).

---

## 5. Verificação visual na `develop` — o que dizer na apresentação

O app abre **direto** na tela de aprovações. No protótipo (`seq_04`,
seção 3) o caminho é **Login → Hub de Módulos → Menu de Laboratórios →
Aprovações**, mas essas telas não estão integradas na `develop`:

| Tela | Requisito | Situação |
| :--- | :--- | :--- |
| Login + `AppNavigator` | RF-CORE01 | Em `feature/rf-02-v2`, não mergeado |
| Hub de Módulos | RF-CORE04 | Mergeado, mas não ligado ao `App.js` |
| Menu de Laboratórios | Hub do Módulo 2 | Não existe em `src/` |
| Navigators | Navegação | Placeholders vazios |

**Decisão:** não mexer — é escopo de outras equipes. O `App.js` usa o seletor
`TELAS` (decisão 7 do front-end) para abrir a tela de `expo.extra.telaInicial`,
e a nossa tela já expõe `onBackToMenu` como ponto de ligação com o Menu de
Laboratórios.

**Roteiro sugerido na apresentação:**

1. Explicar que a navegação global ainda não foi integrada e por quê (tabela acima).
2. Fila com três pedidos; o do Blender com alerta vermelho e o concorrente listado (RN04).
3. **Aprovar** o Blender → recusado pelo conflito (`409`).
4. **Rejeitar** sem justificativa → bloqueado (RN05); com justificativa → sai da fila.
5. **Aprovar** o pedido de Redes → aprovado e notificação disparada.
6. (Opcional) derrubar a API e mostrar o modo offline com o mock.

Antes de repetir a demonstração com o banco ligado:
`python -m app.seed --recriar` no back-end.

---

## 6. Comandos para rodar (fish)

```fish
# Terminal 1 — back-end (branch feature/RF-LAB05)
cd ~/Projetos/ifam-web/backend-ifam
docker compose up -d postgres
source .venv/bin/activate.fish
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000   # Swagger em /docs

# Terminal 2 — front-end (branch develop)
cd ~/Projetos/ifam-web/frontend-ifam
npm install
npx expo start                                             # w = navegador
```

| Situação | Comando |
| :--- | :--- |
| Sem Docker | `USE_IN_MEMORY_REPO=true` no `.env` do back-end |
| Voltar os dados da demo | `python -m app.seed --recriar` |
| Banco + API em container | `docker compose up --build` (parar o uvicorn local antes) |
| Apagar o banco | `docker compose down -v` |
| Celular com Expo Go | `apiBaseUrl` no `app.json` com o IP da máquina |
