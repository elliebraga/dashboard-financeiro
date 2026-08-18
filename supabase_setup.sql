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
    is_paid BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar a coluna is_paid caso a tabela já existisse anteriormente
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT true;

-- 5. Criar índices para performance em consultas comuns
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_is_paid ON public.transactions(is_paid);
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
    ('Outras Despesas', 'expense')
ON CONFLICT DO NOTHING;

-- 8. Habilitar RLS (Row Level Security) em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas Idempotentes de Leitura e Escrita Completas (ALL)
DROP POLICY IF EXISTS "Permitir leitura pública em users" ON public.users;
DROP POLICY IF EXISTS "Permitir tudo em users" ON public.users;
CREATE POLICY "Permitir tudo em users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura pública em categories" ON public.categories;
DROP POLICY IF EXISTS "Permitir inserção em categories" ON public.categories;
DROP POLICY IF EXISTS "Permitir tudo em categories" ON public.categories;
CREATE POLICY "Permitir tudo em categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir tudo em transactions" ON public.transactions;
CREATE POLICY "Permitir tudo em transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- 9. Adicionar Tabelas à Publicação Realtime do Supabase
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
END $$;
