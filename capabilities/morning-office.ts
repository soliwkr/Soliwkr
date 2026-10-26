/**
 * SOLIWKR Morning Office — portable capability, not a second task system.
 * No I/O or secrets here. Adapters are supplied by the owning runtime.
 * Google Calendar is the human agenda; PaperClip owns agent tasks;
 * Google Tasks owns personal tasks; Docs/Sheets are projections.
 */
export type Evidence = { source: string; url?: string; status: "verified" | "reported" | "hypothesis"; detail: string };
export type OfficeAction = { id: string; title: string; owner: "human" | "agent"; project: string; due?: string; approved: boolean; evidence?: Evidence[] };
export type OfficeInput = { date: string; timezone: string; objective: string; project: string; evidence: Evidence[]; actions: OfficeAction[]; blockers?: string[] };
export type OfficeOutput = {
  key: string;
  agenda: string;
  personalTasks: OfficeAction[];
  agentTasks: OfficeAction[];
  pendingApproval: OfficeAction[];
  logEntry: string;
};
export function buildMorningOffice(input: OfficeInput): OfficeOutput {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("date must be YYYY-MM-DD");
  if (!input.objective.trim()) throw new Error("one objective required");
  const unique = [...new Map(input.actions.map(a => [a.id, a])).values()];
  const approved = unique.filter(a => a.approved);
  const evidence = input.evidence.map(e => `[${e.status.toUpperCase()}] ${e.detail} — ${e.url ?? e.source}`).join("\n") || "Nessuna prova disponibile";
  const agenda = [
    "09:00–09:10 | Apertura: leggere fonti, prove, blocchi e calendario",
    `09:10–09:15 | Risultato unico: ${input.objective}`,
    `09:15–09:50 | Esecuzione: ${input.project} — ${input.objective}`,
    "09:50–10:00 | Chiusura: prove, decisione, log, KPI e task",
    `Criterio DONE: risultato verificato con fonte, altrimenti HOLD motivato.`,
    `Blocchi: ${input.blockers?.join("; ") || "non verificati"}`,
    "NON FARE: spese, deploy, invii, deleghe o riaperture senza autorizzazione.",
  ].join("\n");
  return {
    key: `morning-office:${input.date}`,
    agenda,
    personalTasks: approved.filter(a => a.owner === "human"),
    agentTasks: approved.filter(a => a.owner === "agent"),
    pendingApproval: unique.filter(a => !a.approved),
    logEntry: `${input.date} — ${input.project}\nRISULTATO: ${input.objective}\nPROVE:\n${evidence}\nBLOCCHI: ${input.blockers?.join("; ") || "da verificare"}\nSTATO: da verificare a fine sessione`,
  };
}

/**
 * Runtime adapter contract:
 * - read sources (PaperClip/GitHub/Google) using scoped credentials
 * - render with buildMorningOffice
 * - upsert Calendar by key/date (do not duplicate)
 * - upsert personal tasks in Google Tasks by stable ID
 * - route agent tasks to PaperClip only after explicit approval
 * - append Docs log only once per key; write measured KPIs to Sheets
 * - audit each write, retry safely, never infer completion from a task checkmark
 * - Keep is optional capture inbox; no automatic ingestion until verified
 */
