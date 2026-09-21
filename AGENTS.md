# AGENTS.md — Betelgeuse Coments

Guia para agentes de IA que trabalham neste repositório. Leia este arquivo antes de fazer qualquer alteração.

---

## 1. Visão geral do projeto

**Betelgeuse Coments** é um app web de **análise de sentimento e moderação de comentários do Instagram**. O usuário loga com a conta Instagram (OAuth da Meta), vê os posts da conta, analisa os comentários (1 crédito por comentário novo) e pode ocultar comentários ou responder a eles.

Stack principal:

- **Next.js 14.2.35** (App Router, React 18, TypeScript estrito, Tailwind CSS 3.4)
- **shadcn/ui** (estilo "new-york", cor base Slate, CSS variables) com 12 componentes em `src/components/ui/`
- **Prisma 6.19.3** + PostgreSQL no **Supabase** (conexão via pooler)
- **next-auth v4** com provider OAuth customizado (`id: "instagram"`), adapter `@auth/prisma-adapter`
- **Análise de sentimento por léxico PT-BR próprio** (`src/lib/sentiment.ts`) — sem OpenAI nem serviço externo
- Deploy previsto: **Vercel** (domínio de referência: `https://betelgeuse-coments.vercel.app`)

Repo: `https://github.com/mlmpbr2/betelgeuse-coments` (branch `main`).

> **Atenção:** existe um `HANDOFF.md` na raiz com o estado da última sessão. Ele pode estar **adiantado em relação ao código** (ex.: descreve a migração do fluxo Facebook Login para Instagram Login, mas `src/lib/auth.ts` ainda usa URLs de `facebook.com`). Sempre confira o código-fonte como fonte da verdade.

## 2. Estrutura de diretórios

```
src/
├── app/                    # App Router (rotas e páginas)
│   ├── page.tsx            # "/" → redirect para /login
│   ├── login/page.tsx
│   ├── dashboard/page.tsx  # área logada (server component)
│   ├── privacy/page.tsx    # exigidas pelo App Review da Meta
│   ├── terms/page.tsx
│   └── api/                # API routes
│       ├── auth/[...nextauth]/route.ts
│       ├── instagram/{posts,comments,hide,reply}/route.ts
│       └── sentiment/analyze/route.ts
├── components/
│   ├── ui/                 # shadcn/ui (button, card, dialog, table, etc.)
│   ├── auth/LoginButton.tsx
│   └── dashboard/{MetricCards,PostsTable}.tsx
├── lib/
│   ├── prisma.ts           # PrismaClient singleton (evita hot-reload leak)
│   ├── auth.ts             # authOptions do next-auth (provider instagram)
│   ├── instagram.ts        # cliente da Instagram Graph API v21.0
│   ├── sentiment.ts        # léxico PT-BR de sentimento
│   └── utils.ts            # cn() (clsx + tailwind-merge)
└── types/next-auth.d.ts    # extensão de tipos do Session/JWT
prisma/
├── schema.prisma           # 8 modelos (ver seção 5)
└── init.sql, init-missing.sql  # SQL legado de criação das tabelas
```

Arquivos legados **vazios** (protótipo Streamlit antigo, mantidos por regra do usuário de nunca deletar): `app.py`, `requirements.txt`, `utils/*.py`, `assets/`, `cna-tmp.old/`.

## 3. Comandos de build e execução

```bash
npm run dev      # servidor de desenvolvimento (localhost:3000)
npm run build    # build de produção (deve passar com exit 0)
npm run start    # serve o build
npm run lint     # next lint (eslint-config-next)

npx prisma generate   # gera o client (após mudar schema.prisma)
npx prisma db push    # sincroniza o schema com o banco (lê o arquivo .env)
```

**Regras do ambiente (importantes):**

- Sempre use `npm install --legacy-peer-deps` — há um bug do npm 10.7.0 (arborist) que quebra o install normal neste projeto.
- Node do usuário é **20.14.0**: não atualize `prisma`/`@prisma/client` para 7.x (exige Node ≥ 20.19). Fixados em `^6.19.3`.
- **Não há testes automatizados** no projeto. A verificação padrão é `npm run build` (checa tipos e lint) + teste manual dos fluxos.
- O nome da pasta do projeto tem underscore (`betelgeuse_coments`, inválido para npm) — por isso o scaffold foi feito em subpasta temporária. Não rode `create-next-app` na raiz.

## 4. Variáveis de ambiente

Modelo em `.env.example`; arquivos reais `.env` e `.env.local` existem só localmente e **nunca** devem ser commitados (já cobertos pelo `.gitignore`).

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Pooler de **transação** do Supabase (porta 6543, `?pgbouncer=true`) — usada pela aplicação |
| `DIRECT_URL` | Pooler de **sessão** do Supabase (porta 5432) — usada pelo Prisma CLI (`db push`/`migrate`) |
| `NEXTAUTH_URL` | `http://localhost:3000` local; na Vercel a URL pública (nunca localhost) |
| `NEXTAUTH_SECRET` | Gere com `openssl rand -base64 32` |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | Contêm o **Instagram App ID / Secret** (painel Meta → Instagram → API setup with Instagram Login), **não** o App ID principal. Nomes mantidos a pedido do usuário |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Cliente Supabase JS (uso client-side, opcional) |

Observações:

- O Prisma CLI lê **`.env`** (não `.env.local`); o Next.js lê ambos.
- No Supabase free tier, **não** use a URL direta `db.<ref>.supabase.co:5432` (P1001); use sempre os hosts do pooler `aws-0-<regiao>.pooler.supabase.com`.
- Projetos Supabase free são **pausados** após inatividade (botão Restore no painel).

