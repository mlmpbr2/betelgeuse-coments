# HANDOFF — Betelgeuse Coments (documento de continuação)

> Documento para retomar o trabalho em sessão futura sem começar do zero.
> Última atualização: set/2026 (sessão de correção do OAuth + banco). Ao retomar, leia este arquivo inteiro primeiro.

---

## 1. O que é o projeto

App de análise de sentimento e moderação de comentários do Instagram.
Stack: **Next.js 14.2.35** (App Router, TS, Tailwind, shadcn/ui tema Slate) + **Prisma 6.19.3** (Supabase/Postgres) + **next-auth v4** com provider OAuth customizado **"Instagram API with Instagram Login"** + análise de sentimento por **léxico PT-BR próprio** (sem OpenAI). Deploy previsto: Vercel.

Repo GitHub: `https://github.com/mlmpbr2/betelgeuse-coments` (branch `main`, código já enviado).

---

## 2. Estado atual — o que está PRONTO e verificado

- Scaffold Next.js 14 completo (feito em subpasta `cna-tmp` e movido para a raiz; `cna-tmp.old` vazio ainda existe na raiz — pode ser removido com confirmação do usuário).
- shadcn/ui instalado (tema Slate, CSS variables) com 12 componentes em `src/components/ui/`.
- Dependências: `next-auth@^4.24.15`, `@auth/prisma-adapter`, `prisma@6.19.3` + `@prisma/client@6.19.3` (fixados na v6 — ver decisões), `@supabase/supabase-js`, `lucide-react`, `date-fns`.
- `prisma/schema.prisma` com 8 modelos: `User`, `Account`, `Session`, `VerificationToken` (NextAuth) + `InstagramAccount`, `Credit`, `CommentAnalysis`, `Payment`. `npx prisma generate` OK.
- Arquivos de código (todos criados e buildando):
  - Libs: `src/lib/prisma.ts`, `src/lib/auth.ts`, `src/lib/instagram.ts`, `src/lib/sentiment.ts`, `src/types/next-auth.d.ts`
  - API: `auth/[...nextauth]`, `instagram/posts`, `instagram/comments`, `instagram/hide`, `instagram/reply`, `sentiment/analyze`
  - Páginas: `/` (redirect → `/login`), `/login`, `/dashboard`, `/privacy`, `/terms`
  - Componentes: `auth/LoginButton`, `dashboard/MetricCards`, `dashboard/PostsTable`
- `npm run build` passa (exit 0), lint e tipos OK.
- `.env.example` = molde com placeholders; `.env.local` e `.env` existem localmente com valores reais (NUNCA commitar — já cobertos pelo `.gitignore`).
- Arquivos legados Streamlit (`app.py`, `requirements.txt`, `utils/`, `assets/`) intactos e vazios — não foram deletados por regra do usuário.
- **Migração Instagram Login APLICADA em `src/lib/auth.ts`** (set/2026): `authorization.url=https://www.instagram.com/oauth/authorize`, scopes só `instagram_business_basic instagram_business_manage_comments`, `token=https://api.instagram.com/oauth/access_token`, `userinfo=https://graph.instagram.com/v21.0/me` (`fields=user_id,username`), `profile()`/`signIn` mapeiam `user_id`/`username`. Build OK após a mudança.
- **Banco Supabase OK** (set/2026): projeto ref `okyoodnbilngmecrkmuu`, poolers corretos no `.env` (`DATABASE_URL` = transaction pooler 6543 + `pgbouncer=true`; `DIRECT_URL` = session pooler 5432; host `aws-0-sa-east-1.pooler.supabase.com`). As 8 tabelas do app foram criadas de forma **não destrutiva** via `prisma/manual-migrations/0001-init-nextjs.sql` (gerado com `prisma migrate diff --from-empty`, aplicado com `prisma db execute` na DIRECT_URL). As 8 tabelas legadas do banco (`billing_summary`, `clients`, `comments`, `daily_usage`, `poll_logs`, `posts`, `superadmin_users`, `webhook_events`) foram **preservadas**.
- SQL da migração manual arquivado em `prisma/manual-migrations/0001-init-nextjs.sql` (padrão para futuras mudanças de schema).
- **App Meta em Live Mode desde 22/09/2026** — resolveu o bloqueio de leitura de comentários (em Development a Meta omitia silenciosamente TODOS os comentários do payload — inclusive os da própria conta dona/admin — retornando `data` vazio com cursores válidos; provado via Graph API Explorer com token IGAA fresco). Login, análise e moderação (ocultar/responder) operando de ponta a ponta em produção.
- **"Login frio" mapeado (H1 confirmada, set/2026):** em sessão fria, o checkpoint anti-fraude do Instagram (recaptcha + código de e-mail) no meio do OAuth faz a Meta dropar o redirect — o usuário cai no perfil do IG e **nunca** chama `/api/auth/callback/instagram`. Não é bug do app: instrumentação temporária (`[auth-debug]` + middleware) provou zero hits no callback no cenário quebrado vs. cadeia completa no cenário logado. Mitigação: aviso na tela de login ("logue no instagram.com antes"). Logs removidos após o diagnóstico (commit `97f9620`).

