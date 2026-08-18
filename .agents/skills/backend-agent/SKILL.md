---
name: backend-agent
description: >-
  Agente de Backend especializado em banco de dados Supabase (PostgreSQL), modelagem de schemas SQL, 
  políticas de segurança RLS, serviços de dados API, subscrições em tempo real e cálculos financeiros.
---

# Agente de Backend - Gestão Financeira & Supabase

Este skill orienta a atuação do Agente de Backend na aplicação de gestão financeira. O agente é o responsável total por todas as funções de banco de dados, persistência, comunicação com o Supabase (PostgreSQL), segurança, autenticação de usuárias e cálculos financeiros.

---

## 📋 Processos de Backend com o Banco de Dados

### 1. Modelagem & Manutenção de Schemas DDL (`supabase_setup.sql`)
- Manutenção da estrutura de dados do banco no arquivo [`supabase_setup.sql`](file:///c:/Users/ellie/OneDrive/Documentos/planilha/supabase_setup.sql).
- **Tabelas do Banco**:
  - `users`: `id` (UUID), `username` (TEXT UNIQUE), `password` (TEXT), `name` (TEXT), `created_at`.
  - `categories`: `id` (UUID), `name` (TEXT), `type` ('income', 'expense', 'both'), `created_at`.
  - `transactions`: `id` (UUID), `amount` (NUMERIC 12,2), `type` ('income', 'expense'), `category_id` (FK -> categories.id), `date` (DATE), `description` (TEXT), `created_at`.
- **Garantia de Idempotência**: Todo script SQL utiliza `IF NOT EXISTS`, `DROP POLICY IF EXISTS` e verificação prévia de publicação Realtime.

### 2. Autenticação & Controle de Acesso (RLS)
- Validação de acesso das usuárias autorizadas (`ellieb` e `lizfnery` com a senha `Mofsv@2507`).
- Habilitação de **Row Level Security (RLS)** em todas as tabelas (`users`, `categories`, `transactions`).

### 3. Camada de Comunicação de Dados (`src/lib/supabase.ts`)
- Manutenção das chamadas da API de banco de dados do Supabase.
- **Mecanismo de Fallback (LocalStorage)** para execução sem falhas mesmo quando o ambiente estiver offline.
- Funções da API de Backend:
  - `loginUserApi(username, password)`: Consulta e validação de usuárias.
  - `fetchCategoriesApi()` e `createCategoryApi()`: Consulta e inserção de categorias.
  - `fetchTransactionsApi()`: Leitura relacional de movimentações com join em categorias.
  - `createTransactionApi()` e `deleteTransactionApi()`: Inserção e exclusão no banco.

### 4. Processamento de Regras de Negócio & Cálculos
- **Valor Total**: Cálculo acumulado do saldo.
- **Taxa de Poupança**: Percentual economizado do total de entradas.
- **Projeções do Mês**: Cálculo acumulado **Até o Dia 15** e **Até o Dia 30**.
- **Comparativo Mensal**: Agrupamento por ano-mês com detalhamento por categoria.

### 5. Sincronização em Tempo Real (Supabase Realtime)
- Publicação de tabelas no `supabase_realtime`.
- Inscrição em canais WebSocket para atualização imediata do frontend ao alterar o banco.
