# Regras de Desenvolvimento de Backend (Backend Rules)

1. **Segurança de Credenciais**:
   - Nunca expor chaves privadas (`service_role_key`) no frontend. Usar apenas a `VITE_SUPABASE_ANON_KEY`.
   - Garantir que `.env` esteja listado no `.gitignore`.

2. **Padrão de Tipos e Moeda**:
   - Sempre tratar valores monetários como números decimais com 2 casas de precisão (`NUMERIC(12,2)` no Postgres e `number` no TypeScript).
   - Datas devem ser formatadas no padrão ISO `YYYY-MM-DD`.

3. **Fallback & Resiliência**:
   - Qualquer operação de banco de dados no Supabase deve tratar exceções de rede e ter um mecanismo de fallback funcional via LocalStorage.

4. **Performance de Consultas**:
   - Usar relacionamentos diretos (`.select('*, category:categories(*)')`) para evitar consultas no estilo N+1.
