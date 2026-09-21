# Relatório — Objeto IG Comment: análise completa no contexto do Betelgeuse Coments

> **Escopo:** este relatório analisa como o objeto **Comment** da Instagram Graph API é usado no projeto — campos, endpoints, webhooks, permissões e limitações — com base no **código-fonte** do repositório. Cada afirmação cita o arquivo/linha. Quando algo for conhecimento geral da plataforma Meta (e não estiver no código), isso estará sinalizado como *(fora do código — verificar na doc da Meta)*.
>
> **Base analisada:** `src/lib/instagram.ts`, `src/lib/auth.ts`, `prisma/schema.prisma`, `src/app/api/instagram/{posts,comments,hide,reply}/route.ts`, `src/app/api/sentiment/analyze/route.ts`.
>
> Data da análise: sessão de fev/2026.

---

## 1. Visão geral do fluxo de comentários no projeto

```
Login Instagram (OAuth)  →  token long-lived salvo em InstagramAccount
        │
        ▼
GET /api/instagram/posts            → getPosts(igUserId, token)     → IG: /{ig-user-id}/media
        │
        ▼
GET /api/instagram/comments?postId  → getComments(mediaId, token)   → IG: /{media-id}/comments
        │
        ▼
POST /api/sentiment/analyze         → getComments + léxico PT-BR    → grava CommentAnalysis + débito de créditos
        │
        ▼
POST /api/instagram/hide            → setCommentHidden              → IG: POST /{comment-id} (is_hidden)
POST /api/instagram/reply           → replyToComment                → IG: POST /{comment-id}/replies
```

Toda chamada à API do Instagram é feita **server-side**, autenticada com o token long-lived da conta do usuário logado, lido do banco (`InstagramAccount.accessToken`). Não existe cache nem camada de fila: as rotas chamam a Graph API de forma síncrona a cada request.

---

## 2. O objeto IG Comment — campos

### 2.1 Campos solicitados pelo projeto

O tipo `InstagramComment` em `src/lib/instagram.ts:59-65` e o parâmetro `fields` da requisição em `src/lib/instagram.ts:72`:

```ts
export type InstagramComment = {
  id: string;
  text?: string;
  username?: string;
  timestamp?: string;
  hidden?: boolean;
};
```

| Campo | Tipo no código | Uso no projeto | Origem |
|---|---|---|---|
| `id` | `string` | Identificador único do comentário. Chave de deduplicação (`commentId` único em `CommentAnalysis`, `schema.prisma:86`) e alvo das ações de hide/reply | `instagram.ts:72` |
| `text` | `string?` | Texto analisado pelo léxico de sentimento (`analyzeSentiment(comment.text ?? "")`, `analyze/route.ts:69`) e persistido em `CommentAnalysis.text` | `instagram.ts:72` |
| `username` | `string?` | Autor do comentário, salvo em `CommentAnalysis.author` (`analyze/route.ts:74`) | `instagram.ts:72` |
| `timestamp` | `string?` | **Solicitado, mas nunca usado** — não é persistido nem exibido | `instagram.ts:72` |
| `hidden` | `boolean?` | Estado de ocultação no Instagram, salvo em `CommentAnalysis.hidden` na análise (`analyze/route.ts:78`) | `instagram.ts:72` |

### 2.2 Campos persistidos (banco) vs. campos da API

O modelo `CommentAnalysis` (`schema.prisma:84-97`) guarda um recorte do objeto Comment no momento da análise:

| Coluna | Fonte | Observação |
|---|---|---|
| `commentId` | `id` da API | `@unique` — 1 análise por comentário |
| `postId` | parâmetro da rota | `mediaId` do post, não vem do objeto Comment |
| `author` | `username` | pode ser `null` |
| `text` | `text` | `String @db.Text` |
| `sentiment` | calculado localmente | `"positivo" \| "neutro" \| "negativo"` (léxico PT-BR, `src/lib/sentiment.ts`) |
| `score` | calculado localmente | `-1` a `1` |
| `hidden` | `hidden` (na análise) **ou** estado local pós-ação | atualizado por `hide/route.ts:36-39` |
| `repliedAt` | — | preenchido localmente por `reply/route.ts:40-43` (a API não retorna isso) |

**Implicação importante:** depois que um comentário é analisado, o app passa a operar sobre o **snapshot salvo no banco**, não sobre o objeto vivo do Instagram. Se o comentário for editado ou excluído no Instagram, o app não fica sabendo (ver §5 e §6).

---

## 3. Endpoints da Instagram Graph API utilizados

Base URL em `src/lib/instagram.ts:1`: `https://graph.instagram.com/v21.0`.

