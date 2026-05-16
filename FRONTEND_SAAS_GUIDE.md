# Guia de Integração Frontend — Migração para SaaS

> **Para:** Time de Frontend  
> **Versão da API:** v1  
> **Base URL:** `http://localhost:3000/api/v1`

---

## Visão geral do que mudou

O sistema foi convertido para multi-tenant (SaaS). Cada cliente tem uma conta isolada — dados de uma empresa nunca aparecem para outra. O frontend precisa lidar com:

1. **Fluxo de cadastro público** (novo) — tela de registro PF/PJ
2. **Novos códigos de erro** — 402 (trial expirado) e novos 403
3. **Painel de administrador do tenant** — gerenciar usuários da própria conta
4. **Painel de super admin** — exclusivo para operação da plataforma

> **O que NÃO mudou:** todas as rotas operacionais existentes (vendas, produção, estoque, compras, fórmulas, relatórios) têm **exatamente a mesma URL e formato de resposta**. Nenhum campo `empresa_id` precisa ser enviado pelo frontend — ele é extraído automaticamente do token JWT.

---

## 1. Autenticação

### 1.1 Login — `POST /auth/login`

Sem mudança no request. A resposta agora inclui `empresa_id` e `perfil` expandido no payload do JWT.

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

**Novo campo `perfil`:** agora pode ser `super_admin`, `admin`, `operador` ou `comprador`.

**Como usar o token:** idêntico ao atual — `Authorization: Bearer <token>` em todas as requisições autenticadas.

**Após o login, guarde no estado global:**
- `token` → para o header Authorization
- `usuario.perfil` → para controlar quais menus/telas exibir
- `usuario.empresa_id` → para saber se é super_admin (empresa_id = null) ou tenant

---

### 1.2 Novos erros que o frontend deve tratar globalmente

Adicione um interceptor HTTP para capturar:

| Código | Quando acontece | O que mostrar |
|---|---|---|
| `401` | Token inválido/expirado | Redirecionar para login |
| `402` | Trial do tenant expirado | Tela de "Seu período gratuito acabou — faça upgrade" |
| `403` | Perfil sem permissão para a rota | Toast "Acesso negado" ou redirecionar |

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

## 2. Cadastro público (nova tela)

Tela de registro acessível sem login. Cria o tenant + usuário administrador + categorias padrão em uma única chamada. Retorna JWT para entrar direto no sistema.

### `POST /register`

**PF — Pessoa Física:**
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

**PJ — Pessoa Jurídica:**
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
  "usuario": { "id": 1, "nome": "Maria Silva", "perfil": "admin", ... },
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

## 3. Controle de acesso por perfil

Use o campo `perfil` do usuário logado para mostrar/ocultar menus:

```
super_admin  → vê tudo, incluindo o painel de plataforma
admin        → vê o painel de admin do tenant + operações normais
operador     → vê operações normais
comprador    → vê apenas compras e matérias-primas
```

**Exemplo de guard de rota (Vue/React):**
```js
const perfisPermitidos = {
  '/admin/usuarios': ['admin', 'super_admin'],
  '/platform':       ['super_admin'],
  // demais rotas: todos os autenticados com empresa_id
};
```

---

## 4. Painel do Administrador do Tenant

Rotas acessíveis apenas por `perfil === 'admin'` (e `super_admin`).

### 4.1 Gerenciar usuários da empresa

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
> `perfil` aceita: `admin`, `operador`, `comprador` (não é possível criar `super_admin` por aqui)

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

### 4.2 Dados da conta (tenant)

| Método | URL | Descrição |
|---|---|---|
| `GET` | `/admin/tenant` | Retorna dados do próprio tenant |
| `PUT` | `/admin/tenant` | Atualiza nome, e-mail de contato, telefone |

**Atualizar tenant — `PUT /admin/tenant`:**
```json
{
  "nome": "Novo Nome da Empresa",
  "nome_fantasia": "Nova Marca",
  "email_contato": "novo@email.com",
  "telefone": "11988887777"
}
```

---

### 4.3 Logs de auditoria do tenant

`GET /admin/logs`

