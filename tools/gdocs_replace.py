"""Find-and-replace testo su Google Docs via service account con domain-wide delegation.

Il SA `aios-workspace` impersona un utente del workspace (GOOGLE_WORKSPACE_SUBJECT)
e applica `replaceAllText` su uno o piu documenti.

Uso:
  .venv/bin/python tools/gdocs_replace.py --find Ivan --replace Vittorio \
      --doc <docId> --doc <docId> [--dry-run] [--subject info@trovatemi.it]

Legge da .env: GOOGLE_APPLICATION_CREDENTIALS (chiave SA), GOOGLE_WORKSPACE_SUBJECT.
--dry-run conta le occorrenze senza modificare nulla.
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from google.oauth2 import service_account
from googleapiclient.discovery import build

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

SCOPES = ["https://www.googleapis.com/auth/documents"]


def get_service(subject: str):
    key = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not key or not Path(key).exists():
        sys.exit(f"GOOGLE_APPLICATION_CREDENTIALS mancante o invalido: {key!r}")
    creds = service_account.Credentials.from_service_account_file(
        key, scopes=SCOPES, subject=subject
    )
    return build("docs", "v1", credentials=creds, cache_discovery=False)


def get_doc_text(service, doc_id: str) -> tuple[str, str]:
    doc = service.documents().get(documentId=doc_id).execute()
    parts: list[str] = []

    def walk(elements):
        for el in elements:
            if "paragraph" in el:
                for pe in el["paragraph"].get("elements", []):
                    tr = pe.get("textRun")
                    if tr:
                        parts.append(tr.get("content", ""))
            elif "table" in el:
                for row in el["table"].get("tableRows", []):
                    for cell in row.get("tableCells", []):
                        walk(cell.get("content", []))

    walk(doc.get("body", {}).get("content", []))
    return doc.get("title", ""), "".join(parts)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--find", required=True)
    ap.add_argument("--replace", required=True)
    ap.add_argument("--doc", action="append", required=True, dest="docs")
    ap.add_argument("--subject", default=os.getenv("GOOGLE_WORKSPACE_SUBJECT"))
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not args.subject:
        sys.exit("Nessun subject: imposta GOOGLE_WORKSPACE_SUBJECT o passa --subject")

    service = get_service(args.subject)
    total = 0
    for doc_id in args.docs:
        title, text = get_doc_text(service, doc_id)
        count = text.count(args.find)
        total += count
        print(f"[{doc_id}] '{title}': {count}x '{args.find}'")
        if not args.dry_run and count:
            res = (
                service.documents()
                .batchUpdate(
                    documentId=doc_id,
                    body={
                        "requests": [
                            {
                                "replaceAllText": {
                                    "containsText": {"text": args.find, "matchCase": True},
                                    "replaceText": args.replace,
                                }
                            }
                        ]
                    },
                )
                .execute()
            )
            changed = res["replies"][0]["replaceAllText"].get("occurrencesChanged", 0)
            print(f"    -> sostituite {changed} occorrenze con '{args.replace}'")

    if args.dry_run:
        print(f"DRY-RUN: totale {total} occorrenze di '{args.find}' (nessuna modifica)")


if __name__ == "__main__":
    main()
