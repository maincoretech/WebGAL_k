/**
 * Read text resources from the hexz archive.
 * Protocol (hexz://) handles no-cors media; this module handles
 * XHR/fetch-based text resources (json, txt, scss) via Tauri IPC.
 */

const HEXZ_PREFIX = 'hexz://localhost/';

/** Strip hexz:// prefix and read via IPC; returns decoded text. */
export async function hexzText(urlOrPath: string): Promise<string> {
  const path = urlOrPath.startsWith(HEXZ_PREFIX) ? urlOrPath.slice(HEXZ_PREFIX.length) : urlOrPath;
  // @ts-ignore
  const bytes: number[] = await window.__TAURI_INTERNALS__!.invoke('read_hexz_file', { path });
  return new TextDecoder().decode(new Uint8Array(bytes));
}

export async function hexzJson<T = any>(urlOrPath: string): Promise<T> {
  const text = await hexzText(urlOrPath);
  return JSON.parse(text);
}