| Função (`src/lib/instagram.ts`) | Endpoint | Método | Parâmetros | Rota que expõe |
|---|---|---|---|---|
| `getPosts` (:49) | `/{igUserId}/media` | GET | `fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count`, `limit=50`, `access_token` | `GET /api/instagram/posts` |
| `getComments` (:67) | `/{mediaId}/comments` | GET | `fields=id,text,username,timestamp,hidden`, `limit=100`, `access_token` | `GET /api/instagram/comments?postId=`, `POST /api/sentiment/analyze` |
| `setCommentHidden` (:77) | `/{commentId}` | POST | `is_hidden=true\|false`, `access_token` | `POST /api/instagram/hide` |
| `replyToComment` (:92) | `/{commentId}/replies` | POST | `message`, `access_token` | `POST /api/instagram/reply` |
| `getLongLivedToken` (:25) | `/access_token` | GET | `grant_type=ig_exchange_token`, `client_secret`, `access_token` | usado no callback `signIn` (`src/lib/auth.ts:55`) |

### 3.1 Contratos das API routes

Todas as rotas seguem o mesmo padrão (ver `AGENTS.md` §7): validam sessão com `getServerSession(authOptions)`, buscam a conta IG mais recente do usuário (`findFirst`, `orderBy: { updatedAt: "desc" }`) e retornam `{ error }` com o status apropriado.

| Rota | Auth | Validações | Sucesso | Erros |
|---|---|---|---|---|
| `GET /api/instagram/posts` | 401 se sem sessão | 404 se sem conta IG vinculada | `{ posts }` | 502 (Graph API) |
| `GET /api/instagram/comments` | 401 | 400 sem `postId`; 404 sem conta | `{ comments }` | 502 |
| `POST /api/instagram/hide` | 401 | 400 sem `commentId`/`hidden` boolean; 404 sem conta | `{ success, commentId, hidden }` + atualiza `CommentAnalysis.hidden` | 502 |
| `POST /api/instagram/reply` | 401 | 400 sem `commentId`/`message`; 404 sem conta | `{ success, commentId, replyId }` + grava `repliedAt` | 502 |
| `POST /api/sentiment/analyze` | 401 | 400 sem `postId`; 404 sem conta; **402 se saldo < comentários novos** | `{ analyzed, results, balance }` | 502 |

Regra de créditos (`analyze/route.ts:43-88`): comentários já presentes em `CommentAnalysis` são filtrados (`commentId { in: [...] }`), só os novos são cobrados (1 crédito cada), e o débito acontece em **transação Prisma** junto com o `createMany` — ou tudo grava, ou nada.

---

## 4. Webhooks

**O projeto não implementa nenhum webhook de comentários.** *(Verificável: não há rotas de webhook em `src/app/api/`, nenhuma assinatura `x-hub-signature`, nenhum modelo de evento no schema.)*

Consequências no código:

- **Atualizações chegam só por polling manual** — o usuário clica "Analisar" no dashboard, que dispara `getComments` na hora (`analyze/route.ts:36`).
- **Estado diverge silenciosamente** — se alguém ocultar/responder/excluir um comentário direto no Instagram, `CommentAnalysis.hidden` e `repliedAt` ficam desatualizados. O campo `hidden` só é regravado quando o próprio app executa o hide (`hide/route.ts:36-39`).

O que seria necessário para webhooks de comentários *(fora do código — verificar na doc da Meta)*:

1. App Meta com **Instagram Login** + endpoint público de webhook (ex.: `POST /api/webhooks/instagram`) cadastrado no painel.
2. Permissão de comentários no app (ver §5) e modo **Live** (em Development, webhooks têm restrições).
3. Verificação do token de verificação (`hub.verify_token`) na assinatura do webhook e processamento do campo `comments` do evento.
4. Reconciliação: o evento traz `id`/`text` do comentário e `media.id` — dá para atualizar `CommentAnalysis` em tempo real, mas o evento não traz todos os campos (`username`, `hidden`), então o polling continuaria sendo necessário para dados completos.

---

## 5. Permissões e autenticação

### 5.1 Estado do código (importante — diverge do HANDOFF)

`src/lib/auth.ts:23-34` ainda usa o **fluxo Facebook Login** (URLs `facebook.com`/`graph.facebook.com`), embora o `HANDOFF.md` descreva a migração para Instagram Login como aplicada. Os scopes solicitados hoje:

```
email public_profile pages_show_list pages_read_engagement
instagram_business_basic instagram_business_manage_comments
```

(`src/lib/auth.ts:26`)

Para as **operações de comentário** em si, o que o código exerce é:

