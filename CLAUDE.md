# organize-matcon — regras do repositório

Este repositório hospeda **dois apps independentes** que só compartilham o
mesmo código-fonte/deploy Vercel. Eles NUNCA compartilham dados.

## Os dois apps

| | ARM (organize-matcon) | Salão 360 |
|---|---|---|
| Cliente | E&M Carvalho Material de Construção (CNPJ 07.171.211/0001-26) | Salão de beleza (projeto novo/protótipo) |
| Entry point | `index.html` → `src/main.jsx` → `src/App.jsx` | `index-salao.html` → `src/main-salao.jsx` → `src/SalaoApp.jsx` |
| Supabase project | `axnugedgmenusgxaqnzf` ("organize-matcon") | `nxpycmwsnxhddxblkyun` ("salao-360") |
| Cliente Supabase | `src/supabase.js` (usa `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) | `src/lib/salaoSupabaseClient.js` (usa `VITE_SALAO_SUPABASE_URL` / `VITE_SALAO_SUPABASE_ANON_KEY`) |
| Deploy | branch `main` → produção em `organizematcon.com` | branch `claude/salao-360-design-system-hlk72r` → preview Vercel |

## Regra crítica — NUNCA MISTURAR

- **Cada app tem sua própria base de dados (Supabase) e seu próprio plano de contas.**
  Nunca leia, grave ou compare dados de um projeto Supabase pensando que é do outro.
- Antes de rodar qualquer query ou lançamento financeiro, confirme o `project_id`
  do Supabase correto (`axnugedgmenusgxaqnzf` para o ARM, `nxpycmwsnxhddxblkyun`
  para o Salão 360) — nunca assuma.
- Nunca edite componentes/arquivos de um app "para testar" ou "por conveniência"
  quando a tarefa é sobre o outro app. Cada app evolui isolado do outro.
- Ao mexer em `vite.config.js` / `vercel.json` (que afetam o build/deploy dos
  dois juntos, pois compartilham o mesmo repo), garanta que a mudança builda
  **os dois entry points** (`index.html` e `index-salao.html`) sem que um
  interfira no outro.

## Cuidado com `git checkout <branch> -- .`

A branch `main` (ARM) e a branch do Salão 360 têm arquivos de config
divergentes (`vite.config.js`, `package.json`). Rodar `git checkout main -- .`
em qualquer branch do Salão 360 sobrescreve esses arquivos silenciosamente
com a versão do ARM — já aconteceu uma vez nesta sessão (revertido a tempo,
sem impacto). Prefira `git show <branch>:<path>` para só *ler* algo de outra
branch sem tocar no working tree.
