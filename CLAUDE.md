# fabrica-gestao-svr — Guia de Contexto

Sistema de gestão para fábrica de cosméticos artesanais (sabonetes, tinturas, pomadas).
API REST em Node.js/Express com MySQL via Sequelize.

## Stack

- **Runtime:** Node.js + Express 5
- **ORM:** Sequelize 6 + sequelize-cli para migrations
- **Banco:** MySQL 2
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Validação:** Joi
- **Docs:** Swagger UI (`/docs`)
- **Testes:** Jest + Supertest (scripts: `npm test`)
- **Dev:** nodemon (`npm run dev`)

## Estrutura de módulos

```
src/
  config/         → app.js, database.js, swagger.js
  middlewares/    → auth.js (JWT), permissions.js, errorHandler.js
  models/         → Sequelize models (index.js registra todos)
  migrations/     → 001..013 (sequencial)
  seeders/        → dados iniciais (categorias, usuário admin)
  modules/
    auth/         → login, refresh
    usuarios/
    fornecedores/
    materias-primas/
    compras/      → pedidos de compra, recebimento (custo médio)
    formulas/     → fórmulas com versão e ingredientes
    producao/     → ordens de produção, baixa de estoque MP, lotes
    produtos/     → produtos acabados, lotes
    relatorios/   → queries SQL diretas (QueryTypes.SELECT)
    backup/       → dump mysqldump, histórico, download, restauração via upload
    vendas/       → CRUD + confirmar (baixa estoque) + cancelar (devolução)
    clientes/     → cadastro simples
  utils/
    custoMedio.js
    numerador.js  → gerarNumero (OP, VD...), gerarNumeroLote (turno A/B/C)
```

## Convenções importantes

- Toda rota protegida usa o middleware `auth` (injeta `req.usuario`)
- Operações que alteram múltiplas tabelas usam `sequelize.transaction()`
- Números de documentos gerados por `gerarNumero(Model, prefixo, campo)` — evita colisão com query `FOR UPDATE`-like
- Lotes de produção numerados como `YYYYMMDD-T-NNN` (T = turno A/B/C)
- Venda pode ter `cliente_id` (FK para tabela clientes) OU `cliente` (texto livre) — ambos são opcionais
- Confirmar venda dá baixa direta em `produtos.estoque_atual`; cancelar venda confirmada devolve o estoque

## Comandos úteis

```bash
npm run dev                    # sobe servidor com nodemon
npm run db:migrate             # roda migrations pendentes
npm run db:seed                # seeders (categorias + admin)
npm run db:reset               # undo all → migrate → seed
npm test                       # Jest (--runInBand --forceExit)
```

## Endpoints — visão geral

| Prefixo | Módulo |
|---|---|
| `/api/v1/auth` | login/token |
| `/api/v1/usuarios` | gestão de usuários |
| `/api/v1/fornecedores` | fornecedores |
| `/api/v1/materias-primas` | MP + movimentações |
| `/api/v1/compras` | pedidos de compra |
| `/api/v1/formulas` | fórmulas |
| `/api/v1/producao` | ordens de produção |
| `/api/v1/produtos` | produtos acabados / lotes |
| `/api/v1/relatorios` | relatórios (movimentações MP, produtos acabados, vendas) |
| `/api/v1/backup` | dump / restore |
| `/api/v1/vendas` | vendas |
| `/api/v1/clientes` | clientes |

---

## Histórico de sessões

### Sessão 2026-05-13 (`d3454a8 Novas funcionalidades`)

**O que foi feito:**
- Migration `011`: adicionou coluna `produto_id` em `ordens_producao`
- `producao/controller.js`: novo endpoint `vincularProduto` (PATCH `/:id/vincular-produto`) e `corrigirProdutoConcluida` (PATCH `/:id/corrigir-produto`) — permite associar produto a ordens que foram concluídas sem produto_id definido, recriando lote e atualizando estoque retroativamente
- `relatorios/controller.js`: adicionados `produtosAcabados` (resumo por produto + lotes) e `vendas` (detalhado por item + totalizadores + resumo por produto)
- `utils/numerador.js`: adicionado `gerarNumeroLote` com formato `YYYYMMDD-T-NNN`

### Sessão 2026-05-14 (`dc4b847 Adicionado modulo backup e modulo de vendas`)

**O que foi feito:**
- Módulo **vendas** completo: criar (rascunho), atualizar, confirmar (baixa estoque), cancelar (devolução se confirmada), excluir (só rascunho), listar, buscar por id
- Módulo **clientes**: CRUD básico (nome, CPF/CNPJ, telefone, email, endereço)
- Migrations `012` (vendas + venda_itens) e `013` (clientes) com FK entre vendas e clientes
- Módulo **backup**: gerar dump via `mysqldump`, listar histórico (últimos 50), download de arquivo, restauração via upload de `.sql` (`child_process.exec` com `mysql` CLI)
- Relatório de vendas integrado às novas tabelas

---

## Pendências e próximos passos

### Alta prioridade
- [ ] **Testes automatizados** — não há nenhum teste no projeto (apenas jest/supertest instalados). Começar pelos módulos mais críticos: vendas (confirmar/cancelar) e produção (concluir)
- [ ] **Documentação Swagger** — os novos módulos (vendas, clientes, backup, relatórios de vendas) não têm anotações JSDoc para o Swagger. Adicionar `@swagger` nos routes

### Funcionalidades pendentes
- [ ] **Relatório financeiro** — DRE simplificada: receitas (vendas confirmadas) × custos (compras + produção) por período
- [ ] **Dashboard** — endpoint `/api/v1/dashboard` com KPIs: faturamento do mês, estoque crítico (abaixo do mínimo), ordens em produção, últimas vendas
- [ ] **Paginação** — endpoints de listagem (vendas, clientes, matérias-primas) retornam tudo sem limite; adicionar `page`/`limit` nos principais
- [ ] **Permissões por módulo** — middleware `permissions.js` existe mas aparentemente não está sendo usado nas rotas de vendas/clientes/backup; revisar controle de acesso por perfil
- [ ] **Fluxo de caixa / recebimento de vendas** — atualmente a venda confirma imediatamente; considerar tabela de pagamentos (à vista, parcelado, status de recebimento)
- [ ] **Estoque de MP na baixa da venda** — a confirmação de venda baixa diretamente `produtos.estoque_atual` mas não gera `MovimentacaoEstoque`; criar registro de movimentação tipo `saida` com `origem_tipo = 'venda'`
- [ ] **Backup automático agendado** — o módulo de backup é manual; considerar cron com `node-cron`

### Bugs conhecidos / pontos de atenção
- O campo `cliente_id` na migração `012-create-vendas.js` não foi criado com `references` (FK sem constraint no banco); verificar se isso é intencional ou se falta adicionar a FK via migration
- `backup/routes.js` usa `child_process.exec` com mysql CLI — depende do `mysql` estar no PATH do servidor; documentar pré-requisito
