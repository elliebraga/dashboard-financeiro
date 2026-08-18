-- =====================================================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS SUPABASE / POSTGRESQL
-- Executar este script no SQL Editor do seu projeto Supabase
-- Totalmente Idempotente (Pode ser re-executado sem erros)
-- =====================================================================

-- 1. Habilitar a extensão para geração de UUID (caso não esteja ativa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela: users (Usuários com acesso ao sistema)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela: categories (Categorias de Transações)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense', 'both')) DEFAULT 'both',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela: transactions (Movimentações Financeiras)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Criar índices para performance em consultas comuns
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- 6. Inserção dos Usuários Permitidos (Seed Initial Data)
INSERT INTO public.users (username, password, name) VALUES
    ('ellieb', 'Mofsv@2507', 'Ellie Braga'),
    ('lizfnery', 'Mofsv@2507', 'Liz Nery')
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password, name = EXCLUDED.name;

-- 7. Inserção de Categorias Padrão (Seed Initial Data)
INSERT INTO public.categories (name, type) VALUES
    ('Salário', 'income'),
    ('Freelance', 'income'),
    ('Investimentos', 'income'),
    ('Outras Receitas', 'income'),
    ('Alimentação', 'expense'),
    ('Moradia', 'expense'),
    ('Transporte', 'expense'),
    ('Lazer', 'expense'),
    ('Saúde', 'expense'),
    ('Educação', 'expense'),
    ('Contas & Serviços', 'expense'),
    ('Outras Despesas', 'expense')
ON CONFLICT DO NOTHING;

-- 8. Configuração de Row Level Security (RLS) com remoção prévia de políticas (Safe Drop)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas em Users
DROP POLICY IF EXISTS "Permitir leitura pública em users" ON public.users;
CREATE POLICY "Permitir leitura pública em users" 
    ON public.users FOR SELECT 
    USING (true);

-- Políticas em Categories
DROP POLICY IF EXISTS "Permitir leitura pública em categories" ON public.categories;
CREATE POLICY "Permitir leitura pública em categories" 
    ON public.categories FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Permitir inserção pública em categories" ON public.categories;
CREATE POLICY "Permitir inserção pública em categories" 
    ON public.categories FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão pública em categories" ON public.categories;
CREATE POLICY "Permitir exclusão pública em categories" 
    ON public.categories FOR DELETE 
    USING (true);

-- Políticas em Transactions
DROP POLICY IF EXISTS "Permitir leitura pública em transactions" ON public.transactions;
CREATE POLICY "Permitir leitura pública em transactions" 
    ON public.transactions FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Permitir inserção pública em transactions" ON public.transactions;
CREATE POLICY "Permitir inserção pública em transactions" 
    ON public.transactions FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão pública em transactions" ON public.transactions;
CREATE POLICY "Permitir exclusão pública em transactions" 
    ON public.transactions FOR DELETE 
    USING (true);

DROP POLICY IF EXISTS "Permitir atualização pública em transactions" ON public.transactions;
CREATE POLICY "Permitir atualização pública em transactions" 
    ON public.transactions FOR UPDATE 
    USING (true);

-- 9. Habilitar Supabase Realtime com verificação prévia (Safe Publication Add)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'transactions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'categories'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'users'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
    END IF;
END $$;
