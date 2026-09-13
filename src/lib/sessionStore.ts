// Server-only, like src/lib/assets.ts — uses Node's fs/path, never import from
// a client component.
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

export type SessionData = Record<string, unknown>;
type SessionsFile = Record<string, SessionData>;

async function readAll(): Promise<SessionsFile> {
  try {
    const raw = await fs.readFile(SESSIONS_FILE, 'utf-8');
    return JSON.parse(raw) as SessionsFile;
  } catch {
    return {};
  }
}

async function writeAll(data: SessionsFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Serializes writes so two near-simultaneous saves (e.g. multiple tabs on the
// same IP) can't interleave and corrupt the file.
let writeQueue: Promise<void> = Promise.resolve();

export async function getSession(ip: string): Promise<SessionData | null> {
  const all = await readAll();
  return all[ip] ?? null;
}

export function saveSession(ip: string, data: SessionData): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    const all = await readAll();
    all[ip] = data;
    await writeAll(all);
  });
  return writeQueue;
}
