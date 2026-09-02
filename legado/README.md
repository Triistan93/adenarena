# 📦 Pasta de Arquivos Legados (Apenas para Consulta)

Esta pasta reúne arquivos históricos, mockups antigos e scripts pontuais de migração/auditoria que **não fazem mais parte do bundle de execução do jogo**.

Eles foram preservados aqui exclusivamente para consultas e referências de implementação, mantendo as pastas de código ativas (`src/`, `lineage-idle/`, `public/`) 100% limpas, funcionais e sem arquivos mortos.

---

## 📁 Conteúdo desta Pasta

### 1. `lineage-idle/`
- **`index.html`**: Antigo mockup HTML estático do cliente standalone de *Lineage Idle*.
  - **Onde fica o HTML ativo hoje?** O HTML oficial que o React monta na tela vive em `src/idle/markup.ts`.
- **`public/`**: Cópia antiga de assets duplicados da época em que a engine rodava isolada sem o Vite.
  - **Onde ficam os assets ativos hoje?** Todos os assets estáticos oficiais ficam em `public/` na raiz do projeto.
- **`docs/`**: Catálogo antigo de prompts de habilidades (`skills_prompt_catalog.md`).

### 2. `implemented_doc.md`
- Notas e registros históricos de uma refatoração anterior do projeto.

### 3. `scripts/`
- **`sync-icons.js`**: Script antigo que gerava o bloco de ícones para um arquivo de itens monolítico pré-modularização.
- **`validate-icons.js`**: Script validador antigo de chaves de ícones.

### 4. `scratch/`
- Conjunto de ~90 scripts pontuais de testes de migração, auditorias de balanceamento e verificações de árvores de classes criados durante as fases de desenvolvimento.

---

> [!NOTE]
> Para editar o jogo ativo, consulte o [README principal](../../README.md) na raiz do projeto.
