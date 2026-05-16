# Guia de Integração Frontend — Fábrica Gestão SaaS

> **Para:** Time de Frontend
> **Versão da API:** v1
> **Base URL:** `http://localhost:3000/api/v1`
> **Documentação interativa (Swagger):** `http://localhost:3000/docs`

---

## Índice

1. [O que mudou](#1-o-que-mudou)
2. [Autenticação](#2-autenticação)
3. [Cadastro público](#3-cadastro-público-nova-tela)
4. [Controle de acesso por perfil](#4-controle-de-acesso-por-perfil)
5. [Painel do Administrador do Tenant](#5-painel-do-administrador-do-tenant)
6. [Painel da Plataforma (super_admin)](#6-painel-da-plataforma-super_admin)
7. [Rotas operacionais — sem mudança](#7-rotas-operacionais--sem-mudança)
8. [Informações do tenant no header](#8-informações-do-tenant-no-header)
9. [Novas telas a criar](#9-resumo-das-novas-telas-a-criar)
10. [Fluxo completo de onboarding](#10-fluxo-completo-de-onboarding)
11. [Variáveis de ambiente](#11-variáveis-de-ambiente)

---

## 1. O que mudou

O sistema foi convertido para multi-tenant (SaaS). Cada cliente tem uma conta isolada — dados de uma empresa nunca aparecem para outra.

**O que o frontend precisa lidar:**

1. **Fluxo de cadastro público** — tela de registro PF/PJ
2. **Novos códigos de erro** — 402 (trial expirado) e novos 403
3. **Painel de administrador do tenant** — gerenciar usuários da própria conta
4. **Painel de super admin** — exclusivo para operação da plataforma

> **O que NÃO mudou:** todas as rotas operacionais existentes (vendas, produção, estoque, compras, fórmulas, relatórios) têm **exatamente a mesma URL e formato de resposta**. Nenhum campo `empresa_id` precisa ser enviado pelo frontend — ele é extraído automaticamente do token JWT.

---

## 2. Autenticação

### 2.1 Login — `POST /auth/login`

O login é feito com **e-mail + senha**. Não há campo de empresa — o e-mail é único em toda a plataforma.

**Request:**
```json
{
  "email": "usuario@empresa.com",
  "senha": "minhasenha"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "empresa_id": 3,
    "nome": "Maria Silva",
    "email": "maria@empresa.com",
    "perfil": "admin",
    "ativo": true,
    "ultimo_acesso": "2026-05-15T10:30:00.000Z"
  }
}
```

**Campo `perfil`** pode ser: `super_admin`, `admin`, `operador` ou `comprador`.

**Como usar o token:** `Authorization: Bearer <token>` em todas as requisições autenticadas.

**Após o login, guarde no estado global:**
- `token` → para o header Authorization
- `usuario.perfil` → para controlar quais menus/telas exibir
- `usuario.empresa_id` → para saber se é super_admin (`empresa_id = null`) ou tenant

---

### 2.2 Outros endpoints de autenticação

| Método | URL | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Login com e-mail e senha |
| `POST` | `/auth/logout` | Encerra a sessão (registra log) |
| `GET` | `/auth/me` | Retorna dados do usuário autenticado |
| `PUT` | `/auth/me/senha` | Altera senha do próprio usuário |

**Alterar senha — `PUT /auth/me/senha`:**
```json
{
  "senha_atual": "senhaAtual",
  "nova_senha": "novaSenha123"
}
```

---

### 2.3 Erros globais que o frontend deve tratar

Adicione um interceptor HTTP para capturar:

| Código | Quando acontece | O que mostrar |
|---|---|---|
| `401` | Token inválido ou expirado | Redirecionar para login |
| `402` | Trial do tenant expirado | Tela "Seu período gratuito acabou — faça upgrade" |
| `403` | Perfil sem permissão | Toast "Acesso negado" ou redirecionar |

**Exemplo com Axios:**
```js
axios.interceptors.response.use(null, (error) => {
  const status = error.response?.status;
  if (status === 401) router.push('/login');
  if (status === 402) router.push('/plano-expirado');
  if (status === 403) toast.error('Acesso negado.');
  return Promise.reject(error);
});
```

---

## 3. Cadastro público (nova tela)

Tela de registro acessível sem login. Cria o tenant + usuário administrador + categorias padrão em uma única chamada. Retorna JWT para entrar direto no sistema.

### `POST /register`

**Pessoa Física (PF):**
```json
{
  "tipo": "pf",
  "cpf": "12345678901",
  "nome": "Maria Silva",
  "email_contato": "maria@email.com",
  "telefone": "11999998888",

  "admin_nome": "Maria Silva",
  "admin_email": "maria@email.com",
  "admin_senha": "senha123"
}
```

**Pessoa Jurídica (PJ):**
```json
{
  "tipo": "pj",
  "cnpj": "12345678000195",
  "razao_social": "Cosméticos da Maria LTDA",
  "nome_fantasia": "Marca Maria",
  "email_contato": "contato@marca.com",
  "telefone": "11999998888",

  "admin_nome": "Maria Silva",
  "admin_email": "admin@marca.com",
  "admin_senha": "senha123"
}
```

**Response 201:**
```json
{
  "message": "Conta criada com sucesso. Você tem 30 dias de trial gratuito.",
  "token": "eyJ...",
  "usuario": { "id": 1, "nome": "Maria Silva", "perfil": "admin", "empresa_id": 1 },
  "tenant": { "id": 1, "nome": "Marca Maria", "plano": "trial", "trial_expira": "2026-06-14" }
}
```

> Após o registro bem-sucedido, salve o token e redirecione para o dashboard — o usuário já está autenticado.

**Erros possíveis:**
```json
// 400 — validação
{ "error": "CPF deve ter 11 dígitos." }
{ "error": "CNPJ deve ter 14 dígitos." }

// 409 — e-mail já cadastrado
{ "error": "Este e-mail já está em uso." }
```

---

## 4. Controle de acesso por perfil

Use o campo `perfil` do usuário logado para mostrar/ocultar menus:

| Perfil | empresa_id | O que acessa |
|---|---|---|
| `super_admin` | `null` | Tudo, incluindo o painel da plataforma |
| `admin` | número | Painel admin do tenant + operações normais |
| `operador` | número | Operações normais completas |
| `comprador` | número | Apenas compras e matérias-primas |

**Exemplo de guard de rota:**
```js
const perfisPermitidos = {
  '/admin/usuarios':    ['admin', 'super_admin'],
  '/admin/minha-conta': ['admin', 'super_admin'],
  '/admin/logs':        ['admin', 'super_admin'],
  '/platform':          ['super_admin'],
  // demais rotas: todos os autenticados com empresa_id
};
```

---

## 5. Painel do Administrador do Tenant

Rotas acessíveis apenas com `perfil === 'admin'` (e `super_admin`).

### 5.1 Gerenciar usuários da empresa

| Método | URL | Descrição |
|---|---|---|
| `GET` | `/admin/usuarios` | Lista usuários do tenant |
| `POST` | `/admin/usuarios` | Cria novo usuário |
| `PUT` | `/admin/usuarios/:id` | Edita nome, e-mail, perfil |
| `PATCH` | `/admin/usuarios/:id/senha` | Redefine senha do usuário |
| `PATCH` | `/admin/usuarios/:id/toggle-ativo` | Ativa/desativa usuário |

**Criar usuário — `POST /admin/usuarios`:**
```json
{
  "nome": "João Operador",
  "email": "joao@empresa.com",
  "senha": "senha123",
  "perfil": "operador"
}
```
> `perfil` aceita: `admin`, `operador`, `comprador`. Não é possível criar `super_admin` por aqui.

**Editar usuário — `PUT /admin/usuarios/:id`:**
```json
{
  "nome": "João da Silva",
  "perfil": "comprador",
  "ativo": true
}
```

**Redefinir senha — `PATCH /admin/usuarios/:id/senha`:**
```json
{ "nova_senha": "novaSenha123" }
```

**Response de toggle ativo:**
```json
{ "ativo": false }
```

---

### 5.2 Dados da conta (tenant)

| Método | URL | Descrição |
|---|---|---|
| `GET` | `/admin/tenant` | Retorna dados do próprio tenant |
| `PUT` | `/admin/tenant` | Atualiza dados do tenant |

**Retorno do `GET /admin/tenant`:**
```json
{
  "id": 3,
  "tipo": "pj",
  "nome": "Cosméticos da Maria",
  "nome_fantasia": "Marca Maria",
  "email_contato": "contato@marca.com",
  "telefone": "11999998888",
  "plano": "trial",
  "trial_expira": "2026-06-14",
  "ativo": true
}
```

**Atualizar — `PUT /admin/tenant`:**
```json
{
  "nome": "Novo Nome da Empresa",
  "nome_fantasia": "Nova Marca",
  "email_contato": "novo@email.com",
  "telefone": "11988887777"
}
```

---

### 5.3 Logs de auditoria do tenant

`GET /admin/logs`

**Query params disponíveis:**

| Param | Tipo | Exemplo |
|---|---|---|
| `acao` | string | `login`, `criar`, `atualizar`, `deletar`, `confirmar`, `cancelar` |
| `entidade` | string | `Venda`, `MateriaPrima`, `Usuario` |
| `usuario_id` | number | `2` |
| `data_inicio` | date | `2026-05-01` |
| `data_fim` | date | `2026-05-31` |
| `limit` | number | `50` (máx 200) |
| `offset` | number | `0` |

**Response:**
```json
{
  "total": 143,
  "logs": [
    {
      "id": 1001,
      "acao": "confirmar",
      "entidade": "Venda",
      "entidade_id": 42,
      "usuario_nome": "Maria Silva",
      "dados_anteriores": { "status": "rascunho" },
      "dados_novos": { "status": "confirmada" },
      "ip": "192.168.1.10",
      "created_at": "2026-05-15T14:30:00.000Z"
    }
  ]
}
```

---

## 6. Painel da Plataforma (super_admin)

Acessível **somente** com `perfil === 'super_admin'` (`empresa_id` é `null` no token). Usado pela equipe de operação da plataforma.

### 6.1 Gerenciar tenants

| Método | URL | Descrição |
|---|---|---|
| `GET` | `/platform/tenants` | Lista todos os tenants |
| `GET` | `/platform/tenants/:id` | Detalhes + usuários do tenant |
| `POST` | `/platform/tenants` | Cria novo tenant + admin inicial |
| `PUT` | `/platform/tenants/:id` | Edita dados do tenant |
| `PATCH` | `/platform/tenants/:id/suspender` | Ativa/suspende tenant |

**Criar tenant — `POST /platform/tenants`:**
```json
{
  "tipo": "pj",
  "documento": "12345678000195",
  "nome": "Cosméticos da Maria LTDA",
  "nome_fantasia": "Marca Maria",
  "email_contato": "contato@marca.com",
  "telefone": "11999998888",
  "plano": "basico",
  "trial_expira": null,

  "admin_nome": "Maria Admin",
  "admin_email": "maria@marca.com",
  "admin_senha": "senhaTemp123"
}
```

**Query params para listagem:**
- `?ativo=true` — filtra por ativos/inativos
- `?plano=trial` — filtra por plano (`trial`, `basico`, `profissional`)

**Response de suspender:**
```json
{ "ativo": false }
```

---

### 6.2 Gerenciar usuários (visão global)

| Método | URL | Descrição |
|---|---|---|
| `GET` | `/platform/usuarios` | Lista todos os usuários |
| `POST` | `/platform/usuarios` | Cria usuário (qualquer perfil, incluindo super_admin) |
| `PATCH` | `/platform/usuarios/:id/toggle-ativo` | Ativa/desativa |

**Criar usuário — `POST /platform/usuarios`:**
```json
{
  "nome": "Novo Admin",
  "email": "novo@empresa.com",
  "senha": "senha123",
  "perfil": "admin",
  "empresa_id": 5
}
```
> Para criar `super_admin`, omita `empresa_id` ou envie `null`.

**Query params para listagem:**
- `?empresa_id=5` — filtra por tenant
- `?perfil=admin` — filtra por perfil

---

### 6.3 Logs globais

`GET /platform/logs`

**Query params:**

| Param | Tipo | Descrição |
|---|---|---|
| `empresa_id` | number | Filtra por tenant |
| `usuario_id` | number | Filtra por usuário |
| `acao` | string | Tipo da ação |
| `entidade` | string | Entidade afetada |
| `data_inicio` | date | A partir de |
| `data_fim` | date | Até |
| `limit` | number | Máx 500 (padrão 100) |
| `offset` | number | Paginação |

**Response:**
```json
{
  "total": 5432,
  "logs": [ ... ]
}
```

---

## 7. Rotas operacionais — sem mudança

Todas as rotas abaixo **não mudaram de URL nem de formato**. O `empresa_id` é injetado automaticamente pelo backend via JWT. O frontend não precisa enviar nenhum campo adicional.

| Prefixo | Módulo |
|---|---|
| `/fornecedores` | Fornecedores |
| `/materias-primas` | Matérias-primas |
| `/compras` | Pedidos de compra |
| `/formulas` | Fórmulas |
| `/producao` | Ordens de produção |
| `/produtos` | Produtos acabados |
| `/vendas` | Vendas |
| `/clientes` | Clientes |
| `/relatorios` | Relatórios |
| `/backup` | Backup/restore |
| `/auth` | Autenticação (ver seção 2) |

> A documentação completa e interativa de todos esses endpoints está disponível em **`http://localhost:3000/docs`**.

---

## 8. Informações do tenant no header

Após o login, busque os dados do tenant para exibir no header (nome, plano, dias de trial):

```
GET /admin/tenant
Authorization: Bearer <token>
```

Use `trial_expira` para mostrar um banner de aviso quando restarem poucos dias:

```js
const diasRestantes = Math.ceil(
  (new Date(tenant.trial_expira) - new Date()) / 86_400_000
);

if (tenant.plano === 'trial' && diasRestantes <= 7) {
  showBanner(`Seu trial expira em ${diasRestantes} dias. Faça upgrade.`);
}
```

> Esse endpoint retorna 403 para usuários `super_admin` (que não possuem tenant). Verifique `usuario.empresa_id !== null` antes de fazer a chamada.

---

## 9. Resumo das novas telas a criar

| Tela | Rota sugerida | Acesso |
|---|---|---|
| Cadastro / registro | `/register` | Público |
| Plano expirado | `/plano-expirado` | Público (redirecionado pelo 402) |
| Gerenciar usuários do tenant | `/admin/usuarios` | `admin` |
| Dados da minha conta | `/admin/minha-conta` | `admin` |
| Logs de auditoria | `/admin/logs` | `admin` |
| Painel de plataforma — tenants | `/platform/tenants` | `super_admin` |
| Painel de plataforma — usuários | `/platform/usuarios` | `super_admin` |
| Painel de plataforma — logs | `/platform/logs` | `super_admin` |

---

## 10. Fluxo completo de onboarding

```
1. Usuário acessa /register
2. Escolhe tipo (PF ou PJ) e preenche os dados
3. POST /register → recebe { token, usuario, tenant }
4. Salva token, redireciona para /dashboard
5. Dashboard faz GET /admin/tenant para exibir nome e banner de trial
6. Admin pode ir em /admin/usuarios para convidar colaboradores
7. Colaboradores recebem e-mail com credenciais e fazem login normalmente
```

---

## 11. Variáveis de ambiente

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Fábrica Gestão
```