**Query params disponíveis:**
| Param | Tipo | Exemplo |
|---|---|---|
| `acao` | string | `login`, `criar`, `atualizar`, `deletar`, `confirmar`, `cancelar` |
| `entidade` | string | `Venda`, `MateriaPrima`, `Usuario` |
| `usuario_id` | number | `2` |
| `data_inicio` | date | `2026-05-01` |
| `data_fim` | date | `2026-05-31` |
| `limit` | number | `50` (max 200) |
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
      "created_at": "2026-05-15T14:30:00.000Z",
      "usuario": { "id": 1, "nome": "Maria Silva", "email": "maria@email.com" }
    }
  ]
}
```

---

## 5. Painel da Plataforma (super_admin)

Acessível **somente** por usuários com `perfil === 'super_admin'` (`empresa_id` é `null` no token). Usado pela equipe de operação da plataforma.

### 5.1 Gerenciar tenants

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
  "cnpj": "12345678000195",
  "nome": "Cosméticos da Maria",
  "nome_fantasia": "Marca Maria",
  "email_contato": "contato@marca.com",
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

### 5.2 Gerenciar usuários (visão global)

| Método | URL | Descrição |
|---|---|---|
| `GET` | `/platform/usuarios` | Lista todos os usuários |
| `POST` | `/platform/usuarios` | Cria super_admin ou admin de tenant |
| `PATCH` | `/platform/usuarios/:id/toggle-ativo` | Ativa/desativa |

**Query params para listagem:**
- `?empresa_id=5` — filtra por tenant
- `?perfil=admin` — filtra por perfil

---

### 5.3 Logs globais

`GET /platform/logs`

**Query params:**
| Param | Tipo | Descrição |
|---|---|---|
| `empresa_id` | number | Filtra por tenant específico |
| `usuario_id` | number | Filtra por usuário |
| `acao` | string | Tipo da ação |
| `entidade` | string | Entidade afetada |
| `data_inicio` | date | A partir de |
| `data_fim` | date | Até |
| `limit` | number | Max 500 (default 100) |
| `offset` | number | Paginação |

---

## 6. Rotas operacionais — sem mudança de URL

Todas as rotas abaixo **não mudaram**. O `empresa_id` é injetado automaticamente pelo backend via JWT. O frontend não precisa enviar nenhum campo adicional.

| Prefixo | Módulo | Mudança para o front |
|---|---|---|
| `/fornecedores` | Fornecedores | Nenhuma |
| `/materias-primas` | Matérias-primas | Nenhuma |
| `/compras` | Pedidos de compra | Nenhuma |
| `/formulas` | Fórmulas | Nenhuma |
| `/producao` | Ordens de produção | Nenhuma |
| `/produtos` | Produtos acabados | Nenhuma |
| `/vendas` | Vendas | Nenhuma |
| `/clientes` | Clientes | Nenhuma |
| `/relatorios` | Relatórios | Nenhuma |
| `/backup` | Backup/restore | Nenhuma |
| `/auth` | Autenticação | Ver seção 1 |

---

## 7. Informações do tenant no header do app

Após o login, recomendamos buscar os dados do tenant para exibir no header (nome, plano, trial):

```
GET /admin/tenant
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 3,
  "tipo": "pj",
  "nome": "Cosméticos da Maria",
  "nome_fantasia": "Marca Maria",
  "plano": "trial",
  "trial_expira": "2026-06-14",
  "ativo": true
}
```

Use `trial_expira` para mostrar um banner de aviso quando restarem poucos dias.

**Exemplo de banner:**
```js
const diasRestantes = Math.ceil((new Date(tenant.trial_expira) - new Date()) / 86400000);
if (tenant.plano === 'trial' && diasRestantes <= 7) {
  showBanner(`Seu trial expira em ${diasRestantes} dias. Faça upgrade.`);
}
```

---

## 8. Resumo das novas telas a criar

| Tela | Rota sugerida | Acesso |
|---|---|---|
| Cadastro / registro | `/register` | Público |
| Plano expirado | `/plano-expirado` | Público (redirecionado) |
| Gerenciar usuários do tenant | `/admin/usuarios` | `admin` |
| Dados da minha conta | `/admin/minha-conta` | `admin` |
| Logs de auditoria | `/admin/logs` | `admin` |
| Painel de plataforma — tenants | `/platform/tenants` | `super_admin` |
| Painel de plataforma — usuários | `/platform/usuarios` | `super_admin` |
| Painel de plataforma — logs | `/platform/logs` | `super_admin` |

---

## 9. Exemplo de fluxo completo de onboarding

```
1. Usuário acessa /register
2. Preenche tipo (PF ou PJ), dados da empresa e cria senha do admin
3. POST /register → recebe { token, usuario, tenant }
4. Salva token, redireciona para /dashboard
5. Dashboard exibe banner de trial com dias restantes
6. Admin pode ir em /admin/usuarios para convidar colaboradores
```

---

## 10. Variáveis de ambiente sugeridas

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Fábrica Gestão
```
