---
name: backend-agent
description: >-
  Agente de Backend especializado em banco de dados Supabase (PostgreSQL), rotas REST, métodos de dados (POST/GET/PATCH/DELETE), 
  modelagem DDL, segurança RLS, subscrições WebSocket, módulo de Compras de Mercado e cálculos financeiros.
---

# Agente de Backend - Gestão Financeira & Supabase

Este skill orienta a atuação do Agente de Backend na aplicação de gestão financeira Dindin. O agente é o responsável total por todas as funções de banco de dados, captura, sanitização, envio e gravação de dados (POST/PUT/PATCH/DELETE), persistência, comunicação com o Supabase (PostgreSQL), módulo de Compras de Mercado (`grocery_lists` e `grocery_items`), segurança RLS, autenticação de usuárias e cálculos financeiros.

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
| **Listar Compras de Mercado** | `fetchGroceryListsApi()` | `GET` | `/rest/v1/grocery_lists?select=*,items:grocery_items(*)` | `public.grocery_lists` |
| **Criar Lista de Mercado** | `createGroceryListApi(title, date, notes)` | `POST` | `/rest/v1/grocery_lists` | `public.grocery_lists` |
| **Deletar Lista de Mercado** | `deleteGroceryListApi(id)` | `DELETE` | `/rest/v1/grocery_lists?id=eq.{id}` | `public.grocery_lists` |
| **Adicionar Item de Mercado** | `addGroceryItemApi(listId, itemData)` | `POST` | `/rest/v1/grocery_items` | `public.grocery_items` |
| **Atualizar Item de Mercado** | `updateGroceryItemApi(id, updates)` | `PATCH` | `/rest/v1/grocery_items?id=eq.{id}` | `public.grocery_items` |
| **Deletar Item de Mercado** | `deleteGroceryItemApi(id, listId)` | `DELETE` | `/rest/v1/grocery_items?id=eq.{id}` | `public.grocery_items` |
| **Realtime WebSockets** | `supabaseClient.channel('db-changes')` | `WSS` | `wss://<sua-url>.supabase.co/realtime/v1/websocket` | Realtime Pub/Sub |

---

## 🛒 Schemas das Tabelas de Compras de Mercado (`supabase_setup.sql`)

- **`grocery_lists`**:
  - `id` (UUID PRIMARY KEY)
  - `title` (TEXT NOT NULL)
  - `date` (DATE NOT NULL)
  - `total_amount` (NUMERIC(12,2))
  - `notes` (TEXT)
  - `status` (TEXT: 'active' | 'completed' | 'archived')
  - `created_at` (TIMESTAMPTZ)

- **`grocery_items`**:
  - `id` (UUID PRIMARY KEY)
  - `list_id` (UUID REFERENCES grocery_lists(id) ON DELETE CASCADE)
  - `name` (TEXT NOT NULL)
  - `quantity` (NUMERIC(10,2))
  - `unit_price` (NUMERIC(12,2))
  - `total_price` (NUMERIC(12,2))
  - `is_purchased` (BOOLEAN DEFAULT false)
  - `category` (TEXT)
  - `created_at` (TIMESTAMPTZ)
