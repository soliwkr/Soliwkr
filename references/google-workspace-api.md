# Google Workspace API — accesso `script` (service account + DWD)

Come l'AIOS opera su Docs/Drive/Sheets/Gmail/Calendar del workspace **trovatemi.it** in modo headless, senza browser. Researched-once-saved-forever.

## Identità

- **Service account:** `aios-workspace@soliwkr.iam.gserviceaccount.com`
- **Progetto GCP:** `soliwkr` (n. 739710211590)
- **Client ID (DWD):** `110215454816142170622`
- **Chiave:** `~/.config/aios/aios-workspace-sa.json` (chmod 600, FUORI dal repo, mai in git/chezmoi)
- **`.env`:** `GOOGLE_APPLICATION_CREDENTIALS` → path chiave · `GOOGLE_WORKSPACE_SUBJECT=info@trovatemi.it`

## Come funziona

Il SA ha **domain-wide delegation** autorizzata nella Admin console di trovatemi.it. Impersona un utente del workspace (default `info@trovatemi.it`, Owner del progetto GCP e dei Doc) tramite `.with_subject(...)`. Le operazioni risultano fatte da quell'utente.

## Scope autorizzati in DWD (Admin console → API controls → Domain-Wide Delegation)

```
documents, drive, spreadsheets, calendar,
gmail.modify, gmail.send, gmail.compose,
contacts, tasks, admin.directory.user.readonly
```

> Least-privilege: il codice richiede solo gli scope che gli servono (SCOPES nel tool). Aggiungere uno scope nuovo = una riga nella riga DWD, propagazione ~minuti. La chiave vale quanto tutti questi scope insieme: proteggerla.

## Setup ambiente

```bash
uv venv --python 3.14
uv pip install --python .venv/bin/python google-auth google-api-python-client python-dotenv requests
```

## Snippet auth (riusabile)

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/documents"]  # solo cio' che serve
creds = service_account.Credentials.from_service_account_file(
    os.getenv("GOOGLE_APPLICATION_CREDENTIALS"), scopes=SCOPES,
    subject=os.getenv("GOOGLE_WORKSPACE_SUBJECT"),
)
docs = build("docs", "v1", credentials=creds, cache_discovery=False)
```

## Tool esistenti

- **`tools/gdocs_replace.py`** — find-replace testo su uno o piu Doc (`replaceAllText`, matchCase). Ha `--dry-run` (conta senza modificare). Es.:
  ```bash
  .venv/bin/python tools/gdocs_replace.py --find Ivan --replace Vittorio --dry-run --doc <docId>
  ```

## Gotcha

- **Alias shell:** `gam` è aliasato a `git am`. Il binario GAM vero è `/usr/bin/gam`.
- **`unauthorized_client`:** la delega non è propagata (attendi qualche minuto) **o** lo scope richiesto dal codice non è tra quelli autorizzati in DWD.
- **Client ID ≠ email SA:** in DWD si incolla l'`uniqueId` numerico, non l'email.
- **Docs canonici trovatemi.it (ID utili):**
  - Stella Polare (governance): `18mUZZGlQsqfnJXbnDR0-ejGiaCGvF44KSNweH8XpB4g`
  - Stella Polare (root): `1_Ge00oc5EmMSck8CR-RioEEqTwvnUlpK04n2httVFT0`
  - Documento Totale (governance): `1xeEgFc8jXu32T1VbxYJ4TPm5qqdMLEJOyd7ELlgyqnI`
  - Documento Totale (root): `1Zk5T56ZgL5JsltjR0an06suv41MATSdM-sQqy3wsshc`
  - NB: copie duplicate governance/root — da consolidare a una canonica.
