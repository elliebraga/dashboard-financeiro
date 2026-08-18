---
name: backend-agent
description: >-
  Agente de Backend especializado em banco de dados Supabase (PostgreSQL), rotas REST, métodos de dados (POST/GET/PATCH/DELETE), 
  modelagem DDL, segurança RLS, subscrições WebSocket e cálculos financeiros.
---

# Agente de Backend - Gestão Financeira & Supabase

Este skill orienta a atuação do Agente de Backend na aplicação de gestão financeira. O agente é o responsável total por todas as funções de banco de dados, captura, sanitização, envio e gravação de dados (POST/PUT/PATCH/DELETE), persistência, comunicação com o Supabase (PostgreSQL), segurança RLS, autenticação de usuárias e cálculos financeiros.

---

## 🗺️ Mapeamento de Rotas HTTP, Endpoints REST e Métodos da Aplicação

| Operação | Método da API (`src/lib/supabase.ts`) | Método HTTP | Endpoints / Rotas Supabase REST | Tabela do Banco |
| :--- | :--- | :--- | :--- | :--- |
| **Autenticar Usuária** | `loginUserApi(username, password)` | `POST / GET` | `/rest/v1/users?username=eq.{user}&password=eq.{pass}` | `public.users` |
| **Listar Categorias** | `fetchCategoriesApi()` | `GET` | `/rest/v1/categories?select=*&order=name.asc` | `public.categories` |
| **Criar Categoria (POST)** | `postCategoryApi(name, type)` / `createCategoryApi` | `POST` | `/rest/v1/categories` | `public.categories` |
| **Listar Transações** | `fetchTransactionsApi()` | `GET` | `/rest/v1/transactions?select=*,category:categories(*)&order=date.desc` | `public.transactions` |
| **Criar Transação (POST)** | `postTransactionApi(payload)` / `createTransactionApi` | `POST` | `/rest/v1/transactions` | `public.transactions` |
| **Atualizar Status Pago (PATCH)** | `updateTransactionPaidStatusApi(id, is_paid)` | `PATCH` | `/rest/v1/transactions?id=eq.{id}` | `public.transactions` |
| **Excluir Transação (DELETE)** | `deleteTransactionApi(id)` | `DELETE` | `/rest/v1/transactions?id=eq.{id}` | `public.transactions` |
| **Semear Dados Iniciais** | `seedSupabaseDatabaseApi()` | `POST` | `/rest/v1/transactions` + `/rest/v1/categories` | `public.transactions` |
| **Testar Conexão** | `testSupabaseDatabaseConnection()` | `HEAD / GET` | `/rest/v1/categories?select=count` | `public.categories` |
| **Realtime WebSockets** | `supabaseClient.channel('db-changes')` | `WSS` | `wss://<sua-url>.supabase.co/realtime/v1/websocket` | Realtime Pub/Sub |

---

## 📋 Detalhamento dos Métodos do Backend (`src/lib/supabase.ts`)

### 1. Inserção de Transações (POST / INSERT)
- **Método**: `postTransactionApi(payload)` / `createTransactionApi(payload)`
- **Rota REST**: `POST /rest/v1/transactions`
- **Payload Enviado**:
  ```json
  {
    "amount": 150.50,
    "type": "expense",
    "category_id": "8f3b2a19-4c8d-4e9a-9b12-3f5e6a7b8c9d",
    "date": "2026-08-18",
    "description": "Supermercado Semanal",
    "is_paid": true
  }
  ```

### 2. Cadastro de Categoria (POST / INSERT)
- **Método**: `postCategoryApi(name, type)` / `createCategoryApi(name, type)`
- **Rota REST**: `POST /rest/v1/categories`
- **Payload Enviado**:
  ```json
  {
    "name": "Assinaturas & Streaming",
    "type": "expense"
  }
  ```

### 3. Atualização de Status Pago / Pendente (PATCH / UPDATE)
- **Método**: `updateTransactionPaidStatusApi(id, is_paid)`
- **Rota REST**: `PATCH /rest/v1/transactions?id=eq.{id}`
- **Payload Enviado**:
  ```json
  {
    "is_paid": true
  }
  ```

### 4. Remoção de Transação (DELETE)
- **Método**: `deleteTransactionApi(id)`
- **Rota REST**: `DELETE /rest/v1/transactions?id=eq.{id}`

---

## 🛡️ Segurança & Schemas do Banco (`supabase_setup.sql`)

### 5. Schemas & Tabelas DDL
- `users`: Armazenamento de usuárias autorizadas (`ellieb` e `lizfnery`).
- `categories`: Armazenamento de categorias com chaves primárias **UUID**.
- `transactions`: Armazenamento de receitas/despesas com chave estrangeira `category_id REFERENCES public.categories(id)` e coluna `is_paid`.

### 6. Políticas de Acesso RLS (Row Level Security)
- Todas as tabelas possuem a regra completa `CREATE POLICY ... FOR ALL USING (true) WITH CHECK (true)` garantindo que todas as inserções e atualizações enviadas pelo backend sejam gravadas com sucesso.
