# New Project Bootstrap — SOP

## Obiettivo

Creare un nuovo progetto con il minimo codice originale necessario, partendo da una base verificata e mantenendo GitHub + Cloudflare come percorso standard.

## Checklist

### A. Classifica
- [ ] Definisci use case, utenti, superfici e requisiti minimi.
- [ ] Identifica sistema proprietario e repo di destinazione.
- [ ] Elenca binding/runtime necessari: Workers, D1, R2, KV, Queues, Workflows, Durable Objects, Hyperdrive, Containers.

### B. Starter Gate
- [ ] Leggi `../governance/development-canon.md`.
- [ ] Cerca prima in `../registries/cloudflare-starters.md`.
- [ ] Verifica la documentazione Cloudflare corrente.
- [ ] Controlla repo non archiviato, attività recente, licenza e compatibilità.
- [ ] Confronta almeno la prima base ufficiale adatta con eventuale alternativa.
- [ ] Registra base scelta, URL e commit/tag/versione.

### C. Scaffold
- [ ] Usa `create-cloudflare`, clone o comando ufficiale del progetto scelto.
- [ ] Non cancellare test, typecheck, lint o observability senza motivo.
- [ ] Genera/aggiorna i tipi Cloudflare.
- [ ] Mantieni secret fuori da Git.
- [ ] Aggiungi `AGENTS.md` del progetto con owner, source of truth e gate.
- [ ] Aggiungi documentazione minima: architettura, stato, decisioni e deploy.

### D. Local / test / preview
- [ ] `dev` funziona.
- [ ] test/typecheck/lint passano.
- [ ] preview usa il runtime Cloudflare più vicino possibile alla produzione.
- [ ] binding locali/remoti sono espliciti; niente dipendenze invisibili dalla macchina.

### E. Deploy
- [ ] GitHub è aggiornato.
- [ ] Config Cloudflare versionata senza secret.
- [ ] Migrazioni DB reviewate.
- [ ] Dominio/deploy pubblico passa i gate del dominio proprietario.
- [ ] Rollback o recovery path documentato.

## Record minimo della decisione starter

```md
## Starter decision
Use case:
Selected base:
Source URL:
Commit/tag/version:
Official/community:
Alternatives checked:
Why selected:
Known gaps:
Planned deviations:
Greenfield reason: N/A
```

Se `Greenfield reason` non è N/A, deve spiegare perché le basi ufficiali o mantenute non sono utilizzabili.
