import fs from 'fs';

export const STORAGE_FILE_NAME = 'flume.json';

function readStorage(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function writeStorage(filePath: string, storage: Record<string, string>): void {
  fs.writeFileSync(filePath, JSON.stringify(storage, null, 2));
}

export function safeGetItem(filePath: string, key: string): string | null {
  const storage = readStorage(filePath);
  return storage[key] ?? null;
}

export function safeSetItem(filePath: string, key: string, value: string): void {
  const storage = readStorage(filePath);
  storage[key] = value;
  writeStorage(filePath, storage);
}