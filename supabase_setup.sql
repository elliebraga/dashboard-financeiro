-- =====================================================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS SUPABASE / POSTGRESQL
-- Executar este script no SQL Editor do seu projeto Supabase
-- =====================================================================

-- 1. Habilitar a extensão para geração de UUID (caso não esteja ativa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela: categories (Categorias de Transações)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense', 'both')) DEFAULT 'both',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela: transactions (Movimentações Financeiras)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Criar índices para performance em consultas comuns
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);

-- 5. Inserção de Categorias Padrão (Seed Initial Data)
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

-- 6. Configuração de Row Level Security (RLS) para Acesso Público Anonimizado (Dev Mode)
-- Permite leitura e gravação públicas caso você ainda não use autenticação por login.
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública em categories" 
    ON public.categories FOR SELECT 
    USING (true);

CREATE POLICY "Permitir inserção pública em categories" 
    ON public.categories FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública em categories" 
    ON public.categories FOR DELETE 
    USING (true);

CREATE POLICY "Permitir leitura pública em transactions" 
    ON public.transactions FOR SELECT 
    USING (true);

CREATE POLICY "Permitir inserção pública em transactions" 
    ON public.transactions FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública em transactions" 
    ON public.transactions FOR DELETE 
    USING (true);

CREATE POLICY "Permitir atualização pública em transactions" 
    ON public.transactions FOR UPDATE 
    USING (true);

-- 7. Habilitar Supabase Realtime para a tabela transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