| Operação | Permissão exigida *(fora do código — verificar na Meta)* | Scope no código |
|---|---|---|
| Ler comentários (`/{media}/comments`) | `instagram_business_basic` | ✅ presente |
| Ocultar comentário (`is_hidden`) | `instagram_business_manage_comments` | ✅ presente |
| Responder comentário (`/{comment}/replies`) | `instagram_business_manage_comments` | ✅ presente |
| Trocar por token long-lived (`ig_exchange_token`) | app secret + token de usuário | ✅ funciona no código |

Os scopes `email public_profile pages_show_list pages_read_engagement` (:26) são do fluxo Facebook e tendem a gerar `Invalid Scopes` num app configurado para **Instagram Login** — foi exatamente o erro que motivou a migração descrita no HANDOFF §4. **Corrigir `src/lib/auth.ts` é pré-requisito de qualquer teste de comentários.**

### 5.2 Token

- Token curto do OAuth é trocado por **long-lived (60 dias)** no callback `signIn` via `getLongLivedToken` (`src/lib/auth.ts:55`, `instagram.ts:25-36`), gravado em `InstagramAccount.accessToken` com `tokenExpiresAt`.
- **Não existe renovação automática**: `tokenExpiresAt` é salvo mas nunca consultado. Após a expiração, todas as chamadas de comentários passam a falhar com 502 até novo login.
- O login roda com `checks: ["none"]` (`src/lib/auth.ts:22`) — sem proteção anti-CSRF (trade-off documentado no `AGENTS.md` §10).

---

## 6. Limitações e riscos (evidenciados pelo código)

| # | Limitação | Evidência | Impacto |
|---|---|---|---|
| L1 | **Sem paginação** em posts e comentários | `limit=50`/`limit=100` fixos; cursor `paging.next` ignorado (`instagram.ts:54, 72`) | Contas com >50 posts ou posts com >100 comentários ficam truncadas silenciosamente |
| L2 | **Só comentários de 1º nível** | `/{media}/comments` sem `/{comment}/replies` (`instagram.ts:67-75`) | Respostas a comentários nunca são analisadas nem moderadas |
| L3 | **Snapshot estático** após análise | `CommentAnalysis` não é revalidado contra a API | Texto editado/comentário apagado no IG não reflete no app |
| L4 | **Sem verificação de propriedade** do comentário nas ações | `hide`/`reply` aceitam qualquer `commentId` (`hide/route.ts:7-19`, `reply/route.ts:7-21`) | A própria Graph API deve rejeitar comentário alheio, mas o app não valida antes; o update local em `CommentAnalysis` é limitado por `igAccountId`, o que mitiga sujeira no banco |
| L5 | **Token expira sem aviso** | `tokenExpiresAt` nunca lido | Falhas 502 genéricas após 60 dias; UX ruim, sem orientação de relogar |
| L6 | **Texto vazio analisável** | `analyzeSentiment(comment.text ?? "")` (`analyze/route.ts:69`) | Comentário sem texto (ex.: só emoji, conforme a API pode retornar) gera análise de string vazia e consome crédito |
| L7 | **`username` pode faltar** | `author: comment.username ?? null` (`analyze/route.ts:74`) | Autor `null` no histórico; campo `username` de comentário é frágil entre versões da API *(fora do código)* |
| L8 | **Rate limits da Graph API** | sem retry/backoff em `graphFetch` (`instagram.ts:7-16`) | Throttling vira 502 direto para o usuário *(limites exatos fora do código — verificar na Meta)* |
| L9 | **App em modo Development** | — | Só contas IG com papel de testador logam; liberação exige App Review *(documentado no HANDOFF §3.7)* |
| L10 | **Fluxo OAuth desatualizado** | §5.1 | Login quebrado com app Meta configurado para Instagram Login |

---

## 7. Conclusão e recomendações priorizadas

1. **Corrigir `src/lib/auth.ts` para o Instagram Login** (URLs, scopes, userinfo, mapeamento de perfil) — sem isso, nenhum fluxo de comentários é testável. *(Bloqueador, fora do escopo deste relatório.)*
2. **Adicionar paginação** em `getPosts`/`getComments` (seguir `paging.next`) — barato e elimina L1.
3. **Checar `tokenExpiresAt`** nas rotas e redirecionar para relogin com mensagem clara — elimina L5.
4. **Validar `text` não vazio** antes de cobrar crédito — elimina L6.
5. **Considerar webhook de comentários** após o App Review, para atualização em tempo real (§4).
6. **Manter o HANDOFF/AGENTS sincronizados** com o código após a correção do item 1.

---

*Relatório gerado a partir do código-fonte em fev/2026. Itens marcados como "fora do código" devem ser confirmados na documentação oficial da Meta (Instagram Platform / Graph API v21.0) antes de decisões de produção.*
