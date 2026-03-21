# Fábrica Gestão — API

API REST para gestão de uma pequena fábrica de **sabonetes, tinturas de ervas e pomadas**.

Cobre todo o ciclo produtivo: compra de matérias-primas → estoque → fórmulas → ordens de produção → produtos acabados.

---

## Stack

- **Node.js** 20+
- **Express** — framework HTTP
- **Sequelize** — ORM
- **MySQL** 8+ — banco de dados
- **JWT** — autenticação
- **Swagger/OpenAPI** — documentação interativa

---

## Pré-requisitos

- Node.js 20+
- MySQL 8+

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/aduranti/fabrica-gestao-svr.git
cd fabrica-gestao-svr

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais MySQL
```

### Variáveis de ambiente (`.env`)

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=fabrica_gestao
DB_USER=root
DB_PASSWORD=sua_senha

JWT_SECRET=seu_segredo_jwt
JWT_EXPIRES_IN=8h

CORS_ORIGIN=http://localhost:8080
```

---

## Banco de dados

```bash
# Crie o banco no MySQL
mysql -u root -p -e "CREATE DATABASE fabrica_gestao;"

# Execute as migrations
npm run db:migrate

# Popule os dados iniciais (admin, unidades, categorias)
npm run db:seed
```

**Credenciais iniciais:** `admin@fabrica.com` / `admin123`

---

## Executando

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

O servidor sobe em `http://localhost:3000`.

---

## Documentação da API

Acesse a UI do Swagger após iniciar o servidor:

```
http://localhost:3000/docs
```

Para autenticar nos endpoints protegidos:
1. Use `POST /api/v1/auth/login` para obter o token JWT
2. Clique em **Authorize** no topo da página
3. Informe `Bearer <seu_token>`

O spec OpenAPI em JSON está disponível em `/docs.json`.

---

## Endpoints principais

| Módulo | Base URL |
|--------|----------|
| Autenticação | `POST /api/v1/auth/login` |
| Usuários | `/api/v1/usuarios` |
| Fornecedores | `/api/v1/fornecedores` |
| Matérias-Primas | `/api/v1/materias-primas` |
| Compras | `/api/v1/compras` |
| Fórmulas | `/api/v1/formulas` |
| Produção | `/api/v1/producao` |
| Produtos | `/api/v1/produtos` |

---

## Módulos

### Matérias-Primas
- Cadastro com categoria e unidade de medida
- Controle de estoque mínimo e máximo
- Histórico de movimentações
- Ajuste manual de estoque
- Alertas de estoque abaixo do mínimo

### Compras
- Pedidos de compra com múltiplos itens
- Fluxo: `rascunho → enviado → recebido`
- Recebimento parcial ou total
- **Atualização automática do estoque** com custo médio ponderado

### Fórmulas (Receitas)
- Suporte a sabonetes, tinturas e pomadas
- Ingredientes com fase de adição (aquosa, oleosa, esfriamento, final)
- **Versionamento automático** a cada alteração
- Cálculo de custo de produção em tempo real

### Produção
- Ordens de produção com validação de estoque
- Fluxo: `planejada → em_produção → concluída`
- **Baixa automática no estoque** de matérias-primas ao concluir
- Entrada automática no estoque de produto acabado
- Rastreabilidade por lote

### Produtos
- Vinculados às fórmulas de produção
- Histórico de lotes com data de fabricação e validade
- Alertas de estoque mínimo

---

## Scripts disponíveis

```bash
npm run dev              # Inicia em modo desenvolvimento
npm start                # Inicia em modo produção
npm run db:migrate       # Executa migrations
npm run db:migrate:undo  # Reverte última migration
npm run db:seed          # Popula dados iniciais
npm run db:reset         # Reset completo do banco
npm test                 # Executa testes
```

---

## Regras de negócio

- **Custo médio ponderado** — recalculado automaticamente a cada entrada de MP
- **Validação de estoque** — ao criar ordem de produção, verifica disponibilidade de todos os insumos
- **Versionamento de fórmulas** — cada alteração preserva o histórico completo
- **Rastreabilidade** — cada produto acabado sabe de qual ordem e quais MPs foi feito
- **Perfis de acesso** — `admin`, `operador` e `comprador` com permissões distintas
