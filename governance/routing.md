# Routing e confini del sistema

## Metodo di routing

Per ogni richiesta:

1. classifica se riguarda operatore, portfolio, business, execution plane o stato operativo;
2. consulta `../registries/systems.md` per individuare owner e fonte canonica;
3. consulta `../registries/capabilities.md` per operazioni, agenti e gate consentiti;
4. consulta `../registries/connections.md` per un adapter autorizzato;
5. esegui letture o scritture soltanto sul sistema proprietario;
6. registra log e approvazioni dove indicato dal dominio.

Se manca un adapter, la capability non diventa automaticamente indisponibile: può essere
pianificato un adapter sostituibile. Se manca l'autorità, invece, l'operazione deve fermarsi.

## Routing principale

| Tema | Sistema proprietario | Routing |
|---|---|---|
| Identità e priorità cross-project di Chris | Soliwkr | costituzione, registry, decisioni cross-project |
| Strategia, offerte, clienti e governance TROVATEMI | `trovatemi-os` | ordine delle fonti definito dal business OS |
| Factory e operazioni high-ticket rank-and-rent | `rankempire-italia` | contratti factory, D1 e workflow autorizzati |
| Template siti generati | `StudioPuraLuce/astro-rank-rent` | template e contratti consumati dalla factory |
| Codice/deploy di un singolo asset | repository dell'asset | repo, Worker e dominio autonomi |
| Frontend pubblico TROVATEMI | `trovatemi-web` | presentation/conversion plane, non stato canonico |
| Evidenze e intelligence Climbo | `climbo-audit` | grezzi/elaborati; promozione solo dopo approvazione |
| Strategia prodotto, architettura, roadmap, codice, SEO, editoriale e stato di Senzaroaming | `soliwkr/esim` | fonti canoniche del repository eSIM; non memorie o documenti TROVATEMI |
| Lead, asset e relativi stati | Cloudflare D1 | registrazione D1-first prima del downstream |
| Conversazione operativa privata | Telegram inizialmente | interfaccia; decisioni registrate altrove |
| Prospect, clienti e renter | WhatsApp | canale esterno; non fonte canonica |

## I due livelli Climbo

### Climbo Cashflow

Motore white-label autonomo dell'offerta low-ticket TROVATEMI, presentato attraverso
`trovatemi-web`. Le sole offerte pubbliche approvate indicate per il nuovo modello sono TROVATO
€199 e INEVITABILE €399. Questa pagina non sostituisce la fonte commerciale in `trovatemi-os`:
qualsiasi variazione richiede approvazione di Chris e recepimento nel business OS.

Cashflow può operare indipendentemente da RankEmpire e non cambia la natura high-ticket della
factory.

### Climbo High-Ticket Delivery Fabric

Componente downstream del piano RankEmpire. Un asset può avere una location/business Climbo
preparata prima dell'ingresso del renter. Il renter aggiunge la propria Google Business Profile,
ma lead e stato restano canonici in D1. Climbo non diventa control plane né fonte primaria.

## Esecuzione e osservabilità

Cloudflare Workers espone API e runtime edge. Queues e Workflows eseguono integrazioni
deterministiche, idempotenti e osservabili; devono prevedere log, retry, gestione degli errori e
gate umani per le operazioni irreversibili. R2 custodisce artefatti appropriati. Queste componenti
eseguono decisioni e contratti approvati: non li definiscono.

Hermes è un futuro runtime persistente, inizialmente previsto su VPS Hetzner. Usa Soliwkr come
costituzione e routing e consulta i sistemi proprietari. Può proporre, controllare e compiere
operazioni autorizzate, ma non è fonte canonica e richiede approvazione per decisioni, promesse e
operazioni irreversibili.

Telegram è il cockpit privato iniziale; WhatsApp resta separato per interlocutori esterni. Entrambi
sono sostituibili e nessuno dei due è un datastore.
