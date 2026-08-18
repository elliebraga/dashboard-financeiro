---
name: backend-agent
description: >-
  Agente de Backend especializado em banco de dados Supabase (PostgreSQL), modelagem de schemas SQL, 
  captura e inserção de dados (POST), políticas de segurança RLS, serviços de dados API, subscrições em tempo real e cálculos financeiros.
---

# Agente de Backend - Gestão Financeira & Supabase

Este skill orienta a atuação do Agente de Backend na aplicação de gestão financeira. O agente é o responsável total por todas as funções de banco de dados, captura e gravação de dados (POST), persistência, comunicação com o Supabase (PostgreSQL), segurança, autenticação de usuárias e cálculos financeiros.

---

## 📋 Processos de Backend com o Banco de Dados

### 1. Processo de Captura e Inserção de Dados (POST / INSERT)
O Agente de Backend executa o pipeline completo de gravação de dados no banco de dados Supabase:
1. **Validação & Sanitização do Payload**:
   - Sanitização de valores numéricos (`amount > 0`).
   - Normalização de tipos de movimentação (`income` ou `expense`).
   - Formatação padrão de datas (`YYYY-MM-DD`).
   - Tratamento de descrição opcional e estado do checkbox de pagamento (`is_paid`).
2. **Resolução de UUID de Categoria**:
   - Mapeamento e conversão de IDs de categorias para UUIDs válidos do PostgreSQL na tabela `public.categories`.
   - Criação automática de categoria no banco caso não seja encontrada.
3. **Execução de Query SQL / Insert**:
   - Chamada `supabaseClient.from('transactions').insert([...]).select('*, category:categories(*)').single()`.
4. **Retorno Relacional e Broadcast Realtime**:
   - Retorno do registro gravado com JOIN de categoria.
   - Disparo do evento de sincronização via WebSockets (`supabase_realtime`).

### 2. Modelagem & Manutenção de Schemas DDL (`supabase_setup.sql`)
- Manutenção da estrutura de dados do banco no arquivo [`supabase_setup.sql`](file:///c:/Users/ellie/OneDrive/Documentos/planilha/supabase_setup.sql).
- **Tabelas do Banco**:
  - `users`: `id` (UUID), `username` (TEXT UNIQUE), `password` (TEXT), `name` (TEXT), `created_at`.
  - `categories`: `id` (UUID), `name` (TEXT), `type` ('income', 'expense', 'both'), `created_at`.
  - `transactions`: `id` (UUID), `amount` (NUMERIC 12,2), `type` ('income', 'expense'), `category_id` (FK -> categories.id), `date` (DATE), `description` (TEXT), `is_paid` (BOOLEAN), `created_at`.
- **Garantia de Idempotência**: Todo script SQL utiliza `IF NOT EXISTS`, `DROP POLICY IF EXISTS` e verificação prévia de publicação Realtime.

### 3. Autenticação & Controle de Acesso (RLS)
- Validação de acesso das usuárias autorizadas (`ellieb` e `lizfnery` com a senha `Mofsv@2507`).
- Habilitação de **Row Level Security (RLS)** em todas as tabelas (`users`, `categories`, `transactions`) com regra `FOR ALL USING (true) WITH CHECK (true)`.

### 4. Camada de API de Comunicação (`src/lib/supabase.ts`)
- Manutenção das chamadas da API de banco de dados do Supabase.
- **Mecanismo de Fallback (LocalStorage)** para execução sem falhas mesmo quando o ambiente estiver offline.
- Funções da API de Backend:
  - `loginUserApi(username, password)`: Consulta e validação de usuárias.
  - `postCategoryApi()` / `createCategoryApi()`: Captura e inserção de categorias no banco.
  - `postTransactionApi()` / `createTransactionApi()`: Captura e gravação de movimentações financeiras no banco.
  - `fetchCategoriesApi()` e `fetchTransactionsApi()`: Leitura de dados relacionais.
  - `updateTransactionPaidStatusApi()` e `deleteTransactionApi()`: Atualização de status e exclusão.

### 5. Processamento de Regras de Negócio & Cálculos
- **Valor Total**: Cálculo acumulado do saldo.
- **Taxa de Poupança**: Percentual economizado do total de entradas.
- **Projeções do Mês**: Cálculo acumulado **Até o Dia 15** e **Até o Dia 30**.
- **Comparativo Mensal**: Agrupamento por ano-mês com detalhamento por categoria.

### 6. Sincronização em Tempo Real (Supabase Realtime)
- Publicação de tabelas no `supabase_realtime`.
- Inscrição em canais WebSocket para atualização imediata do frontend ao alterar o banco.
