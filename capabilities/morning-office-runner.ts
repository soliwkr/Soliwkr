import { buildMorningOffice, type OfficeInput, type OfficeOutput } from "./morning-office";

/** Ports are implemented by existing SOLIWKR adapters; no new daemon required. */
export interface MorningOfficeSources {
  readPaperclipState(): Promise<{ actions: OfficeInput["actions"]; blockers: string[] }>;
  readGoogleContext(date: string): Promise<{ evidence: OfficeInput["evidence"]; actions: OfficeInput["actions"] }>;
}
export interface MorningOfficeWrites {
  upsertCalendarAgenda(key: string, date: string, agenda: string): Promise<void>;
  upsertPersonalTasks(key: string, actions: OfficeOutput["personalTasks"]): Promise<void>;
  appendOfficeLogOnce(key: string, entry: string): Promise<void>;
}
/** No remote writes by default. Does not delegate agent tasks. */
export async function runMorningOffice(
  sources: MorningOfficeSources,
  input: Pick<OfficeInput, "date" | "timezone" | "objective" | "project">,
  options: { dryRun?: boolean; writes?: MorningOfficeWrites } = {},
): Promise<{ mode: "dry-run" | "write"; output: OfficeOutput }> {
  const [paperclip, google] = await Promise.all([
    sources.readPaperclipState(),
    sources.readGoogleContext(input.date),
  ]);
  const output = buildMorningOffice({
    ...input,
    evidence: google.evidence,
    actions: [...paperclip.actions, ...google.actions],
    blockers: paperclip.blockers,
  });
  if (options.dryRun !== false) return { mode: "dry-run", output };
  if (!options.writes) throw new Error("write adapter required");
  await options.writes.upsertCalendarAgenda(output.key, input.date, output.agenda);
  await options.writes.upsertPersonalTasks(output.key, output.personalTasks);
  await options.writes.appendOfficeLogOnce(output.key, output.logEntry);
  return { mode: "write", output };
}
