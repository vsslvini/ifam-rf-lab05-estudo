# Design System Institucional (Manual IFAM - Versão 2)

## 🎨 1. Paleta de Cores Oficial

A paleta de cores do sistema foi desenvolvida com base no Manual de Identidade Visual do IFAM, garantindo contraste adequado, acessibilidade visual e identificação institucional clara.

### Cores Primárias e Institucionais
* **Verde IF (`#2F9E41`):** Cor primária da instituição. Aplicada em cabeçalhos principais, botões de ação prioritária (CTAs), badges de status positivo (*Disponível, Aprovado, Concluído*) e confirmações.
* **Verde Claro de Fundo (`#E8F5E9`):** Utilizado em fundos de badges e tags de status de sucesso.

### Cores de Alerta e Atenção
* **Vermelho IF (`#CD191E`):** Alerta crítico. Utilizado em botões de exclusão/rejeição, status de erro (*Atrasado, Rejeitado, Manutenção/Defeito*) e avisos de bloqueio de conta.
* **Vermelho Claro de Fundo (`#FFEBEE`):** Utilizado em fundos de alertas e badges de erro.
* **Amarelo IF (`#FFC107`):** Atenção / Pendência. Utilizado em botões de teste, badges de status (*Pendente, Emprestado, Em Breve*) e avisos informativos.
* **Amarelo Claro de Fundo (`#FFF8E1`):** Fundos de caixas de aviso e lembretes preventivos.

### Cores de Módulos Específicos
* **Azul Institucional (`#1976D2`):** Destaque temático do **Módulo 2 (Laboratórios de Informática)**, utilizado em chips de categorias técnicas, tags de softwares e gráficos de ocupação.
* **Azul Claro de Fundo (`#E3F2FD`):** Fundos de cartões informativos de laboratórios.

### Cores Neutras (Fundo, Superfícies e Tipografia)
* **Fundo da Aplicação:** `#F5F5F5` (Cinza claro neutro para conforto visual).
* **Superfície de Cards / Inputs:** `#FFFFFF` (Branco puro).
* **Bordas e Divisores:** `#E0E0E0` (Cinza claro sutil).
* **Texto Principal / Títulos:** `#000000` (Preto puro para máxima legibilidade).
* **Texto Secundário / Legendas:** `#757575` (Cinza médio neutro).
* **Texto Escuro / Subtítulos:** `#333333` (Cinza chumbo).

---

## 📐 2. Padrões de Layout e Componentes (UX/UI)

### A. Layout Flexbox com Badges em Coluna
* Em cabeçalhos de cards complexos (como aprovações e listagem de recursos), os *badges* de status são posicionados em **coluna (vertical)** acima dos nomes ou organizados em linha superior dedicada. Isso impede a quebra de linha de títulos longos e mantém a interface alinhada e limpa.

### B. Componentes Nativos
* **Data e Hora:** Adoção do `@react-native-community/datetimepicker` para garantir seletores nativos de calendário e relógio (iOS spinner e Android dialog).
* **Scanner de QR Code:** Visor estilizado com cantos demarcadores na cor Verde IFAM (`#2F9E41`) e suporte a inserção manual por código hash.

### C. Sistema de Elevação e Sombras (Multiplataforma)
Para garantir consistência visual perfeita em Android e iOS:
```javascript
shadow: Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  android: {
    elevation: 2,
  },
})
```

### D. Formas e Arredondamentos
* **Cards Principais:** Raio de borda de `12px` a `14px`.
* **Botões e Inputs:** Raio de borda de `8px`.
* **Chips e Tags de Filtro:** Raio de borda de `16px` (formato pílula).
* **Badges de Status:** Raio de borda de `6px` a `8px`.