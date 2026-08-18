---
name: backend-agent
description: >-
  Agente de Backend especializado em banco de dados Supabase (PostgreSQL), modelagem de schemas SQL, 
  políticas de segurança RLS, serviços de dados API, subscrições em tempo real e cálculos financeiros.
---

# Agente de Backend - Gestão Financeira & Supabase

Este skill orienta a atuação do Agente de Backend na aplicação de gestão financeira. O agente é responsável por toda a lógica de dados, persistência, comunicação com o Supabase (PostgreSQL), segurança e otimização de consultas.

---

## 📋 Responsabilidades do Agente de Backend

### 1. Modelagem do Banco de Dados & Schemas SQL
- **Definição de DDL**: Manutenção do arquivo [`supabase_setup.sql`](file:///c:/Users/ellie/OneDrive/Documentos/planilha/supabase_setup.sql) e futuras migrations.
- **Tabelas Principais**:
  - `categories`: `id` (UUID), `name` (TEXT), `type` ('income', 'expense', 'both'), `created_at`.
  - `transactions`: `id` (UUID), `amount` (NUMERIC), `type` ('income', 'expense'), `category_id` (FK), `date` (DATE), `description` (TEXT), `created_at`.
- **Índices de Performance**: Índices em colunas de alta frequência de busca como `date`, `type` e `category_id`.
- **Integridade Referencial**: Uso de `ON DELETE SET NULL` ou `CASCADE` e restrições `CHECK (amount > 0)`.

### 2. Políticas de Segurança & Row Level Security (RLS)
- Garantir a aplicação de RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- Definir políticas para permissões de leitura (`SELECT`), escrita (`INSERT`), atualização (`UPDATE`) e remoção (`DELETE`).
- Preparação para expansão com autenticação de usuário (`auth.uid() = user_id`).

### 3. Camada de API & Serviços de Dados (`src/lib/supabase.ts`)
- Manutenção da interface de serviços unificada que gerencia requisições assíncronas para o Supabase.
- Implementação de **Fallback de Armazenamento Local (LocalStorage)** para garantia de funcionamento mesmo offline ou sem credenciais remotas ativas.
- Métodos principais de backend:
  - `fetchCategoriesApi()`: Busca categorias ordenadas por nome.
  - `createCategoryApi(name, type)`: Inserção de novas categorias com retorno imediato do objeto gravado.
  - `fetchTransactionsApi()`: Consulta de movimentações com join relacional `category:categories(*)`.
  - `createTransactionApi(data)`: Gravação de receitas ou despesas com tratamento numérico.
  - `deleteTransactionApi(id)`: Exclusão de movimentações.

### 4. Cálculos Financeiros & Regras de Negócio
- **Saldo Total**: $\sum (\text{Receitas}) - \sum (\text{Despesas})$.
- **Taxa de Poupança**: $\frac{\text{Receitas} - \text{Despesas}}{\text{Receitas}} \times 100$.
- **Projeções Temporais no Mês**:
  - **Até Dia 15**: Acumulado de transações com `date <= YYYY-MM-15`.
  - **Até Dia 30**: Acumulado de transações com `date <= YYYY-MM-30`.

### 5. Configuração de Realtime & Subscrições
- Habilitação da tabela em `supabase_realtime`.
- Configuração de escuta de eventos via `supabase.channel('db-changes')` para atualização reativa da interface sem recarregamento da página.

---

## 🛠️ Modos de Operação do Agente Backend

Ao executar tarefas de backend, o agente deve:
1. Atualizar o script SQL [`supabase_setup.sql`](file:///c:/Users/ellie/OneDrive/Documentos/planilha/supabase_setup.sql) com qualquer alteração de tabela ou política.
2. Garantir que as funções da camada de API em [`src/lib/supabase.ts`](file:///c:/Users/ellie/OneDrive/Documentos/planilha/src/lib/supabase.ts) reflitam as mudanças do schema.
3. Testar a compilação e integridade dos tipos TypeScript em [`src/types/index.ts`](file:///c:/Users/ellie/OneDrive/Documentos/planilha/src/types/index.ts).
