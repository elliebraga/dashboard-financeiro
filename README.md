# 💰 Dashboard de Finanças Pessoais (Supabase + React + Vite)

Aplicação web moderna, intuitiva e responsiva para controle de finanças pessoais com backend em **Supabase (PostgreSQL)** e interface desenvolvida em **React 18 + TypeScript + Tailwind CSS**.

---

## 🚀 Como Executar o Projeto

### 1. Instalar as Dependências
No terminal, dentro da pasta do projeto, execute:
```bash
cmd /c npm install
```

### 2. Iniciar o Servidor de Desenvolvimento
```bash
cmd /c npm run dev
```
Acesse no seu navegador em `http://localhost:3000`.

---

## 🗄️ Configuração do Banco de Dados (Supabase)

### Passo 1: Executar o Script SQL
1. Acesse o seu painel do **[Supabase](https://supabase.com)**.
2. Abra a seção **SQL Editor**.
3. Copie todo o conteúdo do arquivo [`supabase_setup.sql`](file:///c:/Users/ellie/OneDrive/Documentos/planilha/supabase_setup.sql) e cole no editor.
4. Clique em **Run** para criar as tabelas `categories` e `transactions`, além de popular as categorias padrão e habilitar o Realtime.

### Passo 2: Configurar as Credenciais
Você tem duas opções fáceis para conectar com seu projeto Supabase:

#### Opção A: Pela Interface Web (Modal de Configurações)
1. Abra o app no navegador.
2. Clique no botão de engrenagem ou badge **Modo Demo (Local)** no topo superior direito.
3. Cole a sua **Supabase Project URL** e **Supabase Anon Key** e clique em **Salvar Conexão**.

#### Opção B: No arquivo `.env`
Edite o arquivo [`.env`](file:///c:/Users/ellie/OneDrive/Documentos/planilha/.env) adicionando suas credenciais:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

---

## ✨ Funcionalidades Principais

- ⚡ **Big Number (Saldo Total)**: Card em destaque mostrando o saldo liquidado, total de receitas e total de despesas, com taxa de poupança estimada.
- 🔄 **Formulário de Transações**:
  - Botão de alternância entre *Recebimento* e *Despesa*.
  - Formatação em moeda R$ (BRL).
  - Dropdown dinâmico de categorias com a opção **"+ Criar nova categoria"** que abre um modal direto para cadastro instantâneo.
  - Seletor de data (`type="date"`) pré-preenchido com a data atual e suporte a agendamento para datas futuras.
- 📋 **Tabela de Transações**:
  - Ícones visuais diferenciados ($\uparrow$ Verde para entradas e $\downarrow$ Vermelho para saídas).
  - Ordenação decrescente por data (mais recentes primeiro).
  - Filtros por palavra-chave, por categoria e por tipo.
  - Exclusão com confirmação.
- 📊 **Resumo de Gastos**: Gráfico percentual das maiores despesas por categoria.
- 📡 **Realtime Subscriptions**: Atualização automática da interface quando novas transações são inseridas de qualquer dispositivo.
- 💾 **Modo Demo Local (Fallback)**: Funciona instantaneamente via LocalStorage se o Supabase ainda não estiver conectado.
