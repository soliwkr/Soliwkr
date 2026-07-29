# Ordine delle fonti di verità

## Principio generale

Per ogni dominio, applicare in ordine:

1. costituzione e decisioni approvate del dominio;
2. fonti canoniche del business proprietario;
3. contratti e modelli dati approvati;
4. stato operativo nel datastore proprietario;
5. specifiche;
6. codice;
7. dashboard, agenti, chat e output derivati.

Il livello più basso non può modificare implicitamente quello superiore. Il fatto che un dato sia
più recente non lo rende automaticamente normativo: stato operativo e norma rispondono a domande
diverse.

## Autorità di Soliwkr

Soliwkr è autorevole per:

- costituzione dell'Operator & Portfolio AIOS;
- identità e modalità operative di Chris;
- registro del portfolio e routing tra domini;
- decisioni e memoria realmente cross-project;
- istruzioni portabili agli agenti.

Soliwkr non è autorevole per offerte, clienti, procedure o stato operativo di TROVATEMI, né per i
dati posseduti da altri sistemi. Registra il puntatore alla fonte e i suoi confini.

## Autorità TROVATEMI

Per TROVATEMI, Soliwkr effettua routing verso l'ordine canonico definito da
`soliwkr/trovatemi-os`. Stella Polare, Documento Totale, Architettura Operativa, contratti,
modelli dati e altre fonti approvate devono essere ordinate e governate lì. Soliwkr non decide
quale copia esterna sia canonica e non ne replica il contenuto.

Finché `trovatemi-os` non pubblica o verifica il proprio ordine completo, i riferimenti presenti
in questo repository sono puntatori storici o non verificati, non una nuova autorità sostitutiva.

## Autorità Senzaroaming

Le fonti canoniche del prodotto Senzaroaming vivono in `soliwkr/esim`. Soliwkr conserva soltanto il
puntatore al sistema e le eventuali decisioni realmente cross-project. Produzione, telemetria e
datastore rispondono alle fonti e ai contratti definiti dal repository eSIM; chat, dashboard e
report restano rappresentazioni derivate.

Non copiare in Soliwkr ROADMAP, STATUS, NEXT, ARCHITECTURE, DECISIONS o altri documenti eSIM.

## Stato operativo

- D1 è il backbone canonico di lead, asset rank-and-rent e relativi stati operativi.
- Climbo riceve e gestisce dati downstream, ma non sostituisce D1 come fonte primaria del lead.
- I repository degli asset possiedono codice e configurazione del singolo asset, non la verità
  commerciale o il registro globale dei lead.
- R2 conserva gli artefatti e documenti operativi appropriati secondo contratti approvati.

L'ubicazione concreta di database, account e binding deve essere definita dal sistema proprietario;
questa pagina non inventa schemi, credenziali o configurazioni.

## Dashboard, agenti e conversazioni

Dashboard e report sono proiezioni. Agenti, chat, email e canali operativi sono interfacce o output
derivati. Una decisione emersa in conversazione diventa autorevole solo dopo l'approvazione di
Chris e la registrazione nella fonte appropriata.

## Conflitti

Quando due fonti sembrano concorrenti:

1. non fonderle e non scegliere in base alla comodità;
2. identifica dominio, owner, data e tipo di ciascuna fonte;
3. applica l'ordine sopra;
4. se l'autorità resta ambigua, sospendi le scritture e chiedi a Chris;
5. registra la risoluzione nel decisions log del dominio proprietario;
6. aggiorna in Soliwkr soltanto il routing o l'impatto cross-project.

Le copie duplicate della Stella Polare e del Documento Totale già documentate restano un rischio
aperto di TROVATEMI. Questa PR non le consolida e non sceglie una copia vincente.
