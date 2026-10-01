# Cloudflare Starter & Repository Inventory

**Snapshot verificato:** 2026-10-01  
**Owner:** Soliwkr / Chris  
**Scopo:** catalogo di partenza per lo Starter Gate. Non sostituisce la verifica live prima dell'adozione.

## Fonti primarie

- [cloudflare/templates](https://github.com/cloudflare/templates) — catalogo ufficiale di template Workers. Lo snapshot del 2026-10-01 contiene 41 template pubblicati in `templates.json`.
- [Cloudflare Workers templates](https://developers.cloudflare.com/workers/get-started/quickstarts/) — catalogo/documentazione ufficiale.
- [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) — Wrangler, create-cloudflare, Vite/Vitest plugin e tooling ufficiale.
- [cloudflare/agents](https://github.com/cloudflare/agents) — Agents SDK e examples.
- [cloudflare/agents-starter](https://github.com/cloudflare/agents-starter) — starter ufficiale per agenti AI stateful.
- [cloudflare/vinext](https://github.com/cloudflare/vinext) — percorso raccomandato da Cloudflare per nuovi progetti Next.js/Next-like su Workers, da verificare sempre per compatibilità.
- [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs) — documentazione e reference corrente.

## Shortlist P0 — basi da controllare per prime

| Use case | Base da controllare per prima | Nota |
|---|---|---|
| Full-stack React moderno | `cloudflare/templates/react-router-hono-fullstack-template` | React Router + Hono + Vite + shadcn/ui su Workers |
| React/Vite semplice con API | `cloudflare/templates/vite-react-template` | React + Vite + Hono + Workers |
| SaaS/admin dashboard | `cloudflare/templates/saas-admin-template` | Admin UI + D1; ottima base per backoffice |
| CRUD SQL Cloudflare-native | `cloudflare/templates/d1-template` | Base minima D1 |
| D1 con read replication/session | `cloudflare/templates/d1-starter-sessions-api-template` | Per pattern D1 più evoluti |
| Postgres esterno | `cloudflare/templates/react-postgres-fullstack-template` o `postgres-hyperdrive-template` | Hyperdrive; non forzare D1 |
| Auth | `cloudflare/templates/openauth-template` | OpenAuth su Workers, D1/KV |
| File/object app | `cloudflare/templates/r2-explorer-template` | R2 con UI |
| Durable Objects | `hello-world-do-template` / `durable-chat-template` | Stato coordinato/realtime |
| Processi lunghi/durevoli | `workflows-starter-template` | Workflows + stato/progress |
| Agente AI | `cloudflare/agents-starter` | Agents SDK + Durable Objects/Workers AI |
| Multi-tenant code/platform | `workers-for-platforms-template` | Workers for Platforms |
| Container | `containers-template` | Solo quando serve davvero container runtime |
| Voice agent | `voice-agent-template` | Agents SDK + Voice API + Durable Object |
| Email | `email-routing-template` / `email-sending-template` | Ricezione/invio email |
| Next.js nuovo | `cloudflare/vinext` + docs correnti | Cloudflare raccomanda vinext per nuovi progetti; verificare gap |
| Next.js esistente non migrabile | `opennextjs/opennextjs-cloudflare` | Fallback/compatibilità, non prima scelta per nuovo progetto |

## Catalogo ufficiale cloudflare/templates — 41 template

### Web / full-stack / UI
- `astro-blog-starter-template`
- `next-starter-template`
- `react-postgres-fullstack-template`
- `react-router-hono-fullstack-template`
- `react-router-postgres-ssr-template`
- `react-router-starter-template`
- `react-starter-template`
- `remix-starter-template`
- `vite-react-template`
- `saas-admin-template`
- `microfrontend-template`
- `internal-sites-template`

### Data / storage
- `d1-template`
- `d1-starter-sessions-api-template`
- `to-do-list-kv-template`
- `r2-explorer-template`
- `postgres-hyperdrive-template`
- `mysql-hyperdrive-template`

### Durable / realtime / workflow
- `hello-world-do-template`
- `durable-chat-template`
- `multiplayer-globe-template`
- `workflows-starter-template`

### AI / agents / discovery
- `agent-visibility-template`
- `llm-chat-app-template`
- `text-to-image-template`
- `nlweb-template`
- `ai-brand-visibility-template`
- `commerce-llms-txt-template`
- `agent-commerce-analytics-template`
- `voice-agent-template`

### Platform / infra / API
- `chanfana-openapi-template`
- `worker-publisher-template`
- `containers-template`
- `nodejs-http-server-template`
- `workers-for-platforms-template`
- `workers-builds-notifications-template`
- `grpc-container-template`

### Auth / commerce / email
- `openauth-template`
- `x402-proxy-template`
- `email-routing-template`
- `email-sending-template`

## Reference repositories esterni ammessi al gate

Questi non prevalgono su un template ufficiale Cloudflare equivalente, ma sono reference/foundation approvate da valutare:

- [honojs/hono](https://github.com/honojs/hono) — framework backend/edge molto usato e presente anche nei template Cloudflare.
- [drizzle-team/drizzle-orm](https://github.com/drizzle-team/drizzle-orm) — ORM/query layer da valutare per D1/Postgres.
- [better-auth/better-auth](https://github.com/better-auth/better-auth) — auth library; confrontare sempre con OpenAuth/template ufficiali e requisiti del progetto.
- [shadcn-ui/ui](https://github.com/shadcn-ui/ui) — componenti UI; usare come building block, non come architettura.
- [opennextjs/opennextjs-cloudflare](https://github.com/opennextjs/opennextjs-cloudflare) — adapter utile per app Next.js esistenti quando vinext non è compatibile.

## Regole di stato

Ogni voce usata in un progetto deve essere classificata al momento dell'adozione:
- **DEFAULT** — prima scelta corrente per quello use case;
- **OFFICIAL** — base ufficiale valida;
- **REFERENCE** — utile per pattern/codice, non da clonare automaticamente;
- **FALLBACK** — usare solo per requisito/compatibilità specifica;
- **DEPRECATED/AVOID** — non usare per nuovi progetti.

Non fissare per sempre la classificazione: una modifica della documentazione ufficiale può cambiarla.

## Anti-pattern

- partire da una cartella vuota senza aver fatto Starter Gate;
- copiare snippet casuali quando esiste un template E2E-tested;
- scegliere un framework per moda e poi adattarlo a forza a Workers;
- usare D1 quando serve chiaramente Postgres/MySQL;
- riscrivere un'app Docker-native solo per farla entrare in Workers;
- scegliere un vecchio tutorial al posto della documentazione Cloudflare corrente;
- considerare una chat o un template forkato anni fa come fonte autorevole.
