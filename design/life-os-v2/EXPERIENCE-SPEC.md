# LIFE OS V2 — Experience specification
**Status:** Design proposal, not shipped. Parent: MASTER-DESIGN.md · 2026-10-12

## Product personality

Notion organizza dati; Linear organizza progetti; Obsidian organizza idee. SOLIWKR deve aiutare **una persona** a orientare la propria esistenza senza trasformarla in lavoro. Vibe: "atelier personale" e non "admin SaaS".

Tre principi visuali:
1. **Calma direzionale:** una sola gerarchia per schermata; se una card non porta una decisione o una scoperta, eliminarla.
2. **Densità progressiva:** glance (2 secondi) → explore (30 secondi) → action (massimo 3 tocchi). I dati secondari emergono soltanto su richiesta.
3. **Sources first:** uno stato senza timestamp o fonte va rappresentato come sconosciuto, non come numero rosso/verde.

## IA e navigazione

### Desktop
Sidebar sottile fissa; logo SOLIWKR, search/capture universale, sezioni in ordine: Oggi, Vita, Studio, Cervello, Atlante, Rituali, Connessioni. Workspace centrale max-width 1200px con ampi margini; drawer laterale per dettagli contestuali; Command Palette sempre disponibile.

### Mobile
Bottom nav a cinque elementi: **Oggi · Vita · Studio · Atlante · Altro**. Cervello è apribile anche con pulsante cattura flottante e dal menu Altro; Rituali sono contestuali a Oggi e dentro Altro; Connessioni vive nel menu Altro. La navigazione attuale non va rotta prima di un parity test. Back Android rispettato, deep link veri, focus non perso fra schermate.

Il grafo NON deve occupare l'intera home. Sulla home, al massimo un "collegamento interessante" quando una prova reale giustifica il suggerimento. In assenza di fonti non mostrare niente.

## Layout di riferimento

### Oggi / mobile viewport 390px

    ┌─────────────────────────────────┐
    │ S  SOLIWKR         ⌕      ○     │
    │ OGGI · LUNEDÌ                   │
    │                                 │
    │ Buonasera.                      │
    │ Che cosa conta davvero?         │
    │                                 │
    │ ┌─────────────────────────────┐ │
    │ │ LA COSA CHE CONTA           │ │
    │ │                             │ │
    │ │ Concludere ...              │ │
    │ │                             │ │
    │ └─────────────────────────────┘ │
    │                                 │
    │ LE MIE TRE MOSSE           1/3  │
    │ ○  Azione concreta 1            │
    │ ●  Azione concreta 2            │
    │ ○  Azione concreta 3            │
    │                                 │
    │ Da lasciare fuori →             │
    │                                 │
    │                     + CATTURA   │
    │ ─────────────────────────────── │
    │ Oggi    Vita   Studio Atlante · │
    └─────────────────────────────────┘

La home deve poter essere usata con una sola mano. Focus sempre completamente leggibile; tasks abbinate a tap targets min 44px.

### Cervello

Header poetico brevissimo; primary CTA "Cattura un pensiero"; tre tab: **Inbox / Conoscenza / Domande**. Ogni scheda mostra testo, data, provenienza e menù azioni. In "promuovi a memoria", un wizard di tre passi: fonte → tipo → ambito, finale Preview/Diff/Conferma. Niente select + 12 input tutti in vista. Facoltativo aggiungere scadenza "rivedi tra 30 giorni" sulle ipotesi, non sui valori personali.

### Atlante

Top: ricerca universale "Cerca idee, progetti, decisioni". Filtri per dominio e tipo (fonte, ipotesi, approvato, stale). Area centrale viewport grafico pan/zoom; selezione di nodo apre un sheet con descrizione, fonte, history, 'Apri originale' e 'Mostra 1-hop'. A destra desktop e in bottom-sheet mobile. Un tab "Timeline" mostra gli archi cambiati nel tempo. Archi proposti tratteggiati, archi revisionati pieni; colori per categoria, non per "bontà" del soggetto.

### Studio

Una riga primaria "serve una decisione?" sopra elenco progetti e filtri. Card di un progetto:
- Titolo + owner + chip stato aggiornamento.
- Ultimo segnale verificabile e quando è avvenuto.
- Cosa ci si aspetta come prossimo gate, con puntatore alla fonte proprietaria.
- Un solo CTA "Apri fonte". Nessuna inventata previsione di ricavi.

### Vita