## 5. Banco de dados (Prisma)

`prisma/schema.prisma` — PostgreSQL, com `url` + `directUrl`. 8 modelos:

- **NextAuth** (via `@auth/prisma-adapter`): `User`, `Account`, `Session`, `VerificationToken`
- **Domínio**: `InstagramAccount` (token longo da conta IG, `igUserId` único), `Credit` (saldo, 1:1 com User), `CommentAnalysis` (1 por `commentId`, com `sentiment` e `score`), `Payment` (valor em centavos, status `pending|paid|failed`)

Regras de negócio implementadas:

- **Créditos**: `INITIAL_CREDITS = 50` no primeiro login (`src/lib/auth.ts:6`). 1 crédito por comentário analisado; comentários já analisados não são recobrados; HTTP 402 se o saldo for insuficiente; débito em transação Prisma junto com o `createMany` (`src/app/api/sentiment/analyze/route.ts`).
- Sentimentos possíveis: `"positivo" | "neutro" | "negativo"`; score de -1 a 1.

## 6. Autenticação e integração Instagram

Provider OAuth customizado em `src/lib/auth.ts` (id `"instagram"`), **não** o `InstagramProvider` embutido do next-auth (que usava a Basic Display API, descontinuada pela Meta).

Estado atual do código (verificado em `src/lib/auth.ts`):

- `authorization.url` aponta para `https://www.facebook.com/v21.0/dialog/oauth` com scopes `email public_profile pages_show_list pages_read_engagement instagram_business_basic instagram_business_manage_comments`.
- `token`: `https://graph.facebook.com/v21.0/oauth/access_token`; `userinfo`: `/me` com `fields=id,name,email,picture`.
- `checks: ["none"]` — o OAuth do Instagram não retorna `state` nem suporta PKCE; isso **desliga a proteção anti-CSRF do login** (trade-off conhecido, reavaliar antes de produção séria).
- No callback `signIn`, o token curto é trocado por um long-lived (60 dias) via `grant_type=ig_exchange_token` (`src/lib/instagram.ts:25`) e salvos em `InstagramAccount`; créditos iniciais são criados via upsert.

API do Instagram em `src/lib/instagram.ts`: base `https://graph.instagram.com/v21.0`, funções `getPosts`, `getComments`, `setCommentHidden`, `replyToComment`, todas autenticadas com o token salvo no banco.

**Limitações do fluxo:**

- Instagram Login **não aceita localhost** como redirect URI — o login só funciona via URL pública (Vercel). Cadastre `https://<dominio>/api/auth/callback/instagram` no painel Meta.
- Enquanto o app Meta estiver em modo **Development**, só contas IG com papel de testador conseguem logar. App Review da Meta é o passo futuro para liberar (exige URL pública e as páginas `/privacy` e `/terms`, que já existem).

## 7. Convenções de código

- Idioma: código, mensagens de erro de API e UI em **português (sem acentos nas strings do backend)**; comentários em PT-BR; documentação em PT-BR.
- TypeScript estrito (`"strict": true`), alias de import `@/*` → `src/*`.
- Server Components por padrão; `"use client"` apenas onde há interatividade (tabelas, botões).
- Estilos com Tailwind + classes utilitárias do shadcn/ui; use `cn()` de `src/lib/utils.ts` para combinar classes condicionalmente.
- Componentes shadcn/ui gerados em `src/components/ui/` — não edite à mão; regenere com o CLI do shadcn quando necessário.
- Novos componentes de feature vão em `src/components/<feature>/` (ex.: `dashboard/`, `auth/`).
- API routes validam sessão com `getServerSession(authOptions)` no início e retornam JSON com `error` + status apropriado (400/401/402/404/502).

## 8. Testes

Não existe suíte de testes (sem Jest, Vitest, Playwright). Antes de considerar uma mudança pronta:

1. `npm run build` deve passar com exit 0 (valida tipos e lint).
2. `npm run lint` sem erros novos.
3. Teste manual do fluxo afetado com o servidor de dev.

Não crie arquivos de teste/framework sem pedido explícito do usuário.

## 9. Deploy (Vercel)

1. Importar `mlmpbr2/betelgeuse-coments` em vercel.com/new (ou `vercel` / `vercel --prod`).
2. Configurar as variáveis de ambiente da seção 4 em Settings → Environment Variables (`NEXTAUTH_URL` = URL pública da Vercel, nunca localhost).
3. Garantir que `npx prisma db push` já foi rodado contra o banco.

## 10. Segurança

- **Nunca** commitar ou colar segredos reais no chat; `.env`/`.env.local` ficam só na máquina local.
- Nunca expor o `NEXTAUTH_SECRET` nem os tokens de acesso do Instagram (armazenados em `InstagramAccount.accessToken`).
- `checks: ["none"]` no provider OAuth deixa o login sem proteção anti-CSRF — não reverter sem entender a limitação do fluxo Instagram.
- Os 18 avisos do `npm audit` foram avaliados e não bloqueiam (registro do HANDOFF).

## 11. Regras do usuário (sempre respeitar)

- **Nunca deletar ou sobrescrever arquivos sem confirmação explícita** ("SOLICITAÇÃO PARA DELETAR: ... Confirma?" → aguardar SIM/NÃO). "Limpar" = renomear/mover para `*.old`.
- Nenhum `git commit`/`git push` sem autorização explícita — o usuário executa git no próprio terminal quando possível.
- Confirmar cada passo antes de prosseguir (gates); não sair do diretório do projeto sem avisar.
