/** Lightweight replacements for lodash utilities. */

/** Deep clone using native structuredClone (works for all Redux-serializable state). */
export const cloneDeep = <T>(obj: T): T => structuredClone(obj);

/**
 * Creates an object composed of the own enumerable properties of `obj`
 * for which `predicate` returns false.
 */
export function omitBy<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: string) => boolean,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => !predicate(v as T[keyof T], k)),
  ) as Partial<T>;
}

/**
 * Creates an object composed of the own enumerable properties of `obj`
 * for which `predicate` returns true.
 */
export function pickBy<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: string) => boolean,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => predicate(v as T[keyof T], k)),
  ) as Partial<T>;
}

export interface ThrottledFn<T extends (...args: any[]) => void> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

/** Returns a throttled version of `fn` that fires at most once per `ms` milliseconds. */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  ms: number,
): ThrottledFn<T> {
  let lastTime = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = ms - (now - lastTime);
    if (remaining <= 0) {
      if (timeout) { clearTimeout(timeout); timeout = null; }
      lastTime = now;
      fn(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastTime = Date.now();
        timeout = null;
        fn(...args);
      }, remaining);
    }
  };
  throttled.cancel = () => {
    if (timeout) { clearTimeout(timeout); timeout = null; }
    lastTime = 0;
  };
  return throttled;
}

/** Deep equality comparison for plain objects/arrays/primitives. */
export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => isEqual(v, b[i]));
  }
  if (Array.isArray(a) || Array.isArray(b)) return false;
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) =>
    Object.hasOwn(b as object, k) && isEqual((a as any)[k], (b as any)[k]),
  );
}