Le sei aree sono ambienti, non checklist. La card di ogni area non chiede un voto. Usa "Come lo senti? / Vuoi lasciarci una nota?" e possibilità di saltare. Le note di salute, relazioni e fede non diventano inputs di agenti senza consenso esplicito. Nessuna barra "salute 43%" e nessun obiettivo religioso misurato.

### Rituali

Apri giornata: una cosa essenziale, una rinuncia. Chiudi: ricordo significativo, cosa riprendere, cosa lasciare. Un giorno saltato NON viene indicato come fallimento. Nel dossier settimanale, la timeline prima di eventuali raccomandazioni.

### Connessioni

Le card qui sono "verità dell'infrastruttura": provider, permessi, sync, errore, destinazione, data e revoca. Le fonti non collegate possono mostrare onboarding discreto, non bloccare la fruizione del resto dell'app.

## Visual language

Color tokens proposti (restano negoziabili finché non c'è test reale contrasto):
- --surface-0 #0d1312 · --surface-1 #151c1a · --surface-2 #1d2921;
- --text-primary #eff3ec · --text-secondary #a4b5aa;
- --action #c7f778 (lime sobrio), --thought #bfa9ff (conoscenza), --external #9dd6e8 (segnali), --warm #ffa58e (attenzione).
- Giallo/arancio/rosso **mai** come interpretazioni automatiche di salute/fede/famiglia.
- Border radius 14-20px, spacing 4/8/12/16/24/32/48, font system-ui o font self-hosted autorizzato, niente font remoto.
- Animazioni <=200ms e disabled in prefers-reduced-motion. Focus rings forti, aria-live per errori, tap targets >=44px.
- Contrasto WCAG AA per testi e stati; attenzione a chip in piccoli caratteri e SVG con testo.

## Microcopy e stati

| Stato | Copy intenzionale | Cosa NON dire |
| --- | --- | --- |
| Nessun focus | "Possiamo scegliere una sola cosa." | "Sei in ritardo" |
| Nessuna inbox | "Qui c'è spazio." | "0 produttività" |
| Progetto dati assenti | "Non collegato — apri la fonte." | "€0" |
| Integrazione vecchia | "Ultima verifica: [data]. Aggiornamento necessario." | "Tutto ok" |
| Memoria proposta | "Questa è un'ipotesi. Vuoi controllare le fonti?" | "Tu sei fatto così" |
| Errore salvataggio | "Non sono riuscito a salvare. Copia il testo e riprova." | "Salvato!" |
| Due tab in conflitto | "Ci sono due versioni. Confrontale." | "Ricarica e perdi la modifica" |
| Fine giornata | "Per oggi può bastare." | "Hai completato 31% di te stesso" |

## Stati operativi UI obbligatori

Loading: skeleton leggero; non mostrare default "0" se API non ha ancora risposto.
Error: messaggio actionable, possibilità di copiare dati e recuperare; mai autosave falsa.
Stale: source+timestamp e "aggiorna".
Empty: niente fantasia né card decorative, aiuto contestuale solo se serve.
Partial: i dati di un provider fallito non tolgono tutta la pagina.
Offline: lettura locale della cache solo se consentita dal privacy model; salvataggio "in attesa", mai persistito finché server non conferma.
Privacy: timer access, esporta selettivo, "questo contenuto non viene usato dagli agenti".

## Interaction inventory

- Tap su nodo: detail, non azione esterna.
- Long tap: menu per Pin / Nascondi / Apri fonte, non elimina.
- Swipe nelle card: solo se ha affordance visibile e Undo.
- Cmd/Ctrl+K: Cerca o Cattura; non invia mai a GPT per default.
- Keyboard: Tab, Escape, Enter, frecce nel grafo accessibile, no focus trap non chiudibile.
- "Rimuovi la memoria": dialog con conseguenze esplicite, inclusi export passati non revocabili.

## UX test script — non ancora eseguito

Tester su Android reale senza spiegazioni:
1. trovo la priorità e la cambio;
2. creo una nota, la trasformo in decisione approvata;
3. ritrovo quella decisione nell'Atlante e apro fonte;
4. cambio area della Vita e scrivo qualcosa senza creare un task;
5. esporto solo le memorie desiderate, apro il vault in Obsidian e vedo il grafo.

Osservare errori, tocchi, tempo, confusione. Obiettivo p50 nel test: <=30 secondi per task 1 e <=10 secondi per cattura. Non chiedere "ti piace?" prima di vedere se sa usarla.

**Finale:** chiudere il sistema deve sembrare un completamento, non una rinuncia.
