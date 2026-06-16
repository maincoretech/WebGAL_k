import { createRoot } from 'react-dom/client';
import type { ReactNode } from 'react';

type RootEntry = ReturnType<typeof createRoot>;
const roots = new Map<string, { root: RootEntry; el: Element }>();

function getOrCreateRoot(containerId: string) {
  const el = document.getElementById(containerId);
  if (!el) return null;
  const entry = roots.get(containerId);
  // Same element ref → reuse; different or missing → recreate
  if (entry?.el === el) return entry.root;
  if (entry) roots.delete(containerId); // stale, React recreated the DOM
  const root = createRoot(el);
  roots.set(containerId, { root, el });
  return root;
}

export function renderTo(containerId: string, node: ReactNode) {
  getOrCreateRoot(containerId)?.render(node);
}

export function clearContainer(containerId: string) {
  roots.get(containerId)?.root.render(null);
}