---

## 3. Pendências — ORDEM para retomar

1. ~~Corrigir URLs do banco no `.env`~~ — ✅ FEITO (set/2026). Projeto atual: ref `okyoodnbilngmecrkmuu`, region `sa-east-1`, poolers 6543/5432 configurados. Atenção: free tier pausa após inatividade (botão Restore no painel).
2. ~~Rodar `npx prisma db push`~~ — ✅ FEITO de forma não destrutiva (set/2026): 8 tabelas criadas via `prisma/manual-migrations/0001-init-nextjs.sql`. **⚠️ NUNCA rodar `npx prisma db push` neste banco** — ele propõe derrubar as 8 tabelas legadas e pede `--accept-data-loss`. Para mudanças futuras no schema, repetir o fluxo `migrate diff` + `db execute`.
3. **Deploy na Vercel**: importar `mlmpbr2/betelgeuse-coments` em vercel.com/new (ou `vercel` + `vercel --prod`).
4. **Variáveis de ambiente na Vercel** (Settings → Environment Variables): `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `FACEBOOK_CLIENT_ID` (= **Instagram App ID**), `FACEBOOK_CLIENT_SECRET` (= **Instagram App Secret**), `SUPABASE_URL`, `SUPABASE_ANON_KEY`, e `NEXTAUTH_URL=https://betelgeuse-coments.vercel.app` (NUNCA localhost na Vercel; o `.env.local` local continua com `http://localhost:3000`).
5. **Testar login por `https://betelgeuse-coments.vercel.app`** em aba anônima. Localhost NÃO funciona com Instagram Login (ver seção 4).
6. **Depois do login funcionar**: testar dashboard → "Analisar" num post → ocultar/responder comentário. Créditos: 50 iniciais por usuário novo (constante `INITIAL_CREDITS` em `src/lib/auth.ts`).
7. **Futuro**: App Review da Meta para sair do modo Development (exige URL pública, `/privacy` e `/terms` — já criadas). Em Development, só contas IG com papel de testador no app conseguem logar. ✅ **App publicado (Live) em 22/09/2026** — seção obsoleta quanto ao modo; **atenção para o revisor do App Review: ele deve estar logado no instagram.com antes de iniciar o fluxo** — em sessão fria o checkpoint anti-fraude do IG quebra o redirect e cai no perfil (ver "Login frio" na seção 2).

---

## 4. Problemas encontrados e soluções (não repetir erros)

