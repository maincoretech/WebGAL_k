/**
 * Read text resources from the hexz archive.
 * Protocol (hexz://) handles no-cors media; this module handles
 * XHR/fetch-based text resources (json, txt, scss) via Tauri IPC.
 */

import { invoke } from '@tauri-apps/api/core';

const HEXZ_PREFIX = 'hexz://localhost/';
const GAME_PREFIX = './game/';

/** Strip platform prefix and read via IPC; returns decoded text. */
export async function hexzText(urlOrPath: string): Promise<string> {
  let path = urlOrPath;
  if (path.startsWith(HEXZ_PREFIX)) path = path.slice(HEXZ_PREFIX.length);
  else if (path.startsWith(GAME_PREFIX)) path = path.slice(GAME_PREFIX.length);
  const bytes: number[] = await invoke('read_hexz_file', { path });
  return new TextDecoder().decode(new Uint8Array(bytes));
}

export async function hexzJson<T = any>(urlOrPath: string): Promise<T> {
  const text = await hexzText(urlOrPath);
  return JSON.parse(text);
}
