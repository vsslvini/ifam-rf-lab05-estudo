# Demonstração da equipe 2 no Expo Snack

Este Snack reutiliza as telas originais do professor presentes em `ifam-plataforma-multimodulos/screen/`. A única adição é a troca entre Hub e Central, necessária para demonstrar os dois requisitos no mesmo projeto Snack.

1. Acesse [snack.expo.dev](https://snack.expo.dev/) no computador e escolha **New Snack**.
2. No Snack, mantenha `App.js` e crie dois arquivos na raiz: `hub_modulos_screen.js` e `perfil_notificacoes_screen.js`.
3. Copie os arquivos desta pasta para os nomes equivalentes no Snack:
   - `equipe2_core03_core04_snack.js` → `App.js`;
   - `hub_modulos_screen.js` → `hub_modulos_screen.js`;
   - `perfil_notificacoes_screen.js` → `perfil_notificacoes_screen.js`.
4. Clique em **Run on device** e escaneie o QR Code no aplicativo Expo Go do celular.

O Snack demonstra os dois requisitos da equipe 2:

- **RF-CORE04:** Hub com perfil, alternador de perfil, módulos e atalhos contextuais;
- **RF-CORE03:** Central com os alertas e marcação local de leitura.

Os dados e a leitura são simulados e duram somente enquanto a demonstração está aberta. A API FastAPI, JWT, banco SQLite/PostgreSQL e navegação global continuam sendo validados na entrega modular, fora do Snack.
