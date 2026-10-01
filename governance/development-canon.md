# Canon di sviluppo cross-project

**Stato:** CANONICO  
**Owner:** Chris  
**Ambito:** tutti i nuovi progetti software e le decisioni architetturali cross-project, salvo regole più specifiche del dominio proprietario.

## 1. Principio Cloudflare-first

La piattaforma di default è Cloudflare.

Per un nuovo progetto web, API, SaaS, directory, lead-gen, dashboard, automazione o agente, partire da Cloudflare salvo un requisito tecnico concreto che renda un altro runtime o datastore più adatto.

**Cloudflare-first non significa Cloudflare-at-all-costs.**

Default da considerare prima:
- Workers per runtime/API/full-stack;
- Static Assets per frontend;
- D1 per SQL semplice/serverless;
- R2 per oggetti e file;
- KV per cache/configurazione e dati key-value adatti al modello;
- Queues per asincronia e buffering;
- Workflows per processi durevoli multi-step;
- Durable Objects per stato coordinato, realtime e agenti stateful;
- Hyperdrive quando il database autorevole è Postgres/MySQL esterno;
- Containers quando serve un ambiente Linux/containerizzato compatibile con la piattaforma.

### Escape hatch obbligatoria

Non forzare Cloudflare quando il workload richiede in modo sostanziale:
- molta memoria di processo o CPU bound prolungata;
- daemon/processi persistenti non adatti al runtime Workers;
- runtime Linux o dipendenze native specifiche;
- container esistenti che sarebbe irrazionale riscrivere;
- database relazionale pesante o feature PostgreSQL/MySQL non adatte a D1;
- software self-hosted progettato esplicitamente per Docker/VM.

In questi casi usare VPS/Docker/Postgres o altro componente appropriato, mantenendo Cloudflare come edge, DNS, gateway o layer applicativo dove utile.

## 2. Template-first: vietato partire greenfield per abitudine

Prima di scrivere codice applicativo da zero, eseguire sempre il **Starter Gate**.

Ordine vincolante di ricerca:

1. template/starter ufficiale Cloudflare;
2. repository o reference implementation ufficiale Cloudflare;
3. starter ufficiale del framework con supporto Cloudflare documentato;
4. repository molto affermato, attivo e mantenuto con compatibilità Cloudflare;
5. fork/adattamento di una delle basi sopra;
6. greenfield da zero solo quando nessuna base soddisfa i requisiti.

La fonte primaria dell'inventario è `../registries/cloudflare-starters.md`.

### Starter Gate

Prima del primo codice specifico del prodotto, il progetto deve registrare:
- use case e requisiti minimi;
- template/repository valutati;
- base scelta e URL;
- commit/tag/versione di partenza quando disponibile;
- motivo della scelta;
- incompatibilità note;
- modifiche previste rispetto alla base;
- motivo esplicito se si sceglie greenfield.

Non riscrivere componenti già risolti da una base affidabile soltanto per uniformità estetica o preferenza personale.

## 3. Regola di verifica prima del clone

L'inventario è una mappa, non una fotografia eterna. Prima di adottare una base:
- verificare che il repository non sia archiviato;
- verificare attività recente e documentazione corrente;
- controllare licenza;
- controllare compatibilità con il runtime Cloudflare corrente;
- verificare che il percorso raccomandato da Cloudflare non sia cambiato;
- preferire release stabili a branch/prerelease salvo motivazione documentata.

Se documentazione ufficiale e inventario divergono, prevale la documentazione ufficiale corrente e l'inventario va aggiornato.

## 4. Modello workspace AIOS

L'AIOS locale è un **workspace**, non un monorepo Git.

Layout canonico:

```text
~/AIOS/
├── office/      -> clone di soliwkr/Soliwkr
└── projects/
    ├── <repo-1>/
    ├── <repo-2>/
    └── ...
```

`~/AIOS` non deve avere un proprio `.git`.

Ogni progetto mantiene il proprio repository, history, CI, deploy e fonte canonica. `office/` contiene costituzione, routing, registry, decisioni cross-project e playbook; non ingloba il codice degli altri progetti.

## 5. Nuovo progetto: flusso standard

1. Classificare il progetto e il sistema proprietario.
2. Leggere questo canon e l'inventario Cloudflare.
3. Eseguire Starter Gate.
4. Clonare/scaffoldare la base scelta.
5. Creare il repository proprietario del progetto.
6. Aggiungere `AGENTS.md` e documentazione minima di stato/architettura nel progetto.
7. Configurare local dev, test, preview e deploy.
8. Usare GitHub come source of truth del codice.
9. Applicare gate umani definiti dal dominio per deploy pubblici, domini, prezzi, promesse e operazioni irreversibili.
10. Aggiornare l'inventario se emerge una base migliore o un percorso ufficiale cambia.

Il playbook operativo è in `../playbooks/new-project-bootstrap.md`.

## 6. Portabilità

Editor, modello e agente sono sostituibili. Nessuna scelta di Cursor, Codex, Grok, Claude, Hermes o altro runtime deve rendere non portabile:
- codice;
- decisioni;
- documentazione;
- starter provenance;
- deploy;
- stato canonico.

La memoria durevole vive nelle fonti proprietarie e in GitHub, non nella cronologia di una chat o di un singolo editor.
