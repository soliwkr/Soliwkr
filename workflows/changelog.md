# Workflow: Aggiornamento Changelog

## Objective
Mantenere un log operativo cronologico in `CHANGELOG.md` di tutte le modifiche significative
al sistema, al repo, e all'infrastruttura.

## Trigger
Alla fine di ogni sessione di lavoro che ha prodotto modifiche (nuovi tool, workflow, config,
servizi, integrazioni). L'agente deve proporre attivamente l'aggiornamento.

## Required Inputs
- Elenco delle modifiche fatte nella sessione
- Motivazione / contesto
- File toccati (con path)
- Eventuali azioni manuali rimanenti

## Steps
1. Leggere `CHANGELOG.md` per verificare il formato corrente
2. Aggiungere una nuova entry in cima (sotto l'header), con:
   - **Data e titolo** (`## YYYY-MM-DD — Titolo breve`)
   - **Cosa** — bullet list delle modifiche
   - **Perché** — motivazione e contesto
   - **File toccati** — path completi, raggruppati per area (chezmoi, repo, cloudflare, ecc.)
   - **Azioni manuali** — se ci sono step che richiedono intervento umano
3. Se le modifiche coinvolgono file fuori dal repo (chezmoi, systemd, cloudflared), documentare
   anche quelli

## Expected Outputs
Entry aggiunta in `CHANGELOG.md`, visibile nel repo.

## Edge Cases & Failure Handling
- Sessione senza modifiche significative → non aggiornare
- Più sessioni nello stesso giorno → raggruppare sotto la stessa data se coerenti, altrimenti
  entry separate con titoli diversi

## Notes / Learnings
- Il changelog è per noi (utente + agente), non per utenti esterni
- Scrivere in italiano
- Essere specifici sui path — "aggiornato chezmoi" non basta, servono i file