| Problema | Causa | Solução aplicada |
|---|---|---|
| `create-next-app .` falharia | Nome da pasta `betelgeuse_coments` tem underscore (inválido p/ npm) | Scaffold em `cna-tmp/` + mover tudo para a raiz |
| `npm install` falhava: `Cannot read properties of null (reading 'edgesOut')` | Bug do npm 10.7.0 (arborist) | Usar `--legacy-peer-deps` em todos os installs |
| `prisma@8.0.0-rc.12` / Prisma 7 quebrava | Prisma 7+ exige Node ≥20.19; usuário tem Node 20.14.0 | Fixado **prisma + @prisma/client em ^6.19.3** |
| `Invalid Scopes: email, pages_show_list, ...` | App Meta configurado para **Instagram Login** (fluxo novo), código usava **Facebook Login** (fluxo antigo) | Migrado em set/2026 e AGORA APLICADO no código: `authorization.url=https://www.instagram.com/oauth/authorize`, scope `instagram_business_basic,instagram_business_manage_comments`, token `https://api.instagram.com/oauth/access_token`, userinfo `https://graph.instagram.com/v21.0/me` (`fields=user_id,username`), base da API `https://graph.instagram.com/v21.0`, long-lived via `grant_type=ig_exchange_token` |
| `OAuthCallbackError: state missing from the response` | OAuth do Instagram não retorna `state` nem suporta PKCE | `checks: ["none"]` no provider em `src/lib/auth.ts` |
| `Invalid redirect_uri` (localhost) | Instagram Login não aceita localhost (a regra "localhost automático em dev" vale só p/ Facebook Login); campo do painel exige URL completa e exata | Testar via URL pública da Vercel: `https://betelgeuse-coments.vercel.app/api/auth/callback/instagram` (cadastrar no painel Meta, seção **Instagram → API setup with Instagram Login**) |
| `P1001` / `tenant/user not found` no pooler | `.env` apontava para projeto antigo pausado (`robremxcenxaodbsrafy`); Supabase free pausa por inatividade | `.env` corrigido para o projeto ativo `okyoodnbilngmecrkmuu` (região sa-east-1). Sintoma de projeto pausado = `tenant ... not found` → botão Restore no painel |
| `db push` queria derrubar 6 tabelas legadas com dados | Banco já tinha tabelas de projeto anterior | **Não** usar `db push` nem `--accept-data-loss`. Criar as 8 tabelas via `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` + `prisma db execute --file <sql> --url "$DIRECT_URL"` |

---

## 5. Decisões técnicas importantes

- **Credenciais Meta**: `FACEBOOK_CLIENT_ID`/`FACEBOOK_CLIENT_SECRET` contêm o **Instagram App ID/Secret** (painel → Instagram → API setup with Instagram Login), NÃO o App ID principal do app Meta. Nomes de variáveis mantidos a pedido do usuário.
- **Escopo OAuth**: `instagram_business_basic,instagram_business_manage_comments` — são os únicos necessários/válidos no fluxo Instagram Login para este app.
- **Provider é customizado** (`id: "instagram"`), não o `InstagramProvider` embutido do next-auth (que usava a Basic Display API, descontinuada pela Meta).
- **Sem Página do Facebook**: no fluxo Instagram Login o token já é da conta IG; sem descoberta via `/me/accounts`. `igUserId` salvo = `user_id` retornado pelo Instagram.
- **Créditos**: 1 crédito por comentário analisado; comentários já analisados não são recobrados; 402 se saldo insuficiente; débito em transação Prisma junto com o `createMany`.
- **`checks: ["none"]`** desliga a proteção anti-CSRF do login (trade-off conhecido do Instagram+next-auth v4; reavaliar antes de produção séria).
- **Migrações de schema**: fluxo manual `migrate diff` + `db execute` na DIRECT_URL, com SQL arquivado em `prisma/manual-migrations/NNNN-descricao.sql`. Motivo: `db push` derrubaria tabelas legadas; `migrate dev` precisa de shadow database (indisponível no Supabase free).
- Vulnerabilidades do `npm audit` (18) e avisos de engine do Node foram avaliados e não bloqueiam.

---

## 6. Regras do usuário (SEMPRE respeitar)

- **NUNCA deletar/sobrescrever arquivos sem confirmação explícita** ("SOLICITAÇÃO PARA DELETAR: ... Confirma?" → aguardar SIM/NÃO). "Limpar" = renomear/mover (ex.: `*.old`).
- Não sair do diretório do projeto sem avisar.
- Confirmar cada passo antes de prosseguir (gates).
- **Nenhum `git commit`/`push` sem autorização explícita** (o usuário executa git no próprio terminal quando possível).
- Não colar segredos reais no chat; `.env.local`/`.env` ficam só na máquina.

---

## 7. Como retomar

1. Abra o projeto: `c:\Users\mario.mello\Desktop\betelgeuse_coments`
2. Diga ao assistente: **"Leia o HANDOFF.md e continue a partir da seção 3"**.
3. Próximo item pendente: **deploy na Vercel** (itens 3–5 da seção 3) — importar o repo, configurar env vars e testar o login pela URL pública.
