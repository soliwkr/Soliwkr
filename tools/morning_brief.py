#!/usr/bin/env python3
"""Brief mattutino operativo → Google Chat.

Il "co-founder che al mattino ti dice cosa fare". Legge il calendario Google di
oggi (via il service account aios-workspace, scope calendar) + le priorità del
trimestre, compone un brief secco nel tono di Chris, e lo posta su uno spazio
Google Chat tramite incoming webhook.

Setup (una volta):
  1. In Google Chat crea uno spazio dedicato (es. "Operativo").
  2. Spazio → Integrazioni/App → Webhook → crea → copia l'URL.
  3. Mettilo in .env come GOOGLE_CHAT_WEBHOOK_URL=...
  4. Schedula: systemd timer (vedi tools/morning_brief.timer) o cron.

Uso manuale / test:
  .venv/bin/python tools/morning_brief.py            # posta (o stampa se manca il webhook)
  .venv/bin/python tools/morning_brief.py --dry-run  # stampa e basta, non posta
"""
import argparse
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import requests
from dotenv import load_dotenv

REPO = Path(__file__).resolve().parent.parent
TZ = ZoneInfo("Europe/Rome")
CAL_SCOPE = ["https://www.googleapis.com/auth/calendar"]  # combacia con la delega DWD
TASKS_SCOPE = ["https://www.googleapis.com/auth/tasks"]

GIORNI = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"]
MESI = ["", "gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"]


def oggi_eventi():
    """Ritorna la lista (stringhe) degli eventi di oggi dal calendario primario.
    Se qualcosa va storto, ritorna None e il brief prosegue senza calendario."""
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        creds = service_account.Credentials.from_service_account_file(
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"],
            scopes=CAL_SCOPE,
            subject=os.environ["GOOGLE_WORKSPACE_SUBJECT"],
        )
        cal = build("calendar", "v3", credentials=creds, cache_discovery=False)

        now = datetime.now(TZ)
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        resp = cal.events().list(
            calendarId="primary",
            timeMin=start.isoformat(),
            timeMax=end.isoformat(),
            singleEvents=True,
            orderBy="startTime",
        ).execute()

        out = []
        for ev in resp.get("items", []):
            s = ev["start"].get("dateTime")
            if s:
                ora = datetime.fromisoformat(s).astimezone(TZ).strftime("%H:%M")
            else:
                ora = "tutto il giorno"
            out.append(f"{ora} · {ev.get('summary', '(senza titolo)')}")
        return out
    except Exception as e:  # calendario non critico: il brief esce lo stesso
        print(f"[warn] calendario non letto: {e}", file=sys.stderr)
        return None


def tasks_aperte(limite=8):
    """Ritorna le task non completate da tutte le liste Google Tasks (via SA),
    con scadenza prima e ordinate per data. None se qualcosa va storto."""
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        creds = service_account.Credentials.from_service_account_file(
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"],
            scopes=TASKS_SCOPE,
            subject=os.environ["GOOGLE_WORKSPACE_SUBJECT"],
        )
        svc = build("tasks", "v1", credentials=creds, cache_discovery=False)

        # Filtro liste: TASKS_LISTS in .env = nomi separati da virgola (solo quelle).
        # Vuoto = tutte. Serve a tenere fuori le liste personali dal brief di business.
        ammesse = [s.strip() for s in os.getenv("TASKS_LISTS", "").split(",") if s.strip()]

        raccolta = []
        for tl in svc.tasklists().list(maxResults=20).execute().get("items", []):
            if ammesse and tl.get("title", "") not in ammesse:
                continue
            items = svc.tasks().list(
                tasklist=tl["id"], showCompleted=False, showHidden=False, maxResults=50
            ).execute().get("items", [])
            for t in items:
                if t.get("status") == "completed":
                    continue
                titolo = (t.get("title") or "").strip()
                if not titolo:
                    continue
                due = t.get("due")
                if due:
                    d = datetime.fromisoformat(due.replace("Z", "+00:00")).astimezone(TZ)
                    raccolta.append((d, f"{titolo} (scad. {d.day} {MESI[d.month]})"))
                else:
                    raccolta.append((None, titolo))

        con_data = sorted((x for x in raccolta if x[0]), key=lambda x: x[0])
        senza = [x for x in raccolta if not x[0]]
        return [t[1] for t in (con_data + senza)][:limite]
    except Exception as e:  # tasks non critiche: il brief esce lo stesso
        print(f"[warn] tasks non lette: {e}", file=sys.stderr)
        return None


def estrai(priorita_md, header):
    """Estrae il blocco di testo sotto un header '## header' dal file priorità."""
    righe = priorita_md.splitlines()
    cattura, buf = False, []
    for r in righe:
        if r.strip().startswith("## "):
            cattura = header.lower() in r.lower()
            continue
        if cattura:
            if r.strip():
                buf.append(r.strip())
            elif buf:
                break
    return " ".join(buf)


def componi():
    load_dotenv(REPO / ".env")
    now = datetime.now(TZ)
    giorno = GIORNI[now.weekday()]
    data = f"{giorno} {now.day} {MESI[now.month]}"

    prio = (REPO / "context" / "priorities.md").read_text(encoding="utf-8")
    obiettivo = next(
        (l.strip("* ").strip() for l in prio.splitlines() if l.startswith("**Obiettivo")),
        "10 clienti a €300/mese entro Natale.",
    )
    gesto = estrai(prio, "gesto di lunedì")
    guardrail = estrai(prio, "guardrail")

    L = [f"*Brief — {data}*", "", f"🎯 {obiettivo}", ""]

    eventi = oggi_eventi()
    if eventi:
        L.append("*Oggi in agenda:*")
        L.extend(f"• {e}" for e in eventi)
    elif eventi == []:
        L.append("*Agenda libera oggi.* Nessuna scusa: è tempo da vendita.")
    L.append("")

    task = tasks_aperte()
    if task:
        L.append("*Task aperte:*")
        L.extend(f"• {t}" for t in task)
        L.append("")

    # La leva del giorno
    if now.weekday() == 0 and gesto:  # lunedì
        L.append(f"*Il gesto di oggi:* {gesto}")
    else:
        L.append("*La leva:* vendere. ~2 avvicinamenti buoni. Quante porte / messaggi oggi?")
    L.append("")

    if guardrail:
        L.append(f"_{guardrail}_")

    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser(description="Brief mattutino → Google Chat")
    ap.add_argument("--dry-run", action="store_true", help="stampa e basta, non posta")
    args = ap.parse_args()

    testo = componi()
    webhook = os.getenv("GOOGLE_CHAT_WEBHOOK_URL")

    if args.dry_run or not webhook:
        if not webhook and not args.dry_run:
            print("[info] GOOGLE_CHAT_WEBHOOK_URL non impostato: stampo e basta.\n", file=sys.stderr)
        print(testo)
        return

    r = requests.post(webhook, json={"text": testo}, timeout=15)
    r.raise_for_status()
    print("[ok] brief postato su Google Chat.")


if __name__ == "__main__":
    main()
