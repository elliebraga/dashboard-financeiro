---
name: backend-agent
description: >-
  Agente de Backend especializado em banco de dados Supabase (PostgreSQL), modelagem de schemas SQL, 
  captura, validação e envio de dados (POST/PUT/DELETE), políticas de segurança RLS, serviços de dados API, subscrições em tempo real e cálculos financeiros.
---

# Agente de Backend - Gestão Financeira & Supabase

Este skill orienta a atuação do Agente de Backend na aplicação de gestão financeira. O agente é o responsável total por todas as funções de banco de dados, captura, sanitização, envio e gravação de dados (POST/PUT/DELETE), persistência, comunicação com o Supabase (PostgreSQL), segurança RLS, autenticação de usuárias e cálculos financeiros.

---

## 📋 Funções do Agente de Backend para Envio de Dados ao Banco

### 1. Funções da API de Backend (`src/lib/supabase.ts`)
O Agente de Backend gerencia e executa todas as funções responsáveis pelo envio e alteração de dados no PostgreSQL:

- **`postTransactionApi` / `createTransactionApi(payload)`**:
  - Captura os dados da transação (`amount`, `type`, `category_id`, `date`, `description`, `is_paid`).
  - Converte e resolve o `category_id` para um **UUID válido do PostgreSQL**.
  - Executa a query `INSERT INTO public.transactions` no banco de dados.
  - Retorna o registro inserido com os dados relacionais da categoria (`category:categories(*)`).

- **`postCategoryApi` / `createCategoryApi(name, type)`**:
  - Higieniza o nome da categoria.
  - Executa o `INSERT INTO public.categories (name, type)` no banco de dados.
  - Retorna a nova categoria cadastrada com seu UUID gerado.

- **`updateTransactionPaidStatusApi(id, is_paid)`**:
  - Valida o UUID da transação.
  - Executa a query `UPDATE public.transactions SET is_paid = $1 WHERE id = $2` para alterar o status no banco de dados.

- **`deleteTransactionApi(id)`**:
  - Valida o UUID da transação.
  - Executa a query `DELETE FROM public.transactions WHERE id = $1` para remover permanentemente a transação do banco.

- **`loginUserApi(username, password)`**:
  - Consulta e valida credenciais na tabela `public.users`.

- **`testSupabaseDatabaseConnection()`**:
  - Testa e diagnostica se o canal de envio e a chave do Supabase estão ativos e gravando no PostgreSQL.

---

## 🛡️ Segurança & Schemas do Banco (`supabase_setup.sql`)

### 2. Schemas & Tabelas DDL
- `users`: Armazenamento de usuárias autorizadas (`ellieb` e `lizfnery`).
- `categories`: Armazenamento de categorias com chaves primárias **UUID**.
- `transactions`: Armazenamento de receitas/despesas com chave estrangeira `category_id REFERENCES public.categories(id)` e coluna `is_paid`.

### 3. Políticas de Acesso RLS (Row Level Security)
- Todas as tabelas possuem a regra completa `CREATE POLICY ... FOR ALL USING (true) WITH CHECK (true)` garantindo que todas as inserções e atualizações enviadas pelo backend sejam gravadas com sucesso.

### 4. Sincronização em Tempo Real (Supabase Realtime)
- Inserções, alterações e exclusões publicadas no canal WebSocket `supabase_realtime`, notificando todos os clientes conectados instantaneamente.
